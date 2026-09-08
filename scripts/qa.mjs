// Automated QA for the course player (plan sprint 3, decision 25a).
//
// Drives the real learner flows in headless Chromium against BASE_URL — local
// `npm run preview` by default, or a deployed preview URL — and exits 1 on any
// failed assertion, console error, or failed non-media request. Every wait is
// on observable state (a class, a text, an attribute), never a bare sleep, so
// the run is deterministic rather than timing-lucky.

import puppeteer from 'puppeteer-core'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'

const BASE_URL = (process.env.BASE_URL ?? 'http://127.0.0.1:4173').replace(/\/+$/, '')
const SNAP_CHROMIUM = '/snap/bin/chromium'
const QA_DIR = 'qa'

// The snap path is the workstation default; PUPPETEER_EXECUTABLE_PATH is the
// escape hatch for any other machine (plan sprint 3 risks: chromium path drift).
function resolveChromium() {
  const override = process.env.PUPPETEER_EXECUTABLE_PATH
  if (override) return override
  if (existsSync(SNAP_CHROMIUM)) return SNAP_CHROMIUM
  throw new Error(
    `Chromium not found at ${SNAP_CHROMIUM}. Set PUPPETEER_EXECUTABLE_PATH to a Chromium binary.`,
  )
}

const url = (path) => `${BASE_URL}${path}`

// ---------- assertions ----------

const checks = []
const consoleErrors = []
const failedRequests = []

function check(name, pass, detail) {
  checks.push({ name, pass: Boolean(pass), ...(detail === undefined ? {} : { detail }) })
  console.log(`${pass ? 'ok  ' : 'FAIL'}  ${name}${detail === undefined ? '' : `  — ${JSON.stringify(detail)}`}`)
}

function checkEqual(name, actual, expected) {
  check(name, Object.is(actual, expected), { actual, expected })
}

// ---------- page helpers ----------

async function overflow(page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
}

async function textOf(page, selector) {
  return page.$eval(selector, (el) => el.textContent?.trim() ?? '').catch(() => null)
}

async function countOf(page, selector) {
  return page.$$eval(selector, (nodes) => nodes.length)
}

async function bodyIncludes(page, needle) {
  return page.evaluate((text) => document.body.innerText.includes(text), needle)
}

/** Waits for the SPA to render past its loading notice. */
async function gotoRoute(page, path, readySelector) {
  await page.goto(url(path), { waitUntil: 'networkidle0' })
  await page.waitForSelector(readySelector, { timeout: 15_000 })
}

async function readProgress(page) {
  return page.evaluate(() => {
    const raw = window.localStorage.getItem('gt-course-progress-v1')
    return raw === null ? null : JSON.parse(raw)
  })
}

/** Index of the fieldset's option button for a given option label (A–D). */
async function clickOption(page, questionIndex, optionIndex) {
  const handles = await page.$$('.question')
  const fieldset = handles[questionIndex]
  if (!fieldset) throw new Error(`no question at index ${questionIndex}`)
  const options = await fieldset.$$('.option')
  const option = options[optionIndex]
  if (!option) throw new Error(`no option ${optionIndex} on question ${questionIndex}`)
  await option.click()
}

async function submitDisabled(page) {
  return page.$eval('.quiz__actions button', (el) => el.disabled)
}

// ---------- run ----------

await fs.mkdir(QA_DIR, { recursive: true })

// The quiz assertions need to know which option is right, so the harness reads
// the same JSON the app fetches — which also proves the content route serves.
const lessonResponse = await fetch(url('/content/lesson-01.json'))
if (!lessonResponse.ok) {
  throw new Error(`lesson-01.json responded ${lessonResponse.status} from ${BASE_URL}`)
}
const lesson1 = await lessonResponse.json()
const correctIndex = lesson1.questions.map((question) =>
  question.options.findIndex((option) => option.isCorrect),
)
const wrongIndex = lesson1.questions.map((question) =>
  question.options.findIndex((option) => !option.isCorrect),
)

const browser = await puppeteer.launch({
  executablePath: resolveChromium(),
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
})

const report = {
  baseUrl: BASE_URL,
  checks,
  consoleErrors,
  failedRequests,
  screenshots: [],
}

try {
  const page = await browser.newPage()
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`))
  page.on('requestfailed', (request) => {
    const reason = request.failure()?.errorText ?? 'unknown'
    // A media element aborting its own range request on teardown is normal
    // browser behaviour, not a broken asset.
    if (reason === 'net::ERR_ABORTED' && request.resourceType() === 'media') return
    failedRequests.push(`${request.url()} :: ${reason}`)
  })

  // Screenshots frame the thing being asserted, so the milestone set (25a) is
  // readable rather than wherever the last click happened to leave the scroll.
  const shot = async (name, selector) => {
    if (selector) {
      await page.$eval(selector, (el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }))
      // Let the scroll paint before the capture — two frames, not a sleep.
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      )
    }
    const path = `${QA_DIR}/${name}.png`
    await page.screenshot({ path })
    report.screenshots.push(path)
  }

  await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 })

  // --- home, from a clean learner state ---
  await page.goto(url('/'), { waitUntil: 'networkidle0' })
  await page.evaluate(() => window.localStorage.clear())
  await gotoRoute(page, '/', '.hero')

  check('home renders a title', Boolean(await textOf(page, '.hero h1')), await textOf(page, '.hero h1'))
  check('home shows the disclaimer', (await countOf(page, '.disclaimer')) === 1)
  check('home shows the source card', (await countOf(page, '.source-card')) === 1)
  check('home links the source lecture', Boolean(await page.$('.source-card a[href^="https://x.com/"]')))
  checkEqual('home CTA is "Start the course"', await textOf(page, '.hero__cta .button--primary'), 'Start the course')
  check('home shows the unit map', (await countOf(page, '.unit-map, [aria-labelledby="unit-map-heading"]')) > 0)
  checkEqual('home has no horizontal overflow at 1440', await overflow(page), 0)
  await shot('desktop-home')

  // --- dark mode ---
  const lightBackground = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  await page.click('.theme-toggle')
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark', { timeout: 5000 })
  const darkBackground = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  check('dark-mode toggle repaints the page', darkBackground !== lightBackground, {
    light: lightBackground,
    dark: darkBackground,
  })
  checkEqual(
    'dark-mode toggle reports pressed state',
    await page.$eval('.theme-toggle', (el) => el.getAttribute('aria-pressed')),
    'true',
  )
  await shot('desktop-home-dark')
  await page.click('.theme-toggle')
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'light', { timeout: 5000 })
  checkEqual(
    'dark-mode toggle returns to light',
    await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
    lightBackground,
  )

  // --- lesson 1: the full quiz / forced-correction loop ---
  await Promise.all([
    page.waitForSelector('.quiz', { timeout: 15_000 }),
    page.click('.hero__cta .button--primary'),
  ])
  await page.waitForSelector('.question', { timeout: 15_000 })

  checkEqual('CTA lands on lesson 1', new URL(page.url()).pathname, '/lesson/1')
  check('lesson shows the disclaimer', (await countOf(page, '.disclaimer')) === 1)
  check('lesson shows the source card', (await countOf(page, '.source-card')) === 1)
  checkEqual('lesson renders five questions', await countOf(page, '.question'), 5)
  checkEqual('lesson starts at 0% progress', await textOf(page, '.progress__meta span:last-child'), '0% complete')
  check('submit is blocked with nothing answered', await submitDisabled(page))
  check(
    'blocked hint explains why',
    await bodyIncludes(page, 'Answer all five questions to check them.'),
  )

  // Two deliberate mistakes (questions 1 and 2), three right.
  for (let index = 0; index < 4; index += 1) {
    await clickOption(page, index, index < 2 ? wrongIndex[index] : correctIndex[index])
  }
  check('submit is still blocked with four of five answered', await submitDisabled(page))
  await clickOption(page, 4, correctIndex[4])
  await page.waitForFunction(
    () => !document.querySelector('.quiz__actions button').disabled,
    { timeout: 5000 },
  )
  check('submit unlocks once all five are answered', !(await submitDisabled(page)))
  await shot('lesson-quiz', '.quiz')

  await page.click('.quiz__actions button')
  await page.waitForSelector('.correction', { timeout: 5000 })

  checkEqual('two wrong answers stay open', await countOf(page, '.question--open'), 2)
  checkEqual('three correct answers resolve', await countOf(page, '.question--resolved'), 3)
  checkEqual('progress reflects the three resolved', await textOf(page, '.progress__meta span:last-child'), '60% complete')
  checkEqual('progress state reads "Correcting"', await textOf(page, '.progress__meta span:first-child'), 'Correcting')
  check(
    'correction banner demands the fixes',
    await bodyIncludes(page, 'Fix these before the lesson counts as complete'),
  )
  check('the summary is still locked', Boolean(await page.$('.summary--locked')))
  check('explanations are withheld until the lesson is complete', !(await page.$('.explanations')))
  check('re-submit is blocked until the open questions are re-answered', await submitDisabled(page))
  checkEqual('the two rejected options are struck out', await countOf(page, '.option--rejected'), 2)
  checkEqual(
    'rejected options cannot be chosen again',
    await page.$$eval('.option--rejected', (nodes) => nodes.every((node) => node.disabled)),
    true,
  )
  await shot('lesson-correction', '.question--open')

  for (let index = 0; index < 2; index += 1) {
    await clickOption(page, index, correctIndex[index])
  }
  await page.waitForFunction(
    () => !document.querySelector('.quiz__actions button').disabled,
    { timeout: 5000 },
  )
  await page.click('.quiz__actions button')
  await page.waitForSelector('.correction--complete', { timeout: 5000 })

  checkEqual('every question resolves after correction', await countOf(page, '.question--resolved'), 5)
  checkEqual('explanations render for all five', await countOf(page, '.explanations .explanation'), 5)
  check(
    'the first explanation carries its reasoning',
    Boolean(await textOf(page, '.explanations .explanation .explanation__why')),
  )
  check('the summary unlocks', !(await page.$('.summary--locked')) && Boolean(await textOf(page, '.summary__body')))
  checkEqual('progress reaches 100%', await textOf(page, '.progress__meta span:last-child'), '100% complete')
  checkEqual('progress state reads "Lesson complete"', await textOf(page, '.progress__meta span:first-child'), 'Lesson complete')
  check('the score line records the corrections', await bodyIncludes(page, '3 of 5 correct on the first try, 2 corrected.'))
  checkEqual('lesson 1 has no horizontal overflow at 1440', await overflow(page), 0)

  // --- transcript disclosure ---
  checkEqual(
    'transcript starts collapsed',
    await page.$eval('.transcript', (el) => el.open),
    false,
  )
  await page.click('.transcript summary')
  await page.waitForFunction(() => document.querySelector('.transcript').open, { timeout: 5000 })
  check('transcript opens with content', Boolean(await textOf(page, '.transcript .transcript__text')))
  await page.click('.transcript summary')
  await page.waitForFunction(() => !document.querySelector('.transcript').open, { timeout: 5000 })
  checkEqual(
    'transcript collapses again',
    await page.$eval('.transcript', (el) => el.open),
    false,
  )

  // --- progress survives a refresh ---
  const storedBeforeReload = await readProgress(page)
  await page.reload({ waitUntil: 'networkidle0' })
  await page.waitForSelector('.question', { timeout: 15_000 })
  const storedAfterReload = await readProgress(page)
  checkEqual('lesson 1 is stored complete', storedAfterReload?.lessons?.['1']?.state, 'complete')
  checkEqual('the stored score survives the refresh', storedAfterReload?.lessons?.['1']?.firstTryCorrect, 3)
  checkEqual('the correction count survives the refresh', storedAfterReload?.lessons?.['1']?.corrected, 2)
  check(
    'the refresh does not rewrite the record',
    storedBeforeReload?.lessons?.['1']?.completedAt === storedAfterReload?.lessons?.['1']?.completedAt,
  )

  await gotoRoute(page, '/', '.hero')
  check('home reports the completed lesson', await bodyIncludes(page, '1 of 40 lessons complete'))
  checkEqual('home CTA advances to lesson 2', await textOf(page, '.hero__cta .button--primary'), 'Continue — Lesson 2')

  // --- lesson 40: reachable, honest stub copy ---
  await gotoRoute(page, '/lesson/40', '.quiz')
  check('lesson 40 renders its title', Boolean(await textOf(page, '.lesson-head h1')))
  checkEqual('lesson 40 renders five questions', await countOf(page, '.question'), 5)
  check('lesson 40 shows the stub video label', await bodyIncludes(page, 'Video in production'))
  check(
    'lesson 40 stub copy is honest about what works',
    await bodyIncludes(page, 'The paper-craft film for this lesson is being made. The full lesson below works now.'),
  )
  check('lesson 40 shows the placeholder poster', Boolean(await page.$('.video-stage__poster[src*="placeholder-poster.svg"]')))
  check('lesson 40 shows the disclaimer', (await countOf(page, '.disclaimer')) === 1)
  check('lesson 40 shows the source card', (await countOf(page, '.source-card')) === 1)
  checkEqual('lesson 40 has no horizontal overflow at 1440', await overflow(page), 0)

  // --- celebration screen (unit 1 seeded complete, so the screen is real) ---
  await page.evaluate(() => {
    const lessons = {}
    for (let id = 1; id <= 7; id += 1) {
      lessons[String(id)] = {
        state: 'complete',
        firstTryCorrect: 4,
        corrected: 1,
        completedAt: '2026-09-09T00:00:00.000Z',
      }
    }
    window.localStorage.setItem(
      'gt-course-progress-v1',
      JSON.stringify({
        version: 1,
        lessons,
        lastVisitedLesson: 7,
        unitsCelebrated: [],
        courseCompletedAt: null,
      }),
    )
  })
  await gotoRoute(page, '/unit/1/complete', '.celebration')
  check('unit celebration announces the unit', await bodyIncludes(page, 'Unit 1 complete'))
  check('unit celebration reports the score', await bodyIncludes(page, '28/35 first try.'))
  check('unit celebration offers the next lesson', await bodyIncludes(page, 'Continue — Lesson 8'))
  checkEqual('celebration has no horizontal overflow at 1440', await overflow(page), 0)
  await shot('celebration-unit-1')

  // --- mobile sweep ---
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 })
  await gotoRoute(page, '/', '.hero')
  checkEqual('home has no horizontal overflow at 390', await overflow(page), 0)
  check(
    'the home CTA fits its mobile line',
    await page.$eval('.hero__cta .button--primary', (el) => {
      const rect = el.getBoundingClientRect()
      return el.scrollWidth <= el.clientWidth + 1 && rect.left >= 0 && rect.right <= window.innerWidth
    }),
  )
  check(
    'the masthead fits the mobile viewport',
    await page.$eval('.masthead', (el) => el.getBoundingClientRect().right <= window.innerWidth + 1),
  )
  await shot('mobile-home')

  await gotoRoute(page, '/lesson/1', '.quiz')
  checkEqual('lesson has no horizontal overflow at 390', await overflow(page), 0)
  check(
    'quiz options fit the mobile viewport',
    await page.$$eval('.option', (nodes) =>
      nodes.every((node) => node.getBoundingClientRect().right <= window.innerWidth + 1),
    ),
  )
  await shot('mobile-lesson', '.quiz')

  checkEqual('no console errors', consoleErrors.length, 0)
  checkEqual('no failed non-media requests', failedRequests.length, 0)
} finally {
  await browser.close()
}

const failures = checks.filter((entry) => !entry.pass)
report.passed = checks.length - failures.length
report.failed = failures.length
report.ok = failures.length === 0 && consoleErrors.length === 0 && failedRequests.length === 0

await fs.writeFile(`${QA_DIR}/report.json`, `${JSON.stringify(report, null, 2)}\n`)

console.log(`\n${report.passed}/${checks.length} checks passed — report: ${QA_DIR}/report.json`)
if (consoleErrors.length) console.log(`console errors:\n  ${consoleErrors.join('\n  ')}`)
if (failedRequests.length) console.log(`failed requests:\n  ${failedRequests.join('\n  ')}`)
if (!report.ok) {
  console.error(`QA FAILED — ${failures.map((entry) => entry.name).join('; ') || 'page errors'}`)
  process.exit(1)
}
console.log('QA green.')

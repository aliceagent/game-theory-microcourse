// Hash-bound media check (decision 24a, plan sprint 3).
//
// MEDIA_MAP.md is the manifest of record for everything under public/media and
// public/share. This script fails closed in three directions:
//
//   1. a file on disk that no row claims        → unlisted
//   2. a row whose file is gone                 → missing
//   3. a file whose sha256 differs from its row → drift
//
// Nothing here can "repair" the map; regenerating a row is a human edit, so a
// silently swapped asset can never reach a deployment.

import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

const MEDIA_MAP = 'MEDIA_MAP.md'
const TRACKED_DIRS = ['public/media', 'public/share']
const SHA256 = /^[0-9a-f]{64}$/

/** Files that are never media assets and are not expected in the map. */
const IGNORED = new Set(['.gitkeep', '.DS_Store'])

async function walk(dir) {
  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch (error) {
    // A tracked directory that does not exist yet simply holds no assets.
    if (error.code === 'ENOENT') return []
    throw error
  }

  const files = []
  for (const entry of entries) {
    const full = path.posix.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(full)))
    } else if (entry.isFile() && !IGNORED.has(entry.name)) {
      files.push(full)
    }
  }
  return files
}

async function hashFile(file) {
  return createHash('sha256').update(await fs.readFile(file)).digest('hex')
}

/**
 * Reads every pipe-table row whose first cell looks like a tracked media path.
 * Prose, rules and header rows are ignored, so the map stays human-readable.
 */
function parseRows(markdown) {
  const rows = []
  const problems = []

  markdown.split('\n').forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed.startsWith('|')) return

    const cells = trimmed.slice(1, trimmed.endsWith('|') ? -1 : undefined).split('|').map((cell) => cell.trim())
    const file = cells[0]?.replace(/^`|`$/g, '')
    if (!file || !TRACKED_DIRS.some((dir) => file.startsWith(`${dir}/`))) return

    const lineNumber = index + 1
    if (cells.length < 5) {
      problems.push(`${MEDIA_MAP}:${lineNumber} — row for ${file} needs file, source, purpose, state, sha256`)
      return
    }

    const [, source, purpose, state, rawHash] = cells
    const hash = rawHash.replace(/^`|`$/g, '').toLowerCase()
    if (!SHA256.test(hash)) {
      problems.push(`${MEDIA_MAP}:${lineNumber} — ${file} has no valid sha256 (got "${rawHash}")`)
      return
    }
    if (!source || !purpose || !state) {
      problems.push(`${MEDIA_MAP}:${lineNumber} — ${file} is missing source authority, teaching purpose or approval state`)
      return
    }

    rows.push({ file, source, purpose, state, hash, line: lineNumber })
  })

  return { rows, problems }
}

const markdown = await fs.readFile(MEDIA_MAP, 'utf8')
const { rows, problems } = parseRows(markdown)
const failures = [...problems]

const byFile = new Map()
for (const row of rows) {
  if (byFile.has(row.file)) {
    failures.push(`${MEDIA_MAP}:${row.line} — ${row.file} is listed twice`)
    continue
  }
  byFile.set(row.file, row)
}

const onDisk = (await Promise.all(TRACKED_DIRS.map(walk))).flat().sort()

for (const file of onDisk) {
  const row = byFile.get(file)
  if (!row) {
    failures.push(`unlisted: ${file} exists but has no row in ${MEDIA_MAP}`)
    continue
  }
  const actual = await hashFile(file)
  if (actual !== row.hash) {
    failures.push(`drift: ${file} is ${actual}, ${MEDIA_MAP}:${row.line} says ${row.hash}`)
  }
}

for (const [file, row] of byFile) {
  if (!onDisk.includes(file)) {
    failures.push(`missing: ${MEDIA_MAP}:${row.line} lists ${file}, which is not on disk`)
  }
}

console.log(`${MEDIA_MAP}: ${byFile.size} listed asset(s); on disk: ${onDisk.length} file(s)`)
for (const file of onDisk) console.log(`  ${byFile.has(file) ? 'ok  ' : 'FAIL'}  ${file}`)

if (failures.length) {
  console.error(`\nmedia check FAILED (${failures.length}):`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log('media check green — every shipped asset is listed and hash-matched.')

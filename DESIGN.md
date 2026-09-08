---
name: game-theory-microcourse
description: A paper-craft course player for a 40-lesson microcourse on game theory, success and social mobility.
colors:
  primary: "#24333B"
  secondary: "#6B9C94"
  secondary-deep: "#436E67"
  accent: "#E38B73"
  highlight: "#D4B25F"
  surface-variant: "#A7C9D9"
  background: "#F6F1E8"
  surface: "#FFFDFC"
  text-primary: "#24333B"
  text-secondary: "#556169"
  border: "#D8CEBE"
  success: "#3E6D62"
  error: "#A8442F"
  dark-background: "#161F24"
  dark-surface: "#1E2A31"
  dark-text: "#F0EAE0"
typography:
  heading:
    fontFamily: "Poppins, Sora, Ubuntu Sans, system-ui, sans-serif"
    fontSize: "3.25rem"
    fontWeight: 650
    lineHeight: 1.08
  body:
    fontFamily: "Inter, Ubuntu Sans, system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.65
  mono:
    fontFamily: "IBM Plex Mono, Ubuntu Mono, ui-monospace, monospace"
    fontSize: "0.8rem"
    lineHeight: 1.5
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "32px"
  xl: "64px"
rounded:
  card: "18px"
  control: "10px"
  pill: "999px"
components:
  button-primary:
    backgroundColor: "{colors.secondary-deep}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.card}"
    padding: "{spacing.lg}"
  card-meta:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.mono}"
    rounded: "{rounded.control}"
    padding: "{spacing.sm}"
  option-button:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.control}"
    padding: "14px 18px"
  option-selected:
    backgroundColor: "{colors.surface-variant}"
    textColor: "{colors.primary}"
    rounded: "{rounded.control}"
    padding: "14px 18px"
  verdict-correct:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.success}"
    rounded: "{rounded.control}"
    padding: "{spacing.sm}"
  verdict-incorrect:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.error}"
    rounded: "{rounded.control}"
    padding: "{spacing.sm}"
  badge-progress:
    backgroundColor: "{colors.highlight}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  badge-correction:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  progress-fill:
    backgroundColor: "{colors.secondary}"
    rounded: "{rounded.pill}"
    height: "8px"
  divider:
    backgroundColor: "{colors.border}"
    height: "1px"
  media-frame:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.card}"
    padding: "{spacing.sm}"
  page-dark:
    backgroundColor: "{colors.dark-background}"
    textColor: "{colors.dark-text}"
    padding: "{spacing.lg}"
  card-dark:
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.dark-text}"
    rounded: "{rounded.card}"
    padding: "{spacing.lg}"
---

# Overview

The product should feel like a paper diorama that became interactive: layered cut-paper shapes, soft depth, visible warmth, and a calm classroom tone. It is a course player, not a marketing site. Every screen serves one job — watch, answer, correct, understand, continue.

# Colors

Warm cream paper carries deep slate ink. Muted teal is the action color, deepened for filled buttons so label text stays legible. Soft coral marks correction and attention, golden mustard marks progress, and sky blue is the supporting surface for selected and informational states. Green is reserved for confirmed-correct answers and a deep brick red for answers that still need fixing. Dark mode keeps the same hierarchy on cool slate surfaces with cream text.

# Typography

Headings use a geometric humanist sans (Poppins, then Sora) with generous tracking room. Body copy uses Inter for long-form summaries and transcript excerpts. Mono is reserved for timecodes and lesson metadata. Generous spacing replaces decoration.

# Layout

Lesson pages use a single-column reading measure capped near 68 characters for summaries and transcripts. The home page pairs an asymmetric hero with a unit map grid. All spacing uses logical properties, so a right-to-left pass needs no layout rewrite. Mobile collapses to one column with full-width controls.

# Elevation

Only the media stage, cards, and interactive controls receive shadows, and those shadows stay soft and warm, like paper lifted a few millimetres off a table. Text sections rely on spacing and hairlines instead.

# Shapes

Cards are softly rounded at 18px. Controls use 10px, and primary calls to action use full-pill geometry. No mixed decorative radius system.

# Components

Quiz options are large tap targets with a visible letter chip. A submitted answer shows its verdict inline; an incorrect answer re-opens for correction with the previous wrong choice marked and disabled. The transcript excerpt is a collapsed disclosure by default. The video stage reserves its aspect ratio before any media loads and never autoplays with audio.

# Motion

Motion is slow, paper-like, and short: fades, small translations, and gentle disclosure. Nothing bounces or spins. Every transition is disabled under prefers-reduced-motion.

# Do's and Don'ts

- Do present the lecturer's claims as his argument rather than as verified fact.
- Do credit the source lecture on the home page and on every lesson page.
- Do require every wrong answer to be corrected before a lesson counts as complete.
- Do keep every user-visible string in one strings module.
- Don't autoplay video with audio.
- Don't use generic AI gradients, fake dashboards, or decorative statistics.
- Don't use physical CSS directions; use logical properties everywhere.
- Don't re-host the source lecture video.

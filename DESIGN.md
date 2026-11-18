---
version: alpha
name: helpdesk
description: A calm, monochrome operator console for answering customer email, with a quiet public help surface. White canvas, near-black actions, hairline dividers, and color reserved for conversation state. Based on the Cal.com design analysis from getdesign.md (MIT), with its marketing-page parts removed and application components added.

colors:
  primary: "#111111"
  primary-active: "#242424"
  primary-disabled: "#e5e7eb"
  ink: "#111111"
  body: "#374151"
  muted: "#69707e"
  hairline: "#e5e7eb"
  canvas: "#ffffff"
  surface-soft: "#f8f9fa"
  surface-card: "#f5f5f5"
  surface-strong: "#e5e7eb"
  on-primary: "#ffffff"
  link: "#2563eb"
  focus-ring: "#3b82f6"
  selected: "#eff6ff"
  success: "#047857"
  success-soft: "#ecfdf5"
  warning: "#b45309"
  warning-soft: "#fffbeb"
  error: "#b91c1c"
  error-soft: "#fef2f2"
  note: "#92400e"
  note-soft: "#fef9c3"

typography:
  title-lg:
    fontFamily: "Inter, 'Hiragino Sans', 'Noto Sans JP', system-ui, sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.4
  title-md:
    fontFamily: "Inter, 'Hiragino Sans', 'Noto Sans JP', system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.4
  title-sm:
    fontFamily: "Inter, 'Hiragino Sans', 'Noto Sans JP', system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
  reading:
    fontFamily: "Inter, 'Hiragino Sans', 'Noto Sans JP', system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.75
  body:
    fontFamily: "Inter, 'Hiragino Sans', 'Noto Sans JP', system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
  body-strong:
    fontFamily: "Inter, 'Hiragino Sans', 'Noto Sans JP', system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.6
  caption:
    fontFamily: "Inter, 'Hiragino Sans', 'Noto Sans JP', system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4
  code:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  button:
    fontFamily: "Inter, 'Hiragino Sans', 'Noto Sans JP', system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  pill: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px

layout:
  inbox-width: 960px
  thread-width: 760px
  context-width: 280px
  touch-target: 44px
  icon-size: 16px
  focus-width: 2px
  hairline-width: 1px
  raised-shadow: "0 4px 12px rgba(0,0,0,0.08)"
  backdrop: "rgba(0,0,0,0.24)"
  fade: 150ms
  confirmation-duration: 5s

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 0 16px
    height: 36px
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
  button-primary-disabled:
    backgroundColor: "{colors.primary-disabled}"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 0 16px
    height: 36px
  button-quiet:
    backgroundColor: transparent
    textColor: "{colors.body}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 0 12px
    height: 36px
  button-danger:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.error}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 0 16px
    height: 36px
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 0 12px
    height: 36px
  text-input-invalid:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  settings-card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: 16px
  dialog:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: 24px
  loading-placeholder:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.xs}"
    height: 12px
  app-sidebar:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.body}"
    typography: "{typography.body}"
    width: 240px
    padding: 12px
  sidebar-item:
    backgroundColor: transparent
    textColor: "{colors.body}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 0 12px
    height: 32px
  sidebar-item-active:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.md}"
  filter-tab:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 0 12px
    height: 32px
  filter-tab-active:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.md}"
  conversation-row:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.body}"
    typography: "{typography.body}"
    padding: 12px 16px
    height: 64px
  conversation-row-selected:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.ink}"
  status-open:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 2px 10px
  status-pending:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.body}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 2px 10px
  status-closed:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 2px 10px
  status-spam:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 2px 10px
  label-chip:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.body}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 2px 8px
  avatar:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    size: 24px
  message-inbound:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.reading}"
    rounded: "{rounded.lg}"
    padding: 16px 20px
  message-outbound:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.reading}"
    rounded: "{rounded.lg}"
    padding: 16px 20px
  message-note:
    backgroundColor: "{colors.note-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.reading}"
    rounded: "{rounded.lg}"
    padding: 16px 20px
  delivery-failed:
    backgroundColor: "{colors.error-soft}"
    textColor: "{colors.error}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 2px 8px
  delivery-awaiting-approval:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 2px 8px
  composer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.reading}"
    rounded: "{rounded.lg}"
    padding: 12px 16px
  banner-error:
    backgroundColor: "{colors.error-soft}"
    textColor: "{colors.error}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  banner-success:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  empty-state:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.body}"
    padding: 48px 24px
  help-article:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.reading}"
    width: 680px
  chat-widget:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    width: 360px
    padding: 16px
---

## Overview

helpdesk has two surfaces. The **operator console** is where a solo developer answers customer email between other work. The **public surface** is what customers see: help pages, a feedback form, and a small help chat.

The console must answer one question at a glance: *what needs me now?* Everything else stays quiet. The system is monochrome so that the few colored things — a conversation waiting on the operator, a failed send, a reply waiting for approval — are impossible to miss.

The public surface must feel sincere and plain. It reads like a well-set document, not a marketing page. Automated replies never dress up as a person.

The UI text is mostly Japanese. Every type decision below is made for mixed Japanese and Latin text.

## Colors

- **Action layer is monochrome.** `{colors.primary}` is used for the one primary action of a view (send, save) and for the `open` state. There is at most one primary button per view.
- **Color means state, never decoration.** `{colors.error}` = something failed and needs the operator. `{colors.warning}` = waiting for a human decision (approval, quarantine). `{colors.success}` = a confirmation that just happened. `{colors.note}` = internal, never sent to the customer.
- **Semantic colors come in pairs.** Text in `{colors.error}` sits on `{colors.error-soft}`, and so on. Never put semantic text on `{colors.surface-card}`. All pairs meet WCAG AA for 13px text.
- **Blue is for focus, links, and selection only.** `{colors.focus-ring}` outlines the focused element, `{colors.link}` marks links inside message bodies and articles, `{colors.selected}` fills the selected row.
- **State is never carried by color alone.** Every status has a text label; unread rows also use weight.

## Typography

- One family for everything. Inter for Latin, the platform's Japanese face for kana and kanji. No display face, no web font download for Japanese.
- No negative letter-spacing and no italics. Both damage Japanese text.
- Two body sizes with different jobs: `{typography.body}` (14px / 1.6) for console chrome, lists, forms; `{typography.reading}` (16px / 1.75) for anything a person reads as prose — message bodies, the composer, help articles.
- Weight carries hierarchy: 600 for titles, unread subjects, and the active item; 400 otherwise. No 700.
- Reading measure is capped at 680px for message bodies and articles.
- Conversation numbers (`#123`), email addresses, and message headers use `{typography.code}`.
- Timestamps are relative within 7 days ("3時間前") with the absolute time in a `title` attribute; absolute after that.

## Layout

- Base unit 4px. Use only the spacing scale.
- Console frame: `app-sidebar` (240px, fixed) + main column. The main column is a list (max 960px) or a conversation (thread max 760px, plus an optional 280px context panel on the right at ≥1200px).
- Lists are rows separated by hairlines, not cards. Cards are for grouped settings and for messages in a thread.
- Vertical rhythm inside a view: `{spacing.lg}` between sections, `{spacing.sm}` between related controls, `{spacing.xs}` between a label and its field.
- Page header: `title-lg` on the left, the view's actions on the right, `{spacing.lg}` below.
- Density is comfortable, not compact: 64px two-line rows, 36px controls, 32px navigation items.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No border, no shadow | Page background, sidebar |
| Hairline | 1px `{colors.hairline}` | Row dividers, inputs, cards, messages, the composer |
| Raised | `0 4px 12px rgba(0,0,0,0.08)` + hairline | Menus, popovers, dialogs, the chat widget |

Nothing else casts a shadow. No gradients, no glass, no dark surfaces.

## Shapes

- `{rounded.md}` (8px): buttons, inputs, tabs, sidebar items, banners.
- `{rounded.lg}` (12px): messages, the composer, cards, dialogs, the chat widget.
- `{rounded.xs}` (4px): label chips and delivery badges.
- `{rounded.pill}`: status badges and avatars only.
- Icons are 16px, 1.5px stroke, `currentColor`. An icon-only button always has an accessible name and a tooltip.

## Components

### Navigation

**`app-sidebar`** — Product switcher at the top, then views (未対応 / 返信待ち / 自分の担当 / 完了 / 迷惑メール), then enabled extensions, then settings at the bottom. Each view shows its count in `caption` `{colors.muted}`; only 未対応 shows its count in `{colors.ink}` 600. A disabled extension has no entry.

**`sidebar-item`** / **`sidebar-item-active`** — 32px rows. Active uses a fill and 600 weight, not a colored bar.

**`filter-tab`** / **`filter-tab-active`** — Secondary filters above a list (product, assignee, label).

### Conversation list

**`conversation-row`** — Two lines, 64px, hairline below.

- Line 1: sender name (`body-strong` if unread, else `body`), then subject truncated with an ellipsis, then right-aligned time in `caption` `{colors.muted}`.
- Line 2: `#123` in `code` `{colors.muted}`, a one-line body preview in `{colors.muted}`, then right-aligned: label chips (max 2, then "+n"), status badge, assignee avatar.
- The two-line content is one link; selection and quick-action buttons are adjacent controls. Hover fills `{colors.surface-soft}`. Selected uses `conversation-row-selected`.
- A row with a failed send shows `delivery-failed` in place of the preview's trailing space. This is the one place a red element may appear in the list.

**Status badges** — `status-open` is the only filled dark badge: it marks the operator's turn. `status-pending` is gray, `status-closed` is plain muted text, `status-spam` uses the warning pair. Labels: 未対応 / 返信待ち / 完了 / 迷惑メール.

**`label-chip`** — Gray, squared, never colored. Labels classify; they do not signal urgency.

**`avatar`** — 24px circle with a cropped account image or one initial. Unassigned shows a dashed 1px hairline circle, not a blank space.

### Conversation view

Header: subject in `title-lg`, `#123` in `code`, product name, then status badge and assignee control. Actions on the right: 完了にする (secondary), and a menu for 迷惑メール and other operations. Extension panels render in the right context panel, one card per extension.

**`message-inbound`** — White with a hairline. Header row: sender name `body-strong`, address in `code` `{colors.muted}`, time right-aligned. HTML mail renders inside the sandboxed frame with the same 16px / 1.75 reading style; a quiet line above offers 外部の画像を表示.

**`message-outbound`** — `{colors.surface-soft}` fill with a hairline, so the operator's side is distinguishable without alignment tricks. The header shows the author and, in `caption`, the delivery state: 下書き / 承認待ち / 送信待ち / 送信済み / 送信失敗. `delivery-awaiting-approval` and `delivery-failed` are the only colored ones; a failed message also shows the reason and a 再送 button (secondary).

**`message-note`** — `{colors.note-soft}` fill, with a leading label 内部メモ（相手には送られません） in `caption` `{colors.note}`. The fill and the label together make it unmistakable.

Attachments are a list of file name, size, and a download link under the message — never inline previews.

Agent- or extension-authored messages show the actor and whom it acted for ("エージェント（kobaken の代理）") in the header.

### Composer

**`composer`** — Hairline box at the bottom of the thread; the border becomes `{colors.ink}` on focus. Above the text area, a two-option switch: 返信 / 内部メモ. Switching to 内部メモ changes the box fill to `{colors.note-soft}` and the button label to メモを残す.

Below the text area, left: a single line "差出人: contact@slide.community → 宛先: user@example.com" in `caption` `{colors.muted}`. Right: the primary button 送信. While sending, the button is disabled and reads 送信中…. The draft survives a failed submit.

### Forms and settings

- Labels sit above fields in `body-strong`. Help text below in `caption` `{colors.muted}`.
- **`text-input-invalid`** — 1px `{colors.error}` border, and the message below the field in `caption` `{colors.error}`, stating what is wrong and how to fix it.
- Settings are grouped in hairline cards with a `title-sm` heading. Destructive actions (`button-danger`) live in their own card at the bottom and ask for confirmation in a dialog that names what will be deleted.

### Feedback

- **`banner-error`** / **`banner-success`** — Inline at the top of the main column. Errors stay until resolved; successes fade after a few seconds. No toast stacks.
- **`empty-state`** — One sentence saying what the state means and, if there is one, the next action. 未対応 with nothing in it reads 未対応の問い合わせはありません。 No illustrations.
- Loading uses the existing layout with `{colors.surface-card}` placeholder bars, not a spinner on a blank page.

### Public surface

**`help-article`** — 680px column, `title-lg` heading, `reading` body, `{colors.link}` links. Header shows the product name only. Footer has one line: 解決しませんでしたか？ and a link to contact.

**`chat-widget`** — 360px, raised. One text area and one button. The result includes the original question. An article list offers a handoff to the contact form. A submitted inquiry shows the confirmation 問い合わせを受け付けました（#123）. It never shows generated prose, a typing indicator, or a human name or avatar.

**Feedback form** — One text area, an optional email field, one button. The confirmation states plainly that the feedback inbox does not send replies.

## Do's and Don'ts

### Do
- Keep exactly one primary button per view.
- Let `status-open` be the darkest thing in a list.
- Give every state a text label.
- Use `reading` type wherever a person reads prose.
- Show who did what: operator, agent on whose behalf, extension, or system.
- Make internal notes visibly different from replies in both the thread and the composer.
- Reference tokens; never inline a hex value.

### Don't
- Don't add a second accent color, gradients, dark sections, or illustrations.
- Don't color labels, avatars, or navigation.
- Don't use red for anything except failure and destructive confirmation.
- Don't use cards for list rows, or shadows for anything that isn't floating.
- Don't use negative letter-spacing, italics, or weights above 600.
- Don't present automated output with a person's name or face.
- Don't hide an action behind hover only; it must be reachable by keyboard and touch.

## Responsive Behavior

| Width | Behavior |
|---|---|
| ≥1200px | Sidebar + thread + context panel |
| 768–1199px | Sidebar + thread; context panel follows the conversation as a labelled region |
| <768px | Sidebar becomes a drawer; rows keep two lines; composer sticks to the bottom |

Touch targets are at least 44px on <768px. Every interactive element has a visible `{colors.focus-ring}` 2px outline with 2px offset on keyboard focus. The console is fully operable by keyboard.

## Iteration Guide

1. Change one screen at a time, and capture a screenshot before and after.
2. Add a component here before using it in code. Variants (`-active`, `-invalid`, `-selected`) are separate entries.
3. If a screen needs a color, shape, or size that is not a token, the screen is wrong — or this file needs a deliberate change in the same commit.
4. Tokens live in one CSS file as custom properties named after the keys in this file.

## Known Gaps

- Dark mode is not defined.
- Motion is not defined beyond "fades are 150ms; nothing moves position".
- The metrics screen's charts are not specified; use `{colors.ink}` for the main series and `{colors.muted}` for comparison until they are.
- Colors and scales were adapted from an analysis of a public marketing site, not from an official design system.

## Daily operator workflows

- Use five text roles across the application. Page titles use title-lg (22px), section titles title-sm (16px), controls body (14px), prose reading (16px), and supporting text caption (13px). A single screen uses at most four distinct sizes. Code and buttons use the matching caption and body sizes.
- A list row shares two lines between the subject and the latest relevant excerpt. Put a labelled message-kind icon before the excerpt. Show the product in a multi-product list, elapsed customer waiting time on open inquiries, attachment and message-count indicators when applicable, and one assignee avatar. Emphasize waits over 24 hours with weight. Preserve full text in the title of a truncated item.
- Place checkboxes and quick actions beside the row link. Pointer hover and keyboard focus reveal the actions. The selection toolbar states the selected count and offers assignment, labels, closure and spam handling. Sorting and pagination preserve the URL.
- A human avatar is a cropped square image inside a 24px circle or one grapheme from the display name. Show separate labelled agent and extension glyphs. The account entry at the foot of navigation identifies the signed-in operator.
- Use an anchored popover for a short choice in context. Its trigger shows expanded state. Escape and an outside click dismiss it. Use the action menu for secondary commands. Put related controls one spacing-sm apart and allow them to wrap on narrow screens.
- Use a native modal dialog for an irreversible action or an outbound submission. Name the recipient, object or quantity, focus the first safe action, and restore focus on dismissal. Never nest dialogs. Use an inline result with an undo action for reversible triage.
- Keep context in a labelled side panel alongside the timeline. On small screens provide the same content in reading order. Keep assignment, status and labels with the conversation heading, and insert dated changes next to the messages they affected.
- List shortcuts are j, k, Enter, e and a. In a conversation use r for reply, n for note, Cmd/Ctrl+Enter to submit, and u for the inbox. The ? dialog lists the shortcuts. Ignore character shortcuts while editing and during IME composition.

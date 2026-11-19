---
version: alpha
name: helpdesk
description: A calm, monochrome operator console for answering customer email, with a quiet public help surface. White canvas, near-black actions, hairline dividers, and separate colors for state and identity. Based on the Cal.com design analysis from getdesign.md (MIT), with its marketing-page parts removed and application components added.

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

identity:
  0: "#202764"
  1: "#0f535f"
  2: "#5a0287"
  3: "#a6026f"
  4: "#925800"
  5: "#667f32"
  6: "#321d00"
  7: "#141414"

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
    fontFamily: "'JetBrains Mono', Menlo, Consolas, 'Liberation Mono', monospace"
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
  switch:
    padding: 2px
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

The console must answer one question at a glance: *what needs me now?* Everything else stays quiet. Status text and a pale fill identify events that need attention. Small identity marks distinguish people, products and labels.

The public surface must feel sincere and plain. It reads like a well-set document, not a marketing page. Automated replies never dress up as a person.

The UI text is mostly Japanese. Every type decision below is made for mixed Japanese and Latin text.

## Colors

- **Action layer is monochrome.** `{colors.primary}` is used for the one primary action of a view (send, save) and for the `open` state. Use one primary action per independent task. A draft approval and a modal confirmation each have their own action group.
- **Status colors pair text with a pale background.** `{colors.error}` = something failed and needs the operator. `{colors.warning}` = waiting for a human decision (approval, quarantine). `{colors.success}` = a confirmation that just happened. `{colors.note}` = internal, never sent to the customer.
- **Semantic colors come in pairs.** Text in `{colors.error}` sits on `{colors.error-soft}`, and so on. Never put semantic text on `{colors.surface-card}`. All pairs meet WCAG AA for 13px text.
- **Interaction colors indicate focus, links and selection.** `{colors.focus-ring}` outlines the focused element, `{colors.link}` marks links inside message bodies and articles, `{colors.selected}` fills the selected row.
- **Identity uses the eight swatches in the identity scale.** A product takes its color from its name, a person from their email address, and a label from its saved choice. Use these colors inside icons and small dots. Keep neighboring text, surfaces, borders and buttons on their existing tokens.
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

- Line 1 starts with the product mark and name, followed by the sender's full display name and さん, then the subject. Use `body-strong` for unread senders and `body` for read senders. Preserve both names when space is tight. Ellipsize the subject and excerpt. Set the right-aligned time in `caption` `{colors.muted}`.
- Line 2: `#123` in `code` `{colors.muted}`, a one-line body preview in `{colors.muted}`, then label chips (max 2, then "+n") and indicators; the assignee avatar is right-aligned. Show the status only in mixed-status views.
- The two-line content is one link; selection and quick-action buttons are adjacent controls. Hover fills `{colors.surface-soft}`. Selected uses `conversation-row-selected`.
- A row with a failed send shows `delivery-failed` in place of the preview's trailing space. This is the one place a red element may appear in the list.

**Status badges** — `status-open` is the only filled dark badge: it marks the operator's turn. `status-pending` is gray, `status-closed` is plain muted text, `status-spam` uses the warning pair. Labels: 未対応 / 返信待ち / 完了 / 迷惑メール.

**`label-chip`** — Gray chip with a colored dot and the label name.

**`avatar`** — 24px circle with a cropped account image or one initial. Unassigned shows a dashed 1px hairline circle, not a blank space.

### Conversation view

The sticky toolbar above the subject contains the return link, context, closure, other actions and previous/next controls. Below it, show the subject in `title-lg`, then the number in `code`, product, channel, status, assignee and labels. Extension panels render in the right context panel, one card per extension.

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

- **Operation feedback** — Show one bottom-center toast. Keep errors until dismissed and keep undo available throughout its window.
- **`empty-state`** — One sentence saying what the state means and, if there is one, the next action. 未対応 with nothing in it reads 未対応の問い合わせはありません。 Use one outline symbol for the missing content or a magnifier for an empty search.
- Loading uses the existing layout with `{colors.surface-card}` placeholder bars, not a spinner on a blank page.

### Public surface

**`help-article`** — 680px column, `title-lg` heading, `reading` body, `{colors.link}` links. The header pairs the product name with its 28px mark. Footer has one line: 解決しませんでしたか？ and a link to contact.

**`chat-widget`** — 360px, raised. One text area and one button. The result includes the original question. An article list offers a handoff to the contact form. A submitted inquiry shows the confirmation 問い合わせを受け付けました（#123）. It never shows generated prose, a typing indicator, or a human name or avatar.

**Feedback form** — One text area, an optional email field, one button. The confirmation states plainly that the feedback inbox does not send replies.

## Do's and Don'ts

### Do
- Use one primary button in each independent action group.
- Let `status-open` be the darkest thing in a list.
- Give every state a text label.
- Use `reading` type wherever a person reads prose.
- Show who did what: operator, agent on whose behalf, extension, or system.
- Make internal notes visibly different from replies in both the thread and the composer.
- Reference tokens; never inline a hex value.

### Don't
- Reserve filled areas for actions, state feedback and identity marks.
- Keep label chips and navigation surfaces neutral. Apply identity colors inside the small dot or avatar.
- Don't use red for anything except failure and destructive confirmation.
- Don't use cards for list rows, or shadows for anything that isn't floating.
- Don't use negative letter-spacing, italics, or weights above 600.
- Don't present automated output with a person's name or face.
- Don't hide an action behind hover only; it must be reachable by keyboard and touch.

## Product and person marks

Use rounded squares for products and circles for people. Product marks measure 16px in lists, 20px in headings and 28px on public pages. An uploaded image or a single emoji can replace the product initial. The public favicon uses the same mark. An initial represents one grapheme, including combining sequences. Show a name beside each mark or give it a tooltip and an accessible name.

The palette runs from 0 to 7 in the order shown in the identity scale above: 青, 水色, 紫, 桃, 橙, 黄緑, 茶, 灰. Keep identity colors inside product and person marks or label dots. The sender's address determines their initial color across surfaces. An operator can choose a label's color in settings. Gray label backgrounds and status color pairs retain their separate roles.

### Symbol vocabulary

Use a 16px outline with a 1.5px stroke in the surrounding text color. Reuse the same shape for the same concept. A neighboring text label names decorative symbols. Give a standalone symbol both a tooltip and an accessible name. Use up to five icons per line and show secondary details in the open conversation.

| Meaning | Shape |
| --- | --- |
| Open / awaiting reply / completed / spam | Inbox tray / clock / check / shield |
| Feedback received / reviewed | Tray with incoming flap / double check |
| Mail / form / chat | Envelope / lined form / speech bubble |
| Draft / awaiting approval / queued / sent / failed | Pencil / hourglass / queue and arrow / paper plane / warning triangle |
| Customer or operator / agent / extension / system | Circular avatar / robot / puzzle piece / monitor |
| Image / PDF / spreadsheet / archive / other file | Picture / folded page with curve / table / archive box / folded page |
| Open issue / repaired issue / notification due | Circle with dot / circle with check / bell |
| Unread / customer waiting over 24 or 72 hours | Leading dot / single or double exclamation |
| Articles / canned replies / presence / snooze | Book / speech card with lines / two people / clock with sleep mark |
| Auto acknowledgement / feedback / survey / export | Envelope with arrow / speech bubble / columns / download arrow |
| Notification / spam / rules / merge | Bell / shield / branching lines / converging lines |
| Issues / metrics / form / chat | Circled issue / chart / form / chat bubble |
| Empty search / empty list | Magnifier / outline symbol for the list's content |

In the inbox, place selection, the unread indicator and the sender avatar before the row link’s text. The link identifies the product first, then the sender and subject. Keep the product name visible at all three widths. The second line groups number, channel, message excerpt, indicators and labels. Time and assignee stay on the right. The browser tab starts with the number of open inquiries in the active scope. Metrics show the last seven equal-length reporting periods as a monochrome line. Leave a gap when a rate has no denominator. Voice counts use up to seven date intervals within the selected period, aligned to Japan Standard Time. Relative bars behind voice totals share a scale within each group, with its highest count at full width.

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
- Colors and scales were adapted from an analysis of a public marketing site, not from an official design system.

## Daily operator workflows

- Use five text roles across the application. Page titles use title-lg (22px), section titles title-sm (16px), controls body (14px), prose reading (16px), and supporting text caption (13px). A single screen uses at most four distinct sizes. Code and buttons use the matching caption and body sizes.
- A list row shares two lines between the subject and the latest relevant excerpt. Put a labelled message-kind icon before the excerpt. Show the product in a multi-product list, elapsed customer waiting time on open inquiries, attachment and message-count indicators when applicable, and one assignee avatar. Emphasize waits over 24 hours with weight. Preserve full text in the title of a truncated item.
- Place checkboxes and quick actions beside the row link. Pointer hover and keyboard focus reveal the actions. The selection toolbar states the selected count and offers assignment, labels, closure and spam handling. Sorting and pagination preserve the URL.
- A human avatar is a cropped square image inside a 24px circle or one grapheme from the display name. Show separate labelled agent and extension glyphs. The account entry at the foot of navigation identifies the signed-in operator.
- Use an anchored popover for a short choice in context. Its trigger shows expanded state. Escape and an outside click dismiss it. Use the action menu for secondary commands. Put related controls one spacing-sm apart and allow them to wrap on narrow screens.
- Use a native modal dialog for an irreversible action or an outbound submission. Name the recipient, object or quantity, focus the first safe action, and restore focus on dismissal. Never nest dialogs. Offer undo in the result toast for reversible triage.
- Keep context in a labelled side panel alongside the timeline. The toolbar opens this panel on smaller screens and focuses it on larger screens. Keep assignment, status and labels with the conversation heading, and insert dated changes next to the messages they affected.
- List shortcuts are j, k, Enter, e and a. In a conversation use r for reply, n for note, Cmd/Ctrl+Enter to submit, and u for the inbox. The ? dialog lists the shortcuts. Ignore character shortcuts while editing and during IME composition.

## Page composition

Every operator and public screen uses a list, detail, edit, or overview template. A page supplies its title, actions and content to the template. The heading and content share a left edge. A list places its search and removable filters above its rows. A detail keeps the reading column within 760px and keeps context visible on the right from 1200px with a toolbar button for access at all widths. An edit uses a single form column of at most 560px with save and cancel together. An overview places a compact filter strip above a grid of cards.

Use the BarefootJS button, input, native select, popover, dialog, menu, tabs and tooltip conventions for controls. Shared components own presentation. Setting rows are full-width links with a title, explanation, current value and directional indicator. Each metric card keeps the value with its period change and definition. Extension cards put the availability switch opposite the title, with settings below. The confirmation and settings views explain access permissions. Cards share the settings-card inset. The component gallery at `/dev/ui` is available in local development.

Align the inbox checkbox with the middle of the row. Place the product before the sender and subject. Read rows use regular weight. The second line holds the excerpt, labels and message indicators. Reserve the right edge for time and assignee. Show a state badge only when the list can contain several states. In a conversation, put status, assignee and labels in the attribute row; place commands and previous/next navigation in the sticky toolbar above the subject.

Use the focus ring on keyboard focus and a distinct hover, pressed and disabled appearance on controls. Use a 150ms fade on initial document entry and on popovers, without translating the content. On a BarefootJS route change, keep the current page visible until the next content is ready and swap it at full opacity. Respect reduced motion. In the operator console, use navigation rows or buttons for destinations; reserve underlined links for running text. Group secondary commands in a menu.

## Screen purpose and spacing

Before composing a screen, describe who opens it and why in one sentence. Write up to three questions that person needs answered, group information by question, rank the groups, and align repeated information in the same columns. On the issues board the operator first needs to notify people whose issue was fixed, then decide what to fix next, then assess the result. Linked conversations, delivery receipts and the calculation belong in the detail view.

Spacing belongs to the layout containing the elements. Stack separates vertical children, Cluster wraps horizontal children with equal row and column gaps, Grid stretches cards to a common row height, and PageBody separates the heading, filters, body and sections. Use lg (24px) between sections, md (16px) between cards, sm (12px) within cards and xs (8px) between a field label and its control. Cards share the settings-card padding token. Keep identifiers, counts, dates, status labels and action labels on one line.

## 振る舞い

1. Keep visible content stationary during selection, feedback, loading, and overlay changes. Display operation results in one bottom-center toast. Keep field errors beside their fields and persistent page conditions in the page.
2. Anchor commands independently of subject length and item count. Reserve room for quick actions and keep the conversation toolbar visible while scrolling.
3. Give an open trigger a pressed appearance. Mark every selected menu option; restore keyboard focus on dismissal.
4. Left-align menu items, lists, form contents and button labels. Reserve centered explanatory text for empty states.
5. Show the current on/off state directly with a labelled switch.
6. Size buttons to their labels. Full-width actions are permitted only below 480px.

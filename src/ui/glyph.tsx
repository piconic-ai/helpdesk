const symbols = {
  attachment: 'M6 11l6-6a3 3 0 0 1 4 4l-7 7a4 4 0 0 1-6-6l8-8 M7 12l6-6',
  message_count: 'M2 3h12v9H7l-4 3v-3H2z M8 14h4l4 3v-3h2V7',
  assign: 'M7 4a2.5 2.5 0 1 0 .01 0 M2 16v-1a5 5 0 0 1 10 0v1 M15 7v6 M12 10h6',
  open: 'M3 10 5 4h10l2 6v5H3z M3 10h4l1 2h4l1-2h4',
  pending: 'M10 2.5a7.5 7.5 0 1 0 .01 0z M10 6v4l3 2',
  mine: 'M10 3a3 3 0 1 0 .01 0z M4 16v-1a6 5 0 0 1 12 0v1',
  closed: 'M2 4h16v4H2z M4 8v9h12V8 M8 11h4',
  spam: 'M10 2l7 3v4c0 4-3 6-7 9-4-3-7-5-7-9V5z M10 6v4 M10 13v.2',
  extensions: 'M3 3h5v5H3z M12 3h5v5h-5z M3 12h5v5H3z M12 12h5v5h-5z',
  settings: 'M3 5h14 M3 10h14 M3 15h14 M7 3v4 M13 8v4 M8 13v4',
  feedback: 'M3 3h14v10H9l-5 4v-4H3z',
  approval: 'M5 2h10v3l-4 5 4 5v3H5v-3l4-5-4-5z',
  articles: 'M3 3h6l1 1 1-1h6v12h-6l-1 1-1-1H3z M10 4v12',
  issues: 'M10 2a8 8 0 1 0 .01 0z M10 6v5 M10 14v.2',
  voices: 'M2 4h12v8H7l-4 3v-3H2z M15 8h3v8h-3v2l-3-2H9',
  metrics: 'M3 3v14h14 M6 13v-3 M10 13V7 M14 13V4',
  tokens: 'M11 8a4 4 0 1 1 3 3L7 18H3v-4z',
  menu: 'M3 5h14 M3 10h14 M3 15h14',
  close: 'M4 4l12 12 M16 4 4 16',
  brand: 'M3 5h14v10H3z M3 6l7 5 7-5',
  products: 'M2 6l8-4 8 4-8 4z M2 10l8 4 8-4 M2 14l8 4 8-4',
  received: 'M3 4h14v12H3z M3 9h4l2 3h2l2-3h4',
  reviewed: 'M2 10l3 3 7-8 M8 13l2 2 8-9',
  mail: 'M2.5 4h15v12h-15z M3 5l7 5 7-5',
  form: 'M4 2h12v16H4z M7 6h6 M7 10h5 M7 14h3',
  chat: 'M3 3h14v10H9l-5 4v-4H3z M7 7h6',
  draft: 'M3 16l1-4L14 2l3 3L7 15z M12 4l3 3',
  queued: 'M3 6h8 M3 10h6 M3 14h4 M12 7l5 3-5 3z',
  sent: 'M2 9l16-6-6 15-3-6z M9 12l9-9',
  failed: 'M10 2l8 15H2z M10 7v4 M10 14v.2',
  note: 'M4 3h12v10l-4 4H4z M8 7h5 M8 10h4',
  agent: 'M4 6h12v9H4z M10 6V3 M7 9v2 M13 9v2 M7 13h6',
  extension: 'M4 4h5a2 2 0 1 1 4 0h3v5a2 2 0 1 0 0 4v3H4z',
  system: 'M3 4h14v10H3z M7 17h6 M10 14v3',
  image: 'M2 3h16v14H2z M3 15l5-6 4 4 2-2 3 4 M12 7h1',
  pdf: 'M4 2h8l4 4v12H4z M12 2v5h4 M6 14q4-9 5-4t3 3q-4-2-8 1',
  sheet: 'M3 3h14v14H3z M3 8h14 M3 12h14 M8 8v9',
  archive: 'M3 3h14v4H3z M4 7v10h12V7 M8 10h4',
  tag: 'M2 4v6l8 8 8-8-8-8H4z M6 6h1',
  file: 'M4 2h8l4 4v12H4z M12 2v5h4',
  wait: 'M10 3v9 M10 15v1',
  long_wait: 'M7 3v9 M13 3v9 M7 15v1 M13 15v1',
  issue_open: 'M10 2a8 8 0 1 0 .01 0 M10 8a2 2 0 1 0 .01 0',
  issue_fixed: 'M10 2a8 8 0 1 0 .01 0 M6 10l3 3 5-6',
  issue_notify: 'M4 14l2-3V8a4 4 0 0 1 8 0v3l2 3z M8 16q2 3 4 0',
  search: 'M8 2a6 6 0 1 0 .01 0 M12 12l5 5',
  rules: 'M4 3v14 M4 7h9l3-3 M4 13h9l3 3',
  canned: 'M3 3h13v11H8l-4 3v-3H3z M6 6h7 M6 9h5',
  merge: 'M3 3l7 7v7 M16 3l-6 7 M12 3h4v4',
  presence:
    'M7 3a3 3 0 1 0 .01 0 M2 16v-1a5 5 0 0 1 10 0v1 M13 4q4 2 0 5 M14 12q4 0 4 4',
  snooze: 'M9 4a7 7 0 1 0 7 9 M9 7v4l3 2 M12 2h5l-5 5h5',
  survey: 'M3 17V9h3v8z M9 17V5h3v12z M15 17V2h3v15z',
  export: 'M3 12v5h14v-5 M10 2v10 M6 8l4 4 4-4',
  auto_ack: 'M3 4h12v3 M3 4v11h7 M3 5l6 5 4-3 M11 12h7 M15 9l3 3-3 3',
}
const aliases = {
  awaiting_approval: 'approval',
  notify: 'issue_notify',
} as const
export type GlyphName = keyof typeof symbols | keyof typeof aliases
export function glyph(name: GlyphName, label?: string) {
  const key =
    name === 'awaiting_approval' || name === 'notify' ? aliases[name] : name
  return (
    <svg
      aria-hidden={label ? undefined : 'true'}
      role={label ? 'img' : undefined}
      aria-label={label}
      data-glyph={name}
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
      stroke-linecap="round"
    >
      {label && <title>{label}</title>}
      <path d={symbols[key]} vector-effect="non-scaling-stroke" />
    </svg>
  )
}

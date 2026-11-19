export const nextIssuesScenes = [
  {
    id: 'issue-detail',
    label: '修正した課題と声の主',
    url: '/issues/example/helpdesk/43',
    heading: '領収書の宛名を変更できるようにする',
  },
  {
    id: 'issue-new',
    label: '声を選んで課題を追加',
    url: '/issues/new',
    heading: '課題を追加',
  },
].map((scene) => ({ ...scene, group: '課題の流れ', extensions: ['issues'] }))

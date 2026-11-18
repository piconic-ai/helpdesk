document.addEventListener('click', (event) => {
  const choice = event.target.closest('[data-gallery-choice]')
  if (choice) {
    document.querySelector('[data-gallery-assignee]').textContent =
      '担当・' + choice.dataset.galleryChoice
    choice.closest('[popover]')?.hidePopover()
    for (const list of document.querySelectorAll('[data-ui=candidates]')) {
      list.querySelector('[aria-label="選択中"]')?.remove()
      const item = [...list.querySelectorAll('[data-gallery-choice]')].find(
        (el) => el.dataset.galleryChoice === choice.dataset.galleryChoice,
      )
      const mark = document.createElement('span')
      mark.setAttribute('aria-label', '選択中')
      mark.textContent = '✓'
      item?.querySelector('[data-ui=candidate]').append(mark)
    }
  }
  const toggle = event.target.closest('[data-gallery-toggle]')
  if (toggle)
    toggle.setAttribute(
      'aria-pressed',
      String(toggle.getAttribute('aria-pressed') !== 'true'),
    )
})
document.addEventListener(
  'submit',
  (event) => {
    if (event.target.matches('[data-gallery-save], .composer')) {
      event.preventDefault()
      event.stopImmediatePropagation()
      location.hash = 'states'
    }
  },
  true,
)

document.addEventListener('change', (event) => {
  const control = event.target
  if (control.matches('input[role=switch]'))
    control.nextElementSibling.textContent = control.checked ? '有効' : '無効'
})

// Exercise the visible control, including native form choices without rich content.
export async function choose(scope, name, value) {
  const label = typeof value === 'string' ? value : value.label
  const trigger = scope.getByRole('button', {
    name: new RegExp('^' + name + '：'),
  })
  const native = scope.getByRole('combobox', { name, exact: true })
  await trigger.or(native).first().waitFor()
  if (!(await trigger.isVisible())) return native.selectOption(value)
  await trigger.click()
  const panel = scope.locator(
    '[id="' + (await trigger.getAttribute('aria-controls')) + '"]',
  )
  const byValue = panel.locator('button[data-choice="' + label + '"]')
  await (
    (await byValue.count())
      ? byValue
      : panel.getByRole('button', { name: label, exact: true })
  ).click()
}

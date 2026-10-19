/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 盯住触发区里作者内容自带的 Tab 位：有就由它当键盘入口，触发区不再另占一个。

/** 原生可聚焦、写了 tabindex 或可编辑的元素；逐个再按 tabIndex、禁用与所在子树判。 */
const CANDIDATE = 'a[href], area[href], button, input, select, textarea, iframe, summary, [tabindex], [contenteditable]'

/** 只有这些属性的变化会让子树里多出或少掉一个 Tab 位。 */
const OBSERVED_ATTRIBUTES = ['tabindex', 'disabled', 'hidden', 'inert', 'contenteditable', 'href', 'type']

/** 这个元素自己是不是 Tab 位：写了 tabindex 的按它，可编辑的算 0，其余按元素的 tabIndex。 */
function isTabStop(el: Element): boolean {
  const html = el as HTMLElement
  const tabIndex = !el.hasAttribute('tabindex') && html.isContentEditable ? 0 : html.tabIndex
  if (tabIndex == null || tabIndex < 0)
    return false
  if (el.matches(':disabled'))
    return false
  return !(el.localName === 'input' && (el as HTMLInputElement).type === 'hidden')
}

/**
 * 触发区的子树里有没有 Tab 位：原生可聚焦或 tabindex ≥ 0 的元素，禁用的、hidden 或 inert 子树里的不算，
 * 菜单自己的定位层与内容（作者把浮层嵌在触发区里时）不算。只按 DOM 判，不看 CSS 是否显示。
 */
export function hasInnerTabStop(trigger: Element, ownSelector: string): boolean {
  for (const el of trigger.querySelectorAll(CANDIDATE)) {
    if (isTabStop(el) && !el.closest('[hidden], [inert]') && !el.closest(ownSelector))
      return true
  }
  return false
}

/**
 * 先报一次当前结果，之后子树里增删节点或改了上面那几个属性就重判，结果变了才报。返回停止观察的函数。
 */
export function watchInnerTabStop(trigger: HTMLElement, ownSelector: string, onChange: (value: boolean) => void): () => void {
  const win = trigger.ownerDocument.defaultView
  let current = hasInnerTabStop(trigger, ownSelector)
  onChange(current)
  const observer = win && typeof win.MutationObserver === 'function'
    ? new win.MutationObserver(() => {
        const next = hasInnerTabStop(trigger, ownSelector)
        if (next === current)
          return
        current = next
        onChange(next)
      })
    : null
  observer?.observe(trigger, { subtree: true, childList: true, attributes: true, attributeFilter: OBSERVED_ATTRIBUTES })
  return () => observer?.disconnect()
}

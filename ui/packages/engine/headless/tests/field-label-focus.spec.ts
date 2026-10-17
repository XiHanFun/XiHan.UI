// @vitest-environment jsdom
// 库内控件直接放进字段：没有 control 部件，点标签由字段把焦点送到接线认出的焦点宿主上。
import type { FieldProps } from '../src/field/index'
import { createCounterIdGenerator, createScope, normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectField } from '../src/field/index'

function api(props: FieldProps = {}) {
  const scope = createScope(null, createCounterIdGenerator())
  return connectField(props, scope, normalizeProps)
}

describe('库内控件直接放进字段：点标签由字段聚焦控件', () => {
  /** 按 connect 的属性铺出 root 与 label，再放一个带字段标签的焦点宿主。 */
  function mountField(host: string): { label: HTMLElement, click: () => MouseEvent } {
    const a = api({ parts: { label: true, control: false } })
    const root = document.createElement('div')
    const label = document.createElement('label')
    for (const [k, v] of Object.entries(a.getRootProps() as Record<string, unknown>)) {
      if (typeof v === 'string')
        root.setAttribute(k, v)
    }
    const labelAttrs = a.getLabelProps() as Record<string, unknown>
    for (const [k, v] of Object.entries(labelAttrs)) {
      if (typeof v === 'string')
        label.setAttribute(k, v)
    }
    root.append(label)
    root.insertAdjacentHTML('beforeend', host.replaceAll('LABEL', a.labelId))
    document.body.append(root)
    return {
      label,
      click: () => {
        const event = new MouseEvent('click', { bubbles: true, cancelable: true })
        label.addEventListener('click', e => (labelAttrs.onClick as (e: MouseEvent) => void)(e), { once: true })
        label.dispatchEvent(event)
        return event
      },
    }
  }

  it('焦点宿主可聚焦：焦点落到它上面，并拦下标签的默认行为', () => {
    const { click } = mountField('<button aria-labelledby="LABEL x">请选择</button>')
    const event = click()
    expect(document.activeElement?.textContent).toBe('请选择')
    expect(event.defaultPrevented).toBe(true)
    document.body.innerHTML = ''
  })

  it('焦点宿主不可聚焦：焦点落到它里面第一个可 tab 的节点', () => {
    const { click } = mountField('<div role="radiogroup" aria-labelledby="LABEL"><button tabindex="-1">甲</button><button>乙</button></div>')
    click()
    expect(document.activeElement?.textContent).toBe('乙')
    document.body.innerHTML = ''
  })
})

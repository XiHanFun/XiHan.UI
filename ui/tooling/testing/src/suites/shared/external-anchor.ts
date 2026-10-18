// 外部锚点（anchor prop）的用例共用件：popover 与 menu 都可以锚在组件之外的一颗按钮上，由它受控打开。
// 那颗按钮不是部件，部件快照采不到、click / settle 步骤也够不着，只能在 raw 步骤里造、点、查。
import type { FixtureNode, RawStepContext, StepWithExpect } from '../../conformance/types'
import { settled } from './overflow-menu'

const EXTERNAL_ANCHOR = 'xh-external-anchor'

export function externalAnchor(doc: Document): HTMLElement {
  const el = doc.getElementById(EXTERNAL_ANCHOR)
  if (!el)
    throw new Error('外部锚点还没造出来')
  return el
}

/** 不写 trigger 的结构：锚点全交给 anchor。 */
export function withoutTrigger(base: FixtureNode): FixtureNode {
  return { ...base, children: base.children?.filter(child => child.part !== 'trigger') }
}

/** 造出外部锚点并交给 anchor。 */
export function mountExternalAnchor(expect?: StepWithExpect['expect']): StepWithExpect {
  return {
    kind: 'raw',
    why: '外部锚点不是部件，只能在运行时造出来、经宿主交给 anchor',
    run: async ({ doc, setProps }: RawStepContext) => {
      const el = doc.createElement('button')
      el.id = EXTERNAL_ANCHOR
      el.type = 'button'
      el.textContent = '外部锚点'
      doc.body.append(el)
      await setProps({ anchor: el })
    },
    ...(expect ? { expect } : {}),
  }
}

/** 断言外部锚点上的三条读屏属性；null 即该属性不在场，controlsContent 为真时 aria-controls 指向 scope 的 content。 */
export function externalAnchorAria(scope: string, expected: { haspopup: string | null, expanded: string | null, controlsContent: boolean }): StepWithExpect {
  return {
    kind: 'raw',
    why: '外部锚点在组件之外，部件快照采不到它',
    run: ({ doc }: RawStepContext) => {
      const el = externalAnchor(doc)
      const content = doc.querySelector(`[data-scope="${scope}"][data-part="content"]`)
      const actual = {
        haspopup: el.getAttribute('aria-haspopup'),
        expanded: el.getAttribute('aria-expanded'),
        controls: el.getAttribute('aria-controls'),
      }
      const controls = expected.controlsContent ? (content?.id ?? '(content 没有 id)') : null
      if (actual.haspopup !== expected.haspopup || actual.expanded !== expected.expanded || actual.controls !== controls)
        throw new Error(`外部锚点的读屏属性不对：${JSON.stringify(actual)}`)
    },
  }
}

/** 指针点一下外部锚点：pointerdown 加 click，与 outside 步骤同一组事件。 */
export function clickExternalAnchor(expect?: StepWithExpect['expect']): StepWithExpect {
  return {
    kind: 'raw',
    why: '外部锚点不是部件，click 步骤够不着它',
    run: async ({ doc, flush }: RawStepContext) => {
      const anchor = externalAnchor(doc)
      anchor.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }))
      anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      await flush()
    },
    ...(expect ? { expect } : {}),
  }
}

/** 等焦点回到外部锚点。 */
export const focusReturnsToExternalAnchor: StepWithExpect = {
  kind: 'raw',
  why: '焦点归还的落点是组件之外的外部锚点，settle 只认部件',
  run: async ({ doc, flush }: RawStepContext) => {
    const anchor = externalAnchor(doc)
    if (!await settled(doc, flush, () => doc.activeElement === anchor))
      throw new Error(`焦点没有归还外部锚点，落在 ${doc.activeElement?.tagName ?? 'null'}`)
  },
}

export const removeExternalAnchor: StepWithExpect = {
  kind: 'raw',
  why: '外部锚点挂在文档上，用例结束时摘掉',
  run: ({ doc }: RawStepContext) => externalAnchor(doc).remove(),
}

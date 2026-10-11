// 自己画输入框的四处部件照字段外壳走：静息字段淡底（只读压成淡底一档），聚焦换承载面底 + 品牌描边、不画焦点环，
// 无效换无效淡底 + 无效描边。此前审批与问答流的备注框静息是承载面底、聚焦叠一圈公共焦点环，
// 标签就地编辑框是画布底并自己画环，剪贴板的只读框聚焦只换描边、公共环照画——与别的字段并排时一眼就不是一家。
// 计算样式与焦点伪类只有真实浏览器给得出来。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhApprovalDenyTrigger,
  XhApprovalFooter,
  XhApprovalNote,
  XhApprovalRoot,
  XhApprovalTitle,
  XhClipboardControl,
  XhClipboardCopyTrigger,
  XhClipboardInput,
  XhClipboardRoot,
  XhQuestionFlowNote,
  XhQuestionFlowQuestion,
  XhQuestionFlowRoot,
  XhQuestionFlowTrack,
  XhQuestionFlowViewport,
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemInput,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(render: () => VNode): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '420px'
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(scope: string, name: string): HTMLInputElement {
  const element = host!.querySelector<HTMLInputElement>(`[data-scope='${scope}'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 ${scope}/${name}`)
  // 量终态：背景与描边的过渡不参与
  element.style.transition = 'none'
  return element
}

/** 语义令牌解析成的颜色，与计算后的背景、描边比对。 */
function token(name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  host!.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

function expectFocusedFace(box: HTMLElement): void {
  box.focus()
  expect(document.activeElement).toBe(box)
  const style = getComputedStyle(box)
  expect(style.outlineStyle).toBe('none')
  expect(style.borderTopColor).toBe(token('--xh-border-control-focus'))
  expect(style.backgroundColor).toBe(token('--xh-bg-surface'))
}

describe('自己画输入框的部件照字段外壳', () => {
  it('审批备注：静息字段淡底，聚焦换承载面底 + 品牌描边、无环；空着按拒绝换无效淡底 + 无效描边、仍无环', async () => {
    await mount(() => h(XhApprovalRoot, { requireReason: true }, () => [
      h(XhApprovalTitle, null, () => '要删分支'),
      h(XhApprovalNote),
      h(XhApprovalFooter, null, () => h(XhApprovalDenyTrigger, null, () => '拒绝')),
    ]))
    const note = part('approval', 'note')
    expect(getComputedStyle(note).backgroundColor).toBe(token('--xh-bg-field'))
    expectFocusedFace(note)

    note.blur()
    host!.querySelector<HTMLButtonElement>(`[data-part='deny-trigger']`)!.click()
    await nextTick()
    expect(document.activeElement).toBe(note)
    const invalid = getComputedStyle(note)
    expect(invalid.outlineStyle).toBe('none')
    expect(invalid.borderTopColor).toBe(token('--xh-border-invalid'))
    expect(invalid.backgroundColor).toBe(token('--xh-bg-field-invalid'))
  })

  it('问答流备注：静息字段淡底，聚焦换承载面底 + 品牌描边、无环', async () => {
    await mount(() => h(XhQuestionFlowRoot, {
      questions: [{ id: 'why', prompt: '为什么？', type: 'single', options: [{ value: 'a', label: '甲' }] }],
    }, () => h(XhQuestionFlowViewport, null, () => h(XhQuestionFlowTrack, null, () =>
      h(XhQuestionFlowQuestion, { questionId: 'why' }, () => h(XhQuestionFlowNote, { questionId: 'why' }))))))
    const note = part('question-flow', 'note')
    expect(getComputedStyle(note).backgroundColor).toBe(token('--xh-bg-field'))
    expectFocusedFace(note)
  })

  it('标签就地编辑框：聚焦换承载面底 + 品牌描边，不另画环', async () => {
    await mount(() => h(XhTagsInputRoot, { defaultValue: ['甲'], editable: true }, {
      default: (bag: { value: string[] }) => h(XhTagsInputControl, null, () => [
        ...bag.value.map(t => h(XhTagsInputItem, { key: t, value: t }, () => [
          h(XhTagsInputItemPreview, null, () => h(XhTagsInputItemText, null, () => t)),
          h(XhTagsInputItemInput),
        ])),
        h(XhTagsInputInput),
      ]),
    }))
    // 条目的预览就是一颗标签，双击它进就地编辑
    host!.querySelector(`[data-scope='tags-input'][data-part='item'] > [data-scope='tag'][data-part='root']`)!
      .dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))
    await nextTick()
    await nextTick()
    const edit = part('tags-input', 'item-input')
    expect(edit.hidden).toBe(false)
    expectFocusedFace(edit)
  })

  it('剪贴板只读框：静息淡底一档，聚焦换承载面底 + 品牌描边，公共焦点环不画', async () => {
    await mount(() => h(XhClipboardRoot, { value: 'pnpm add @xihan-ui/vue' }, () =>
      h(XhClipboardControl, null, () => [h(XhClipboardInput), h(XhClipboardCopyTrigger, null, () => '复制')])))
    const input = part('clipboard', 'input')
    expect(getComputedStyle(input).backgroundColor).toBe(token('--xh-bg-subtle'))
    expectFocusedFace(input)
  })
})

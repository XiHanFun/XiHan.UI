// 勾选格里的勾与半选杠：Checkbox、CheckboxGroup、Transfer、Table、QuestionFlow 多选同一份标记语言。
// 标记常驻、不按状态生成或撤掉；按状态以 opacity（micro）淡变并从 --xh-motion-scale-enter 回到 1（nudge）；
// 半选淡出途中保持横杠，不闪出一枚勾。GridList 的行勾选框按同一副取值画。
import type { App, Ref, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhCheckbox,
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemText,
  XhCheckboxGroupRoot,
  XhCheckboxGroupSelectAllTrigger,
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowContent,
  XhGridListRowSelectionIndicator,
  XhGridListRowText,
  XhQuestionFlowGroup,
  XhQuestionFlowItem,
  XhQuestionFlowItemIndicator,
  XhQuestionFlowItemText,
  XhQuestionFlowQuestion,
  XhQuestionFlowRoot,
  XhQuestionFlowTrack,
  XhQuestionFlowViewport,
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableRowSelectTrigger,
  XhTableSelectAllTrigger,
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelHeader,
  XhTransferRoot,
  XhTransferSelectAllTrigger,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
} from '../../src'
import { shownMask } from './glyph-mask'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Mark = 'checked' | 'indeterminate' | 'unchecked'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(render: () => VNode | VNode[]): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(scope: string, name: string, index = 0): HTMLElement {
  const el = host!.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']:not([hidden])`)[index]
  if (!el)
    throw new Error(`找不到 ${scope}/${name}[${index}]`)
  return el
}

/** 在宿主里把一条声明解析成计算值 */
function resolve(property: string, value: string): string {
  const probe = document.createElement('div')
  probe.style.setProperty(property, value)
  host!.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

function glyphMask(token: string): string {
  return resolve('mask-image', `var(${token})`)
}

function running(el: HTMLElement, pseudo: string, property: string): boolean {
  return el.getAnimations({ subtree: true }).some(animation =>
    (animation as CSSTransition).transitionProperty === property
    && (animation.effect as KeyframeEffect | null)?.pseudoElement === pseudo)
}

function finish(): void {
  for (const animation of document.getAnimations())
    animation.finish()
}

/** 标记常驻，状态只换透明度、缩放与露出的那层遮罩 */
function expectMark(el: HTMLElement, pseudo: string, mark: Mark): void {
  const style = getComputedStyle(el, pseudo)
  expect(style.content, `${pseudo} 常驻`).not.toBe('none')
  expect(style.opacity).toBe(mark === 'unchecked' ? '0' : '1')
  expect(style.scale).toBe(mark === 'unchecked' ? resolve('scale', 'var(--xh-motion-scale-enter)') : '1')
  const properties = style.transitionProperty.split(', ')
  const durations = style.transitionDuration.split(', ')
  expect(durations[properties.indexOf('opacity')]).toBe(resolve('transition-duration', 'var(--xh-motion-duration-micro)'))
  expect(durations[properties.indexOf('scale')]).toBe(resolve('transition-duration', 'var(--xh-motion-duration-nudge)'))
  if (mark !== 'unchecked')
    expect(shownMask(el, pseudo)).toBe(glyphMask(mark === 'checked' ? '--xh-glyph-mark-check' : '--xh-glyph-mark-minus'))
}

describe('勾选标记家族', () => {
  it('checkbox：勾上时淡入并回到原尺寸，半选淡出途中保持横杠', async () => {
    const checked: Ref<boolean | 'indeterminate'> = ref(false)
    await mount(() => h(XhCheckbox, { 'checked': checked.value, 'onUpdate:checked': (next: boolean) => checked.value = next }))
    const indicator = part('checkbox', 'indicator')
    expectMark(indicator, '::before', 'unchecked')

    await userEvent.click(part('checkbox', 'root'))
    await nextTick()
    expect(running(indicator, '::before', 'opacity')).toBe(true)
    expect(running(indicator, '::before', 'scale')).toBe(true)
    finish()
    expectMark(indicator, '::before', 'checked')

    checked.value = 'indeterminate'
    await nextTick()
    finish()
    expectMark(indicator, '::before', 'indeterminate')

    checked.value = false
    await nextTick()
    expect(running(indicator, '::before', 'opacity')).toBe(true)
    // 淡出途中露出的仍是横杠
    expect(shownMask(indicator, '::before')).toBe(glyphMask('--xh-glyph-mark-minus'))
    finish()
    expectMark(indicator, '::before', 'unchecked')
  })

  it('checkbox-group：条目方框与全选格同一份标记，全选格的标记叠在方框正中', async () => {
    const value = ref<string[]>([])
    await mount(() => h(XhCheckboxGroupRoot, {
      'value': value.value,
      'itemValues': ['a', 'b'],
      'onUpdate:value': (next: string[]) => value.value = next,
    }, () => [
      h(XhCheckboxGroupSelectAllTrigger, null, () => '全选'),
      ...['a', 'b'].map(v => h(XhCheckboxGroupItem, { key: v, value: v }, () => [
        h(XhCheckboxGroupIndicator),
        h(XhCheckboxGroupItemText, null, () => v),
      ])),
    ]))
    const box = part('checkbox-group', 'indicator')
    const all = part('checkbox-group', 'select-all-trigger')
    expectMark(box, '::before', 'unchecked')
    expectMark(all, '::after', 'unchecked')

    await userEvent.click(part('checkbox-group', 'item'))
    await nextTick()
    expect(running(box, '::before', 'opacity')).toBe(true)
    finish()
    expectMark(box, '::before', 'checked')
    expectMark(all, '::after', 'indeterminate')
    // 标记落在方框正中
    const frame = all.getBoundingClientRect()
    const square = Number.parseFloat(getComputedStyle(all, '::before').inlineSize)
    const glyph = Number.parseFloat(getComputedStyle(all, '::after').inlineSize)
    expect(Number.parseFloat(getComputedStyle(all, '::after').marginInlineStart)).toBeCloseTo((square - glyph) / 2, 1)
    expect(frame.width).toBeGreaterThan(square)

    // 全选格从半选退到空：淡出途中保持横杠
    await userEvent.click(part('checkbox-group', 'item'))
    await nextTick()
    expect(running(all, '::after', 'opacity')).toBe(true)
    expect(shownMask(all, '::after')).toBe(glyphMask('--xh-glyph-mark-minus'))
    finish()
    expectMark(all, '::after', 'unchecked')
  })

  it('transfer：条目方框与全选格同一份标记', async () => {
    const collection = [{ value: 'v0', label: '零' }, { value: 'v1', label: '一' }]
    const items = (): VNode[] => collection.map(entry => h(XhTransferItem, { key: entry.value, value: entry.value }, () => [
      h(XhTransferItemCheckbox),
      h(XhTransferItemText, null, () => entry.label),
    ]))
    await mount(() => h(XhTransferRoot, { collection }, () => [
      h(XhTransferSourcePanel, null, () => [
        h(XhTransferPanelHeader, null, () => [h(XhTransferSelectAllTrigger, null, () => '全选')]),
        h(XhTransferList, null, items),
      ]),
      h(XhTransferTargetPanel, null, () => [h(XhTransferList, null, items)]),
    ]))
    const box = part('transfer', 'item-checkbox')
    const all = part('transfer', 'select-all-trigger')
    expectMark(box, '::before', 'unchecked')
    expectMark(all, '::after', 'unchecked')

    await userEvent.click(part('transfer', 'item'))
    await nextTick()
    expect(running(box, '::before', 'opacity')).toBe(true)
    finish()
    expectMark(box, '::before', 'checked')
    expectMark(all, '::after', 'indeterminate')
  })

  it('table：全选与行勾选框不再靠换前景色显隐，勾常驻并淡变', async () => {
    const columns = [{ id: 'select', label: '', width: 56 }, { id: 'name', label: '名称', width: 160 }]
    const rows = [{ id: 'a' }, { id: 'b' }]
    await mount(() => h(XhTableRoot, { columns, rows, selectionMode: 'multiple' }, () => [
      h(XhTableHeader, null, () => [h(XhTableRow, null, () => columns.map(column =>
        h(XhTableColumnHeader, { key: column.id, value: column.id }, () => column.id === 'select' ? h(XhTableSelectAllTrigger) : column.label)))]),
      h(XhTableBody, null, () => rows.map(row => h(XhTableRow, { key: row.id, value: row.id }, () => [
        h(XhTableCell, { value: 'select' }, () => h(XhTableRowSelectTrigger)),
        h(XhTableCell, { value: 'name' }, () => row.id),
      ]))),
    ]))
    const all = part('table', 'select-all-trigger')
    const first = part('table', 'row-select-trigger')
    expectMark(all, '::before', 'unchecked')
    expectMark(first, '::before', 'unchecked')

    await userEvent.click(first)
    await nextTick()
    expect(running(first, '::before', 'opacity')).toBe(true)
    finish()
    expectMark(first, '::before', 'checked')
    expectMark(all, '::before', 'indeterminate')
    // 标记色恒为面上的前景：不再把前景换成透明来藏勾
    expect(getComputedStyle(part('table', 'row-select-trigger', 1)).color).toBe(getComputedStyle(first).color)
  })

  it('table：树形表级联下部分子行勾中的父行画半选横杠', async () => {
    const columns = [{ id: 'select', label: '', width: 56 }, { id: 'name', label: '名称', width: 160 }]
    const rows = [{ id: 'rd', expandable: true }, { id: 'rd-web', parentId: 'rd' }, { id: 'rd-app', parentId: 'rd' }]
    await mount(() => h(XhTableRoot, { columns, rows, selectionMode: 'multiple', cascade: true, defaultExpandedValue: ['rd'] }, () => [
      h(XhTableBody, null, () => rows.map(row => h(XhTableRow, { key: row.id, value: row.id }, () => [
        h(XhTableCell, { value: 'select' }, () => h(XhTableRowSelectTrigger)),
        h(XhTableCell, { value: 'name' }, () => row.id),
      ]))),
    ]))
    await userEvent.click(part('table', 'row-select-trigger', 1))
    await nextTick()
    finish()
    expectMark(part('table', 'row-select-trigger', 0), '::before', 'indeterminate')
    expectMark(part('table', 'row-select-trigger', 1), '::before', 'checked')
    expectMark(part('table', 'row-select-trigger', 2), '::before', 'unchecked')
  })

  it('question-flow：多选的记号同一份标记', async () => {
    const questions = [{ id: 'q', prompt: '多选', type: 'multiple' as const, options: [{ value: 'x', label: '甲' }] }]
    await mount(() => h(XhQuestionFlowRoot, { questions }, () => [
      h(XhQuestionFlowViewport, null, () => [h(XhQuestionFlowTrack, null, () => [
        h(XhQuestionFlowQuestion, { questionId: 'q' }, () => [h(XhQuestionFlowGroup, { questionId: 'q' }, () => [
          h(XhQuestionFlowItem, { questionId: 'q', optionValue: 'x' }, () => [
            h(XhQuestionFlowItemIndicator, { questionId: 'q', optionValue: 'x' }),
            h(XhQuestionFlowItemText, { questionId: 'q', optionValue: 'x' }, () => '甲'),
          ]),
        ])]),
      ])]),
    ]))
    finish()
    const indicator = part('question-flow', 'item-indicator')
    expectMark(indicator, '::before', 'unchecked')
    await userEvent.click(part('question-flow', 'item'))
    await nextTick()
    expect(running(indicator, '::before', 'opacity')).toBe(true)
    finish()
    expectMark(indicator, '::before', 'checked')
  })

  it('grid-list：行勾选框的描边、底色与勾都有过渡，勾常驻', async () => {
    const collection = [{ value: 'docs', label: '文档站' }, { value: 'console', label: '管理后台' }]
    await mount(() => h(XhGridListRoot, { collection, selectionMode: 'multiple' }, () => collection.map(item =>
      h(XhGridListRow, { value: item.value }, () => [
        h(XhGridListRowSelectionIndicator),
        h(XhGridListRowContent, null, () => h(XhGridListRowText, null, () => item.label)),
      ]))))
    const box = part('grid-list', 'row-selection-indicator')
    const transition = getComputedStyle(box).transitionProperty.split(', ')
    expect(transition).toEqual(expect.arrayContaining(['background-color', 'border-color']))
    expectMark(box, '::before', 'unchecked')
    await userEvent.click(part('grid-list', 'row'))
    await nextTick()
    expect(running(box, '::before', 'opacity')).toBe(true)
    finish()
    expectMark(box, '::before', 'checked')
  })
})

// 属性面板在真实 Chromium 里：数字字段在真实输入与失焦下的约束（开区间下限拦住不派发，越出上限的值失焦时夹回端点）；
// 没有编辑器的属性是只读的一行，宿主编辑器按一组控件或字段控件接线：必填、只读、报错时没有 wc.* 诊断，axe 也没有违规。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { DesignerPropertiesEventMap, XhDesignerPropertiesElement } from '../../src'
import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsDedupe, setDiagnosticsLevel } from '@xihan-ui/core'
import { expectNoAxeViolations } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '../../style.css'

defineDesignerShell()

let panel: XhDesignerPropertiesElement | undefined

afterEach(() => {
  panel?.remove()
  panel = undefined
})

async function mount(): Promise<{ changes: unknown[], input: (path: string) => HTMLInputElement, error: (path: string) => string | undefined }> {
  panel = document.createElement('xh-designer-properties')
  panel.targets = [{
    kind: 'column',
    id: 'c1',
    value: { width: 80, span: 2 },
    descriptors: [
      { path: ['width'], control: { kind: 'number', exclusiveMin: 0 }, label: 'Width' },
      { path: ['span'], control: { kind: 'number', integer: true, min: 1, max: 4 }, label: 'Span' },
    ],
  }]
  const changes: unknown[] = []
  panel.addEventListener('property-change', event => changes.push((event as DesignerPropertiesEventMap['property-change']).detail.value))
  document.body.append(panel)
  await panel.updateComplete
  const row = (path: string): HTMLElement => panel!.querySelector<HTMLElement>(`[data-part="property"][data-path="${path}"]`)!
  return {
    changes,
    input: path => row(path).querySelector('input')!,
    error: (path) => {
      const field = row(path).querySelector('xh-field')!
      return field.hasAttribute('invalid') ? field.querySelector('[data-xh-part="error-text"]')!.textContent! : undefined
    },
  }
}

describe('属性面板的数字约束（Chromium）', () => {
  it('不大于开区间下限时就地报错、不派发，失焦后框里保留输入', async () => {
    const { changes, input, error } = await mount()
    await userEvent.clear(input('width'))
    await userEvent.type(input('width'), '0')
    expect(error('width')).toBe('Must be greater than 0')
    await userEvent.tab()
    expect([input('width').value, error('width')]).toEqual(['0', 'Must be greater than 0'])
    expect(changes).toEqual([undefined])
  })

  it('越出上限的值输入时报错，失焦时夹回上限并派发、错误清掉', async () => {
    const { changes, input, error } = await mount()
    await userEvent.clear(input('span'))
    await userEvent.type(input('span'), '7')
    expect(error('span')).toBe('Must be at most 4')
    await userEvent.tab()
    expect([input('span').value, error('span')]).toEqual(['4', undefined])
    expect(changes.at(-1)).toBe(4)
  })

  it('没有编辑器的属性是只读的一行，宿主编辑器按一组控件或字段控件接线：没有 wc.* 诊断、标签不指向空、axe 无违规', async () => {
    const diagnostics: DiagnosticRecord[] = []
    resetDiagnostics()
    setDiagnosticsConsoleOutput(false)
    setDiagnosticsLevel('warn')
    setDiagnosticsDedupe(false)
    const off = onDiagnostic(record => void diagnostics.push(record))
    panel = document.createElement('xh-designer-properties')
    panel.readonly = true
    panel.editors = { byControl: {
      picker: () => {
        const button = document.createElement('button')
        button.type = 'button'
        button.textContent = 'Choose people'
        return { element: button }
      },
      code: () => {
        const input = document.createElement('input')
        input.setAttribute('data-xh-part', 'control')
        return { element: input }
      },
    } }
    panel.targets = [{
      kind: 'task',
      id: 't1',
      value: {},
      descriptors: [
        { path: ['who'], control: { kind: 'assignees' }, label: 'Assignees', required: true },
        { path: ['owner'], control: { kind: 'picker' }, label: 'Owner', required: true },
        { path: ['code'], control: { kind: 'code' }, label: 'Code', required: true },
      ],
    }]
    panel.errors = [
      { target: { kind: 'task', id: 't1' }, path: ['who'], message: 'Required' },
      { target: { kind: 'task', id: 't1' }, path: ['owner'], message: 'Required' },
    ]
    document.body.append(panel)
    await panel.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
    off()
    resetDiagnostics()
    expect(diagnostics.filter(record => record.code.startsWith('wc.')).map(record => `${record.code} ${record.part ?? ''}`)).toEqual([])

    const row = (path: string): HTMLElement => panel!.querySelector<HTMLElement>(`[data-part="property"][data-path="${path}"]`)!
    const texts = (ids: string | null): string[] => (ids ?? '').split(/\s+/).filter(Boolean).map(id => document.getElementById(id)!.textContent!)
    const who = row('who')
    expect(who.querySelector('xh-field, label')).toBeNull()
    expect([who.querySelector('[data-part="property-label"]')!.textContent, who.querySelector('[data-control="unsupported"]')!.textContent]).toEqual(['Assignees', 'assignees'])
    expect(who.querySelector('[data-part="property-error"]')!.textContent).toBe('Required')

    const owner = row('owner')
    expect(owner.querySelector('xh-field')).toBeNull()
    expect([owner.getAttribute('role'), texts(owner.getAttribute('aria-labelledby')), texts(owner.getAttribute('aria-describedby'))]).toEqual(['group', ['Owner'], ['Required']])

    const code = row('code').querySelector('input')!
    expect([row('code').querySelector('xh-field') !== null, code.labels?.[0]?.textContent]).toEqual([true, 'Code'])
    for (const label of panel.querySelectorAll('label'))
      expect(label.htmlFor === '' || document.getElementById(label.htmlFor) !== null).toBe(true)
    await expectNoAxeViolations(panel)
  })
  it('插槽与自定义编辑器里的作者内容不受属性面板样式影响：带同名部件的作者元素保持自己的样式', async () => {
    const tree = [
      '<div data-part="title">t</div><div data-part="heading">h</div><p data-part="empty">e</p>',
      '<div data-part="groups"><div data-part="group" role="group"><div data-part="group-label">g</div><div data-part="group-rows">r</div></div></div>',
      '<div data-part="property" role="group"><div data-part="property-line"><span data-part="property-label" data-required>l</span>',
      '<span data-control="unsupported">u</span></div><p data-part="property-hint">i</p><p data-part="property-error">x</p></div>',
      '<div data-json><textarea>{}</textarea></div>',
      '<div data-part="sides" data-linked><div data-part="sides-fields">s</div></div>',
    ].join('')
    panel = document.createElement('xh-designer-properties')
    panel.editors = { byControl: {
      picker: () => {
        const element = document.createElement('div')
        element.innerHTML = tree
        return { element }
      },
    } }
    panel.targets = [{ kind: 'task', id: 't1', value: {}, descriptors: [{ path: ['owner'], control: { kind: 'picker' }, label: 'Owner' }] }]
    const header = document.createElement('div')
    header.setAttribute('slot', 'header')
    header.innerHTML = tree
    panel.append(header)
    document.body.append(panel)
    await panel.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))

    const custom = panel.querySelector('[data-control="custom"]')!
    const planted = [header, custom.firstElementChild!].flatMap(root => Array.from(root.querySelectorAll<HTMLElement>('[data-part], [data-control], [data-json], textarea')))
    expect(planted).toHaveLength(34)
    for (const element of planted) {
      const style = getComputedStyle(element)
      const parent = getComputedStyle(element.parentElement!)
      const name = element.dataset.part ?? element.dataset.control ?? element.localName
      expect([name, style.display, style.overflow, style.rowGap, style.justifyContent])
        .toEqual([name, element.localName === 'span' ? 'inline' : element.localName === 'textarea' ? 'inline-block' : 'block', element.localName === 'textarea' ? 'auto' : 'visible', 'normal', 'normal'])
      if (element.localName !== 'textarea')
        expect([name, style.color, style.fontSize, style.fontWeight, style.fontFamily]).toEqual([name, parent.color, parent.fontSize, parent.fontWeight, parent.fontFamily])
      if (element.localName === 'p')
        expect([name, style.marginTop]).toEqual([name, style.fontSize])
      expect(getComputedStyle(element, '::before').content).toBe('none')
    }
    const own = panel.querySelector<HTMLElement>('[data-scope="designer-properties"][data-part="title"]')!
    expect(getComputedStyle(own).fontWeight).not.toBe(getComputedStyle(own.parentElement!).fontWeight)
  })
})

describe('属性面板换了对象（Chromium）', () => {
  it('只改了一个属性时，各行的说明与错误部件不被改写：字段不重新接线，多行框不重新量高', async () => {
    panel = document.createElement('xh-designer-properties')
    const target = {
      kind: 'task',
      id: 't1',
      value: { label: '审批', code: 'a1', note: '第一行\n第二行' },
      descriptors: [
        { path: ['label'], control: { kind: 'text' as const }, label: 'Label' },
        { path: ['code'], control: { kind: 'text' as const }, label: 'Code' },
        { path: ['note'], control: { kind: 'text' as const, multiline: true }, label: 'Note' },
      ],
    }
    panel.targets = [target]
    panel.hintOf = descriptor => (descriptor.path[0] === 'code' ? 'Unique in the flow' : undefined)
    document.body.append(panel)
    await panel.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
    const records: MutationRecord[] = []
    const observer = new MutationObserver(list => records.push(...list))
    observer.observe(panel, { subtree: true, attributes: true })
    panel.targets = [{ ...target, value: { ...target.value, label: '审批 2' } }]
    await panel.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
    const writes = [...records, ...observer.takeRecords()]
      .filter(item => (item.target as Element).matches('[data-xh-part="description"], [data-xh-part="error-text"], textarea'))
      .map(item => `${(item.target as Element).closest('[data-path]')!.getAttribute('data-path')} ${(item.target as Element).getAttribute('data-xh-part')} ${item.attributeName}`)
    observer.disconnect()
    expect(writes).toEqual([])
  })
})

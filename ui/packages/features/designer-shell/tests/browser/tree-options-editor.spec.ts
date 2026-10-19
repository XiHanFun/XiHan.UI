// 属性面板的选项树在真实布局与真实键盘、指针下：表格报 treegrid、各行报层级、整张表只占一个 Tab 位；方向键在格子之间走，Enter / F2 进格内编辑、
// 格内输入框里的左右键归输入框，Esc 回到格子；Alt + 方向键同层换序、改一层缩进，写回整棵树，焦点留在原来那一格；
// 加子项、新增与删除写回整棵树；落在里层某一项某一格的问题标在那一格的控件上；窄面板里表格横向滚动、不撑出面板。
import type { JsonValue } from '@xihan-ui/core/json'
import type { DesignerPropertiesEventMap, DesignerPropertyTarget, XhDesignerPropertiesElement } from '../../src'
import { mergeXhConfig } from '@xihan-ui/web-components'
import { defineXhElement, XhConfigElement } from '@xihan-ui/web-components/define'
import { zhCN } from '@xihan-ui/web-components/locale'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, page, userEvent } from 'vitest/browser'
import { defineDesignerShell } from '../../src'
import { designerShellZhCN } from '../../src/locale'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()
defineXhElement('xh-config', XhConfigElement)

let wrapper: HTMLElement | null = null

afterEach(() => {
  wrapper?.remove()
  wrapper = null
})

async function until(check: () => boolean, message = '期望的状态'): Promise<void> {
  const start = performance.now()
  while (!check()) {
    if (performance.now() - start > 2000)
      throw new Error(`等了 2 秒仍没到${message}`)
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

function target(options: JsonValue, label = 'Options', group?: string): DesignerPropertyTarget {
  return {
    kind: 'field',
    id: 'f1',
    value: { data: { options } },
    descriptors: [{ path: ['data', 'options'], control: { kind: 'treeOptions' }, label, ...(group ? { group } : {}) }],
  }
}

/** 挂一个属性面板（缺省 320px、英文），选项写回时照样换上新值，像设计器那样。 */
async function mount(options: JsonValue, settings: { errors?: readonly { path: (string | number)[], message: string }[], width?: number, zh?: boolean } = {}): Promise<{ panel: XhDesignerPropertiesElement, written: JsonValue[] }> {
  const box = document.createElement('div')
  box.style.cssText = `display: flex; inline-size: ${settings.width ?? 320}px; overflow: hidden`
  const scope = document.createElement('xh-config') as HTMLElement & { translations?: unknown }
  if (settings.zh)
    scope.translations = mergeXhConfig(zhCN, designerShellZhCN).translations
  scope.style.cssText = 'display: block; flex: 1; min-inline-size: 0'
  const panel = document.createElement('xh-designer-properties')
  const label = settings.zh ? '选项' : 'Options'
  const group = settings.zh ? 'data' : undefined
  if (settings.zh)
    panel.collapsible = true
  panel.targets = [target(options, label, group)]
  panel.errors = (settings.errors ?? []).map(error => ({ target: { kind: 'field', id: 'f1' }, ...error }))
  const written: JsonValue[] = []
  panel.addEventListener('property-change', (event) => {
    const { value } = (event as DesignerPropertiesEventMap['property-change']).detail
    written.push(value ?? null)
    panel.targets = [target(value ?? [], label, group)]
  })
  scope.append(panel)
  box.append(scope)
  document.body.append(box)
  wrapper = box
  await panel.updateComplete
  await until(() => panel.querySelectorAll('[data-scope="table"][data-part="row"] input').length > 0 || !Array.isArray(options) || options.length === 0, '选项树铺好')
  return { panel, written }
}

/** 某一项某一列的格子：项按值认。 */
function cell(panel: HTMLElement, value: string, column: string): HTMLElement {
  const input = [...panel.querySelectorAll<HTMLInputElement>('[data-scope="table"][data-part="cell"][value="value"] input')].find(item => item.value === value)
  const row = input?.closest<HTMLElement>('[data-scope="table"][data-part="row"]')
  const found = row?.querySelector<HTMLElement>(`:scope > [data-scope="table"][data-part="cell"][value="${column}"]`)
  if (!found)
    throw new Error(`没有值为 ${value} 的一项的 ${column} 格`)
  return found
}

/** 某一项的行：项按值认。 */
function row(panel: HTMLElement, value: string): HTMLElement {
  return cell(panel, value, 'value').closest<HTMLElement>('[data-scope="table"][data-part="row"]')!
}

/** 控件的可及描述：aria-describedby 指向的各节点的文字。 */
function description(element: Element): string {
  return (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean).map(id => document.getElementById(id)?.textContent?.trim() ?? '').filter(Boolean).join(' ')
}

/** 真实鼠标的坐标换算：页面坐标除以它就是 CDP 要的坐标。 */
async function mouseScale(): Promise<number> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  return seen
}

/** 真实鼠标按住 from、分十步拖到 to 再松开，每步隔一帧。 */
async function drag(from: { x: number, y: number }, to: { x: number, y: number }): Promise<void> {
  const scale = await mouseScale()
  const at = (x: number, y: number) => ({ x: x / scale, y: y / scale })
  const frame = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => resolve()))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(from.x, from.y) })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(from.x, from.y) })
  for (let i = 1; i <= 10; i++) {
    await frame()
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at(from.x + ((to.x - from.x) * i) / 10, from.y + ((to.y - from.y) * i) / 10) })
  }
  await frame()
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(to.x, to.y) })
}

/** 一项值格行首的缩进占位（叶子项）的中心：按住它拖的是整行，不进输入框。 */
function grip(panel: HTMLElement, value: string): { x: number, y: number } {
  const spacer = cell(panel, value, 'value').querySelector<HTMLElement>('[data-part="tree-option-spacer"]')!
  const box = spacer.getBoundingClientRect()
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 }
}

const flat: JsonValue = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
  { value: 'c', label: 'C' },
]

const sample: JsonValue = [
  { value: 'east', label: 'East', children: [{ value: 'sh', label: 'Shanghai' }, { value: 'hz', label: 'Hangzhou' }] },
  { value: 'west', label: 'West' },
  { value: 'north', label: 'North' },
]

describe('属性面板的选项树', () => {
  it('表格报 treegrid、名字是属性名，各行报层级与层内位次，格里的控件以「列名 + 大纲号」为名', async () => {
    const { panel } = await mount(sample)
    const grid = page.getByRole('treegrid', { name: 'Options', exact: true }).element()
    const rows = [...grid.querySelectorAll<HTMLElement>('[data-scope="table"][data-part="row"][aria-level]')]
    expect(rows.map(item => [item.getAttribute('aria-level'), item.getAttribute('aria-posinset'), item.getAttribute('aria-setsize')])).toEqual([
      ['1', '1', '3'],
      ['2', '1', '2'],
      ['2', '2', '2'],
      ['1', '2', '3'],
      ['1', '3', '3'],
    ])
    expect(page.getByRole('textbox', { name: 'Value, option 1.2', exact: true }).element()).toHaveProperty('value', 'hz')
    expect(page.getByRole('textbox', { name: 'Label, option 3', exact: true }).element()).toHaveProperty('value', 'North')
    expect(page.getByRole('checkbox', { name: 'Disabled, option 2', exact: true }).element().getAttribute('aria-checked')).toBe('false')
    expect(page.getByRole('button', { name: 'Add a child to option 1.1', exact: true }).element()).toBeTruthy()
    expect(page.getByRole('button', { name: 'Remove option 2', exact: true }).element()).toBeTruthy()
    expect(row(panel, 'east').getAttribute('aria-expanded')).toBe('true')
    expect(row(panel, 'west').hasAttribute('aria-expanded')).toBe(false)
  })

  it('方向键在格子之间走；Enter 进格内编辑，输入框里的左右键归输入框，Esc 回到格子，F2 同样进出', async () => {
    const { panel, written } = await mount(sample)
    cell(panel, 'east', 'value').focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(cell(panel, 'east', 'label'))
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(cell(panel, 'sh', 'label'))
    await userEvent.keyboard('{Enter}')
    const input = page.getByRole('textbox', { name: 'Label, option 1.1', exact: true }).element() as HTMLInputElement
    expect(document.activeElement).toBe(input)
    input.setSelectionRange(input.value.length, input.value.length)
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(document.activeElement).toBe(input)
    expect(input.selectionStart).toBe(input.value.length - 2)
    await userEvent.keyboard('X')
    await until(() => JSON.stringify(written.at(-1)).includes('ShanghXai'), '写回改过的文字')
    await userEvent.keyboard('{Escape}')
    expect(document.activeElement).toBe(cell(panel, 'sh', 'label'))
    await userEvent.keyboard('{F2}')
    expect(document.activeElement).toBe(page.getByRole('textbox', { name: 'Label, option 1.1', exact: true }).element())
    await userEvent.keyboard('{F2}')
    expect(document.activeElement).toBe(cell(panel, 'sh', 'label'))
  })

  it('整张表只占一个 Tab 位：从表外 Tab 进表格、再 Tab 就离开；Enter 进编辑后 Tab 与 Shift + Tab 不出这一格，Esc 退出后控件回到 -1', async () => {
    const { panel } = await mount(sample)
    const before = document.createElement('button')
    before.textContent = 'before'
    wrapper!.prepend(before)
    const grid = page.getByRole('treegrid', { name: 'Options', exact: true }).element()
    const controls = (): HTMLElement[] => [...grid.querySelectorAll<HTMLElement>('[data-scope="table"][data-part="cell"] :is(input, button)')]
    expect(controls().length).toBeGreaterThan(0)
    expect(controls().filter(control => control.tabIndex !== -1)).toEqual([])

    before.focus()
    await userEvent.keyboard('{Tab}')
    expect(grid.contains(document.activeElement)).toBe(true)
    await userEvent.keyboard('{Tab}')
    expect(grid.contains(document.activeElement)).toBe(false)
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Add option', exact: true }).element())

    // 一格一个控件：Tab 与 Shift + Tab 都回到它自己
    cell(panel, 'sh', 'label').focus()
    await userEvent.keyboard('{Enter}')
    const input = page.getByRole('textbox', { name: 'Label, option 1.1', exact: true }).element() as HTMLInputElement
    expect(document.activeElement).toBe(input)
    expect(input.tabIndex).toBeGreaterThanOrEqual(0)
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(input)
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    expect(document.activeElement).toBe(input)
    await userEvent.keyboard('{Escape}')
    expect(document.activeElement).toBe(cell(panel, 'sh', 'label'))
    expect(input.tabIndex).toBe(-1)

    // 操作格两颗钮：Tab 在两颗之间回绕，Esc 退出后都回到 -1
    cell(panel, 'sh', 'actions').focus()
    await userEvent.keyboard('{Enter}')
    const addChild = page.getByRole('button', { name: 'Add a child to option 1.1', exact: true }).element()
    const remove = page.getByRole('button', { name: 'Remove option 1.1', exact: true }).element()
    expect(document.activeElement).toBe(addChild)
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(remove)
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(addChild)
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    expect(document.activeElement).toBe(remove)
    await userEvent.keyboard('{Escape}')
    expect(document.activeElement).toBe(cell(panel, 'sh', 'actions'))
    expect([addChild.tabIndex, remove.tabIndex]).toEqual([-1, -1])
    expect(controls().filter(control => control.tabIndex !== -1)).toEqual([])
  })

  it('按 Alt + 上下键在同一层换序，写回整棵树；连按三次，每次之后焦点都在搬走那一项同一列的格子上，层内位次跟着更新', async () => {
    const south = { value: 'south', label: 'South' }
    const { panel, written } = await mount([...(sample as JsonValue[]), south])
    const [east, west, north] = sample as JsonValue[]
    cell(panel, 'south', 'label').focus()
    const orders = [
      [east, west, south, north],
      [east, south, west, north],
      [south, east, west, north],
    ]
    for (const [step, order] of orders.entries()) {
      await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}')
      await until(() => JSON.stringify(written.at(-1)) === JSON.stringify(order), `第 ${step + 1} 次写回`)
      await until(() => document.activeElement === cell(panel, 'south', 'label'), `第 ${step + 1} 次之后焦点回到搬走那一项的文字格`)
      expect(row(panel, 'south').getAttribute('aria-posinset')).toBe(String(3 - step))
    }
    expect(page.getByRole('textbox', { name: 'Label, option 1', exact: true }).element()).toHaveProperty('value', 'South')
  })

  it('按 Alt + 右键认上一项当上级，Alt + 左键退回上一层，层级跟着更新，焦点留在原来那一格', async () => {
    const { panel, written } = await mount(sample)
    cell(panel, 'north', 'value').focus()
    await userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}')
    await until(() => written.length > 0, '写回')
    expect(written.at(-1)).toEqual([sample[0], { value: 'west', label: 'West', children: [{ value: 'north', label: 'North' }] }])
    await until(() => row(panel, 'north').getAttribute('aria-level') === '2', '层级更新')
    expect(document.activeElement).toBe(cell(panel, 'north', 'value'))
    expect(row(panel, 'west').getAttribute('aria-expanded')).toBe('true')
    await userEvent.keyboard('{Alt>}{ArrowLeft}{/Alt}')
    await until(() => written.length > 1, '再写回')
    expect(written.at(-1)).toEqual(sample)
    await until(() => row(panel, 'north').getAttribute('aria-level') === '1', '层级退回')
    expect(document.activeElement).toBe(cell(panel, 'north', 'value'))
  })

  it('平铺的各项也是树：表格报 treegrid、各行报第 1 层，叶子项不带 aria-expanded；Alt + 右键把第 2、3 项依次缩进到第 1 项下面', async () => {
    const { panel, written } = await mount(flat)
    expect(panel.querySelector('[data-scope="table"][data-part="root"]')!.getAttribute('role')).toBe('treegrid')
    expect(['a', 'b', 'c'].map(value => [row(panel, value).getAttribute('aria-level'), row(panel, value).hasAttribute('aria-expanded')])).toEqual([['1', false], ['1', false], ['1', false]])
    cell(panel, 'b', 'value').focus()
    await userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}')
    await until(() => written.length > 0, '写回')
    expect(written.at(-1)).toEqual([{ value: 'a', label: 'A', children: [{ value: 'b', label: 'B' }] }, { value: 'c', label: 'C' }])
    await until(() => row(panel, 'b').getAttribute('aria-level') === '2', 'b 到第 2 层')
    expect(document.activeElement).toBe(cell(panel, 'b', 'value'))
    expect(row(panel, 'a').getAttribute('aria-expanded')).toBe('true')
    cell(panel, 'c', 'value').focus()
    await userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}')
    await until(() => written.length > 1, '再写回')
    expect(written.at(-1)).toEqual([{ value: 'a', label: 'A', children: [{ value: 'b', label: 'B' }, { value: 'c', label: 'C' }] }])
    await until(() => row(panel, 'c').getAttribute('aria-level') === '2', 'c 到第 2 层')
    expect(['b', 'c'].map(value => row(panel, value).hasAttribute('aria-expanded'))).toEqual([false, false])
  })

  it('真实鼠标把一项拖到叶子项的中段就放进它下面，写回整棵树', async () => {
    const { panel, written } = await mount(flat)
    const target = row(panel, 'a').getBoundingClientRect()
    await drag(grip(panel, 'c'), { x: grip(panel, 'a').x, y: target.top + target.height / 2 })
    await until(() => written.length > 0, '写回')
    expect(written.at(-1)).toEqual([{ value: 'a', label: 'A', children: [{ value: 'c', label: 'C' }] }, { value: 'b', label: 'B' }])
    await until(() => row(panel, 'c').getAttribute('aria-level') === '2', 'c 到第 2 层')
  })

  it('加子项在这一项的下级末尾加一项、焦点落到它的值上；新增在顶层末尾加一项；删除连同下级一起删掉', async () => {
    const { panel, written } = await mount(sample)
    await userEvent.click(page.getByRole('button', { name: 'Add a child to option 2', exact: true }).element())
    await until(() => written.length > 0, '写回')
    expect(written.at(-1)).toEqual([sample[0], { value: 'west', label: 'West', children: [{ value: '' }] }, { value: 'north', label: 'North' }])
    await until(() => document.activeElement === page.getByRole('textbox', { name: 'Value, option 2.1', exact: true }).element(), '焦点落到新一项的值上')
    await userEvent.keyboard('w1')
    await until(() => JSON.stringify(written.at(-1)).includes('"w1"'), '写回新一项的值')

    await userEvent.click(page.getByRole('button', { name: 'Add option', exact: true }).element())
    await until(() => (written.at(-1) as unknown[]).length === 4, '顶层多一项')
    expect((written.at(-1) as unknown[])[3]).toEqual({ value: '' })
    await until(() => document.activeElement === page.getByRole('textbox', { name: 'Value, option 4', exact: true }).element(), '焦点落到顶层新一项的值上')

    await userEvent.click(page.getByRole('button', { name: 'Remove option 1', exact: true }).element())
    await until(() => (written.at(-1) as { value: string }[])[0]!.value === 'west', '删掉第一项')
    expect(written.at(-1)).toEqual([{ value: 'west', label: 'West', children: [{ value: 'w1' }] }, { value: 'north', label: 'North' }, { value: '' }])
    expect(panel.querySelectorAll('[data-scope="table"][data-part="row"][aria-level="2"]')).toHaveLength(1)
  })

  describe('换位以后表格的播报区读出放进了哪一层、在那一层的第几位（项以文字为名）', () => {
    /** 焦点放到这一项的值格上，按 Alt 加方向键，等写回以后读表格的播报区。 */
    async function moveBy(options: JsonValue, value: string, key: string): Promise<string> {
      const { panel, written } = await mount(options)
      cell(panel, value, 'value').focus()
      await userEvent.keyboard(`{Alt>}{${key}}{/Alt}`)
      await until(() => written.length > 0, '写回')
      const live = panel.querySelector<HTMLElement>('[data-scope="table"][data-part="live-region"]')!
      await until(() => (live.textContent ?? '') !== '', '播报区有字')
      return live.textContent!
    }

    it('按 Alt + 右键放进上一项下面：说放进了上一项，是它下面的第 1 位、共 1 项', async () => {
      expect(await moveBy(flat, 'b', 'ArrowRight')).toBe('Moved B into A, position 1 of 1.')
    })

    it('按 Alt + 上键在同一层里往前挪：说还在上级里，位次与总数按那一层的兄弟项', async () => {
      expect(await moveBy(sample, 'hz', 'ArrowUp')).toBe('Moved Hangzhou into East, position 1 of 2.')
    })

    it('按 Alt + 左键移到根层：说放到了顶层，排在原来的上级后面', async () => {
      expect(await moveBy(sample, 'sh', 'ArrowLeft')).toBe('Moved Shanghai into the top level, position 2 of 4.')
    })
  })

  it('左键收起有下级的一项，子项不在表体里；再展开时格里的值还在', async () => {
    const { panel } = await mount(sample)
    row(panel, 'east').focus()
    await userEvent.keyboard('{ArrowLeft}')
    await until(() => row(panel, 'east').getAttribute('aria-expanded') === 'false', '收起')
    expect(panel.querySelectorAll('[data-scope="table"][data-part="row"][aria-level="2"]')).toHaveLength(0)
    await userEvent.keyboard('{ArrowRight}')
    await until(() => row(panel, 'east').getAttribute('aria-expanded') === 'true', '展开')
    expect(page.getByRole('textbox', { name: 'Label, option 1.2', exact: true }).element()).toHaveProperty('value', 'Hangzhou')
  })

  it('里层某一项的值出错：问题标在那一格的输入框上，aria-invalid 与描述都落在那里', async () => {
    const { panel } = await mount(sample, { errors: [{ path: ['data', 'options', 0, 'children', 1, 'value'], message: 'Duplicate value' }] })
    const input = page.getByRole('textbox', { name: 'Value, option 1.2', exact: true }).element()
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(description(input)).toContain('Duplicate value')
    const others = [...panel.querySelectorAll('[data-scope="table"][data-part="cell"] input')].filter(item => item !== input)
    expect(others.map(item => item.getAttribute('aria-invalid'))).not.toContain('true')
  })

  it('290px、分组可折叠、中文的面板里：表格横向滚动、不撑出面板，操作列钉在行尾，展开把手与值框对齐，页面不横向溢出', async () => {
    const { panel } = await mount(sample, { width: 290, zh: true })
    const grid = page.getByRole('treegrid', { name: '选项', exact: true }).element() as HTMLElement
    expect(grid.getBoundingClientRect().right).toBeLessThanOrEqual(panel.getBoundingClientRect().right + 0.5)
    expect(grid.scrollWidth).toBeGreaterThan(grid.clientWidth)
    // 操作列钉在行尾：各行的加子项与删除钮都在表格的可见范围里
    const bounds = grid.getBoundingClientRect()
    for (const button of panel.querySelectorAll('[data-scope="designer-properties"]:is([data-part="tree-option-add-child"], [data-part="tree-option-remove"])')) {
      const rect = button.getBoundingClientRect()
      expect(rect.width).toBeGreaterThan(0)
      expect(rect.left).toBeGreaterThanOrEqual(bounds.left - 0.5)
      expect(rect.right).toBeLessThanOrEqual(bounds.right + 0.5)
    }
    // 格里的字段不留错误文案的占位：展开把手与值框在同一条中线上
    const trigger = row(panel, 'east').querySelector('[data-scope="table"][data-part="expand-trigger"]')!.getBoundingClientRect()
    const input = cell(panel, 'east', 'value').querySelector('input')!.getBoundingClientRect()
    expect(Math.abs((trigger.top + trigger.bottom) / 2 - (input.top + input.bottom) / 2)).toBeLessThanOrEqual(1)
    expect(page.getByRole('button', { name: '给第 1.1 项加子项', exact: true }).element()).toBeTruthy()
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth)
  })
})

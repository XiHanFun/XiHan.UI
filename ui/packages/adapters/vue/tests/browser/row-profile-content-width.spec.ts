// 接 Action Control row 档的条目按内容收宽：RadioGroup / CheckboxGroup 的条目与全选格横排时排在同一行、
// 竖排时不铺满整行，Steps 的触发器按内容收宽、连接线拿走余下的长度。
//
// 有层产物 index.css 与无层产物 index.unlayered.css 各挂一个只引其中一份的 iframe，分别量几何。
import type { App, VNode } from 'vue'
import layeredUrl from '@xihan-ui/styles/index.css?url'
import unlayeredUrl from '@xihan-ui/styles/index.unlayered.css?url'
import tokensUrl from '@xihan-ui/tokens/tokens.css?url'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
  XhCheckboxGroupSelectAllTrigger,
  XhRadioGroupRoot,
  XhStepsDescription,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from '../../src'

const SHEETS = {
  layered: layeredUrl,
  unlayered: unlayeredUrl,
} as const

type Sheet = keyof typeof SHEETS

const SHEET_NAMES = Object.keys(SHEETS) as Sheet[]

const CHANNELS = [
  { value: 'email', label: '邮件' },
  { value: 'sms', label: '短信' },
  { value: 'push', label: '推送通知' },
]

let frame: HTMLIFrameElement | null = null

afterEach(() => {
  frame?.remove()
  frame = null
})

/** 用 Vue 挂出带 connect 全部属性的真实 DOM，序列化成静态标记后卸载。 */
async function serialize(render: () => VNode): Promise<string> {
  const host = document.createElement('div')
  document.body.append(host)
  const app: App = createApp({ render })
  app.mount(host)
  await nextTick()
  await nextTick()
  const markup = host.innerHTML
  app.unmount()
  host.remove()
  return markup
}

/** 把标记装进只引一份产物的 960px 宽 iframe，样式表装载完再交出文档。 */
async function stage(markup: string, sheet: Sheet): Promise<Document> {
  frame = document.createElement('iframe')
  frame.style.cssText = 'width: 960px; height: 600px; border: 0'
  document.body.append(frame)
  const doc = frame.contentDocument
  if (!doc)
    throw new Error('iframe 没有文档')
  doc.documentElement.setAttribute('data-theme', 'light')
  doc.documentElement.setAttribute('dir', 'ltr')
  doc.documentElement.setAttribute('lang', 'zh-CN')

  const loaded: Promise<void>[] = []
  for (const href of [tokensUrl, SHEETS[sheet]]) {
    const link = doc.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    loaded.push(new Promise((resolve, reject) => {
      link.addEventListener('load', () => resolve())
      link.addEventListener('error', () => reject(new Error(`样式表装不上：${href}`)))
    }))
    doc.head.append(link)
  }
  const still = doc.createElement('style')
  still.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }'
  doc.head.append(still)
  doc.body.style.margin = '0'
  doc.body.innerHTML = markup
  await Promise.all(loaded)
  return doc
}

function parts(doc: Document, scope: string, part: string): HTMLElement[] {
  return [...doc.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${part}"]`)]
}

/** 盒内在流内容（文字与非绝对定位的子元素）的行向末端。 */
function contentEnd(el: HTMLElement): number {
  const doc = el.ownerDocument
  const view = doc.defaultView!
  let end = Number.NEGATIVE_INFINITY
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const range = doc.createRange()
      range.selectNodeContents(node)
      const rect = range.getBoundingClientRect()
      if (rect.width > 0)
        end = Math.max(end, rect.right)
    }
    else if (node.nodeType === Node.ELEMENT_NODE && view.getComputedStyle(node as Element).position !== 'absolute') {
      end = Math.max(end, (node as Element).getBoundingClientRect().right)
    }
  }
  return end
}

/** 条目都与第一条在块向上重叠，即排在同一行。 */
function expectOneLine(items: HTMLElement[]): void {
  const first = items[0]!.getBoundingClientRect()
  for (const item of items) {
    const rect = item.getBoundingClientRect()
    expect(rect.top < first.bottom && rect.bottom > first.top, `「${item.textContent}」折到了下一行`).toBe(true)
  }
}

/** 条目窄于根，行向末端贴着内容。 */
function expectContentWidth(items: HTMLElement[], root: HTMLElement): void {
  const rootWidth = root.getBoundingClientRect().width
  for (const item of items) {
    const rect = item.getBoundingClientRect()
    expect(rect.width, `「${item.textContent}」铺满了根宽`).toBeLessThan(rootWidth)
    expect(rect.right - contentEnd(item), `「${item.textContent}」的末端没有贴着内容`).toBeLessThanOrEqual(0.5)
  }
}

describe('row 档条目按内容收宽', () => {
  it.each(SHEET_NAMES)('radio-group 横排条目排在同一行、宽度按内容（%s）', async (sheet) => {
    const markup = await serialize(() => h(XhRadioGroupRoot, {
      collection: CHANNELS,
      defaultValue: 'email',
      label: '通知渠道',
      orientation: 'horizontal',
    }))
    const doc = await stage(markup, sheet)
    const root = parts(doc, 'radio-group', 'root')[0]!
    const items = parts(doc, 'radio-group', 'item')
    expect(items).toHaveLength(CHANNELS.length)
    expect(items.every(item => item.getAttribute('data-xh-action-profile') === 'row')).toBe(true)

    expectOneLine(items)
    expectContentWidth(items, root)
  })

  /** 全选格 + 三条条目的 CheckboxGroup，返回根与按 DOM 顺序的各行。 */
  async function stageCheckboxGroup(sheet: Sheet, orientation: 'horizontal' | 'vertical'): Promise<{ root: HTMLElement, rows: HTMLElement[] }> {
    const markup = await serialize(() => h(XhCheckboxGroupRoot, {
      defaultValue: ['email'],
      itemValues: CHANNELS.map(channel => channel.value),
      orientation,
    }, () => [
      h(XhCheckboxGroupLabel, null, () => '通知渠道'),
      h(XhCheckboxGroupSelectAllTrigger, null, () => '全选'),
      ...CHANNELS.map(channel => h(XhCheckboxGroupItem, { key: channel.value, value: channel.value }, () => [
        h(XhCheckboxGroupIndicator),
        h(XhCheckboxGroupItemText, null, () => channel.label),
      ])),
    ]))
    const doc = await stage(markup, sheet)
    const rows = [...parts(doc, 'checkbox-group', 'select-all-trigger'), ...parts(doc, 'checkbox-group', 'item')]
    expect(rows).toHaveLength(CHANNELS.length + 1)
    expect(rows.every(row => row.getAttribute('data-xh-action-profile') === 'row')).toBe(true)
    return { root: parts(doc, 'checkbox-group', 'root')[0]!, rows }
  }

  it.each(SHEET_NAMES)('checkbox-group 横排的全选格与条目排在同一行、宽度按内容（%s）', async (sheet) => {
    const { root, rows } = await stageCheckboxGroup(sheet, 'horizontal')
    expectOneLine(rows)
    expectContentWidth(rows, root)
  })

  it.each(SHEET_NAMES)('checkbox-group 竖排的全选格与条目宽度按内容（%s）', async (sheet) => {
    const { root, rows } = await stageCheckboxGroup(sheet, 'vertical')
    expectContentWidth(rows, root)
  })

  it.each(SHEET_NAMES)('steps 横排触发器按内容收宽、连接线拿走余下长度（%s）', async (sheet) => {
    const markup = await serialize(() => h(XhStepsRoot, { count: 3, defaultValue: 1 }, () => h(XhStepsList, null, () => [0, 1, 2].map(index =>
      h(XhStepsItem, { key: index, value: index }, () => [
        h(XhStepsTrigger, null, () => [
          h(XhStepsIndicator, null, () => String(index + 1)),
          h(XhStepsTitle, null, () => `步骤 ${index + 1}`),
          h(XhStepsDescription, null, () => '说明'),
        ]),
        h(XhStepsSeparator),
      ])))))
    const doc = await stage(markup, sheet)
    const view = doc.defaultView!
    const triggers = parts(doc, 'steps', 'trigger')
    expect(triggers).toHaveLength(3)
    expect(triggers.every(trigger => trigger.getAttribute('data-xh-action-profile') === 'row')).toBe(true)

    for (const trigger of triggers) {
      const style = view.getComputedStyle(trigger)
      expect(style.display, `「${trigger.textContent}」没有排成序号 + 标题 / 说明两列`).toBe('grid')
      const end = trigger.getBoundingClientRect().right - Number.parseFloat(style.paddingInlineEnd)
      expect(end - contentEnd(trigger), `「${trigger.textContent}」的末端没有贴着内容`).toBeLessThanOrEqual(0.5)
    }

    const separators = parts(doc, 'steps', 'separator').filter(separator => view.getComputedStyle(separator).display !== 'none')
    expect(separators).toHaveLength(2)
    for (const separator of separators) {
      const minLength = Number.parseFloat(view.getComputedStyle(separator).minInlineSize)
      expect(separator.getBoundingClientRect().width, '连接线被压到了最小长度').toBeGreaterThan(minLength)
    }
  })
})

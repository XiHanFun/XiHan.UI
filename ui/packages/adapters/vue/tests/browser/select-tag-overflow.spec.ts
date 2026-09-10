// 多选把选中项摆成标签时，触发器是一行控件：标签越选越多，盒不许被撑高，也不许让标签冲出盒外。
// 摆不下的折成 +N 那一枚；行还是装不下时各枚标签缩短带省略号，+N 始终看得见。
//
// 只有真实浏览器量得出来：盒高、标签的右缘与盒的右缘都是布局结果，jsdom 不排版。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectList,
  XhSelectOverflowTag,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTag,
  XhSelectTagList,
  XhSelectTrigger,
  XhSelectValueText,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function teardown() {
  app?.unmount()
  host?.remove()
  app = null
  host = null
}

afterEach(() => teardown())

interface Bag {
  tags: Array<{ value: string, label: string }>
}

const OPTIONS = Array.from({ length: 40 }, (_, i) => ({ value: `v${i + 1}`, label: `选项${i + 1}` }))
const LONG_OPTIONS = Array.from({ length: 6 }, (_, i) => ({ value: `l${i + 1}`, label: `很长很长的选项名称第${i + 1}个` }))

/** 在一条定宽的栏里挂一个多选：触发器里摆标签行，选中前 picked 项。 */
async function mountTags(picked: number, width: number, opts: { maxTagCount?: number, options?: typeof OPTIONS } = {}): Promise<void> {
  const options = opts.options ?? OPTIONS
  host = document.createElement('div')
  host.style.cssText = `inline-size: ${width}px`
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhSelectRoot, {
      collection: options,
      multiple: true,
      placeholder: '请选择',
      maxTagCount: opts.maxTagCount,
      defaultValue: options.slice(0, picked).map(o => o.value),
    }, {
      default: (bag: Bag) => [
        h(XhSelectControl, null, () => [
          h(XhSelectTrigger, null, () => [
            h(XhSelectValueText),
            h(XhSelectTagList, null, () => [
              ...bag.tags.map(t => h(XhSelectTag, { key: t.value, value: t.value }, () => t.label)),
              h(XhSelectOverflowTag),
            ]),
            h(XhSelectIndicator),
          ]),
        ]),
        h(XhSelectPositioner, null, () => [
          h(XhSelectContent, null, () => h(XhSelectList, null, () => options.map(o =>
            h(XhSelectItem, { key: o.value, value: o.value }, () => [h(XhSelectItemText, () => o.label), h(XhSelectItemIndicator)]),
          ))),
        ]),
      ],
    }),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(name: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='select'][data-part='${name}']`)
  if (!el)
    throw new Error(`挂载树里没有 ${name}`)
  return el
}

function parts(name: string): HTMLElement[] {
  return Array.from(host?.querySelectorAll<HTMLElement>(`[data-scope='select'][data-part='${name}']`) ?? [])
}

/** 令牌当下解析成多少像素。 */
function tokenPx(name: string): number {
  const probe = document.createElement('div')
  probe.style.cssText = `position:absolute;visibility:hidden;block-size:var(${name})`
  document.body.append(probe)
  const px = probe.getBoundingClientRect().height
  probe.remove()
  return Math.round(px)
}

const rect = (el: HTMLElement) => el.getBoundingClientRect()

describe('多选标签：盒高不随标签数变', () => {
  it('0、3、10、30 枚都是一行控件高', async () => {
    const h = tokenPx('--xh-control-h-md')
    for (const picked of [0, 3, 10, 30]) {
      await mountTags(picked, 320)
      expect(Math.round(rect(part('control')).height), `${picked} 枚`).toBe(h)
      teardown()
    }
  })
})

describe('多选标签：不给 maxTagCount 时最多摆 3 枚，其余折成 +N', () => {
  it('选中 10 项：标签行里 3 枚标签 + 一枚 +7', async () => {
    await mountTags(10, 320)
    expect(parts('tag')).toHaveLength(3)
    const overflow = part('overflow-tag')
    expect(overflow.hidden).toBe(false)
    expect(overflow.textContent).toBe('+7')
    expect(rect(overflow).width).toBeGreaterThan(0)
  })

  it('选中 3 项：一枚都不折，+N 收起不留空位', async () => {
    await mountTags(3, 320)
    expect(parts('tag')).toHaveLength(3)
    const overflow = part('overflow-tag')
    expect(overflow.hidden).toBe(true)
    expect(getComputedStyle(overflow).display).toBe('none')
  })

  /** 标签行、每枚标签与 +N 的右缘都不越过盒的右缘。 */
  function expectInsideControl(label: string): void {
    const control = rect(part('control'))
    expect(rect(part('tag-list')).right, `${label}：标签行`).toBeLessThanOrEqual(control.right)
    expect(rect(part('overflow-tag')).right, `${label}：+N`).toBeLessThanOrEqual(control.right)
    for (const tag of parts('tag'))
      expect(rect(tag).right, `${label}：${tag.textContent}`).toBeLessThanOrEqual(control.right)
  }

  it('320px 栏里 10 枚、30 枚都不冲出盒：标签行与 +N 的右缘都在盒的右缘之内', async () => {
    for (const picked of [10, 30]) {
      await mountTags(picked, 320)
      expectInsideControl(`${picked} 枚`)
      teardown()
    }
  })

  it('三枚长标签在 192px 的最小盒里也不冲出盒', async () => {
    await mountTags(6, 192, { options: LONG_OPTIONS })
    expectInsideControl('长标签')
  })

  it('展开箭头留在盒里，不被标签挤出去', async () => {
    await mountTags(30, 320)
    const control = rect(part('control'))
    const indicator = rect(part('indicator'))
    expect(indicator.right).toBeLessThanOrEqual(control.right)
    expect(indicator.left).toBeGreaterThan(rect(part('tag-list')).right - 1)
  })
})

describe('多选标签：行装不下时标签各自缩短，+N 不缩', () => {
  it('192px 的最小盒里三枚长标签都带省略号，+N 完整可见', async () => {
    await mountTags(6, 192, { options: LONG_OPTIONS })
    const control = rect(part('control'))
    for (const tag of parts('tag')) {
      expect(getComputedStyle(tag).textOverflow).toBe('ellipsis')
      expect(tag.scrollWidth, tag.textContent ?? '').toBeGreaterThan(tag.clientWidth)
      expect(rect(tag).width).toBeGreaterThan(0)
    }
    const overflow = part('overflow-tag')
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth)
    expect(rect(overflow).right).toBeLessThanOrEqual(control.right)
    expect(overflow.textContent).toBe('+3')
  })

  it('装得下时标签一枚都不缩', async () => {
    await mountTags(3, 600)
    for (const tag of parts('tag'))
      expect(tag.scrollWidth, tag.textContent ?? '').toBeLessThanOrEqual(tag.clientWidth)
  })
})

describe('多选标签：标签行与占位文字不同屏', () => {
  it('无选中：标签行 hidden，value-text 显示占位文字', async () => {
    await mountTags(0, 320)
    expect(part('tag-list').hidden).toBe(true)
    expect(getComputedStyle(part('tag-list')).display).toBe('none')
    expect(getComputedStyle(part('value-text')).display).not.toBe('none')
    expect(part('value-text').textContent).toBe('请选择')
  })

  it('有选中：标签行露面，value-text 让位但仍在 DOM 里给可及名', async () => {
    await mountTags(2, 320)
    expect(part('tag-list').hidden).toBe(false)
    expect(getComputedStyle(part('value-text')).display).toBe('none')
    expect(part('value-text').textContent).toBe('选项1, 选项2')
    expect(part('trigger').getAttribute('aria-labelledby')).toContain(part('value-text').id)
  })
})

describe('多选标签：maxTagCount 显式给定', () => {
  it('给 5 就摆 5 枚，第 6 个起折', async () => {
    await mountTags(10, 600, { maxTagCount: 5 })
    expect(parts('tag')).toHaveLength(5)
    expect(part('overflow-tag').textContent).toBe('+5')
  })
})

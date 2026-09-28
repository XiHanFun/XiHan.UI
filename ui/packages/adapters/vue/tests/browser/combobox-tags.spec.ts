// 多选组合框把已选项摆成一行标签，排在盒里、输入框之前：与 Select 同一套呈现（maxTagCount、+N、列表动效）。
// 盒是一行字段：标签越选越多，盒不许被撑高，标签不许冲出盒外，输入框始终留出打字的一截；
// 标签里的删除钮按下不夺焦，删完焦点仍在输入框。
//
// 只有真实浏览器量得出来：盒高、标签与输入框的边缘都是布局结果，动画是否在播也得真跑 CSS。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhComboboxRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function teardown(): void {
  app?.unmount()
  host?.remove()
  app = null
  host = null
}

afterEach(() => teardown())

const CITIES = ['北京', '上海', '广州', '深圳', '成都', '杭州'].map(label => ({ value: label, label }))
const LONG = Array.from({ length: 4 }, (_, i) => ({ value: `l${i}`, label: `很长很长很长的城市名称第${i + 1}个` }))

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

/** 在一条定宽的栏里挂一个按 collection 自动铺开的多选组合框。 */
async function mountCombobox(picked: readonly string[], opts: { width?: number, collection?: typeof CITIES } = {}): Promise<{ value: { value: string[] } }> {
  host = document.createElement('div')
  host.style.inlineSize = `${opts.width ?? 320}px`
  document.body.append(host)
  const value = ref([...picked])
  app = createApp({
    render: () => h(XhComboboxRoot, {
      'collection': opts.collection ?? CITIES,
      'multiple': true,
      'label': '常去城市',
      'style': 'inline-size: 100%',
      'value': value.value,
      'onUpdate:value': (next: string[]) => {
        value.value = next
      },
    }),
  })
  app.mount(host)
  await settle()
  return { value }
}

function part(name: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='combobox'][data-part='${name}']`)
  if (!el)
    throw new Error(`挂载树里没有 ${name}`)
  return el
}

const TAG_ROOT = `[data-scope='tag'][data-part='root']`

/** 标签行里的标签（不含 +N、不含正在离场的替身），文档序。 */
function tags(): HTMLElement[] {
  return [...part('control').querySelectorAll<HTMLElement>(`[data-part='tag-list'] > ${TAG_ROOT}[data-value]:not([inert])`)]
}

function overflowTag(): HTMLElement {
  const el = part('control').querySelector<HTMLElement>(`${TAG_ROOT}[data-count]`)
  if (!el)
    throw new Error('标签行里没有 +N 那一枚')
  return el
}

function tokenPx(name: string): number {
  const probe = document.createElement('div')
  probe.style.cssText = `position:absolute;visibility:hidden;inline-size:var(${name})`
  document.body.append(probe)
  const px = probe.getBoundingClientRect().width
  probe.remove()
  return Math.round(px)
}

function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => a.animationName)
}

const rect = (el: HTMLElement): DOMRect => el.getBoundingClientRect()

describe('多选组合框：已选项在输入框前排成标签', () => {
  it('无选中时标签行收起；选中后标签排在输入框之前，文字是选项的名字', async () => {
    await mountCombobox([])
    expect(getComputedStyle(part('tag-list')).display).toBe('none')
    teardown()
    await mountCombobox(['上海', '北京'])
    expect(tags().map(tag => tag.textContent)).toEqual(['上海', '北京'])
    const input = rect(part('input'))
    for (const tag of tags())
      expect(rect(tag).right).toBeLessThanOrEqual(input.left)
  })

  it('盒高不随标签数变：0、2、6 枚都是一行字段高', async () => {
    const heights: number[] = []
    for (const picked of [[], CITIES.slice(0, 2), CITIES]) {
      await mountCombobox(picked.map(city => city.value))
      heights.push(Math.round(rect(part('control')).height))
      teardown()
    }
    expect(new Set(heights).size).toBe(1)
  })

  it('不给 maxTagCount 时最多摆 3 枚，其余折成 +N；标签与 +N 都不越出盒外', async () => {
    await mountCombobox(CITIES.map(city => city.value))
    expect(tags()).toHaveLength(3)
    expect(overflowTag().textContent).toBe('+3')
    const control = rect(part('control'))
    for (const tag of [...tags(), overflowTag()])
      expect(rect(tag).right).toBeLessThanOrEqual(control.right)
  })

  it('标签再长也给输入框留出打字的一截，长标签在自己的 label 里截断', async () => {
    await mountCombobox(LONG.map(city => city.value), { collection: LONG })
    expect(Math.round(rect(part('input')).width)).toBeGreaterThanOrEqual(tokenPx('--xh-control-input-min-w'))
    const label = tags()[0]!.querySelector<HTMLElement>(`[data-scope='tag'][data-part='label']`)!
    expect(label.scrollWidth).toBeGreaterThan(label.clientWidth)
    expect(rect(overflowTag()).right).toBeLessThanOrEqual(rect(part('input')).left)
  })

  it('点标签里的删除钮：焦点留在输入框，那个值被摘掉，标签在原处淡出', async () => {
    const { value } = await mountCombobox(['北京', '上海', '广州'])
    const input = part('input') as HTMLInputElement
    input.focus()
    const remove = tags()[1]!.querySelector<HTMLButtonElement>(`[data-scope='tag'][data-part='close-trigger']`)!
    const down = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 })
    remove.dispatchEvent(down)
    expect(down.defaultPrevented).toBe(true)
    remove.click()
    await nextTick()
    await nextTick()
    expect(value.value).toEqual(['北京', '广州'])
    expect(document.activeElement).toBe(input)
    const ghost = part('tag-list').querySelector<HTMLElement>(`${TAG_ROOT}[data-state='closed'][data-value]`)!
    expect(ghost.textContent).toBe('上海')
    expect(running(ghost)).toEqual(['xh-fade-out'])
  })

  it('首帧就在的标签不播进场；之后新选中的一枚原地弹出', async () => {
    const { value } = await mountCombobox(['北京'])
    for (const tag of tags())
      expect(running(tag)).toEqual([])
    value.value = ['北京', '深圳']
    await nextTick()
    await nextTick()
    expect(running(tags().at(-1)!)).toContain('xh-pop-in')
  })
})

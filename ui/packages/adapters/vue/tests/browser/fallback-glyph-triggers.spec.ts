// 三类部件不写内容时看得见什么，只有真实浏览器答得出来：字形画在伪元素上，
// jsdom 的 getComputedStyle 不解析伪元素里的 var()，量出来恒是空串。
//
// 这三处的共同故障是「摸得着但看不见」——命中区在、aria-label 在、画面上什么都没有：
// 拖拽把手是一块透明方块，回到底部按钮是一枚空胶囊，形态钮是并排的几个一模一样的空方块。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhFloatingPanelContent,
  XhFloatingPanelHeader,
  XhFloatingPanelPositioner,
  XhFloatingPanelRoot,
  XhFloatingPanelStageTrigger,
  XhFloatingPanelTitle,
  XhLogContent,
  XhLogLine,
  XhLogRoot,
  XhLogScrollButton,
  XhLogViewport,
  XhSortableItem,
  XhSortableItemDragTrigger,
  XhSortableRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(render: () => unknown): HTMLElement {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  return host
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

/** 浮层被搬到 portal 落点，不再是 host 的后代，一律从文档里找。 */
function part(scope: string, name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)
  if (!el)
    throw new Error(`找不到部件：${scope}/${name}`)
  return el
}

/** 伪元素上真正生效的那张 mask 图。 */
function maskOf(el: HTMLElement, pseudo: '::before' | '::after' = '::before'): string {
  const style = getComputedStyle(el, pseudo)
  return style.maskImage || style.webkitMaskImage || ''
}

describe('拖拽把手画得出抓手', () => {
  function mountSortable(slotted = false) {
    const ids = ['甲', '乙']
    return mount(() => h(XhSortableRoot, { ids }, () => ids.map(id =>
      h(XhSortableItem, { key: id, itemId: id }, () => [
        slotted ? h(XhSortableItemDragTrigger, { itemId: id }, () => '拖') : h(XhSortableItemDragTrigger, { itemId: id }),
        h('span', id),
      ]))))
  }

  it('不写内容时画两条竖线，占得出面积', async () => {
    mountSortable()
    await nextTick()
    const grip = getComputedStyle(part('sortable', 'item-drag-trigger'), '::after')

    expect(grip.content).not.toBe('none')
    expect(Number.parseFloat(grip.inlineSize)).toBeGreaterThan(0)
    expect(Number.parseFloat(grip.blockSize)).toBeGreaterThan(0)
    // 两条线就是左右两侧的描边，缺一条抓手就成了一条竖杠
    expect(Number.parseFloat(grip.borderInlineStartWidth)).toBeGreaterThan(0)
    expect(Number.parseFloat(grip.borderInlineEndWidth)).toBeGreaterThan(0)
  })

  it('作者塞了内容就让位，不再画抓手', async () => {
    mountSortable(true)
    await nextTick()
    expect(part('sortable', 'item-drag-trigger').textContent).toBe('拖')
    expect(getComputedStyle(part('sortable', 'item-drag-trigger'), '::after').content).toBe('none')
  })
})

describe('日志的回到底部按钮画得出箭头', () => {
  function mountLog(slotted = false) {
    return mount(() => h(XhLogRoot, { rows: 4 }, () => [
      h(XhLogViewport, null, () => h(XhLogContent, null, () =>
        Array.from({ length: 30 }, (_, i) => h(XhLogLine, { key: i }, () => `12:00:0${i % 10}  第 ${i} 行`)))),
      slotted ? h(XhLogScrollButton, null, () => '回到最新') : h(XhLogScrollButton),
    ]))
  }

  it('不写内容时画一枚字形，且那张图是真的取到了', async () => {
    mountLog()
    await nextTick()
    expect(maskOf(part('log', 'scroll-button'))).toContain('data:image/svg')
  })

  it('字形盒与作者塞的图标同一把尺：--xh-icon-size 在 root 上声明了', async () => {
    mountLog()
    await nextTick()
    expect(getComputedStyle(part('log', 'root')).getPropertyValue('--xh-icon-size').trim()).not.toBe('')

    const box = getComputedStyle(part('log', 'scroll-button'), '::before')
    expect(Number.parseFloat(box.inlineSize)).toBeGreaterThan(0)
    expect(box.inlineSize).toBe(box.blockSize)
  })

  it('作者塞了文字就让位，不再画字形', async () => {
    mountLog(true)
    await nextTick()
    expect(part('log', 'scroll-button').textContent).toBe('回到最新')
    expect(maskOf(part('log', 'scroll-button'))).not.toContain('data:image/svg')
  })
})

describe('形态钮按它切到哪一档换字形', () => {
  function mountPanel() {
    return mount(() => h(XhFloatingPanelRoot, { defaultOpen: true }, () => [
      h(XhFloatingPanelPositioner, null, () => h(XhFloatingPanelContent, null, () => [
        h(XhFloatingPanelHeader, null, () => [
          h(XhFloatingPanelTitle, null, () => '播放器'),
          h(XhFloatingPanelStageTrigger, { stage: 'minimized' }),
          h(XhFloatingPanelStageTrigger, { stage: 'maximized' }),
        ]),
      ])),
    ]))
  }

  function stageMasks(): string[] {
    return [...document.querySelectorAll<HTMLElement>('[data-scope="floating-panel"][data-part="stage-trigger"]')]
      .map(el => maskOf(el))
  }

  it('并排的两颗钮各画一枚字形，且两枚不是同一张图', async () => {
    mountPanel()
    await nextTick()
    await nextTick()
    const masks = stageMasks()

    expect(masks).toHaveLength(2)
    for (const mask of masks)
      expect(mask).toContain('data:image/svg')
    // 同一张图说明分档没生效，标题栏上按哪颗全靠猜
    expect(masks[0]).not.toBe(masks[1])
  })

  it('字形只随 data-target-stage 走，不随按下态翻面', async () => {
    mountPanel()
    await nextTick()
    await nextTick()
    const before = stageMasks()

    const maximize = document.querySelector<HTMLElement>('[data-part="stage-trigger"][data-target-stage="maximized"]')!
    maximize.click()
    await nextTick()
    await nextTick()

    expect(maximize.dataset.state).toBe('on')
    // 可访问名由连接层按 target 定死（按下的仍念「铺满面板」），字形跟着按下态改就与名字对不上
    expect(stageMasks()).toEqual(before)
  })
})

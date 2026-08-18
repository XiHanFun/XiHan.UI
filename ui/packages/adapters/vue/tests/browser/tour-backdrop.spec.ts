// 遮罩让位只能在真实浏览器里验：判据是计算后的背景色，jsdom 既不跑级联也不解析 :has()。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhTourBackdrop,
  XhTourContent,
  XhTourPositioner,
  XhTourRoot,
  XhTourSpotlight,
  XhTourTitle,
} from '../../src'
// 皮肤要一起加载：这里查的就是皮肤给出的背景色
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const TRANSPARENT = 'rgba(0, 0, 0, 0)'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

/** 挂一份两步引导：首步锚定页面上的真实元素，末步不锚定。返回控制步序的 ref。 */
function mountTour(): { step: { value: number } } {
  const step = ref(0)
  host = document.createElement('div')
  host.innerHTML = '<button id="tour-backdrop-target">目标</button>'
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhTourRoot, {
      'open': true,
      'step': step.value,
      'steps': [
        { id: 'a', target: '#tour-backdrop-target', title: '锚定步' },
        { id: 'b', target: null, title: '居中步' },
      ],
      'onUpdate:step': (next: number) => { step.value = next },
    }, {
      default: () => [
        h(XhTourBackdrop),
        h(XhTourSpotlight),
        h(XhTourPositioner, null, () => [h(XhTourContent, null, () => [h(XhTourTitle)])]),
      ],
    }),
  })
  app.mount(host)
  return { step }
}

function part(name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='tour'][data-part='${name}']`)
  if (!el)
    throw new Error(`tour 的 ${name} 不在文档里`)
  return el
}

/** 等两拍：定位与量测的效应是 flush: 'post'，要等渲染队列排空之后才跑。 */
async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
}

describe('tour 遮罩让位', () => {
  it('锚定步：高亮框自带那圈暗幕，遮罩必须让位成透明', async () => {
    mountTour()
    await settle()

    expect(part('spotlight').hasAttribute('hidden'), '锚定步应画高亮框').toBe(false)
    expect(getComputedStyle(part('backdrop')).backgroundColor).toBe(TRANSPARENT)
  })

  it('居中步：没有高亮框，遮罩照常压暗', async () => {
    const { step } = mountTour()
    await settle()
    step.value = 1
    await settle()

    expect(part('spotlight').hasAttribute('hidden'), '居中步不画高亮框').toBe(true)
    expect(getComputedStyle(part('backdrop')).backgroundColor).not.toBe(TRANSPARENT)
  })
})

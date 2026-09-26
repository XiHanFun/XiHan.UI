// 减弱动效去位移、留淡变：整幅推入推出的面板在减弱档下不再位移，进出场改由一段淡变表达；
// 转圈停下换成虚线圈，淡入淡出照常。缺省档下这段淡变两端都是不透明、看不出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhClipboardControl, XhClipboardCopyTrigger, XhClipboardRoot, XhDrawerContent, XhDrawerRoot, XhDrawerTitle, XhLayoutContent, XhLayoutRoot, XhLayoutSider } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  delete document.documentElement.dataset.motion
  document.body.innerHTML = ''
})

async function mount(render: () => ReturnType<typeof h>): Promise<void> {
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
}

function part(scope: string, name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)!
}

function running(el: HTMLElement, name: string): Animation {
  const [animation] = el.getAnimations().filter(a => (a as CSSAnimation).animationName === name)
  expect(animation, name).toBeDefined()
  return animation!
}

describe('抽屉的整幅推入', () => {
  async function openDrawer(): Promise<HTMLElement> {
    await mount(() => h(XhDrawerRoot, { defaultOpen: true }, () => [
      h(XhDrawerContent, null, () => [h(XhDrawerTitle, null, () => '设置')]),
    ]))
    return part('drawer', 'content')
  }

  it('缺省档：并列的淡变两端都是不透明，推入过程中面板不变淡', async () => {
    const content = await openDrawer()
    const fade = running(content, 'xh-slide-fade-in')
    fade.pause()
    fade.currentTime = 0
    expect(getComputedStyle(content).opacity).toBe('1')
  })

  it('减弱动效：不再位移，改为 120ms 淡入', async () => {
    document.documentElement.dataset.motion = 'reduce'
    const content = await openDrawer()
    const slide = running(content, 'xh-slide-in')
    const fade = running(content, 'xh-slide-fade-in')
    expect(fade.effect?.getComputedTiming().endTime).toBe(120)
    slide.pause()
    fade.pause()
    slide.currentTime = 0
    fade.currentTime = 0
    expect(getComputedStyle(content).translate).toBe('0px')
    expect(getComputedStyle(content).opacity).toBe('0')
  })
})

describe('布局覆盖档侧栏的整幅推出', () => {
  it('减弱动效：收起时不再位移，改为淡出，淡完才藏起', async () => {
    document.documentElement.dataset.motion = 'reduce'
    const collapsed = ref(false)
    await mount(() => h(XhLayoutRoot, { siderCollapsed: collapsed.value, siderPresentation: 'sheet' } as Record<string, unknown>, () => [
      h(XhLayoutSider, null, () => '侧栏'),
      h(XhLayoutContent, null, () => '内容'),
    ]))
    const sider = part('layout', 'sider')
    collapsed.value = true
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))

    const style = getComputedStyle(sider)
    expect(style.translate).toBe('0px')
    const fade = sider.getAnimations().find(a => (a as CSSTransition).transitionProperty === 'opacity')
    expect(fade, '收起时应有一段不透明度过渡').toBeDefined()
    expect(fade!.effect?.getComputedTiming().endTime).toBe(120)
    expect(style.visibility).toBe('visible')
  })
})

describe('复制钮在途的圆环', () => {
  it('减弱动效：圆环不转、换成虚线，延迟之后照常淡入', async () => {
    document.documentElement.dataset.motion = 'reduce'
    await mount(() => h(XhClipboardRoot, { value: 'xh' }, () => [
      h(XhClipboardControl, null, () => [h(XhClipboardCopyTrigger, null, () => '复制')]),
    ]))
    const trigger = part('clipboard', 'copy-trigger')
    // 写剪贴板要真实权限，headless 下拿不到；这一档皮肤只认属性，直接把状态摆上去
    part('clipboard', 'root').setAttribute('data-state', 'copying')
    trigger.setAttribute('data-state', 'copying')
    trigger.setAttribute('aria-busy', 'true')

    const ring = getComputedStyle(trigger, '::before')
    expect(ring.animationName).toBe('xh-fade-in')
    expect(ring.borderTopStyle).toBe('dotted')
    await new Promise<void>(resolve => setTimeout(resolve, 400))
    expect(Number.parseFloat(getComputedStyle(trigger, '::before').opacity)).toBeGreaterThan(0.9)
  })
})

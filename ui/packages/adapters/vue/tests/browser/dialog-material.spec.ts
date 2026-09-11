import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhButton,
  XhDialogBody,
  XhDialogContent,
  XhDialogDescription,
  XhDialogFooter,
  XhDialogHeader,
  XhDialogRoot,
  XhDialogTitle,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='dialog'][data-part='${name}']`)!
}

function mount(): void {
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhDialogRoot, { open: true, variant: 'blur' }, () =>
      h(XhDialogContent, null, () => [
        h(XhDialogHeader, null, () => [
          h(XhDialogTitle, null, () => '发布确认'),
          h(XhDialogDescription, null, () => '标题区保留适度通透。'),
        ]),
        h(XhDialogBody, null, () => h('p', '正文在高遮蔽保护区内。')),
        h(XhDialogFooter, null, () => h(XhButton, null, () => '发布')),
      ])),
  })
  app.mount(host)
}

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
  delete document.documentElement.dataset.theme
  delete document.documentElement.dataset.contrast
  delete document.documentElement.dataset.motion
})

describe('dialog 的 M4 高层玻璃皮肤', () => {
  it.each(['light', 'dark'] as const)('%s：正文、lens、分段边缘与模糊遮罩都消费公开材质槽', async (theme) => {
    document.documentElement.dataset.theme = theme
    mount()
    await settle()

    const content = getComputedStyle(part('content'))
    const backdrop = getComputedStyle(part('backdrop'))
    expect(content.borderTopWidth).toBe('1px')
    expect(content.backgroundImage).toContain('linear-gradient')
    expect(content.backdropFilter).toContain('blur(32px)')
    expect(content.boxShadow).toContain('2px 4px')
    expect(content.boxShadow).toContain('12px 28px')
    expect(content.boxShadow).toContain('32px 64px')
    expect(getComputedStyle(part('header')).borderBottomWidth).toBe('1px')
    expect(getComputedStyle(part('footer')).borderTopWidth).toBe('1px')
    expect(backdrop.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(backdrop.backdropFilter).toContain('blur(12px)')
  })

  it('高对比与减弱动效保留实体边界，并撤掉光学效果与时长', async () => {
    document.documentElement.dataset.contrast = 'more'
    document.documentElement.dataset.motion = 'reduce'
    mount()
    await settle()

    const content = getComputedStyle(part('content'))
    const backdrop = getComputedStyle(part('backdrop'))
    expect(content.borderTopWidth).toBe('1px')
    expect(content.backdropFilter).toBe('none')
    expect(content.boxShadow).toBe('none')
    expect(backdrop.backdropFilter).toBe('none')
    // 减弱动效以一个极短有限时长保留退场生命周期可观察性，而不是把 animation 直接删掉。
    expect(content.animationDuration).toBe('0.001s')
    expect(backdrop.animationDuration).toBe('0.001s')
  })
})

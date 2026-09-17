import type { App } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhCheckbox,
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
  XhCheckboxGroupSelectAllTrigger,
} from '../../src'
import { pressPointer, releasePointerAway } from './pointer-press'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  await releasePointerAway()
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mountPair(checked: boolean, props: Record<string, unknown> = {}): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  // 断言的是稳定态的颜色与几何，不是过渡中间帧
  host.style.setProperty('--xh-motion-duration-micro', '0ms')
  host.style.setProperty('--xh-motion-duration-press', '0ms')
  host.style.setProperty('--xh-motion-duration-release', '0ms')
  app = createApp({
    setup: () => () => h('div', [
      h(XhCheckbox, { checked, 'aria-label': '独立复选框' }),
      h(XhCheckboxGroupRoot, { value: checked ? ['mail'] : [], ...props }, () => [
        h(XhCheckboxGroupLabel, null, () => '通知'),
        h(XhCheckboxGroupSelectAllTrigger, null, () => '全选'),
        h(XhCheckboxGroupItem, { value: 'mail' }, () => [
          h(XhCheckboxGroupIndicator),
          h(XhCheckboxGroupItemText, null, () => '邮件'),
        ]),
        h(XhCheckboxGroupItem, { value: 'sms' }, () => [
          h(XhCheckboxGroupIndicator),
          h(XhCheckboxGroupItemText, null, () => '短信'),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function getPart(scope: string, part: string, index = 0): HTMLElement {
  const el = host?.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='${part}']`)[index]
  if (!el)
    throw new Error(`挂载树里没有 ${scope}.${part}`)
  return el
}

/** 语义色令牌在该元素上解到的颜色。 */
function resolveColor(token: string, scope: HTMLElement): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${token})`
  scope.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

/** 尺寸令牌在该元素上解到的像素值。 */
function resolvePx(token: string, scope: HTMLElement): number {
  const probe = document.createElement('div')
  probe.style.inlineSize = `var(${token})`
  scope.append(probe)
  const value = Number.parseFloat(getComputedStyle(probe).inlineSize)
  probe.remove()
  return value
}

/** 方框的几何：单体与集合里的同一枚方框必须一样大。 */
function boxGeometry(el: HTMLElement, pseudo?: string): Record<string, string> {
  const style = getComputedStyle(el, pseudo)
  return { width: style.width, height: style.height, borderRadius: style.borderRadius, borderWidth: style.borderTopWidth }
}

describe('checkboxGroup 控制盒', () => {
  for (const checked of [false, true]) {
    it(`${checked ? '选中' : '未选中'}时方框与独立 Checkbox 同一几何，全选格与条目方框同一几何`, async () => {
      await mountPair(checked)
      const geometry = boxGeometry(getPart('checkbox-group', 'indicator'))
      expect(geometry).toEqual(boxGeometry(getPart('checkbox', 'root')))
      expect(boxGeometry(getPart('checkbox-group', 'select-all-trigger'), '::before')).toEqual(geometry)
    })
  }

  it('方框是字段家族的控制盒：canvas 底 + border-control 描边 + 无影，勾中后以语气色填充', async () => {
    await mountPair(false)
    const root = getPart('checkbox-group', 'root')
    const idle = getComputedStyle(getPart('checkbox-group', 'indicator'))
    expect(idle.backgroundColor).toBe(resolveColor('--xh-bg-canvas', root))
    expect(idle.borderTopColor).toBe(resolveColor('--xh-border-control', root))
    expect(idle.boxShadow).toBe('none')
    expect(idle.backgroundImage).toBe('none')
    await mountPair(true)
    const checkedRoot = getPart('checkbox-group', 'root')
    const on = getComputedStyle(getPart('checkbox-group', 'indicator'))
    expect(on.backgroundColor).toBe(resolveColor('--xh-bg-brand', checkedRoot))
    expect(on.borderTopColor).toBe(resolveColor('--xh-bg-brand', checkedRoot))
    expect(on.boxShadow).toBe('none')
  })

  it('整行悬停时未勾选方框描边升一档，按下时方框缩放并换底；勾中的方框按下换到 active 档', async () => {
    await mountPair(false)
    const root = getPart('checkbox-group', 'root')
    const item = getPart('checkbox-group', 'item', 1)
    const box = getPart('checkbox-group', 'indicator', 1)
    await userEvent.hover(item)
    expect(getComputedStyle(box).borderTopColor).toBe(resolveColor('--xh-border-control-hover', root))
    expect(getComputedStyle(box).boxShadow).toBe('none')
    await pressPointer(item)
    expect(item.matches(':active')).toBe(true)
    expect(getComputedStyle(box).scale).toBe('0.97')
    expect(getComputedStyle(box).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', root))
    await releasePointerAway()

    await mountPair(true)
    const checkedRoot = getPart('checkbox-group', 'root')
    const checkedItem = getPart('checkbox-group', 'item', 0)
    const checkedBox = getPart('checkbox-group', 'indicator', 0)
    await userEvent.hover(checkedItem)
    expect(getComputedStyle(checkedBox).borderTopColor).toBe(resolveColor('--xh-bg-brand', checkedRoot))
    await pressPointer(checkedItem)
    expect(getComputedStyle(checkedBox).backgroundColor).toBe(resolveColor('--xh-bg-brand-active', checkedRoot))
    expect(getComputedStyle(checkedBox).scale).toBe('0.97')
  })

  it('集合标题 14 / muted 不随档，条目文字与全选格文字随档；标题到集合与条目之间都是 space-2', async () => {
    await mountPair(false, { size: 'lg' })
    const root = getPart('checkbox-group', 'root')
    const label = getPart('checkbox-group', 'label')
    expect(Number.parseFloat(getComputedStyle(label).fontSize)).toBe(resolvePx('--xh-text-label-size', root))
    expect(getComputedStyle(label).color).toBe(resolveColor('--xh-fg-muted', root))
    const lg = resolvePx('--xh-control-font-lg', root)
    expect(Number.parseFloat(getComputedStyle(getPart('checkbox-group', 'item')).fontSize)).toBe(lg)
    expect(Number.parseFloat(getComputedStyle(getPart('checkbox-group', 'select-all-trigger')).fontSize)).toBe(lg)
    const gap = resolvePx('--xh-space-2', root)
    const selectAll = getPart('checkbox-group', 'select-all-trigger')
    expect(selectAll.getBoundingClientRect().top - label.getBoundingClientRect().bottom).toBeCloseTo(gap, 1)
    expect(getPart('checkbox-group', 'item', 1).getBoundingClientRect().top - getPart('checkbox-group', 'item', 0).getBoundingClientRect().bottom).toBeCloseTo(gap, 1)
  })
})

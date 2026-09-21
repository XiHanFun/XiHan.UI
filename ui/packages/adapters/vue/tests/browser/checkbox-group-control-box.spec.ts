import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
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

  const FAMILY = {
    'data-xh-action-control': '',
    'data-xh-action-profile': 'row',
    'data-xh-action-variant': 'ghost',
    'data-xh-action-display': 'always',
    'data-xh-action-size': 'xs',
  }

  /** 宿主上投影的五个家族属性。 */
  function familyAttrs(el: HTMLElement): Record<string, string | null> {
    return Object.fromEntries(Object.keys(FAMILY).map(name => [name, el.getAttribute(name)]))
  }

  it('整行接 row 档：悬停行面 100 + 方框描边升档，按下行面 200 + 方框 300 不缩放；勾中按下 active 档', async () => {
    await mountPair(false)
    const root = getPart('checkbox-group', 'root')
    const item = getPart('checkbox-group', 'item', 1)
    const box = getPart('checkbox-group', 'indicator', 1)
    expect(familyAttrs(item)).toEqual(FAMILY)
    const rest = getComputedStyle(box).backgroundColor
    await userEvent.hover(item)
    // 行自己坐画布：hover 100；方框只升描边，底不动
    expect(getComputedStyle(item).backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
    expect(getComputedStyle(box).borderTopColor).toBe(resolveColor('--xh-border-control-hover', root))
    expect(getComputedStyle(box).backgroundColor).toBe(rest)
    expect(getComputedStyle(box).boxShadow).toBe('none')
    await pressPointer(item)
    expect(item.matches(':active')).toBe(true)
    // 行按下 200，坐在行面上的方框读宿主 host 槽到 300；两者都不缩放
    expect(getComputedStyle(item).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', root))
    expect(getComputedStyle(box).backgroundColor).toBe(resolveColor('--xh-bg-subtle-active', root))
    expect(getComputedStyle(box).scale).toBe('none')
    expect(getComputedStyle(item).scale).toBe('none')
    await releasePointerAway()

    await mountPair(true)
    const checkedRoot = getPart('checkbox-group', 'root')
    const checkedItem = getPart('checkbox-group', 'item', 0)
    const checkedBox = getPart('checkbox-group', 'indicator', 0)
    await userEvent.hover(checkedItem)
    expect(getComputedStyle(checkedBox).borderTopColor).toBe(resolveColor('--xh-bg-brand', checkedRoot))
    await pressPointer(checkedItem)
    expect(getComputedStyle(checkedBox).backgroundColor).toBe(resolveColor('--xh-bg-brand-active', checkedRoot))
    expect(getComputedStyle(checkedBox).scale).toBe('none')
  })

  it('全选格与条目同形：row 档 xs 的 24px 命中地板、16px 方框，悬停 100 / 按下 200 行面，方框按下 300 / 半选按下 active 档', async () => {
    await mountPair(false)
    const root = getPart('checkbox-group', 'root')
    const trigger = getPart('checkbox-group', 'select-all-trigger')
    expect(familyAttrs(trigger)).toEqual(FAMILY)
    expect(trigger.getBoundingClientRect().height).toBe(24)
    expect(getComputedStyle(trigger, '::before').width).toBe('16px')
    expect(getComputedStyle(trigger, '::before').height).toBe('16px')
    await userEvent.hover(trigger)
    expect(getComputedStyle(trigger).backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
    expect(getComputedStyle(trigger, '::before').borderTopColor).toBe(resolveColor('--xh-border-control-hover', root))
    await pressPointer(trigger)
    expect(getComputedStyle(trigger).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', root))
    expect(getComputedStyle(trigger, '::before').backgroundColor).toBe(resolveColor('--xh-bg-subtle-active', root))
    expect(getComputedStyle(trigger, '::before').scale).toBe('none')
    expect(getComputedStyle(trigger).scale).toBe('none')
    await releasePointerAway()

    // 勾了一个（mail）即半选：方框是语气实心面，按下派生 active 档
    await mountPair(true)
    const mixedRoot = getPart('checkbox-group', 'root')
    const mixed = getPart('checkbox-group', 'select-all-trigger')
    expect(mixed.getAttribute('aria-checked')).toBe('mixed')
    await pressPointer(mixed)
    expect(getComputedStyle(mixed, '::before').backgroundColor).toBe(resolveColor('--xh-bg-brand-active', mixedRoot))
  })

  it('只读：整行不换面、手型 default，方框描边不升档', async () => {
    await mountPair(false, { readOnly: true })
    const root = getPart('checkbox-group', 'root')
    const item = getPart('checkbox-group', 'item', 1)
    const box = getPart('checkbox-group', 'indicator', 1)
    const trigger = getPart('checkbox-group', 'select-all-trigger')
    const restBorder = getComputedStyle(box).borderTopColor
    await userEvent.hover(item)
    expect(getComputedStyle(item).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(item).cursor).toBe('default')
    expect(getComputedStyle(box).borderTopColor).toBe(restBorder)
    await pressPointer(item)
    expect(getComputedStyle(item).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(box).backgroundColor).toBe(resolveColor('--xh-bg-canvas', root))
    await releasePointerAway()
    await userEvent.hover(trigger)
    expect(getComputedStyle(trigger).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(trigger).cursor).toBe('default')
    await pressPointer(trigger)
    expect(getComputedStyle(trigger).backgroundColor).toBe('rgba(0, 0, 0, 0)')
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

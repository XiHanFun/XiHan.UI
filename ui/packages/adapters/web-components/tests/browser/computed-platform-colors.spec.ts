import { createAnatomy } from '@xihan-ui/core'
import { collectComputedSnapshot, PLATFORM_PAINTED } from '@xihan-ui/testing'
import { afterEach, expect, it } from 'vitest'

/**
 * 计算样式快照对平台画的原生控件的处理。
 *
 * 快照基线在开发机上录、在 CI 上比：原生 button / select / range 的颜色由宿主的原生主题给，
 * Windows 与 Linux 不是同一组数，录进基线就一定在另一边红。采集器要把这些记成 platform，
 * 而皮肤改过的颜色、非原生节点上的初始值都必须照常采——否则快照就失去了「皮肤把它解析成了什么」的裁决力。
 */

const anatomy = createAnatomy('probe', ['bare', 'skinned', 'reset', 'range', 'plain'] as const)
let host: HTMLElement | undefined

afterEach(() => {
  host?.remove()
  host = undefined
})

function snapshot(html: string): ReturnType<typeof collectComputedSnapshot> {
  host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  return collectComputedSnapshot({ doc: document, component: 'probe', anatomy })
}

it('皮肤没碰过的原生控件颜色记成 platform；皮肤改过的与非原生节点的照常采值', () => {
  const snap = snapshot(`
    <button data-scope="probe" data-part="bare">裸按钮</button>
    <button data-scope="probe" data-part="skinned" style="background-color: oklch(0.5 0.1 200); color: oklch(1 0 0)">换过底与前景</button>
    <button data-scope="probe" data-part="reset" style="appearance: none">皮肤重置了原生外观</button>
    <input data-scope="probe" data-part="range" type="range">
    <div data-scope="probe" data-part="plain">普通节点</div>
  `)

  // 裸按钮：底、前景、描边、聚焦环都是 UA 主题的，一律记 platform；几何值不受影响
  expect(snap.bare?.['background-color']).toBe(PLATFORM_PAINTED)
  expect(snap.bare?.color).toBe(PLATFORM_PAINTED)
  expect(snap.bare?.['border-top-color']).toBe(PLATFORM_PAINTED)
  expect(snap.bare?.['outline-color']).toBe(PLATFORM_PAINTED)
  expect(snap.bare?.['border-top-width']).toMatch(/^\d/)

  // 换过的两支照常采，没换的描边仍是平台的
  expect(snap.skinned?.['background-color']).toBe('oklch(0.5 0.1 200)')
  expect(snap.skinned?.color).toBe('oklch(1 0 0)')
  expect(snap.skinned?.['border-top-color']).toBe(PLATFORM_PAINTED)

  // appearance: none 之后不再是平台画的，UA 给的颜色也按数采
  expect(snap.reset?.['background-color']).toMatch(/^rgb/)
  expect(snap.reset?.color).toMatch(/^rgb/)

  // 原生 range：前景与由它派生的描边都是平台的
  expect(snap.range?.color).toBe(PLATFORM_PAINTED)
  expect(snap.range?.['border-top-color']).toBe(PLATFORM_PAINTED)

  // 普通节点不是原生控件，初始黑与透明底原样进快照
  expect(snap.plain?.color).toBe('rgb(0, 0, 0)')
  expect(snap.plain?.['background-color']).toBe('rgba(0, 0, 0, 0)')
})

it('探针只是临时插进去的，采完不留在文档里', () => {
  snapshot('<button data-scope="probe" data-part="bare">裸按钮</button>')
  expect(host?.querySelectorAll('button')).toHaveLength(1)
})

// @vitest-environment jsdom
// 菜单栏是单机器单坐标：一排入口共用一份 position。换一张菜单时若不把上一张的坐标作废，
// 新菜单会先按旧位置画一帧再跳走——指针沿入口扫过去，每张都闪一下。
import type { MenubarSchema } from '../src/menubar'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it } from 'vitest'
import { connectMenubar, menubarMachine } from '../src/menubar'

const collection = [
  { value: 'file', label: '文件', items: [{ value: 'open', label: '打开' }] },
  { value: 'edit', label: '编辑', items: [{ value: 'undo', label: '撤销' }] },
]

function menubar(props: Partial<MenubarSchema['props']> = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(menubarMachine, { props: () => ({ collection, ...props }), runtime })
  runtime.start()
  return { service, api: () => connectMenubar(service, normalizeProps) }
}

/** 定位层此刻是否被藏起来。 */
function hiddenOf(api: ReturnType<typeof menubar>['api'], menu: string): unknown {
  return (api().getPositionerProps({ value: menu }) as Record<string, unknown>)['data-hidden']
}

describe('换菜单时旧坐标作废', () => {
  it('点开另一张：上一张的坐标不再用，新菜单先藏着等重新定位', () => {
    const { service, api } = menubar({ defaultValue: 'file' })
    service.context.set('position', { x: 360, y: 464, placement: 'bottom-start' })
    expect(hiddenOf(api, 'file')).toBeUndefined()

    service.send({ type: 'TRIGGER.OPEN', value: 'edit' })
    // 没作废的话这里会是 undefined——新菜单套着「文件」的坐标露出来
    expect(hiddenOf(api, 'edit')).toBe('')
  })

  it('指针掠过换张同理：一路扫过去不该每张都闪一下旧位置', () => {
    const { service, api } = menubar({ defaultValue: 'file' })
    service.context.set('position', { x: 360, y: 464, placement: 'bottom-start' })
    service.send({ type: 'TRIGGER.POINTER', value: 'edit' })
    expect(hiddenOf(api, 'edit')).toBe('')
  })

  it('程序化改值同样作废', () => {
    const { service, api } = menubar({ defaultValue: 'file' })
    service.context.set('position', { x: 360, y: 464, placement: 'bottom-start' })
    service.send({ type: 'VALUE.SET', value: 'edit' })
    expect(hiddenOf(api, 'edit')).toBe('')
  })

  it('重新定位后照常露出来', () => {
    const { service, api } = menubar({ defaultValue: 'file' })
    service.send({ type: 'TRIGGER.OPEN', value: 'edit' })
    service.context.set('position', { x: 408, y: 464, placement: 'bottom-start' })
    expect(hiddenOf(api, 'edit')).toBeUndefined()
  })
})

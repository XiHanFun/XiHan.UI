// @vitest-environment jsdom
// 菜单栏一排入口共用一台机器一份 position。换菜单时共享份立刻归新菜单所有，
// 而正在收起的那张还要播 120ms 退场——它若从共享份取坐标会当场归零，
// 半透明的退场动画就在视口左上角播。所以坐标逐菜单记账：
// 收起中的取自己名下的那份留在原地；新展开的名下无账，藏到拿到新坐标为止。
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

const FILE_AT = { x: 360, y: 464, placement: 'bottom-start' as const }

function menubar(props: Partial<MenubarSchema['props']> = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(menubarMachine, { props: () => ({ collection, ...props }), runtime })
  runtime.start()
  return { service, api: () => connectMenubar(service, normalizeProps) }
}

function positionerOf(api: ReturnType<typeof menubar>['api'], menu: string) {
  const props = api().getPositionerProps({ value: menu }) as Record<string, unknown>
  return { hidden: props['data-hidden'], style: props.style as Record<string, string> }
}

/** 引擎回报了「文件」的坐标：写进共享份与它名下的那份，与 trackPosition 的回填一致。 */
function placeFile(service: ReturnType<typeof menubar>['service']): void {
  service.context.set('position', FILE_AT)
  service.context.set('placements', { file: FILE_AT })
}

describe('收起中的菜单留在原地', () => {
  it('换到另一张后，上一张的坐标一動不动——它还要在原位播完退场', () => {
    const { service, api } = menubar({ defaultValue: 'file' })
    placeFile(service)
    service.send({ type: 'TRIGGER.OPEN', value: 'edit' })

    const closing = positionerOf(api, 'file')
    expect(closing.style.left).toBe('360px')
    expect(closing.style.top).toBe('464px')
  })

  it('指针掠过换张同理', () => {
    const { service, api } = menubar({ defaultValue: 'file' })
    placeFile(service)
    service.send({ type: 'TRIGGER.POINTER', value: 'edit' })
    expect(positionerOf(api, 'file').style.left).toBe('360px')
  })

  it('全部收起（程序化传 null）不炸，收起那张照样留在原地', () => {
    const { service, api } = menubar({ defaultValue: 'file' })
    placeFile(service)
    service.send({ type: 'VALUE.SET', value: null })
    expect(positionerOf(api, 'file').style.left).toBe('360px')
  })
})

describe('新展开的菜单藏到拿到新坐标为止', () => {
  it('名下无账就藏着，不借上一张的坐标', () => {
    const { service, api } = menubar({ defaultValue: 'file' })
    placeFile(service)
    service.send({ type: 'TRIGGER.OPEN', value: 'edit' })

    const opening = positionerOf(api, 'edit')
    expect(opening.hidden).toBe('')
  })

  it('重开同一张也重新来过：上次的坐标可能已过时（页面滚过、窗口变过）', () => {
    const { service, api } = menubar({ defaultValue: 'file' })
    placeFile(service)
    service.send({ type: 'VALUE.SET', value: null })
    service.send({ type: 'TRIGGER.OPEN', value: 'file' })
    expect(positionerOf(api, 'file').hidden).toBe('')
  })

  it('引擎回报后就露出来、按新坐标摆', () => {
    const { service, api } = menubar({ defaultValue: 'file' })
    placeFile(service)
    service.send({ type: 'TRIGGER.OPEN', value: 'edit' })
    service.context.set('placements', { ...service.context.get('placements'), edit: { x: 408, y: 464, placement: 'bottom-start' } })

    const opened = positionerOf(api, 'edit')
    expect(opened.hidden).toBeUndefined()
    expect(opened.style.left).toBe('408px')
  })
})

describe('换张瞬时，首开末收有动画', () => {
  function instantOf(api: ReturnType<typeof menubar>['api'], menu: string): unknown {
    return (api().getContentProps({ value: menu }) as Record<string, unknown>)['data-instant']
  }

  it('首次展开不带 data-instant，进场照常播', () => {
    const { service, api } = menubar()
    service.send({ type: 'TRIGGER.OPEN', value: 'file' })
    expect(instantOf(api, 'file')).toBeUndefined()
  })

  it('换张时两侧都带上：收起的不播退场、新开的不播进场——交叉淡变读起来就是闪烁', () => {
    const { service, api } = menubar({ defaultValue: 'file' })
    service.send({ type: 'TRIGGER.POINTER', value: 'edit' })
    expect(instantOf(api, 'file')).toBe('')
    expect(instantOf(api, 'edit')).toBe('')
  })

  it('末次收起不带，退场照常播', () => {
    const { service, api } = menubar({ defaultValue: 'file' })
    service.send({ type: 'TRIGGER.POINTER', value: 'edit' })
    service.send({ type: 'CLOSE' })
    expect(instantOf(api, 'edit')).toBeUndefined()
  })

  it('点开当前这张不算换张', () => {
    const { service, api } = menubar({ defaultValue: 'file' })
    service.send({ type: 'TRIGGER.OPEN', value: 'file' })
    expect(instantOf(api, 'file')).toBeUndefined()
  })
})

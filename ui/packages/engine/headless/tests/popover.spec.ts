import type { Service } from '@xihan-ui/core'
import type { PopoverSchema } from '../src'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectPopover, popoverMachine } from '../src'

type Dict = Record<string, unknown>

function makeService(props: PopoverSchema['props'] = {}): Service<PopoverSchema> {
  const runtime = createVanillaRuntime()
  const service = createService(popoverMachine, { props: () => props, runtime })
  runtime.start()
  return service
}

const api = (service: Service<PopoverSchema>) => connectPopover(service, normalizeProps)
const key = (name: string): KeyboardEvent => ({ key: name, repeat: false, isComposing: false, keyCode: 0 } as KeyboardEvent)
const fire = (props: Dict, name: string, event: unknown): void => (props[name] as (e: unknown) => void)(event)

describe('connectPopover：两颗按钮接 Action Control', () => {
  it('触发器 text md outline，关闭钮 icon sm ghost，静息不带 data-pressed', () => {
    const service = makeService({ defaultOpen: true })
    const trigger = api(service).getTriggerProps() as Dict
    expect(trigger).toMatchObject({
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'md',
      // 缺省中性描边（真源 §7.2 第 2 条：只有 Button 缺省品牌实心）
      'data-xh-action-variant': 'outline',
    })
    expect(trigger['data-pressed']).toBeUndefined()
    const close = api(service).getCloseTriggerProps() as Dict
    expect(close).toMatchObject({
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'sm',
      'data-xh-action-variant': 'ghost',
    })
    expect(close['data-pressed']).toBeUndefined()
  })
})

describe('popoverMachine 按压通道：Space / Enter 与触屏按住投影 data-pressed，按住的是哪颗就只落在哪颗上', () => {
  it('触发器：keydown 在场、keyup 撤下；触屏按下在场、抬起撤下；失焦撤下', () => {
    const service = makeService()
    const trigger = (): Dict => api(service).getTriggerProps() as Dict
    fire(trigger(), 'onKeyDown', key(' '))
    expect(trigger()['data-pressed']).toBe('')
    fire(trigger(), 'onKeyUp', key(' '))
    expect(trigger()['data-pressed']).toBeUndefined()
    fire(trigger(), 'onPointerDown', { pointerType: 'touch' })
    expect(trigger()['data-pressed']).toBe('')
    fire(trigger(), 'onPointerUp', {})
    expect(trigger()['data-pressed']).toBeUndefined()
    fire(trigger(), 'onKeyDown', key('Enter'))
    expect(trigger()['data-pressed']).toBe('')
    fire(trigger(), 'onBlur', {})
    expect(trigger()['data-pressed']).toBeUndefined()
    // 鼠标按下不走这一路：由 :active 表出
    fire(trigger(), 'onPointerDown', { pointerType: 'mouse' })
    expect(trigger()['data-pressed']).toBeUndefined()
  })

  it('关闭钮：只有按住的那颗带 data-pressed，另一颗的 keyup 不把它松开', () => {
    const service = makeService({ defaultOpen: true })
    const trigger = (): Dict => api(service).getTriggerProps() as Dict
    const close = (): Dict => api(service).getCloseTriggerProps() as Dict
    fire(close(), 'onKeyDown', key(' '))
    expect(close()['data-pressed']).toBe('')
    expect(trigger()['data-pressed']).toBeUndefined()
    fire(trigger(), 'onKeyUp', key(' '))
    expect(close()['data-pressed']).toBe('')
    fire(close(), 'onKeyUp', key(' '))
    expect(close()['data-pressed']).toBeUndefined()
    fire(close(), 'onPointerDown', { pointerType: 'touch' })
    expect(close()['data-pressed']).toBe('')
    fire(close(), 'onPointerCancel', {})
    expect(close()['data-pressed']).toBeUndefined()
  })

  it('浮层收起即松开：按住 Enter 关掉浮层，关闭钮不会再来 keyup，按压面由机器收', () => {
    const service = makeService({ defaultOpen: true })
    const close = (): Dict => api(service).getCloseTriggerProps() as Dict
    fire(close(), 'onKeyDown', key('Enter'))
    expect(close()['data-pressed']).toBe('')
    service.send({ type: 'CLOSE', src: 'close-trigger' })
    expect(service.state.get()).toBe('closed')
    expect(close()['data-pressed']).toBeUndefined()
    // 重开后关闭钮是干净的
    service.send({ type: 'OPEN' })
    expect(close()['data-pressed']).toBeUndefined()
  })
})

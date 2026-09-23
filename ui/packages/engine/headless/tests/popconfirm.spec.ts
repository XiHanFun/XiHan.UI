import type { Service } from '@xihan-ui/core'
import type { PopconfirmIntents, PopoverSchema } from '../src'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectPopconfirm, popoverMachine } from '../src'

type Dict = Record<string, unknown>

function makeService(props: PopoverSchema['props'] = { defaultOpen: true }): Service<PopoverSchema> {
  const runtime = createVanillaRuntime()
  const service = createService(popoverMachine, { props: () => props, runtime })
  runtime.start()
  return service
}

const api = (service: Service<PopoverSchema>, intents: PopconfirmIntents = {}) => connectPopconfirm(service, intents, normalizeProps)
const key = (name: string): KeyboardEvent => ({ key: name, repeat: false, isComposing: false, keyCode: 0 } as KeyboardEvent)
const fire = (props: Dict, name: string, event: unknown): void => (props[name] as (e: unknown) => void)(event)

describe('connectPopconfirm：三颗按钮接 Action Control', () => {
  it('触发器 text md outline；确认 text sm solid（本浮层的主要动作）；取消 text sm outline；静息不带 data-pressed', () => {
    const service = makeService()
    const trigger = api(service).getTriggerProps() as Dict
    expect(trigger).toMatchObject({
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'md',
      'data-xh-action-variant': 'outline',
    })
    expect(trigger['data-pressed']).toBeUndefined()
    const confirm = api(service).getConfirmTriggerProps() as Dict
    expect(confirm).toMatchObject({
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'sm',
      // 确认 / 主线动作钮显式 solid，不属缺省语气
      'data-xh-action-variant': 'solid',
    })
    expect(confirm['data-pressed']).toBeUndefined()
    const cancel = api(service).getCancelTriggerProps() as Dict
    expect(cancel).toMatchObject({
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'sm',
      'data-xh-action-variant': 'outline',
    })
    expect(cancel['data-pressed']).toBeUndefined()
  })

  it('挂起时确认钮仍投影家族标记，同时带 data-loading 与 aria-disabled，由家族的 loading 面接管', () => {
    const service = makeService()
    const confirm = api(service, { pending: true }).getConfirmTriggerProps() as Dict
    expect(confirm['data-xh-action-variant']).toBe('solid')
    expect(confirm['data-loading']).toBe('')
    expect(confirm['aria-disabled']).toBe('true')
  })
})

describe('popconfirm 按压通道：跑的是 popover 机器，按住的是哪颗就只落在哪颗上', () => {
  it('两颗动作钮：只有按住的那颗带 data-pressed，另一颗的 keyup 不把它松开', () => {
    const service = makeService()
    const confirm = (): Dict => api(service).getConfirmTriggerProps() as Dict
    const cancel = (): Dict => api(service).getCancelTriggerProps() as Dict
    fire(cancel(), 'onKeyDown', key(' '))
    expect(cancel()['data-pressed']).toBe('')
    expect(confirm()['data-pressed']).toBeUndefined()
    fire(confirm(), 'onKeyUp', key(' '))
    expect(cancel()['data-pressed']).toBe('')
    fire(cancel(), 'onKeyUp', key(' '))
    expect(cancel()['data-pressed']).toBeUndefined()

    fire(confirm(), 'onPointerDown', { pointerType: 'touch' })
    expect(confirm()['data-pressed']).toBe('')
    expect(cancel()['data-pressed']).toBeUndefined()
    fire(confirm(), 'onPointerCancel', {})
    expect(confirm()['data-pressed']).toBeUndefined()
  })

  it('触发器：keydown 在场、keyup 撤下；失焦撤下；鼠标按下不走这一路', () => {
    const service = makeService({ defaultOpen: false })
    const trigger = (): Dict => api(service).getTriggerProps() as Dict
    fire(trigger(), 'onKeyDown', key('Enter'))
    expect(trigger()['data-pressed']).toBe('')
    fire(trigger(), 'onKeyUp', key('Enter'))
    expect(trigger()['data-pressed']).toBeUndefined()
    fire(trigger(), 'onKeyDown', key(' '))
    fire(trigger(), 'onBlur', {})
    expect(trigger()['data-pressed']).toBeUndefined()
    fire(trigger(), 'onPointerDown', { pointerType: 'mouse' })
    expect(trigger()['data-pressed']).toBeUndefined()
  })

  it('浮层收起即松开：按住 Enter 取消收起浮层，取消钮不会再来 keyup，按压面由机器收', () => {
    const service = makeService()
    const cancel = (): Dict => api(service).getCancelTriggerProps() as Dict
    fire(cancel(), 'onKeyDown', key('Enter'))
    expect(cancel()['data-pressed']).toBe('')
    api(service).cancel()
    expect(service.state.get()).toBe('closed')
    expect(cancel()['data-pressed']).toBeUndefined()
  })
})

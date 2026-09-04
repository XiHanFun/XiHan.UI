// @vitest-environment jsdom
// 本轮补的三处能力缺口：输入类型出口、进度不确定态、看图器两端直达。
import type { ImageViewerSchema } from '../src/image-viewer'
import type { TextFieldSchema } from '../src/text-field'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it } from 'vitest'
import { connectButton } from '../src/button'
import { connectImageViewer, imageViewerMachine } from '../src/image-viewer'
import { connectProgress } from '../src/progress'
import { connectTextField, textFieldMachine } from '../src/text-field'
import { connectTimeField, timeFieldMachine } from '../src/time-field'
import { connectTimePicker, timePickerMachine } from '../src/time-picker'

function textField(props: Partial<TextFieldSchema['props']>) {
  const runtime = createVanillaRuntime()
  const service = createService(textFieldMachine, { props: () => props, runtime })
  runtime.start()
  return () => connectTextField(service, normalizeProps)
}

function imageViewer(props: Partial<ImageViewerSchema['props']>) {
  const runtime = createVanillaRuntime()
  const service = createService(imageViewerMachine, { props: () => props, runtime })
  runtime.start()
  return () => connectImageViewer(service, normalizeProps)
}

function keyEvent(key: string) {
  let prevented = false
  return {
    event: { key, defaultPrevented: false, preventDefault: () => { prevented = true } } as unknown as KeyboardEvent,
    wasPrevented: () => prevented,
  }
}

describe('textField 的输入类型出口', () => {
  it('缺省仍是 text', () => {
    const input = textField({})().getInputProps({}) as Record<string, unknown>
    expect(input.type).toBe('text')
  })

  it('作者给了 password 就发 password', () => {
    const input = textField({ type: 'password' })().getInputProps({}) as Record<string, unknown>
    expect(input.type).toBe('password')
  })

  it('多行宿主一律不发 type：textarea 没有这个属性', () => {
    const input = textField({ type: 'email' })().getInputProps({ as: 'textarea' }) as Record<string, unknown>
    expect(input.type).toBeUndefined()
  })
})

describe('progress 的不确定态', () => {
  it('不确定时不发 aria-valuenow：ARIA 以该属性缺席表达进度未知', () => {
    const root = connectProgress({ indeterminate: true, value: 30 }, normalizeProps).getRootProps() as Record<string, unknown>
    expect(root['aria-valuenow']).toBeUndefined()
    expect(root['data-state']).toBe('indeterminate')
    // 上下界照常给，读屏才知道这是个进度条而不是别的
    expect(root['aria-valuemin']).toBe('0')
  })

  it('确定态照常报数', () => {
    const root = connectProgress({ value: 30 }, normalizeProps).getRootProps() as Record<string, unknown>
    expect(root['aria-valuenow']).toBe('30')
    expect(root['data-state']).toBe('loading')
  })

  it('值满了也不算完成——进度未知时谈不上完成', () => {
    const root = connectProgress({ indeterminate: true, value: 100 }, normalizeProps).getRootProps() as Record<string, unknown>
    expect(root['data-state']).toBe('indeterminate')
  })
})

describe('imageViewer 的两端直达', () => {
  const items = [{ src: 'a' }, { src: 'b' }, { src: 'c' }]

  it('end 跳到最后一张', () => {
    const get = imageViewer({ items, defaultOpen: true })
    const { event, wasPrevented } = keyEvent('End')
    ;((get().getContentProps() as Record<string, unknown>).onKeydown as (e: KeyboardEvent) => void)(event)
    expect(get().index).toBe(2)
    expect(wasPrevented()).toBe(true)
  })

  it('home 跳回第一张', () => {
    const get = imageViewer({ items, defaultOpen: true, defaultIndex: 2 })
    ;((get().getContentProps() as Record<string, unknown>).onKeydown as (e: KeyboardEvent) => void)(keyEvent('Home').event)
    expect(get().index).toBe(0)
  })

  it('方向键照旧', () => {
    const get = imageViewer({ items, defaultOpen: true })
    ;((get().getContentProps() as Record<string, unknown>).onKeydown as (e: KeyboardEvent) => void)(keyEvent('ArrowRight').event)
    expect(get().index).toBe(1)
  })
})

describe('button 的图标态与撑满态', () => {
  it('iconOnly 落成 data 标记，交给皮肤清内距并把宽度跟住高度', () => {
    const root = connectButton({ iconOnly: true }, normalizeProps).getRootProps() as Record<string, unknown>
    expect(root['data-icon-only']).toBe('')
    expect(root['data-full-width']).toBeUndefined()
  })

  it('fullWidth 独立于 iconOnly，两者可各自开关', () => {
    const root = connectButton({ fullWidth: true }, normalizeProps).getRootProps() as Record<string, unknown>
    expect(root['data-full-width']).toBe('')
    expect(root['data-icon-only']).toBeUndefined()
  })

  it('两个都不给时一个标记都不发', () => {
    const root = connectButton({}, normalizeProps).getRootProps() as Record<string, unknown>
    expect(root['data-icon-only']).toBeUndefined()
    expect(root['data-full-width']).toBeUndefined()
  })
})

describe('时间分段的读屏名可本地化', () => {
  function timeField(props: Record<string, unknown>) {
    const runtime = createVanillaRuntime()
    const service = createService(timeFieldMachine, { props: () => props, runtime })
    runtime.start()
    return () => connectTimeField(service, normalizeProps)
  }

  it('不给 translations 时用内置英文语义名', () => {
    const seg = timeField({})().getSegmentProps({ segment: 'hour' }) as Record<string, unknown>
    expect(seg['aria-label']).toBe('hour')
  })

  it('给了就用作者的文案', () => {
    const get = timeField({ translations: { hour: '小时', minute: '分钟' } })
    expect((get().getSegmentProps({ segment: 'hour' }) as Record<string, unknown>)['aria-label']).toBe('小时')
    expect((get().getSegmentProps({ segment: 'minute' }) as Record<string, unknown>)['aria-label']).toBe('分钟')
  })

  it('只覆盖一部分时，其余段位仍退回内置名', () => {
    const seg = timeField({ translations: { hour: '小时' } })().getSegmentProps({ segment: 'second' }) as Record<string, unknown>
    expect(seg['aria-label']).toBe('second')
  })
})

describe('timePicker 的逐值可选性', () => {
  function picker(props: Record<string, unknown>) {
    const runtime = createVanillaRuntime()
    const service = createService(timePickerMachine, { props: () => ({ defaultOpen: true, ...props }), runtime })
    runtime.start()
    return () => connectTimePicker(service, normalizeProps)
  }

  it('判真的格子转 aria-disabled，与界外同等对待', () => {
    const get = picker({ isTimeUnavailable: (v: string, unit: string) => unit === 'minute' && v !== '00' })
    const ok = get().getItemProps({ unit: 'minute', value: '00' }) as Record<string, unknown>
    const no = get().getItemProps({ unit: 'minute', value: '30' }) as Record<string, unknown>
    expect(ok['aria-disabled']).toBe('false')
    expect(no['aria-disabled']).toBe('true')
    expect(no['data-disabled']).toBe('')
  })

  it('只作用于指定的列：同一个值在别的列不受影响', () => {
    const get = picker({ isTimeUnavailable: (v: string, unit: string) => unit === 'minute' && v === '30' })
    const hour = get().getItemProps({ unit: 'hour', value: '13' }) as Record<string, unknown>
    expect(hour['aria-disabled']).toBe('false')
  })

  it('不可选的格子点不动，但仍可聚焦', () => {
    const get = picker({ isTimeUnavailable: () => true })
    const before = get().value
    const item = get().getItemProps({ unit: 'hour', value: '13' }) as Record<string, unknown>
    ;(item.onClick as () => void)()
    expect(get().value).toBe(before)
    // 焦点是事实不是许可：禁用格照样记锚点
    expect(item.onFocus).toBeTypeOf('function')
  })

  it('不给钩子时一切照旧', () => {
    const item = picker({})().getItemProps({ unit: 'hour', value: '13' }) as Record<string, unknown>
    expect(item['aria-disabled']).toBe('false')
  })
})

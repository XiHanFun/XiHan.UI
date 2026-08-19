// @vitest-environment jsdom
// 本轮补的三处能力缺口：输入类型出口、进度不确定态、看图器两端直达。
import type { ImageViewerSchema } from '../src/image-viewer'
import type { TextFieldSchema } from '../src/text-field'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it } from 'vitest'
import { connectImageViewer, imageViewerMachine } from '../src/image-viewer'
import { connectProgress } from '../src/progress'
import { connectTextField, textFieldMachine } from '../src/text-field'

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

describe('TextField 的输入类型出口', () => {
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

describe('Progress 的不确定态', () => {
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

describe('ImageViewer 的两端直达', () => {
  const items = [{ src: 'a' }, { src: 'b' }, { src: 'c' }]

  it('End 跳到最后一张', () => {
    const get = imageViewer({ items, defaultOpen: true })
    const { event, wasPrevented } = keyEvent('End')
    ;((get().getContentProps() as Record<string, unknown>).onKeydown as (e: KeyboardEvent) => void)(event)
    expect(get().index).toBe(2)
    expect(wasPrevented()).toBe(true)
  })

  it('Home 跳回第一张', () => {
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

// @vitest-environment jsdom
// lazyMount：列表内容第一次展开时才挂载，挂过之后一直留着；打开前的收起态连打按 collection 算。
import type { SelectSchema } from '../src/select'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectSelect, selectMachine } from '../src/select'

const COLLECTION = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
]

function makeService(props: SelectSchema['props'] = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(selectMachine, { props: () => props, runtime })
  runtime.start()
  return service
}

const api = (service: ReturnType<typeof makeService>) => connectSelect(service, normalizeProps)

function typeOnTrigger(service: ReturnType<typeof makeService>, key: string): void {
  const trigger = api(service).getTriggerProps() as { onKeydown: (e: KeyboardEvent) => void }
  trigger.onKeydown(new KeyboardEvent('keydown', { key, cancelable: true }))
}

describe('select lazyMount', () => {
  it('缺省恒挂载', () => {
    expect(api(makeService({ collection: COLLECTION })).isContentMounted()).toBe(true)
  })

  it('没展开过不挂，第一次展开起一直挂着', () => {
    const s = makeService({ collection: COLLECTION, lazyMount: true })
    expect(api(s).isContentMounted()).toBe(false)
    s.send({ type: 'OPEN' })
    expect(api(s).isContentMounted()).toBe(true)
    s.send({ type: 'CLOSE' })
    expect(api(s).isContentMounted()).toBe(true)
  })

  it('首帧即展开就算展开过', () => {
    expect(api(makeService({ collection: COLLECTION, lazyMount: true, defaultOpen: true })).isContentMounted()).toBe(true)
  })

  it('列表还没挂上时收起态连打按 collection 匹配，禁用条目跳过', () => {
    const s = makeService({ collection: COLLECTION, lazyMount: true })
    typeOnTrigger(s, 'b')
    expect(s.context.get('value')).toEqual(['banana'])
    // cherry 禁用：打 c 不落上去
    typeOnTrigger(s, 'c')
    expect(s.context.get('value')).toEqual(['banana'])
  })

  it('打开前选中文字取自 collection', () => {
    const s = makeService({ collection: COLLECTION, lazyMount: true, defaultValue: 'apple' })
    expect(api(s).valueText).toEqual(['苹果'])
  })
})

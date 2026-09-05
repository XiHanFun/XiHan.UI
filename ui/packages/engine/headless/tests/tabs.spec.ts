// @vitest-environment jsdom
//
// tabs 的机器级基线：受控/非受控、两种激活模式、roving 锚点。
// 这份网是为后面改机器而织的——它钉的是改之前就有的行为。
import type { TabsSchema } from '../src/tabs'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { connectTabs, tabsMachine } from '../src/tabs'

type Dict = Record<string, unknown>

const COLLECTION = [
  { value: 'overview', label: '概览' },
  { value: 'api', label: 'API', disabled: true },
  { value: 'logs', label: '日志' },
]

/**
 * 造一条真实 tablist：三个 trigger 各带 data-value。方向键读的是活 DOM。
 *
 * 禁用要照适配器那样渲成 aria-disabled——导航是从活 DOM 上读禁用的，
 * 光在 collection 里标而节点上没有，跳过就不会发生。
 */
function mountDom(values: readonly string[] = COLLECTION.map(n => n.value)): HTMLElement {
  const list = document.createElement('div')
  list.setAttribute('data-scope', 'tabs')
  list.setAttribute('data-part', 'list')
  const disabledOf = new Map(COLLECTION.map(n => [n.value, !!n.disabled]))
  values.forEach((value) => {
    const trigger = document.createElement('button')
    trigger.setAttribute('data-scope', 'tabs')
    trigger.setAttribute('data-part', 'trigger')
    trigger.setAttribute('data-value', value)
    trigger.setAttribute('aria-disabled', disabledOf.get(value) ? 'true' : 'false')
    list.append(trigger)
  })
  document.body.append(list)
  return list
}

function triggerEl(list: HTMLElement, value: string): HTMLElement {
  const el = list.querySelector<HTMLElement>(`[data-value="${value}"]`)
  if (!el)
    throw new Error(`没有这个 trigger：${value}`)
  return el
}

function makeTabs(props: Partial<TabsSchema['props']> = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(tabsMachine, {
    runtime,
    props: () => ({ collection: COLLECTION, ...props }) as TabsSchema['props'],
  })
  runtime.start()
  return {
    service,
    api: () => connectTabs(service, normalizeProps),
    state: () => service.state.get(),
    focused: () => service.context.get('focusedValue'),
  }
}

/** 键盘事件只走 list 上那一个处理器。 */
function pressList(
  t: ReturnType<typeof makeTabs>,
  init: { key: string, currentTarget: HTMLElement, target?: HTMLElement },
): { preventDefault: ReturnType<typeof vi.fn> } {
  const preventDefault = vi.fn()
  const handler = (t.api().getListProps() as Dict).onKeydown as (e: KeyboardEvent) => void
  handler({
    ...init,
    target: init.target ?? init.currentTarget,
    preventDefault,
  } as unknown as KeyboardEvent)
  return { preventDefault }
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('标签页 · 选中值', () => {
  it('两个都不给时归一成 null，不是 undefined', () => {
    // cell 初值是 undefined，连接层要把它收成 null，否则「无选中」表达不出来
    expect(makeTabs().api().value).toBeNull()
  })

  it('非受控：defaultValue 是初值，内部写入生效并通知', () => {
    const onValueChange = vi.fn()
    const t = makeTabs({ defaultValue: 'overview', onValueChange })
    expect(t.api().value).toBe('overview')

    t.api().setValue('logs')
    expect(t.api().value).toBe('logs')
    expect(onValueChange).toHaveBeenCalledWith({ value: 'logs' })
  })

  it('受控：给了 value 就只发通知，内部值一步不动', () => {
    const onValueChange = vi.fn()
    const t = makeTabs({ value: 'overview', onValueChange })

    t.api().setValue('logs')
    expect(onValueChange).toHaveBeenCalledWith({ value: 'logs' })
    // 宿主没把新值写回来，显示的就还是旧值
    expect(t.api().value).toBe('overview')
  })

  it('setValue(null) 能表达无选中', () => {
    const t = makeTabs({ defaultValue: 'overview' })
    t.api().setValue(null)
    expect(t.api().value).toBeNull()
  })
})

describe('标签页 · 焦点锚点', () => {
  it('点选：同时写选中与锚点', () => {
    const t = makeTabs()
    t.service.send({ type: 'TRIGGER.SELECT', value: 'logs' })
    expect(t.api().value).toBe('logs')
    expect(t.focused()).toBe('logs')
  })

  it('聚焦：只搬锚点，不动选中', () => {
    const t = makeTabs({ defaultValue: 'overview' })
    t.service.send({ type: 'TRIGGER.FOCUS', value: 'logs' })
    expect(t.focused()).toBe('logs')
    expect(t.api().value).toBe('overview')
  })

  it('焦点离组：清掉锚点，锚点退回选中项', () => {
    const t = makeTabs({ defaultValue: 'overview' })
    t.service.send({ type: 'TRIGGER.FOCUS', value: 'logs' })
    t.service.send({ type: 'LIST.BLUR' })
    expect(t.focused()).toBeNull()
    // roving 锚点 = focusedValue ?? value
    const trigger = (v: string): Dict => t.api().getTriggerProps({ value: v }) as Dict
    expect(trigger('overview').tabindex).toBe(0)
    expect(trigger('logs').tabindex).toBe(-1)
  })

  it('焦点在组内时容器让位，Tab 才能离开本组', () => {
    const t = makeTabs({ defaultValue: 'overview' })
    expect((t.api().getListProps() as Dict).tabindex).toBe(0)
    t.service.send({ type: 'TRIGGER.FOCUS', value: 'logs' })
    // 判据是 focusedValue 而不是锚点：锚点可能指向已不存在的值，那时无人认领 0
    expect((t.api().getListProps() as Dict).tabindex).toBe(-1)
  })
})

describe('标签页 · 两种激活模式', () => {
  it('automatic（缺省）：方向键顺带把选中一起搬走', () => {
    const t = makeTabs({ defaultValue: 'overview' })
    t.service.send({ type: 'TRIGGER.NAVIGATE', value: 'logs' })
    expect(t.api().value).toBe('logs')
    expect(t.focused()).toBe('logs')
  })

  it('manual：方向键只搬焦点，确认键才切换', () => {
    const t = makeTabs({ defaultValue: 'overview', activationMode: 'manual' })
    t.service.send({ type: 'TRIGGER.NAVIGATE', value: 'logs' })
    expect(t.focused()).toBe('logs')
    expect(t.api().value).toBe('overview')

    t.service.send({ type: 'TRIGGER.SELECT', value: 'logs' })
    expect(t.api().value).toBe('logs')
  })
})

describe('标签页 · 条目禁用', () => {
  it('禁用走 aria-disabled 不走原生 disabled——原生的不可聚焦也不派 click', () => {
    const api = makeTabs().api()
    expect((api.getTriggerProps({ value: 'api' }) as Dict)['aria-disabled']).toBe('true')
    expect((api.getTriggerProps({ value: 'api' }) as Dict).disabled).toBeUndefined()
  })

  it('部件上写的禁用盖过 collection 里的', () => {
    const api = makeTabs().api()
    expect((api.getTriggerProps({ value: 'api', disabled: false }) as Dict)['aria-disabled']).toBe('false')
    expect((api.getTriggerProps({ value: 'overview', disabled: true }) as Dict)['aria-disabled']).toBe('true')
  })

  it('点禁用的标签不发事件', () => {
    const onValueChange = vi.fn()
    const t = makeTabs({ onValueChange })
    const props = t.api().getTriggerProps({ value: 'api' }) as Dict
    ;(props.onClick as () => void)()
    expect(onValueChange).not.toHaveBeenCalled()
    expect(t.api().value).toBeNull()
  })
})

describe('标签页 · 面板', () => {
  it('全部常挂，靠 hidden 显隐——面板内的滚动位置与表单态才留得住', () => {
    const t = makeTabs({ defaultValue: 'overview' })
    const content = (v: string): Dict => t.api().getContentProps({ value: v }) as Dict
    expect(content('overview').hidden).toBeUndefined()
    expect(content('logs').hidden).toBe(true)
  })

  it('trigger 与 content 用同一对 id 互指', () => {
    const t = makeTabs()
    const trigger = t.api().getTriggerProps({ value: 'logs' }) as Dict
    const content = t.api().getContentProps({ value: 'logs' }) as Dict
    expect(trigger['aria-controls']).toBe(content.id)
    expect(content['aria-labelledby']).toBe(trigger.id)
  })
})

describe('标签页 · 键盘落在 list 上收口', () => {
  it('方向键搬焦点并发 NAVIGATE，同时挡掉默认滚动', () => {
    const list = mountDom()
    const t = makeTabs({ defaultValue: 'overview' })
    const { preventDefault } = pressList(t, { key: 'ArrowRight', currentTarget: list })

    expect(preventDefault).toHaveBeenCalled()
    // 顺序即文档序，起点是锚点；禁用的 api 被跳过
    expect(t.focused()).toBe('logs')
  })

  it('不归导航管的键一次都不挡默认行为', () => {
    const list = mountDom()
    const t = makeTabs()
    const { preventDefault } = pressList(t, { key: 'a', currentTarget: list })
    expect(preventDefault).not.toHaveBeenCalled()
  })

  it('确认键认焦点当下所在的 trigger', () => {
    const list = mountDom()
    const t = makeTabs({ activationMode: 'manual' })
    const { preventDefault } = pressList(t, {
      key: 'Enter',
      currentTarget: list,
      target: triggerEl(list, 'logs'),
    })

    expect(preventDefault).toHaveBeenCalled()
    expect(t.api().value).toBe('logs')
  })

  it('确认键落在自报禁用的条目上不认', () => {
    const list = mountDom()
    const t = makeTabs({ activationMode: 'manual' })
    pressList(t, { key: 'Enter', currentTarget: list, target: triggerEl(list, 'api') })
    expect(t.api().value).toBeNull()
  })
})

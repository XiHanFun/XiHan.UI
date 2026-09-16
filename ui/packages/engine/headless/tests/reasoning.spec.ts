import type { ToolCallOpenChangeDetails, ToolCallSchema } from '../src/tool-call'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectReasoning, reasoningDuration, reasoningStatusText } from '../src/reasoning'
import { toolCallMachine } from '../src/tool-call'

type MachineProps = ToolCallSchema['props']

/** 自动开合整套复用 tool-call 的机器，本组件只配自己的 anatomy 与文案。 */
function makeReasoning(initial: MachineProps = {}) {
  const changes: ToolCallOpenChangeDetails[] = []
  const runtime = createVanillaRuntime()
  const props = runtime.signal<MachineProps>({ ...initial, onOpenChange: d => changes.push(d) })
  const service = createService(toolCallMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    changes,
    state: () => service.state.get(),
    api: (view: Parameters<typeof connectReasoning>[1] = {}) => connectReasoning(service, view, normalizeProps),
    setProps: (next: MachineProps) => props.set({ ...props.get(), ...next }),
    stop: () => runtime.stop(),
  }
}

describe('reasoningDuration / reasoningStatusText', () => {
  it('两个时刻齐了才算时长，倒着的与非有限的一律算没有', () => {
    expect(reasoningDuration(1000, 4000)).toBe(3000)
    expect(reasoningDuration(1000, undefined)).toBeUndefined()
    expect(reasoningDuration(4000, 1000)).toBeUndefined()
    expect(reasoningDuration(0, Number.NaN)).toBeUndefined()
  })

  it('在想就说在想；想完了没时长只报名字，有时长按秒代入模板、保留一位小数', () => {
    expect(reasoningStatusText(true, 3000)).toBe('Thinking…')
    expect(reasoningStatusText(false, undefined)).toBe('Thought process')
    expect(reasoningStatusText(false, 3000)).toBe('Thought for 3s')
    expect(reasoningStatusText(false, 12_340)).toBe('Thought for 12.3s')
    expect(reasoningStatusText(false, 2500, { thoughtFor: '想了 {seconds} 秒' })).toBe('想了 2.5 秒')
    expect(reasoningStatusText(true, undefined, { thinking: '正在思考…' })).toBe('正在思考…')
  })
})

describe('connectReasoning 投影', () => {
  it('trigger 与 content 互指，不发 aria-label 让节点里的文字自然成名；收起的 content 带 hidden 与 inert', () => {
    const r = makeReasoning()
    const trigger = r.api().getTriggerProps() as Record<string, unknown>
    const content = r.api().getContentProps() as Record<string, unknown>
    expect(trigger).toMatchObject({ 'type': 'button', 'aria-expanded': 'false', 'data-state': 'closed' })
    // 开关接 Action Control 的 disclosure-trigger 档：ghost 形态、按下只换面；不写 size 时档位取 sm
    expect(trigger).toMatchObject({
      'data-xh-action-control': '',
      'data-xh-action-profile': 'disclosure-trigger',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'sm',
    })
    expect((r.api({ size: 'lg' }).getTriggerProps() as Record<string, unknown>)['data-xh-action-size']).toBe('lg')
    expect(trigger['aria-label']).toBeUndefined()
    expect(trigger['aria-controls']).toBe(content.id)
    expect(content).toMatchObject({ role: 'region', hidden: true, inert: true })
    expect(content['aria-labelledby']).toBe(trigger.id)
    r.stop()
  })

  it('streaming 落到根、trigger、图标、标签、时长上；根不发 aria-busy；statusText 与 durationMs 经 api 透出', () => {
    const r = makeReasoning()
    const thinking = r.api({ streaming: true, startTime: 1000 })
    expect(thinking.streaming).toBe(true)
    expect(thinking.durationMs).toBeUndefined()
    expect(thinking.statusText).toBe('Thinking…')
    expect(thinking.getRootProps()).toMatchObject({ 'data-streaming': '' })
    expect((thinking.getRootProps() as Record<string, unknown>)['aria-busy']).toBeUndefined()
    expect(thinking.getTriggerProps()).toMatchObject({ 'data-streaming': '' })
    expect(thinking.getIconProps()).toMatchObject({ 'aria-hidden': true, 'data-streaming': '' })
    expect(thinking.getLabelProps()).toMatchObject({ 'data-streaming': '' })
    expect(thinking.getDurationProps()).toMatchObject({ 'data-streaming': '' })

    const done = r.api({ streaming: false, startTime: 1000, endTime: 4000, variant: 'outline', tone: 'brand', size: 'sm' })
    expect(done.durationMs).toBe(3000)
    expect(done.statusText).toBe('Thought for 3s')
    expect(done.getRootProps()).toMatchObject({ 'data-variant': 'outline', 'data-tone': 'brand', 'data-size': 'sm' })
    expect((done.getRootProps() as Record<string, unknown>)['data-streaming']).toBeUndefined()
    r.stop()
  })

  it('variant 不写时根落 subtle；写 outline 如实落', () => {
    const r = makeReasoning()
    expect(r.api().getRootProps()).toMatchObject({ 'data-variant': 'subtle' })
    expect(r.api({ variant: 'outline' }).getRootProps()).toMatchObject({ 'data-variant': 'outline' })
    r.stop()
  })

  it('禁用走原生 disabled，点不动', () => {
    const r = makeReasoning({ disabled: true })
    expect(r.api().disabled).toBe(true)
    expect(r.api().getTriggerProps()).toMatchObject({ 'disabled': true, 'data-disabled': '' })
    ;(r.api().getTriggerProps() as { onClick: () => void }).onClick()
    expect(r.api().open).toBe(false)
    expect(r.changes).toEqual([])
    r.stop()
  })
})

describe('connectReasoning 开合', () => {
  it('点 trigger 来回切并带 source=user 通知；setOpen 走 api 通道，同值不发', () => {
    const r = makeReasoning()
    ;(r.api().getTriggerProps() as { onClick: () => void }).onClick()
    expect(r.api().open).toBe(true)
    expect(r.api().getIndicatorProps()).toMatchObject({ 'aria-hidden': true, 'data-state': 'open' })
    r.api().setOpen(false)
    r.api().setOpen(false)
    expect(r.api().open).toBe(false)
    expect(r.changes).toEqual([{ open: true, source: 'user' }, { open: false, source: 'api' }])
    r.stop()
  })

  it('running 翻起来自动展开、落定自动收起；用户手动开合过一次之后自动开合就不再插手', () => {
    const r = makeReasoning()
    r.setProps({ running: true })
    expect(r.api().open).toBe(true)
    r.setProps({ running: false })
    expect(r.api().open).toBe(false)
    expect(r.changes).toEqual([{ open: true, source: 'auto' }, { open: false, source: 'auto' }])

    ;(r.api().getTriggerProps() as { onClick: () => void }).onClick()
    expect(r.state()).toBe('held.expanded')
    r.setProps({ running: true })
    r.setProps({ running: false })
    expect(r.api().open).toBe(true)
    expect(r.changes).toHaveLength(3)
    r.stop()
  })

  it('受控 open：点击只发意图不自改，宿主写回后才切', () => {
    const r = makeReasoning({ open: false })
    ;(r.api().getTriggerProps() as { onClick: () => void }).onClick()
    expect(r.api().open).toBe(false)
    expect(r.changes).toEqual([{ open: true, source: 'user' }])
    r.setProps({ open: true })
    expect(r.api().open).toBe(true)
    r.stop()
  })
})

import type { ToolCallOpenChangeDetails, ToolCallProps, ToolCallSchema } from '../src/tool-call'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import {
  connectToolCall,
  isToolCallErrored,
  isToolCallRunning,
  isToolCallSettled,
  toneOfToolCallPhase,
  toolCallDuration,
  toolCallMachine,
  toolCallStatusText,
} from '../src/tool-call'

type MachineProps = ToolCallSchema['props']

function makeToolCall(initial: MachineProps = {}) {
  const changes: ToolCallOpenChangeDetails[] = []
  const runtime = createVanillaRuntime()
  const props = runtime.signal<MachineProps>({ ...initial, onOpenChange: d => changes.push(d) })
  const service = createService(toolCallMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    changes,
    state: () => service.state.get(),
    api: (view: ToolCallProps = {}) => connectToolCall(service, view, normalizeProps),
    click: () => (connectToolCall(service, {}, normalizeProps).getTriggerProps() as { onClick: () => void }).onClick(),
    setProps: (next: MachineProps) => props.set({ ...props.get(), ...next }),
    stop: () => runtime.stop(),
  }
}

describe('tool-call 阶段派生', () => {
  it('只有 input-streaming 算在跑；两个 output 阶段算落定，其中 error 算出错；语气逐阶段映射', () => {
    expect(isToolCallRunning('input-streaming')).toBe(true)
    expect(isToolCallRunning('input-available')).toBe(false)
    expect(isToolCallSettled('output-available')).toBe(true)
    expect(isToolCallSettled('output-error')).toBe(true)
    expect(isToolCallSettled('awaiting-approval')).toBe(false)
    expect(isToolCallErrored('output-error')).toBe(true)
    expect(isToolCallErrored('output-available')).toBe(false)
    expect(['input-streaming', 'input-available', 'awaiting-approval', 'output-available', 'output-error'].map(p => toneOfToolCallPhase(p as never)))
      .toEqual(['info', 'neutral', 'warning', 'success', 'danger'])
  })

  it('状态文案按阶段给缺省并可整句替换；时长两个时刻齐了才算，倒着的算没有', () => {
    expect(toolCallStatusText('input-streaming')).toBe('Preparing…')
    expect(toolCallStatusText('input-available')).toBe('Running…')
    expect(toolCallStatusText('awaiting-approval')).toBe('Waiting for approval')
    expect(toolCallStatusText('output-available')).toBe('Completed')
    expect(toolCallStatusText('output-error', { outputError: '失败了' })).toBe('失败了')
    expect(toolCallDuration(10, 250)).toBe(240)
    expect(toolCallDuration(250, 10)).toBeUndefined()
    expect(toolCallDuration(undefined, 10)).toBeUndefined()
  })
})

describe('connectToolCall 投影', () => {
  it('根的 data-state 是开合，阶段落在各部件的 data-state 上；根另带 loading / settled / errored 三位，不发 aria-busy', () => {
    const t = makeToolCall()
    const running = t.api({ phase: 'input-streaming' })
    expect(running.getRootProps()).toMatchObject({ 'data-state': 'closed', 'data-loading': '' })
    expect((running.getRootProps() as Record<string, unknown>)['aria-busy']).toBeUndefined()
    expect(running.getLabelProps()).toMatchObject({ 'data-state': 'input-streaming' })
    expect(running.getDurationProps()).toMatchObject({ 'data-state': 'input-streaming', 'data-loading': '' })
    expect(running.running).toBe(true)

    const failed = t.api({ phase: 'output-error', variant: 'outline', tone: 'danger', size: 'sm' })
    expect(failed.getRootProps()).toMatchObject({ 'data-settled': '', 'data-errored': '', 'data-variant': 'outline', 'data-tone': 'danger', 'data-size': 'sm' })
    expect((failed.getRootProps() as Record<string, unknown>)['data-loading']).toBeUndefined()
    expect(failed.settled).toBe(true)
    expect(failed.errored).toBe(true)
    expect(failed.statusText).toBe('Failed')
    // 缺省阶段是 input-available
    expect(t.api().phase).toBe('input-available')
    t.stop()
  })

  it('variant 不写时根落 outline；写 subtle 如实落', () => {
    const t = makeToolCall()
    expect(t.api().getRootProps()).toMatchObject({ 'data-variant': 'outline' })
    expect(t.api({ variant: 'subtle' }).getRootProps()).toMatchObject({ 'data-variant': 'subtle' })
    t.stop()
  })

  it('trigger 与 content 互指；只在出错时把错误文本挂进描述链；审批位只在等待批准时露出', () => {
    const t = makeToolCall()
    const plain = t.api({ phase: 'output-available' })
    const trigger = plain.getTriggerProps() as Record<string, unknown>
    expect(trigger).toMatchObject({ 'type': 'button', 'aria-expanded': 'false' })
    // 开关接 Action Control 的 disclosure-trigger 档：ghost 形态、按下只换面，档位随 size 走
    expect(trigger).toMatchObject({
      'data-xh-action-control': '',
      'data-xh-action-profile': 'disclosure-trigger',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'md',
    })
    expect((t.api({ phase: 'output-available', size: 'sm' }).getTriggerProps() as Record<string, unknown>)['data-xh-action-size']).toBe('sm')
    expect(trigger['aria-controls']).toBe((plain.getContentProps() as Record<string, unknown>).id)
    expect(trigger['aria-describedby']).toBeUndefined()
    expect((plain.getApprovalProps() as Record<string, unknown>).hidden).toBe(true)

    const errored = t.api({ phase: 'output-error' })
    expect((errored.getTriggerProps() as Record<string, unknown>)['aria-describedby']).toBe((errored.getErrorProps() as Record<string, unknown>).id)

    const waiting = t.api({ phase: 'awaiting-approval' })
    expect((waiting.getApprovalProps() as Record<string, unknown>).hidden).toBeUndefined()
    expect(waiting.getApprovalProps()).toMatchObject({ 'data-state': 'awaiting-approval' })
    t.stop()
  })

  it('收起的 content 带 hidden 与 inert；时长由宿主给的两个时刻算出', () => {
    const t = makeToolCall()
    expect(t.api().getContentProps()).toMatchObject({ 'role': 'region', 'hidden': true, 'inert': true, 'data-state': 'closed' })
    expect(t.api({ startTime: 100, endTime: 1600 }).durationMs).toBe(1500)
    expect(t.api({ startTime: 100 }).durationMs).toBeUndefined()
    t.stop()
  })
})

describe('toolCallMachine 自动开合', () => {
  it('起步：open / defaultOpen 显式给了听它们，否则跟着 running', () => {
    expect(makeToolCall().state()).toBe('auto.collapsed')
    expect(makeToolCall({ running: true }).state()).toBe('auto.expanded')
    expect(makeToolCall({ running: true, defaultOpen: false }).state()).toBe('auto.collapsed')
    expect(makeToolCall({ open: true }).state()).toBe('auto.expanded')
  })

  it('running 翻起自动展开、落定自动收起，各带 source=auto；autoDisclosure=false 关掉这条路', () => {
    const t = makeToolCall()
    t.setProps({ running: true })
    expect(t.api().open).toBe(true)
    t.setProps({ running: false })
    expect(t.api().open).toBe(false)
    expect(t.changes).toEqual([{ open: true, source: 'auto' }, { open: false, source: 'auto' }])
    t.stop()

    const manual = makeToolCall({ autoDisclosure: false })
    manual.setProps({ running: true })
    expect(manual.api().open).toBe(false)
    expect(manual.changes).toEqual([])
    manual.stop()
  })

  it('用户点过一次即进 held：之后阶段变化够不着自动开合；api 的 OPEN / CLOSE 在 held 里照常走', () => {
    const t = makeToolCall()
    t.click()
    expect(t.state()).toBe('held.expanded')
    expect(t.changes).toEqual([{ open: true, source: 'user' }])
    t.setProps({ running: true })
    t.setProps({ running: false })
    expect(t.api().open).toBe(true)

    t.api().setOpen(false)
    expect(t.state()).toBe('held.collapsed')
    expect(t.changes.at(-1)).toEqual({ open: false, source: 'api' })
    t.click()
    expect(t.state()).toBe('held.expanded')
    t.stop()
  })

  it('受控 open：点击、api 与 running 都只发意图不自改，宿主写回后才转移且不再通知', () => {
    const t = makeToolCall({ open: false })
    t.click()
    expect(t.api().open).toBe(false)
    t.setProps({ running: true })
    expect(t.api().open).toBe(false)
    expect(t.changes).toEqual([{ open: true, source: 'user' }])
    t.setProps({ open: true })
    expect(t.api().open).toBe(true)
    expect(t.changes).toHaveLength(1)
    t.stop()
  })

  it('禁用走原生 disabled，点不动', () => {
    const t = makeToolCall({ disabled: true })
    expect(t.api().disabled).toBe(true)
    expect(t.api().getTriggerProps()).toMatchObject({ 'disabled': true, 'data-disabled': '' })
    t.click()
    expect(t.api().open).toBe(false)
    expect(t.changes).toEqual([])
    t.stop()
  })
})

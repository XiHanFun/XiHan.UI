// 对话框与抽屉的标准结构（shared/panel-structure）与页脚两颗钮的确认门。
//
// 结构：给了哪段内容才铺哪段；页脚按 actions 铺取消与确定，footer 插槽整段接管；按钮文字缺省取语言包；
// withoutPanelShell 摘掉遮罩与定位层、把 content 提到原处。
// 确认门：同步确认即收起，thenable 挂起期间 setOpen(false) 无效、确定钮带 aria-busy，兑现才收起，拒绝留在原地；
// 关闭钮随时收得起并作废挂起中的确认，不发取消意图。
import type { DialogActionIntents, DialogConfirmErrorDetails, DialogSchema, StructureChild } from '../src'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { connectDialog, dialogMachine, dialogStructure, drawerStructure, withoutPanelShell } from '../src'

/** 结构树按文档序摊平成「部件:文字或插槽」。 */
function flat(nodes: readonly StructureChild[]): string[] {
  return nodes.flatMap((node) => {
    if (!('part' in node))
      return []
    const label = node.slot ? `${node.part}<${node.slot.name}>` : node.text !== undefined ? `${node.part}:${node.text}` : node.part
    return [label, ...flat(node.children ?? [])]
  })
}

describe('标准结构', () => {
  it('三个文字选项铺出确认对话框：触发器、遮罩、定位层，content 里是页头、页脚的取消与确定、关闭钮', () => {
    expect(flat(dialogStructure({ triggerText: '删除', title: '删除文件？', description: '无法恢复' }))).toEqual([
      'trigger:删除',
      'backdrop',
      'positioner',
      'content',
      'header',
      'title:删除文件？',
      'description:无法恢复',
      'footer',
      'cancel-trigger:Cancel',
      'confirm-trigger:OK',
      'close-trigger',
    ])
  })

  it('actions 换页脚：alert 只有确定，none 不铺；按钮文字可改，缺省取语言包', () => {
    expect(flat(dialogStructure({ actions: 'alert', confirmText: '知道了' })).filter(p => p.startsWith('footer') || p.includes('-trigger'))).toEqual(['footer', 'confirm-trigger:知道了', 'close-trigger'])
    expect(flat(dialogStructure({ actions: 'none' }))).not.toContain('footer')
    expect(flat(dialogStructure({ translations: { ok: '确定', cancel: '取消' } }))).toEqual(expect.arrayContaining(['cancel-trigger:取消', 'confirm-trigger:确定']))
  })

  it('插槽压过文字；footer 插槽整段接管页脚；body 只在给了时铺；没有标题与说明不铺页头', () => {
    const slotted = new Set(['trigger', 'title', 'body', 'footer'])
    expect(flat(dialogStructure({ title: '不会用到', slotted: name => slotted.has(name) }))).toEqual([
      'trigger<trigger>',
      'backdrop',
      'positioner',
      'content',
      'header',
      'title<title>',
      'body<body>',
      'footer<footer>',
      'close-trigger',
    ])
    expect(flat(dialogStructure())).not.toContain('header')
    expect(flat(dialogStructure())).not.toContain('trigger')
  })

  it('抽屉同一份结构；开了改尺时 content 末尾是改尺把手', () => {
    const tail = flat(drawerStructure({ resizable: true })).slice(-2)
    expect(tail).toEqual(['close-trigger', 'resize-trigger'])
    expect(flat(drawerStructure())).not.toContain('resize-trigger')
  })

  it('withoutPanelShell 摘掉遮罩与定位层，content 提到原处', () => {
    const shelled = withoutPanelShell(dialogStructure({ triggerText: '开' }))
    expect(shelled.map(node => ('part' in node ? node.part : ''))).toEqual(['trigger', 'content'])
  })
})

function makeService(props: DialogSchema['props'] = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(dialogMachine, { props: () => props, runtime })
  runtime.start()
  return service
}

/** 适配器那一侧：pending 与 actionError 由这里持有，每次 connect 现读。 */
function intentsOf(onConfirm: DialogActionIntents['onConfirm'], extra: Partial<DialogActionIntents> = {}) {
  const state = { pending: false, actionError: null as DialogConfirmErrorDetails | null }
  const intents = (): DialogActionIntents => ({
    ...extra,
    onConfirm,
    pending: state.pending,
    onPendingChange: (next) => { state.pending = next },
    actionError: state.actionError,
    onActionErrorChange: (next) => { state.actionError = next },
  })
  return { state, intents }
}

const click = (props: unknown): void => (props as { onClick: () => void }).onClick()

describe('确认门', () => {
  it('同步确认：回调跑完即收起；取消发 onCancelPress 并收起', () => {
    const service = makeService({ defaultOpen: true })
    const onConfirm = vi.fn()
    const onCancelPress = vi.fn()
    const { intents } = intentsOf(onConfirm, { onCancelPress })
    click(connectDialog(service, normalizeProps, intents()).getConfirmTriggerProps())
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(service.state.get()).toBe('closed')

    connectDialog(service, normalizeProps, intents()).setOpen(true)
    click(connectDialog(service, normalizeProps, intents()).getCancelTriggerProps())
    expect(onCancelPress).toHaveBeenCalledTimes(1)
    expect(service.state.get()).toBe('closed')
  })

  it('thenable：挂起期间转圈、setOpen(false) 无效，兑现才收起；拒绝留在原地并报错', async () => {
    const service = makeService({ defaultOpen: true })
    let settle!: { resolve: () => void, reject: (cause: unknown) => void }
    const onConfirmError = vi.fn()
    const { state, intents } = intentsOf(() => new Promise<void>((resolve, reject) => {
      settle = { resolve, reject }
    }), { onConfirmError })

    click(connectDialog(service, normalizeProps, intents()).getConfirmTriggerProps())
    const pendingApi = connectDialog(service, normalizeProps, intents())
    expect(state.pending).toBe(true)
    expect(pendingApi.pending).toBe(true)
    expect((pendingApi.getConfirmTriggerProps() as Record<string, unknown>)['aria-busy']).toBe('true')
    pendingApi.setOpen(false)
    expect(service.state.get()).toBe('open')

    settle.reject(new Error('失败'))
    await new Promise(r => setTimeout(r, 0))
    expect(onConfirmError).toHaveBeenCalledWith({ cause: new Error('失败') })
    expect(state.pending).toBe(false)
    expect(service.state.get()).toBe('open')

    click(connectDialog(service, normalizeProps, intents()).getConfirmTriggerProps())
    settle.resolve()
    await new Promise(r => setTimeout(r, 0))
    expect(service.state.get()).toBe('closed')
  })

  it('关闭钮收得起挂起中的面板：确认作废、不发取消意图，迟到的兑现不再写回', async () => {
    const service = makeService({ defaultOpen: true })
    let settle!: () => void
    const onCancelPress = vi.fn()
    const { state, intents } = intentsOf(() => new Promise<void>((resolve) => {
      settle = resolve
    }), { onCancelPress })

    click(connectDialog(service, normalizeProps, intents()).getConfirmTriggerProps())
    expect(state.pending).toBe(true)
    click(connectDialog(service, normalizeProps, intents()).getCloseTriggerProps())
    expect(service.state.get()).toBe('closed')
    expect(state.pending).toBe(false)
    expect(onCancelPress).not.toHaveBeenCalled()

    connectDialog(service, normalizeProps, intents()).setOpen(true)
    settle()
    await new Promise(r => setTimeout(r, 0))
    expect(service.state.get()).toBe('open')
  })
})

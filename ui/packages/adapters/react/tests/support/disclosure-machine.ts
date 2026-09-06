import type { MachineConfig, MachineSchema } from '@xihan-ui/core'
import { setup } from '@xihan-ui/core'

/**
 * 判据用的最小机器：一个开合件，接线形状照 dialog 那台真机器写
 * （受控走「意图 + 回写」两段式，watch 追 prop('open') 派发 CONTROLLED.*）。
 * 只挑运行时接缝真正要负责的四件事——受控 cell、拉式 track、提交后 flush、挂载钩子。
 */
export interface DisclosureSchema extends MachineSchema {
  props: {
    open?: boolean
    defaultOpen?: boolean
    label?: string
    onOpenChange?: (open: boolean) => void
    /** 提交后回调：拿到的是 flush 那一刻文档里的实况 */
    onAfterCommit?: (seen: { content: boolean, hidden: boolean | null }) => void
    /** track 观测到 label 变化时调一次 */
    onLabelSeen?: (label: string | undefined) => void
    onMounted?: () => void
    onCleaned?: () => void
  }
  context: { open: boolean }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'closed' | 'open'
  event:
    | { type: 'TOGGLE' }
    | { type: 'OPEN' }
    | { type: 'CLOSE' }
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
  tag: never
  guard: 'isOpenControlled'
  action: 'writeOpen' | 'writeClosed' | 'notifyOpen' | 'notifyClosed' | 'probeAfterCommit' | 'probeLabel' | 'syncOpen'
  effect: 'lifecycle'
}

/** flush 那一刻文档里的实况：内容节点在不在、若在是否还带着 hidden。 */
function readDocument(): { content: boolean, hidden: boolean | null } {
  const node = globalThis.document?.querySelector('[data-testid="content"]')
  return { content: node != null, hidden: node ? node.hasAttribute('hidden') : null }
}

export function createDisclosureMachine(): MachineConfig<DisclosureSchema> {
  const { createMachine } = setup<DisclosureSchema>()
  return createMachine({
    name: 'disclosure',
    context: ({ prop, cell }) => ({
      open: cell(() => ({
        value: prop('open'),
        defaultValue: prop('defaultOpen') ?? false,
      })),
    }),
    initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
    // 两条都只在 props 上变，永不经过 cell.set：推式 track 一条都看不见
    watch: ({ track, prop, action }) => {
      track([() => prop('open')], () => action(['syncOpen']))
      track([() => prop('label')], () => action(['probeLabel']))
    },
    effects: ['lifecycle'],
    on: {
      'CONTROLLED.OPEN': { target: 'open', actions: ['writeOpen'] },
      'CONTROLLED.CLOSE': { target: 'closed', actions: ['writeClosed'] },
    },
    states: {
      closed: {
        on: {
          // 受控命中只发意图，非受控才落 target
          TOGGLE: [
            { guard: 'isOpenControlled', actions: ['notifyOpen'] },
            { target: 'open', actions: ['writeOpen', 'notifyOpen'] },
          ],
          OPEN: [
            { guard: 'isOpenControlled', actions: ['notifyOpen'] },
            { target: 'open', actions: ['writeOpen', 'notifyOpen'] },
          ],
        },
      },
      open: {
        entry: ['probeAfterCommit'],
        on: {
          TOGGLE: [
            { guard: 'isOpenControlled', actions: ['notifyClosed'] },
            { target: 'closed', actions: ['writeClosed', 'notifyClosed'] },
          ],
          CLOSE: [
            { guard: 'isOpenControlled', actions: ['notifyClosed'] },
            { target: 'closed', actions: ['writeClosed', 'notifyClosed'] },
          ],
        },
      },
    },
    implementations: {
      guards: {
        isOpenControlled: ({ prop }) => prop('open') !== undefined,
      },
      actions: {
        writeOpen: ({ context }) => context.set('open', true),
        writeClosed: ({ context }) => context.set('open', false),
        notifyOpen: ({ prop }) => prop('onOpenChange')?.(true),
        notifyClosed: ({ prop }) => prop('onOpenChange')?.(false),
        // 宿主把新值写回来之后才派发，受控组件因此不会自己动
        syncOpen: ({ prop, send }) => {
          const next = prop('open')
          if (next === undefined)
            return
          send({ type: next ? 'CONTROLLED.OPEN' : 'CONTROLLED.CLOSE' })
        },
        // 契约：这一回调必须在宿主提交完这次渲染、DOM 已经落定之后才跑
        probeAfterCommit: ({ flush, prop }) => {
          flush(() => prop('onAfterCommit')?.(readDocument()))
        },
        probeLabel: ({ prop }) => prop('onLabelSeen')?.(prop('label')),
      },
      effects: {
        lifecycle: ({ prop }) => {
          prop('onMounted')?.()
          return () => prop('onCleaned')?.()
        },
      },
    },
  })
}

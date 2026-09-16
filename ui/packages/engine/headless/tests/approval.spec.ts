// @vitest-environment jsdom
import type { Service } from '@xihan-ui/core'
import type { ApprovalApi, ApprovalDecisionDetails, ApprovalSchema } from '../src/approval'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
// 直接从组件目录导入，不经包主入口
import { approvalMachine, connectApproval } from '../src/approval'

type Props = ApprovalSchema['props']
type Dict = Record<string, unknown>

interface Rig {
  service: Service<ApprovalSchema>
  api: () => ApprovalApi
  approve: () => Dict
  deny: () => Dict
  root: () => Dict
  /** 运行期改 props，loading 翻转走它。 */
  setProps: (next: Props) => void
  decisions: ApprovalDecisionDetails[]
}

/** 把 props 挂在 signal 上，使 watch 里的 track 能收到运行期改动。 */
function mount(initial: Props = {}): Rig {
  const runtime = createVanillaRuntime()
  const decisions: ApprovalDecisionDetails[] = []
  const props = runtime.signal<Props>({
    ...initial,
    onDecision: (d) => {
      decisions.push(d)
      initial.onDecision?.(d)
    },
  })
  const service = createService(approvalMachine, { props: () => props.get(), runtime })
  runtime.start()

  const api = (): ApprovalApi => connectApproval(service, normalizeProps)
  return {
    service,
    api,
    approve: () => api().getApproveTriggerProps() as Dict,
    deny: () => api().getDenyTriggerProps() as Dict,
    root: () => api().getRootProps() as Dict,
    setProps: next => props.set({ ...props.get(), ...next }),
    decisions,
  }
}

function click(props: Dict): void {
  (props.onClick as () => void)()
}

/** Escape 按键桩，连接层读 key / isComposing，并会调 preventDefault。 */
function escape(props: Dict): void {
  (props.onKeyDown as (e: unknown) => void)({
    key: 'Escape',
    isComposing: false,
    keyCode: 27,
    preventDefault: vi.fn(),
  })
}

describe('approval：Action Control 家族属性', () => {
  it('两颗钮接 text 档：批准 solid、拒绝 outline；授权行接 row 档 ghost；档位随 size 缺省 md', () => {
    const r = mount({ scopes: [{ value: 'read' }] })
    expect(r.approve()).toMatchObject({
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-variant': 'solid',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'md',
    })
    expect(r.deny()).toMatchObject({
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-variant': 'outline',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'md',
    })
    expect(r.api().getItemProps({ value: 'read' })).toMatchObject({
      'data-xh-action-control': '',
      'data-xh-action-profile': 'row',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'md',
    })
    const sm = mount({ size: 'sm', scopes: [{ value: 'read' }] })
    expect(sm.approve()['data-xh-action-size']).toBe('sm')
    expect((sm.api().getItemProps({ value: 'read' }) as Dict)['data-xh-action-size']).toBe('sm')
  })

  // 家族的深色 solid 规则只看触发器自身的 data-tone：不投的话暗色下实心面被改写成品牌色，
  // 与亮色下的语气色对不上。语气轴由连接层作真源投到钮上，与 Button 同构；描边形态的拒绝钮不吃这条
  it('语气投在批准钮自己身上：与根同值，没打语气时不投；拒绝钮不投', () => {
    const plain = mount({ scopes: [{ value: 'read' }] })
    expect(plain.root()['data-tone']).toBeUndefined()
    expect(plain.approve()['data-tone']).toBeUndefined()

    const danger = mount({ tone: 'danger', scopes: [{ value: 'read' }] })
    expect(danger.root()['data-tone']).toBe('danger')
    expect(danger.approve()['data-tone']).toBe('danger')
    expect(danger.deny()['data-tone']).toBeUndefined()
  })

  // 家族只认 data-disabled 给禁用面：没勾满与落定都投它，在途那一档另有在途面、不投
  it('data-disabled 三档：闲时不投；必选项没勾满只投批准；落定两颗都投；在途两颗都不投', () => {
    const idle = mount({ scopes: [{ value: 'read' }] })
    expect(idle.approve()['data-disabled']).toBeUndefined()
    expect(idle.deny()['data-disabled']).toBeUndefined()

    const gated = mount({ scopes: [{ value: 'read', required: true }] })
    expect(gated.approve()['aria-disabled']).toBe('true')
    expect(gated.approve()['data-disabled']).toBe('')
    expect(gated.deny()['data-disabled']).toBeUndefined()

    const settled = mount({ defaultStatus: 'approved' })
    expect(settled.approve()['data-disabled']).toBe('')
    expect(settled.deny()['data-disabled']).toBe('')

    const loading = mount({ loading: true, scopes: [{ value: 'read', required: true }] })
    expect(loading.approve()['data-disabled']).toBeUndefined()
    expect(loading.deny()['data-disabled']).toBeUndefined()
  })
})

describe('判定在途（loading）', () => {
  it('批准与拒绝一起锁：两颗钮的 aria 与 data 位同构', () => {
    const r = mount({ loading: true })
    for (const btn of [r.approve(), r.deny()]) {
      expect(btn['aria-disabled']).toBe('true')
      expect(btn['aria-busy']).toBe('true')
      expect(btn['data-loading']).toBe('')
    }
  })

  it('不用原生 disabled 锁：待决期两颗钮都还留在 Tab 序里，读屏才念得到为什么按不动', () => {
    const r = mount({ loading: true })
    expect(r.approve().disabled).toBeUndefined()
    expect(r.deny().disabled).toBeUndefined()
  })

  it('闲时两颗钮都不带 loading 位', () => {
    const r = mount()
    expect(r.deny()['aria-disabled']).toBe('false')
    expect(r.deny()['aria-busy']).toBeUndefined()
    expect(r.deny()['data-loading']).toBeUndefined()
  })

  // 这一条是整份用例的目的：等待宿主回话的那段空窗里，人还能再按一次拒绝，
  // 闸门后面的系统就会收到两条判定
  it('等待期里再点拒绝不产生第二条判定', () => {
    const r = mount()
    click(r.deny())
    expect(r.decisions).toHaveLength(1)
    expect(r.decisions[0]!.decision).toBe('denied')

    // 宿主接住第一条判定后置 loading 等回话；此时状态机已落 denied，再补一轮受控待决
    r.setProps({ status: 'pending', loading: true })
    expect(r.service.state.get()).toBe('pending')

    click(r.deny())
    expect(r.decisions).toHaveLength(1)
  })

  it('等待期里再点批准同样不产生第二条判定——两颗钮同一把尺子', () => {
    const r = mount({ status: 'pending', loading: true })
    click(r.approve())
    click(r.deny())
    expect(r.decisions).toHaveLength(0)
  })

  // Escape 是拒绝钮的键盘等价物，只锁住钮的话这条路仍能打出第二条
  it('等待期里按 Escape 同样不产生第二条判定', () => {
    const r = mount({ status: 'pending', loading: true })
    escape(r.root())
    expect(r.decisions).toHaveLength(0)
  })

  it('闲时 Escape 照常判为拒绝', () => {
    const r = mount()
    escape(r.root())
    expect(r.decisions.map(d => d.source)).toEqual(['escape'])
  })

  it('loading 撤掉后拒绝立刻恢复可按', () => {
    const r = mount({ status: 'pending', loading: true })
    click(r.deny())
    expect(r.decisions).toHaveLength(0)

    r.setProps({ loading: false })
    click(r.deny())
    expect(r.decisions).toHaveLength(1)
  })
})

describe('拒绝这条路本身不吃闸门', () => {
  it('必选项没勾满时批不了，但拒得掉', () => {
    const r = mount({ scopes: [{ value: 'write', required: true }] })
    expect(r.api().canApprove).toBe(false)
    click(r.approve())
    expect(r.decisions).toHaveLength(0)

    click(r.deny())
    expect(r.decisions.map(d => d.decision)).toEqual(['denied'])
  })

  it('宿主的 deny() 入口不受 loading 影响：锁住的只是那颗按钮', () => {
    const onDecision = vi.fn()
    const r = mount({ loading: true, onDecision })
    r.api().deny()
    expect(onDecision).toHaveBeenCalledTimes(1)
    expect(onDecision.mock.calls[0]![0].source).toBe('api')
  })
})

describe('connectApproval 投影', () => {
  it('variant 不写时根落 outline；写 subtle 如实落', () => {
    expect(mount().root()).toMatchObject({ 'data-variant': 'outline' })
    expect(mount({ variant: 'subtle' }).root()).toMatchObject({ 'data-variant': 'subtle' })
  })
})

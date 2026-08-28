// @vitest-environment jsdom
// 节点拖拽：纯算法（落点合法性、折算、命令）与机器/连接层（激活、三档落点、播报）。
import type { TreeNode, TreeNodeMeta, TreeSchema } from '../src/tree'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  connectTree,
  indexTree,
  isSelfOrDescendant,
  isTreeDropAllowed,
  treeMachine,
  treeMoveCommand,
  treeMoveIntentFromKey,
  treeMoveOf,
} from '../src/tree'

/**
 * 收件箱
 *   ├ 报价单
 *   └ 项目
 *      ├ 周报
 *      └ 附件
 * 归档
 *   └ 去年总结
 * 回收站
 */
const COLLECTION: TreeNode[] = [
  {
    value: 'inbox',
    children: [
      { value: 'quote' },
      { value: 'project', children: [{ value: 'weekly' }, { value: 'attach' }] },
    ],
  },
  { value: 'archive', children: [{ value: 'last-year' }] },
  { value: 'trash', children: [] },
]

const META: ReadonlyMap<string, TreeNodeMeta> = indexTree(COLLECTION)

describe('自己与后代', () => {
  it('自己就是自己的后代——落到自己身上不是一次移动', () => {
    expect(isSelfOrDescendant(META.get('project'), META.get('project'))).toBe(true)
  })

  it('孩子与孙子都算', () => {
    expect(isSelfOrDescendant(META.get('inbox'), META.get('project'))).toBe(true)
    expect(isSelfOrDescendant(META.get('inbox'), META.get('weekly'))).toBe(true)
  })

  it('兄弟与祖先不算', () => {
    expect(isSelfOrDescendant(META.get('inbox'), META.get('archive'))).toBe(false)
    expect(isSelfOrDescendant(META.get('project'), META.get('inbox'))).toBe(false)
  })

  it('判的是 indexPath 前缀，不是沿 parent 上溯——自引用数据不会把它转死', () => {
    // 作者写出 a 的孩子还是 a 这种数据是被支持的（collectNodes 有祖先链防护）
    const loop = indexTree([{ value: 'a', children: [{ value: 'a' }] }])
    expect(() => isSelfOrDescendant(loop.get('a'), loop.get('a'))).not.toThrow()
  })

  it('下标路径长度不够时直接不是后代，不去比内容', () => {
    expect(isSelfOrDescendant(META.get('weekly'), META.get('inbox'))).toBe(false)
  })
})

describe('落点合不合法', () => {
  it('落进自己的后代不行——那会拖出一个环', () => {
    expect(isTreeDropAllowed(META, 'inbox', { targetValue: 'weekly', position: 'inside' })).toBe(false)
    expect(isTreeDropAllowed(META, 'inbox', { targetValue: 'project', position: 'before' })).toBe(false)
  })

  it('落到别的枝上行', () => {
    expect(isTreeDropAllowed(META, 'quote', { targetValue: 'archive', position: 'inside' })).toBe(true)
  })

  it('放不进禁用的分支里', () => {
    const meta = indexTree([{ value: 'a' }, { value: 'b', disabled: true }])
    expect(isTreeDropAllowed(meta, 'a', { targetValue: 'b', position: 'inside' })).toBe(false)
  })

  it('但在禁用的节点前后插得进去——那只是绕着它排序', () => {
    const meta = indexTree([{ value: 'a' }, { value: 'b', disabled: true }, { value: 'c' }])
    expect(isTreeDropAllowed(meta, 'c', { targetValue: 'b', position: 'before' })).toBe(true)
    expect(isTreeDropAllowed(meta, 'a', { targetValue: 'b', position: 'after' })).toBe(true)
  })

  it('认不出的目标不行', () => {
    expect(isTreeDropAllowed(META, 'quote', { targetValue: 'ghost', position: 'inside' })).toBe(false)
  })

  it('作者的 allowDrop 说了不行就不行，它收到的是折算好的搬家', () => {
    const seen: unknown[] = []
    const allow = (move: { value: string, parent: string | null, index: number }): boolean => {
      seen.push(move)
      return move.parent !== 'trash'
    }
    expect(isTreeDropAllowed(META, 'quote', { targetValue: 'trash', position: 'inside' }, allow)).toBe(false)
    expect(isTreeDropAllowed(META, 'quote', { targetValue: 'archive', position: 'inside' }, allow)).toBe(true)
    expect(seen[0]).toEqual({ value: 'quote', parent: 'trash', index: 0 })
  })

  it('折算不出搬家（原地不动）时也算不合法，不发一次空提交', () => {
    // quote 落在自己后面 = 原地
    expect(isTreeDropAllowed(META, 'quote', { targetValue: 'quote', position: 'after' })).toBe(false)
  })
})

describe('落点折算成搬家', () => {
  it('inside 落进目标子层的末尾', () => {
    expect(treeMoveOf(META, 'quote', { targetValue: 'archive', position: 'inside' }))
      .toEqual({ value: 'quote', parent: 'archive', index: 1 })
  })

  it('落进空分支是第 0 位', () => {
    expect(treeMoveOf(META, 'quote', { targetValue: 'trash', position: 'inside' }))
      .toEqual({ value: 'quote', parent: 'trash', index: 0 })
  })

  it('已经在这个父下面时落进末尾不再减一：末尾就是末尾', () => {
    expect(treeMoveOf(META, 'quote', { targetValue: 'inbox', position: 'inside' }))
      .toEqual({ value: 'quote', parent: 'inbox', index: 1 })
  })

  it('before / after 落进目标所在的那一层', () => {
    expect(treeMoveOf(META, 'quote', { targetValue: 'archive', position: 'before' }))
      .toEqual({ value: 'quote', parent: null, index: 1 })
    expect(treeMoveOf(META, 'quote', { targetValue: 'archive', position: 'after' }))
      .toEqual({ value: 'quote', parent: null, index: 2 })
  })

  it('同层往后搬吃到先摘后插的修正', () => {
    // inbox 落到 trash 后面：摘掉 inbox 之后 trash 在 1，插到它后面是 2
    expect(treeMoveOf(META, 'inbox', { targetValue: 'trash', position: 'after' }))
      .toEqual({ value: 'inbox', parent: null, index: 2 })
  })

  it('同层往前搬不减', () => {
    expect(treeMoveOf(META, 'trash', { targetValue: 'inbox', position: 'before' }))
      .toEqual({ value: 'trash', parent: null, index: 0 })
  })

  it('算下来还是原位时返回 null', () => {
    expect(treeMoveOf(META, 'inbox', { targetValue: 'archive', position: 'before' })).toBeNull()
    expect(treeMoveOf(META, 'inbox', { targetValue: 'inbox', position: 'after' })).toBeNull()
  })

  it('认不出的节点返回 null', () => {
    expect(treeMoveOf(META, 'ghost', { targetValue: 'inbox', position: 'after' })).toBeNull()
  })
})

describe('键盘命令', () => {
  const ROOTS = ['inbox', 'archive', 'trash']
  const INBOX_KIDS = ['quote', 'project']

  it('上下键在同一层的兄弟里挪，不跨层', () => {
    expect(treeMoveCommand(META, ROOTS, 'archive', 'prev'))
      .toEqual({ targetValue: 'inbox', position: 'before' })
    expect(treeMoveCommand(META, ROOTS, 'archive', 'next'))
      .toEqual({ targetValue: 'trash', position: 'after' })
  })

  it('到同层的首末就停住，不回绕也不钻进别人的子树', () => {
    expect(treeMoveCommand(META, ROOTS, 'inbox', 'prev')).toBeNull()
    expect(treeMoveCommand(META, ROOTS, 'trash', 'next')).toBeNull()
  })

  it('往外一层 = 变成父节点的下一个兄弟', () => {
    expect(treeMoveCommand(META, INBOX_KIDS, 'quote', 'outdent'))
      .toEqual({ targetValue: 'inbox', position: 'after' })
  })

  it('已经在根层就没得往外', () => {
    expect(treeMoveCommand(META, ROOTS, 'inbox', 'outdent')).toBeNull()
  })

  it('往里一层 = 认上一个兄弟当爹', () => {
    expect(treeMoveCommand(META, INBOX_KIDS, 'project', 'indent'))
      .toEqual({ targetValue: 'quote', position: 'inside' })
  })

  it('没有上一个兄弟就没得缩进', () => {
    expect(treeMoveCommand(META, INBOX_KIDS, 'quote', 'indent')).toBeNull()
  })

  it('不在这一层里的节点一个命令都不认', () => {
    expect(treeMoveCommand(META, ROOTS, 'quote', 'next')).toBeNull()
  })

  it('横轴跟着文字方向翻，纵轴不翻', () => {
    expect(treeMoveIntentFromKey('ArrowRight', false)).toBe('indent')
    expect(treeMoveIntentFromKey('ArrowRight', true)).toBe('outdent')
    expect(treeMoveIntentFromKey('ArrowUp', false)).toBe('prev')
    expect(treeMoveIntentFromKey('ArrowUp', true)).toBe('prev')
  })

  it('不归它管的键返回 null，绝不 preventDefault', () => {
    expect(treeMoveIntentFromKey('Enter', false)).toBeNull()
    expect(treeMoveIntentFromKey(' ', false)).toBeNull()
  })
})

// ——— 以下是机器与连接层 ———

type Props = TreeSchema['props']
type Dict = Record<string, unknown>

/**
 * 最小标记，三个根节点、其中两个是分支：
 *   inbox（分支，展开）
 *     ├ quote（叶）
 *     └ weekly（叶）
 *   archive（分支，展开，空）
 *   trash（叶）
 *
 * jsdom 不排版，落点判定要的纵向位置逐个打上：每行 40px 首尾相接。
 * 分支量的是 branch-control 而不是 branch——后者裹着整棵子层。
 */
const DRAG_COLLECTION: TreeNode[] = [
  { value: 'inbox', children: [{ value: 'quote' }, { value: 'weekly' }] },
  { value: 'archive', children: [] },
  { value: 'trash' },
]

/** 可见行的纵向排布：值 → [top, height]。branch 那一行故意给一个吞掉整棵子层的高度。 */
const LAYOUT: Record<string, [number, number]> = {
  inbox: [0, 40],
  quote: [40, 40],
  weekly: [80, 40],
  archive: [120, 40],
  trash: [160, 40],
}

function rectOf(top: number, height: number): () => DOMRect {
  return () => ({
    x: 0,
    y: top,
    width: 200,
    height,
    top,
    left: 0,
    right: 200,
    bottom: top + height,
    toJSON: () => ({}),
  }) as DOMRect
}

function mount(initial: Partial<Props> = {}) {
  const props: Partial<Props> = {
    collection: DRAG_COLLECTION,
    defaultExpandedValue: ['inbox', 'archive'],
    nodeDraggable: true,
    ...initial,
  }
  const runtime = createVanillaRuntime()
  const service = createService(treeMachine, { props: () => props, runtime })
  runtime.start()

  const root = document.createElement('div')
  root.setAttribute('data-scope', 'tree')
  root.setAttribute('data-part', 'root')
  const treeEl = document.createElement('div')
  treeEl.setAttribute('data-scope', 'tree')
  treeEl.setAttribute('data-part', 'tree')
  root.append(treeEl)

  const rows = new Map<string, HTMLElement>()

  const leaf = (value: string, into: HTMLElement): void => {
    const el = document.createElement('div')
    el.setAttribute('data-scope', 'tree')
    el.setAttribute('data-part', 'item')
    el.setAttribute('data-value', value)
    const box = LAYOUT[value]
    if (box)
      el.getBoundingClientRect = rectOf(box[0], box[1])
    into.append(el)
    rows.set(value, el)
  }

  const branch = (value: string, into: HTMLElement, kids: string[]): void => {
    const el = document.createElement('div')
    el.setAttribute('data-scope', 'tree')
    el.setAttribute('data-part', 'branch')
    el.setAttribute('data-value', value)
    // 分支的矩形把整棵子层吞进去：量错了的话落点会永远命中它
    el.getBoundingClientRect = rectOf(LAYOUT[value]?.[0] ?? 0, 40 + kids.length * 40)

    const control = document.createElement('div')
    control.setAttribute('data-scope', 'tree')
    control.setAttribute('data-part', 'branch-control')
    const box = LAYOUT[value]
    if (box)
      control.getBoundingClientRect = rectOf(box[0], box[1])
    el.append(control)

    const content = document.createElement('div')
    content.setAttribute('data-scope', 'tree')
    content.setAttribute('data-part', 'branch-content')
    el.append(content)
    into.append(el)
    rows.set(value, control)
    for (const kid of kids)
      leaf(kid, content)
  }

  branch('inbox', treeEl, ['quote', 'weekly'])
  branch('archive', treeEl, [])
  leaf('trash', treeEl)
  document.body.append(root)

  return {
    service,
    api: () => connectTree(service, normalizeProps),
    row: (value: string) => rows.get(value),
    state: () => service.state.get(),
    dragging: () => service.context.get('draggingNode') ?? null,
    drop: () => service.context.get('dropTarget') ?? null,
    said: () => service.context.get('announcement'),
  }
}

type Harness = ReturnType<typeof mount>

/** 按在某个节点上。叶子按 item，分支按 branch-control。 */
function press(h: Harness, value: string, clientY: number, init: Partial<PointerEvent> = {}): void {
  const el = h.row(value)
  const isBranch = el?.getAttribute('data-part') === 'branch-control'
  const props = (isBranch
    ? h.api().getBranchControlProps({ value })
    : h.api().getItemProps({ value })) as Dict
  ;(props.onPointerDown as (e: PointerEvent) => void)({
    button: 0,
    pointerId: 1,
    pointerType: 'mouse',
    clientX: 0,
    clientY,
    currentTarget: el,
    target: el,
    ...init,
  } as unknown as PointerEvent)
}

function move(clientY: number): void {
  document.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 0, clientY, bubbles: true }))
}

function release(): void {
  document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }))
}

function key(h: Harness, k: string, mods: Partial<KeyboardEvent> = {}): { prevented: boolean } {
  let prevented = false
  const props = h.api().getTreeProps() as Dict
  ;(props.onKeyDown as (e: KeyboardEvent) => void)({
    key: k,
    ...mods,
    currentTarget: document.querySelector('[data-part="tree"]'),
    preventDefault: () => { prevented = true },
  } as unknown as KeyboardEvent)
  return { prevented }
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('节点拖拽 · 指针', () => {
  it('按下还不算拖：整个节点都是拖动源，没有把手表明意图', () => {
    const h = mount()
    press(h, 'quote', 50)
    expect(h.dragging()).toBeNull()
  })

  it('走够激活距离才算，落点跟着指针走', () => {
    const h = mount()
    press(h, 'quote', 50)
    move(190)
    expect(h.dragging()).toBe('quote')
    expect(h.drop()).toEqual({ targetValue: 'trash', position: 'after' })
  })

  it('分支量的是 branch-control 不是 branch——后者裹着整棵子层', () => {
    const h = mount()
    press(h, 'trash', 170)
    // 100 落在 weekly 那一行（80–120）里，而 weekly 是 inbox 的孩子。
    // 若量的是 branch，inbox 的矩形（0–120，裹着整棵子层）会先命中，
    // 落点就永远是最外层那个分支，一辈子落不到子节点上
    move(100)
    expect(h.drop()?.targetValue).toBe('weekly')
  })

  it('落在分支中段是「放进去」，上下两端是前后插', () => {
    const h = mount()
    press(h, 'trash', 170)
    move(140)
    expect(h.drop()).toEqual({ targetValue: 'archive', position: 'inside' })
    move(125)
    expect(h.drop()).toEqual({ targetValue: 'archive', position: 'before' })
  })

  it('落在分支下沿是插在它后面——换个真会动的源，trash 本来就紧跟 archive', () => {
    const h = mount()
    press(h, 'quote', 50)
    move(155)
    expect(h.drop()).toEqual({ targetValue: 'archive', position: 'after' })
  })

  it('叶子上只有前后两档，没有「落进去」', () => {
    const h = mount()
    press(h, 'quote', 50)
    move(190)
    expect(h.drop()?.position).toBe('after')
    move(165)
    expect(h.drop()?.position).toBe('before')
  })

  it('落进自己的后代不合法，指示线消失', () => {
    const h = mount()
    press(h, 'inbox', 10)
    move(60)
    expect(h.dragging()).toBe('inbox')
    expect(h.drop()).toBeNull()
  })

  it('松手落定，报出搬到哪个父下面的第几位', () => {
    const onNodeMove = vi.fn()
    const h = mount({ onNodeMove })
    press(h, 'quote', 50)
    move(140)
    release()
    expect(onNodeMove).toHaveBeenCalledWith({ value: 'quote', parent: 'archive', index: 0 })
    expect(h.dragging()).toBeNull()
  })

  it('没走够激活距离就松手 = 只是点了一下，什么都不发', () => {
    const onNodeMove = vi.fn()
    const h = mount({ onNodeMove })
    press(h, 'quote', 50)
    move(52)
    release()
    expect(onNodeMove).not.toHaveBeenCalled()
    expect(h.said()).toBe('')
  })

  it('系统收走指针按取消算，一步不动', () => {
    const onNodeMove = vi.fn()
    const h = mount({ onNodeMove })
    press(h, 'quote', 50)
    move(140)
    document.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1, bubbles: true }))
    expect(onNodeMove).not.toHaveBeenCalled()
    expect(h.said()).toContain('canceled')
  })

  it('触屏不开拖：纵向手势在按下那一刻就归了浏览器滚动', () => {
    const h = mount()
    press(h, 'quote', 50, { pointerType: 'touch' })
    move(140)
    expect(h.dragging()).toBeNull()
  })

  it('右键不开拖；关掉 draggable 也不开', () => {
    const h = mount()
    press(h, 'quote', 50, { button: 2 })
    move(140)
    expect(h.dragging()).toBeNull()

    const off = mount({ nodeDraggable: false })
    press(off, 'quote', 50)
    move(140)
    expect(off.dragging()).toBeNull()
  })

  it('禁用的节点拖不动', () => {
    const h = mount({
      collection: [{ value: 'a', disabled: true }, { value: 'b' }],
      defaultExpandedValue: [],
    })
    press(h, 'a', 10)
    move(100)
    expect(h.dragging()).toBeNull()
  })

  it('allowDrop 说了不行，落点就不成立', () => {
    const h = mount({ allowDrop: move => move.parent !== 'archive' })
    press(h, 'quote', 50)
    move(140)
    expect(h.drop()).toBeNull()
  })

  it('拖动中被拖的节点只落 data-dragging，不带任何位移', () => {
    const h = mount()
    press(h, 'quote', 50)
    move(140)
    const props = h.api().getItemProps({ value: 'quote' }) as Dict
    expect(props['data-dragging']).toBe('')
    expect(JSON.stringify(props.style ?? {})).not.toContain('transform')
  })

  it('落点那一档如实发在参照节点上', () => {
    const h = mount()
    press(h, 'trash', 170)
    move(140)
    expect((h.api().getBranchControlProps({ value: 'archive' }) as Dict)['data-drop']).toBe('inside')
  })

  it('同一个实例连拖两次——会话是常驻的，第一场收尾不该把它闩死', () => {
    const onNodeMove = vi.fn()
    const h = mount({ onNodeMove })
    press(h, 'quote', 50)
    move(140)
    release()
    expect(onNodeMove).toHaveBeenCalledTimes(1)

    press(h, 'weekly', 90)
    move(10)
    expect(h.dragging()).toBe('weekly')
    release()
    expect(onNodeMove).toHaveBeenCalledTimes(2)
  })
})

describe('节点拖拽 · 键盘命令', () => {
  it('按 Alt + 上下键在同层兄弟里挪一位', () => {
    const onNodeMove = vi.fn()
    const h = mount({ onNodeMove })
    h.service.send({ type: 'NODE.FOCUS', value: 'quote' })
    const { prevented } = key(h, 'ArrowDown', { altKey: true })
    expect(prevented).toBe(true)
    expect(onNodeMove).toHaveBeenCalledWith({ value: 'quote', parent: 'inbox', index: 1 })
  })

  it('按 Alt + 右键缩进：认上一个兄弟当爹', () => {
    const onNodeMove = vi.fn()
    const h = mount({ onNodeMove })
    h.service.send({ type: 'NODE.FOCUS', value: 'weekly' })
    key(h, 'ArrowRight', { altKey: true })
    expect(onNodeMove).toHaveBeenCalledWith({ value: 'weekly', parent: 'quote', index: 0 })
  })

  it('按 Alt + 左键往外一层：变成父节点的下一个兄弟', () => {
    const onNodeMove = vi.fn()
    const h = mount({ onNodeMove })
    h.service.send({ type: 'NODE.FOCUS', value: 'quote' })
    key(h, 'ArrowLeft', { altKey: true })
    expect(onNodeMove).toHaveBeenCalledWith({ value: 'quote', parent: null, index: 1 })
  })

  it('rtl 下左右对调，上下不翻', () => {
    const onNodeMove = vi.fn()
    const h = mount({ dir: 'rtl', onNodeMove })
    h.service.send({ type: 'NODE.FOCUS', value: 'weekly' })
    key(h, 'ArrowLeft', { altKey: true })
    expect(onNodeMove).toHaveBeenCalledWith({ value: 'weekly', parent: 'quote', index: 0 })
  })

  it('到同层首末就停住：挡住默认行为但不发事件', () => {
    const onNodeMove = vi.fn()
    const h = mount({ onNodeMove })
    h.service.send({ type: 'NODE.FOCUS', value: 'quote' })
    const { prevented } = key(h, 'ArrowUp', { altKey: true })
    expect(prevented).toBe(true)
    expect(onNodeMove).not.toHaveBeenCalled()
  })

  it('裸方向键仍是导航与展开收起，不搬家', () => {
    const onNodeMove = vi.fn()
    const h = mount({ onNodeMove })
    h.service.send({ type: 'NODE.FOCUS', value: 'quote' })
    key(h, 'ArrowDown')
    expect(onNodeMove).not.toHaveBeenCalled()
  })

  it('关掉 draggable 时 Alt + 方向键放行给页面', () => {
    const h = mount({ nodeDraggable: false })
    h.service.send({ type: 'NODE.FOCUS', value: 'quote' })
    const { prevented } = key(h, 'ArrowDown', { altKey: true })
    expect(prevented).toBe(false)
  })

  it('allowDrop 拦下的搬家不发事件，但要播报一句', () => {
    const onNodeMove = vi.fn()
    const h = mount({ onNodeMove, allowDrop: () => false })
    h.service.send({ type: 'NODE.FOCUS', value: 'quote' })
    key(h, 'ArrowDown', { altKey: true })
    expect(onNodeMove).not.toHaveBeenCalled()
    expect(h.said()).toContain('cannot be dropped')
  })
})

describe('节点拖拽 · 播报与属性', () => {
  it('搬完说的是新位置，用节点的 label 不用 value', () => {
    const h = mount({
      collection: [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }],
      defaultExpandedValue: [],
    })
    h.service.send({ type: 'NODE.FOCUS', value: 'a' })
    key(h, 'ArrowDown', { altKey: true })
    expect(h.said()).toContain('甲')
  })

  it('播报区是视觉隐藏的 status 活区', () => {
    const props = mount().api().getLiveRegionProps() as Dict
    expect(props.role).toBe('status')
    expect(props['aria-live']).toBe('polite')
    expect((props.style as Dict).clipPath).toBe('inset(50%)')
  })

  it('可拖的节点自报 data-draggable，禁用的不报', () => {
    const h = mount({
      collection: [{ value: 'a' }, { value: 'b', disabled: true }],
      defaultExpandedValue: [],
    })
    expect((h.api().getItemProps({ value: 'a' }) as Dict)['data-draggable']).toBe('')
    expect((h.api().getItemProps({ value: 'b' }) as Dict)['data-draggable']).toBeUndefined()
  })

  it('关掉 draggable 时一个节点都不报可拖', () => {
    const h = mount({ nodeDraggable: false })
    expect((h.api().getItemProps({ value: 'quote' }) as Dict)['data-draggable']).toBeUndefined()
  })
})

describe('节点拖动把手 · 触屏那一路唯一的入口', () => {
  function pressHandle(h: Harness, value: string, clientY: number, init: Partial<PointerEvent> = {}): void {
    const props = h.api().getNodeDragTriggerProps({ value }) as Dict
    ;(props.onPointerDown as (e: PointerEvent) => void)({
      button: 0,
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 0,
      clientY,
      currentTarget: h.row(value),
      target: h.row(value),
      preventDefault: () => {},
      ...init,
    } as unknown as PointerEvent)
  }

  it('按下即拖，不等激活距离', () => {
    const h = mount()
    pressHandle(h, 'quote', 50)
    expect(h.dragging()).toBe('quote')
  })

  it('触屏在把手上拖得动；整块起手那一路仍然不认触屏', () => {
    const viaHandle = mount()
    pressHandle(viaHandle, 'quote', 50, { pointerType: 'touch' })
    expect(viaHandle.dragging()).toBe('quote')

    const viaNode = mount()
    press(viaNode, 'quote', 50, { pointerType: 'touch' })
    move(140)
    expect(viaNode.dragging()).toBeNull()
  })

  it('手势整个归拖动，且不占 Tab 位、对读屏隐藏', () => {
    const props = mount().api().getNodeDragTriggerProps({ value: 'quote' }) as Dict
    expect((props.style as Dict).touchAction).toBe('none')
    expect(props.tabindex).toBe(-1)
    expect(props['aria-hidden']).toBe(true)
  })

  it('禁用的节点与关掉 nodeDraggable 时把手都拖不动', () => {
    const disabled = mount({
      collection: [{ value: 'a', disabled: true }, { value: 'b' }],
      defaultExpandedValue: [],
    })
    expect((disabled.api().getNodeDragTriggerProps({ value: 'a' }) as Dict)['data-disabled']).toBe('')

    const off = mount({ nodeDraggable: false })
    pressHandle(off, 'quote', 50)
    expect(off.dragging()).toBeNull()
  })

  it('从把手起手，三档落点与松手落定跟整块起手是同一套', () => {
    const onNodeMove = vi.fn()
    const h = mount({ onNodeMove })
    pressHandle(h, 'quote', 50)
    move(140)
    release()
    expect(onNodeMove).toHaveBeenCalledWith({ value: 'quote', parent: 'archive', index: 0 })
  })
})

describe('禁用的节点不是拖动源', () => {
  it('按 Alt + 方向键搬不动', () => {
    const onNodeMove = vi.fn()
    const h = mount({
      collection: [
        { value: 'inbox', children: [{ value: 'quote', disabled: true }, { value: 'weekly' }] },
        { value: 'archive', children: [] },
        { value: 'trash' },
      ],
      onNodeMove,
    })
    h.service.send({ type: 'NODE.FOCUS', value: 'quote' })
    key(h, 'ArrowDown', { altKey: true })
    expect(onNodeMove).not.toHaveBeenCalled()
  })

  it('别人仍可以落到它身上——禁用的是拖动源那一头', () => {
    // 落点那一头另有 isTreeDropAllowed 管，它对禁用目标的判定不在本条范围内；
    // 这里只钉「源禁用」与「源不禁用」两条路的分界
    const onNodeMove = vi.fn()
    const h = mount({
      collection: [
        { value: 'inbox', children: [{ value: 'quote', disabled: true }, { value: 'weekly' }] },
        { value: 'archive', children: [] },
        { value: 'trash' },
      ],
      onNodeMove,
    })
    h.service.send({ type: 'NODE.FOCUS', value: 'weekly' })
    key(h, 'ArrowUp', { altKey: true })
    expect(onNodeMove).toHaveBeenCalledWith({ value: 'weekly', parent: 'inbox', index: 0 })
  })
})

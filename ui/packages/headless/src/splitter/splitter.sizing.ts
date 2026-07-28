import type { SplitterPanelProps } from './splitter.types'
import { clamp } from '../shared/number'

/**
 * 百分比布局的重分配。整块是纯函数：给一份布局与一次意图，算出新的一份布局，
 * 不碰 DOM、不认识状态机——像素与百分比的换算由调用方在事件那一刻量好后传进来。
 *
 * 一条贯穿全文的不变量：**总和恒为 100**。面板尺寸是分数不是绝对长度，
 * 某一块顶到 min 时多出来的那部分必须让给别人，不能凭空消失——
 * 一旦总和漂了，容器上就会冒出一条填不满的缝，或者最后一块被挤出可视区。
 */

/** 百分比布局的总量。面板尺寸全部以它为分母，别处不再出现这个字面量。 */
export const SPLITTER_TOTAL = 100

/** 保留两位小数：拖拽换算出来的是任意小数，不收一下会让内联样式与 aria-valuenow 拖着一长串尾巴。 */
const PRECISION = 100

/** 比这更小的差额当作 0：浮点减法的残渣不该让面板抖一下，也不该让分摊多绕一圈。 */
const EPSILON = 1e-9

export interface PanelConstraint {
  min: number
  max: number
  collapsible: boolean
  collapsedSize: number
}

export function roundSize(value: number): number {
  return Math.round(value * PRECISION) / PRECISION
}

/**
 * 这块面板真正能被压到多小。
 *
 * 可折叠的面板在连续调整里允许一路走到 collapsedSize，不做"低于 min 就吸附折叠"那一跳：
 * 吸附会让拖拽在 min 附近跳变，指针明明在往回走、面板却先塌下去；
 * 需要一个确定的折叠入口时用 collapsePanel（键盘 Enter 走的就是它）。
 */
function floorOf(c: PanelConstraint): number {
  return c.collapsible ? Math.min(c.collapsedSize, c.min) : c.min
}

function growRoom(size: number, c: PanelConstraint): number {
  return Math.max(0, c.max - size)
}

function shrinkRoom(size: number, c: PanelConstraint): number {
  return Math.max(0, size - floorOf(c))
}

/** 逐块补齐缺省。作者只给了一部分（甚至一块都没给）时，其余按"0-100 随便走、不可折叠"处理。 */
export function panelConstraint(spec: SplitterPanelProps | undefined): PanelConstraint {
  const min = clamp(spec?.min ?? 0, 0, SPLITTER_TOTAL)
  // max 不许低于 min：两者写反时区间上下颠倒，此后每次 clamp 都会给出第三个数，
  // 面板会在两个端点之间来回弹
  const max = clamp(spec?.max ?? SPLITTER_TOTAL, min, SPLITTER_TOTAL)
  return {
    min,
    max,
    collapsible: !!spec?.collapsible,
    collapsedSize: clamp(spec?.collapsedSize ?? 0, 0, max),
  }
}

export function panelConstraints(
  specs: readonly SplitterPanelProps[] | undefined,
  count: number,
): PanelConstraint[] {
  return Array.from({ length: Math.max(count, 0) }, (_, i) => panelConstraint(specs?.[i]))
}

/** 等分。除不尽的零头落在最后一块上，总和仍是 100。 */
export function equalSizes(count: number): number[] {
  if (count <= 0)
    return []
  const each = roundSize(SPLITTER_TOTAL / count)
  // 零头收在最后一块上：逐块四舍五入会让三栏加起来是 99.99
  const tail = roundSize(SPLITTER_TOTAL - each * (count - 1))
  return Array.from({ length: count }, (_, i) => (i === count - 1 ? tail : each))
}

/** 这块面板算不算折叠着。折叠是"尺寸到了 collapsedSize"这个事实，不是另存一份布尔态。 */
export function isCollapsed(size: number, c: PanelConstraint): boolean {
  return c.collapsible && size <= c.collapsedSize + EPSILON
}

/**
 * 把 amount 百分比按 order 给的顺序摊到各面板上（正=撑大、负=压缩）。
 * 每块只吃自己剩下的余量，吃不下的往后传——这就是"撞到 min/max 时余量让给谁"的唯一出口。
 * 返回真正摊出去的量：谁都吃不下时它会小于 amount，调用方据此收敛自己那一侧。
 */
function spread(
  out: number[],
  cs: readonly PanelConstraint[],
  order: readonly number[],
  amount: number,
): number {
  let rest = amount
  for (const i of order) {
    if (Math.abs(rest) <= EPSILON)
      break
    const c = cs[i]
    const size = out[i]
    if (!c || size == null)
      continue
    const room = rest > 0 ? growRoom(size, c) : shrinkRoom(size, c)
    const take = Math.min(room, Math.abs(rest)) * Math.sign(rest)
    out[i] = size + take
    rest -= take
  }
  return amount - rest
}

/**
 * 收尾：逐块取两位小数，再把四舍五入攒出来的零头补回去，总和恒是 100。
 *
 * 零头只补给放得下它的那一块——补给正卡在 max（或 min）上的面板等于当场把它的约束毁掉。
 * 约束本身就凑不出 100（比如唯一一块面板 max=50）时保持原样，不硬凑：
 * 硬凑出来的那一份是谁都没要求过的布局。
 */
function settle(sizes: readonly number[], cs: readonly PanelConstraint[]): number[] {
  const out = sizes.map(roundSize)
  const diff = roundSize(SPLITTER_TOTAL - out.reduce((a, b) => a + b, 0))
  if (diff === 0 || out.length === 0)
    return out
  // 从大到小找：零头落在最宽的那块上最不容易被看出来
  const order = out.map((_, i) => i).sort((a, b) => out[b]! - out[a]!)
  for (const i of order) {
    const c = cs[i]
    if (!c)
      continue
    const room = diff > 0 ? growRoom(out[i]!, c) : shrinkRoom(out[i]!, c)
    if (room + EPSILON >= Math.abs(diff)) {
      out[i] = roundSize(out[i]! + diff)
      break
    }
  }
  return out
}

/** 分隔条后面的面板，近的排前面。 */
function panelsAfter(index: number, count: number): number[] {
  return Array.from({ length: Math.max(0, count - index - 1) }, (_, k) => index + 1 + k)
}

/** 折叠/展开找得到谁就找谁：先问后面的，再回头问前面的（最后一块折叠时只剩前面的可问）。 */
function neighbours(index: number, count: number): number[] {
  const before: number[] = []
  for (let i = index - 1; i >= 0; i--) before.push(i)
  return [...panelsAfter(index, count), ...before]
}

/**
 * 把第 index 块调到 next，缺口由 donors 依次填补（近的先）。
 *
 * 自己先被夹进 [floor, max]，随后**只认 donors 真的配合了多少**：
 * 若后面的面板全顶在 min 上，这一块就一步也长不了。先斩后奏地把自己改掉、
 * 再指望别人凑数，正是总和漂掉的经典写法。
 */
function applyPanelSize(
  sizes: readonly number[],
  index: number,
  next: number,
  cs: readonly PanelConstraint[],
  donors: readonly number[],
): number[] {
  const out = [...sizes]
  const c = cs[index]
  const size = out[index]
  if (!c || size == null)
    return settle(out, cs)
  const target = clamp(next, floorOf(c), c.max)
  const given = spread(out, cs, donors, size - target)
  out[index] = size - given
  return settle(out, cs)
}

/**
 * 任意一份输入归位成合法布局：逐块夹进约束，再把与 100 的差额摊出去。
 * 受控值与作者的命令式赋值都走这里——布局的正确性不该指望调用方自觉。
 */
export function normalizeSizes(sizes: readonly number[], cs: readonly PanelConstraint[]): number[] {
  const raw = cs.map((_, i) => Math.max(0, sizes[i] ?? 0))
  const sum = raw.reduce((a, b) => a + b, 0)
  // 作者手里的常是比例而不是百分比（[1, 2]、[200, 300] 都很常见），先按比例缩到 100 再夹约束。
  // 少了这一步，[1, 2] 会被当成"两块各 1 和 2、余下 97 全塞给第一块"，
  // 而这恰恰是最不像作者本意的那份布局。全是 0 时无从缩放，退到等分
  const scaled = sum > EPSILON
    ? raw.map(v => v / sum * SPLITTER_TOTAL)
    : equalSizes(raw.length)
  const out = cs.map((c, i) => clamp(scaled[i] ?? 0, floorOf(c), c.max))
  const diff = SPLITTER_TOTAL - out.reduce((a, b) => a + b, 0)
  if (Math.abs(diff) > EPSILON) {
    const all = out.map((_, i) => i)
    // 先找没折叠的面板要：把零头塞给一块折叠着的面板，等于替用户把它展开了
    const open = all.filter(i => !isCollapsed(out[i]!, cs[i]!))
    const done = spread(out, cs, open, diff)
    if (Math.abs(diff - done) > EPSILON)
      spread(out, cs, all, diff - done)
  }
  return settle(out, cs)
}

/**
 * 第 index 块当前真正能走到的百分比区间——分隔条的 aria-valuemin/valuemax 就是它。
 * 报自己的 min/max 是不诚实的：后面的面板已经顶到 min 时，那个区间读屏也走不到。
 */
export function panelRange(
  sizes: readonly number[],
  index: number,
  cs: readonly PanelConstraint[],
): { min: number, max: number } {
  const c = cs[index]
  const size = sizes[index]
  if (!c || size == null)
    return { min: 0, max: 0 }
  const donors = panelsAfter(index, sizes.length)
  let donorGrow = 0
  let donorShrink = 0
  for (const i of donors) {
    const dc = cs[i]
    const ds = sizes[i]
    if (!dc || ds == null)
      continue
    donorGrow += growRoom(ds, dc)
    donorShrink += shrinkRoom(ds, dc)
  }
  return {
    min: roundSize(size - Math.min(shrinkRoom(size, c), donorGrow)),
    max: roundSize(size + Math.min(growRoom(size, c), donorShrink)),
  }
}

/**
 * 把第 boundary 条分隔条挪动 delta 个百分点。
 * 只惊动它后面的面板：前面的那些归更前面的分隔条管，被这一下推着走就等于一次拖拽改了两处布局。
 */
export function resizePanels(
  sizes: readonly number[],
  boundary: number,
  delta: number,
  cs: readonly PanelConstraint[],
): number[] {
  return applyPanelSize(sizes, boundary, (sizes[boundary] ?? 0) + delta, cs, panelsAfter(boundary, sizes.length))
}

/** 同 resizePanels，只是直接给目标尺寸（Home/End 与命令式赋值走它）。 */
export function setBoundarySize(
  sizes: readonly number[],
  boundary: number,
  next: number,
  cs: readonly PanelConstraint[],
): number[] {
  return applyPanelSize(sizes, boundary, next, cs, panelsAfter(boundary, sizes.length))
}

/** 折叠到 collapsedSize；腾出来的地方先给后面的面板，后面都满了再回头给前面的。 */
export function collapsePanel(
  sizes: readonly number[],
  index: number,
  cs: readonly PanelConstraint[],
): number[] {
  const c = cs[index]
  // 不可折叠就一动不动：这条路径是"用户按了 Enter"，不是"随便调个尺寸"
  if (!c?.collapsible)
    return settle([...sizes], cs)
  return applyPanelSize(sizes, index, c.collapsedSize, cs, neighbours(index, sizes.length))
}

/** 展开回 restore（会被夹进 [min, max]）；地方同样先问后面的面板要。 */
export function expandPanel(
  sizes: readonly number[],
  index: number,
  cs: readonly PanelConstraint[],
  restore: number,
): number[] {
  const c = cs[index]
  if (!c)
    return settle([...sizes], cs)
  return applyPanelSize(sizes, index, clamp(restore, c.min, c.max), cs, neighbours(index, sizes.length))
}

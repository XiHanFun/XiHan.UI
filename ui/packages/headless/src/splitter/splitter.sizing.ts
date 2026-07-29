import type { SplitterPanelProps } from './splitter.types'
import { clamp } from '../shared/number'

/**
 * 百分比布局的重分配，纯函数：像素与百分比的换算由调用方在事件那一刻量好传入，不碰 DOM。
 * 不变量：总和恒为 100，某块顶到 min 时多出来的部分必须让给别人。
 */

/** 百分比布局的总量，面板尺寸全部以它为分母。 */
export const SPLITTER_TOTAL = 100

/** 保留两位小数，避免内联样式与 aria-valuenow 拖出长尾巴。 */
const PRECISION = 100

/** 比这更小的差额当作 0，滤掉浮点减法的残渣。 */
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
 * 可折叠的面板在连续调整里允许一路走到 collapsedSize，不做低于 min 即吸附折叠那一跳；
 * 确定的折叠入口是 collapsePanel。
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
  // max 不许低于 min：写反时区间上下颠倒，clamp 会给出第三个数
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
 * 每块只吃自己剩下的余量，吃不下的往后传。
 * 返回真正摊出去的量；谁都吃不下时它会小于 amount。
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
 * 零头只补给放得下它的那一块；约束本身凑不出 100 时保持原样，不硬凑。
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
 * 自己先夹进 [floor, max]，随后只认 donors 真的配合了多少，否则总和会漂掉。
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
 * 受控值与命令式赋值都走这里。
 */
export function normalizeSizes(sizes: readonly number[], cs: readonly PanelConstraint[]): number[] {
  const raw = cs.map((_, i) => Math.max(0, sizes[i] ?? 0))
  const sum = raw.reduce((a, b) => a + b, 0)
  // 输入常是比例而非百分比，先按比例缩到 100 再夹约束；全是 0 时无从缩放，退到等分
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
 * 第 index 块当前真正能走到的百分比区间，分隔条的 aria-valuemin/valuemax 取自它。
 * 不报自己的 min/max：后面的面板顶到 min 时那段区间走不到。
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

/** 把第 boundary 条分隔条挪动 delta 个百分点，只惊动它后面的面板。 */
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
  // 不可折叠就一动不动
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

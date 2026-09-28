/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 跨列表拖放的组：同一文档里 group 相同的几个 Sortable 互相认得，拖动由发起的那个列表主持，
// 别的列表只接它送来的 GROUP.* 事件，按自己的 context 画让位、落点线与落位。
//
// 每台机器启动即登记、停止即注销；组员按调用时的 props 现读，改了 group / listId 不用重新登记。
// 几何在拖动开始那一刻一次量齐（与单列表的矩形快照同一个道理：让位之后布局已经变了，拿变形后的几何算落点会自激振荡）。
import type { DndRect, SortableAxis } from '@xihan-ui/pointer'
import type { SortableGroupPeer, SortableSchema } from './sortable.types'
import { queryItems } from '@xihan-ui/core'
import { sortableAnatomy } from './sortable.anatomy'

export interface SortableGroupMember {
  group: () => string | undefined
  ids: () => string[]
  listId: () => string | undefined
  orientation: () => SortableAxis
  dir: () => string | undefined
  root: () => HTMLElement | null
  send: (event: SortableSchema['event']) => void
}

const members = new Set<SortableGroupMember>()

const ITEM_QUERY = { scope: sortableAnatomy.name, part: 'item' }

/** 登记一台 Sortable，返回注销函数。 */
export function joinSortableGroup(member: SortableGroupMember): () => void {
  members.add(member)
  return () => void members.delete(member)
}

/**
 * 入组的列表组合是否合法：写了 group 就必须写 listId，且只能是单轴排布。
 * 换行网格的四个方向键都用在列表内，没有键留给列表间，拖进来也没有「末项之后」那一格可算。
 */
export function assertSortableGroupProps(props: { group?: string, listId?: string, orientation?: SortableAxis }): void {
  if (props.group == null)
    return
  if (props.group === '')
    throw new Error('[xh] Sortable 的 group 不能是空串：不入组就不写 group')
  if (!props.listId)
    throw new Error(`[xh] Sortable 入了组（group="${props.group}"）就必须写 listId：transfer 事件靠它说明从哪来、到哪去`)
  if (props.orientation === 'both')
    throw new Error('[xh] Sortable 换行网格（orientation="both"）不能入组：四个方向键都用在列表内，没有键留给列表间移动')
}

function rectOf(el: Element): DndRect {
  const r = el.getBoundingClientRect()
  return { x: r.x, y: r.y, width: r.width, height: r.height }
}

/** 一个列表此刻的几何：容器矩形、各项矩形、内容盒、主轴上的间距与落点线的原点。 */
function measure(root: HTMLElement, axis: 'horizontal' | 'vertical'): Pick<SortableGroupPeer, 'bounds' | 'rects' | 'box' | 'gap' | 'rootOrigin'> {
  const bounds = rectOf(root)
  const view = root.ownerDocument.defaultView
  const style = view?.getComputedStyle(root)
  const px = (value: string | undefined): number => Number.parseFloat(value ?? '') || 0
  const left = px(style?.borderLeftWidth) + px(style?.paddingLeft)
  const right = px(style?.borderRightWidth) + px(style?.paddingRight)
  const top = px(style?.borderTopWidth) + px(style?.paddingTop)
  const bottom = px(style?.borderBottomWidth) + px(style?.paddingBottom)
  return {
    bounds,
    rects: queryItems(root, ITEM_QUERY).map(rectOf),
    box: {
      x: bounds.x + left,
      y: bounds.y + top,
      width: Math.max(bounds.width - left - right, 0),
      height: Math.max(bounds.height - top - bottom, 0),
    },
    // 间距取容器声明的 gap：列表只有一项、或一项都没有时量不出两项之间差多少
    gap: px(axis === 'horizontal' ? style?.columnGap : style?.rowGap),
    rootOrigin: { x: bounds.x - root.scrollLeft, y: bounds.y - root.scrollTop },
  }
}

/**
 * 量齐自己所在组的各列表，按文档序排好。没入组时返回空数组。
 * listId 在组内重复时立即报错：落点说不清是哪一个。
 */
export function measureSortableGroup(group: string, selfRoot: HTMLElement): SortableGroupPeer[] {
  const doc = selfRoot.ownerDocument
  const peers: SortableGroupPeer[] = []
  const seen = new Set<string>()
  for (const member of members) {
    const root = member.root()
    if (member.group() !== group || !root || root.ownerDocument !== doc || !root.isConnected)
      continue
    const listId = member.listId() ?? ''
    if (seen.has(listId))
      throw new Error(`[xh] Sortable 组 "${group}" 里有两个列表的 listId 都是 "${listId}"：组内的 listId 不能重复`)
    seen.add(listId)
    const orientation = member.orientation()
    const axis = orientation === 'horizontal' ? 'horizontal' : 'vertical'
    peers.push({
      listId,
      self: root === selfRoot,
      root,
      axis,
      direction: axis === 'horizontal' && member.dir() === 'rtl' ? -1 : 1,
      ...measure(root, axis),
      ids: member.ids,
      send: member.send,
    })
  }
  // 文档序即组里的先后：键盘往「下一个列表」挪就是往文档序的后面挪
  return peers.sort((a, b) => (a.root.compareDocumentPosition(b.root) & 4 /* DOCUMENT_POSITION_FOLLOWING */ ? -1 : 1))
}

/**
 * 被拖项的中心落在哪个列表上方：容器矩形含住中心的那个；列表嵌套时取最里层的那个。都不含时返回 null。
 */
export function peerAt(peers: readonly SortableGroupPeer[], point: { x: number, y: number }): SortableGroupPeer | null {
  let hit: SortableGroupPeer | null = null
  for (const peer of peers) {
    const b = peer.bounds
    if (point.x < b.x || point.x > b.x + b.width || point.y < b.y || point.y > b.y + b.height)
      continue
    if (!hit || hit.root.contains(peer.root))
      hit = peer
  }
  return hit
}

/** 列表容器的可及名：aria-labelledby 指向的文字优先，其次 aria-label。 */
export function sortableListName(root: HTMLElement): string {
  const ids = root.getAttribute('aria-labelledby')?.split(/\s+/).filter(Boolean) ?? []
  const labelled = ids
    .map(id => root.ownerDocument.getElementById(id)?.textContent?.replace(/\s+/g, ' ').trim() ?? '')
    .filter(Boolean)
    .join(' ')
  return labelled || root.getAttribute('aria-label') || ''
}

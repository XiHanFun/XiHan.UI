// 拖动中版面整体挪了多远。
//
// 与 drag.ts 分开放只是为了不和别人同时改同一个文件，两者是一件事，
// 下次谁动 drag.ts 可以顺手并进去。
import type { DragRect } from './drag'

/**
 * 落点快照是按下那一刻量的，而拖动中版面可能整体挪走：页面滚了、祖先滚了、
 * 容器自己滚了、或者旁边有东西撑开了。快照不跟着动，落点就全错。
 *
 * 参照取**拖动源自己**而不是容器：容器自己内部滚动时它的 rect 一动不动，
 * 拿它当参照量不出来。而拖动中被拖的项原地不动（落点只画指示线，不做跟手让位），
 * 它相对兄弟的位置全程不变——它挪了多远，所有人就挪了多远。
 *
 * 元素被宿主重渲掉时 rect 全是 0，那不是「挪到了原点」，此时按没挪算。
 */
export function snapshotDrift(
  source: HTMLElement | null,
  rects: readonly DragRect[],
  value: string,
  axis: 'x' | 'y',
): number {
  if (!source)
    return 0
  const at = rects.find(rect => rect.value === value)
  if (!at)
    return 0
  const box = source.getBoundingClientRect()
  // 脱离文档的元素量出来是全零，与「真的挪到了原点」区分不开，按没挪算
  if (box.width === 0 && box.height === 0 && box.top === 0 && box.left === 0)
    return 0
  return (axis === 'x' ? box.left : box.top) - at.start
}

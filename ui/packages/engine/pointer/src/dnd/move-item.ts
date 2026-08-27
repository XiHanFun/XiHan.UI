/**
 * 把 `from` 位置的元素挪到 `to` 位置，返回新数组，原数组不动。
 *
 * 下标任一越界就原样返回一份拷贝——调用方拿到的永远是能直接用的数组，
 * 不必在每个调用点各写一遍边界判断。
 */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list]
  if (!inRange(from, list.length) || !inRange(to, list.length) || from === to)
    return next
  // 展开而不是取 [0]：数组索引在本仓是 `T | undefined`，展开一个必然长度为 1 的切片
  // 既不用断言、也不会把 `undefined` 混进 T 里
  const removed = next.splice(from, 1)
  next.splice(to, 0, ...removed)
  return next
}

function inRange(index: number, length: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length
}

// 悬停开延时的计时装置：从指针到达那一刻量到浮层翻开那一拍，判据与 userEvent 往返的快慢无关。
//
// 「hover 回来后再等 N ms、断言还关着」把 CDP 往返也算进了等待：CI 并行负载下往返能吃掉几百毫秒，
// 回来时开延时已经走完，断言随机判红。这里起点取目标上 pointerenter 的 event.timeStamp（指针到达的时刻，
// 不晚于组件起表），终点由 MutationObserver 在翻开写入的那一拍记下，两头都是浏览器自己的时钟。

/** 事件时间戳与 performance.now 各有不到 0.1ms 的粒度，拿间隔比开延时时留出这 1ms。 */
export const CLOCK_SLACK = 1

/**
 * 盯住下一次指针进入 target：返回的函数给出「进入」到「opened() 头一次成立」隔了多少毫秒，
 * 两头有一头还没发生时为 null。要在 userEvent.hover 之前调用。
 */
export function watchHoverOpen(target: Element, opened: () => boolean): () => number | null {
  let enteredAt: number | null = null
  let openedAt: number | null = null
  target.addEventListener('pointerenter', (event) => {
    enteredAt = event.timeStamp
  }, { once: true })
  const observer = new MutationObserver(() => {
    if (!opened())
      return
    openedAt = performance.now()
    observer.disconnect()
  })
  observer.observe(document.body, { subtree: true, childList: true, attributes: true })
  return () => (enteredAt === null || openedAt === null ? null : openedAt - enteredAt)
}

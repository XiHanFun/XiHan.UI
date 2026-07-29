// @xihan-ui/markdown —— 流式 Markdown 渲染内核。
//
// 对外只有一个工厂：喂截至当前的全文，拿回一组带稳定 key 的已渲染块。
// 内部的解析、切块、冻结缓存一概不暴露——把中间态放出去，消费方迟早会绕过缓存
// 直接改块，增量渲染的保证也就没了。
export { blockKind, fenceLang, isFenceClosed } from './blocks'
export { createStreamRenderer } from './renderer'
export { LIVE_BLOCK_KEY } from './types'
export type { RenderedBlock, RenderOpts, StreamRenderer } from './types'

// 解析会话该跟哪个文档。

/**
 * 会话跟随的文档由元素决定，不是全局那一份。
 *
 * 组件可能渲在 iframe 或另一个文档里，跟全局 `document` 会监听到错的那一份，
 * 表现是指针一动就断手。元素还没就位（首帧尚未布局）时退回全局；
 * 连全局都没有（无 DOM 的纯逻辑测试）返回 null，由调用方决定退化成什么。
 */
export function resolveSessionDoc(el: Element | null | undefined): Document | null {
  return el?.ownerDocument ?? (typeof document === 'undefined' ? null : document)
}

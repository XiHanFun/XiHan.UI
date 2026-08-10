/**
 * 便宜的内容摘要，只用来拼稳定 key。
 *
 * 不是密码学哈希，也不需要是：它的唯一职责是让「同一块内容」得到同一个 key、
 * 让「内容真变了的块」换掉 key。定型块的内容按定义不会再变，所以碰撞的代价
 * 也只是复用了一次本该重建的 DOM，不会渲染出错的内容。
 *
 * 用 FNV-1a：一遍过、无分配，比任何要建中间字符串的写法都省。
 */
export function cheapHash(text: string): string {
  let h = 0x811C9DC5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    // FNV 质数 16777619 的移位展开：直接乘会掉进浮点，Math.imul 才是 32 位整数乘
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}

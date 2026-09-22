/**
 * 一致性套件里 `<img>` 图源所在的域名。`.test` 是保留顶级域，永远解析不到。
 *
 * 套件按 jsdom 的口径写：load / error 只由步骤在 image 节点上派发，套件自己推状态。
 * 真实浏览器会自己去取这个域名，解析失败即派 error；CI 上负缓存后几毫秒就到，
 * 抢在轮询之前把 loading 推成 error。浏览器态由 `browser-commands` 的 `holdImageSources`
 * 把这个域名下的请求挂住——既不放行也不失败——两侧从此同一口径。改域名两处一起改。
 */
export const IMAGE_SOURCE_ORIGIN = 'https://example.test'

/** 套件里一张图的地址。 */
export function imageSource(file: string): string {
  return `${IMAGE_SOURCE_ORIGIN}/${file}`
}

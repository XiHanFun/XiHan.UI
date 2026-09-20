---
"@xihan-ui/vue": patch
---

**DatePicker 交给焦点域的 `getContentEl` 只回答 DOM 事实，不再复核 Portal 配置。**

焦点域在框架错误通道之外（机器 flush、rAF）调用这个 getter；此前它读的是带校验的 `portalTarget` computed，运行期收到跨 Document 或非 Element 的 `portalContainer` 时，先到的这一路把异常截走成未捕获 rejection，渲染只剩缓存的旧值，`app.config.errorHandler` 收不到错误。现在 getter 直接按显式 `portalContainer` 或运行时默认落点做包含判断（不包含即视为正文尚未进落点），配置错误仍由渲染读 `portalTarget` 抛出并交给框架上报。

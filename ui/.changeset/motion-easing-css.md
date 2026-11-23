---
'@xihan-ui/motion': minor
---

**新增** `readMotion()` 的读取结果多一个 `easingCss(name)`：语义缓动的 CSS 写法，直接交给 Web Animations 的 `easing`，读不到令牌时退回 JS 侧的同名缓动。另导出 `parseCssTime()`，把 `200ms` / `0.2s` 这样的时长换成毫秒，认不出的写法返回 `null`。库内原先各自现读 `--xh-motion-ease-*` 的八处改走这一口，行为不变。

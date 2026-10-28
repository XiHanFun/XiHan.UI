---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': minor
---

**新增** 缺省无衬线字体栈令牌 `--xh-font-family-sans`（`system-ui, -apple-system, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif`），与可选的全局入口 `@xihan-ui/styles/global.css`：引入后把这支令牌落到 `:root` 的 `font-family` 上，Portal 渲到 body 里的浮层沿继承一并拿到。规则在最低的 `xihan.reset` 层、选择器包在 `:where()` 里，宿主自己写的字体照样压得住。组件本身仍不定字体、继承宿主，不引入这份入口时渲染不变；主入口 `@xihan-ui/styles` 不含它。

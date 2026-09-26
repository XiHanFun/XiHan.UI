---
'@xihan-ui/tokens': major
'@xihan-ui/styles': major
---

循环动画的周期令牌并入 `--xh-motion-loop-*` 一族，与 `--xh-motion-loop-breathe` 并列；旧名不再输出，也不留别名。改写过或在自己样式里引用过下列旧名的，改为新名。`tokens.json`、`tokens` 对象与 `TokenName` 类型同样只有新名。

| 旧名 | 新名 | 取值 |
| --- | --- | --- |
| `--xh-spin-duration` | `--xh-motion-loop-spin` | 640ms |
| `--xh-caret-duration` | `--xh-motion-loop-caret` | 1000ms |
| `--xh-shimmer-duration` | `--xh-motion-loop-shimmer` | 1600ms |

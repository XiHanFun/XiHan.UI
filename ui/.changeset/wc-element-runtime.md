---
'@xihan-ui/web-components': major
---

**破坏性** Web Components 适配器的运行时底座去掉 Lit 字样：这个包不依赖 Lit，叫 `LitRuntime` 会让人以为要装它。与 Vue 的 `createVueRuntime`、React 的 `createReactRuntime` 对应，按介质叫元素运行时。

| 旧名 | 新名 |
| --- | --- |
| `createLitRuntime` | `createElementRuntime` |
| `LitRuntime` | `ElementRuntime` |

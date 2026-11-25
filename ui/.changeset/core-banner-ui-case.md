---
'@xihan-ui/core': major
---

**破坏性** core 里启动横幅的五个导出把品牌名写成 `XiHanUI`，与 Vue 的 `XiHanUI`、`XiHanUIResolver`，styles 的 `XiHanUIStyles` 同一种大小写。

| 旧名 | 新名 |
| --- | --- |
| `xihanUiBanner`（`@xihan-ui/core/vite`） | `xihanUIBanner` |
| `getXiHanUiBanner`、`printXiHanUiBanner` | `getXiHanUIBanner`、`printXiHanUIBanner` |
| `XiHanUiBannerOptions`、`XiHanUiBannerPlugin` | `XiHanUIBannerOptions`、`XiHanUIBannerPlugin` |

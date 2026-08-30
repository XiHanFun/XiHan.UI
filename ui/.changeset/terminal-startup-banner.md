---
"@xihan-ui/kernel": minor
---

**新增** `@xihan-ui/kernel/vite` 子入口：启动横幅打在开发者跑项目的那个终端里，
与 Framework 侧印在应用构造上的那一份对齐。

```ts
import { xihanUiBanner } from '@xihan-ui/kernel/vite'

export default defineConfig({ plugins: [xihanUiBanner()] })
```

除插件外还导出 `getXiHanUiBanner()`（只出文本）与 `printXiHanUiBanner()`（打到 stdout），
不认识 Vite，任何 Node 脚本都能调。这一份不从 `index` 再导出，浏览器产物里不会有它。

**调整** 浏览器控制台的启动摘要**默认不打**（`setMetadataAutoPrint(true)` 可以打开）。
浏览器控制台是访问网站的人也看得见的地方，横幅是给开发者看的，两者不该混在一起。

**移除** `XIHAN_UI_METADATA` 的 `logo` 与 `sendWord` 两个字段，它们改由终端横幅那一份自持。
这个对象会被浏览器产物整个带走——实测改之前，标志与寄语确实出现在生产构建的
`vendor-ui-*.js` 里，发到了每个访问者手上（不打印，但字符串在）。改完这两样在
`@xihan-ui/vue` 与 `@xihan-ui/web-components` 的产物里都搜不到了。
`getMetadataSummary()` / `getMetadataDetails()` 随之不再带寄语那几行。

按 [版本与兼容性政策](/guide/versioning)，走主版本的是导出名、prop、部件与 `data-*`、
CSS 令牌与 `@layer` 名、自定义元素标签这六种介质；导出常量的内部字段不在其列。
读过这两个字段的代码要改到 `@xihan-ui/kernel/vite`。

横幅排在 Vite 打完本地地址之后：Vite 打那一段时会清屏，挂 `httpServer` 的 `listening`
仍然早于它、横幅会被冲掉。走 `server.config.logger` 而不是 `console`，
`--silent` 与 `logLevel` 才管得住它。

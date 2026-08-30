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

标志逐字符横向彩虹，与 Framework 侧 `LogHelper.Rainbow` 同一套算术：进度取字符在行内的
下标除以最长行的长度，色相走 0–300 度，空格不上色。

要不要上色的判据与 `picocolors` 逐条对齐——Vite 自己的输出就是用它上色的，照它走横幅才与
周围那几行同进同退。只看 `isTTY` 不够：跑在 turbo 底下时 stdout 是管道、`isTTY` 为假，
而 Vite 的地址那几行照样是彩的，横幅会成为唯一没颜色的一段。`NO_COLOR` / `--no-color`
仍然一票否决。

**调整** 浏览器控制台的启动摘要**默认不打**（`setMetadataAutoPrint(true)` 可以打开）。
浏览器控制台是访问网站的人也看得见的地方，横幅是给开发者看的，两者不该混在一起。

**新增** `XIHAN_UI_LOGO` 与 `XIHAN_UI_SEND_WORD` 两个导出，同时把它们从
`XIHAN_UI_METADATA` 对象里摘出来单独放。`getMetadataSummary()` / `getMetadataDetails()`
随之不再带寄语那几行。

摘出来是有实测依据的：那个对象被整体引用，打包器摇不掉它里面的字段——改之前标志与寄语
确实出现在生产构建的 `vendor-ui-*.js` 里，发到了每个访问者手上（`isDev()` 挡住了打印，
但字符串在）。单独导出之后还要再走一步：两个常量写成字面量相加而不是数组 `join`，
因为 `join` 证明不了无副作用，打包器会把变量名摇掉、却把 `[...].join('\n')` 整段留下。
折成字面量之后重建产物，寄语、标志、「致她」三处搜出来都是 0 个文件，
而同一份产物里元数据的描述仍在。

读过 `XIHAN_UI_METADATA.logo` / `.sendWord` 的代码改取这两个导出。按
[版本与兼容性政策](/guide/versioning)，走主版本的是导出名、prop、部件与 `data-*`、
CSS 令牌与 `@layer` 名、自定义元素标签这六种介质，导出常量的内部字段不在其列。

横幅排在 Vite 打完本地地址之后：Vite 打那一段时会清屏，挂 `httpServer` 的 `listening`
仍然早于它、横幅会被冲掉。走 `server.config.logger` 而不是 `console`，
`--silent` 与 `logLevel` 才管得住它。

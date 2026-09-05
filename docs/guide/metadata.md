# 框架元数据

框架名称、版本、版权与运行时信息的**单一事实源**在 `@xihan-ui/core` 的 `XIHAN_UI_METADATA` 里，与 [XiHan.Framework](https://github.com/XiHanFun/XiHan.Framework) 的 `XiHanMetadata` 同构：常量集中维护在一份文件里，版本从 package.json 派生，运行时信息由适配器登记。

## 元数据对象

```ts
import { XIHAN_UI_METADATA, XIHAN_UI_VERSION } from '@xihan-ui/core/metadata'

XIHAN_UI_METADATA.name            // 'XiHan.UI'
XIHAN_UI_METADATA.displayName     // '曦寒视图组件'
XIHAN_UI_METADATA.version         // 与 package.json 同源，即整套库的版本
XIHAN_UI_METADATA.majorVersion    // 主版本号（数字）
XIHAN_UI_METADATA.minorVersion    // 次版本号
XIHAN_UI_METADATA.patchVersion    // 修订版本号
XIHAN_UI_METADATA.prerelease      // 预发布标识（如 'alpha.2'），正式版为 null
XIHAN_UI_METADATA.copyright       // 版权信息
XIHAN_UI_METADATA.author          // 作者
XIHAN_UI_METADATA.organization    // 组织与网址
XIHAN_UI_METADATA.repositoryUrl   // 仓库地址
XIHAN_UI_METADATA.documentationUrl // 文档地址
XIHAN_UI_METADATA.license         // 许可证与地址
XIHAN_UI_METADATA.keywords        // 关键词
XIHAN_UI_METADATA.supportedPlatforms // 支持的浏览器引擎（Chrome / Edge / Firefox / Safari）
XIHAN_UI_METADATA.adapters        // 渲染适配器（vue / web-components）
```

对象与内部数组一律 `Object.freeze`——这是集中维护点，消费方改不坏它。

标志与寄语不在这个对象里，是两个独立导出：

```ts
import { XIHAN_UI_LOGO, XIHAN_UI_SEND_WORD } from '@xihan-ui/core/metadata'
```

对象被整体引用时打包器摇不掉它里面的字段，并进去这两样就会跟着浏览器产物发到每个访问者手上。单独导出之后没人引用就整个消失——它们是给开发者看的，见下文的终端横幅。

版本不在元数据里手写：`version` / `majorVersion` / `minorVersion` / `patchVersion` / `prerelease` 全部由 `XIHAN_UI_VERSION` 从 core 的 package.json 解析而来。改版本只改 package.json 一处，元数据自动跟上。

## 运行时信息

```ts
import { getRuntimeInfo, getRuntimeHost } from '@xihan-ui/core/metadata'

getRuntimeInfo()
// { mode: 'development' | 'production', ssr: boolean, host: { name, version } | null }
```

- `mode` 取 `import.meta.env.DEV`；`ssr` 表示当前是否运行在无 DOM 的环境（服务端渲染 / 纯 Node）。
- `host` 是**适配器自己登记的运行时宿主**：Vue 适配器在第一个组件建机器时登记 `{ name: 'vue', version }`，Web Components 适配器在 `defineXhElements()` 里登记。元数据据此能报出「这套组件运行在哪个适配器、什么版本」——这是 Framework 侧 EntryAssembly 概念在浏览器语境下的对应物。

## 输出

与 Framework 的 `GetSummary()` / `GetDetails()` 同款：

```ts
import { getMetadataSummary, getMetadataDetails, printMetadataSummary } from '@xihan-ui/core/metadata'

const summary = getMetadataSummary()
// XiHan.UI 曦寒视图 v<当前版本>
// 快速、轻量、高效、用心的框架无关跨端组件库。
//
// 宿主:vue v<当前版本>

const details = getMetadataDetails() // 摘要之外再补作者 / 组织 / 仓库 / 文档 / 许可证 / 环境

// dev 里打到控制台，生产静默
printMetadataSummary()
printMetadataDetails()
```

### 启动横幅：打在开发者的终端里

对齐 [XiHan.Framework](https://github.com/XiHanFun/XiHan.Framework) 的 `XiHanApplicationBase`——应用构造时自动印 Logo 与摘要。UI 库的等价位置是**开发服务器启动的那个终端**，由 `@xihan-ui/core/vite` 子入口负责：

```ts
// vite.config.ts
import { xihanUiBanner } from '@xihan-ui/core/vite'
import { defineConfig } from 'vite'

export default defineConfig({ plugins: [xihanUiBanner()] })
```

```text
   _  __ ______  _____    _   __        ← 标志逐字符横向彩虹
  | |/ //  _/ / / /   |  / | / /
  |   / / // /_/ / /| | /  |/ /
 /   |_/ // __  / ___ |/ /|  /
/_/|_/___/_/ /_/_/  |_/_/ |_/

XiHan.UI 曦寒视图 v<当前版本>
快速、轻量、高效、用心的框架无关跨端组件库。
碧落降恩承淑颜，共挚崎缘挽曦寒。
迁般故事终成忆，谨此葳蕤换思短。
              —— 致她
```

同一入口另出两个不认识 Vite 的函数，任何 Node 脚本都能调：`getXiHanUiBanner()` 只返回文本，`printXiHanUiBanner()` 打到 stdout。这一份不从 `index` 再导出，浏览器产物里不会有它。

要不要上色的判据与 `picocolors` 逐条对齐——Vite 自己的输出就是用它上色的，照它走横幅才与周围那几行同进同退；`NO_COLOR` 与 `--no-color` 一票否决。横幅排在 Vite 打完本地地址之后（它打那一段时会清屏），走的是 `server.config.logger`，因此 `--silent` 与 `logLevel` 管得住它。

### 浏览器控制台：默认不打

适配器启动时也能往浏览器控制台打一次摘要，但**默认关着**：控制台是访问网站的人也看得见的地方，横幅是给开发者看的。要打就显式开，开关只影响之后的启动，手动 `print` 不受影响：

```ts
import { setMetadataAutoPrint } from '@xihan-ui/core/metadata'

setMetadataAutoPrint(true)
```

打开后 Vue 适配器在第一个组件建机器时、Web Components 适配器在 `defineXhElements()` 时各打一次，整个页面只打一次，**生产构建静默**。打的只有摘要，标志与寄语归终端那一份。

## 相关

- [版本与兼容性政策](./versioning)：同版发布与版本承诺
- [安装与接入](../installation)：两个适配器的接入方式

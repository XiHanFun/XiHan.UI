# 框架元数据

框架名称、版本、版权与运行时信息的**单一事实源**在 `@xihan-ui/kernel` 的 `XIHAN_UI_METADATA` 里，与 [XiHan.Framework](https://github.com/XiHanFun/XiHan.Framework) 的 `XiHanMetadata` 同构：常量集中维护在一份文件里，版本从 package.json 派生，运行时信息由适配器登记。

## 元数据对象

```ts
import { XIHAN_UI_METADATA, XIHAN_UI_VERSION } from '@xihan-ui/kernel/metadata'

XIHAN_UI_METADATA.name            // 'XiHan.UI'
XIHAN_UI_METADATA.displayName     // '曦寒视图组件'
XIHAN_UI_METADATA.version         // 与 package.json 同源，17 包锁步下即整套库的版本
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
XIHAN_UI_METADATA.logo            // 曦寒标志
XIHAN_UI_METADATA.sendWord        // 曦寒寄语
```

对象与内部数组一律 `Object.freeze`——这是集中维护点，消费方改不坏它。

版本不在元数据里手写：`version` / `majorVersion` / `minorVersion` / `patchVersion` / `prerelease` 全部由 `XIHAN_UI_VERSION` 从 kernel 的 package.json 解析而来。锁步发版下改版本只改 package.json 一处，元数据自动跟上。

## 运行时信息

```ts
import { getRuntimeInfo, getRuntimeHost } from '@xihan-ui/kernel/metadata'

getRuntimeInfo()
// { mode: 'development' | 'production', ssr: boolean, host: { name, version } | null }
```

- `mode` 取 `import.meta.env.DEV`；`ssr` 表示当前是否运行在无 DOM 的环境（服务端渲染 / 纯 Node）。
- `host` 是**适配器自己登记的运行时宿主**：Vue 适配器在第一个组件建机器时登记 `{ name: 'vue', version }`，Web Components 适配器在 `defineXhElements()` 里登记。元数据据此能报出「这套组件运行在哪个适配器、什么版本」——这是 Framework 侧 EntryAssembly 概念在浏览器语境下的对应物。

## 输出

与 Framework 的 `GetSummary()` / `GetDetails()` 同款：

```ts
import { getMetadataSummary, getMetadataDetails, printMetadataSummary } from '@xihan-ui/kernel/metadata'

const summary = getMetadataSummary()
// XiHan.UI 曦寒视图 v1.0.0-alpha.2
// 框架无关的组件库：状态机与无障碍住在 headless 内核，每个框架只配一个薄适配器。
// 碧落降恩承淑颜，共挚崎缘挽曦寒。
// 迁般故事终成忆，谨此葳蕤换思短。
//               —— 致她
//
// 宿主：vue v1.0.0-alpha.2 · 锁步一致

const details = getMetadataDetails() // 摘要之外再补作者 / 组织 / 仓库 / 文档 / 许可证 / 环境

// dev 里打到控制台，生产静默
printMetadataSummary()
printMetadataDetails()
```

宿主行如实报锁步一致性：宿主版本与 kernel 版本不同时显示「锁步不一致」并列出两边版本号。

### 启动横幅：引用即打印

对齐 [XiHan.Framework](https://github.com/XiHanFun/XiHan.Framework) 的 `XiHanApplicationBase`——应用构造时自动印 Logo + `GetSummary()`，无需手动调用。UI 库的等价时机是**适配器启动**：

- Vue 适配器在**第一个组件建机器**时自动打一次；
- Web Components 适配器在 `defineXhElements()` 时自动打一次。

整个页面只打一次（标志走品牌色，正文含宿主与锁步行），**生产构建静默**。消费方不需要手动调 `printMetadataSummary` 就能在 dev 控制台看到横幅：

```text
   _  __ ______  _____    _   __        ← 品牌色
  | |/ //  _/ / / /   |  / | / /
  |   / / // /_/ / /| | /  |/ /
 /   |_/ // __  / ___ |/ /|  /
/_/|_/___/_/ /_/_/  |_/_/ |_/

XiHan.UI 曦寒视图 v1.0.0-alpha.2
框架无关的组件库：状态机与无障碍住在 headless 内核，每个框架只配一个薄适配器。
碧落降恩承淑颜，共挚崎缘挽曦寒。
迁般故事终成忆，谨此葳蕤换思短。
              —— 致她

宿主：vue v1.0.0-alpha.2 · 锁步一致
```

不想要时关掉（只影响之后的启动，手动 print 不受影响）：

```ts
import { setMetadataAutoPrint } from '@xihan-ui/kernel/metadata'

setMetadataAutoPrint(false)
```

## 相关

- [版本与兼容性政策](./versioning)：17 包锁步发版与版本承诺
- [安装与接入](../installation)：两个适配器的接入方式

# 框架元数据

框架名称、版本、版权与运行时信息的单一事实源在 `@xihan-ui/core` 的 `XIHAN_UI_METADATA` 中，与 [XiHan.Framework](https://github.com/XiHanFun/XiHan.Framework) 的 `XiHanMetadata` 同构：常量集中维护在一份文件中，版本从 package.json 派生，运行时信息由适配器登记。

## 元数据对象

```ts
import { XIHAN_UI_METADATA, XIHAN_UI_VERSION } from "@xihan-ui/core/metadata";

XIHAN_UI_METADATA.name; // 'XiHan.UI'
XIHAN_UI_METADATA.displayName; // '曦寒视图组件'
XIHAN_UI_METADATA.version; // 与 package.json 同源，即整套库的版本
XIHAN_UI_METADATA.majorVersion; // 主版本号（数字）
XIHAN_UI_METADATA.minorVersion; // 次版本号
XIHAN_UI_METADATA.patchVersion; // 修订版本号
XIHAN_UI_METADATA.prerelease; // 预发布标识（如 'alpha.2'），正式版为 null
XIHAN_UI_METADATA.copyright; // 版权信息
XIHAN_UI_METADATA.author; // 作者
XIHAN_UI_METADATA.organization; // 组织与网址
XIHAN_UI_METADATA.repositoryUrl; // 仓库地址
XIHAN_UI_METADATA.documentationUrl; // 文档地址
XIHAN_UI_METADATA.license; // 许可证与地址
XIHAN_UI_METADATA.keywords; // 关键词
XIHAN_UI_METADATA.supportedPlatforms; // 支持的浏览器引擎（Chrome / Edge / Firefox / Safari）
XIHAN_UI_METADATA.adapters; // 渲染适配器（react / vue / web-components）
```

对象与内部数组一律 `Object.freeze`：这是集中维护点，消费方无法修改。

标志与寄语不在这个对象中，是两个独立导出：

```ts
import { XIHAN_UI_LOGO, XIHAN_UI_SEND_WORD } from "@xihan-ui/core/metadata";
```

对象被整体引用时打包器无法摇掉其中的字段，并入这两项会随浏览器产物发送给每个访问者。单独导出后无人引用即整体消失：它们面向开发者，见下文的终端横幅。

版本不在元数据中手写：`version` / `majorVersion` / `minorVersion` / `patchVersion` / `prerelease` 全部由 `XIHAN_UI_VERSION` 从 core 的 package.json 解析而来。修改版本只改 package.json 一处，元数据自动同步。

## 运行时信息

```ts
import { getRuntimeHost, getRuntimeInfo } from "@xihan-ui/core/metadata";

getRuntimeInfo();
// { mode: 'development' | 'production', ssr: boolean, host: { name, version } | null }
```

- `mode` 取 `import.meta.env.DEV`；`ssr` 表示当前是否运行在无 DOM 的环境（服务端渲染 / 纯 Node）。
- `host` 是适配器自行登记的运行时宿主：Vue 适配器在第一个组件创建状态机时登记 `{ name: 'vue', version }`，Web Components 适配器在 `defineXhElements()` 中登记。元数据据此报告组件运行的适配器与版本：这是 Framework 侧 EntryAssembly 概念在浏览器语境下的对应物。

## 输出

与 Framework 的 `GetSummary()` / `GetDetails()` 同款：

```ts
import { getMetadataDetails, getMetadataSummary, printMetadataSummary } from "@xihan-ui/core/metadata";

const summary = getMetadataSummary();
// XiHan.UI 曦寒视图 v<当前版本>
// 快速、轻量、高效、用心的框架无关跨端组件库。
//
// 宿主:vue v<当前版本>

const details = getMetadataDetails(); // 摘要之外再补作者 / 组织 / 仓库 / 文档 / 许可证 / 环境

// dev 中输出到控制台，生产静默
printMetadataSummary();
printMetadataDetails();
```

### 启动横幅：输出到开发者的终端

对齐 [XiHan.Framework](https://github.com/XiHanFun/XiHan.Framework) 的 `XiHanApplicationBase`：应用构造时自动打印 Logo 与摘要。UI 库的等价位置是开发服务器启动的终端，由 `@xihan-ui/core/vite` 子入口负责：

```ts
// vite.config.ts
import { xihanUiBanner } from "@xihan-ui/core/vite";
import { defineConfig } from "vite";

export default defineConfig({ plugins: [xihanUiBanner()] });
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

同一入口另导出两个与 Vite 无关的函数，任何 Node 脚本都可调用：`getXiHanUiBanner()` 只返回文本，`printXiHanUiBanner()` 输出到 stdout。这一份不从 `index` 再导出，浏览器产物中不包含它。

是否上色的判据与 `picocolors` 逐条对齐：Vite 自身的输出即用它上色，遵循同一判据横幅才与周围输出一致；`NO_COLOR` 与 `--no-color` 一票否决。横幅排在 Vite 打印本地地址之后（打印该段时会清屏），使用 `server.config.logger`，因此受 `--silent` 与 `logLevel` 控制。

### 浏览器控制台：默认不输出

适配器启动时也可以向浏览器控制台输出一次摘要，但默认关闭：控制台是网站访问者也可见的位置，横幅面向开发者。需要输出时显式开启，开关只影响之后的启动，手动 `print` 不受影响：

```ts
import { setMetadataAutoPrint } from "@xihan-ui/core/metadata";

setMetadataAutoPrint(true);
```

开启后 Vue 适配器在第一个组件创建状态机时、Web Components 适配器在 `defineXhElements()` 时各输出一次，整个页面只输出一次，生产构建静默。输出的只有摘要，标志与寄语属于终端横幅。


## 相关

- [版本与兼容性政策](./versioning)：同版发布与版本承诺
- [安装与接入](../installation)：三个适配器的接入方式

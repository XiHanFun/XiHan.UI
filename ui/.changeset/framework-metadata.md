---
"@xihan-ui/kernel": patch
"@xihan-ui/vue": patch
"@xihan-ui/web-components": patch
---

框架元数据：名称、版本与运行时信息的单一事实源，与 XiHan.Framework 的 `XiHanMetadata` 同构。

`@xihan-ui/kernel` 新增 `XIHAN_UI_METADATA` 与 `XIHAN_UI_VERSION`：

- **静态常量集中维护**：名称 / 显示名 / 版权 / 作者 / 组织 / 仓库 / 文档 / 许可证 / 关键词 /
  支持平台 / 适配器清单 / 标志 / 寄语，全部 `Object.freeze`。
- **版本从 package.json 派生**：`version` 与 `majorVersion` / `minorVersion` / `patchVersion` /
  `prerelease` 自动解析，锁步发版下改版本只改 package.json 一处。
- **运行时信息**：`getRuntimeInfo()` 报 dev/prod 模式与 SSR 状态；两个适配器启动时用
  `registerRuntimeHost()` 登记自己，元数据据此报出「运行在哪个适配器、什么版本」——
  Framework 侧 EntryAssembly 概念在浏览器语境下的对应物。
- **输出**：`getMetadataSummary()` / `getMetadataDetails()` 返回格式化文本（宿主行如实报
  锁步一致性），`print` 版只在 dev 出声，生产静默。
- **启动横幅**：对齐 Framework 的 `XiHanApplicationBase`——引用即打印。适配器启动时
  （Vue 首个组件建机器 / WC 注册元素）自动打一次 Logo + 摘要（整页一次、生产静默），
  `setMetadataAutoPrint(false)` 可关。

文档见新章节「框架元数据」（guide/metadata）。

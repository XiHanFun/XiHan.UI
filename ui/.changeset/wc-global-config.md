---
"@xihan-ui/headless": patch
"@xihan-ui/vue": patch
"@xihan-ui/web-components": patch
---

自定义元素补上全局文案层：`setXhConfig`。

`provideXhConfig` 一直只有 Vue 适配器有。自定义元素拿不到 provide/inject，文案又是对象、
只能走 property 不能走 attribute，于是 31 个元素只能在 JS 里逐实例各设一次 `.translations`——
一个中文应用要为此写几十行。而 `guide/i18n.md` 通篇把 `provideXhConfig` 当作「这套机制」讲，
一次都没提 Web Components，读的人会以为两端通用。

现在两端各有一处全局出口，取值优先级一致：**实例 → 全局 → 组件内建默认（英文）**，
`translations` 逐键合并。切语言再调一次 `setXhConfig` 即可，已挂载的元素跟着重渲。

接线落在 `MachineController` 一处——31 个元素的机器 props 都从那里过，不必逐个改。

`XhTranslationOverrides` 那张 31 条的映射表下沉到 `@xihan-ui/headless`，两个适配器共用一份。
在 WC 侧另抄一份是唯一的替代方案，而两份 31 条的表迟早会漂。Vue 侧原样再导出，导出名不变。

与 Vue 侧的两处差别写进文档了：`setXhConfig` 是整份替换而非深合并；它是模块级的，
没有「只在某棵子树里换语言」的能力。

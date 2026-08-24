---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

json-viewer 补原文视图：`view="text"` 直接出缩进过的 JSON 原文。

树档是拿来"翻"的——折叠、逐层看结构；而"核对这份报文与后端下发的是不是一字不差"、
"把它整段拷走"这两件事树档做不到：值受 `maxStringLength` 截断、成员受 `maxItems` 折减，
分支摘要与把手还带 `user-select: none`，框选拿到的不是原文。原文档就是补这一件事，
因此它刻意不吃那两个折减选项。

`api.text` 在两档下都取得到，作者要做"复制原文"按钮时不必自己再序列化一遍。
序列化与树同源：同一个 `jsonEntries` 排键（`sortKeys` 一样生效）、同一条祖先链判环
（环落成 `"[Circular]"`，两条不相干分支共享同一个对象照样摊开），
`bigint` / `undefined` / 函数这些 JSON 没有写法的值退回树上那份文本并按字符串写出，
整份始终解析得动。

新增 headless 出口 `jsonText` 与类型 `JsonViewerView`，解剖新增 `text` 部件。
皮肤与树档共用同一套边框、内衬与高度令牌，两档切过去盒子不跳。

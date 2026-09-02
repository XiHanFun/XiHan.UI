---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
---

**清掉库里剩下的过渡期安排。** 库里不留兼容、不留兜底：同一件事不再发两份属性，同一个 prop 不再收新旧两种写法。下面两组名字已删除，设它们不再有任何效果。

## 一、六个组件不再发 `data-status`

`data-status` 曾同时承载两件事——`result` 的「结果种类」（`404` / `success` / …）与另外六个组件的生命周期「相位」（`loading` / `streaming` / …）。相位这一轴归 `data-state`，`data-status` 只表达结果种类。现在这六处只发 `data-state`。

**破坏性：下列节点上不再有 `data-status`，选它的 CSS 一条也不会再命中。** 这一介质没有 IDE 提示，选择器失配既不报错也不降级——请在自己的代码库里全文搜索 `data-status`，凡是选中下表组件的，把属性名换成 `data-state`，取值一字不用改。

| 组件 | 不再发 `data-status` 的部件 | 换成 | 取值 |
| --- | --- | --- | --- |
| `avatar` | `root` / `image` / `fallback` | `data-state` | `loading` / `loaded` / `error` |
| `image` | `root` / `image` / `fallback` | `data-state` | `loading` / `loaded` / `error` |
| `thread` | `root` / `viewport` | `data-state` | `idle` / `submitted` / `streaming` / `error` |
| `composer` | `root` | `data-state` | `ready` / `submitted` / `streaming` / `error` |
| `file-upload` | `item` | `data-state` | `uploading` / `done` / `error` |
| `message-feed` | `root` | `data-state` | `idle` / `submitted` / `streaming` / `error` |

前五家的那些部件上，`data-state` 此前就在发同一个值，换个属性名即可；`message-feed` 的 `root` 是唯一一处此前只有 `data-status`、现在改发 `data-state` 的。

`result` 的 `root` 仍发 `data-status`，没有变化。至此 `[data-status='error']` 只会命中「一整页 500 报错」这一种语义，不会再顺带命中「加载失败的头像」或「一条流到一半出错的消息」。

## 二、`tree` 的 `selectionMode` 已删，改用 `multiple`

树的选择模式此前有新旧两个入口：`multiple?: boolean`（同族的 `tree-select` 与另外六家都用它）与只有两个取值、与布尔等价的 `selectionMode?: 'single' | 'multiple'`。旧入口整条删除，两者同时给时以旧名为准的那条规矩也随之作废。

**破坏性：下列名字已删。**

| 已删 | 换成 |
| --- | --- |
| `@xihan-ui/headless` 导出的类型 `TreeSelectionMode` | 无——模式是布尔，写 `multiple?: boolean` |
| `@xihan-ui/headless` 导出的函数 `treeSelectionMode` | 无——直接读 `multiple` |
| Vue `<XhTreeRoot selection-mode="multiple">` | `<XhTreeRoot multiple>` |
| 自定义元素 `<xh-tree selection-mode="multiple">` | `<xh-tree multiple>` |
| `useTree()` / `TreeApi` 上的 `selectionMode` getter | `multiple`（布尔） |

`selectionMode` 在 `calendar`、`date-picker`、`listbox`、`table` 上是各自真实的多取值枚举，不在此列，一个字没动。

## 三、版本政策不再承诺废弃期

原先写着「标记废弃后至少保留到下一个 major、且不少于两个 minor，取更长者」，并给新增必备部件留了「一个 major 周期内只报 `warn`」的缓冲档。两条都已撤销：本库不设废弃期、不留别名、不挂 `@deprecated` 让旧名多活一版；移除动作直接落在 major，逐条写进更新日志——那是唯一的迁移材料。新增必备部件从落地那一刻起就按 `error` 报（校验器本来就一直是 `error`，此前那条缓冲档只写在文档里、代码从没实现过）。

这两种介质都没有 IDE 提示，改错了不会报错，所以上面两张表把旧名与替换写法逐条列全，可以直接照着在自己的代码库里全文搜索。

## 默认渲染逐像素未变

自带皮肤里没有一条规则选中那五个组件的 `data-status`（只有 `result.css` 选 `data-status`），`tree` 的选择模式换入口也不改任何一条选择器。八件像素基线（button / text-field / select / menu / popover / dialog / drawer / toast）无差异。

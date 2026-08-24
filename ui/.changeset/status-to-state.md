---
"@xihan-ui/headless": minor
---

生命周期相位改走 `data-state`，`data-status` 退回「结果种类」一轴。

`data-status` 一直同时承载两件毫不相干的事：`result` 报的是**结果种类**
（404 / 403 / 500 / success / warning / error / info——它没有生命周期，也不会随时间往前走），
而 `avatar` / `image` / `thread` / `composer` / `file-upload` 报的是**生命周期相位**
（loading / streaming / uploading / …）。于是使用者写一条 `[data-status='error']`
的全局规则，会同时命中「加载失败的头像」和「一整页 500 报错」——两义共用一个名字，
写规则的人必然错一半。

相位那五家现在改发 `data-state`，取值一个不变（它们本来就都登记在词汇表的 `phase` 族里）。
`data-status` 在这五家上**再发一个大版本**作为兼容位，下个大版本移除；`result` 的
`data-status` 不动，此后它是这一轴唯一的含义。

要做的事：读这五个组件相位的选择器与断言改指 `data-state`，例如
`[data-scope='avatar'][data-status='loading']` → `[data-scope='avatar'][data-state='loading']`。
读 `result` 的不用改。

`check-state-vocabulary` 新增一条判据钉住这条分轴：`data-status` 的取值只许是结果种类，
过渡期那五家登记在 `state-vocabulary.json` 的 `deprecatedDual` 里，且必须两条一起发——
只留旧的等于没迁；名单里的组件哪天不再发 `data-status` 了，门禁会提醒把登记删掉。

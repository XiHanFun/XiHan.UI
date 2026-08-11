---
"@xihan-ui/styles": minor
---

补齐 4 处「边框改不动」的覆盖槽。

这几处的边框颜色绑在背景槽上，或者干脆没有槽——想只改边框改不了，一动就连底色一起变：

- `form` 的提交按钮三态：`border-color` 直接读 `--xh-form-submit-bg`，没有 `--xh-form-submit-border`。
- `editable` 的提交按钮 hover / active：静息态有 `--xh-editable-submit-border`，另两态回落到 bg 槽，
  覆盖被顶掉。
- `table` 的行选中把手选中态：静息态有 `--xh-table-trigger-border`，选中态改用 bg 槽。
- `steps` 的禁用态指示器：全皮肤唯一一条没有对外覆盖槽的边框声明，而且拿前景令牌
  `--xh-fg-disabled` 当边框色；同部件的 current / completed 两态都有各自的 border 槽。

新增 8 个槽，都排在既有 bg 槽之前作为第一优先，未设置时求值链回落到原值——**渲染结果逐字不变**，
既有的 `--xh-form-submit-bg` 之类覆盖照旧同时改动边框与底色。

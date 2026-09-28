---
'@xihan-ui/headless': patch
---

GridList 与 TagGroup 改为共用一份网格集合行为（选中集的归一与切换、方向键与连打检索、Tab 进组的落点、全选、按键分派、行内控件放行），公开 API 不变。统一过程中两者向对方看齐的几处：

- TagGroup 的键盘入口放行输入法组合态与可编辑目标；按住 Enter / Space 的连发只切换一次（此前复选会来回翻转）；点标签里作者放的链接、按钮不再改选中；`defaultValue` 按 `selectionMode` 归一（`none` 下为空、`single` 截到一条），与 GridList 一致。
- GridList 在 `single` 模式下调 `toggle(value)` 改为选中这一条；此前会把旧值留下、新值被截掉。

---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': major
---

单行字段不传尺寸时一族同宽：新增语义令牌 `--xh-control-w`（16rem），下拉、日期、时间、文本、数字、密码、颜色、标签、提及、就地编辑、剪贴板等 18 份字段皮肤的根缺省 `inline-size: var(--xh-<组件>-control-w, var(--xh-control-w))`，宽度不再随内容走（此前只有 12rem 地板，实际宽由原生输入的字宽、选中项文字或示例内联样式决定，同一页里 192 到 480 不等）。地板改写成 `min(缺省宽, --xh-<组件>-control-min-w, 100%)`：把缺省宽钉到底线以下时不必再放开底线。

日期范围选择器是登记过的例外：起止两组按日的段位、分隔符与日历钮放不进 16rem，缺省按内容撑开（`--xh-date-range-picker-control-w` 仍可钉宽），地板取 `--xh-control-w`，按年、按月时不比别的字段窄。Clipboard 只放复制钮的用法仍是一颗独立按钮。

破坏性变化：字段根不再随内容变宽，要撑满表单列请在根上写 `inline-size: 100%`；Clipboard 的 `--xh-clipboard-input-min-w` 移除，改为根上的 `--xh-clipboard-control-w` 与 `--xh-clipboard-control-min-w`，输入框改为撑满复制钮之外的剩余宽度。

---
'@xihan-ui/styles': minor
---

时间列里的格子按「候选与菜单」语境的集合行定高：TimePicker、TimeRangePicker 与 DatePicker、DateRangePicker 的时间格此前一律 28px（`--xh-overlay-column-item-h`）、不随尺寸档，DatePicker / DateRangePicker 的时间格字号固定说明档 13px；改为块向内距取所在尺寸档的 `--xh-list-option-py-*`、加一行正文行高撑开，字号随档，与 Select 等候选行同高同字号。`--xh-<c>-item-h` / `--xh-<c>-time-item-h` 仍可钉死高度（缺省不再钉），DatePicker 与 DateRangePicker 新增 `--xh-<c>-time-item-font-size`。TimeRangePicker 列的行内内衬保持不变。

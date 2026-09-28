---
'@xihan-ui/styles': patch
---

按身份取令牌的两处订正（缺省主题下取值不变）：
- 候选与菜单的集合行（Menu、ContextMenu、Menubar 的条目，Select、Combobox、Cascader、TreeSelect、Tree、Listbox、Command、Transfer、Mention 的行，日期与时间面板的预设项与时间格）圆角缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`：二者同为 4px，但行是嵌在面里的小块，主题单改 inset 时行跟着变、按钮与字段不动。
- TimePicker、TimeRangePicker、DatePicker、DateRangePicker 是 floating 面板，面内的列间与分区分隔缺省由 `--xh-material-frosted-separator` 改为实体面的 `--xh-material-solid-separator`。

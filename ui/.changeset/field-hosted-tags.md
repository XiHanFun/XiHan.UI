---
'@xihan-ui/styles': major
---

字段里的已选标签（Select / Combobox / Cascader / TreeSelect / ColorPicker / DatePicker / TimePicker 的多选标签行，以及 TagsInput）：

- 盒没聚焦时淡底标签换白底 `--xh-bg-surface` + `--xh-border-default` 描边，叉悬停 / 按下走白底阶梯 100 → 200；聚焦后回到标签自己的淡底。写了语气的、禁用盒里的标签不换；`--xh-tag-*` 覆盖槽照旧优先
- 盒里有标签时起始内衬由控件内衬（12px）收到 4px；TagsInput 标签之间、标签与输入框之间的间距（也是折行后的行距）三档统一 4px
- lg 档字段里的标签字号钉在说明档 12px
- Tag 皮肤体积随字段宿主档上调

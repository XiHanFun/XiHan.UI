---
'@xihan-ui/styles': minor
---

多标签字段（TagsInput 与 ColorPicker / DatePicker / TimePicker 的多选）装一枚标签时框高回到本档控件高：字段外壳 multi-tag 布局的块向内衬由 4px 收到 2px，加第一枚标签时盒高不再跳。TagsInput 就地编辑框改按状态 chip 档取块尺寸、竖向内衬为 0，与它换掉的标签同高；新增覆盖槽 `--xh-tags-input-item-h`。

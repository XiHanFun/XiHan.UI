---
'@xihan-ui/designer-shell': minor
---

新增 `createPropertyField`：按一种内建编辑方式建出一行独立的属性字段，给宿主的复合编辑器拼装（如四边边框每一边的线宽、线型与颜色）。控件、单位后缀、就地校验、空值、「多个值」与只读都和属性面板里的同一套；文案取字段所在位置的配置（`xh-designer-properties` 那一桶），可再用 `translations` 压一层；`update` 的状态里给 `label` 可换掉标题（如切换语言后）。复合编辑器在字段的 `setValue` 里拼出整个值，再交给自己的 `setValue`，合并与封口照属性面板走。

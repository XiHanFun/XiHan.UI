---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

新增标签行家族配方 `@xihan-ui/styles/tag-list.css`：多选控件把已选值摆成一行标签时共用同一份排法——行只缩不涨、装不下的标签各自截断、+N 那一枚始终完整，新选中的原地弹出、取消选中的在原处淡出、其余滑到新位置。连接层在标签行上投影 `data-xh-tag-list`，行距经桥接槽 `--xh-tag-list-gap` 交给皮肤。Select 的标签行改接这份配方（`--xh-select-tag-list-gap` 照旧生效），外观与动效不变；Headless 里标签的取数与套 tag 的做法抽成共享模块，供 Combobox、TreeSelect、Cascader 复用。

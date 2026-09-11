---
'@xihan-ui/headless': patch
---

Cascader 空数据/首次加载不再要求 column 或 item，TreeSelect 空树或只有分支时不再要求 item。
保留触发器、内容区和树容器的必要语义约束，空态可以直接使用正式状态部件，无须添加假选项。

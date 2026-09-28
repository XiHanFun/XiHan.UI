---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Table 接入 Virtualizer 的正式集合接线口：新增 `virtualizer`，传 Virtualizer 的 `collectionVirtualizer`，`count` 必须等于可见数据行的条数（对不上时明确报错），每个虚拟条目装一行数据行。上下键与 Home / End 按完整行序求落点，落点不在窗口里时先滚进来再交焦点；行号照旧按完整行序报；接上后行拖动换位报 `virtualized` 不可用。Web Components 的表格元素从 Virtualizer 交出的行根上接线（行节点写 `data-xh-part-owner="table"`）。示例「只渲染窗口内的行」改为一万行的正式接线写法。

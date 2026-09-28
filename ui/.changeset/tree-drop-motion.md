---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
---

Tree 拖放落下不再瞬移：拖放与 Alt + 方向键提交搬家时，连接层先记下每一行的排布位，宿主写回 `collection` 的那一次重排里，行按旧位置反向补偿、经皮肤的 `translate` 过渡（`--xh-motion-duration-move` / `--xh-motion-ease-continuous`）滑到新位置；换了父、被宿主重建的节点按节点值认回。减弱动效下 move 为 1ms，即时落位。落点线与换父描边的缺省色由 `--xh-border-control-focus` 改为 `--xh-bg-brand`，与 Table、Sortable 同一种（暗色下二者此前不同色）。

---
'@xihan-ui/core': minor
---

新增 `trackReorder(container, { item, key })`：记下条目此刻的排布位，等宿主下一批增删了条目的 DOM 变更，把排布位变了的条目反向补偿、交给皮肤的 `translate` 过渡带回新位置，随即停止。给「一次提交之后由宿主重排」的集合用（树与表格的拖放落下）：`key` 按身份认回被宿主重建的节点，排布位沿 `offsetParent` 链累加到容器，嵌套层级之间的换位也量得出位移。`trackListMotion` 的换位补偿与它共用同一段实现，行为不变。

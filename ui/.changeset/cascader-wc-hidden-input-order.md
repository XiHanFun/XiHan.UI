---
"@xihan-ui/web-components": patch
---

**Cascader 的表单出口住在 root 里、排在 positioner 之前，文档序与 Vue / React 一致。**

Vue / React 把逐路径的 hidden-input 渲在根末尾、浮层经 Portal 搬到落点，文档序里出口始终在浮层前面；Light DOM 版此前把出口追加在宿主末尾，浮层收起回到作者原位时就排到了它后面，带 defaultValue 的三端逐帧对拍在挂载帧即分叉。现在出口连成一段插在 positioner 的作者位置（搬迁期间是租约留下的占位节点）之前，浮层展开期间新增的出口收起后仍在它前面。

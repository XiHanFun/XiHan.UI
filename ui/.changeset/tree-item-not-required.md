---
'@xihan-ui/headless': patch
---

Tree 的 `requiredParts` 不再包含 `item`：空树与由脚本随后铺出条目的写法（虚拟化窗口、异步取数）在挂载那一刻没有条目，自定义元素不再为此报 `wc.missing-part`。

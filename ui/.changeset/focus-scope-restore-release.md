---
"@xihan-ui/core": patch
---

**焦点域归还落不下去时显式松手，焦点不再留在已经关掉的层里。**

`createFocusScope` 拆除时把焦点还给创建前的持有者；挂载即展开（`defaultOpen`）或程序化打开的层，创建前没人持有焦点，那个「持有者」是 body——body 不在各引擎一致的可聚焦集合里，`focus()` 是空操作，焦点于是停在已经 hidden / inert 的条目上：Chromium 要等渲染更新末尾的 focus fixup 才收走，jsdom 永远不收。现在归还之后核对一次是否真落定，没落定就走原持有者已离场那条路，显式 blur 松手。tour 的跳过 / 关闭、以及所有没有触发器的浮层收起都受益。

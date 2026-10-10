---
'@xihan-ui/core': patch
---

`trackListMotion`：`channel: 'transform'` 时，同一批里新到的条目跟着离它最近、换了位的那个条目一起换位。此前新条目一插进来就停在终点，它前面那个还在从旧位置往终点滑，两者会叠在一起（贴底的一列每来一条、贴顶的一列满员挤掉最旧那条时都这样）。translate 通道不变。

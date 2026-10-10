---
'@xihan-ui/core': patch
---

`trackListMotion`：

- `wrapped: true` 时另盯 `data-scope` / `data-part`：Web Components 外壳里的部件升级后才写上身份，插入那一轮选择器认不出它，身份写上、这时才匹配上的条目同样算新到。不包外壳的集合不盯，首屏内容不会被当成新到。
- `channel: 'transform'` 时新到的条目跟着离它最近、正在换位途中的那一个一起走（此前只认同一批里换了位的），身份晚一轮才认出的条目也跟得上。

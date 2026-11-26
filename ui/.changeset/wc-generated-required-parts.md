---
'@xihan-ui/web-components': patch
---

**修复** 元素按标准结构铺部件时（不写部件，或只写 `root`）不再报 `wc.missing-part`：部件随数据增减，先连接、脚本再赋 `collection` 的那一轮，或数据本来就空（比如零页的分页），少几个必需部件不是作者漏写。作者手写结构漏了必需部件照旧报。

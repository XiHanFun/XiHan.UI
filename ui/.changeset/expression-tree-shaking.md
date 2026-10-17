---
'@xihan-ui/expression': patch
---

`@xihan-ui/expression` 改为可摇树：只引用部分导出时，打包工具能去掉没用到的十进制运算、日期、取值转换与内置函数表。例如只引 `checkFormatSpec` 时约 0.8 kB（gzip），原先约 8.3 kB；`@xihan-ui/designer-kit/properties` 跟着从约 10.7 kB 降到约 3.3 kB。行为与公开 API 不变。

---
"@xihan-ui/headless": patch
---

树形表里有子行的行不再写 `aria-controls`：它展开的是子行，没有详情行，原来指向一个不存在的 `expanded-row`，读屏与无障碍检查会报属性值无效。没有子行、标了 `expandable` 的行照旧指向自己的详情行。

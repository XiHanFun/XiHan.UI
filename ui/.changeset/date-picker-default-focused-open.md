---
'@xihan-ui/headless': patch
---

**修复** `date-picker`：展开时没有选中值先落 `defaultFocusedValue` 那一页，再没有才落到今天；此前 `defaultOpen` 与重新展开都会把作者给的起始页覆盖成今天。

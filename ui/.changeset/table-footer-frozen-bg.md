---
'@xihan-ui/styles': patch
---

表格（Table）表尾里的冻结格（`sticky: 'start'` / `'end'`）补上不透明的表尾底色，与表体、表头的冻结格一致：横向滚动时，被它压住的格子不再从底下透出来。吸底与不吸底的表尾都一样，底色仍可经 `--xh-table-footer-bg` 覆盖。

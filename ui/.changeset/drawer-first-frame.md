---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
---

Drawer 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，面板与遮罩投影 `data-instant`、不再在页面载入时整幅推入；第一次收起照常播退场，之后每一次打开照常推入。

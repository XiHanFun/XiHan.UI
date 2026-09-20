---
'@xihan-ui/styles': patch
---

ColorPicker 取色中的滴管钮不再把聚焦环灌成 `currentColor`：这一档的面是 `--xh-bg-subtle-active`，浅色档 3.43:1、深色档改取 neutral-650 后 3.39:1，默认环够对比，非实心面一律吃库环。

---
'@xihan-ui/headless': minor
'@xihan-ui/styles': patch
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Tooltip 新增跳过等待的接替窗口 `skipDelayDuration`（默认 300ms，Web Components 属性 `skip-delay-duration`）：同页的提示共用这个窗口，另一个提示还开着、或刚收起一个不到这么久时，指向下一个不再等 `openDelay`、也不播进场，直接接替，上一个随之收起（此前每一个都要等 700ms、都要滑入，横扫工具栏时提示一个个等、一个个滑入）。0、负数或非有限数表示不参与接替。

- 接替打开的提示在 content 上投影 `data-instant`，皮肤的进场写在 `:not([data-instant])` 下；退场照常。
- 机器新增 context `instant`，窗口时长的缺省值 300ms 登记为停留时长。

---
'@xihan-ui/headless': major
'@xihan-ui/web-components': patch
---

**调整** Tooltip 的缺省停留缩短：`openDelay` 由 700ms 改为 150ms，`closeDelay` 由 300ms 改为 100ms，接替窗口 `skipDelayDuration` 仍是 300ms。一行提示悬停一下就出来、移开很快收起，与 naive、vean 同一量级；SideNav 收起态的提示同样受影响。HoverCard 是内容预览，仍是 700 / 300ms。要回到原来的节奏，在根或 Provider 上写 `openDelay={700}`、`closeDelay={300}`。

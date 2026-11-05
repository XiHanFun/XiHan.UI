---
'@xihan-ui/headless': major
'@xihan-ui/styles': major
---

**调整** 手风琴与折叠区域改成更轻的一副样子。手风琴缺省形态由 `outline` 改为 `ghost`：不画外框，条目之间一条 `--xh-border-subtle` 细线（`outline` / `subtle` 的条目分隔线同样换成这一档），要回到描边面写 `variant="outline"`。两者都不再给正文铺淡底、不再在标题与正文之间画线，也不再让展开的标题加粗（开合时标题宽度不再跳）；要回到旧样子，写 `--xh-accordion-content-bg: var(--xh-bg-muted)`、`--xh-accordion-content-border: var(--xh-border-default)`、`--xh-accordion-trigger-font-weight-open: var(--xh-font-weight-medium)`。正文改取 `--xh-fg-muted`。标题栏 md 由 41px 增到 45px（sm / lg 同步放宽），正文上内缩收到 4px、下内缩放到 16px。手风琴标准结构（只给 `collection`）的指示器改排在标题之前；指示器不再是收起朝下、展开朝上，而是收起朝行尾、展开朝下，手写结构把指示器写在最前面时，紧跟其后的标题自动吃掉余量（不必再写 `margin-inline-end: auto`）。标题折行时箭头对着第一行。

---
'@xihan-ui/headless': major
'@xihan-ui/styles': major
---

Accordion 缺省形态由 ghost 改为 outline（一块描边面）；不想要外框时显式写 `variant="ghost"`。标题栏收紧为上下 10px 加一行正文行高（md 41px）、横向 12px，展开项字重 500，指示器 16px、弱一档前景；正文改为淡底、正文色、14px，上下各 8px，展开时与标题栏之间一条分隔线；条与条之间的分隔线改为 border-default 通栏。新增覆盖槽 `--xh-accordion-content-bg`、`--xh-accordion-content-pt`、`--xh-accordion-trigger-font-weight-open`。

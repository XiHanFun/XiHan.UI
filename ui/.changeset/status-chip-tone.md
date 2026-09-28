---
'@xihan-ui/headless': minor
'@xihan-ui/styles': patch
---

ToolCall 状态、Approval 结果、QuestionFlow 结果三种状态 chip 统一：

- 连接层在这三个部件上投影 `data-tone`（ToolCall：等审批 warning、有结果 success、出错 danger；Approval：批准 success，拒绝与超时 danger；QuestionFlow：交卷 success），皮肤改读共享语气槽 `--xh-_tone-subtle` / `--xh-_tone-fg`，不再各自拼一份颜色公式；各阶段的覆盖槽保留。
- 几何与 Tag 的 sm 档同一把尺：内衬 2 / 6px、1px 透明边、字号 12、字重 medium、行框 16px，三者等高。

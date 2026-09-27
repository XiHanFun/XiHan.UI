---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

AI 披露面与同族对齐：

- Reasoning 缺省形态由 `subtle` 改为 `outline`（描边 + surface 底，与 ToolCall、Approval、QuestionFlow 一致），缺省尺寸由 `sm` 改为 `md`；要回到淡底卡片写 `variant="subtle"`，要紧凑写 `size="sm"`。
- Reasoning 与 ToolCall 的内距改用与 Accordion / Collapsible 同一把尺：sm 12 / 12、md 16 / 16、lg 20 / 20（此前 8 / 4、12 / 8、16 / 12），四个披露面的触发条在同一档位下等高。

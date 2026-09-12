---
'@xihan-ui/headless': patch
---

Command 按 WAI-ARIA combobox 的 selection-follows-focus 模式同步活动候选：
`aria-activedescendant` 当前指向的 option 输出 `aria-selected="true"`，其余 option 显式输出 `false`。

键盘、指针与过滤导致活动候选变化时两处 ARIA 同步更新；禁用候选不会接管状态，过滤为空或关闭后不留下选中。
该属性只表示当前活动建议，不新增持久值、`data-state`、对号或选中背景，命令执行事件和关闭行为保持不变。

规范依据：https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

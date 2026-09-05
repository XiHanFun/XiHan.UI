---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** `command` 组件（命令面板）：Vue 与 Web Components 两侧同时可用，组件数 125 → 126。

一块盖在页面上的检索面板：打字筛出命令，方向键选，回车执行。功能散在很多层菜单里、
用户知道要做什么却找不到入口时用它。

它由既有地基组合而成，没有新造轮子：浮层的开合、焦点陷阱、滚动锁与背景失活照 `dialog` 那一套；
检索框的 `role=combobox` 与 `aria-activedescendant` 照 `combobox`；结果列表是 `role=listbox`；
唤起的快捷键与行尾的键帽用 `hotkeys`，命中片段的标注用 `highlight`——后两件由使用者组合，
库不把它们焊进来。

与 `combobox` 的分工：那一族把过滤留给调用方，这一族自己做。命令清单经 `collection` 交进来，
按检索串逐词筛（`keywords` 让一条命令同时认英文名、拼音与旧称）、按 `group` 归组、空组自动丢掉。
条目节点只报 `value`，此刻露不露面由连接层打的 `hidden` 说了算——铺开与手写部件因此产出同一棵 DOM。
远端检索把 `filter` 置否即可关掉内置过滤。

承诺的行为：面板是模态浮层，Escape 与点遮罩收起、收起后焦点还给触发按钮；焦点全程在检索框，
锚点经 `aria-activedescendant` 报给读屏，方向键跳过禁用项；打字后锚点自动钉回首条命中项；
空态与在途两个占位不同屏。`closeOnSelect` 决定选完收不收。

实现细节，不进承诺：过滤与方向键落点走的是数据而不是活 DOM（因此开场首帧锚点就准）；
面板贴着视口上沿摆，位置由皮肤的 inset 排布，不问定位引擎要坐标。

动效沿用既有关键帧，不新增名字：遮罩 `xh-fade-in` / `xh-fade-out`，面板 `xh-overlay-pop-in`
（`--xh-_overlay-enter-down` 让它从上方落下一小段）与 `xh-pop-out`，结果逐条 `xh-rise-in`，
交错间隔走 `--xh-motion-stagger-step`，第六条起统一钉在第五级。

体积：新增一份皮肤 `command.css`（去注释压空白后 11.1 kB），`.size-limit.json` 里 styles 那条的
限额未动。

新增的公开面：`@xihan-ui/headless` 14 个值导出与 13 个类型导出（`connectCommand` / `commandMachine` /
`commandAnatomy` / `commandMeta` / `commandKeyboard`、过滤那一层的 `normalizeCommandQuery` /
`matchesCommandTerms` / `flattenCommandGroups` / `resolveCommandGroups` / `resolveCommandNode` /
`navigateCommandResults` / `COMMAND_UNGROUPED`，以及 `CommandSchema` / `CommandApi` /
`CommandNode` / `CommandGroup` 等类型）；`@xihan-ui/vue` 12 个组件加 `useCommand` 与
`CommandRootSlotProps` / `CommandContext`；`@xihan-ui/web-components` 的 `<xh-command>` 与
`XhCommandElement`（17 个 attribute，另有 `collection` / `groups` / `translations` 三个 property
与 9 个取数口）；`@xihan-ui/styles` 多一条子路径导出 `@xihan-ui/styles/command.css`，随之出
55 个使用者槽（`--xh-command-*`）。

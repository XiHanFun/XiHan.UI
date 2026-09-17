---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

**ButtonGroup 的 variant / tone / size 下发到组内每一段，缺省形态显式落 subtle。** `connectButtonGroup`
的 api 新增只读的 `variant`（缺省 `subtle`，组缺省中性淡底）、`tone`、`size`，根的 `data-variant` 不传时
投影 `subtle`。三端适配器按整组禁用同一条路把三轴落到每一段：Vue 的 `provideButtonGroupDisabled` /
`useButtonGroupDisabled` 改为 `provideButtonGroupContext` / `useButtonGroupContext`（内部 API），React 的
`ButtonGroupDisabledProvider` 改为 `ButtonGroupProvider`，Web Components 对未自写 `variant` / `tone` /
`size` 属性的 `<xh-button>` 子节点写入组值并记住作者自写的那一档；段自己写了的优先，组值压过全局配置的
`size`。段因此自带 `data-xh-action-variant`，颜色由家族形态矩阵给出。皮肤删除向段灌色的
`--xh-button-bg / -bg-hover / -bg-active / -fg` 与依赖「段不带 data-variant」的选择器；outline 组内每一段
的描边一律压平（外框由组根画）；solid 段成组时静息不落贴地软影、悬停不抬起，只留顶光；组内段的
`scale: none` 兼认 `data-pressed`。视觉默认变化：组内 outline / ghost 段的按下面从 300 改家族阶梯的 200。

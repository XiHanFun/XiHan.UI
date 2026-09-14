---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**密码框的明暗态改名：`visible` / `defaultVisible` / `onVisibilityChange` → `revealed` / `defaultRevealed` / `onRevealedChange`。**

`visible` 在库里是浮层与派生显隐那一轴的词（toast、滚动条、回到顶部），密码框这一位说的却是「明文有没有揭开」——不是开合、也不是显隐，与它们混用会让作者把它当成浮层的 open 去接。现在按这一位真正的含义取名：headless 的 props / context / api（`api.revealed` / `setRevealed` / `toggleRevealed`）与机器事件（`REVEALED.SET` / `REVEALED.TOGGLE`）、Vue 的 `v-model:revealed` 与 `@revealed-change`、React 的 `revealed` / `onRevealedChange`、自定义元素的 `revealed` / `default-revealed` attribute 与 `revealed-change` 事件；载荷类型 `PasswordInputRevealedChangeDetails { revealed }`。部件名 `visibility-trigger`、文案 `visibilityTriggerShow` / `visibilityTriggerHide` 与触发钮上的 `data-state="visible|hidden"`（词表里的派生显隐）不变。

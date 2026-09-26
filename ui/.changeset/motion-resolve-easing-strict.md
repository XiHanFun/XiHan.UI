---
'@xihan-ui/motion': major
---

`resolveEasing` 认不出写法时抛 `TypeError`，不再退回线性（此前只在开发构建下警告）。消息里带原文与全部可用写法。

字符串先查命名缓动，查不到再按 CSS 缓动函数的语法与取值解释，新认下 `ease` / `ease-in` / `ease-out` / `ease-in-out`、`step-start` / `step-end`、`steps()` 与 `linear()`；`readMotion(el).easing()` 读到样式里改写成的任何合法 CSS 缓动都能换成函数。

迁移：

- 此前写成 `'ease-out'` 一类 CSS 关键字、实际按匀速播放的，现在按 CSS 的曲线播放；要保持匀速写 `'linear'`，要库里的曲线写命名缓动 `'easeOut'`。
- 写法不合 CSS 的一律报错，包括 x 分量越出 [0,1] 的 `cubic-bezier()`、带单位的分量、原型上的属性名（如 `'toString'`）与非字符串值。来自配置或后端的缓动串，请在入口处调用 `resolveEasing` 校验。
- `tweenValueAt` 经 `resolveEasing` 取曲线，规则相同。

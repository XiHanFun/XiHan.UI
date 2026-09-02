---
"@xihan-ui/styles": minor
"@xihan-ui/vue": major
"@xihan-ui/web-components": minor
---

**轻提示的严重度补上字形通道，字形改由皮肤画。**

`toast` 的 root 一直在发 `data-severity`，而皮肤一条规则都不读它：严重度只剩淡底与描边这一条色相通道，色觉障碍用户与黑白打印下「已保存」与「保存失败」长得一模一样。同一台机器出来的 `notification` 有整套字形指示符。

皮肤现在按 `data-severity` 在条子行首各画一枚字形，取的是 `notification` 那套 `--xh-glyph-mark-*` 令牌，两家从此同一副读法：`info` 圆圈问号、`success` 勾、`warning` 三角、`error` 叉、`loading` 转圈箭头。轻提示的解剖到 root 为止、没有第二个节点可挂，字形因此画在 root 的伪元素上，与 `checkbox-group` 全选格同一种写法。颜色走语气层派生的前景档，新增使用者覆盖槽 `--xh-toast-icon-fg`；尺寸沿用已有的 `--xh-toast-icon-size`。

减弱动效与打印下 `loading` 那一档停转。

**破坏性（`@xihan-ui/vue`）：`createToastService` 的默认模板不再渲染那枚字形节点。** 此前字形只在这一条路径上存在——声明式的 `<XhToastRoot>` 与 `<xh-toast>` 元素上一枚都没有。现在三条路径都由皮肤统一画，模板里那个 `<span>` 随之删除。

影响面：按 `[data-scope="toast"][data-part="root"] > span:first-child` 这类结构选择器给字形写过样式的，选不中了——改成写 `--xh-toast-icon-fg` / `--xh-toast-icon-size`，或按 `[data-scope="toast"][data-part="root"]::before` 覆盖。另外，条子里子节点的序号整体前移一位。

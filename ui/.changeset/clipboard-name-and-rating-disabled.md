---
"@xihan-ui/headless": patch
"@xihan-ui/styles": patch
---

**修复**复制钮的可访问名。

`clipboard` 的 `indicator` **不再发 `aria-hidden`**。这个组件的解剖里没有单独的 label 部件，钮上写的字就装在指示器里（库里的示例写的是「复制」/「已复制」），把它藏起来等于把按钮唯一的可及名一起藏掉——浏览器实测判 `button-name` 严重违规，读屏与语音控制都点不动这颗钮。文字回执仍旧由 `status` 那个活区单独播报，两处说的不是同一件事：活区说「复制成功」，钮上的字是它自己的名字。

**修复** `rating` 禁用态的双重压暗。`value-text` 上那条 `[data-disabled]` 改色规则删掉了：`root` 的禁用规则已经压了一层不透明度，后代再写一次 `fg-disabled` 是叠加，实际渲染比禁用态该有的更淡。禁用时的颜色由 `root` 那一层统一给。

---
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

`floating-panel` 接上退场闸门，并补上进退场动画。

此前它是浮层族里唯一没接 presence 的一个：收起那一帧定位层直接 `display: none`，退场动画连播都播不出来。现在两个适配器都把定位层的收起从「跟着展开态」改成「跟着 presence」——退场动画播完才真收。

皮肤补一对关键帧（`xh-pop-in` / `xh-pop-out`，与锚定浮层族同一份内容），挂在 `positioner` 上：面板整棵子树都在它底下，收起与动画落在同一个节点才不会互相掐掉。随之撤掉 `[data-part='positioner'][hidden] { display: none }`——留着它退场一帧都播不出来，真正的收起改由适配器写内联 `display`。

Vue 侧 `FloatingPanelContext` 多出 `positionerRef` 与 `visible` 两个字段。

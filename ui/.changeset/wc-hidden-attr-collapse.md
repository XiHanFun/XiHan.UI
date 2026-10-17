---
'@xihan-ui/web-components': patch
---

`xh-field` 与 `xh-fieldset` 的错误文案收起时只靠 `hidden` 属性，不再另写内联 `display: none`，与 Vue / React 一致：皮肤按 `[hidden]` 给收起的错误文案留住辅助行那一行，字段无效与否高度不变，放在表单根里的字段之间重新有了项距，报错时也不再撑高跳动。`xh-log` 的回到底部按钮收起时机改为与 connect 的 `hidden` 一致：回到底部后先播完退场动画再收起。

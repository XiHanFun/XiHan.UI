---
"@xihan-ui/styles": patch
---

修复 `index.css` 的级联层序：`layers.css` 的层序声明挪到入口最顶。此前 tokens 与部分组件皮肤抢先立层，实际层序成了 `tokens < components < reset < motion < overrides`，`reset` 的 `font: inherit` 会压掉表单控件皮肤的 `font-size`。date-picker 的 showTime 皮肤同步从 motion 层归位 components 层。仅分层入口受影响，`index.unlayered.css` 行为不变。

---
"@xihan-ui/headless": patch
"@xihan-ui/vue": patch
"@xihan-ui/web-components": patch
"@xihan-ui/styles": patch
---

number-field 新增可选 `control` 部件:加减按钮叠进输入框内,与输入框成为视觉一体。

此前加减钮与输入框是兄弟节点,受 HTML 约束进不了框内,只能三件并排。现在把输入框与两个按钮
放进 `control` 部件,皮肤把描边、底色、聚焦环(改为 `:focus-within`)整体画在 control 上:
框内 input 退成透明,减钮在左、加钮在右、输入框居中(顺序由作者模板决定),前后缀图标/文字
直接流式插在 input 两侧,不用绝对定位;悬停/按下/贴边禁用沿用原有语义色。

- **Vue**:新增 `XhNumberFieldControl`;`data-disabled` / `data-readonly` / `data-invalid`
  三个状态属性由 connect 落到 control 上。
- **Web Components**:作者写 `<div data-xh-part="control">` 包裹即得同样的一体式。
- **不写 control 时完全退回旧观感**:control 是可选部件,旧模板一行不改照常渲染,三档
  variant / tone / size 与旧式并排布局一致。

一致性测试的 fixture 改成一体的 control 结构,两个适配器的 conformance 同步通过。

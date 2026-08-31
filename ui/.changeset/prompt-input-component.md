---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** `prompt-input` 组件：会话界面的输入框，Vue 与 Web Components 两侧同时可用。

**发送与停止原位共用一个节点**：生成期间同一颗按钮换成停止身份、恒可用，只翻 `aria-label` 与 `data-mode`。另起一颗停止按钮摆在旁边会让两颗按钮互相挤位置，而按下去的那一刻它正好换了位置。

`submitKey` 一个 prop 表达两档：`enter` 档 Enter 提交、Shift+Enter 换行、Mod+Enter 也提交；`mod-enter` 档 Enter 换行、只有 Mod+Enter 提交。输入法组合期间的 Enter 一律放行——那一下是在确认候选词；按住 Enter 不放只提交一次。

**同一个输入框上叠了别的处理器且它已经处理过这一下时，组件让位。** 事件处理器是链式组合的，前一个 `preventDefault` 挡不住后一个，这条判断写在组件的 `onKeyDown` 首行，作者不必再包一层。

`busy` 用一个布尔而不是四档运行态字符串：组件只需要二值判断，「这一轮走到哪一步」是宿主的事。`allowEmptySubmit` 是唯一为附件留的钩子，附件本身用 `file-upload` 装配。

输入框的可访问名**只在给了 `translations.input` 时才发**：无条件发会盖掉作者自己的 `<label for>` 与 `aria-label`。三个视觉轴（形态 / 语气 / 尺寸）全接，自动长高仍是皮肤的两行 CSS、不进状态机。

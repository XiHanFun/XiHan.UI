---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

**新增** `prompt-input` 的 `submitKey` 第三档 `'none'`：Enter 与 Mod+Enter 都只换行，键盘一个提交出口都不留，提交只剩发送按钮与程序化的 `submit()` 两条路。

原来的两档表达不出「按键完全不提交」这件事——`enter` 与 `mod-enter` 都至少留着 Mod+Enter 一条键盘通路。要把提交收束到一颗按钮上（长文起草、多段粘贴、提交前要先过一道确认的场景），此前只能在输入框上再叠一个 `onKeyDown` 把 Enter 拦下来，而那样拦掉的是整条链上后面所有处理器的机会。

`'none'` 档不拦截默认行为：Enter 原样放行给浏览器插换行，与 `mod-enter` 档的裸 Enter 是同一条路径。Shift+Enter 换行、输入法组合期间放行、别人已处理过就让位，三条既有行为在这一档下一字未变。

纯新增：`'enter'` 与 `'mod-enter'` 两档的行为、默认值 `'enter'`，以及两个适配器的 prop / attribute 形状都不动。

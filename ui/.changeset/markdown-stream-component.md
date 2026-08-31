---
"@xihan-ui/tokens": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** `markdown-stream` 组件：把已经渲好的 Markdown 块列表投影成带稳定 key 的正文结构，Vue 与 Web Components 两侧同时可用。

它把 `@xihan-ui/markdown` 这个一直没有消费方的流式渲染内核接到了组件层上。**组件不解析 Markdown，也不持有渲染器**：块列表由宿主调 `createStreamRenderer().render(全文)` 得到后传进来——渲染器是有状态的，做成组件的 prop 会诱导使用者共享一个实例、每帧把整张缓存作废。

块的 `key` 是稳定的：生长中的那一块 key 恒定，定型的块 key 不再变化。两个适配器都按 key 逐条比对复用节点，只有真正在长的那一块每帧重渲——整表重铺会把已定型的块连同用户正在拖的选区一起弄没，而稳定 key 正是为了避免这件事。

**`html` 只对 markdown 块有效**，这条契约写在类型上：代码块与公式块拿 `source`（未转义的正文原文）交给 `code-view` 或宿主自选的公式引擎，照 `html` 渲会让同一段代码出现两次。没人接管时把原文当正文显示，这个降级是明写的，不是意外。

流式光标是皮肤的 `::after`，挂在带 `data-live` 的那一块上，减弱动效时停在实心不闪。正文不套 role、也不做成活区——每来一个 token 播报一次会把读屏刷爆；要在一段回复写完时念一句，把 `announce` 设成 `polite` 并渲出播报区。

**新增** 语义令牌 `--xh-caret-duration`：文本光标闪一次的周期。

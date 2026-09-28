---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Steps 新增只读展示形态 `readOnly`（Web Components `read-only`）：只呈现进度，步骤不可点、不可聚焦、不发事件，也不置灰；语义从 tablist 换成有序列表（`list` / `listitem`，当前步 `aria-current="step"`），面板去掉 tabpanel 语义。`trigger` 不再投影 Action Control，只负责「序号 + 标题 + 说明」的排版：Vue / React 渲染为 `<div>`，Web Components 由作者写成 `<div>`；内距与可操作形态同一把尺，版面不跳。connect 新增 `readOnly`。

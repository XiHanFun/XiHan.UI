---
'@xihan-ui/core': patch
---

`focusSafely` 与 `focusFirst` 改按节点所属 Document/ShadowRoot 判断活动元素，并以严格 HTMLElement 身份识别可选中文本控件。Shadow DOM 候选不再被误判为聚焦失败，iframe 与跨文档 adopted 输入框也能执行请求的文本选择。

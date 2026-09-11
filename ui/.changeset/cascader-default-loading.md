---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
---

**级联选择补齐首次加载的默认状态面。** 此前 `Content` 只自动装配 Empty；`collection=[]` 且
`loading=true` 时，连接层会把 Empty 隐藏，却没有 Loading 接住，浮层只剩一圈没有内容的边框。
Vue、React 与 Web Components 现在都会在作者未写 Loading 时自动补一枚，并读取新增的
`CascaderTranslations.loading`（缺省 `Loading`）；作者显式写了 Loading 时只保留作者这一枚，
不会并排生成第二份。

Loading 只在当前视图没有候选时占据状态区。已有候选或已展开的祖先列仍保持可见、可操作，
浮层只用 `aria-busy` 报告后台刷新；空态与在途态都以 `role="status"` 独立于各列的 listbox 语义。

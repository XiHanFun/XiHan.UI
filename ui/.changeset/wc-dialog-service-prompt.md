---
'@xihan-ui/web-components': minor
---

**新增** Web Components 的命令式对话框服务补上 `prompt`，与 Vue、React 一致：`body(form, value)` 往表单容器里拼表单并把输入写回 `value`，确认后 resolve 一份值的快照，取消、Esc 与卸载 resolve `null`；`onOk(value)` 返回 `false` 不放行，抛错或拒绝进入失败态。正文每次请求只拼一次，确认钮转圈与一次不放行都不会清掉输到一半的内容。新增类型 `PromptOptions`。

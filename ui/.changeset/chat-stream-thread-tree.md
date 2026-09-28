---
'@xihan-ui/chat-stream': minor
---

会话容器改为一棵消息树，补齐重新生成、失败重试、编辑重发、分支切换、附件提交与续写：

- `UIMessage` 新增 `parentId`（会话第一条为 `null`，同一 `parentId` 下互为分支；缺席时按数组顺序相连）与 `status`（助手消息的结束方式：`streaming` / `complete` / `aborted` / `error`）。
- `ThreadStore` 新增 `regenerate(messageId?)`、`retry()`、`edit(messageId, content)`、`continue(messageId?)`、`selectBranch(messageId, index)` 与 `getTree()`；`submit` 除纯文本外接受 parts（`text` / `file` / `data`），附件与 UIMessage 的 parts 同形。
- 快照新增 `branches`：当前路径上每条消息在兄弟中的 `{ index, count }`；`messages` 是从根往下每个分叉取选中那一支的路径。
- `createThreadStore` 新增 `messages` 选项，用线性历史或 `getTree()` 导出的整棵树恢复会话。
- `ChatRequest` 新增 `trigger` 与 `messageId`，HTTP 传输把两者并进请求体；续写时 `messages` 的最后一条就是要接着写的那条助手消息，截断在半句上的正文接着长。
- `stop()` 当场把在途的回复收尾并记为 `aborted`，不再等传输那头关流。
- `createReduceState` 新增第三个参数 `from`：在已有消息上接着归约。

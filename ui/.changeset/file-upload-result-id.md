---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

文件上传（FileUpload）的 `upload` 可以返回 `id`：传完的文件随即转成服务器已有附件，从 `files` 移出、以 `{ id, name, size, type, url }` 追加进 `remoteFiles`（name、size、type 取自原文件）。表单拿到的值直接是附件记录，不用在 `upload-complete` 里自己搬。

- 事件顺序：`upload-complete`（detail 多一个 `id`）、`remote-files-change`、`files-change`。
- `remoteFiles` 受控时只发 `remote-files-change`；宿主写回含这个 id 的列表之后才从 `files` 移出，在此之前文件留在 `files` 里、状态为已完成。
- 不返回 `id` 时行为不变。

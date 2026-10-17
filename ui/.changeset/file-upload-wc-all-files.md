---
'@xihan-ui/web-components': minor
---

`xh-file-upload` 的条目（item）改按 `allFiles` 对应：远程附件在前、本地文件在后，与 Vue / React 的 `XhFileUploadItem` 同一口径。此前只对应 `acceptedFiles`，远程附件没有可接线的行，上传返回 id 转入 `remoteFiles` 的文件整行被收起。

- 新增只读属性 `allFiles`，作者据此渲染条目节点；`deleteFile` 改收 `FileUploadFile`，本地文件与远程附件都能删。
- 迁移：原先按 `acceptedFiles` 铺条目、远程附件另行自绘的写法，改成按 `allFiles` 每个文件铺一行角色节点。只有本地文件、没有 `remoteFiles` 时两者相同，写法不用改。

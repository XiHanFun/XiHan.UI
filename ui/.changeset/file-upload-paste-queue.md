---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

FileUpload 新增粘贴上传、作者准入判定 `validate`、并发上限 `maxConcurrentUploads` 与「取消但保留文件」的 `cancelUpload`。

- `allowPaste`（默认 `true`，Web Components 属性 `allow-paste`，写 `"false"` 关掉）：焦点在组件里（投放区、选择钮、删除钮）时 Ctrl / Cmd+V 收下剪贴板里的文件，与选择、投放走同一道校验并拦下默认行为；剪贴板里没有文件时不拦截，文字照常粘贴。键盘表新增 `file-upload.kbd.paste`。
- `validate(file, { files, acceptedFiles })`：在类型与大小校验通过之后、数量上限之前逐个调用，返回拒绝码（一个或一组）即拒收，拒收的文件连同返回的码一起进 `onFileReject`、不占数量名额。只接受同步判定。`FileUploadRejection.reasons` 的类型放宽为 `FileUploadRejectCode[]`（内建四种原因之外并入作者的自定义码）。
- `maxConcurrentUploads`（属性 `max-concurrent-uploads`，默认不限）：到了上限的文件状态报 `queued` 排队，前面的传完、失败、被取消或被删除后按列表顺序补上。
- `cancelUpload(file)`（插槽作用域 / 函数式 children 的 `cancelUpload`，元素方法 `cancelUpload()`）：中止在传或排队中的文件，文件留在列表里，状态落 `canceled`，发出 `onUploadCancel` / `upload-cancel`（不发 `upload-error`），之后不会被列表变化自动拉起，`startUpload` 让它重新开传。
- `FileUploadStatus` 新增 `queued` 与 `canceled` 两个取值，条目与进度条的 `data-state` 随之投影。
- Web Components 元素补上 `uploadOf()` 与 `startUpload()` 两个方法，与 Vue 插槽作用域、React 函数式 children 交出的一致。
- headless 导出 `normalizeMaxConcurrentUploads` 与类型 `FileUploadCancelDetails`、`FileUploadRejectCode`、`FileUploadValidateContext`；Vue 包转发 `FileUploadValidateContext`。

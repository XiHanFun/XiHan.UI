---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

文件上传改用标准结构：新增 `fileUploadStructure` 与 `FileUploadStructureOptions`，次序是标题（原生 `<label>`）、投放区、表单影子、文件列表，`clearable` 时末尾带清空钮。投放区是唯一可聚焦的打开入口，说明文字取新增的 `translations.dropzone`（十种语言包同步补上），选择钮不进标准结构，手写结构时照旧可用。列表里 `allFiles` 每个文件一行（缩略图、文件名、大小、进度与删除钮），`FileUploadApi` 新增 `fileKey(file)`（本地文件取内部 id，远程附件取 `remote:<id>`）与 `translations`，结构按 `fileKey` 认行、删掉中间一行时替身留在原处淡出。三端新增 `label` 与 `clearable`，Vue 加 `label`、`dropzone` 插槽，React 加 `dropzone`，Web Components 可用 `slot="label"`、`slot="dropzone"` 接管。

行为变化（手写结构同样生效）：点标题不再经原生激活点中隐藏输入、当场弹出选择框，改为只把焦点交给投放区（没写投放区时交给选择钮），禁用时不给焦点；`label` 的 `for` 仍指向隐藏输入，原生关联与必填提示照旧。

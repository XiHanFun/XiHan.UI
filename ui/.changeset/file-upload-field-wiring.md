---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

上传（FileUpload）放进字段（Field）时接上字段：字段的标签并进投放区（dropzone）的名字链，说明与错误文案进它的描述链；投放区报 `aria-invalid`。隐藏的文件输入也有了名字（与投放区同源，放进字段时连上字段的标签），不再被判为未标注的表单控件。Web Components 的 `xh-file-upload` 声明了字段接线目标。

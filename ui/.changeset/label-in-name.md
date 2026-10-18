---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

几处可访问名改为包含它们看得见的字（WCAG 2.5.3 Label in Name，axe 4.14 起 `label-content-name-mismatch` 默认开启）。

- Tree、TreeSelect：分支行不再显式给 `aria-label`，名字取自己那一行的内容，与叶子行同一个来源。按内容算名字不往 `role="group"` 的子层里取字，子孙的文字不会算进来；显式名字反倒让行里看得见的后缀、说明落在名字之外。
- JsonViewer：分支行同样不显式给名字。新增视觉隐藏的 `branch-summary` 部件（三端由组件自己铺出），里面写分支的名字：键名，根行取 `translations.root`，收起时带上成员数，读屏念到的与此前一致；看得见的键名 `branch-text` 改为 `aria-hidden`。API 新增 `branchSummary(node)` 与 `getBranchSummaryProps()`。
- Citation：来源列表的每一行不再显式给名字，序号、标题与出处都看得见，名字取这一行的内容；预览里的打开钮改由 `aria-labelledby` 取「它自己那句 + 预览标题」，`preview-title` 因此带上 id。
- FileUpload：投放区的名字改为字段标题再接上投放区自己看得见的说明（`aria-labelledby` 指向 label 与它自己），不再另给 `aria-label` 兜底。

迁移：`translations` 里删掉了随之不用的两句——Citation 的 `openSource` 与 `source`，覆盖过它们的直接去掉。FileUpload 的投放区不再取 `translations.dropzone` 作兜底名字，手写结构时请在投放区里写一句看得见的说明（例如「把文件拖到这里」），它就是名字的后半句；`translations.dropzone` 改作标准结构里投放区的那句说明（见文件上传的标准结构）。

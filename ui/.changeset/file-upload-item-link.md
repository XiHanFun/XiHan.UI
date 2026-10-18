---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/styles': minor
---

文件上传新增附件链接部件 `item-link`：远程附件的 `url` 经 `toSafeLinkHref` 判定为安全时，标准结构把文件名铺成指向它的链接，地址不安全（如 `javascript:`）时不写 `href`、标准结构退回纯文字的文件名；本地文件不铺链接。`FileUploadApi` 新增 `fileHref(file)` 与 `getItemLinkProps`；三端新增 `linkTarget` 控制打开方式（缺省当前页，写 `_blank` 时链接同时带 `rel="noopener noreferrer"`），Vue / React 新增 `XhFileUploadItemLink`，Web Components 是 `link-target` 属性与 `item-link` 部件。只读时链接照常可聚焦、可打开，禁用时退出 Tab 序列、报 `aria-disabled`、点了不跳转。皮肤与正文里的行内链接同一种画法。

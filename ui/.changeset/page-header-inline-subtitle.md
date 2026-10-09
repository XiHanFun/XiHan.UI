---
'@xihan-ui/headless': minor
'@xihan-ui/styles': major
---

PageHeader 副标题改与标题同一行（窄于 640px 时仍回到下一行），二者之间一条 1 × 16px 竖线、两侧各 12px（新增覆盖槽 `--xh-page-header-divider`），副标题改 14px、弱一档前景；返回位接动作钮家族的 icon ghost 档（lg 页头取 md 档、其余 sm 档），字取次级前景（新增 `--xh-page-header-back-fg`、`--xh-page-header-back-fg-hover`），不必再给按钮写内联样式。面包屑到标题收到 4px，带面包屑的缺省档上下内衬收到 12px，页脚与标题行再隔 12px；ghost + split 的贴底线改为 border-default。

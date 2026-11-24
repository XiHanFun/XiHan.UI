---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

**改进** 集合与浮层的占位态（空、加载、错误）收进一份家族配方，十三个组件一副样子。

- 连接层在占位部件上新投影 `data-xh-placeholder="empty | loading | error"`；排版、次要字色、加载环那一格、露面淡入与收起由 `family/placeholder.css` 统一给，各皮肤只把原有的使用者槽桥到 `--xh-placeholder-*`。原有的 `--xh-<c>-empty-*`、`-loading-*`、`-error-*`、`-state-*` 槽照旧可写。
- 统一后的取值：单行行距（Tree、GridList 此前是正文行距 1.5，占位比别家高出一截）；内容居中；Cascader 的占位字色从 `--xh-fg-subtle` 换成 `--xh-fg-muted`（subtle 留给占位字与禁用标签）；Table 的占位字号随表格尺寸档取，不再从宿主继承。
- Select 取数失败的提示前补上一枚警示字形（危险色），错误不只靠颜色读出。
- Cascader 每列定高，占位仍撑到一列的高度，是登记的例外。

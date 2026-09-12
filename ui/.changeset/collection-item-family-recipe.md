---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

建立由单一 JSON 真源生成的 Collection Item Family Recipe，统一 sm/md/lg 尺寸节奏，prefix/text/description/shortcut/suffix/indicator 六列，以及 rest、hover、keyboard-highlight、selected、selected+highlight、open-path、checked、disabled、loading、error 状态。

Select item 首批迁入该配方：Headless 投影 `data-xh-collection-*` 角色，并复用统一状态词汇表达选择事实，三端适配器继续只展开 Headless 属性；持久选择保持末端对号，选中叠加高亮仍使用中性面与独立焦点环，正文不加粗、条目宽度不变化。独立 Select 皮肤与 full bundle 共用同一份生成 CSS。

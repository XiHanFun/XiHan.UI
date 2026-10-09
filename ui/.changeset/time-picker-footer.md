---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

TimePicker 新增底栏 `footer` 部件：浮层底部的通栏操作区，写在 `content` 里、排在各列之后，多选的「添加」（`confirm-trigger`）通常放在它里面。headless 新增 `getFooterProps`（只带 scope / part，不报角色、不占 Tab 位、不进任何集合的拥有关系）；Vue / React 新增 `XhTimePickerFooter`，Web Components 认 `data-xh-part="footer"`。

皮肤：有底栏时面板折行，底栏落在快捷选项列与各列下面独占一行，上沿一道 border-default 分隔线、四周 8px 内衬，字取 12px 次级前景；首个子节点占满余宽排在行首，「添加」落在行尾；底栏不参与撑宽，面板的宽仍由各列定。底栏里只有「添加」、而「添加」在单选下收起时，底栏一并收起。新增 `--xh-time-picker-footer-gap / -footer-py / -footer-px / -footer-border / -footer-fg / -footer-font-size`。「添加」直接排在 `content` 里的写法照旧可用。

---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

DatePicker 新增底栏 `footer` 部件：浮层底部的通栏操作区，写在 `content` 里、排在面板主体之后，确认钮通常放在它里面。headless 新增 `getFooterProps`（只带 scope / part，不报角色、不占 Tab 位、不进任何集合的拥有关系）；Vue / React 新增 `XhDatePickerFooter`，Web Components 认 `data-xh-part="footer"`。

皮肤：底栏独占一行，上沿一道 border-default 分隔线、四周 8px 内衬，字取 12px 次级前景；首个子节点占满余宽排在行首，确认钮落在行尾。底栏里只有确认钮、而确认钮因未开 `showTime` 收起时，底栏一并收起。新增 `--xh-date-picker-footer-gap / -footer-py / -footer-px / -footer-border / -footer-fg / -footer-font-size`。确认钮直接排在 `content` 里的写法照旧可用。

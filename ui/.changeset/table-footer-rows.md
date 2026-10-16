---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': minor
---

表格（Table）的表尾支持多行与吸底。

破坏性改动：

- 删除 `footer`（Web Components 属性 `footer`），改为 `footerRows`（WC 属性 `footer-rows`）：表尾行数，缺省 0。原来写 `footer` 的改写 `footerRows: 1` / `footer-rows="1"`。
- `getFooterRowProps()` 改为 `getFooterRowProps({ level })`：多行表尾下每一行写明第几行（1 起算，与多级表头同一写法）；Vue / React 的 `XhTableRow` 在表尾里写 `level`，Web Components 在表尾的 row 上写 `level` 属性。只有一行时可省。

新增：

- `stickyFooter`（WC 属性 `sticky-footer`）：表尾钉在滚动容器下沿，与 `stickyHeader` 对称；吸底时底色取不透明的淡底，滚过的行不会透出来。组件覆盖槽 `--xh-table-sticky-footer-layer` 调层级。
- `api.footerRowCount`；`aria-rowcount` 计入全部表尾行；新增类型 `TableFooterRowProps`。

迁移：全文搜索 `XhTableRoot` / `xh-table` 上的 `footer`，换成 `footerRows` / `footer-rows`；有几行表尾就写几，每个表尾行写 `level`。

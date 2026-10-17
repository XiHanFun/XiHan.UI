---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

库内控件直接放进字段（Field）时，点字段的标签会聚焦控件：字段按接线认出控件的焦点宿主（aria-labelledby 里带着字段标签的那个节点），能聚焦就聚焦它，不能就聚焦它里面第一个可 tab 的节点；弹出式触发钮只聚焦、不展开。此时标签不再写指向不存在节点的 `for`。作者自写的 control 部件照旧走原生 `for`。

- headless：`FieldRenderedParts` 新增 `control`，由适配器统计 control 部件在不在场；省略即按在场处理，服务端直出与挂载前的输出不变。

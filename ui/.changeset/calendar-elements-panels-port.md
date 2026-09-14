---
'@xihan-ui/web-components': patch
---

**`xh-calendar-picker` / `xh-calendar-range-picker` 补上 `panels` 只读属性，多面板时每张 grid 的表头组与日期组都接线。**

Vue 与 React 的根插槽早就交出 `panels`（每张面板的标题与格子），自定义元素上却只有 `weeks` / `periods` 这一张面板的口，`visible-count="2"` 的示例读 `el.panels` 直接报错。现在元素上同样取得到。另外元素此前只给第一张 grid 里的 `grid-head` / `grid-body` 接线，第二张面板的两组没有 `data-part`、`role=rowgroup` 也没打上，现在逐张接线。

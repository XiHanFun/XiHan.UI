---
'@xihan-ui/web-components': minor
---

Web Components 补上与 Vue / React `asChild` 等价的写法：嵌套的组件宿主自己带 `data-xh-part` 即担任外层的那个部件。最常见的是拿组件库的按钮当菜单或浮层的触发器——`<xh-menu><xh-button data-xh-part="trigger" variant="subtle"><button data-xh-part="root">操作</button></xh-button>…</xh-menu>`。外层的接线（ARIA、开合、键盘）按 asChild 的规则合进按钮自己的根节点：按钮保留自己的解剖与形态，定位锚点与焦点归还落在这个原生 button 上。此前嵌套的 `xh-*` 一律跳过，WC 的触发器只能写原生 button，套不上组件库按钮的外观。目前 `xh-button` 支持这样担任别的组件的部件。

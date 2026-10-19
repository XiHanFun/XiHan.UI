---
'@xihan-ui/web-components': patch
---

用 `XhConfigController` 取配置的元素在重新连上文档时按此刻的配置重渲一次：断开期间全局配置或所在 `<xh-config>` 变了、或被挪到另一个 `<xh-config>` 下，连回来不再停在旧的语言与文案上。设计器零件里缺省隐藏、移进移出外框的面板都受益。

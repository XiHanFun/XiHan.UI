---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Breadcrumb 的折叠位改为可操作：新增 `ellipsis-trigger` 部件（Vue / React `XhBreadcrumbEllipsisTrigger`），是一枚键盘可达、读屏可读的按钮（可及名 `translations.ellipsis`，缺省 Show full path），按下即就地展开完整路径，省略位收起，焦点落到第一条展开出来的链接上。`ellipsis` 不再 `aria-hidden`，展开后带 `hidden`；触发器不写内容时皮肤画一枚省略号字形。connect 新增 `expanded`、`expand()` 与 `collapsedRange(count)`，headless 新增纯函数 `breadcrumbCollapsedRange`。

Web Components 的 `max-items` 开始生效：作者把完整路径逐层写成部件、在首层之后放一个装着触发器的省略位，元素收起中间层并在展开后放出来；紧跟在被收起层或已展开省略位后面的分隔符由皮肤一并收起。

皮肤 breadcrumb.css 涨在折叠位触发器的家族映射、兜底字形与分隔符的收起规则上，体积基线随之重落。

---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': patch
---

工具栏（Toolbar）的条目可以声明只放图标：按方钮画，宽等于高，三种尺寸都一样，与「更多」钮同一个方盒。

- Vue / React：`XhToolbarItem` 新增 `iconOnly`；Web Components 在条目上写 `data-icon-only`，运行期增删同样生效。条目随之写 `data-icon-only`，名字仍要用 `aria-label` 给。
- 皮肤：只放图标的条目接 Action Control 的 icon 档，工具栏的公开内距槽 `--xh-toolbar-item-px` 不再把它撑宽。竖排时一列条目照旧一样宽：只放图标的条目随列宽拉伸、最窄是方盒，列宽随内容时整列只放图标就是一列方钮。图标加文字、只有文字的条目照旧。
- 文档：工具栏「用法」「收进更多菜单」两个示例的条目声明只放图标。

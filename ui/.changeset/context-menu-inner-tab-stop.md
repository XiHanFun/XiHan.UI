---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

ContextMenu 的触发区里已有作者内容自带的 Tab 位时（可聚焦的画布、列表），触发区不再另占一个：此前触发区恒写 `tabindex="0"`，包着画布的设计器从外面 Tab 进来要先在整块区域上停一下，读屏还把画布里的文字全念一遍。现在菜单键与 Shift+F10 从那个元素冒泡上来照常展开，关闭后焦点回到打开前的持有者；内容里没有 Tab 位时照旧由触发区自己占一个。判据只看 DOM：原生可聚焦或 `tabindex` ≥ 0 的元素算，禁用的、`hidden` 或 `inert` 子树里的与菜单自己的浮层不算；子树里增删节点或改了 `tabindex`、`disabled`、`hidden`、`inert` 等属性时重判。

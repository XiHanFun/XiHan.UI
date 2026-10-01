---
'@xihan-ui/headless': patch
---

Dialog 与 Drawer 没给 `initialFocus` 时，初始焦点落在内容里第一个可聚焦的控件上，越过关闭钮、拖动把手与改尺把手：关闭钮写在标题旁（常见布局）时，打开后焦点不再先落在关闭钮上。内容里除了这几样没有别的可聚焦节点时，仍落在关闭钮上；`alertdialog` 照旧落在内容容器本身。

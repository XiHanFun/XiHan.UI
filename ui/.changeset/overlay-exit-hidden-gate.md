---
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

**修复** 宿主带 `[hidden]{display:none!important}`（Tailwind 4 的 preflight、VitePress 默认主题都有这条）时，浮层的退场动画一帧都播不出来：`hidden` 跟着开合走，关闭那一刻节点就没有盒子了，定位、遮罩与 Layer 也跟着提前释放。内容区的 `hidden` 改跟退场闸门走、播完才落。涉及 Popover、Popconfirm、HoverCard、Tooltip、Select、Combobox、Cascader、TreeSelect、Mention、Menu、ContextMenu、Menubar、NavigationMenu、DatePicker、DateRangePicker、TimePicker、TimeRangePicker、ColorPicker、Command、FloatingPanel、ImageViewer、Pagination、Tour 与 SideNav 图标栏提示；Web Components 的 Dialog、Drawer 同步修复。

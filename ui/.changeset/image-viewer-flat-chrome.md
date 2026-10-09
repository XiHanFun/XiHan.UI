---
'@xihan-ui/headless': major
'@xihan-ui/styles': major
---

ImageViewer 控制层改为扁平取值：

- 遮罩改取全局遮罩令牌 `--xh-bg-overlay`
- 底部工具条改为页面主题的实体面（亮色白面、暗色深面）+ 1px 描边，内距 6 / 16px；连接层在工具条上投影 `data-xh-ink-surface`，条里的钮按工具条底色自成墨色域，视觉盒 36px、字形 16px，悬停 / 按下走白底阶梯。新增组件槽 `--xh-image-viewer-toolbar-bg`
- 关闭钮的 `data-xh-action-size` 由「比组件低一档」改为与组件同档；翻页钮与关闭钮的视觉盒改取控件高（md 32px）、字形 16px（lg 20px），翻页钮距边 20px、关闭钮距右上角 32px。新增组件槽 `--xh-image-viewer-nav-size`
- 翻页钮、关闭钮与计数仍压在深色半透明 chrome 上

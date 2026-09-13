---
'@xihan-ui/headless': major
'@xihan-ui/react': major
'@xihan-ui/vue': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': major
---

Card 收敛为 `default`、`secondary`、`tertiary`、`transparent` 四种语义表面，并将结构统一为 `root / header / title / description / content / footer`。

移除 `size`、`hoverable`、`split` 属性以及 `media`、`body` 部件；媒体改为普通子节点，卡片统一使用 16px 内边距、12px 段间距与高层圆角。

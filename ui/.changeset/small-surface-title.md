---
'@xihan-ui/styles': patch
---

**修复** 浮层内与小面标题（14px 中等字重）统一取紧凑行距与所在面的前景：Popover、HoverCard、Citation 预览的标题此前没写行高、随宿主走，EmptyState 的标题此前取正文行距 1.5（lg 档升到区块标题时随之取 `--xh-text-heading-3-leading`）；HoverCard 的标题字色从 `--xh-fg-default` 换成磨砂浮层的材质前景，与 Popover、Popconfirm 同一支，强制色与高对比度档下跟着材质换成系统色。Dialog、Drawer 的说明补上正文行距，不再随宿主走。

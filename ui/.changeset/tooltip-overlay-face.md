---
'@xihan-ui/styles': major
'@xihan-ui/headless': patch
---

**调整** Tooltip 不再反白：两个主题都与 Popover 同一副浮层面，底、字、边取 frosted 材质（`--xh-material-frosted-bg` / `-fg` / `-border`），仍走 compact 档的透明度、背景滤镜与投影，箭头同底同边；与 Popover 靠一行字的尺寸与控件圆角区分。深色主题下不再翻成一块浅底深字。写了 `tone` 才换语气实底 + on 色，边取 on 色 20% 拼色，这时连接层才在 content 上打 `data-xh-ink-surface`、面内成为墨色域（没写 tone 不再打）。SideNav 图标栏的名称提示同样随 Tooltip。要回到反白的深底，覆盖 `--xh-tooltip-bg: var(--xh-fg-default)`、`--xh-tooltip-fg: var(--xh-bg-surface)` 与 `--xh-tooltip-border`。

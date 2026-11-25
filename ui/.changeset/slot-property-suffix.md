---
'@xihan-ui/styles': major
---

**破坏性** 覆盖槽的属性后缀收成一套：内衬 `-p / -px`（原 `-padding`），尺寸 `-w / -h / -min-*`（原 `-width`、`-height`、`-block-size`、`-inline-size`），字重 `-font-weight`（原 `-weight`），行距 `-leading`（原 `-line-height`），线粗 `-thickness`（原 `-line-width`、`-link-width`），只读 `-readonly`（原 `-read-only`）；分隔线、指示条、引导线这类线类部件的颜色按落到的属性改叫 `-bg` / `-border` / `-fg`。系列、连线、填充这类数据色与图形色的 `-color` 不变；`-group-spacing`（组与组之间）与已有的 `-group-gap`（组内）意思不同，不并。计算样式不变，只是名字；`check-component-tokens` 从此拦住少数派后缀。

共 66 支：

| 旧名 | 新名 |
| --- | --- |
| `--xh-anchor-indicator-color` | `--xh-anchor-indicator-bg` |
| `--xh-approval-pending-indicator-color` | `--xh-approval-pending-indicator-bg` |
| `--xh-button-group-outline-color` | `--xh-button-group-outline-border` |
| `--xh-button-group-separator-color` | `--xh-button-group-separator-bg` |
| `--xh-cartesian-chart-height` | `--xh-cartesian-chart-h` |
| `--xh-cartesian-chart-legend-scale-width` | `--xh-cartesian-chart-legend-scale-w` |
| `--xh-cartesian-chart-line-width` | `--xh-cartesian-chart-line-thickness` |
| `--xh-cascader-group-separator-color` | `--xh-cascader-group-separator-border` |
| `--xh-code-view-keyword-weight` | `--xh-code-view-keyword-font-weight` |
| `--xh-code-view-line-height` | `--xh-code-view-leading` |
| `--xh-combobox-group-separator-color` | `--xh-combobox-group-separator-border` |
| `--xh-context-menu-separator-color` | `--xh-context-menu-separator-bg` |
| `--xh-dialog-positioner-padding` | `--xh-dialog-positioner-p` |
| `--xh-diff-view-keyword-weight` | `--xh-diff-view-keyword-font-weight` |
| `--xh-diff-view-line-height` | `--xh-diff-view-leading` |
| `--xh-field-array-add-height` | `--xh-field-array-add-h` |
| `--xh-field-array-item-padding` | `--xh-field-array-item-p` |
| `--xh-filter-builder-add-height` | `--xh-filter-builder-add-h` |
| `--xh-filter-builder-guide-color` | `--xh-filter-builder-guide-border` |
| `--xh-funnel-chart-height` | `--xh-funnel-chart-h` |
| `--xh-graph-chart-height` | `--xh-graph-chart-h` |
| `--xh-graph-chart-link-width` | `--xh-graph-chart-link-thickness` |
| `--xh-grid-split-padding` | `--xh-grid-split-p` |
| `--xh-hierarchy-chart-height` | `--xh-hierarchy-chart-h` |
| `--xh-hierarchy-chart-legend-scale-width` | `--xh-hierarchy-chart-legend-scale-w` |
| `--xh-image-viewer-counter-padding` | `--xh-image-viewer-counter-p` |
| `--xh-image-viewer-toolbar-padding` | `--xh-image-viewer-toolbar-p` |
| `--xh-input-group-bg-read-only` | `--xh-input-group-bg-readonly` |
| `--xh-layout-content-padding` | `--xh-layout-content-p` |
| `--xh-layout-footer-padding` | `--xh-layout-footer-p` |
| `--xh-layout-sider-padding` | `--xh-layout-sider-p` |
| `--xh-log-ansi-bold-weight` | `--xh-log-ansi-bold-font-weight` |
| `--xh-log-line-height` | `--xh-log-leading` |
| `--xh-marquee-block-size` | `--xh-marquee-h` |
| `--xh-menu-separator-color` | `--xh-menu-separator-bg` |
| `--xh-menubar-separator-color` | `--xh-menubar-separator-bg` |
| `--xh-message-feed-pending-indicator-color` | `--xh-message-feed-pending-indicator-bg` |
| `--xh-navigation-menu-indicator-color` | `--xh-navigation-menu-indicator-bg` |
| `--xh-pie-chart-height` | `--xh-pie-chart-h` |
| `--xh-question-flow-padding` | `--xh-question-flow-p` |
| `--xh-question-flow-step-padding` | `--xh-question-flow-step-px` |
| `--xh-radar-chart-height` | `--xh-radar-chart-h` |
| `--xh-radar-chart-line-width` | `--xh-radar-chart-line-thickness` |
| `--xh-radio-group-track-padding` | `--xh-radio-group-track-p` |
| `--xh-reasoning-rail-width` | `--xh-reasoning-rail-thickness` |
| `--xh-sankey-chart-height` | `--xh-sankey-chart-h` |
| `--xh-sankey-chart-node-width` | `--xh-sankey-chart-node-w` |
| `--xh-select-group-separator-color` | `--xh-select-group-separator-border` |
| `--xh-separator-color` | `--xh-separator-bg` |
| `--xh-side-nav-indicator-color` | `--xh-side-nav-indicator-fg` |
| `--xh-skeleton-rect-block-size` | `--xh-skeleton-rect-min-h` |
| `--xh-skeleton-text-block-size` | `--xh-skeleton-text-h` |
| `--xh-sparkline-height` | `--xh-sparkline-h` |
| `--xh-sparkline-line-width` | `--xh-sparkline-line-thickness` |
| `--xh-sparkline-width` | `--xh-sparkline-w` |
| `--xh-spinner-label-weight` | `--xh-spinner-label-font-weight` |
| `--xh-steps-content-min-inline-size` | `--xh-steps-content-min-w` |
| `--xh-steps-item-min-inline-size` | `--xh-steps-item-min-w` |
| `--xh-table-resize-width` | `--xh-table-resize-w` |
| `--xh-tabs-indicator-color` | `--xh-tabs-indicator-bg` |
| `--xh-tabs-separator-color` | `--xh-tabs-separator-bg` |
| `--xh-toggle-group-outline-color` | `--xh-toggle-group-outline-border` |
| `--xh-toggle-group-separator-color` | `--xh-toggle-group-separator-bg` |
| `--xh-toolbar-separator-color` | `--xh-toolbar-separator-bg` |
| `--xh-tour-positioner-padding` | `--xh-tour-positioner-p` |
| `--xh-typography-prose-pre-padding` | `--xh-typography-prose-pre-p` |

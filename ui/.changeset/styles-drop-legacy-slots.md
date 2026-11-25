---
'@xihan-ui/styles': major
---

**破坏性** 删掉改过名的覆盖槽与子路径留下的旧名兜底（6.0.0 到期）：

| 已删的旧名 | 改用 |
| --- | --- |
| `--xh-listbox-item-indicator-fg`、`--xh-tree-item-indicator-fg`、`--xh-combobox-item-indicator-fg`、`--xh-tree-select-item-indicator-fg`（对号颜色） | 各自的 `--xh-<组件>-item-check-fg` |
| `--xh-text-field-control-max-h`（自动高度的上限） | `--xh-text-field-input-max-h` |
| 子路径 `@xihan-ui/styles/undefined.css` | `@xihan-ui/styles/not-defined.css` |

Cascader 的 `--xh-cascader-item-indicator-fg` 不是旧名：搜索结果的对号照样读它，保留。

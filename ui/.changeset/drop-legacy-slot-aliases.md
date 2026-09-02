---
"@xihan-ui/styles": major
"@xihan-ui/web-components": major
---

**摘掉全部旧名兼容层。** 前几批改槽名时写成 `var(--新名, var(--旧名, 令牌))` 三层，让旧名继续生效。本库不留兼容层：中间那一层旧名全部删除，链路收回 `var(--新名, 令牌)` 两层。槽后面跟着的默认值不动——那是覆盖槽机制本身，不是兼容位。

**默认渲染逐像素未变。** 旧名本来就只占兜底位，摘掉之后每一处仍落在原来那个令牌上；八件像素基线（button / text-field / select / menu / popover / dialog / drawer / toast）无差异。

**破坏性：下列 40 个公开槽已删，设它们不再有任何效果。** 这四种介质没有 IDE 提示，改名之后你那条声明只会静默失配——请在自己的代码库里逐个全文搜索，换成右边那个名字。

| 已删的旧名 | 换成 |
| --- | --- |
| `--xh-back-top-trigger-size` | `--xh-back-top-size` |
| `--xh-date-picker-confirm-bg` | `--xh-date-picker-confirm-trigger-bg` |
| `--xh-date-picker-confirm-bg-hover` | `--xh-date-picker-confirm-trigger-bg-hover` |
| `--xh-date-picker-confirm-bg-active` | `--xh-date-picker-confirm-trigger-bg-active` |
| `--xh-date-picker-confirm-fg` | `--xh-date-picker-confirm-trigger-fg` |
| `--xh-date-picker-confirm-shadow` | `--xh-date-picker-confirm-trigger-shadow` |
| `--xh-highlight-radius` | `--xh-highlight-mark-radius` |
| `--xh-highlight-bg` | `--xh-highlight-mark-bg` |
| `--xh-highlight-fg` | `--xh-highlight-mark-fg` |
| `--xh-layout-sider-width` | `--xh-layout-sider-w` |
| `--xh-layout-sider-collapsed-width` | `--xh-layout-sider-collapsed-w` |
| `--xh-notification-gap` | `--xh-notification-item-gap` |
| `--xh-notification-row-gap` | `--xh-notification-item-row-gap` |
| `--xh-notification-w` | `--xh-notification-item-w` |
| `--xh-notification-py` | `--xh-notification-item-py` |
| `--xh-notification-px` | `--xh-notification-item-px` |
| `--xh-notification-border` | `--xh-notification-item-border` |
| `--xh-notification-radius` | `--xh-notification-item-radius` |
| `--xh-notification-bg` | `--xh-notification-item-bg` |
| `--xh-notification-fg` | `--xh-notification-item-fg` |
| `--xh-notification-shadow` | `--xh-notification-item-shadow` |
| `--xh-notification-font-size` | `--xh-notification-item-font-size` |
| `--xh-notification-leading` | `--xh-notification-item-leading` |
| `--xh-password-input-hint-gap` | `--xh-password-input-caps-lock-gap` |
| `--xh-password-input-hint-px` | `--xh-password-input-caps-lock-px` |
| `--xh-password-input-hint-fg` | `--xh-password-input-caps-lock-fg` |
| `--xh-password-input-hint-font-size` | `--xh-password-input-caps-lock-font-size` |
| `--xh-popconfirm-cancel-trigger-px` | `--xh-popconfirm-action-px` |
| `--xh-toggle-group-radius` | `--xh-toggle-group-item-radius` |
| `--xh-transfer-header-gap` | `--xh-transfer-panel-header-gap` |
| `--xh-transfer-header-py` | `--xh-transfer-panel-header-py` |
| `--xh-transfer-header-px` | `--xh-transfer-panel-header-px` |
| `--xh-transfer-title-fg` | `--xh-transfer-panel-title-fg` |
| `--xh-transfer-title-font-size` | `--xh-transfer-panel-title-font-size` |
| `--xh-transfer-title-font-weight` | `--xh-transfer-panel-title-font-weight` |
| `--xh-transfer-count-fg` | `--xh-transfer-panel-count-fg` |
| `--xh-transfer-count-font-size` | `--xh-transfer-panel-count-font-size` |
| `--xh-tree-indicator-fg` | `--xh-tree-item-indicator-fg` |
| `--xh-tree-select-indicator-size` | `--xh-tree-select-item-indicator-size` / `--xh-tree-select-branch-indicator-size`（两个部件各一个） |
| `--xh-typography-text-fg` | `--xh-typography-text-fg-muted` / `--xh-typography-text-fg-tone`（次要档与语气档各一个） |

**另有两组名字没删，但管辖范围收窄了。** 这两个名字自己还有规则，只是不再顺带管另一处：

- `--xh-number-field-input-border` / `-bg` / `-shadow` / `-border-hover` / `-border-focus` / `-border-invalid` / `-bg-readonly` / `-bg-disabled` 此前同时改一体式盒与独立输入框两档，现在只管 `input` 自成一盒的那一档。要改一体式盒写 `--xh-number-field-control-*`。
- `--xh-navigation-menu-content-p` 此前同时改逐项面板与共享外壳，现在只管 `content`。要改外壳写 `--xh-navigation-menu-viewport-p`。

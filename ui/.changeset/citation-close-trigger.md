---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': major
---

**破坏性** Citation 预览卡上收起钮的部件从 `dismiss-trigger` 改叫 `close-trigger`，与 Alert、Dialog、Popover、Tag 等收起一个面的按钮同名；它收起的是预览卡，之后还会再打开，不是从集合里删掉条目。

| 旧名 | 新名 |
| --- | --- |
| 部件 `dismiss-trigger`（WC 作者结构 `data-xh-part="dismiss-trigger"`） | `close-trigger`（`data-xh-part="close-trigger"`） |
| `api.getDismissTriggerProps()` | `api.getCloseTriggerProps()` |
| `--xh-citation-dismiss-trigger-radius` | `--xh-citation-close-trigger-radius` |

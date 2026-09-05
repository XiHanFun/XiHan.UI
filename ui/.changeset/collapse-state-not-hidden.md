---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
"@xihan-ui/styles": major
---

**三处收起态从 `hidden` 属性改到 `data-state`。** `hidden` 是瞬时的：属性一加，节点当帧消失，中间没有可播放的时间段。这三处都是能展能收的内容，改成状态属性之后收起态才有一个可被过渡与动画读到的档位。

| 组件 | 部件 | 从前 | 现在 |
| --- | --- | --- | --- |
| `table` | `expanded-row` | `hidden`（`data-state` 同时也在发，两位重复） | 只发 `data-state="open" \| "closed"` |
| `tree` | `branch-content` | `hidden`（`data-state` 同时也在发，两位重复） | 只发 `data-state="open" \| "closed"` |
| `heatmap` | `tooltip` | `hidden` | `data-state="visible" \| "hidden"` |

前两处取开合族、末一处取派生显隐族，取值都在既有的状态词汇表里，没有新造。

**破坏性：这三个部件上不再出现 `hidden` 属性。** 选它的规则（`[data-part='expanded-row'][hidden]` 一类）与断言它的用例（`el.hasAttribute('hidden')`）都会静默失配——前两处换成 `[data-state='closed']`，热力图的详情条换成 `[data-state='hidden']`。作者自己写在这些节点上的 `hidden` 仍然有效：皮肤那条收起规则两位一起收。

**收起靠的是皮肤那一条规则，不再有 UA 兜底。** `hidden` 属性由浏览器自带 `display: none`，`data-state` 没有；这三个部件的收起态现在只由 `@xihan-ui/styles` 里的规则画出来。不接皮肤、只用无头层自绘的使用者，须自己写这一条。

**量测口径跟着改。** 表格的行拖拽与树的节点拖拽在量可见行时要跳过收起的那一枝，判据从「祖先带 `hidden`」改成「祖先是收起态的 `expanded-row` / `branch-content`」，作者自己加的 `hidden` 照旧跳过。

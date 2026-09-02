---
"@xihan-ui/styles": major
---

**两个输入框的槽收窄作用面：常态那一档的名字从此只管常态，一体式盒与独立输入框两档各调各的。** 两处都是「设一个槽，另一档跟着被改掉，而且再也调不开」，名字本身没删，改的是它管到哪儿——所以旧写法不会报错，只会静默变成另一种渲染，请按下表逐条核对。

**text-field 的常态描边槽牵着聚焦描边。** `--xh-text-field-input-border` 按名字与用法都是 input 部件的常态描边，却同时排在聚焦描边的取值链最外层：只想把常态描边调淡一点，聚焦时的描边跟着一起变；而且一旦设了它，语气（`data-tone`）对聚焦描边彻底失效——语气被挤到链的第二层，永远轮不到。缺省档与 `outline` 档带这条链，`subtle` 与 `ghost` 两档本来就没有。现在两档的聚焦描边一律走 `var(--xh-_tone, var(--xh-border-control-focus))`，语气重新生效。

| 从前这么写 | 现在改成 |
| --- | --- |
| `--xh-text-field-input-border`（想改一体式盒的聚焦描边） | `--xh-text-field-control-border-focus` |
| `--xh-text-field-input-border`（想改独立输入框的聚焦描边） | `--xh-text-field-input-border-focus` |

`--xh-text-field-input-border` 本身照旧，只管独立输入框的常态描边。

**password-input 的控件盒没有自己的圆角槽。** `control` 是这个组件唯一的视觉盒，它的高度、内衬、间距、描边、底色与落影六项都走 `--xh-password-input-control-*`，唯独圆角走的是按 input 部件取名的 `--xh-password-input-input-radius`：控件盒的圆角没有按本部件取名的入口，改独立输入框的圆角会连盒一起改。新增 `--xh-password-input-control-radius`，中转的私有槽已删，两档各调各的——输入族另外六家都是这个形态。

| 从前这么写 | 现在改成 |
| --- | --- |
| `--xh-password-input-input-radius`（想改一体式盒的圆角） | `--xh-password-input-control-radius` |

`--xh-password-input-input-radius` 本身照旧，只管不写 `control` 那一档里输入框自己的圆角。

**新增 `--xh-form-summary-item-underline-offset`。** 错误摘要里每一条都是一个真链接，下划线的偏移从前写死 2px，而同一件事在 typography 的链接上早就是 `--xh-typography-link-underline-offset`：使用者调全站链接的下划线偏移，表单摘要里的链接不跟着动。缺省仍是 `var(--xh-space-0_5)`，渲染与从前一致。

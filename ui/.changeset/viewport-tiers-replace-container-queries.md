---
"@xihan-ui/styles": minor
---

**`descriptions` / `diff-view` / `transfer` / `timeline` 四个组件的换档轴从容器宽度换成视口断点。**

四个根上的 `container-type: inline-size`、`container-name` 与那三行行内轴填充
（`-moz-available` / `-webkit-fill-available` / `stretch`）全部删掉，`@container` 改成 `@media`。
分档语义逐条照旧，只是门槛从"这块盒有多宽"换成"视口有多宽"：

| 组件 | 基准档（不写查询） | 恢复宽档 |
| --- | --- | --- |
| `descriptions` | 收成一列，标签一律上置 | `≥768px` 最多两格一行、标签回到左边；`≥1024px` 按作者写的 `data-columns` 摆 |
| `diff-view` | `split` 的一行拆成上下两段 | `≥1024px` 回到并排 |
| `transfer` | 两块面板上下堆叠 | `≥640px` 回到三栏并排 |
| `timeline` | 横排一条一行 | `≥768px` 回到并排 |

**为什么换轴**：`container-type: inline-size` 让盒不再由内容撑宽。祖先链上只要有一层是收缩包裹的
（没写 `flex-basis` 的 flex 项、`inline-block`、浮动），宽度就塌。此前给根补的行内轴填充只填得动
直接父级，填不动一条本身就在收缩的祖先链——文档站的示例台正是这一种：示例台 `.xh-demo__stage` 是
`display: flex; flex-wrap: wrap`，示例组件外面还有一层无类名的包裹 div，两层都是收缩包裹的 flex 项。
1600 视口下示例台量到 927px，包裹层与根都只有 **520px**，于是 520 < 640 恒判窄档，
穿梭框在大屏上一直竖排。组件被放进什么样的祖先链，库看不见也管不了，容器查询因此在这个库里落不了地。
换成视口断点没有塌宽这一档。

连带：

- `container-scope-registry.json` 的四条全删，表现在是空的。`check-container-scope` 保留，它现在守的是
  「谁都不许再写 `container-type`」——皮肤里凡出现一处就没有对应登记，立刻判红。
- `docs/guide/styling.md` 那一整节「有几个组件的根是查询容器」（含塌宽说明与避开写法）删掉，
  `check-doc-numbers` 里对应的那条登记与「查询容器根数」真值函数一并删掉。
- 浏览器态用例：塌宽边界那份整份删掉（换轴之后没有对象可测）；四个组件的分档判据改用 iframe 量
  （宿主视口固定改不动，媒体查询只能按 iframe 自己的视口求值），并新增一份把三档形态逐个钉住的用例。

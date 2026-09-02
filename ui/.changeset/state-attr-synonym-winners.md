---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
"@xihan-ui/styles": major
---

**同义重名收口：13 个 `data-*` 属性名删除，每组只留一个。** 同一件事在不同组件里取了两三个名字，使用者那条 `[data-xxx]` 规则就只能命中其中一部分——想给「拖动中」写一条统一的光标规则，写 `[data-dragging]` 会漏掉图片查看器，写 `[data-panning]` 又只剩它一个。现在每组定一个赢家，输的那个名字从连接层、皮肤、适配器、用例与文档里整个删除，**不留别名、不留过渡期**。

**破坏性：下表左列的属性名在 DOM 上不再出现，选它的规则一条也不会再命中。** 这一介质没有 IDE 提示，改名之后选择器只会静默失配，不报错也不降级——请在自己的代码库里全文搜索左列这 13 个名字，逐条换成右列。

| 删掉的名字 | 改成 | 组件 / 部件 |
| --- | --- | --- |
| `data-affixed` | `data-fixed` | `affix` 的 `content` |
| `data-at-limit` | `data-at-max` | `text-field` 的 `root` / `control` / `input` |
| `data-autosize` | `data-auto-resize` | `text-field` 的 `input` |
| `data-borderless` | `data-bordered`（**取值反转**，见下） | `table` 的 `root` |
| `data-busy` | `data-loading` | `approval` 的 `root` / `approve-trigger` / `deny-trigger`，`prompt-input` 的 `root` |
| `data-overflow` | `data-overflowing` | `tags-input` 的 `root` / `control` |
| `data-panning` | `data-dragging` | `image-viewer` 的 `viewport` / `image` |
| `data-row-draggable` | `data-draggable` | `table` 的 `row` |
| `data-ruled` | `data-split` | `table` 的 `root` |
| `data-running` | `data-loading` | `tool-call` 的 `root` / `duration` |
| `data-segmented` | `data-split` | `card` 的 `root` |
| `data-sider-collapsed` | `data-collapsed` | `layout` 的 `root` |
| `data-sticky` | `data-fixed` | `table` 的 `root` / `header` |

**`table` 的外框这一位换成了正面事实，规则要跟着反过来写。** 从前是 `data-borderless` ——「不画外框」时才出现；现在是 `data-bordered` ——「画外框」时出现，缺省就在，写了 `borderless` 才缺席。原先 `[data-scope='table'][data-part='root']:not([data-borderless])` 的写法改成 `[data-scope='table'][data-part='root'][data-bordered]`，原先 `[data-borderless]` 的写法改成 `:not([data-bordered])`。改的只是这一位报的方向，`borderless` 这个 prop 与默认渲染都没有变。

**`data-fixed` 从此统管「这块钉住不随滚动走」。** `layout` 的页头与侧栏、`table` 的吸顶表头、`affix` 越过判定线之后的内容，说的是同一件事，从前叫三个名字。`layout` 的根节点仍旧发 `data-header-fixed` 与 `data-sider-fixed` ——同一个元素上并存着两段各自的开关，不带部件名就分不开，它们是 `data-fixed` 带部件名的转述，不是另一个名字。`log` 的 `data-sticking` 不在这一组：那一位说的是滚动跟随底部，不是钉住。

**`data-loading` 从此统管「异步在途」。** `approval` / `prompt-input` 的「等外部结果落定」与 `tool-call` 的「这次调用还在执行」，与 `button` / `table` 那一批的加载中是同一件事，词汇表里 `aria-busy` 早就配对到 `data-loading`。

**`data-at-max` 统管「已经到上限」，`data-overflowing` 统管「越过了容纳上限」。** 前者与既有的 `data-at-min` 成对；后者的两处含义各自照旧——`ellipsis` 是文本超出容器正在被省略，`tags-input` 是标签数越过 `max`（刚好装满仍是 `data-at-max`）。

**`data-split` 统管「在相邻块之间画分隔线」**：`list` 的条目之间、`card` 的段之间、`table` 的列之间。`segmented` 这个名字与同名组件 `segmented` 撞脸，`ruled` 只在表格排版里说得通，两者都让位。

**两个覆盖槽随属性一起改名**，也请一并搜索替换：

| 删掉的槽名 | 改成 |
| --- | --- |
| `--xh-text-field-control-border-at-limit` | `--xh-text-field-control-border-at-max` |
| `--xh-text-field-input-border-at-limit` | `--xh-text-field-input-border-at-max` |

全局语义令牌 `--xh-border-at-limit` 不在这次范围里，名字不变；`tags-input` 一直就是这么接的（组件槽叫 `-at-max`，兜底取 `--xh-border-at-limit`），`text-field` 这一改是与它对齐。各组件的 prop 名（`borderless` / `ruled` / `stickyHeader` / `autoSize` / `segmented` / `allowOverflow`）一个都没动，默认渲染逐像素不变。

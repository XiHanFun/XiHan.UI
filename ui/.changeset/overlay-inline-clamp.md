---
"@xihan-ui/headless": minor
"@xihan-ui/styles": minor
---

**浮层不再宽过可用区。**

定位引擎一直在算 `availableWidth`（与 `availableHeight` 同一处返回），但**从来没有一个 connect 把它下发成 CSS 变量**——14 个 connect 只发了 `available-h`，宽度那一条整个是空的。于是窄屏上浮层会伸出视口，最边上的内容点不到：`combobox` 越界 40.6px、`select` 24.1px、`tour` 13px，`cascader` 更狠——它的 `content` 明明写着 `overflow-x: auto` 却从不生效（外框自己就宽过可用区，盒内不产生溢出），**最右那一列整列在屏外，而 `positioner` 是 `position: fixed`，页面也滚不过去**。

现在 16 个 connect 下发 `--xh-_<组件>-available-w`，皮肤统一夹取。夹住外框之后 `cascader` 那条 `overflow-x` 自然接管，越界变成面内横滚，最右列够得到。

**跟随锚宽的那两家要写在 `min` 那一侧。** `select` 与 `combobox` 的 `content` 写的是 `min-inline-size: max(内容下限, 锚宽)`——下拉窄过触发器是视觉缺陷，跟随锚宽是这一族刻意的行为（`menu` / `popover` / `cascader` 都没接锚宽）。而 CSS 里 `min-inline-size` 恒压过 `max-inline-size`，所以夹取只写在 `max` 上是**死声明**：加了等于没加，还看起来像修好了。反向验证专门打了这一条——只留 `max` 侧的夹取时，用例照样判红。

`popconfirm` 此前连块轴上限都没有（连静态档都没接），一并补齐。

`date-picker` 只夹外框、内容面内横滚，**刻意不压缩**：压到 375px 会让日历的 28px 格子落在 24px 的网格轨道上、每颗日期钮与右邻重叠 4px。手机档真正的排布改动是另一件事。

**`check-overlay-size` 跟着扩成宽高两条通道。** 此前它只核 `-available-h` 的机器 / connect / 皮肤三段，宽度这条新通道处在所有门禁之外——删掉某个 connect 的下发行，只有一条浏览器态用例拦得住。宽度那张豁免表三条都给了可查证的理由（`tooltip` 的静态档 320px 比最窄可用区 367px 还小；`floating-panel` 的几何由 geometry 层给、它确实会越界但修法不在这条通道上）。

这一批同样一句媒体查询都没写：`available-w` 贴的是碰撞边界，比视口宽更准。

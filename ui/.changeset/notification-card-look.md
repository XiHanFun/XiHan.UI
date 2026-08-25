---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": major
---

通知按卡片重排：左侧类型字形、右上角关闭钮、两列网格。

它的皮肤是从旧的 toast 卡片逐字搬来的，搬完没人按「通知该长什么样」审过一遍，
于是留下三处硬伤：

- **叉掉到了卡片左下方**。`item` 是竖排 flex，而叉上写着
  `align-self: flex-start` + `margin-inline-start: auto`——交叉轴上的 auto 外边距
  会让对齐属性整条失效（flexbox §9.6），`align-self` 那行一点作用都没有，
  叉成了正文下面的第三行。实测它落在距卡片顶 55px 处，卡片因此高出一截。
  三家参考实现（Ant Design / Element Plus / Naive UI）都是绝对定位钉在右上角内衬处。
- **组件路径下一个类型指示物都没有**。徽记只由服务档的默认模板画，
  12 份示例与所有 Web Components 使用者拿到的卡片，语气全靠起始侧那条 4px 色条承载，
  而它压在卡片底上只有 1.9–2.8:1，`loading` 与 `info` 除颜色外完全同形。
- **字号比轻提示还小一档**（13px），标题与说明只差 7.7%，两层文字挤成一片。

现在：

- 新增 `item-indicator` 部件。作者留空即由皮肤按 `data-type` 画一枚兜底字形
  （info / success / warning / error 各一枚，`loading` 给转圈），
  颜色取 `--xh-_tone-fg`——与 alert 的状态图标同档，压在卡片底上十二组最低 4.08:1。
- **两列网格**：左列字形、右列标题与说明；叉绝对定位钉在右上角，标题自动让位
  （写法照 dialog / drawer）。起始侧那条语气色条随之删除——三家都没有，
  语气改由字形承载。
- 卡片宽 320 → 384px（`--xh-overlay-max-w-lg`，与 Ant Design 同值），
  内衬四边 16px，字号回到正文档 14px。
- 服务档的默认模板改成四个节点平铺（不再套一层皮肤够不着的行容器），
  说明部件恒渲染——`aria-describedby` 是无条件发的，节点缺席就成了悬空引用。
- 地标 `role="region"` 从 `root` 搬到 `group`。root 是 `display: contents` 的作用域包装，
  量出来 0×0，地标挂在它身上跳过去落不到任何看得见的地方；那一摞才是真盒子。

顺带补上三处从来没有门禁看管的地方：`check-elevation-role`、`check-press-feedback`、
`check-clear-trigger` 三份名单都没登记过 notification，眼下合规纯属巧合。

**破坏性**：删掉 `--xh-notification-accent` 与 `--xh-notification-accent-width`
两个覆盖槽（色条没了）。另有几个槽的默认值变了：`--xh-notification-w`（20rem → 24rem）、
`--xh-notification-py` / `-px`（12/16 → 16/16）、`--xh-notification-font-size`（13 → 14）、
`--xh-notification-gap` 的语义从「行距」改为「图标与正文的列距」（行距另开
`--xh-notification-row-gap`）。地标从 root 挪到 group，按 `root[role=region]` 写过
自动化断言的要跟着改。

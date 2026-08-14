---
"@xihan-ui/icons": patch
---

补 16 枚常用图标，并把体积棘轮改成量使用者真正下载的那个数。

原先 29 枚全是箭头 / 勾叉 / 增删这类结构性图元，给站点加一个主题开关——最普通不过的需求——
太阳、月亮、显示器一枚都没有。曦寒官网因此在自己仓里手抄了三条 `IconRecord`。

新增 16 枚，判据是真实界面的高频缺口，不求成套：

| 用途 | 图标 |
| --- | --- |
| 主题开关 | `sun` `moon` `monitor` |
| 导航与链接 | `menu` `external-link` |
| 分页首末 | `chevrons-left` `chevrons-right` |
| 日期时间选择器触发 | `calendar` `clock` |
| 与 `upload` 配对 | `download` |
| 密码显隐 | `eye` `eye-off` |
| 表格列筛选 | `filter` |
| 删除与重试 | `trash` `refresh` |
| 通知 | `bell` |

体积条目同时改了形状。原先 `icons` 量的是整包 `dist/index.mjs`，而这个包 `sideEffects: false`、
每枚一个顶层 `export const`，摇树是真的——实测集合 29 枚与 45 枚时，`import { CheckIcon }`
都是 149 B，一字不差。也就是说那条棘轮量的是**任何使用者都不会下载的数**，却随集合线性增长，
1.4 kB 的上限只够再放几枚，把「补图标」变成了体积违规。

现在拆成两条，各自量一件有意义的事：`icons：只用 CheckIcon` 走贴身摇树写法（与适配器条目同款）
守住使用者的实付成本，`icons：整集合` 保留整包口径守住「每枚图标的边际开销别失控」。

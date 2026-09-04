---
"@xihan-ui/styles": patch
---

**几何类过渡改按角色选曲线档；58 个可点部件补上按压反馈。**

**动位置、尺寸、缩放、旋转的过渡此前大多用着色彩那一档。** 规范 §8.2 的选用表把 `--xh-motion-ease-enter` 判给「仅不透明度 / 底色 / 边框色变化」，几何变化另有档位，但实测 86 项几何类过渡里 76 项用的是 `-enter`——因为既有判据只拦「下探原语 / 手写曲线 / 字面关键字」三类写法，判不出档位选错，这条规矩从来不会红。现在按被动的属性分两档：被推到新位置或新尺寸（`inset-*` / `inline-size` / `translate` / `transform` 等）走 `--xh-motion-ease-continuous`，原地形变（`scale` / `rotate`）走 `--xh-motion-ease-enter-strong`。80 项随之改档，涉及 52 份皮肤。观感上最明显的是指示条一类：此前只有 `segmented` 用对了连续档，`anchor` / `navigation-menu` / `tour` / `question-flow` 四家各写各的，滑块看着像自己飘过去；现在四家与它一致，起步就有速度。新增判据 `check-motion-role.mjs` 守住这一档，

**点得动却按不出反应的部件补齐。** 皮肤里带 `cursor: pointer` 的部件有 157 个，此前只有 61 个登记过按压反馈的定性，其余静默放行——包括 `button` 自己，而规范 §14.4 正是拿它当这条的正例。106 个未登记部件逐个定性：58 个补上 `:active` 与 `--xh-motion-scale-press`（`button` / `toggle` / `toggle-group` / `checkbox` / `switch` / `rating` / `calendar` 的翻页与选格 / `carousel` 的翻页 / `tabs` / `accordion` / `collapsible` / `table` 的三个把手 / `popconfirm` / `tour` 的三颗钮等），48 个登记为不给并各留一句理由。不给的分六类：列表族条目（按下回执走高亮档，缩放会抖动整列）、扩大命中区的标签、方框圆圈连着文字的整行条目、字段外壳与铺满宽度的值显示体、拖拽轨道（回执由拇指给出）、大块区域。缩放量一律走 `--xh-motion-scale-press`，减弱动效档下自动归 1。

判据同批改成全集反查：扫出全部可点部件，凡不在两张登记表里的判红，新组件不再默认逃过。

本批共新增三道判据，`pnpm gate` 从 85 项增至 88 项。

**体积预算一次到位，并补上逐皮肤与跨适配器两道度量。** 四条大条目此前余量约 1%（`styles` 143.37/145 kB、`headless` 252.56/255、`vue` 288.30/292、`web-components/define` 276.79/281），重构加第一份皮肤就撞线，之后每个提交都要顺手调预算——门禁变成了记账本。现按实测 × 1.15 一次调到位：`headless` 290 kB、`vue` 332 kB、`web-components/define` 318 kB、`styles` 165 kB、`tokens/tokens.css` 5 kB。逐组件条目从 3 条铺到每族 1 条（新增 `XhMenuRoot` 25.9 kB / `XhTableRoot` 22 kB / `XhSelectRoot` 22.3 kB / `XhToastRoot` 9.7 kB / `XhGridRoot` 1.15 kB / `XhMarkdownStreamRoot` 1.6 kB，各按实测留一成余量贴身守摇树）。

另加两道此前没有的度量：`check-skin-size.mjs` 按份登记皮肤体积基线（单位是去注释压空白后的字节，`table.css` 原始 36773 字节里约四成是注释与空白，按原始字节算等于罚写注释的人），单份涨过一成判红；`check-computed-parity.mjs` 比对两个适配器的 DOM 计算样式快照，127 个组件各一份、逐字对拍——这一档查的是别的门禁查不到的那层：既有判据只能核「引的是不是同一个令牌」，核不到「令牌代换加继承加层序算完之后是不是同一个像素」。首跑 122/127 逐字一致，5 处已登记（三个模态两侧 fixture 不同构，`menubar` 与 `tour` 的 positioner 前景色两侧不同，是实测出来的真差异）。

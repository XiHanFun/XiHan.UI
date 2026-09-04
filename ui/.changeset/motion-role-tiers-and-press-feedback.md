---
"@xihan-ui/styles": patch
---

**几何类过渡改按角色选曲线档；58 个可点部件补上按压反馈。**

**动位置、尺寸、缩放、旋转的过渡此前大多用着色彩那一档。** 规范 §8.2 的选用表把 `--xh-motion-ease-enter` 判给「仅不透明度 / 底色 / 边框色变化」，几何变化另有档位，但实测 86 项几何类过渡里 76 项用的是 `-enter`——因为既有判据只拦「下探原语 / 手写曲线 / 字面关键字」三类写法，判不出档位选错，这条规矩从来不会红。现在按被动的属性分两档：被推到新位置或新尺寸（`inset-*` / `inline-size` / `translate` / `transform` 等）走 `--xh-motion-ease-continuous`，原地形变（`scale` / `rotate`）走 `--xh-motion-ease-enter-strong`。80 项随之改档，涉及 52 份皮肤。观感上最明显的是指示条一类：此前只有 `segmented` 用对了连续档，`anchor` / `navigation-menu` / `tour` / `question-flow` 四家各写各的，滑块看着像自己飘过去；现在四家与它一致，起步就有速度。新增判据 `check-motion-role.mjs` 守住这一档，`pnpm gate` 从 85 项增至 86 项。

**点得动却按不出反应的部件补齐。** 皮肤里带 `cursor: pointer` 的部件有 157 个，此前只有 61 个登记过按压反馈的定性，其余静默放行——包括 `button` 自己，而规范 §14.4 正是拿它当这条的正例。106 个未登记部件逐个定性：58 个补上 `:active` 与 `--xh-motion-scale-press`（`button` / `toggle` / `toggle-group` / `checkbox` / `switch` / `rating` / `calendar` 的翻页与选格 / `carousel` 的翻页 / `tabs` / `accordion` / `collapsible` / `table` 的三个把手 / `popconfirm` / `tour` 的三颗钮等），48 个登记为不给并各留一句理由。不给的分六类：列表族条目（按下回执走高亮档，缩放会抖动整列）、扩大命中区的标签、方框圆圈连着文字的整行条目、字段外壳与铺满宽度的值显示体、拖拽轨道（回执由拇指给出）、大块区域。缩放量一律走 `--xh-motion-scale-press`，减弱动效档下自动归 1。

判据同批改成全集反查：扫出全部可点部件，凡不在两张登记表里的判红，新组件不再默认逃过。

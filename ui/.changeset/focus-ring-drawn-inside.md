---
"@xihan-ui/tokens": major
"@xihan-ui/styles": major
---

**聚焦环从「画在元素外面」改成「画在元素自己那一圈」。** `--xh-ring-offset` 由 `2px` 改为 `calc(-1 * {ring.width})`，环的外沿与元素边框外沿重合。此前键盘落焦时控件的绘制外沿每边外扩 4px（偏移 2 + 环宽 2）——按钮 54×32 画到 62×40、勾选框 16×16 画到 24×24、sm 档图标钮 28×28 画到 36×36；现在逐档外扩 0px，聚焦前后一样大。

**库里从此只有一种偏移。** 此前并存五种写法：`var(--xh-ring-offset)`（外扩 2px，30 处）、`calc(-1 * var(--xh-ring-width))`（内收 2px，9 处）、`--xh-_ring-offset: var(--xh-_ring-inset)`（内收 2px，46 处）、`calc(-1 * var(--xh-stroke-thin))`（内收 1px，color-picker 的通道输入框）、`var(--xh-stroke-thin)`（外扩 1px，tags-input 三处）。全部收敛到 `var(--xh-ring-offset)`：46 处槽赋值连同 `--xh-_ring-inset` 一起删除（令牌默认已是内收），其余四种改写成令牌。高对比档与打印档里那些画状态与形状的 outline 不在此列，逐条未动。

**实心面上的环换成面自己的前景色。** 环画进元素之后压着的是元素自己的面。面是实心品牌底时环色（brand-500）与面（brand-600）只有 1.37:1，贴上去看不出来；这类档在各自皮肤的 `:focus-visible` 规则里把新的私有槽 `--xh-_ring-color` 灌成 `currentColor`，环随之取面自己的前景色——那一族色本来就要在这块面上把字读清楚。34 条规则铺在 31 份皮肤上：`button`/`download-trigger`/`tag`/`tag-group` 的 solid 形态、`checkbox`/`switch`/`toggle`/`toggle-group`/`transfer`/`tree` 的勾选与开档、`calendar`/`carousel`/`pagination`/`time-picker`/`table` 的当前与选中档、以及 approval / editable / form / popconfirm / prompt-input / question-flow / tour / date-picker 的提交类按钮等。公共层只留槽的默认值，名单不收在 `focus.css` 里——谁的面是实心的由那份皮肤自己知道。

**`heatmap` 的格距不再从环几何推。** 它此前把格距与上下内衬写成 `calc(var(--xh-ring-offset) + var(--xh-ring-width))`，为的是让外扩的环整圈落进格子之间的空当。环不再外扩，这个推导会把格距算成 0，改为直接取 `--xh-space-1`：**取值仍是 4px，渲染逐像素不变**。

浏览器态判据 `focus-ring-inset-grpring.spec.ts` 逐档量聚焦前后的布局盒与绘制外沿（差 0）、扫随库发出去的样式表确认只有一种偏移、并对 44 个实心面档逐条核对环色与面的对比度不低于 3:1。高对比档（`forced-colors: active`）下环照旧由系统色画出，未受影响。

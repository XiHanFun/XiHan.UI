---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**滚动区补边缘渐隐：新增 `variant` 形态轴与四位到头状态。**

滚动区此前不暴露「还能往哪边滚」这件事：内容在容器边缘被齐平切断，看不出下面还有没有东西，也没有任何属性给作者自己去画。

新增 `variant?: 'plain' | 'fade'`，缺省 `plain` 就是现在的样子，逐像素不变。写 `fade` 时视口在两条轴上各按「那一头还滚不滚得动」铺一道渐隐带：还回得去的那一侧把内容淡出，滚到头即收成 0。渐隐由双层 `mask-image` 取交集做出，两条轴互不干扰；自绘滚动条是视口的兄弟节点，不跟着一起淡掉。带宽跟着组件已有的 `size` 走（`sm` / `md` / `lg` 三档），**不另开第二个尺寸类 prop**。

两条轴各自到没到头同时落成视口上的四位布尔：`data-at-min-vertical` / `data-at-max-vertical` / `data-at-min-horizontal` / `data-at-max-horizontal`。要自己画「还能往下滚」的提示，接这四位即可，不必开 `fade`。判据取滚动量而不是滑块起点——滑块长度有像素下限，贴着末端时那个比例到不了 1。

从右往左排版时横向那一层的两端对调（渐变没有逻辑方向，只能沿物理方向铺），逻辑侧的取值不动。

`ScrollAreaAxisState` 随之多出 `atMin` / `atMax` 两项；新增 1 个使用者覆盖槽 `--xh-scroll-area-fade-size`。

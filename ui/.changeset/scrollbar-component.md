---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
"@xihan-ui/tokens": minor
"@xihan-ui/kernel": minor
---

新增 `scrollbar` 组件：自绘滚动条，挂在**任意一个**滚动容器上——表格的滚动盒、虚拟滚动的视口、随手一个 `overflow: auto` 的 div 都行，不必是本组件的后代。此前这套东西焊在 `scroll-area` 里，只有连视口带内容一起交出去的场景用得上。

解剖 `root` / `track` / `thumb` 三层必需、`corner` 可选（横竖两条同时摆着时写在其中一条里补交叉口，配合 `gutter` 让两条各自让出那一格）；四种露面时机（`auto` / `always` / `scroll` / `hover`）带收起延时；拖滑块、点轨道跳转、RTL 双向换算、滑块像素下限、成段的 `scroll-start` / `scroll-end` 与 `drag-start` / `drag-end` 都在库里。`focusable` 打开后滑块进 Tab 序、报 `role="scrollbar"` 与三个 `aria-value*`，方向键 / 翻页键 / Home / End 可用；缺省不进 Tab 序也对读屏隐藏——滚动本身由滚动容器报，同一件事没必要报两遍。触屏（粗指针）上默认交给原生滚动，整条不画并带 `data-native`，`forceVisible` 打开才画。收起不再打 `hidden`，而是 `data-state=hidden` 由皮肤淡出（`visibility` 随退场播完才收），露出同样淡入；根上另有 `data-hover` 标指针在不在这一片。

**与 `scroll-area` 共用同一份几何。** 滚动量 ↔ 滑块几何的换算搬到 `shared/scroll-geometry`，两个组件都从那里取，滑块长度、能走的行程与 RTL 换算逐像素一致；几何类型与常量按共享层的名字导出（`ScrollAxisMetrics` / `ScrollAxisGeometry` / `ScrollAxis` / `ScrollRect` / `SCROLL_MIN_THUMB_SIZE`），`scroll-area` 原来的 `ScrollArea*` / `SCROLL_AREA_MIN_THUMB_SIZE` 这几个名字不再保留；`scroll-area` 的 `scrollHideDelay` 改名 `hideDelay`（属性 `hide-delay`），与 `scrollbar` 同名同义。厚度与间隙也收进了令牌：新增 `--xh-scrollbar-thickness-sm/md/lg`、`--xh-scrollbar-gutter`，`scroll-area` 的皮肤改从这里取，两处放在一起长得一样。同时把一直没人用的 `--xh-bg-scrollbar-track` 接上——`scroll-area` 的轨道底色此前钉在 `--xh-bg-subtle` 上，换肤时不跟随；深色下这一处会比原来略深一档。

滚动容器换了会自动把监听挪过去（`scrollable` / `controls` 指向另一个节点、或条件渲染的容器重建）；查不到时投一条 `scrollbar.missing-scrollable` 诊断，不静默，容器后到时调一次 `api.measure()` 即接上。容器里内容长短变了会自动重量（`MutationObserver` 盯着子树，一拍内合并成一次），量不到的场合另有 `api.measure()`。

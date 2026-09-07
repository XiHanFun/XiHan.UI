---
"@xihan-ui/react": minor
---

**React 侧铺上指针交互这一族八个组件：`slider`、`color-picker`、`file-upload`、`sortable`、`resizable`、`splitter`、`scroll-area`、`scrollbar`。**

八个的共同点是「值或布局由指针拖出来」，分歧在谁量几何：`slider` 量轨道、`splitter` 与 `sortable` 与 `resizable` 量容器、`color-picker` 量取色区与两条通道轨道、两个滚动件量视口与轨道。`scroll-area` 是唯一没有自己机器的那个——按轴各建一台 `scrollbar`，视口是它们共同的滚动容器；`scrollbar` 的滚动容器则不必是自己的后代，作者给节点、给取节点的函数、或者给它的 id 三条路都收。

`react-coverage.json` 记到 103/126。

**`slider` 的拇指与 `splitter` 的分隔条各把一处 `focus` 改装成原生监听器。** `connect` 派的是 DOM 的 `focus`（不冒泡），React 的同名合成事件挂的是冒泡的 `focusin`：直接送到节点上的那一种到不了处理器，后代得焦又会被算成本节点得焦，两头都错。两处都只摘 `onFocus`。其余六个组件的 `connect` 一个不冒泡的事件都不派（`color-picker` 的 `onBlur` 归到 React 的 `onBlur`、挂的正是冒泡的 `focusout`，不动它；两个滚动件的 `pointerenter` / `pointerleave` 由机器自己挂在视口与挂载点上，不经 `connect`）。

共享一致性套件咬不到这一路（它走真实 `el.focus()`，`focusin` 会冒泡，接线断了照样全绿），新加的 `tests/drag-native-events.spec.tsx` 补了两条，按 DOM 的送达路径直接派。观察口取「正被推动的是哪一个」——这两家的焦点上报只改活动下标，而活动下标唯一落到 DOM 上的地方就是拖动期间那一份 `data-dragging`。反向验过：把两处 `useNativeEvents` 的名单清空，这两条判红。

**认表单重置的三个各接上了 `useFormReset`。** `slider`、`color-picker`、`file-upload` 的机器在根级 `on` 里声明了 `FORM.RESET`，值（滑块位置、颜色、文件清单）全攥在机器里，原生 `reset` 只还原原生控件——不接这条线，点重置什么都不会发生。锚点取根部件自己渲的那个 `div`。`tests/form-reset.spec.tsx` 补了三条行为用例（门禁对 React 只做静态串匹配，核不到那只 ref 有没有真落到根节点上）。两个方向都反向验过：拆掉三处 `useFormReset` 那三条判红；只把 `slider` 根上的 `{ ref: ctx.rootRef }` 摘掉，滑块那一条单独判红。

**`file-upload` 的 `trigger` 收 `asChild`，与 Vue 侧对齐；另外七个组件在 Vue 侧一个部件都不收，React 这边照样不收。**

`slider` 与 `color-picker` 的影子输入、以及 `color-picker` 的通道数值框都带 `value`，按既有口径各补了一个空的 `onChange`（React 要求带 `value` 的输入交出一个出口），不改用 `readOnly`——那一项在归一化快照的基准属性表里，改了逐帧对拍当场分叉。

**四条判据链全绿：** 共享一致性套件这八个组件共 107 条（`color-picker` 18 / `scroll-area` 17 / `slider` 15 / `file-upload` 14 / `splitter` 14 / `scrollbar` 12 / `sortable` 9 / `resizable` 8，含各自的键盘表覆盖行），**键盘零豁免**；服务端直出**零豁免**，八个都直出得了（`color-picker` 的 `positioner` 在服务端就地渲染，不搬运）；与 Vue 的逐帧对拍与标签名对拍各收下这八个套件，`parity-react` 的待铺名单同步删掉八行。

**几何接线大半被套件咬住了。** 套件把矩形与尺寸桩在真实节点上再喂给同一台机器，因此 `refs` 那几行不是没人管的：逐个改成恒 `null` 之后，`slider` 的 `getTrackEl`、`sortable` / `splitter` 的 `getRootEl`、`scrollbar` 的 `getScrollableEl` / `getTrackEl`、`scroll-area` 的 `getScrollableEl` / `getTrackEl` / `getRootEl` 八处都当场判红。

**已知没有判据咬得住的几处，逐条记在案。**

- **四处 `refs` 接线改坏了套件照样全绿**：`resizable` 的 `getRootEl`、`color-picker` 的 `getAreaEl` 与 `getChannelTrackEl`、`scrollbar` 的 `getRootEl`。前三处是因为套件没有对应的指针路径（`color-picker` 的取色区与两条滑杆只跑了键盘），最后一处是因为「指针进出滚动条本身」这一路套件只派在滚动容器上。逐个实测确认，当前只有代码在保证。
- **共享套件的 fixture 里不出现的部件，只有 `check-part-wiring` 的「源码里引到了那个 getter」在核，行为一条都没跑过，共 5 个**：`slider` 的 `value-text` / `tick-group` / `tick` / `tick-label`，`scrollbar` 的 `corner`。其中刻度那三个连带着「点刻度文案把最近的滑块跳到这一档」这条语义，整条只有类型与门禁兜着；`XhSliderTickGroup` 逐档铺圆点与文案的顺序（一档一对、圆点在前）同样没有判据。
- **`XhSliderTickGroup` 的 `tick` 接管口没有判据。** `check-slot-types` 只核「标了 `SlotChildren` 就得经 `renderSlot` 取值」，套件的 fixture 不传这个函数，载荷里那一档刻度的呈现数据一次都没被读过。
- **`XhFileUploadItem` 的 `file` 入参没跑过。** 一致性 fixture 是静态结构树，属性值只能是字符串、传不了 `File` 对象，套件因此只走 `index` 那条路；按引用直接指定文件的那一支只有类型兜着。`XhFileUploadTrigger` 的 `asChild` 同理——`as-child.spec.tsx` 只演了 `dialog` 那一个。
- **`XhScrollbarRoot` 的 `scrollable` 入参没跑过。** 套件按 `controls` 当 id 去查容器，`resolveScrollable` 里「作者直接给节点」与「给取节点的函数」两支一次都没走到。
- **jsdom 没有布局，真实的拖拽与量测都是桩出来的。** 轨道矩形、项的中心、视口与内容的高度、滚动量的夹取，全是套件在真实节点上按需摆的常数；自动滚动（`sortable` 的 `autoScroll`）、触摸手势被系统收走（`pointercancel`）、以及 `scrollbar` 的 `MutationObserver` 重量这三条一条都没跑到。真实排版下的行为只能在真机上看。
- **`color-picker` 浮层的退场闸门在 jsdom 里只走「没有动画」那一支。** 收起后 `content` 仍留在 DOM 上、只是拿到内联 `display: none`，这一层由逐帧对拍咬着；而「退场动画播完之前保持可见」那条真正的闸门要量 `animationName`，jsdom 量不到。它的 `positioner` 上那套自绘滚动条（`useScrollbars`）也只有 `check-scrollbar-hosts` 的「有没有接这条线」在核，条子画在哪儿、量不量得对都在判据之外。
- **播报区的文本不进判据**：归一化快照只收属性、文档序、焦点与事件，不收文本。`sortable` 的 `live-region` 在不在场由对拍咬着，里面写了什么没有。
- React 侧还没有浏览器态用例与计算样式快照这条输入，八个组件的皮肤、滑块与拇指的定位样式、滚动条的显隐过渡一律不在判据内。

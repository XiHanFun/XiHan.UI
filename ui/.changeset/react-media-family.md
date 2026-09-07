---
"@xihan-ui/react": minor
---

**React 侧铺上媒体这一族六个组件：`image`、`image-viewer`、`image-cropper`、`carousel`、`qr-code`、`signature-pad`。**

一族里三种模型都齐了：`qr-code` 无机器、矩阵全由 props 算；`image` / `carousel` / `image-cropper` / `signature-pad` 各跑一台机器；`image-viewer` 是模态浮层，走 `useOverlay` 那一套（运行时配置、消隐层注册、进出场租约、CSS 退场探测、落点解析）。

**`image` 的 `load` / `error` 不改装。** 先按 `avatar` 的做法确认过：这两个事件在 React 里本来就不走委派——`load` / `error` 与 `scroll` 一样直接装在节点上，`connect` 派下来的处理器原样交给 `<img>` 就能收到。门禁那张不冒泡事件表里也没有它们（表里只有 `focus` / `pointerenter` / `pointerleave` / `mouseenter` / `mouseleave`），摘出来反而是无中生有。图片在机器就位前就已解码那一路照 `avatar` 补了提交后的效应，另配 `image-cached-image.spec.tsx` 两条——共享套件咬不到它（jsdom 不真取图，`complete` 恒假、`naturalWidth` 恒零，套件里的 `load` 全是手工派的）。反向验过：把补报那一句摘掉，「一个 load 事件都不派也落到 loaded」当场判红。

**`carousel` 根上的 `pointerenter` / `pointerleave` 必须改装成原生监听器。** 这两个不冒泡，而 React 的同名合成事件是从 `pointerover` / `pointerout` 合出来的——指针在幻灯片之间划过就会重放一遍，自动播放的按住与放开跟着乱跳。`onFocusIn` / `onFocusOut` 不动：它们经 `reactNormalize` 归到 React 的 `onFocus` / `onBlur`，挂的正是冒泡的 `focusin` / `focusout`。两个方向都反向验过——名单清空后 `check-native-events` 点名判红，共享套件那条「指针停上去即按住，移开又接着播」也判红（这一族的指针进出是直接派在 root 上的，不像焦点那路走真实 `el.focus()`，所以套件这次咬得住）。

**认 `FORM.RESET` 的两个组件各挂一座重置桥。** `image-cropper` 的裁切矩形与 `signature-pad` 的笔迹都攥在机器里，原生 `reset` 只还原原生控件，不接这条线点重置什么都不会发生。锚点接在根部件自己渲的那个 `div` 上。门禁对 React 只做静态串匹配（源码里有没有这句调用），核不到那只 ref 有没有真落到根节点，所以 `form-reset.spec.tsx` 补了两条行为用例：裁切那条先把图片自然尺寸由 `load` 报进去、方向键挪一格再重置；签名那条桩上画布矩形、落笔划一笔再重置。两条都反向验过，摘掉 hook 整齐判红。

**三份影子输入按既有口径给了空的 `onChange`**（`image-cropper` 的两条滑杆与隐藏输入、`signature-pad` 的隐藏输入）——值攥在机器里，React 又要求带 `value` 的输入交出一个出口。不改用 `readOnly`：那一项在归一化快照的基准属性表里，改了逐帧对拍当场分叉。

**`qr-code` 判断作者放没放 logo 的那一步，React 比 Vue 短一截。** Vue 侧要先落到 `shallowRef` 再让 `computed` 依赖它（插槽有没有东西是渲染期才知道的事实，进不了 computed 的依赖）；React 的 `children` 在渲染期就在手里，`slotPaints(children)` 直接算进 `connectQrCode` 的入参。反向验过：把它钉死成 `false`，「放 logo」那条报出「放了 logo 却没铺挖空矩形」。顺带给 `reactNormalize` 的属性别名表补了 `shape-rendering → shapeRendering`——全仓只此一处连字符 SVG 属性，不换名 React 会在开发构建里逐帧告警（属性照旧渲染，但那条告警是噪音）。

**`asChild` 照 Vue 侧的收法**：这一族只有 `image-viewer` 的 `trigger` 收，其余部件一个都不收。

四条判据链全绿：共享一致性套件这六个组件共 **85 条**（含各自的键盘表覆盖行），键盘豁免 **两条**——`image-viewer.kbd.tab` / `shift-tab`，理由照 Vue 侧同一行（jsdom 按 Tab 不移动焦点，焦点环绕演不出来）；服务端直出 **零豁免**；与 Vue 的逐帧对拍与标签名对拍各收下这六个套件，`parity-react` 的待铺名单同步删名；六个登记进 `react-coverage.json`。

**已知没有判据咬得住的几处，逐条记在案。**

- **`image-viewer` 视口上滚轮缩放的原生改装。** `connect` 那一行写明「适配器须以 passive:false 绑定这个监听」，而 React 把 `wheel` 委派在根容器上、登记为被动监听器，那条路上的 `preventDefault()` 是空操作——滚轮缩放的同时页面照滚。这里走 `useNativeEvents(props, ['onWheel'])` 装到节点上（元素上 `addEventListener` 的 `passive` 默认为假）。共享套件里一条滚轮用例都没有：把这处改装整个撤掉，全套 1674 条照样全绿。这一条目前只有代码与本说明，没有判据。
- **`carousel` 视口的指针拖动与 `image-viewer` 的单指平移、双指捏合。** 两家套件都只断言了「没在拖」那一档（`data-dragging: null`），落笔之后的那条路一步都没走。这两处的 `pointerdown` 都冒泡、走 React 合成事件即可，但接没接上没有东西核。
- **量测口这一族其实不涉及**：`carousel` 与 `image-viewer` 的 headless 里没有任何 `getBoundingClientRect` / `clientWidth` —— 轨道位移是纯百分比 `transform`，浮层定位由皮肤的 `inset` 直接摆。真要量尺子的是 `image-cropper` 的视口与 `signature-pad` 的画布，这两处共享套件自己把矩形桩在了真实节点上，拖动与落笔两条路都跑到了。
- **React 侧仍没有浏览器态用例与计算样式快照这条输入**，六个组件的皮肤、`image-viewer` 的退场动画与浮层落位一律不在判据内。

**没交的部分**：`docs/adapters/react.md` 里的已铺数与公开面基线这一轮没动（`check-doc-numbers` 会因此判红），归协调方处理。

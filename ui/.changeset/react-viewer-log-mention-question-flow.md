---
"@xihan-ui/react": minor
---

**React 侧铺上四个组件：`json-viewer`、`log`、`mention`、`question-flow`。**

四个各占一类接线：`json-viewer` 的行是按数据摊出来的，作者只写根，整棵树由组件自己铺；`log` 只有一台管粘底的机器，行数、载入态与文案是纯视图属性走 `connect` 的第二参；`mention` 是「正文输入框 + 候选浮层」，照 `combobox` 那一路接（`useOverlay` 管运行时配置、消隐层、进出场租约与落点解析，`useScrollbars` 给候选列表配自绘条）；`question-flow` 是十八个部件的分步问答，机器另有一条量测口通到轨道节点。

`react-coverage.json` 记到 107/126，`parity-react` 的待铺名单同步删掉四行。

**`json-viewer` 的三处 `focus` 改装成原生监听器。** `connect` 在 `tree`、`item`、`branch` 三个部件上派的都是 DOM 的 `focus`（不冒泡）：容器那一路只该在容器自己得焦时把焦点转投给锚点行，而 React 的同名合成事件挂的是冒泡的 `focusin`，行得焦也会把它叫起来、当场把焦点抢回锚点；行那两路则收不到直接派到节点上的事件，锚点与 roving tabindex 于是永远停在原处。三处都只摘 `onFocus`——`tree` 上还有一个 `onFocusOut`，它经归一化落到 React 的 `onBlur`、挂的正是冒泡的 `focusout`，动它反而把语义改坏。

行是组件自己铺的，而 hook 不能在循环里调，所以每一行各是一个内部组件（`JsonItem` / `JsonBranch`），`useNativeEvents` 一行一份。

共享一致性套件咬不到这一路（它走真实 `el.focus()`，`focusin` 会冒泡，接线断了照样全绿），`collection-native-events.spec.tsx` 补了两条，按 DOM 的送达路径直接派。反向验过：把三处 `useNativeEvents` 的名单从 `onFocus` 换成别的事件名，这两条当场判红。

**`mention` 认表单重置。** 整段正文攥在机器里，原生 `reset` 只还原原生控件——不接 `useFormReset(service, rootRef)`，点重置什么都不会发生，而同表单的原生控件已经还原。锚点是根部件自己渲的那个 `div`。`form-reset.spec.tsx` 补了一条行为用例（门禁对 React 只做静态串匹配，核不到那只 ref 有没有真落到根节点上），反向验过：注释掉那句 hook，用例判红。

**两档滚动层共用一只「忽略空值」的 ref。** `json-viewer` 的树档与原文档互斥，同一个位置换档时 React 先摘旧节点的 ref（传 null）再装新的；自绘条的取值口若照单全收，中间会空出一拍找不到容器。这只 ref 只记在场的那个，空调用不往下传。

**几处刻意与既有口径对齐的写法。** 四个组件在 Vue 侧一个部件都不收 `asChild`，React 这边照样不收。`mention` 的 `textarea` 与 `question-flow` 的 `note` 都带 `value` 与 `onInput`、没有 `onChange`——React 对受控输入的告警把 `onInput` 也算作出口，因此照 `text-field` 的既有写法不另补空 `onChange`，更不改用 `readOnly`（那一项在归一化快照的基准属性表里，改了逐帧对拍当场分叉）。`json-viewer` 的机器不派任何 id，因此不建 scope。

四条判据链全绿：共享一致性套件这四个组件共 56 条（`json-viewer` 17 / `mention` 15 / `question-flow` 13 / `log` 11，含各自的键盘表覆盖行），**键盘零豁免**；服务端直出**零豁免**，四个都直出得了；与 Vue 的逐帧对拍与标签名对拍各收下这四个套件。

**已知没有判据咬得住的几处，逐条记在案。都是实测的——把那一处改坏，四条判据链照样全绿。**

- **`json-viewer` 的原文档（`view: 'text'`）整档没有判据。** 共享套件一个用例都没给 `view: 'text'`，`text` 部件因此一次也没渲过，逐帧对拍与标签名对拍同样碰不到它。实测：把那个分支的判据换成一个永远不成立的值，让原文档档位彻底走不到，一致性、服务端直出、两份对拍全绿。这一档的 `pre` 节点、`getTextProps` 与 `api.text` 当前只有 `check-part-wiring` 的「源码里引到了那个 getter」在核。
- **`question-flow` 的量测口没有判据。** jsdom 没有布局，轨道与题目的几何恒为零，视口高度与轨道位移那两个私有槽算不出东西来。实测：把 `getTrackEl` 直接返回 `null`，一致性、服务端直出、两份对拍全绿。那一行 `refs.set` 当前只有代码在保证。
- **`log` 的句柄重绑（`retarget`）没有判据。** 视口或内容节点被换掉之后让粘底句柄重新绑一遍，这一步要真实的节点更替加滚动几何才看得出来。实测：把那句调用整个去掉，一致性与对拍全绿。同一处的 `getViewportEl` 反倒是被咬住的——套件用伪造几何驱动粘底，把它改成返回 `null`，「用户上滚」与「离底后按钮露头」两条当场判红。
- **`mention` 的退场闸门没有判据。** 收起时 `content` 留在 DOM 上、只拿到内联 `display: none`，而归一化快照只收属性、文档序、焦点与事件，不收内联样式。实测：把那一格换成恒不写 `style`，一致性与对拍全绿。「退场动画播完之前保持可见」那条真正的闸门要量 `animationName`，jsdom 量不到。
- **自绘条只被咬住了「在不在场」这一层。** 标签名对拍收的是整棵子树里每一个 `[data-part]`、不按 scope 过滤，所以条子的节点漏了会判红（实测：去掉 `json-viewer` 那句 `bars.render()`，标签名对拍当场判红）；但条子量没量到尺寸、让不让交叉口、滑块摆在哪，一律要布局才看得出来，jsdom 里全是空的。
- **共享套件的 fixture 里不出现的部件，只有 `check-part-wiring` 在核，行为一条都没跑过，共 3 个**：`mention` 的 `label`、`empty`、`loading`。其中 `empty` 与 `loading` 那两格「同一个位置、两者不同屏」的互斥关系整条没有判据。
- **`mention` 按 `collection` 自动铺开的那套结构没有一致性判据。** 套件的 fixture 是手写部件那一路；自动铺开只在新补的那条表单重置用例里渲过一次，「与手写部件产出的 DOM 完全一致」这句话当前没有判据兜着。
- **插槽载荷一律没有被读过。** 套件的 fixture 传的是静态节点，不是函数：`json-viewer` 的空态文案兜底（`empty ?? api.emptyText`）、`log` 与 `question-flow` 的根载荷、`question-flow` 逐项的 `{ questionId, value, selected }`，都只有 `check-slot-types` 在核类型形态，值一次都没被消费过。
- React 侧还没有浏览器态用例与计算样式快照这条输入，四个组件的皮肤、候选浮层的落位、日志的粘底滚动一律不在判据内——这些只能在真机上看。

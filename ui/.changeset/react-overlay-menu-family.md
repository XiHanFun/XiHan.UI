---
"@xihan-ui/react": minor
---

**React 侧再铺四个浮层组件：`hover-card`、`popconfirm`、`context-menu`、`menu`，共 44 个部件。已铺 45/126。**

四个都走 `use-overlay` 那条接线：运行时配置、消隐层注册、进出场租约、CSS 退场探测与落点解析都在那一层，各组件只交自己的层种类与分支。三个带内部滚动的（`hover-card`、`menu`、`context-menu`）把 positioner 一并记进层分支——条子是 content 的兄弟、浮在浮层壳上，按住它拖动不记进去就会被判成层外交互，当场把浮层消解掉；`popconfirm` 没有自绘条，分支只记 trigger，与 Vue 侧同一份口径。收起一律落成内联 `display: none` 跟着退场闸门走，`content` 节点始终留在原地。

**`popconfirm` 跑的是 `popover` 机器**：开合、定位、消解层与焦点域全在那里，确认与取消这两个意图不入机器，由 `connect` 转交。异步确认的挂起布尔住在适配器这一侧（`useState`），`connect` 只发变化意图；机器 props 每帧现搭，`closeOnEscape` / `closeOnInteractOutside` 因此是在消解那一刻现读的，而不是展开那一刻求好值冻住的。

**`hover-card` 的名字链要靠一格状态兜住。** `title` 与 `description` 是两个可选部件，在不在场决定 `aria-labelledby` 指 title 还是指回 trigger、`aria-describedby` 发不发——而 `connect` 是在渲染期求值的，ref 落位排在提交阶段。只落 ref 不重渲的话，属性会永远停在「两个部件都不在场」那一档。这里在两个落位口里各记一格存在性状态，落位那一刻把属性重算一遍。

**`menu` 与 `context-menu` 的子菜单**：子层再跑一台 `submenu` 模式的 `menu` 机器，触发条目由 `SubTrigger` 渲染成「父层条目 + 子层触发器」的双重身份，两份属性的合并序照 Vue 侧逐个对齐（`menu` 是父先子后，`context-menu` 反过来）。任意层级的选中都经一条上下文链汇到根：根发 `select` 再关根，各级随父关闭级联收起；父层收起时子层跟着收。`context-menu` 的 content 名字由 `translations.content` 自己给，不指触发区——触发区是作者的一整块内容且不带 role，指过去等于右键一个表格行就把整行念一遍。

**事件到达路径**：条目与 content 上，`connect` 派的 `pointerenter` / `pointerleave` / `focus` 都不冒泡，逐处用 `useNativeEvents(props, [...])` 只摘这几个改装成原生监听器。`hover-card` 的 content 是例外的另一半：它上面那两个焦点处理器挂的是冒泡的 `focusin` / `focusout`，归一化后正好落在 React 的 `onFocus` / `onBlur` 上，只摘指针那两个。四个机器都不认 `FORM.RESET`，因此都没有 `useFormReset`。Vue 侧收 `asChild` 的四个 trigger，React 这边一并收下；`menu` 根上的 `triggerAsChild` 同样保留。

四条判据链全绿：共享一致性套件、服务端直出（四个**零豁免**）、与 Vue 的逐帧对拍、标签名对拍。键盘表也是零豁免。

**另补三份行为用例，每条都反向验证过（把实现改坏，看它是不是真的判红）：**

- `tests/hover-card-name-chain.spec.tsx`——名字链与说明链的四种组合。共享套件盯着同一组属性，却因为宿主催帧时凑巧多渲了一轮而放行；这份用例只挂载一次不额外催帧，把那一格存在性状态摘掉当场判红两条。
- `tests/menu-native-events.spec.tsx`——按 DOM 的送达路径直接派 `pointerenter` 与 `focus`，核的是「处理器装在它自己点名的那个事件上」。把两个组件的 `useNativeEvents` 摘取名单清空，五条全红。
- `tests/popconfirm-async.spec.tsx` 与 `tests/popconfirm-dismiss-live-read.spec.tsx`——异步确认门的四种走向，以及展开态里翻消解开关。把挂起布尔写死、把两个开关提前求值冻住，各自判红。

**目前没有判据咬得住的接线，逐条记下来：**

- `menu` 与 `context-menu` 的子菜单整支（`Sub` / `SubTrigger`、选中链、父层收起的级联）。四条判据链用的 fixture 都是单层菜单，一条子菜单用例都没有；Vue 侧那两份子菜单专项用例这一批没有搬过来。
- `context-menu` 的 `longPressDelay` 与触摸长按入口、`menu` 的 `openOnHover` 与安全三角。套件里没有这两路。
- `hover-card` content 上那两个焦点处理器留在合成事件档这件事。共享套件里的焦点步骤走的是真实 `el.focus()`，两档都收得到，换成原生监听器一样全绿。

**尚未交付的部分：** Vue 的 `XhContextMenuRoot` 另经实例暴露了一份 `openAt` / `setOpen`，专给「只交 `collection`、没有默认插槽」那条路用；React 这边只有函数式 children 那一个出口，只交 `collection` 时拿不到按坐标展开的命令。

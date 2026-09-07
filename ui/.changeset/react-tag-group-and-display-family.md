---
"@xihan-ui/react": minor
---

**React 侧铺上收尾这一批八个组件：`tag-group`、`button-group`、`icon`、`icon-wrapper`、`gradient-text`、`highlight`、`marquee`、`number-animation`。**

八个里只有 `tag-group` 与 `number-animation` 跑机器，其余六个的属性全部由 `connect` 从 props 算出：`button-group` 与 `icon-wrapper` 只把三个视觉轴摊到根上，`gradient-text` 与 `marquee` 另把两端颜色、每秒像素写成根上的内联变量（`reactNormalize` 把这两处的 style 串解析成 React 的对象），`highlight` 按关键词把整段文本切成 `<mark>` 与纯文本两种片段，`icon` 把图元记录逐层建成 SVG 元素。

`react-coverage.json` 记到 122/126，`parity-react` 的待铺名单只剩 `heatmap` / `masonry` / `timer` / `timestamp` 四行。

**`tag-group` 的两处不冒泡事件都改装成了原生监听器。** `list` 自身得焦时把焦点转投给锚点标签，`item` 自身得焦时改记锚点——两处 `connect` 点名的都是 DOM 的 `focus`，而 React 的 `onFocus` 挂的是冒泡的 `focusin`：不改装的话，`item` 得焦会一路把 `list` 的转投也叫起来，摘除钮得焦又会被算成标签得焦。`onFocusOut` 照旧走合成事件，没动它。共享套件走的是真实 `el.focus()`（`focusin` 会冒泡），核不到这条送达路径，新在 `tests/collection-native-events.spec.tsx` 里按 DOM 语义直接派 `focus`，两条。反向验过：分别把两处 `useNativeEvents` 的名单清空，各判红一条。

**`tag-group` 的标签卸载要在 DOM 摘除之前上报失焦。** 写在 `useIsomorphicLayoutEffect` 的清理里，判据是「本节点当下正持有焦点」；另有一条 value 变更时重报锚点。共享套件的 fixture 是一棵固定的树，不会在中途摘掉持有焦点的节点，这两路新在 `tests/collection-focus-report.spec.tsx` 里认领。反向验过：换成 `useEffect` 那一条判红（`check-focus-report` 同时判红），把 `ITEM.FOCUS` 那一句挖空另一条判红。

**这八个都不认表单重置**（机器里没有 `FORM.RESET` 声明，也没有一个带 `name`），**Vue 侧没有任何一个部件收 `asChild`**，React 这边照样不收；没有一个组件带影子输入。

**全局配置的接线按 headless 的声明走，与 Vue 逐个对齐。** `tag-group`（有 `translations`）、`button-group`、`icon-wrapper`、`icon` 走 `withXhConfig`；`number-animation` 的 `size` 由 `useMachine` 那一处并进来；`gradient-text` / `highlight` / `marquee` 三个既没声明 `size` 也没有 `translations`，与 Vue 一样不接。这一条只有 `check-config-wiring` 这张静态门禁在核，没有行为判据。

**新增三份用例文件，两处补进既有文件，逐条反向验过。**

- `tests/button-group-disabled.spec.tsx`：整组禁用要落到组内每一段的原生 `disabled` 上，只打 `data-disabled` 的话按钮照样点得动。共享套件的 fixture 里每一段是裸 `<button>`、不经过 `XhButton`，这条路它核不到。顺带把段间装饰线的标签、`aria-hidden` 与「朝向与整组相反」一并咬住。反向验过：把 `ButtonGroupDisabledProvider` 的值换成 `undefined` 即判红。
- `tests/icon-nested-glyph.spec.tsx`：`defs` / `clipPath` / `clipPathUnits` 这类驼峰名字在 HTML 命名空间下会被小写化，小写之后 `clipPath` 不再是裁剪路径、整个图标空白。共享套件核到了连字符（`fill-rule`）与一层嵌套，核不到大小写这一路。反向验过：`renderNode` 里把标签名 `toLowerCase()` 即判红。
- `tests/marquee-auto-fill.spec.tsx`：轨道里铺几份、第二份是不是同时标了 `aria-hidden` 与 `inert`、什么才算「真有内容可铺」。壳不是部件，归一化快照只采 `[data-part]` 的节点，套件看不见它。反向验过：把 `slotPaints(children)` 换成 `children != null`，「条件渲染落空」与「纯空白文本」两条判红。
- `tests/shorthand-children.spec.tsx` 补 `XhNumberAnimation` 三条：不给 children 时根里是格式化好的那串字、函数式 children 拿得到 `{ value, text }`、children 落空时退回那串字。反向验过：把 `slotPaints(content) ? content : api.text` 换成 `content ?? api.text`，第三条判红。

**四条判据链全绿。** 共享一致性套件这八个组件共 63 条（`tag-group` 14 / `number-animation` 10 / `icon` 9 / `highlight` 9 / `marquee` 7 / `gradient-text` 6 / `button-group` 4 / `icon-wrapper` 4），`tag-group` 的七行键盘表全部认领，**键盘零豁免**；服务端直出**零豁免**，八个都直出得了；与 Vue 的逐帧对拍与标签名对拍各收下这八个套件。React 适配器 38 个文件 2180 条、逐帧与标签名对拍 1603 条全绿。

**已知没有判据咬得住的几处，逐条记在案。**

- **`tag-group` 的函数式 children 与 `collection` 铺开这两条路都没有判据。** 共享套件的 fixture 总是把部件一个不落地写全，`renderSlot` 的载荷（`isSelected` / `setValue` / `select` / `toggle` / `deleteItem` 这几个命令）与 `DefaultTree` 的结构一次都没走到。与已铺的 `listbox` / `toggle-group` 同一处空白，当前只有代码在保证。
- **`number-animation` 的 `onComplete` 没有判据。** 两个宿主的测试 harness 都没有把 `complete` 登记进对外事件表，套件因此收不到它；跑到终点这件事本身由 `data-state` 落回 `idle` 与终点文本咬着，「回调被调了没有、带的载荷对不对」则没人核。
- **`button-group` 的 `fullWidth` 没有判据。** 套件的四条只核 `role` / 排布 / 三轴 / 角色节点数，`data-full-width` 不在其中；它只是一路透传进 `connect`，改坏了不会有任何一条判红。

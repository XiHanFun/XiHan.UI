# 行为原语

`@xihan-ui/core` 里的行为原语收的是**跨组件复用的交互机制**：对话框、抽屉、气泡、菜单、右键菜单、悬浮卡片……它们的差别在触发方式和视觉，但「点外面要关」「焦点要陷住」「背景不能滚」这些是同一套东西。写在这里一次，组件只管调用。

配套的层栈与背景失活也在 `@xihan-ui/core` 里（它们是结构原语，比行为更底层）。

`createScope(node, idGenerator)` 从节点自己的 realm 解析 Document、Window、Element 与 ShadowRoot。传入 iframe 或画中画窗口中的节点时，`getRootNode/getDoc/getWin` 不会因当前页面的 `instanceof` 失败而回落到主文档。把这份显式 Scope 传给 `createRuntimeConfig({ scope })` 后，默认 locale、LayerRegistry、PortalRoot 与 reduced-motion 都从该 Scope 的 document/window 派生；显式传入的配置仍然优先，其中 `layerRegistry.ownerDocument` 必须与 Scope Document 相同。

无全局 DOM 时必须提供有效 Scope；只提供 layer registry 不会得到一个伪造的空 Scope。Scope 的 root、document、window 必须互相归属，离线 Document 没有活动 Window 时直接报错。默认 PortalRoot 保持惰性创建，但 Document 没有 body 时会给出明确错误；需要其他容器就显式传 `portalContainer`。

`createScope(null, ...)` 本身保持惰性，便于在 CSR 中先建立机器再挂载组件节点；这份 Scope 始终表示 ambient Document，不会在之后改绑节点。真正读取 root/document 时若宿主没有有效全局 Document，会抛出稳定错误。传入离线 Document 的节点时 `getDoc()` 仍返回该 Document，但 `getWin()` 明确失败，不会借用主页面 Window 伪造一组混合 realm。

## 在 Vue 里用

原语都是框架无关的：收一份配置与几个元素 getter，返回一个要自己释放的句柄。接进 Vue 无非是把释放挂到作用域结束，这层包装收在 `@xihan-ui/vue/behavior`：

```ts
import { useHoverIntent, useScrollLock } from "@xihan-ui/vue/behavior";

useScrollLock(() => open.value, config);

useHoverIntent({
  getTriggerEl: () => triggerRef.value,
  getContentEl: () => (open.value ? contentRef.value : null),
  onOpenIntent: () => (open.value = true),
  onCloseIntent: () => (open.value = false),
});
```

Vue 与 React 包装在 DOM 提交后解析 `getTriggerEl()`：节点为 `null` 时表示这一帧没有绑定目标，旧绑定会立即释放；节点重新出现、换代或三个计时参数变化时自动重建。Vue 的 `getContentEl` 与意图回调读取当前响应式选项，React 读取最近一次已提交选项；浮层内容或普通回调换代都不会取消正在进行的安全三角会话。

直接使用 core 的 `trackHoverIntent()` 时传入创建时已经在场的 `trigger` 元素。该元素是明确的创建快照，订阅期间不得跨 Document 移动；需要换触发器时先调用 cleanup 再重建。浮层 content 可以动态换代，但必须始终与 trigger 属于同一 Document；安全三角会按原离开点和新面板位置重算。所有计时器与文档监听都取自 trigger 创建时所属的活动 Window；非法数值、离线 Document 或跨 Document content 会直接报错。

另有 `useScrollTracker` / `useStickToBottom` / `useTypeahead`，接法同上。`useStickToBottom` 除状态外还交出句柄上的两个动作——「回到底部」按钮要的就是前者：

```ts
const { state, scrollToBottom } = useStickToBottom({
  config,
  scrollEl: () => viewportRef.value,
  contentEl: () => contentRef.value,
});

// state.value?.atBottom 为假时露出「回到底部」，点了调 scrollToBottom()
```

两个 getter 里读的是 ref 就不必自己 `retarget`：节点换了这层包装会重绑。

**需要层栈仪式的那几个不在这里**——消隐层、焦点域、背景失活要按顺序接四五个东西，接错的表现是「点子菜单父层跟着关」这类不报错的怪症。那种场景请直接用库里现成的浮层组件；真要自建，照下面几节的顺序接。

## 层栈

浮层不是一个个孤立的东西，它们叠成一摞。`LayerRegistry` 是这摞的账本：

```ts
export type LayerKind = "modal" | "popover" | "inline";

export interface Layer {
  readonly id: string;
  readonly kind: LayerKind;
  readonly node: () => HTMLElement | null; // 层的根节点
  readonly branches: () => Element[]; // 逻辑属于本层、DOM 却在别处的节点
  readonly isModal: () => boolean;
  readonly setModal: (value: boolean) => void;
  readonly surfaces: () => Element[]; // 点了就该关本层的表面，如遮罩
}

export interface LayerRegistry {
  readonly ownerDocument: Document;
  // register / list / top / elementsAbove / subscribe ...
}
```

两个概念值得单独说：

- **`branches`（分支）**——嵌套 portal 出去的子层。菜单开在对话框里、子菜单再 portal 到 body，DOM 上它们是兄弟，逻辑上是父子。漏登记分支会让「点子菜单」被判成「点了外面」，父层跟着关掉。
- **`surfaces`（表面）**——遮罩这类点了就该关的元素。它属于本层，但点它的语义是关闭而不是「点在层内」。

默认情况下同一 Document 共用一个注册表；自定义注册表也会在创建时固化唯一的 `ownerDocument`，公共记录本身被冻结。不同 Document（iframe、画中画窗口）的注册表不能混用。

`list()` 与订阅回调拿到的都是冻结状态快照，Layer 记录本身也被冻结；节点、分支和模态性仍由记录里的 getter 返回当前值。注册与释放会固定这一轮的订阅者名单并通知完所有人，单个订阅者抛错不会截断后续通知，多项异常会按订阅顺序聚合。

登记与释放采用不同提交点。`register()` 的通知失败表示登记失败：注册表先恢复登记前的同一份快照，再向见过临时新状态的同一批订阅者发布补偿通知；中途退订的人仍会收到补偿，中途新增的人不会凭空收到补偿。变更通知和补偿通知都失败时，两阶段异常会一起上抛，失败登记已经分配的 layer id 不会复用。`dispose()` 会先在旧状态上报告非栈顶诊断，再永久移除 Layer、终结 cleanup，并发布通知；即使诊断输出或通知抛错，移除也不会撤销，两个阶段的异常会完整聚合。这样不会把已经释放且上层不再持有 cleanup 的 Layer 复活；重复释放保持幂等。

订阅回调可以读取当前快照、订阅或退订，但不能同步嵌套调用 `register()`，也不能释放仍在注册表里的 Layer。嵌套状态变更会明确抛错，避免外层通知观察到一半又被另一轮变更改写；已经成功终结的 cleanup 仍可重复调用并保持无操作。

注册表还给出 `elementsAbove(layer)`：栈中位于该层之上的各层的全部节点（`node` + `branches` + `surfaces`）。背景失活要用它把上层排除在自己的管辖之外。

单个 Headless 浮层 layer effect 会把“登记 layer → 建消解层 → 建焦点域 → 加滚动锁/背景失活”放在同一初始化事务里。同步步骤与宿主 `flush` 后才执行的背景失活都经过事务守卫；任一步抛错都会把已经取得的资源按逆序全部释放，最后移除 layer。effect 成功后交给机器的也是同一份幂等逆序 cleanup。单项清理失败原样抛出，多项失败则聚合报告，且两者都会继续清完其余项，避免错误层永久占着栈顶。

## 消隐层

```ts
import { createDismissLayer } from "@xihan-ui/core";

const layer = createDismissLayer({
  config, // RuntimeConfig：scope + 层注册表 + 豁免配置
  layer, // 已注册的层
  onDismiss: (reason) => { /* 'escape-key' | 'pointer-down-outside' | 'focus-outside' | 'programmatic' */ },
  onEscapeKeyDown: (e) => { /* preventDefault() 即这次别关 */ },
  onPointerDownOutside: (e) => {},
  onFocusOutside: (e) => {},
  onInteractOutside: (e) => {}, // 上面两者任一发生时也派发一次
});
```

两条约束：

- **只有栈顶层响应 `Escape`。** 否则一次按键会把整摞层全关掉。
- **四个回调都是可取消的表决票。** 它们收到的是 `cancelable` 的 `CustomEvent`，`preventDefault()` 即否决本次关闭。Escape 票把原生 keydown 放在 `detail.originalEvent`；Pointer、Focus 与 Interact 票当前只提供取消语义，不承诺原事件字段。这让「表单没填完时按 Esc 先弹确认」这类需求不必绕开组件实现。

DismissableLayer 的监听 Document、`CustomEvent`、微任务与动画帧均取自 `config.scope` 的同一个 Window，`config.layerRegistry.ownerDocument` 也必须逐字指向该 Document。传入的 layer 必须已经登记在这份注册表里；动态 `layer.node()` 可以暂时为 `null`，非空时必须是真实 HTMLElement 且属于该 Document。从其他窗口返回节点会立即报错，不会把一张文档里的交互票派到另一张文档。所属 Window 缺少 `CustomEvent`、`queueMicrotask` 或动画帧能力时创建即失败，不借 ambient 全局。

三类 Document 监听器在创建期间同步注册，随后只用一枚所属 Window 的微任务把交互置为已武装，以避开打开浮层的同一次 pointerdown。任一 `addEventListener` 或排微任务失败都会在创建返回前按逆序撤掉已经触及的监听，使上层浮层初始化事务能继续回滚 Layer；`dispose()` 同样先进入终态，再按动画帧、focus、pointer、keydown 的顺序尝试全部清理。单项清理异常原样抛出，多项异常按发生顺序放进 `AggregateError`，`cause` 保留首错。

首次读取动态节点也属于初始化事务：getter 让 layer 退栈或成功改变后再恢复栈内容都会在注册监听前失败；失败登记由 LayerRegistry 补偿回原 snapshot 时可以继续。每次表决会再次固定当时的冻结层栈快照与动态节点。DOM 事件监听器、选项回调或通用 interact 回调只要改变了层栈快照或节点，这张旧票就不能再提交关闭；即使层栈随后恢复成相同内容也一样。登记通知失败且 LayerRegistry 成功补偿回原快照时，原票仍有效。层栈与节点身份保持不变时，提交前还会在同一快照上重算 branches 与 surfaces，表决期间刚纳入 branch 的目标不会被误判成层外。pointer 建立焦点抑制帧后，票据复核与 `onDismiss` 共用同一异常边界；任一步骤失败都会先撤帧，主异常始终排在首位并作为聚合异常的 `cause`。

## 焦点域

```ts
import { createFocusScope } from "@xihan-ui/core";

const scope = createFocusScope({
  config,
  layer,
  container: () => contentEl,
  trapped: () => isModal, // 焦点不得逃逸，生命周期内可变
  loop: true, // Tab 到边界回绕，与 trapped 正交
  branches: () => nestedPortals,
  initialFocus: () => firstInputEl,
  restoreFocus: () => true, // 卸载时把焦点还给创建前那个元素，默认开
  onMountAutoFocus: (e) => {}, // 可 preventDefault 接管首次聚焦
  onUnmountAutoFocus: (e) => {},
});
```

`trapped` 与 `loop` 是两件事：陷住（逃不出去）和回绕（Tab 到末尾回到开头）。模态对话框两者都要；非模态气泡通常只要回绕。

容器上的 `xh.focusScope.mountAutoFocus` / `xh.focusScope.unmountAutoFocus` DOM 事件与两个选项回调收到同一个 `cancelable` `CustomEvent`。成功绑定容器后，每个生命周期只派发一次，DOM 监听器先执行，选项回调随后执行；两条通道都会收到通知。任一通道调用 `preventDefault()`，FocusScope 都不再执行对应的默认聚焦或焦点归还。scope 从未取得容器时不会伪造 body 事件。

`restoreFocus: () => false` 或同一 Document 中更新的焦点域仍在场时，unmount 通知仍会发出，只跳过默认归还。不同 Document 的焦点域互不抑制；跨窗口交接若不应归还，调用方必须用 `preventDefault()` 或 `restoreFocus: () => false` 明确表达。回调抛错会直接暴露；挂载回调抛错时，FocusScope 会先撤销监听、哨兵和层订阅，不留下拿不到句柄的半成品。

挂载回调是同步表决点；要让 FocusScope 在 DOM 稳定后聚焦指定节点，使用 `initialFocus`，它会沿既定帧预算重试。回调取消后自行安排异步焦点时，调度与目标有效性由调用方负责。

非栈顶的焦点域会自动暂停——上面又开了一层时，下面那层不该再抢焦点。

`focusSafely` 与 `focusFirst` 按候选节点所属的 Document/ShadowRoot 判断焦点是否真正落下；可选中文本控件通过严格 HTMLElement 身份与 HTML 节点名识别，不依赖可能因 `adoptNode` 改变的 owner realm 构造器。Shadow DOM 中 `document.activeElement` 只指向 host，不能拿它判断内部候选失败或重复聚焦。

陷焦点域会精确观察最后一个域内焦点的 DOM/ShadowRoot 祖先路径。该路径被移除后，FocusScope 等到所属 Window 的下一动画帧再确认最终焦点；只有域仍在场、仍为活动层、`trapped` 仍开启且业务没有把焦点交给其他有效节点时，才恢复到重新插回的原节点、主容器首个有效项或容器。暂停中的域保留待复核资格，重新取得同一 Document 的焦点所有权后再继续；每次尝试候选后都会重新仲裁，候选的 focus 回调同步打开新层时不会再触碰后续节点。动态 `branches`、closed ShadowRoot 与容器替换走同一判据，普通 DOM 删除不会触发补焦。

公开 `FocusableElement` 统一表示 `Element & HTMLOrSVGElement`，即具备浏览器原生焦点能力的 Element。`getTabbables`、`focusSafely`、`focusFirst`、`focusItem`、Scope 活动元素和 FocusScope 的显式焦点目标都使用这份合同；带 `tabindex` 的 SVG/MathML 不会再被类型系统遗漏。

## 滚动锁

```ts
import { acquireScrollLock } from "@xihan-ui/core";

const lock = acquireScrollLock({ config });
lock.dispose();
```

锁是**引用计数**的：叠了三层浮层就加了三次，全部释放才真正解锁并还原滚动位置。

**锁哪个元素**由 `config.scrollRoot?.()` 决定。没注入就先看整页，再往下探测真正在滚的那个容器——宿主把滚动搬进了内容容器（`body` 自己不滚）时必须注入，否则锁到的是不滚的那个，浮层背后照样能滚。

加锁期间让出来的滚动条宽度写在文档根的 `--xh-scroll-lock-gutter` 上，供 `fixed` 定位的元素让位：

```css
.my-fixed-header {
  padding-inline-end: var(--xh-scroll-lock-gutter, 0px);
}
```

浮层内部自己要能滚的场景不靠白名单：锁改的是滚动容器本身，浮层是 portal 出去的独立子树，它内部的滚动不受影响。

## 背景失活

```ts
import { hideOutside } from "@xihan-ui/core";

const restore = hideOutside(() => [
  contentEl,
  ...branches,
  ...config.layerRegistry.elementsAbove(layer),
], config, {
  exemptSelectors: [".my-portal-root"],
});
```

给 `body` 下除目标与豁免节点外的直接子元素加 `inert`，背景内容对读屏与键盘一并消失。

第一个参数取的是函数而不是数组：施加 `inert` 的时机横跨整个展开期（`MutationObserver` 盯着后来新增到 `body` 的节点），晚于调用时刻才挂载的节点必须也能被算进目标。**目标必须包含全部分支节点，以及栈中位于自己之上的层**（`config.layerRegistry.elementsAbove(layer)`），漏传会把 portal 出去的嵌套浮层一起 inert 掉——看得见、点不动。

第二个参数必须同时提供 Scope 和计算 `elementsAbove` 的同一份 `LayerRegistry`，通常直接传 `RuntimeConfig`。`hideOutside` 只订阅该实例的层栈变化，并校验注册表的 `ownerDocument` 与 Scope Document 相同；自定义注册表、iframe 与画中画窗口都不再暗中切换到按 Document 获取的默认注册表。

带 `data-xh-inert-exempt` 的元素默认豁免。

`hideOutside` 的目标、`body`、层栈、`MutationObserver` 与 inert 引用计数严格属于 Scope 的同一 Document。iframe 与画中画窗口中的后挂节点会由各自 Window 的观察器重新计算；从其他窗口 adopt 进来的豁免节点也按当前所属 Document 生效。注册表或目标来自其他 Document、Document 没有活动 Window 或宿主缺少 `MutationObserver` 时会明确报错，初始化失败不会留下半施加的 inert 状态。

## 进出场

退场动画和「什么时候可以从 DOM 里摘掉」是一对老问题。`presence` 用**租约**解决：

```ts
export interface PresenceHandle {
  readonly open: boolean; // 逻辑状态：该开着吗
  readonly rendered: boolean; // 渲染状态：DOM 还该留着吗
  readonly state: "open" | "closed"; // 直接绑到 data-state

  claimExit: (reason: string, timeoutMs?: number) => ExitLease;
  onBeforeExit: (fn: () => void) => Cleanup;
  onExitComplete: (fn: () => void) => Cleanup;
  update: (open: boolean) => void;
}
```

关闭时先同步触发 `onBeforeExit`，动画探测器在此**申领租约**；所有租约归还之前 `rendered` 保持 `true`，DOM 不摘。退场中途又被打开则 `cancel()` 租约，不卸载。租约带超时，动画事件没来也不会永远卡住。

适配器必须在 `data-state` **已提交到 DOM 之后**才调 `update(open)`——先改属性再让 CSS 过渡起跑，顺序反了动画不会播。

## 集合导航

列表型组件（菜单、列表框、组合框、树、标签页）共用一套条目导航：

```ts
import { focusItem, navigateItems, navIntentFromKey, queryItems } from "@xihan-ui/core";

const items = queryItems(rootEl, { scope: "menu", part: "item" });
const intent = navIntentFromKey(event, { axis: "vertical", dir: "ltr" });
if (intent) {
  event.preventDefault();
  focusItem(navigateItems(items, currentValue, intent, { loop: true }));
}
```

`navIntentFromKey` 把按键翻成方向意图（`next` / `prev` / `first` / `last`），并处理两件容易出错的事：**轴向**（垂直列表不该响应左右键）与**书写方向**（RTL 下左右键语义互换）。不归导航管的按键返回 `null`，此时绝不能 `preventDefault`——否则会吃掉输入法、快捷键和浏览器默认行为。

条目的禁用与身份通过统一的 `data` 标记读取，因此判定逻辑对所有组件一致。

## Typeahead

```ts
import { createTypeahead } from "@xihan-ui/core";

const typeahead = createTypeahead({ timeout: 350 });
const query = typeahead.push(event.key); // 不参与检索的键返回 null
typeahead.clear(); // 收起浮层、切换焦点组时丢弃缓冲
```

连续按键在超时窗口内累积成查询串，超时后重开一轮。空格只在缓冲区非空时参与检索——否则会吃掉「空格 = 选中」。

## 贴底

流式输出的消息列表需要「新内容来了自动滚到底，但用户往上翻之后就别抢」：

```ts
import { createStickToBottom } from "@xihan-ui/core";

const stick = createStickToBottom({
  config,
  scrollEl: () => viewportEl,
  contentEl: () => contentEl, // 尺寸变化的观察目标
  threshold: 64, // 距底多少 px 算「在底」
  onChange: (state) => {},
});

stick.scrollToBottom(); // 减弱动态效果开启时自动改为 'instant'
stick.retarget(); // 节点换了就解绑重绑
```

会话线程组件用的就是它。

## 其他

| 导出 | 用途 |
| --- | --- |
| `prefersReducedMotion()` / `onReducedMotionChange()` | 读与订阅「减弱动态效果」系统偏好 |
| `easing` | 一组具名缓动函数 |
| `applySelection()` / `toggleSelectAll()` / `rangeBetween()` | 选中集合运算：带锚点的范围选、全选与切换，不碰 DOM |
| `dispatchCancelable()` | 派发可取消的自定义事件（表决票模式） |
| `getTabbables()` / `focusFirst()` / `focusSafely()` | 可聚焦元素查询与安全聚焦 |

## 相关

- [浮层定位](./position)：坐标怎么算
- [状态机运行时](./machine)：这些原语在 effects 里被装配
- [无障碍与键盘规格](./a11y)：焦点与按键的规格出处

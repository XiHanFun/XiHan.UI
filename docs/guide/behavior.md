# 行为原语

`@xihan-ui/behavior` 收的是**跨组件复用的交互机制**：对话框、抽屉、气泡、菜单、右键菜单、悬浮卡片……它们的差别在触发方式和视觉，但「点外面要关」「焦点要陷住」「背景不能滚」这些是同一套东西。写在这里一次，组件只管调用。

配套的层栈与背景失活在 `@xihan-ui/kernel` 里（它们是结构原语，比行为更底层）。

## 在 Vue 里用

原语都是框架无关的：收一份配置与几个元素 getter，返回一个要自己释放的句柄。接进 Vue 无非是把释放挂到作用域结束，这层包装收在 `@xihan-ui/vue/behavior`：

```ts
import { useHoverIntent, useScrollLock } from '@xihan-ui/vue/behavior'

useScrollLock(() => open.value, config)

useHoverIntent({
  getTriggerEl: () => triggerRef.value,
  getContentEl: () => (open.value ? contentRef.value : null),
  onOpenIntent: () => (open.value = true),
  onCloseIntent: () => (open.value = false),
})
```

另有 `useScrollTracker` / `useStickToBottom` / `useTypeahead`，接法同上。`useStickToBottom` 除状态外还交出句柄上的两个动作——「回到底部」按钮要的就是前者：

```ts
const { state, scrollToBottom } = useStickToBottom({
  config,
  scrollEl: () => viewportRef.value,
  contentEl: () => contentRef.value,
})

// state.value?.atBottom 为假时露出「回到底部」，点了调 scrollToBottom()
```

两个 getter 里读的是 ref 就不必自己 `retarget`：节点换了这层包装会重绑。

**需要层栈仪式的那几个不在这里**——消隐层、焦点域、背景失活要按顺序接四五个东西，接错的表现是「点子菜单父层跟着关」这类不报错的怪症。那种场景请直接用库里现成的浮层组件；真要自建，照下面几节的顺序接。

## 层栈

浮层不是一个个孤立的东西，它们叠成一摞。`LayerRegistry` 是这摞的账本：

```ts
export type LayerKind = 'modal' | 'popover' | 'inline'

export interface Layer {
  readonly id: string
  readonly kind: LayerKind
  node: () => HTMLElement | null // 层的根节点
  branches: () => Element[] // 逻辑属于本层、DOM 却在别处的节点
  isModal: () => boolean
  surfaces: () => Element[] // 点了就该关本层的表面，如遮罩
}
```

两个概念值得单独说：

- **`branches`（分支）**——嵌套 portal 出去的子层。菜单开在对话框里、子菜单再 portal 到 body，DOM 上它们是兄弟，逻辑上是父子。漏登记分支会让「点子菜单」被判成「点了外面」，父层跟着关掉。
- **`surfaces`（表面）**——遮罩这类点了就该关的元素。它属于本层，但点它的语义是关闭而不是「点在层内」。

同一文档共用一个注册表；不同文档（iframe、画中画窗口）各有一份。

注册表还给出 `elementsAbove(layer)`：栈中位于该层之上的各层的全部节点（`node` + `branches` + `surfaces`）。背景失活要用它把上层排除在自己的管辖之外。

## 消隐层

```ts
import { createDismissLayer } from '@xihan-ui/behavior'

const layer = createDismissLayer({
  config, // RuntimeConfig：scope + 层注册表 + 豁免配置
  layer, // 已注册的层
  onDismiss: (reason) => { /* 'escape-key' | 'pointer-down-outside' | 'focus-outside' | 'programmatic' */ },
  onEscapeKeyDown: (e) => { /* preventDefault() 即这次别关 */ },
  onPointerDownOutside: (e) => {},
  onFocusOutside: (e) => {},
  onInteractOutside: (e) => {}, // 上面两者任一发生时也派发一次
})
```

两条约束：

- **只有栈顶层响应 `Escape`。** 否则一次按键会把整摞层全关掉。
- **四个回调都是可取消的表决票。** 它们收到的是 `cancelable` 的 `CustomEvent`，`preventDefault()` 即否决本次关闭，原生事件在 `detail.originalEvent` 里。这让「表单没填完时按 Esc 先弹确认」这类需求不必绕开组件实现。

## 焦点域

```ts
import { createFocusScope } from '@xihan-ui/behavior'

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
})
```

`trapped` 与 `loop` 是两件事：陷住（逃不出去）和回绕（Tab 到末尾回到开头）。模态对话框两者都要；非模态气泡通常只要回绕。

非栈顶的焦点域会自动暂停——上面又开了一层时，下面那层不该再抢焦点。

## 滚动锁

```ts
import { acquireScrollLock } from '@xihan-ui/behavior'

const lock = acquireScrollLock({ config })
lock.dispose()
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
import { hideOutside } from '@xihan-ui/kernel'

const restore = hideOutside(() => [contentEl, ...branches, ...registry.elementsAbove(layer)], scope, {
  exemptSelectors: ['.my-portal-root'],
})
```

给 `body` 下除目标与豁免节点外的直接子元素加 `inert`，背景内容对读屏与键盘一并消失。

第一个参数取的是函数而不是数组：施加 `inert` 的时机横跨整个展开期（`MutationObserver` 盯着后来新增到 `body` 的节点），晚于调用时刻才挂载的节点必须也能被算进目标。**目标必须包含全部分支节点，以及栈中位于自己之上的层**（`registry.elementsAbove(layer)`），漏传会把 portal 出去的嵌套浮层一起 inert 掉——看得见、点不动。

带 `data-xh-inert-exempt` 的元素默认豁免。

## 进出场

退场动画和「什么时候可以从 DOM 里摘掉」是一对老问题。`presence` 用**租约**解决：

```ts
export interface PresenceHandle {
  readonly open: boolean // 逻辑状态：该开着吗
  readonly rendered: boolean // 渲染状态：DOM 还该留着吗
  readonly state: 'open' | 'closed' // 直接绑到 data-state

  claimExit: (reason: string, timeoutMs?: number) => ExitLease
  onBeforeExit: (fn: () => void) => Cleanup
  onExitComplete: (fn: () => void) => Cleanup
  update: (open: boolean) => void
}
```

关闭时先同步触发 `onBeforeExit`，动画探测器在此**申领租约**；所有租约归还之前 `rendered` 保持 `true`，DOM 不摘。退场中途又被打开则 `cancel()` 租约，不卸载。租约带超时，动画事件没来也不会永远卡住。

适配器必须在 `data-state` **已提交到 DOM 之后**才调 `update(open)`——先改属性再让 CSS 过渡起跑，顺序反了动画不会播。

## 集合导航

列表型组件（菜单、列表框、组合框、树、标签页）共用一套条目导航：

```ts
import { focusItem, navIntentFromKey, navigateItems, queryItems } from '@xihan-ui/behavior'

const items = queryItems(rootEl, { scope: 'menu', part: 'item' })
const intent = navIntentFromKey(event, { axis: 'vertical', dir: 'ltr' })
if (intent) {
  event.preventDefault()
  focusItem(navigateItems(items, currentValue, intent, { loop: true }))
}
```

`navIntentFromKey` 把按键翻成方向意图（`next` / `prev` / `first` / `last`），并处理两件容易出错的事：**轴向**（垂直列表不该响应左右键）与**书写方向**（RTL 下左右键语义互换）。不归导航管的按键返回 `null`，此时绝不能 `preventDefault`——否则会吃掉输入法、快捷键和浏览器默认行为。

条目的禁用与身份通过统一的 `data` 标记读取，因此判定逻辑对所有组件一致。

## Typeahead

```ts
import { createTypeahead } from '@xihan-ui/behavior'

const typeahead = createTypeahead({ timeout: 350 })
const query = typeahead.push(event.key) // 不参与检索的键返回 null
typeahead.clear() // 收起浮层、切换焦点组时丢弃缓冲
```

连续按键在超时窗口内累积成查询串，超时后重开一轮。空格只在缓冲区非空时参与检索——否则会吃掉「空格 = 选中」。

## 贴底

流式输出的消息列表需要「新内容来了自动滚到底，但用户往上翻之后就别抢」：

```ts
import { createStickToBottom } from '@xihan-ui/behavior'

const stick = createStickToBottom({
  config,
  scrollEl: () => viewportEl,
  contentEl: () => contentEl, // 尺寸变化的观察目标
  threshold: 64, // 距底多少 px 算「在底」
  onChange: state => {},
})

stick.scrollToBottom() // 减弱动态效果开启时自动改为 'instant'
stick.retarget() // 节点换了就解绑重绑
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

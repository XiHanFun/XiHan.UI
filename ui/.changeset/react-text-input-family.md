---
"@xihan-ui/react": minor
---

**React 侧再铺七个文本输入组件：`text-field`、`number-field`、`password-input`、`pin-input`、`editable`、`input-group`、`tags-input`。已铺 41/126。**

这一批是表单接线最重的一族：七个里六个的机器认 `FORM.RESET`，各自在 `use-*.ts` 里调 `useFormReset(service, rootRef)`，锚点接在根部件自己渲的那个 `div` 上。四个是单一可聚焦控件（`text-field`、`number-field`、`password-input`、`tags-input`），输入框上各接了 `useFieldStateWiring()` 与 `useFieldLabelWiring()`——说明、校验状态与字段标签都得落到真控件上，停在封装根的 `div` 上读屏一个字都念不到。`pin-input`（每格一个 input）与 `editable`（预览态与编辑态是两个焦点目标）按既有登记不在这条之列。

`input-group` 是这批唯一没有机器的：`connect` 直接吃 props，`size` 经 `withXhConfig` 拿全局配置，上下文接口按无机器组件的惯例定义在 `context.ts` 里。带 `translations` 的四个（`text-field`、`password-input`、`pin-input`、`tags-input`）同样逐个调了 `withXhConfig`——`useMachine` 只并 `locale` 与 `size`，按组件名分桶的文案到不了它。

**三处事件到达路径改装成原生监听器。** `number-field` 的加减钮：`pointerleave` 是「按住连发」的三条收尾出口之一，而 React 的 `onPointerLeave` 是从 `pointerout` 模拟出来的，收不到直接派到节点上的 `pointerleave`——不改装，手已经移出去数字还在涨。`pin-input` 的每一格与 `editable` 的预览区：`connect` 挂的 `onFocus` 是不冒泡的 DOM `focus`，按已定死的口径改装。其余处理器（含 `onBlur`、`onPointerDown`、`onPaste`、`onDblclick`）留在 React 合成事件那一档：它们挂的都是冒泡事件，`onBlur` 走的 `focusout` 在这几个叶子节点上与 `blur` 等价。

两处影子输入（`pin-input` 与 `tags-input` 的 `hidden-input`）带 `value` 却没有变更出口，各补一个空的 `onChange`：React 的开发构建会为「带 value 没有出口」逐帧告警。真正的输入框不必补——它们带着 `connect` 挂的 `onInput`，React 认这一个。

`text-field` 的 `input` 部件收 `as`，写 `textarea` 即多行宿主；程序化写值不触发 `input` 事件，自动高度在渲染后由一个效应补量一次。`tags-input` 的标签在 `value` 变更或节点离场时上报 `ITEM.FOCUS_LOST`，用的是 layout effect——节点从文档里摘掉之前它的清理就跑完了，此刻焦点还在里面。Vue 侧这七个没有一个部件收 `asChild`，React 这边同样不收。

四条判据链全绿：共享一致性套件、服务端直出（七个**零豁免**）、与 Vue 的逐帧对拍、标签名对拍。`tests/form-reset.spec.tsx` 另补六条行为用例逐个核锚点——门禁对 React 只做静态串匹配，核不到 `ref` 究竟落在哪个节点上；把六处 `useFormReset` 逐个注释掉、把 `text-field` 根上的 `ref` 摘掉，七次反向验证都判红。

**目前没有判据咬得住的接线，逐条记下来：**

- `pin-input` 每格与 `editable` 预览区的 `onFocus` 改装。套件用的是真实的 `el.focus()`，它同时派 `focus` 与 `focusin`，React 的合成 `onFocus` 照样收得到——把 `['onFocus']` 换成别的名字，一致性套件与逐帧对拍全绿。判红要一次直接派到节点上的、不冒泡的 `focus`，套件里没有这一路。`number-field` 的 `pointerleave` 有判据（「按住后指针移出」那条），换掉当场红。
- `text-field` 的 `as="textarea"` 与自动高度。套件的 fixture 只写单行 `input`，多行宿主那一路（`data-multiline`、`rows`、量高效应）一条用例都没有。
- `tags-input` 的 `ITEM.FOCUS_LOST` 上报。套件里没有「标签带着焦点离场」的用例。
- 两处影子输入的空 `onChange`。它挡的是 React 开发构建的控制台告警，不落 DOM、也不改行为。

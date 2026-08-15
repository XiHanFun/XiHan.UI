# @xihan-ui/behavior

## 1.0.0-alpha.2

### Minor Changes

- 466f143: 新增两个包：`@xihan-ui/motion` 收动效原语，`@xihan-ui/animations` 收现成的动效。

  动效的东西原先散在三处：缓动表与减弱动效探测在 `behavior`，补间与帧循环在 `headless/src/shared`，两套缓动的档名和值还对不上。`@xihan-ui/motion` 把它们收成一处，并补上真正缺的两样——解析解弹簧与 Web Animations 的薄封装。缓动从此只有一份来源：CSS 侧的 cubic-bezier 串与 JS 侧的采样函数同名同源。弹簧按阻尼比分三支算沉降时长，与 dt=0.1ms 的四阶龙格-库塔积分逐点对拍。减弱动效在系统偏好之上叠了一层应用级 override，接得上产品自己的"减弱动效"设置项。

  `behavior` 与 `headless` 原样重新导出搬走的名字，公开面一个没少。

  `@xihan-ui/animations` 是建在上面的效果层：11 个进场预设、6 个注意预设、错开起播与文字拆分。一段动画是一份可 JSON 序列化的配方，能存进数据库、由界面下拉切换。减弱动效的降级由 `motion` 统一兜住，这一层不另开通道——降级只影响中间帧存不存在，不影响控制流。

### Patch Changes

- Updated dependencies [466f143]
- Updated dependencies [7a5d898]
  - @xihan-ui/motion@1.0.0-alpha.2
  - @xihan-ui/kernel@1.0.0-alpha.2

## 1.0.0-alpha.1

### Minor Changes

- e50a7c9: 复合控件开始响应表单重置。这一版落地机制本身与首个组件 radio-group，其余 16 个随后。

  实测过的缺陷：把本库的控件放进 `<form>`，调 `form.reset()`（或点 `XhFormResetTrigger`），
  显示与提交值都停在用户改后的状态——原生重置只还原原生控件，而这些控件的值攥在机器里，
  没有任何一处监听所属表单的 reset。

  **机制**：认重置的机器在根级声明一条无守卫、无载荷的 `FORM.RESET`，动作只做一件事——
  对若干个 cell 各调一次 `context.reset(key)`，即**重新求一遍那个 cell 自己的 `defaultValue` 表达式**
  再走原来的 `set`。落点因此与 cell 定义是同一份代码，不会各写一份而漂移；受控分支原样保留，
  所以「受控只发意图」是免费守住的。适配器侧只在唯一的机器接入点（Vue 的 `useMachine`）挂桥，
  组件文件零改动。

  一句话：`FORM.RESET` = 「把这个组件变回它此刻挂载会长成的样子」。

  **落点不取挂载时冻结的 `initial`，而是按当下 props 重算**。宿主换了 `defaultValue`（比如切去编辑
  另一条记录）就该回到新的那一份，这与原生 `reset()` 回到「当下的 default」一致。

  **受控且宿主没声明 `defaultValue` 时一动不动。** 这是最要紧的一条：cell 里那句 `?? 兜底` 把
  「宿主声明的默认值」和「组件的空值」烘在同一个表达式里（radio-group 是 `null`、rating 是 `0`、
  tags-input 是空数组）。照直落下去，受控分支会把这个空值当意图发给宿主——重置就从「没反应」
  变成「把宿主的数据抹掉」。`resetDeclaredValue` 把这一步挡住了，并有专门的判据钉着。
  **受控组件要拿到重置，必须显式传 `defaultValue`**，这是本库与「受控 reset 是纯空操作」的分歧点。

  **监听挂在锚点的 root node 上**，不挂在那个 form 上：form 会被条件渲染换掉、组件也会被搬走。
  归属在事件那一刻用 `closest('form')` 现算，因此嵌套表单不会误伤。重置被 `preventDefault` 拦下时
  不动——那时同表单的原生控件也没还原，组件单方面还原会拼出半份默认值。

  无 form、无 DOM、作者没写影子输入三种情形都不需要特别处理：归属判定不命中、服务端根本不挂效应、
  锚点是组件根节点而不是影子输入。

  BREAKING CHANGE: `Bindable` 新增必填成员 `reset()`，`ContextFacade` 新增 `reset(key)`。
  自建 `ReactiveRuntime`（写第三个适配器）的实现方需要补上 `reset`。仓内三处实现已全部跟进。

- 4b949c2: 摇树第一次真的生效：只用一个组件不再拖来整个库。

  此前七个库包都是单入口打包，500+ 模块被摊平进一份 `dist/index.js`，`sideEffects: false` 随之失效——
  使用者只 `import { XhBadge }`，打出来的东西和全量 barrel 一样大。

  产物改为保留模块结构（每个源文件一份产物），实测（esbuild 打真实 dist，gzip）：

  | 用例                | 改前      | 改后         |
  | ------------------- | --------- | ------------ |
  | 只用 `XhBadge`      | 168,947 B | **538 B**    |
  | 只用 `XhButton`     | 168,947 B | **1,029 B**  |
  | 只用 `XhDialogRoot` | 168,947 B | **11,374 B** |
  | 全量 barrel         | 173,005 B | 178,768 B    |

  单组件占全量从 **97.7% 降到 0.3%**。全量 barrel 略涨 3%，是模块边界不再被合并的代价，值得。

  **判据补上了此前没有的分辨力。** `.size-limit.json` 原有 18 条全是整包 barrel，改回单入口不会让任何
  一条变红。新增三条带 `import` 字段的按组件预算（badge / button / dialog），退回打包形态时它们会
  立刻超标一个数量级。

  顺带修掉两处被这次改动照出来的既有缺陷：

  - **公开面基线虚高 81 个名字。** `build-public-surface.mjs` 抽类型名的正则里 `export` 是可选的，
    于是把打包版 d.ts 里那些**没有导出**的内部类型别名（`AccordionProps` 这类局部别名共 72 个）也算
    成了受 semver 约束的公开名。实测确认它们从来就 import 不到（`TS2305: has no exported member`）。
    正则补上 `export`，基线随之收敛。
  - **文档生成器只认 `declare`。** 拆包后 barrel 里不再有 `declare`，导致 102 页组件文档的
    「Vue 组件」整列凭空消失。改成 import 与 export 两种形态都收。

  新增一个公开类型 `TweenEasing`：`NumberAnimationEasing` 本就是它的别名，拆包后别名要能被命名，
  这一支就必须公开。

### Patch Changes

- 89d8c54: 修四处在真实宿主里才现形的缺陷，`hideOutside` 的入参形状随之变化。

  **嵌套浮层不再被外层罩死。** 对话框里再开一个对话框（或抽屉），内层 portal 到 `body` 之后也是
  `body` 的直接子元素，会被外层背景失活的 `MutationObserver` 一并打上 `inert`——看得见、点不动。
  层注册表新增 `elementsAbove(layer)`，给出栈中位于该层之上的各层全部节点；`dialog` 与 `drawer`
  把它并进背景失活的目标集。

  **破坏性变更**：`hideOutside(targets, scope, options)` 的第一个参数由 `Element[]` 改为
  `() => Element[]`。施加 `inert` 的时机横跨整个展开期，晚于调用时刻才挂载的节点必须也能被算进目标，
  定死的数组做不到。调用点把数组包成箭头函数即可。同时 `LayerRegistry` 新增 `elementsAbove` 成员，
  自行实现该接口的需要补上。

  **破坏性变更**：`@xihan-ui/machine` 的 `Dict` 改为从 `@xihan-ui/kernel` 转出。两个包此前对同一个
  名字给出不同泛型元数（`Record<string, T>` 与 `Record<string, any>`），从哪个包导入会决定
  `Dict<string>` 编不编得过。

  **首屏即展开的对话框与抽屉能服务端直出了。** `rendered` 的初值此前整块圈在「有 document」的分支里，
  服务端算不出它，只发一个 23 字节的空占位：首屏没有对话框、没有可被索引与读屏读到的正文，
  客户端水合时再整棵补出来。初值改取状态机的展开态。

  **没有 window 的宿主里不再抛异常。** `prefersReducedMotion`、`onReducedMotionChange`、
  `createEnvSignals` 的默认参数写的是裸 `window`，而默认参数在函数体的守卫之前求值——三者的注释都
  承诺 SSR 期回落，实际是 `ReferenceError`。改走 `globalThis.window`，签名不变。

- Updated dependencies [239eb5d]
- Updated dependencies [89d8c54]
- Updated dependencies [24721f4]
- Updated dependencies [4b949c2]
  - @xihan-ui/kernel@1.0.0-alpha.1

## 1.0.0-alpha.0

### Major Changes

- bc65cb7: 首个公开版本：框架无关的 UI 基座。

  自研薄 FSM 内核 + headless（anatomy / machine / connect）+ 设计令牌与主题运行时 + 样式层，
  102 个组件在 Vue 与 Web Components 两套适配器上共用同一份内核，跨适配器一致性套件与
  真实 Chromium 里的无障碍扫描、浮层定位契约全绿。

  浮层定位、虚拟滚动、Web Components 响应式基类、代码着色、流式 Markdown 均为自研，
  运行时不带第三方依赖。

### Patch Changes

- Updated dependencies [bc65cb7]
- Updated dependencies [84b1aa3]
  - @xihan-ui/kernel@1.0.0-alpha.0

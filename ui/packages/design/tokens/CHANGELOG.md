# @xihan-ui/tokens

## 1.0.0-alpha.1

### Minor Changes

- f72664d: 新增 `--xh-border-control` / `--xh-border-control-hover`，并让 `data-contrast='more'` 第一次真的起作用。

  **控件边界这一族。** WCAG SC 1.4.11 要求控件边界对相邻色达 3:1，而 `border.default` 对画布浅色只有
  1.26、深色只有 1.91——12 组边界组合一组都不达标。容器分隔线不在这条规格的范围内，把
  `border.default` 整个调深会让每条分隔线跟着变重，所以另立一支专供控件边界的令牌：

  |                             | 取值          | 对 canvas | 对 surface |
  | --------------------------- | ------------- | --------- | ---------- |
  | 浅色 `border.control`       | `neutral.450` | 3.23      | 3.23       |
  | 浅色 `border.control-hover` | `neutral.500` | 4.73      | 4.73       |
  | 深色 `border.control`       | `neutral.550` | 3.59      | 3.23       |
  | 深色 `border.control-hover` | `neutral.500` | 4.18      | 3.76       |

  两个静息档都是中性色阶里**第一个过 3:1 的档**：再退一档浅色掉到 2.59、深色掉到 2.54；再进一档浅色
  跳到 4.73，那已是正文级重量，1px 描边取到那里整屏会发硬。悬停档单列一支是必须的——沿用
  `border.strong`（浅 1.48 / 深 2.28）会让悬停比静息更淡。

  **`data-contrast='more'`。** 主题运行时一直在往根元素写这个属性，5 个运行时文件解析它、测试也断言它，
  但令牌产物里一条 `[data-contrast]` 选择器都没有，写上去没有任何东西响应。现在它产出一套边界覆盖，
  判据是每条边界对两种底都不低于 4.5:1（与正文 AA 同一条线），取值同样全部从既有色阶里挑。

  判据从 65 条涨到 102 条：控件边界的 3:1 是硬门槛、悬停必须比静息更重、装饰边框的棘轮从 8 组补到
  12 组（`bg.surface` 底那 4 组此前没钉）、高对比档逐条断言。

  本次只动令牌层，皮肤尚未切换到新令牌，**默认外观一字未变**。

- 032f3fd: 带语气的 outline 控件边框补到 3:1，并修掉上一版留下的一处断链。

  上一版把控件边界迁到 `border.control` 时，如实记了一笔「带语气的 outline 形态够不着 3:1」——
  它走的是 `--xh-_tone-border`（语气色兑 40% 底色），六族在两套主题下是 1.44–2.18。这一版补上。

  新增 `--xh-_tone-border-control`：直接取语气主色本体，不再兑底色。两族在各自的底上仍不够，
  按主题各兜一次——语气色是固定原语、不随主题翻，这是唯一能表达的地方：

  - 黄在白底上只有 2.70，浅色态改取新增的 `--xh-color-warning-700`（3.75）；深色态 600 档就有 7.32，不动。
  - 中性在深色底上只有 2.54，深色态改取 `--xh-color-neutral-550`（3.59）；浅色态 600 档就有 7.80，不动。

  六族 × 两套主题现在最低 3.04（浅色 success），全部达标。

  **调色板新增一档** `--xh-color-warning-700 = oklch(0.62 0.15 70)`。步距 ΔL 0.085，落在同族 700 档的
  区间中间（brand 0.058 / danger 0.077 / success 0.138），色度按同族惯例微降，色相与 600 一致。
  黄族此前只有 500/600 两档，没有更深的档可取，所以必须新增。

  **顺带修掉一处断链**：上一版把 `toggle.css` 的 outline 边框改指了 `--xh-_tone-border-control`，
  而那个槽当时并不存在——`<XhToggle variant="outline" tone="danger">` 的边框一直退到中性色，语气丢了。
  这一版把槽真正建起来，`button` 与 `button-group` 一并接上。

  **新增门禁 `check-private-slots`**：皮肤里消费的每个 `--xh-_*` 私有槽都必须在某份皮肤里声明过，
  声明了没人用的也要删。上面那条断链正是它该拦下的——CSS 不报错、TS 不报错，
  而既有的 `check-token-refs` 整体放行 `--xh-_` 前缀，谁都看不见。拿改动前的仓库实跑过：它红在
  `toggle.css:71`，改完转绿。

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

## 1.0.0-alpha.0

### Major Changes

- bc65cb7: 首个公开版本：框架无关的 UI 基座。

  自研薄 FSM 内核 + headless（anatomy / machine / connect）+ 设计令牌与主题运行时 + 样式层，
  102 个组件在 Vue 与 Web Components 两套适配器上共用同一份内核，跨适配器一致性套件与
  真实 Chromium 里的无障碍扫描、浮层定位契约全绿。

  浮层定位、虚拟滚动、Web Components 响应式基类、代码着色、流式 Markdown 均为自研，
  运行时不带第三方依赖。

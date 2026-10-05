# @xihan-ui/motion

## 3.2.0

## 3.1.0

## 3.0.0

### Major Changes

- c17f6e3: 缓动表删去 `decelerate` 与 `accelerate`：组件库与令牌都不使用它们，也没有对应的令牌。引用过的改写成 `cubic-bezier()` 串：

  | 旧名                                 | 替代写法                       |
  | ------------------------------------ | ------------------------------ |
  | `easing.decelerate` / `'decelerate'` | `'cubic-bezier(0, 0, 0, 1)'`   |
  | `easing.accelerate` / `'accelerate'` | `'cubic-bezier(0.3, 0, 1, 1)'` |

  `EasingName` 类型随之少了这两个名字。

- 608cc0a: `resolveEasing` 认不出写法时抛 `TypeError`，不再退回线性（此前只在开发构建下警告）。消息里带原文与全部可用写法。

  字符串先查命名缓动，查不到再按 CSS 缓动函数的语法与取值解释，新认下 `ease` / `ease-in` / `ease-out` / `ease-in-out`、`step-start` / `step-end`、`steps()` 与 `linear()`；`readMotion(el).easing()` 读到样式里改写成的任何合法 CSS 缓动都能换成函数。

  迁移：

  - 此前写成 `'ease-out'` 一类 CSS 关键字、实际按匀速播放的，现在按 CSS 的曲线播放；要保持匀速写 `'linear'`，要库里的曲线写命名缓动 `'easeOut'`。
  - 写法不合 CSS 的一律报错，包括 x 分量越出 [0,1] 的 `cubic-bezier()`、带单位的分量、原型上的属性名（如 `'toString'`）与非字符串值。来自配置或后端的缓动串，请在入口处调用 `resolveEasing` 校验。
  - `tweenValueAt` 经 `resolveEasing` 取曲线，规则相同。

### Minor Changes

- c48171d: 新增呼吸动效：共享关键帧 `xh-breathe`（明暗与缩放起伏，峰值在 42%）与 `xh-breathe-halo`（外扩光环），令牌 `--xh-motion-loop-breathe`（3600ms）、`--xh-motion-ease-breathe`（正弦式缓入缓出，原语 `--xh-ease-sine-in-out`）、`--xh-motion-scale-breathe` 与 `--xh-motion-scale-halo`（减弱档归 1）；`@xihan-ui/motion` 的 `easing.sineInOut` 与 `motionEasings.breathe` 同源。

  Badge 新增 `pulse`（Web Components 为 `pulse` attribute）：圆点档呼吸，表达正在进行、给不出进度的状态（直播、录制、通话中）；光环播 3 轮后停，圆点持续到状态结束；数字角标不呼吸；减弱动效下两者都停，圆点停在满不透明度。badge.css 因此引入共享关键帧，体积基线随之上调。

- df3d2ac: liquid 档的交互光：`data-material="liquid"` 下实心按钮在细指针悬停的一刻，一道光沿 1px 描边环扫过一次，光取面上前景色、不进面，文字对比不受影响；粗指针、强制色下不播，减弱动效下时长归 1ms。新增令牌 `--xh-motion-duration-glint`（640ms）与 motion 的 `motionDurations.glint`，共享关键帧 `xh-glint`，按钮新增覆盖槽 `--xh-button-glint-duration`。
- 1b0701c: `@xihan-ui/core/visual-environment` 新增液态组 `trackLiquidGoo(host, { source, members, domains })`：宿主的材质轴为 `liquid` 时，在宿主最前面插入装粘连滤镜的 `<svg>` 与一层装饰色块层（`aria-hidden`、不接指针），同组的块边缘相距约 15px 以内就连成一片；投影、底色、墨色细线与 1px 亮边都沿整组外形画，色调、通透档与光源方向跟源块走。`split(items, open)` 让块从源块中分离或融回，离源块近的先走、相邻两块错开交错步长，减弱动效下不播放。

  弹簧新增预设 `merge` 与令牌 `--xh-motion-spring-merge-stiffness / -damping`（320 / 24，超调 5.8%），供融合分离使用。液态层皮肤新增色块层与滤镜各段的填色规则，投影经私有槽 `--xh-_liquid-goo-shadow`，组件可在自己的宿主上接入使用者的投影槽。

- 9c6d582: 新增两枚数据动效的语义时长：`--xh-motion-duration-reveal`（640ms）给数据标记首次出现——柱从基线长出、折线描出、扇区扫开；`--xh-motion-duration-morph`（400ms）给数据更新——标记从旧位置走到新位置、坐标轴刻度滑动。减弱动效下两者都归 1ms。`motionDurations` 与 `reducedMotionDurations` 同步加入 `reveal`、`morph`，`readMotion(el).duration('reveal' | 'morph')` 可直接读取。
- 245995e: 新增表现性动效令牌：`--xh-motion-duration-attention`（注意动效播一遍，640ms，减弱档 1ms）、`--xh-motion-distance-lg`（16px，减弱档归零）、`--xh-motion-ease-emphasis`（取新原语 `--xh-ease-emphasized`）。它们供 `@xihan-ui/animations` 的预设使用，组件皮肤不用。`@xihan-ui/motion` 同步导出语义位移 `motionDistances`（sm / md / lg）与错开步长 `motionStaggerStep`，`motionDurations` 增加 `attention`、`motionEasings` 增加 `emphasis`，与令牌逐条对账。
- 684cf13: 新增手势松手的物理：`rubberBand(overshoot, dimension)` 越界跟手的橡皮筋衰减、`rubberClamp(value, min, max, dimension)` 只衰减越出区间的那段、`projectRelease(position, velocity, seconds)` 松手落点投影、`nearestSnap(points, position)` 最近吸附点，以及 `glideSpring(seconds)`——临界阻尼、固有频率 1 / seconds 的弹簧，以投影落点为目标时恰是指数减速的惯性滑行。
- 7192b57: JS 动画可以从元素读取语义动效令牌，减弱动效按元素的作用域判断。

  - 新增 `readMotion(el)`：按语义名读取 `--xh-motion-duration-*`（毫秒）与 `--xh-motion-ease-*`（采样函数）的实际取值，作者对组件槽的覆盖、容器上的 `data-motion` 与系统偏好都已算进计算样式；读不到时取与令牌同值的常量。
  - 新增与令牌同值的常量 `motionDurations`、`motionEasings` 及类型 `MotionDurationName`、`MotionEaseName`、`MotionReading`。
  - `resolveMotionPreference` 接受元素：最近祖先上的 `data-motion`（`reduce` / `default`）优先，其次是应用级 override 与系统设置。传入窗口或不传时行为不变。
  - 缓动表新增与令牌原语同值的 `outFluid`、`outBack`。
  - `resolveEasing` 遇到认不出的写法仍按匀速播放，开发构建下同一写法在控制台警告一次。

- 560242d: 新增有状态弹簧 `createSpringValue`：持有当前值、速度与目标，`to(target, { velocity })` 中途改目标时以当前位移与速度为初始条件重新求解，位置与速度都不跳变，手势松手的速度可以原样交给动画；在目标处带着速度松手也会运动。每一段运动是时间的闭式解，与帧率无关；减弱动效下直接落到终态；非法参数立即抛 `TypeError`。

  弹簧预设进入令牌：`--xh-motion-spring-<名>-stiffness / -damping`（snappy、smooth、gentle、bouncy、stiff，以及 liquid 档用的 toggle、lead、trail），`springPresets` 与令牌同源并由门禁双向对账。

### Patch Changes

- 5c79ac0: 减弱动效改为去掉位移、保留淡变。

  减弱动效下（系统 `prefers-reduced-motion: reduce` 或 `data-motion="reduce"`），`--xh-motion-duration-micro`、`--xh-motion-duration-enter`、`--xh-motion-duration-exit` 保留为 120ms：换色、浮层与提示的淡入不再瞬间跳变。位移、缩放、旋转与尺寸变化仍然瞬时完成——组件的几何过渡取 `move` / `nudge` / `expand` / `collapse` / `slide` / `press` / `release`，这些时长在减弱档下为 1ms，位移与缩放幅度归零。

  自定义样式如果把几何变化挂在 `micro` / `enter` / `exit` 上，减弱动效下会以 120ms 动起来，请改用上面的几何时长。`@xihan-ui/motion` 的 `readMotion` 在读不到样式时取同样的减弱档取值。

- cac2eaf: `animate()` 与背景层按宿主元素所在的 `data-motion` 作用域判断减弱动效。

  局部容器写了 `data-motion="reduce"` 时，其中的 `animate()` 调用（包括 `@xihan-ui/animations` 的预设播放）不再播放中间帧，背景画面冻结；写了 `data-motion="default"` 时，即使应用级偏好要求减弱也照常播放。没有 `data-motion` 的页面行为不变。

- 8ca7eaa: 订阅通知改为直接遍历订阅表，不再先拷一份快照：`setMotionOverride`、视觉环境控制器、`onXhConfigChange`、对话线程仓库的订阅者，在通知途中退订、还没轮到的不再收到这一轮；通知途中新订阅的在同一轮里也会收到。回调里退订自己照旧安全。

## 2.1.0

## 2.0.0

### Major Changes

- dc64383: **补间不再自带一套缓动曲线，改从共用的那张表取。** `tween.ts` 从前写死四条曲线（`ease-in` 是 `t³`、`ease-out` 是 `1-(1-t)³`），与 `easing.ts` 里同名的那几条**不是同一条曲线**——同一个动作用 CSS 声明和用 JS 逐帧算，走出来的路径不一样。现在补间经 `resolveEasing` 取曲线，JS 侧只剩 `easing.ts` 一张表，而它逐值对着设计令牌，由 `check-motion-source` 对账。

  **删掉的公开面（`@xihan-ui/motion`）**：

  | 删掉                  | 改用                                                  |
  | --------------------- | ----------------------------------------------------- |
  | `TweenEasing` 类型    | `EasingName`（曲线名）或 `EasingFunction`（自带函数） |
  | `tweenEasings` 曲线表 | `easing` 曲线串表 + `resolveEasing`                   |
  | `resolveTweenEasing`  | `resolveEasing`                                       |

  `TweenSpec.easing` 现在收三种写法：曲线名、`cubic-bezier(...)` / `linear` 串，或函数本身。`@xihan-ui/headless` 随之不再转出 `TweenEasing`，改转 `EasingName`。

  **破坏性：`number-animation` 的 `easing` 换了取值域。** 从前的四档 `linear` / `ease-in` / `ease-out` / `ease-in-out` 里，只有 `linear` 还认；另外三个不再是已知曲线名，会退回线性。逐条改成曲线表里的名字：

  | 从前          | 改成        |
  | ------------- | ----------- |
  | `ease-in`     | `easeIn`    |
  | `ease-out`    | `easeOut`   |
  | `ease-in-out` | `easeInOut` |

  同时可选的还有 `standard` / `emphasized` / `decelerate` / `accelerate` / `outStrong`，以及直接写一条 `cubic-bezier(...)` 串。曲线换过之后数字滚动的路径与同名 CSS 声明一致。

  **对账面加一条。** `check-motion-source` 从四对缓动常量扩到五对，把 `ease.in-out` ↔ `easing.easeInOut` 也纳入逐字比对——令牌那条 `$description` 早就写着两者同值，此前没人拦。

### Minor Changes

- 317b582: **新增**入场缓动令牌 `--xh-motion-ease-enter-strong`（原语 `--xh-ease-out-strong` = `cubic-bezier(0.23, 1, 0.32, 1)`）。位移与高度变化走这一条：起步快、收尾长，比 `--xh-motion-ease-enter` 看得清。JS 侧同值常量 `easing.outStrong` 一并加上，两边由门禁对账。

  **新增**正文行高令牌 `--xh-text-prose-leading`（原语 `--xh-leading-relaxed` = 1.625）。成段正文此前与控件文字共用 1.5 一个值。

  **新增**兜底字形令牌 `--xh-glyph-mark-arrow-up`。此前只能借语义不对的 `--xh-glyph-mark-sort-asc`。

  **修复** `code-view` 的行号被染成语法数字色。`--xh-code-view-number-fg` 一个名字被行号与数字记号两处消费，根上给它赋了语法色之后行号跟着变色。语法记号改用 `--xh-code-view-number-token-fg`，行号那个名字的语义不变。

  **修复** `prompt-input` 发送按钮禁用态的字底对比度（浅色 1.96:1、深色 2.08:1）。禁用时底色仍是品牌色而只把字变灰，现在底色一并降到 `--xh-bg-muted`。

  **修复** AI 族八处按下缩放是硬切。`approval` / `code-view` / `diff-view` / `message-feed` / `prompt-input` / `reasoning` / `tool-call` 的可点部件此前只声明了 `:active` 的缩放量、没有把 `scale` 写进 `transition`，按下与松手都不过渡；同批补齐悬停与描边的过渡。

## 1.1.0

## 1.0.0

### Minor Changes

- 8d35702: 动效与浮层口径收口。

  **减弱动效只剩一条通道。** 此前 kernel 的 `RuntimeConfig.reducedMotion` 只读系统 matchMedia、motion 包的 `setMotionOverride` 只有 animate / 滚动 / 数字动画在听，presence 与 stick-to-bottom 感知不到应用级覆盖；无 matchMedia 的宿主两包还给出相反答案（kernel 直接抛 TypeError、motion 报 reduce）。现在 kernel 依赖 motion，`reducedMotion` 缺省即 `resolveMotionPreference() === 'reduce'`（覆盖 ?? 系统偏好），没有 matchMedia 一律不减弱；glyph 转圈、backgrounds、滚动、数字动画全部走同一函数。CSS 侧 `tokens.css` 新增 `:where([data-motion='reduce'])` 块，与 `@media (prefers-reduced-motion: reduce)` 同源生成、逐条相同——作者把 `data-motion="reduce"` 打在任意容器即局部减弱。全局配置加 `motion?: 'reduce' | 'no-preference'`，Vue `provideXhConfig` / WC `<xh-config motion>` 收到即调 `setMotionOverride`。

  **缓动与时长的真源是令牌。** motion 包新增 `durations = { fast, normal, slow }`，`animate()` 缺省与 `@xihan-ui/animations` 的缺省时长都引它；`check-motion-source` 比对 primitive.json 与 easing.ts / durations.ts，值不等即红；`check-reduced-motion-channel` 禁止 motion 包之外再出现 `matchMedia('(prefers-reduced-motion')`。

  **皮肤的 reduce 块归口。** 只在两种情况自写：无限循环动画要整个停掉、有使用者时长槽的过渡要兜住穿透。image-viewer / side-nav / layout 三份纯重复令牌层的块删掉；table 的 `0.01ms !important` 改 `animation: none`；保留的 10 份每块配一份等价的 `[data-motion='reduce']` 规则。animation / transition 不再直引 `--xh-duration-*` 原语：spinner 走 `--xh-spin-duration`，skeleton 走新令牌 `--xh-shimmer-duration`（1600ms）。`check-infinite-motion` / `check-motion-primitives` 守住。

  **浮层的 placement / offset 默认值只有两种语义。** `OVERLAY_PLACEMENT_ANCHORED = 'bottom'`（气泡类）与 `OVERLAY_PLACEMENT_LIST = 'bottom-start'`（列表类）、`OVERLAY_OFFSET = 8` 从 headless 共享导出，各组件的 `<C>_DEFAULT_PLACEMENT` 改为引用它们（tooltip / hover-card / popover / popconfirm / popselect 新增导出常量），所有机器显式传 offset，不再隐式靠引擎兜底；`check-overlay-defaults` 守住。

  **层级覆盖槽齐全、后缀统一。** 22 个浮层族的 positioner / backdrop、toaster、navigation-menu 面板都有了 `--xh-<c>-layer` 槽（缺省仍是 `--xh-layer-*`）；tour / table / heatmap 的 `-z` 后缀槽改名 `-layer`（7 个，公开面变更，基线已推）。

  **进退场对称。** toast 退场位移从 distance-sm 改 distance-md（与进场、与 dialog 一致）；tour 的气泡改用 pop 族，聚光灯补退场；side-nav 折叠态弹出面板补进退场并在 Vue / WC 接上退场租约。

  **navigation-menu 的定位登记变成可验证的。** 三道浮层门禁此前按「anatomy 有 positioner」发现族，它从没被检查过；现在 `SKIN_POSITIONED` 名单要求它没有 positioner、不接引擎、面板由皮肤 absolute 排布，任一条不成立即红。`check-arrow-geometry` 增比对 JS 箭头常量（8·√2 / 8）与令牌（8px 边长 / 8px 圆角）。

- 466f143: 新增两个包：`@xihan-ui/motion` 收动效原语，`@xihan-ui/animations` 收现成的动效。

  动效的东西原先散在三处：缓动表与减弱动效探测在 `behavior`，补间与帧循环在 `headless/src/shared`，两套缓动的档名和值还对不上。`@xihan-ui/motion` 把它们收成一处，并补上真正缺的两样——解析解弹簧与 Web Animations 的薄封装。缓动从此只有一份来源：CSS 侧的 cubic-bezier 串与 JS 侧的采样函数同名同源。弹簧按阻尼比分三支算沉降时长，与 dt=0.1ms 的四阶龙格-库塔积分逐点对拍。减弱动效在系统偏好之上叠了一层应用级 override，接得上产品自己的"减弱动效"设置项。

  `behavior` 与 `headless` 原样重新导出搬走的名字，公开面一个没少。

  `@xihan-ui/animations` 是建在上面的效果层：11 个进场预设、6 个注意预设、错开起播与文字拆分。一段动画是一份可 JSON 序列化的配方，能存进数据库、由界面下拉切换。减弱动效的降级由 `motion` 统一兜住，这一层不另开通道——降级只影响中间帧存不存在，不影响控制流。

## 1.0.0-preview.0

## 1.0.0-alpha.3

### Minor Changes

- 8d35702: 动效与浮层口径收口。

  **减弱动效只剩一条通道。** 此前 kernel 的 `RuntimeConfig.reducedMotion` 只读系统 matchMedia、motion 包的 `setMotionOverride` 只有 animate / 滚动 / 数字动画在听，presence 与 stick-to-bottom 感知不到应用级覆盖；无 matchMedia 的宿主两包还给出相反答案（kernel 直接抛 TypeError、motion 报 reduce）。现在 kernel 依赖 motion，`reducedMotion` 缺省即 `resolveMotionPreference() === 'reduce'`（覆盖 ?? 系统偏好），没有 matchMedia 一律不减弱；glyph 转圈、backgrounds、滚动、数字动画全部走同一函数。CSS 侧 `tokens.css` 新增 `:where([data-motion='reduce'])` 块，与 `@media (prefers-reduced-motion: reduce)` 同源生成、逐条相同——作者把 `data-motion="reduce"` 打在任意容器即局部减弱。全局配置加 `motion?: 'reduce' | 'no-preference'`，Vue `provideXhConfig` / WC `<xh-config motion>` 收到即调 `setMotionOverride`。

  **缓动与时长的真源是令牌。** motion 包新增 `durations = { fast, normal, slow }`，`animate()` 缺省与 `@xihan-ui/animations` 的缺省时长都引它；`check-motion-source` 比对 primitive.json 与 easing.ts / durations.ts，值不等即红；`check-reduced-motion-channel` 禁止 motion 包之外再出现 `matchMedia('(prefers-reduced-motion')`。

  **皮肤的 reduce 块归口。** 只在两种情况自写：无限循环动画要整个停掉、有使用者时长槽的过渡要兜住穿透。image-viewer / side-nav / layout 三份纯重复令牌层的块删掉；table 的 `0.01ms !important` 改 `animation: none`；保留的 10 份每块配一份等价的 `[data-motion='reduce']` 规则。animation / transition 不再直引 `--xh-duration-*` 原语：spinner 走 `--xh-spin-duration`，skeleton 走新令牌 `--xh-shimmer-duration`（1600ms）。`check-infinite-motion` / `check-motion-primitives` 守住。

  **浮层的 placement / offset 默认值只有两种语义。** `OVERLAY_PLACEMENT_ANCHORED = 'bottom'`（气泡类）与 `OVERLAY_PLACEMENT_LIST = 'bottom-start'`（列表类）、`OVERLAY_OFFSET = 8` 从 headless 共享导出，各组件的 `<C>_DEFAULT_PLACEMENT` 改为引用它们（tooltip / hover-card / popover / popconfirm / popselect 新增导出常量），所有机器显式传 offset，不再隐式靠引擎兜底；`check-overlay-defaults` 守住。

  **层级覆盖槽齐全、后缀统一。** 22 个浮层族的 positioner / backdrop、toaster、navigation-menu 面板都有了 `--xh-<c>-layer` 槽（缺省仍是 `--xh-layer-*`）；tour / table / heatmap 的 `-z` 后缀槽改名 `-layer`（7 个，公开面变更，基线已推）。

  **进退场对称。** toast 退场位移从 distance-sm 改 distance-md（与进场、与 dialog 一致）；tour 的气泡改用 pop 族，聚光灯补退场；side-nav 折叠态弹出面板补进退场并在 Vue / WC 接上退场租约。

  **navigation-menu 的定位登记变成可验证的。** 三道浮层门禁此前按「anatomy 有 positioner」发现族，它从没被检查过；现在 `SKIN_POSITIONED` 名单要求它没有 positioner、不接引擎、面板由皮肤 absolute 排布，任一条不成立即红。`check-arrow-geometry` 增比对 JS 箭头常量（8·√2 / 8）与令牌（8px 边长 / 8px 圆角）。

## 1.0.0-alpha.2

### Minor Changes

- 466f143: 新增两个包：`@xihan-ui/motion` 收动效原语，`@xihan-ui/animations` 收现成的动效。

  动效的东西原先散在三处：缓动表与减弱动效探测在 `behavior`，补间与帧循环在 `headless/src/shared`，两套缓动的档名和值还对不上。`@xihan-ui/motion` 把它们收成一处，并补上真正缺的两样——解析解弹簧与 Web Animations 的薄封装。缓动从此只有一份来源：CSS 侧的 cubic-bezier 串与 JS 侧的采样函数同名同源。弹簧按阻尼比分三支算沉降时长，与 dt=0.1ms 的四阶龙格-库塔积分逐点对拍。减弱动效在系统偏好之上叠了一层应用级 override，接得上产品自己的"减弱动效"设置项。

  `behavior` 与 `headless` 原样重新导出搬走的名字，公开面一个没少。

  `@xihan-ui/animations` 是建在上面的效果层：11 个进场预设、6 个注意预设、错开起播与文字拆分。一段动画是一份可 JSON 序列化的配方，能存进数据库、由界面下拉切换。减弱动效的降级由 `motion` 统一兜住，这一层不另开通道——降级只影响中间帧存不存在，不影响控制流。

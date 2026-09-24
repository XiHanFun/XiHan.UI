# @xihan-ui/backgrounds

## 2.1.0

### Patch Changes

- Updated dependencies [1e7bc1d]
- Updated dependencies [abd9e8c]
  - @xihan-ui/core@2.1.0
  - @xihan-ui/motion@2.1.0

## 2.0.0

### Major Changes

- c8790c8: **`@xihan-ui/kernel`、`@xihan-ui/machine`、`@xihan-ui/behavior` 三个包合并成 `@xihan-ui/core`。三个旧包名不再发布，也没有转发包。**

  三者原本是一条严格的链（`machine` 依赖 `kernel`，`behavior` 依赖 `kernel` 与 `motion`），从不单独安装：装了任意一个适配器就三个一起来。分成三个包对使用者没有取舍空间，只多出两份包名、两份版本号与两份 README。合并之后公开包从 18 个减到 16 个。

  **导出的名字一个都没有变。** 原先从三个包里导出的东西现在全部从 `@xihan-ui/core` 的主入口导出，签名与行为不变。两处例外：

  - `Dict` 本来就是结构原语那一段的类型，状态机那一段只是转手再导出一遍，现在只剩一处定义。
  - 锁步版本不一致那条诊断（`core.version-mismatch`）的 `detail` 字段由 `kernelVersion` 改名为 `coreVersion`，播报文案里的包名同步改口。读这条诊断做分流的要跟着改字段名。

  ## 包名怎么改

  | 从前                 | 现在             |
  | -------------------- | ---------------- |
  | `@xihan-ui/kernel`   | `@xihan-ui/core` |
  | `@xihan-ui/machine`  | `@xihan-ui/core` |
  | `@xihan-ui/behavior` | `@xihan-ui/core` |

  同一个文件里如果原来从两个或三个旧包各引一行，合并之后是同一个模块说明符，按自己的 lint 规则并成一行即可。

  ## 子路径怎么改

  子入口一条不少，名字原样平移：

  | 从前                          | 现在                        |
  | ----------------------------- | --------------------------- |
  | `@xihan-ui/kernel/metadata`   | `@xihan-ui/core/metadata`   |
  | `@xihan-ui/kernel/skin-check` | `@xihan-ui/core/skin-check` |
  | `@xihan-ui/kernel/vite`       | `@xihan-ui/core/vite`       |
  | `@xihan-ui/machine/vanilla`   | `@xihan-ui/core/vanilla`    |
  | `@xihan-ui/behavior/presence` | `@xihan-ui/core/presence`   |

  ## 依赖怎么改

  `package.json` 里把三个旧包名删掉，换成一条 `@xihan-ui/core`。装适配器的使用者不用动：`@xihan-ui/vue` 与 `@xihan-ui/web-components` 已经改成依赖 `@xihan-ui/core`，升级适配器就一并带过来。

### Patch Changes

- Updated dependencies [317b582]
- Updated dependencies [bdf4028]
- Updated dependencies [c7966d3]
- Updated dependencies [9658294]
- Updated dependencies [f070bb8]
- Updated dependencies [249819e]
- Updated dependencies [589d192]
- Updated dependencies [7e512dc]
- Updated dependencies [09a1a45]
- Updated dependencies [2dd6293]
- Updated dependencies [d822ffd]
- Updated dependencies [3116bd3]
- Updated dependencies [b23b40a]
- Updated dependencies [19570ad]
- Updated dependencies [f0a2e34]
- Updated dependencies [19570ad]
- Updated dependencies [ce5d75a]
- Updated dependencies [d5576cb]
- Updated dependencies [9bf22c1]
- Updated dependencies [147daa4]
- Updated dependencies [ffe0797]
- Updated dependencies [add5b79]
- Updated dependencies [1540cc1]
- Updated dependencies [8b4d452]
- Updated dependencies [5982974]
- Updated dependencies [3577e4c]
- Updated dependencies [ab984e8]
- Updated dependencies [7640d5c]
- Updated dependencies [8e8d953]
- Updated dependencies [21b006a]
- Updated dependencies [bd67168]
- Updated dependencies [48d6b88]
- Updated dependencies [0d35f1a]
- Updated dependencies [ed347e1]
- Updated dependencies [db52f9b]
- Updated dependencies [1042c06]
- Updated dependencies [c8790c8]
- Updated dependencies [3f9c145]
- Updated dependencies [1f472ba]
- Updated dependencies [fc0ecaf]
- Updated dependencies [963fe2c]
- Updated dependencies [eabcc37]
- Updated dependencies [07e29f9]
- Updated dependencies [c544218]
- Updated dependencies [b991bb5]
- Updated dependencies [ff3593c]
- Updated dependencies [95ebc66]
- Updated dependencies [4babe65]
- Updated dependencies [80e6fdf]
- Updated dependencies [f45e0f7]
- Updated dependencies [5397ae3]
- Updated dependencies [82b5de5]
- Updated dependencies [842da07]
- Updated dependencies [a15f0f3]
- Updated dependencies [7f77bdd]
- Updated dependencies [00bca80]
- Updated dependencies [30a811b]
- Updated dependencies [d366e45]
- Updated dependencies [9c32ad7]
- Updated dependencies [dc64383]
- Updated dependencies [33c6805]
  - @xihan-ui/motion@2.0.0
  - @xihan-ui/core@2.0.0

## 1.1.0

### Patch Changes

- Updated dependencies [5b62d15]
- Updated dependencies [03fb633]
  - @xihan-ui/behavior@1.1.0
  - @xihan-ui/kernel@1.1.0
  - @xihan-ui/motion@1.1.0

## 1.0.0

### Major Changes

- 46b82b0: 新增视觉层：WebGL2 背景效果与数据驱动粒子点云，框架无关、零第三方依赖。

  一张画面两个绘制通道——流场跑片元着色器，粒子走 `gl.POINTS`。粒子有程序化与点云两种来源：
  前者位置由粒子序号在顶点着色器里实时算出，不占顶点缓冲也不需要 CPU 逐帧更新；后者位置来自
  顶点缓冲，两份点云之间自动形变。两个通道共用同一段 GLSL，粒子因此能精确落在流场的特征位置上。

  内置 14 个效果（fluid / glass / mesh / grain / plasma / aurora / beam / ripple / orb / wave /
  starfield / nebula / flow-field / particles）。每个效果只声明一次参数规格，取默认值、钳制越界、
  生成调参界面三件事都从它推出来。

  图片、文字、SVG、参数方程统一采样成 `PointCloud`，「换形态」就是换一份点云。

  不支持 WebGL2 时降级成 CSS 静态背景，接口保持一致。

### Patch Changes

- 3469066: 官网作为第一个真实消费方落地时暴露的四条问题，全部改代码，文档随后如实描述。

  **背景层不再压掉宿主用类名写的定位。** `createBackgroundSurface` 原先在建面时就无条件量一次宿主定位，
  量到 `static`（或算不出来的空串）就写一句内联 `position: relative`。而 Vue 的函数式 ref 在元素进文档
  之前触发，此时 `getComputedStyle` 什么都算不出，于是这一句必写——内联样式压过任何层里的规则，
  宿主用类名写的 `position: absolute` 从此再也赢不回来，塌成高度 0，画布跟着 100% × 0，
  不报错、不告警、什么都不画。

  改为：宿主自带定位（内联或类名）一个字不动；量出来是 `static` 才写兜底；**还没进文档时既不写定位、
  也不挂画布**——不在文档树里的画布逃不到别的祖先上，那句投机性写入因此整个不必发生。
  宿主进文档拿到盒子的那一刻由 `ResizeObserver` 定夺，销毁时撤销观察。
  没有 `ResizeObserver` 的环境退回原行为。

  **未注册的内置效果名，错误信息不再给行不通的建议。** 原先一律指向 `registerEffect()`，可它收的是
  效果对象不是名字，照着写连类型都不过，也不提示这个效果本就在包里、导出名叫什么。
  现在内置名单独给一条，点名 `registerBuiltinEffects()` / `registerEffects([xxxEffect])` 与直接传对象三条路。
  内置效果仍然不自动注册——注册表一旦静态引上这 14 个，每个用到 `createBackgroundSurface` 的应用都要
  多吃约 35 kB（gzip 约 8.6 kB），占整包四成。新增 `BUILTIN_EFFECT_NAMES` 纯字符串清单供校验用。

  **`TabsVariant` 补上 `line`。** 文档一直写「line / card / segment，缺省是 line」，类型里却只有两档，
  使用者自然写下的 `variant="line"` 编译不过。line 是缺省档、皮肤里没有它的选择器，
  显式写与不写渲染逐值相同。

  **`tokens.css` 自带完整层序声明。** 级联层的顺序由首次声明定死，而 `tokens.css` 原先只有
  `@layer xihan.tokens { }` 取值块。先引令牌再引皮肤（此前文档推荐的顺序）会让 `xihan.tokens`
  抢在 `xihan.reset` 前面注册，实际层序与 `layers.css` 声明的不符。现在两份入口各自带一份逐字相同的
  完整声明，谁先被引到层序都成立；重复声明幂等。新增 `check-layer-order` 门禁盯住两份不许漂移，
  `pnpm gate` 由十五项变十六项。

- 8d35702: 动效与浮层口径收口。

  **减弱动效只剩一条通道。** 此前 kernel 的 `RuntimeConfig.reducedMotion` 只读系统 matchMedia、motion 包的 `setMotionOverride` 只有 animate / 滚动 / 数字动画在听，presence 与 stick-to-bottom 感知不到应用级覆盖；无 matchMedia 的宿主两包还给出相反答案（kernel 直接抛 TypeError、motion 报 reduce）。现在 kernel 依赖 motion，`reducedMotion` 缺省即 `resolveMotionPreference() === 'reduce'`（覆盖 ?? 系统偏好），没有 matchMedia 一律不减弱；glyph 转圈、backgrounds、滚动、数字动画全部走同一函数。CSS 侧 `tokens.css` 新增 `:where([data-motion='reduce'])` 块，与 `@media (prefers-reduced-motion: reduce)` 同源生成、逐条相同——作者把 `data-motion="reduce"` 打在任意容器即局部减弱。全局配置加 `motion?: 'reduce' | 'no-preference'`，Vue `provideXhConfig` / WC `<xh-config motion>` 收到即调 `setMotionOverride`。

  **缓动与时长的真源是令牌。** motion 包新增 `durations = { fast, normal, slow }`，`animate()` 缺省与 `@xihan-ui/animations` 的缺省时长都引它；`check-motion-source` 比对 primitive.json 与 easing.ts / durations.ts，值不等即红；`check-reduced-motion-channel` 禁止 motion 包之外再出现 `matchMedia('(prefers-reduced-motion')`。

  **皮肤的 reduce 块归口。** 只在两种情况自写：无限循环动画要整个停掉、有使用者时长槽的过渡要兜住穿透。image-viewer / side-nav / layout 三份纯重复令牌层的块删掉；table 的 `0.01ms !important` 改 `animation: none`；保留的 10 份每块配一份等价的 `[data-motion='reduce']` 规则。animation / transition 不再直引 `--xh-duration-*` 原语：spinner 走 `--xh-spin-duration`，skeleton 走新令牌 `--xh-shimmer-duration`（1600ms）。`check-infinite-motion` / `check-motion-primitives` 守住。

  **浮层的 placement / offset 默认值只有两种语义。** `OVERLAY_PLACEMENT_ANCHORED = 'bottom'`（气泡类）与 `OVERLAY_PLACEMENT_LIST = 'bottom-start'`（列表类）、`OVERLAY_OFFSET = 8` 从 headless 共享导出，各组件的 `<C>_DEFAULT_PLACEMENT` 改为引用它们（tooltip / hover-card / popover / popconfirm / popselect 新增导出常量），所有机器显式传 offset，不再隐式靠引擎兜底；`check-overlay-defaults` 守住。

  **层级覆盖槽齐全、后缀统一。** 22 个浮层族的 positioner / backdrop、toaster、navigation-menu 面板都有了 `--xh-<c>-layer` 槽（缺省仍是 `--xh-layer-*`）；tour / table / heatmap 的 `-z` 后缀槽改名 `-layer`（7 个，公开面变更，基线已推）。

  **进退场对称。** toast 退场位移从 distance-sm 改 distance-md（与进场、与 dialog 一致）；tour 的气泡改用 pop 族，聚光灯补退场；side-nav 折叠态弹出面板补进退场并在 Vue / WC 接上退场租约。

  **navigation-menu 的定位登记变成可验证的。** 三道浮层门禁此前按「anatomy 有 positioner」发现族，它从没被检查过；现在 `SKIN_POSITIONED` 名单要求它没有 positioner、不接引擎、面板由皮肤 absolute 排布，任一条不成立即红。`check-arrow-geometry` 增比对 JS 箭头常量（8·√2 / 8）与令牌（8px 边长 / 8px 圆角）。

- Updated dependencies [e73b671]
- Updated dependencies [d0202b2]
- Updated dependencies [7da1272]
- Updated dependencies [bc65cb7]
- Updated dependencies [e50a7c9]
- Updated dependencies [ed01a81]
- Updated dependencies [84b1aa3]
- Updated dependencies [a321a50]
- Updated dependencies
- Updated dependencies [8d35702]
- Updated dependencies [239eb5d]
- Updated dependencies [89d8c54]
- Updated dependencies [516bd46]
- Updated dependencies [466f143]
- Updated dependencies [24721f4]
- Updated dependencies [9548330]
- Updated dependencies [7a5d898]
- Updated dependencies [4b949c2]
  - @xihan-ui/kernel@1.0.0
  - @xihan-ui/behavior@1.0.0
  - @xihan-ui/motion@1.0.0

## 1.0.0-preview.0

### Patch Changes

- Updated dependencies [e73b671]
  - @xihan-ui/kernel@1.0.0-preview.0
  - @xihan-ui/behavior@1.0.0-preview.0
  - @xihan-ui/motion@1.0.0-preview.0

## 1.0.0-alpha.3

### Patch Changes

- 8d35702: 动效与浮层口径收口。

  **减弱动效只剩一条通道。** 此前 kernel 的 `RuntimeConfig.reducedMotion` 只读系统 matchMedia、motion 包的 `setMotionOverride` 只有 animate / 滚动 / 数字动画在听，presence 与 stick-to-bottom 感知不到应用级覆盖；无 matchMedia 的宿主两包还给出相反答案（kernel 直接抛 TypeError、motion 报 reduce）。现在 kernel 依赖 motion，`reducedMotion` 缺省即 `resolveMotionPreference() === 'reduce'`（覆盖 ?? 系统偏好），没有 matchMedia 一律不减弱；glyph 转圈、backgrounds、滚动、数字动画全部走同一函数。CSS 侧 `tokens.css` 新增 `:where([data-motion='reduce'])` 块，与 `@media (prefers-reduced-motion: reduce)` 同源生成、逐条相同——作者把 `data-motion="reduce"` 打在任意容器即局部减弱。全局配置加 `motion?: 'reduce' | 'no-preference'`，Vue `provideXhConfig` / WC `<xh-config motion>` 收到即调 `setMotionOverride`。

  **缓动与时长的真源是令牌。** motion 包新增 `durations = { fast, normal, slow }`，`animate()` 缺省与 `@xihan-ui/animations` 的缺省时长都引它；`check-motion-source` 比对 primitive.json 与 easing.ts / durations.ts，值不等即红；`check-reduced-motion-channel` 禁止 motion 包之外再出现 `matchMedia('(prefers-reduced-motion')`。

  **皮肤的 reduce 块归口。** 只在两种情况自写：无限循环动画要整个停掉、有使用者时长槽的过渡要兜住穿透。image-viewer / side-nav / layout 三份纯重复令牌层的块删掉；table 的 `0.01ms !important` 改 `animation: none`；保留的 10 份每块配一份等价的 `[data-motion='reduce']` 规则。animation / transition 不再直引 `--xh-duration-*` 原语：spinner 走 `--xh-spin-duration`，skeleton 走新令牌 `--xh-shimmer-duration`（1600ms）。`check-infinite-motion` / `check-motion-primitives` 守住。

  **浮层的 placement / offset 默认值只有两种语义。** `OVERLAY_PLACEMENT_ANCHORED = 'bottom'`（气泡类）与 `OVERLAY_PLACEMENT_LIST = 'bottom-start'`（列表类）、`OVERLAY_OFFSET = 8` 从 headless 共享导出，各组件的 `<C>_DEFAULT_PLACEMENT` 改为引用它们（tooltip / hover-card / popover / popconfirm / popselect 新增导出常量），所有机器显式传 offset，不再隐式靠引擎兜底；`check-overlay-defaults` 守住。

  **层级覆盖槽齐全、后缀统一。** 22 个浮层族的 positioner / backdrop、toaster、navigation-menu 面板都有了 `--xh-<c>-layer` 槽（缺省仍是 `--xh-layer-*`）；tour / table / heatmap 的 `-z` 后缀槽改名 `-layer`（7 个，公开面变更，基线已推）。

  **进退场对称。** toast 退场位移从 distance-sm 改 distance-md（与进场、与 dialog 一致）；tour 的气泡改用 pop 族，聚光灯补退场；side-nav 折叠态弹出面板补进退场并在 Vue / WC 接上退场租约。

  **navigation-menu 的定位登记变成可验证的。** 三道浮层门禁此前按「anatomy 有 positioner」发现族，它从没被检查过；现在 `SKIN_POSITIONED` 名单要求它没有 positioner、不接引擎、面板由皮肤 absolute 排布，任一条不成立即红。`check-arrow-geometry` 增比对 JS 箭头常量（8·√2 / 8）与令牌（8px 边长 / 8px 圆角）。

- Updated dependencies [d0202b2]
- Updated dependencies [7da1272]
- Updated dependencies [ed01a81]
- Updated dependencies [a321a50]
- Updated dependencies [8d35702]
- Updated dependencies [516bd46]
- Updated dependencies [9548330]
  - @xihan-ui/kernel@1.0.0-alpha.3
  - @xihan-ui/motion@1.0.0-alpha.3
  - @xihan-ui/behavior@1.0.0-alpha.3

## 1.0.0-alpha.2

### Patch Changes

- 3469066: 官网作为第一个真实消费方落地时暴露的四条问题，全部改代码，文档随后如实描述。

  **背景层不再压掉宿主用类名写的定位。** `createBackgroundSurface` 原先在建面时就无条件量一次宿主定位，
  量到 `static`（或算不出来的空串）就写一句内联 `position: relative`。而 Vue 的函数式 ref 在元素进文档
  之前触发，此时 `getComputedStyle` 什么都算不出，于是这一句必写——内联样式压过任何层里的规则，
  宿主用类名写的 `position: absolute` 从此再也赢不回来，塌成高度 0，画布跟着 100% × 0，
  不报错、不告警、什么都不画。

  改为：宿主自带定位（内联或类名）一个字不动；量出来是 `static` 才写兜底；**还没进文档时既不写定位、
  也不挂画布**——不在文档树里的画布逃不到别的祖先上，那句投机性写入因此整个不必发生。
  宿主进文档拿到盒子的那一刻由 `ResizeObserver` 定夺，销毁时撤销观察。
  没有 `ResizeObserver` 的环境退回原行为。

  **未注册的内置效果名，错误信息不再给行不通的建议。** 原先一律指向 `registerEffect()`，可它收的是
  效果对象不是名字，照着写连类型都不过，也不提示这个效果本就在包里、导出名叫什么。
  现在内置名单独给一条，点名 `registerBuiltinEffects()` / `registerEffects([xxxEffect])` 与直接传对象三条路。
  内置效果仍然不自动注册——注册表一旦静态引上这 14 个，每个用到 `createBackgroundSurface` 的应用都要
  多吃约 35 kB（gzip 约 8.6 kB），占整包四成。新增 `BUILTIN_EFFECT_NAMES` 纯字符串清单供校验用。

  **`TabsVariant` 补上 `line`。** 文档一直写「line / card / segment，缺省是 line」，类型里却只有两档，
  使用者自然写下的 `variant="line"` 编译不过。line 是缺省档、皮肤里没有它的选择器，
  显式写与不写渲染逐值相同。

  **`tokens.css` 自带完整层序声明。** 级联层的顺序由首次声明定死，而 `tokens.css` 原先只有
  `@layer xihan.tokens { }` 取值块。先引令牌再引皮肤（此前文档推荐的顺序）会让 `xihan.tokens`
  抢在 `xihan.reset` 前面注册，实际层序与 `layers.css` 声明的不符。现在两份入口各自带一份逐字相同的
  完整声明，谁先被引到层序都成立；重复声明幂等。新增 `check-layer-order` 门禁盯住两份不许漂移，
  `pnpm gate` 由十五项变十六项。

- Updated dependencies [466f143]
- Updated dependencies [7a5d898]
  - @xihan-ui/behavior@1.0.0-alpha.2
  - @xihan-ui/kernel@1.0.0-alpha.2

## 1.0.0-alpha.1

### Patch Changes

- Updated dependencies [e50a7c9]
- Updated dependencies [239eb5d]
- Updated dependencies [89d8c54]
- Updated dependencies [24721f4]
- Updated dependencies [4b949c2]
  - @xihan-ui/behavior@1.0.0-alpha.1
  - @xihan-ui/kernel@1.0.0-alpha.1

## 1.0.0-alpha.0

### Major Changes

- 46b82b0: 新增视觉层：WebGL2 背景效果与数据驱动粒子点云，框架无关、零第三方依赖。

  一张画面两个绘制通道——流场跑片元着色器，粒子走 `gl.POINTS`。粒子有程序化与点云两种来源：
  前者位置由粒子序号在顶点着色器里实时算出，不占顶点缓冲也不需要 CPU 逐帧更新；后者位置来自
  顶点缓冲，两份点云之间自动形变。两个通道共用同一段 GLSL，粒子因此能精确落在流场的特征位置上。

  内置 14 个效果（fluid / glass / mesh / grain / plasma / aurora / beam / ripple / orb / wave /
  starfield / nebula / flow-field / particles）。每个效果只声明一次参数规格，取默认值、钳制越界、
  生成调参界面三件事都从它推出来。

  图片、文字、SVG、参数方程统一采样成 `PointCloud`，「换形态」就是换一份点云。

  不支持 WebGL2 时降级成 CSS 静态背景，接口保持一致。

### Patch Changes

- Updated dependencies [bc65cb7]
- Updated dependencies [84b1aa3]
  - @xihan-ui/kernel@1.0.0-alpha.0
  - @xihan-ui/behavior@1.0.0-alpha.0

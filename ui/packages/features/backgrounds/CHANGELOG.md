# @xihan-ui/backgrounds

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

# 版本与兼容性政策

这一页回答一个问题：**升级到下一个 `1.x` 小版本，我依赖的东西会不会变。**

XiHan.UI 的公开面横跨五种介质，因为「丢掉自带皮肤自己写一套」「手写 Light DOM 结构」都是被 [皮肤与样式分层](./styling) 和 [解剖与部件契约](./anatomy) 公开教过的用法：

| 介质 | 使用者写在哪里 | 例子 |
| --- | --- | --- |
| JS / TS 导出 | 自己的源码 | `import { XhSelectRoot } from '@xihan-ui/vue'` |
| 解剖属性 | CSS 选择器 | `[data-scope='select'][data-part='trigger']` |
| `data-*` 状态属性 | CSS 选择器 | `[data-state='open']`、`[data-tone='danger']` |
| CSS 自定义属性与 `@layer` 名 | 自己的样式表 | `--xh-bg-brand`、`@layer xihan.overrides` |
| 自定义元素标签与 attribute | 自己的 HTML | `<xh-dialog modal="true">`、`data-xh-part="content"` |

破坏其中任何一种，都不会有编译错误、不会有运行时异常、也不会有降级——只会是「样式没了」或「按钮不响应」。所以这一页对五种介质**逐类**给出结论，不留空白。

::: warning 1.0.0 之前不适用
`1.0.0-alpha.*` / `1.0.0-beta.*` 阶段的任何改动都不受本页约束，包括删除导出、改属性名、收窄类型。本页的全部条款从 `1.0.0` 正式版那一刻起生效。
:::

## 三个档位

| 档位 | 含义 |
| --- | --- |
| **受约束** | 改名、删除、收窄语义 = major。新增同类成员 = minor。 |
| **只增不减** | 只保证「已经有的不会消失、不会改名」。往里加字段、加条目不算破坏。 |
| **排除** | 明确不在承诺内，任何版本都可能改。使用者不应依赖。 |

版本号本身走标准语义化版本：`major.minor.patch`。受约束的东西改了走 major，新增走 minor，只修行为不改名字走 patch。

## 17 个包必须同版本安装

17 个包锁步发布：任何一个包发新版本，全部 17 个包一起发同一个号。

```
@xihan-ui/kernel   @xihan-ui/machine        @xihan-ui/behavior
@xihan-ui/position @xihan-ui/tokens         @xihan-ui/styles
@xihan-ui/headless @xihan-ui/icons          @xihan-ui/vue
@xihan-ui/web-components  @xihan-ui/chat-stream
@xihan-ui/markdown @xihan-ui/code-highlight @xihan-ui/backgrounds
@xihan-ui/sound    @xihan-ui/motion         @xihan-ui/animations
```

两条后果，都要知道：

- **某个包的 major 可能不含任何针对它自己的变更。** `@xihan-ui/markdown` 升到 `2.0.0` 完全可能只是因为 `@xihan-ui/vue` 改了一个 prop。判断某次 major 影响到你没有，看 [更新日志](../changelog) 的分类条目，不要看版本号跨度。
- **不要混装版本。** `@xihan-ui/vue` 与 `@xihan-ui/headless` 版本不一致时，类型会对不上；`@xihan-ui/web-components` 更硬——同一个 `xh-` 标签被两个版本注册会直接抛错，整页挂掉。适配器与它的兄弟包目前是普通 `dependencies`，包管理器不会阻止你装出这种组合，所以这一条靠你自己保证（见[仍然只靠自觉的](#仍然只靠自觉的)）。

---

## 一、JS / TS 导出面

17 个包中 16 个出 JS，共 25 个带类型的入口。

### 受约束

| 类别 | 数量 | 说明 |
| --- | --- | --- |
| 包名 | 14 | 把代码从一个包挪到另一个包 = major |
| `exports` 子路径 | 19 个 JS 入口 | 如 `@xihan-ui/vue/backgrounds`、`@xihan-ui/web-components/define`。没有 `./*` 通配，深路径引用（`.../dist/xxx.js`）被 Node 与打包器一并挡住，那些路径不是 API |
| Vue 组件导出 `Xh*` | 614（104 个家族） | `XhButton`、`XhSelectRoot`、`XhSelectItemIndicator` |
| Vue 组合式函数 `use<家族>` | 72 | `useSelect`、`useCombobox`。这是「不用我的部件、自己写标记」的唯一入口 |
| Vue 指令 | 1 | `vBackground`（在 `@xihan-ui/vue/backgrounds` 子入口，依赖可选 peer） |
| 无头内核 `connect*` | 102 | `connectAccordion` 及其参数顺序、返回的 getter 名 |
| 无头内核 `*Machine` | 68 | 机器 schema 的形状 |
| 类型 `*Props` / `*Api` / `*ChangeDetails` / `*Schema` | 106 / 103 / 106 / 68 | 删字段、改字段名、把可选改必填都是 major |
| Vue prop 名与「没传」语义 | 255 个不同名字 / 958 处声明 | 见下方专条 |
| Vue emit 名集合 | 67 个不同名字 / 192 处 | 名字本身受约束（列在 `emits` 里的事件不走 `$attrs` 透传，删名字会静默改变行为） |
| Vue 插槽名 | 7 | `default`、`item`、`label`、`trigger`、`panel`、`content`、`empty` |

::: tip Vue prop 的「没传」也是契约
`disabled` 写成裸 `Boolean`（不传恒为 `false`）还是 `{ type: Boolean, default: undefined }`（不传交给底层机器决定），在类型上几乎看不出差别，但决定了你不写这个 prop 时组件怎么表现。仓库里 157 处裸 `Boolean`、108 处三态、8 处 `default: true`、1 处显式 `default: false`。**把某个 prop 从一种改成另一种是 major**，即使名字和类型都没动。
:::

### 只增不减

| 类别 | 数量 | 说明 |
| --- | --- | --- |
| Vue 上下文类型 `*Context` / `*Callbacks` | 92 | 用于给透传的 `api` 标注类型。**只保证可读，不保证可构造**——往里加可选字段不算破坏，所以别写 `const c: SelectContext = { … }` 这种字面量赋值 |
| `custom-elements.json`（CEM） | 1 份 / 104 个元素 | 已经进过清单的 `tagName` / `attribute` / `event` 条目不会消失；`cssProperties`（皮肤覆盖槽）与 `events` 的 `type`（detail 类型）由 `scripts/enrich-cem.mjs` 从皮肤与元素源码生成，`gate:cem` 校验同步。字段结构细节仍不承诺，补充算 minor |

### 排除

| 类别 | 数量 | 为什么排除是安全的 |
| --- | --- | --- |
| `@xihan-ui/headless` 的内部算子与常量 | 423 | `clampRating`、`buildMonthGrid`、`colorPickerHexToRgba`、`CAROUSEL_AUTOPLAY_INTERVAL` 这类。它们是内核实现的一部分，改一次实现就得改一次签名。你需要的默认值应当从组件 props 的文档默认值读，不要 import 一个常量再自己比对 |
| `@xihan-ui/headless` 的内部伴生类型 | 163 | `*Refs`（机器持有的 DOM 引用袋）、`ColorPickerHsva`、`CascaderLevel` 等，是上面那批函数的参数与返回类型 |
| `xxxAnatomy` / `xxxMeta` / `xxxKeyboard` 三组导出对象 | 各 102 | **它们描述的 part 名单是受约束的（见第二节），但这三个对象本身的组织方式不是。** 想拿到部件名单，请以组件文档页的解剖表为准，不要 import 这些对象 |
| Vue 的 `provide*` / `use*Context` 函数 | 51 | [Vue 适配器](../adapters/vue) 早已写明「父子组件之间的 provide / inject 是内部实现，不对外开放」。要下探请用 `use<家族>()` |
| Vue 的 `useTimelineItem` | 1 | 名字看着像组合式函数，实际是 inject 管道，与上一行同类 |
| 适配器运行时底座 | Vue 3 个、WC 8 个 | `createVueRuntime` / `createVueIdGenerator` / `vueNormalize`；`createLitRuntime` / `createSpreader` / `defineElement` / `discoverParts` / `wcNormalize` / `MachineController` 等。这些是适配器与内核之间的接缝，签名依赖的类型没有从同一个包导出，实际也写不出调用 |
| WC 的元素类导出 `Xh*Element` | 70 | 只作 `instanceof` 与手动 `customElements.define` 的便利品，**不支持 `extends`**（基类不导出、`wire()` 是 protected abstract）。要拿元素请用 `document.querySelector` |
| WC 元素上的 `static partContract` | 102 | 部件校验的输入数据，实现细节 |
| `dist/` 内部文件名 | — | `element-Bx4xCiT2.js` 这类打包 chunk 每次构建都可能变，永远不要 deep import |
| `.d.ts` 的文件布局 | — | 类型从包入口拿，不要引具体 `.d.ts` 路径 |
| `ui/tooling/`、`ui/apps/playground-*` | — | 不发布 |

---

## 二、解剖属性（`data-scope` / `data-part`）

这是换皮肤时最核心的一组名字，也是 WC 使用者手写 HTML 时要打的字符串。

| 类别 | 数量 | 档位 |
| --- | --- | --- |
| `data-scope` 取值（组件身份） | 102 | **受约束**（新增第 103 个组件是 minor） |
| `data-part` 取值（部件名） | 154 个不同名字 / 569 条「组件 × 部件」配对 | **受约束** |
| `data-xh-part`（WC 作者书写的角色声明） | 属性名 1 个，取值即上面 154 个 | **受约束** |
| `meta.requiredParts`（必备部件） | 213 条 | **只增不减**，方向见下 |

`data-scope` 的取值与三处完全同名，不做任何转换：headless 目录名、自定义元素标签 `xh-<scope>`、皮肤文件 `<scope>.css`。改一个就是四处同时破坏。

::: warning `data-xh-part` 是 `data-xh-` 前缀里唯一的例外
其余 `data-xh-*` 属性（`data-xh-layer`、`data-xh-focus-guard`、`data-xh-scroll-shard` 等 8 个）是库自用标记，**排除**在承诺之外。但 `data-xh-part` 不是——它是 Web Components 适配器唯一的作者输入 API：你写 `data-xh-part="trigger"` 是**声明**，元素接线后往同一节点打上 `data-scope` + `data-part` 是**事实**。皮肤匹配后者，你永远不该手写后者。
:::

### requiredParts 的方向是反的

往 `requiredParts` 里**加**一条是收紧：昨天能跑的 Light DOM，今天开始在 [诊断通道](./diagnostics) 报 `wc.missing-part`。规则：

- 删条目：任何版本都可以。
- 加条目：允许在 minor 里做，但新加的必备部件在整整一个 major 周期内只以 `warn` 级别报出，到下一个 major 才升 `error`。

---

## 三、`data-*` 状态属性

`connect` 一共产出 119 个不同的 `data-*` 属性名、554 条「组件 × 属性」配对。分两类。

### 受约束

**行为契约**——这些不是样式钩子，删掉会让功能静默失效：

| 属性 | 作用 |
| --- | --- |
| `data-value` | 集合型组件的条目值。行为层按它反查节点做方向键导航，WC 使用者要手写在 `item` 节点上。删掉它，所有集合型组件的键盘导航静默失效 |
| `data-name` | 表单字段名（`form`） |
| `data-index` | 条目序号（0 基） |

**样式钩子**——自带皮肤自己就消费了 78 个属性名 / 471 条配对，第三方皮肤照着抄的就是这一组：

| 属性 | 覆盖组件数 |
| --- | --- |
| `data-state` | 55 |
| `data-size` | 57 |
| `data-disabled` | 53 |
| `data-tone` | 44 |
| `data-placement` | 22（浮层族） |
| `data-invalid` | 18 |
| `data-highlighted` | 15 |
| `data-orientation` / `data-side` / `data-align` / `data-selected` / `data-checked` / `data-readonly` … | 其余 |
| `data-cols-sm` / `-md` / `-lg` / `-xl` | 仅 `grid`，断点分档名受约束 |

**取值也受约束。** 属性名改了会打碎皮肤，取值改了同样打碎、而且更隐蔽——`[data-state='open']` 在取值改成 `expanded` 之后仍然是合法 CSS，只是永远不匹配。自带皮肤当前用到的 22 个 `data-state` 取值全部受约束：

```
open  closed  checked  unchecked  indeterminate  some  all  on  none
active  current  visible  ready  empty  invalid  error  collapsed
completed  finishing  dismissing  picking  copying
```

三条视觉轴的取值同理。`data-tone` 的合法值是 6 个，唯一真源是 `tone.css`：

```
brand  neutral  success  warning  danger  info
```

### 排除

其余 38 个 `data-*`（`data-lane`、`data-one-way`、`data-checked-count`、`data-sider-collapsed`、`data-file-size`、`data-modules` 等）——自带皮肤没有选中它们、组件文档页也没有记载它们。它们在 DOM 上存在，但不承诺稳定，随时可能改名或消失。要靠它们出样式，先在 issue 里提出来。

---

## 四、CSS 自定义属性与 `@layer`

### 受约束

| 类别 | 数量 | 说明 |
| --- | --- | --- |
| `@layer` 名与声明顺序 | 5 | `xihan.reset` → `xihan.tokens` → `xihan.motion` → `xihan.components` → `xihan.overrides`。改名、调序、增删中间层全是 major。`xihan.overrides` 是**故意留空的**，专门给你覆盖用，不会被「清理未使用的层」删掉 |
| 全局令牌 · 原语层 | 90 | `--xh-color-brand-500`、`--xh-space-4`、`--xh-radius-md`。皮肤里不该直接用它们，但接品牌轴必须写 `--xh-color-brand-*`，所以它们是公开的 |
| 全局令牌 · 语义层 | 83 | `--xh-bg-brand`、`--xh-fg-on-brand`、`--xh-control-h-md`、`--xh-shape-control`。主题定制的正门，见 [设计令牌与主题](./theme) |
| 组件覆盖槽 | 1861（覆盖 100 个组件） | `--xh-button-bg`、`--xh-button-h`、`--xh-dialog-max-w`。全部写成 `var(--xh-x-y, 默认值)` 形态，你在 `:root` 里设它就改了这个组件 |
| 语气轴槽 | 11 | `--xh-_tone`、`--xh-_tone-on`、`--xh-_tone-hover`、`--xh-_tone-subtle`、`--xh-_tone-border` 等。**这是自定义语气的唯一机制**——你写 `[data-tone='premium'] { --xh-_tone: gold; --xh-_tone-on: #000 }`，全库 45 份皮肤都会跟着走。虽然带下划线前缀，但按受约束处理 |
| 跨包内联属性 | 2 | `--xh-_ellipsis-lines`、`--xh-_float-button-offset`。由 headless 写进内联 `style`，皮肤必须读。**换整套皮肤时不读这两条，`ellipsis` 不截断、`float-button` 贴边，且不报任何错** |
| `@xihan-ui/styles` 的 CSS 子路径 | 111 | `.`、`./index.css`、`./index.unlayered.css`、`./layers.css`、`./tone.css` 与 108 条 `./<组件>.css` |
| `@xihan-ui/tokens` 的 CSS 子路径 | 2 | `./tokens.css`、`./tokens.json` |

### 排除

| 类别 | 数量 | 为什么安全 |
| --- | --- | --- |
| 其余 `--xh-_` 私有槽 | 331 | 皮肤内部的回退中转（`--xh-_bg`、`--xh-_bg-hover`、`--xh-_mention-py` 等），变体只改槽位不重写规则全靠它。不要在外面设它们 |
| 令牌的**取值** | — | `--xh-color-brand-500` 这个名字受约束，它等于哪一串 `oklch()` 不受约束。调色板会随视觉迭代动，这正是令牌存在的意义 |
| `index.unlayered.css` 的内部结构 | — | 它是生成的扁平镜像，**不带 `@layer`**。走这个入口就没有 `xihan.overrides` 这个覆盖槽位，层名承诺不适用 |

::: warning 命名前缀不能反推归属
`--xh-field-py` 长得像 `field` 组件的覆盖槽，实际是全局语义令牌，而且 `field.css` 自己都不用它。同理 `--xh-text-*`（全局文本令牌）与 `text-field` 的 27 条组件槽同前缀，`--xh-color-*`（原语调色板）与 `color-picker` 的 62 条组件槽同前缀。判断一条属性属于哪一档，看它在不在上表列的那 173 个全局令牌里，不要按前缀猜。
:::

---

## 五、自定义元素与 attribute

| 类别 | 数量 | 档位 |
| --- | --- | --- |
| 自定义元素标签 `xh-*` | 103（`defineXhElements()` 注册 102 + `xh-background`） | **受约束** |
| 注册函数 | 2（`defineXhElements`、`defineXhBackground`） | **受约束** |
| observed attribute | 752 条声明 / 216 个不同名字 | **受约束**（具体元素上的具体属性名） |
| attribute 名词汇表本身 | 216 | **只增不减**（新组件复用 `size` / `tone` / `dir` 不算破坏） |
| `CustomEvent` 名 | 46 个名字 / 115 条「元素 × 事件」 | **受约束** |
| 事件传播语义 | `bubbles: true, composed: true`（110 处中 109 处） | **受约束**——把冒泡改掉会让祖先节点上的事件委托静默失效 |
| 事件 `detail` 形状 | 106 个 `*Details` 类型 | **受约束**，等同于 headless 的同名类型 |
| `attribute: false` 的 JS 字段 | 90 条（涉及 39 个字段名） | **受约束**。`collection`、`translations`、`validate`、`filter` 这类只能用 JS 赋值，HTML 里表达不出来——**不是每个 property 都有对应 attribute** |
| 命令式方法 | 22（分布在 5 个元素） | **受约束**，含参数与返回类型 |

命令式方法全清单：

| 元素 | 方法 |
| --- | --- |
| `xh-form` | `setFieldValue` `setFieldError` `clearErrors` `submit` `reset` `getFieldId` `getFieldValue` `getFieldError` |
| `xh-toaster` | `create` `updateToast` `dismiss` `dismissAll` `getToastsByPlacement` |
| `xh-file-upload` | `openFilePicker` `setFiles` `addFiles` `deleteFile` `clearFiles` |
| `xh-virtualizer` | 3 个 |
| `xh-log` | `scrollToBottom` |

::: tip 布尔 attribute 是三态的
`modal="false"` 表示关，不写表示「交给组件决定」——这与原生 HTML 布尔属性（写了即为真）不同。把三态转换器换回原生语义是**不改名字的语义收窄**，按 major 处理。
:::

几条与包结构有关的事实，也在承诺内：

- 元素在 `@xihan-ui/web-components/define`，不在包主入口。`defineXhElements()` 是全有全无——调它就注册全部 104 个元素，没有逐个的 `defineXhButton()`。（补细粒度 define 是 minor；补完之后 `defineXhElements` 的「全量」语义就成了承诺。）
- `xh-background` 单独在 `@xihan-ui/web-components/backgrounds`，因为它依赖可选 peer。把它挪进 `./define` 会强制所有人装 WebGL 引擎，属于破坏性变更。
- 元素全部是 **Light DOM**，没有 shadow root，`::part()` 永远不生效。CEM 里的 `cssParts` 条目在本包读作 `data-xh-part`，不是 shadow part。

---

## 六、什么算破坏性变更

正例（= major）与反例（= minor / patch）对照，按介质各举几条。

### JS 导出

| 算破坏 | 不算破坏 |
| --- | --- |
| 删掉或改名任一 `Xh*` 组件（含 `XhTreeSelectBranchIndicator` 这种冷门部件） | 新增组件、新增部件 |
| `connectAccordion` 的返回值把 `getRootProps` 改成 `getProps` | 给 `connectAccordion` 加一个新的 getter |
| `SelectProps` 新增一个**必填**字段，或把可选字段改必填 | `SelectProps` 新增可选字段 |
| `SelectApi` 删掉一个 getter | `SelectContext` 加一个可选字段 |
| 把 `useSelect()` 的返回从 `ComputedRef<Api>` 换成别的容器 | 新增 `useXxx` |
| 把某个 prop 从裸 `Boolean` 改成 `default: undefined` | 给某个 prop 补文档 |
| 从某个组件的 `emits` 数组里删一个名字 | 往 `emits` 里加一个名字 |

### 解剖与 `data-*`

| 算破坏 | 不算破坏 |
| --- | --- |
| `data-part` 从 `indicator` 改成 `marker` | 给某个组件新增一个可选部件 |
| 把 `item-text` 改成 `itemText`（分词/大小写变化） | 皮肤内部改用别的选择器组合实现同样的视觉 |
| 某个组件不再输出 `data-size` / `data-tone` | 给某个组件补上原本没有的 `data-tone` |
| `data-state` 的取值从 `open` 改成 `expanded` | 新增一个 `data-state` 取值 |
| 把 `data-disabled` 从「存在即禁用」改成 `data-disabled="true"` | — |
| 删掉 `data-value` | 删掉 `data-lane`（在排除清单里） |

### CSS

| 算破坏 | 不算破坏 |
| --- | --- |
| `--xh-button-h` 改名成 `--xh-button-block-size` | 新增 `--xh-button-letter-spacing` |
| 删掉 `--xh-radius-xl`（哪怕库内部没人用它） | 把 `--xh-color-brand-500` 的 `oklch()` 值调深一点 |
| 把 `var(--xh-alert-px, …)` 改成直接写死语义令牌（等于取消这个覆盖点） | 给某条规则补 `@supports` 兜底 |
| 调整 `@layer` 声明顺序 | 在 `xihan.components` 里加规则 |
| 删掉 `./tone.css` 子路径 | 新增 `./<新组件>.css` 子路径 |

### 自定义元素

| 算破坏 | 不算破坏 |
| --- | --- |
| `xh-empty-state` 改名成 `xh-empty` | 新增 `xh-xxx` 元素 |
| 某元素的 `observedAttributes` 里少一条 | 给某元素新增 attribute |
| 把 `read-only` 改写成 `readonly` | 把某个 `attribute: false` 的字段反向暴露成 attribute |
| 事件名 `value-change` 改成 `change` | 新增事件名 |
| 把某个事件的 `bubbles` 改成 `false` | 补 `HTMLElementEventMap` 类型增强 |
| `xh-toaster.create()` 从返回 `string` 改成返回对象 | 给 `xh-form` 新增一个方法 |
| 把某个可选 part 提升为 `requiredParts` | 新增一个可选 part |

### 支持面

| 算破坏 | 不算破坏 |
| --- | --- |
| 抬高 Node 下限 | 降低 Node 下限 |
| 抬高浏览器硬底线（用一个无兜底的新 CSS 特性） | 加一个带退化路径的增强特性 |
| 收窄 `vue` peer 区间（加上限、抬下限） | 放宽 peer 区间 |
| 撤掉 ESM 导出条件 | 增加 CJS 导出条件 |

---

## 七、废弃流程

| 介质 | 怎么被看见 |
| --- | --- |
| JS / TS 导出 | 源码标 `@deprecated`，IDE 划删除线；类型上仍可用 |
| Vue prop / emit / 插槽 | 同上，另在组件文档页标注 |
| `data-*`、CSS 自定义属性、`@layer` 名、元素 attribute | 这四种介质**没有 IDE 提示**。废弃经更新日志的「废弃」小节告知，并在 dev 构建下经 [诊断通道](./diagnostics) 发 `warn`：把废弃名登记进 `@xihan-ui/kernel` 的废弃登记表（`registerDeprecation`），两个适配器 dev 里自动启动探测，消费方的旧用法会收到带迁移方向的诊断（机制已落地，登记表当前为空，发废弃时随 changeset 一起登记） |

保留期：**标记废弃后，至少保留到下一个 major，且不少于两个 minor 版本，取更长者。** 例如在 `1.3.0` 标废弃，最早也要等到 `2.0.0` 才能删；如果 `2.0.0` 紧跟在 `1.3.0` 之后发布，则顺延到 `1.5.0` 之后的那个 major。

废弃期间不改行为，只加提示。删除动作一律出现在 major 的更新日志顶部，单列一节。

---

## 八、支持面

收窄支持面按破坏性变更处理，放宽随时可以。

### 运行时

| 项 | 值 | 变更规则 |
| --- | --- | --- |
| Node（安装并运行本库） | **≥ 18** | 抬高 = major。产物实际用到的最高特性是 `Object.hasOwn`（Node 16.9），`>=18` 留了余量 |
| Node（开发本仓库） | ≥ 24，pnpm ≥ 11 | 与上面是两码事，随时可动 |
| 模块格式 | **ESM only** | 无 CJS、无 node10 解析条件。包里 `main` / `module` 字段存在但指向 ESM 文件，是给老式 bundler 的别名，**不代表可以 `require`** |
| 包管理器 | 无要求 | — |

### 浏览器

硬底线由三个**无兜底**的 CSS 特性决定：`@layer`（108/108 个样式文件都在用，不认它的解析器会丢弃整块）、`oklch()`（45 处，是唯一颜色来源）、`color-mix()`。

| 浏览器 | 硬底线 | 完整保真 |
| --- | --- | --- |
| Chrome / Edge | **111** | 111 |
| Firefox | **113** | 121（`:has()`） |
| Safari | **16.2** | 16.4 |

测试承诺：当前正式版，外加 Chromium 与 Safari 各往前两个大版本、Firefox ESR。硬底线只在 major 里抬高。

低于硬底线不会降级、会**无样式**——皮肤里刻意不写兜底值，令牌缺席是缺陷而不是降级。

可选增强层（不支持时按下表退化，加新的增强特性不算破坏，前提是退化路径一起加）：

| 特性 | Chrome | Firefox | Safari | 不支持时 |
| --- | --- | --- | --- | --- |
| `:has()` | 105 | 121 | 15.4 | 少量间距/gutter 微调失效 |
| `scrollbar-gutter` | 94 | 97 | 18.2 | 滚动条出现时轻微位移 |
| `dvh` / `svh` / `lvh` | 108 | 101 | 15.4 | 回落到 `vh` |
| `text-wrap: balance` | 114 | 121 | 17.5 | 标题按默认换行 |
| `light-dark()` | 123 | 120 | 17.5 | 代码块语法色退化成单色 |
| `field-sizing` | 123 | 152 | 26.2 | `composer` 输入框退化成固定行数 |

Web Components 侧不构成额外约束：全部 Light DOM，不用 shadow DOM、`ElementInternals`、`adoptedStyleSheets`，平台要求只到 Custom Elements v1。

### 宿主框架

| 包 | peer | 规则 |
| --- | --- | --- |
| `@xihan-ui/vue` | `vue: ^3.5.0` | 下限由 `useId` 决定（Vue 3.5 引入）。**收窄 = major，放宽 = minor** |
| `@xihan-ui/vue`、`@xihan-ui/web-components` | `@xihan-ui/backgrounds`（optional） | 不用背景效果就不必装 |
| `@xihan-ui/web-components` | 无 | 原生自定义元素，不要求任何框架 |
| 其余 11 个包 | 无 | — |

---

## 九、包的稳定性分级

锁步发版意味着版本号看不出稳定性，所以单列一张表。

### 稳定

破坏性变更只出现在 major，废弃走上面的流程。

| 包 | 说明 |
| --- | --- |
| `@xihan-ui/vue` | 614 个组件、111 个组合式函数 |
| `@xihan-ui/web-components` | 104 个自定义元素 |
| `@xihan-ui/headless` | `connect*` / `*Machine` / 各类公开类型；内部算子在排除清单里 |
| `@xihan-ui/styles` | 104 份组件皮肤、5 个层名 |
| `@xihan-ui/tokens` | 176 个令牌名 |
| `@xihan-ui/icons` | 图标集 |
| `@xihan-ui/kernel` | 只有被适配器与 headless 公开消费的那部分（`createAnatomy`、`createNormalizer`、归一化规则） |
| `@xihan-ui/machine` | 同上 |
| `@xihan-ui/behavior` | 同上，含 `data-value` 这条集合导航契约 |
| `@xihan-ui/position` | `createPositionEngine` 与它的选项；其余 9 个导出是内部算子 |

### 实验

**这四个包的破坏性变更可以出现在 minor 里。** 不适合放进不易升级的生产代码。

| 包 | 为什么还在动 |
| --- | --- |
| `@xihan-ui/code-highlight` | 承诺面是 `HighlighterPort` 这个端口，自研分词器（`tokenizeCode`、`langSpecOf`、`LangSpec`）随时可能整体换掉 |
| `@xihan-ui/markdown` | 公开面只有 `createStreamRenderer` 与它的三个类型；解析、切块、缓存的中间件随时会变 |
| `@xihan-ui/chat-stream` | AI 会话协议类型（`UIMessage`、`TextPart` 等）跟随上游生态演进 |
| `@xihan-ui/backgrounds` | 效果参数与点云 API 仍在调整；通用短名（`bool` / `num` / `str` / `rgb`）不是公开 API |

---

## 门禁兜住了什么

### 已经焊死的

**六种介质的「改名 = major」现在有门禁兜着。** `pnpm gate` 里的 `check-public-surface`
拿一份入库的基线（`ui/tooling/public-surface.json`，6665 个名字）比对当前状态：
**基线里有而当前没有，就是删了或改名了，构建失败**。新增一律放行，因为那是 minor。

覆盖：包名与 137 条子入口、3185 个导出名、104 个 `data-scope` 与 618 条部件配对、
104 个组件的 1021 个 prop 名、122 种 `data-*`、22 个 `data-state` 取值、176 个令牌、
5 个 `@layer` 名、1940 个组件覆盖槽、104 个自定义元素及其 attribute 与事件。

prop 名那一维是后补的：在它进来之前，改一个 prop 名（实测 `transfer` 的 `items` 改
`collection`、`splitter` 的 `size` 改 `sizes`）13 道门禁全程沉默。它的事实源是无头内核的
`<组件>Schema['props']`，两个适配器的 props 都照它铺。

它存在的理由可以复现：把 `switch` 的 `thumb` 改名 `knob`，其余 12 道门禁全部通过，
只有这一道拦下来；把 `switch` 的 `checked` 改名 `isChecked`，同样只有它报出
「组件 prop switch: checked」。删一个语义令牌、改一个组件覆盖槽名同理。

真要做破坏性变更时，跑 `pnpm surface:update` 推基线并在 changeset 里说清——
门禁拦的是「无意中删掉」，不是「有意的 major」。

**还有三道门禁把「只靠自觉」的条款焊成了机器检查。** `check-css-floor` 守着浏览器硬底线：
`.browserslistrc` 书面记录地板，拒绝名单拦住 `@container` 这类无兜底的抬底线特性，
`light-dark()` / `dvh` 必须带级联兜底。`check-version-lock` 守着 17 包锁步：任何一个
package.json 的 version 与其余不同，门禁直接失败。`check-wiring` 守着检查系统自身：新增的
check 脚本不接进 `pnpm gate` 就等于没写，死引用同样被拦下。

**三条视觉轴已收成联合类型**，`tone` / `size` / `variant` 不再是裸 `string`，
写错值编译期就报错。**Vue 事件载荷也有类型了**，69 个组件的 `emits` 改成对象式，
产物里 `(...args: any[]) => any` 从 188 处降到 0。

### 仍然只靠自觉的

下面这些**目前没有门禁**。列在这里，比假装什么都兜得住有用。

| 条款 | 现状 | 计划补的机制 |
| --- | --- | --- |
| Vue 作用域插槽载荷 | 带载荷的插槽已声明 `slots:` 选项，`check-slot-types` 门禁四条判据兜着（缺声明 / 键非可选 / 值非函数 / 声明未用）。仅渲染无载荷插槽的部件仍不声明，消费方写错 slot 名不会报 | 无载荷插槽也补声明，或明确「只有带载荷的插槽进契约」 |
| 废弃提示（CSS / `data-*` / attribute / 层名） | 已落地：`@xihan-ui/kernel/deprecations` 的 `registerDeprecation` + `startDeprecationScan`，Web Components 侧在 `defineXhElements()` 自动启动，Vue 侧按需手动启动（避免进组件树摇入口的体积棘轮），五种介质经诊断通道发 `warn`（见 [诊断通道](./diagnostics#废弃提示)）；登记表当前为空 | 首次废弃时随 changeset 登记第一条，验证真实迁移链路 |
| 浏览器硬底线 | 已落地：`.browserslistrc` 记录硬底线，`check-css-floor` 门禁拒绝抬底线的无兜底特性（`@container` 等），并校验 `light-dark()` / `dvh` 的级联兜底 | 拒绝名单改动时联动本页支持面表格的提醒 |
| 「17 个包必须同版本」 | `check-version-lock` 门禁保证 17 个 package.json 同版本；运行期混装（绕过包管理器的组合）仍无检查 | 提成 peer，或在入口加运行期版本一致性检查 |

发现本页写的和实际行为对不上，按缺陷处理——请提 issue，不要当成「政策就是这样」。

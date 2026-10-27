# 皮肤与样式分层

`@xihan-ui/styles` 是纯 CSS 包：不依赖任何 JS 包，也不被任何 JS 包依赖。它可以脱离 JS 层单独使用，也可以整体替换为自定义皮肤。

皮肤源文件按 `[data-scope='x'][data-part='y']` 书写，发布产物把其中的 `[data-scope='x']` 换成挂载类 `.xh-scope-x`：浏览器按类名给规则分桶，几千条皮肤规则不再挤进 `data-scope` 一个属性桶。两者特异性相同，适配器渲染的每个角色节点都同时带 `data-scope` 与对应的挂载类。脱离 JS 层、自己书写标记时，带 `data-scope="x"` 的节点要一并写上 `class="xh-scope-x"`，否则皮肤不命中；覆盖样式照常用部件选择器。

## 层序

CSS 的级联顺序由 `@layer` 声明的首次出现顺序决定，与 `@import` 顺序无关。层序声明单独放在一个文件中：

```css
/* layers.css */
@layer xihan.reset, xihan.tokens, xihan.motion, xihan.components, xihan.overrides;
```

| 层 | 内容 |
| --- | --- |
| `xihan.reset` | 库自身的基线，只作用于带 `data-scope` 的节点 |
| `xihan.tokens` | 令牌声明（来自 `@xihan-ui/tokens/tokens.css`） |
| `xihan.motion` | 关键帧动画 |
| `xihan.components` | 组件皮肤 |
| `xihan.overrides` | 留给使用者，优先级高于以上全部 |

令牌产物 `tokens.css` 由生成器携带一份逐字相同的层序副本，先引入令牌的项目层序同样成立；两份不允许漂移，由 `check-layer-order` 门禁保证。

按组件引入样式时必须先引入 `layers.css` 或 `tokens.css` 之一，否则层序不成立，级联顺序会退化为引入顺序。

::: warning 本站示例使用无层版本
主入口 `index.css` 与 `index.unlayered.css` 都是从同一份源序生成的扁平文件：家族配方在四份公共层之后只内联一次、排在一切组件皮肤之前，各皮肤随后按源序内联并去掉自带的家族 `@import`。文档站引入的是 `index.unlayered.css`（VitePress 自带无层的 `button` 重置，见[安装与接入](../installation#宿主有无层-reset-时改用无层版)）。层壳移除后，本页描述的层序在本站示例中不生效，规则按特异性竞争。层序相关的表现请在自己的项目中引入 `index.css` 后验证。
:::

## reset 只作用于库节点

```css
@layer xihan.reset {
  :where([data-scope]) {
    box-sizing: border-box;
  }

  :where([data-scope])::before,
  :where([data-scope])::after {
    box-sizing: border-box;
  }

  :where([data-scope]):where(button, input, optgroup, select, textarea) {
    font: inherit;
    letter-spacing: inherit;
  }

  :where([data-scope]):where(button) {
    margin: 0;
    padding: 0;
    border: 0;
    background-color: transparent;
  }
}
```

没有全局 reset，不影响宿主页面的任何元素。与现有页面共存不需要隔离。

库里渲染成 `<button>` 的部件（关闭钮、步进钮、图例项、分页条目……）不依赖宿主页面的全局 reset：浏览器给按钮的缺省内衬、边框、外边距与底色在 reset 层清掉，皮肤要哪一项再自己写。作者自己写的 `<button data-xh-part="trigger">` 接线后同样带 `data-scope`，也会被清成无壳的样子，与文档站里看到的一致；触发钮要按钮外观时，把 [按钮](../components/button) 当作这个部件写进去。

reset 层的每条选择器都由 `:where()` 包住，特指度为 (0,0,0)（伪元素自身的 (0,0,1) 无法再低）。有层版本里这一点无关紧要，层序已经保证皮肤压得住 reset；无层版本 `index.unlayered.css` 只按特指度竞争：Family Recipe 的根规则在产物里由 `[data-scope]` 前缀抬到 (0,2,0)（源文件仍是 `[data-xh-action-control]` 一类的 (0,1,0)），与皮肤选择器同档，并在四份公共层之后、先于全部组件皮肤与 reset 内联一次——同档只剩源序竞争，皮肤对配方物理属性的直接覆盖只有配方先出现才成立，与有层版本里皮肤高一级即胜等价；reset 只有低一档才不会靠源序把配方的字号压掉。代价是无层模式下宿主页面的元素选择器（`div { visibility: hidden }` 这类 (0,0,1)）可以压过 reset——这是无层模式「按特指度竞争」既有取舍的延伸，宿主有这类规则时请自行提高 reset 覆盖的特指度或改用有层版本。

## 组件内滚动

组件内的滚动条形态只有两档，按滚动面的身份固定：

| 档 | 适用面 | 表达 |
| --- | --- | --- |
| 自绘条 | Overlay 家族 positioner 下的 content / list / column，以及定高小列表（Listbox、Transfer、时间列、Cascader column） | Scrollbar 组件接线，`type` 默认 `scroll-hover`，浮层 4px、页内 6px，壳上 `--xh-scrollbar-track-bg: transparent` |
| 原生细条 | 页内结构容器（Table、Tree、Virtualizer viewport、Dialog / Drawer body、Layout sider、Log / MessageFeed 视口、Typography `pre`……）与作者自建滚动容器 | reset 层统一给：`scrollbar-width: thin` + `scrollbar-color: var(--xh-fg-scrollbar-thumb) var(--xh-bg-scrollbar-track)` |

原生细条住在 reset 层，选择器是 `:where([data-scope][data-part], [data-xh-scroll], [data-scope='typography'][data-part='prose'] pre)`。库节点自动命中；作者自己的滚动容器与文档示例加 `data-xh-scroll` 即得同一套细条，不必引任何组件：

```html
<div data-xh-scroll style="max-block-size: 240px; overflow: auto">
  <!-- 长内容 -->
</div>
```

`data-xh-scroll` 只挂样式，不进任何组件契约；它不是 Web Components 的角色声明，角色声明只有 `data-xh-part`。

皮肤不得手写 `scrollbar-width` / `scrollbar-color`（stylelint 判红），要藏原生条（挂了自绘条时）只能写 `scrollbar-width: none`。两条边界属性同样按身份给：`overscroll-behavior: contain` 只给浮层滚动面、模态 body 与粘底视口，页内结构容器保持 `auto`；`scrollbar-gutter: stable` 只给内容高度动态变化的容器（Log、MessageFeed、Dialog / Drawer body），并带 `:not([data-xh-scrollbar])` 守卫——挂了自绘条的容器原生条已是零宽，空道对它没有布局作用。每一处滚动面都登记在 `tooling/scripts/scroll-surface-registry.json`，由 `check-scrollbar-hosts` 逐面核对。

## 皮肤的写法

选择器只使用 `data-*`，不使用类名：

```css
@layer xihan.components {
  [data-scope='toggle'][data-part='root'] {
    /* 私有槽带组件名：组件令牌 → 语义令牌两级回退 */
    --xh-_toggle-bg-on: var(--xh-toggle-bg-on, var(--xh-bg-brand-subtle));
    --xh-_toggle-fg-on: var(--xh-toggle-fg-on, var(--xh-fg-on-brand-subtle));

    /* 家族配方画面：公开槽桥接到形态矩阵之前，使用者槽 → 矩阵（data-xh-action-variant）→ 家族缺省 */
    --xh-action-bg-rest: var(--xh-toggle-bg, var(--xh-_action-variant-bg-rest));
    --xh-action-fg-rest: var(--xh-toggle-fg, var(--xh-_action-variant-fg-rest));
    --xh-action-radius: var(--xh-toggle-radius, var(--xh-shape-control));
  }

  /* 状态只改槽，不重写整条规则 */
  [data-scope='toggle'][data-part='root'][data-state='on'] {
    --xh-action-bg-rest: var(--xh-_toggle-bg-on);
    --xh-action-fg-rest: var(--xh-_toggle-fg-on);
  }

  /* 禁用同时降级前景与表面，不只降低 opacity；手型与状态选择器由配方给 */
  [data-scope='toggle'][data-part='root'][data-state='on'] {
    --xh-action-bg-disabled: var(--xh-_toggle-bg-on-disabled);
    --xh-action-fg-disabled: var(--xh-_toggle-fg-on-disabled);
  }
}
```

三层变量各司其职：

| 形式 | 名称 | 由谁设置 |
| --- | --- | --- |
| 组件覆盖槽 | `--xh-button-bg` | 使用者：修改该组件的背景 |
| 语义令牌 | `--xh-bg-subtle` | 令牌产物：修改后影响全库 |
| 皮肤私有槽 | `--xh-_toggle-bg-on` | 皮肤内部：状态只改它，规则不重复 |

带下划线前缀的私有槽不是公开接口，不在外部设置。

## 覆盖样式的三种粒度

```css
/* 1. 改语义令牌：影响所有直接消费它的规则 */
:root {
  --xh-shape-control: var(--xh-radius-md);
}

/* 2. 改组件覆盖槽：只影响这一类组件 */
:root {
  --xh-button-h: 40px;
  --xh-dialog-max-w: 40rem;
}

/* 3. 直接写规则：放进 overrides 层 */
@layer xihan.overrides {
  [data-scope='button'][data-part='root'] {
    text-transform: uppercase;
  }
}
```

优先使用前两种。直接写死的规则会绕开令牌体系，深色模式与密度切换随之失效。

## 输入类控件的缺省宽度与最小宽度

下拉、日期、文本框等单行字段不传尺寸时一律同宽：根上带 `inline-size: var(--xh-control-w)`，默认值 `16rem`（约 256px），宽度不随内容走——选中一条很长的选项，触发器不会跟着变宽，文字在盒内截断。放进表单字段（Field）时字段在根上把 `--xh-control-w` 设为 `100%`，控件随之铺满字段宽、跟着表单的列走；横排一行流（`layout="inline"`）的表单里字段按内容收，那一档的字段仍取表单根上的缺省宽。单独摆放时要改宽度就改槽：

```css
/* 全局：所有字段一起改 */
:root {
  --xh-control-w: 20rem;
}

/* 单类：只改下拉，其余不变 */
:root {
  --xh-select-control-w: 20rem;
}
```

22 份皮肤消费缺省宽令牌（含表单在横排一行流里把它交还字段的那一处）。日期范围选择器是登记过的例外：起止两组按日的段位、分隔符与日历钮排在一行，内容本身就比 16rem 宽，钉成缺省宽会裁掉终点的段位，所以它缺省按内容撑开、只拿缺省宽作地板（按年、按月时不比别的字段窄），`--xh-date-range-picker-control-w` 仍可钉宽。分格输入的宽由格数与格宽决定，对话输入条铺满宿主，表单字段（Field）自己的 control 部件铺满表单列：这三类不吃缺省宽。字段里只想让某一件不铺满时，在它身上写单类槽 `--xh-<组件>-control-w`，单类槽压过字段给的 `100%`。

缺省宽之外还有一条底线 `min-inline-size: var(--xh-control-min-w)`，默认值 `12rem`（约 192px）。字段放进 flex 或 grid 中会被压缩，压缩到只剩箭头时无法使用，底线挡住这一步；容器比底线还窄时整件收成容器那么宽，不越出去。

23 份皮肤消费这条令牌（其中 file-upload 用它作为条目内文件名的下限，不是控件宽度）。窄栏场景（两列表单、抽屉内的设置项、表格上方的筛选行）要让字段收得更小时放开它：

```css
/* 全局：所有消费这条令牌的控件一起改 */
:root {
  --xh-control-min-w: 0;
}

/* 单类：只改下拉，其余不变 */
:root {
  --xh-select-control-min-w: 8rem;
}
```

槽名是 `--xh-<组件名>-control-w` 与 `--xh-<组件名>-control-min-w`；`mention` 的盒是输入框自己，两条槽叫 `--xh-mention-input-w` 与 `--xh-mention-input-min-w`。完整列表见各组件页的“CSS 变量”。

## 在自定义节点上使用语气

语气轴（`data-tone`）不限于库内组件。在自定义节点上写 `data-tone`，该节点内即可取到整族颜色：六族语气、深浅两态、切换品牌色后的取值都随之变化：

```css
.my-status-card {
  background: var(--xh-tone-subtle);
  border: 1px solid var(--xh-tone-border);
  color: var(--xh-tone-fg);
}
```

```html
<div class="my-status-card" data-tone="danger">…</div>
```

| 令牌 | 含义 |
| --- | --- |
| `--xh-tone-solid` | 实心底 |
| `--xh-tone-solid-hover` / `--xh-tone-solid-active` | 实心底的悬停与按下 |
| `--xh-tone-on` | 实心底上的前景色 |
| `--xh-tone-subtle` | 淡底 |
| `--xh-tone-subtle-hover` / `--xh-tone-subtle-active` | 淡底的悬停与按下 |
| `--xh-tone-fg` | 普通背景上表达该语气的文字色 |
| `--xh-tone-border` | 描边 |
| `--xh-tone-border-control` | 可操作区的边界，对面 3:1 |
| `--xh-tone-soft` | 色条、指示条等装饰性强调，对画布 3:1 |

这一族只在写了 `data-tone` 的节点及其后代内有取值；`data-tone` 是它们的开关，不是可选修饰。

对比度已按 WCAG 逐族验证：实心底与 `--xh-tone-on`、淡底三态与 `--xh-tone-fg` 都是 4.5:1，两条非文字档是 3:1。自定义配色时，文字与底色按上表成对取用，不把 `--xh-tone-fg` 放在 `--xh-tone-solid` 上。

## 语气不跨组件继承

库内有 `tone` 的组件，自己写了就用自己的，没写就用组件自己的缺省语气，不接外层容器的：没写 `tone` 的 Button 放进 `tone="danger"` 的 Alert，或放进一个写了 `data-tone="danger"` 的自定义节点，仍是缺省的品牌色；没写 `tone` 的 Tooltip 从这样的容器里打开，仍是缺省的反白底。

组把语气交给子组件，是组件显式下发的：ButtonGroup 写到没写 `tone` 的段上，TagGroup、TagsInput 与选择器写到值标签上，Menu 写到子菜单上；子组件自己写了 `tone` 的，以子组件为准。CheckboxGroup、RadioGroup、ToggleGroup、Tabs 这类组的条目是组自己的部件，跟着组的语气走，条目外面再包一层布局组件（Flex、Grid、ScrollArea 等没有 `tone` 的组件）也不影响。

上一节的 `--xh-tone-*` 只给自定义节点用，照旧按继承取：自定义节点取到的是最近一个写了 `data-tone` 的祖先那一族。

## 聚焦环

键盘焦点的环两层，由公共皮肤 `focus.css` 统一绘制，组件不需要自行编写：

```css
[data-scope][data-part]:focus-visible {
  outline: var(--xh-ring-width) solid var(--xh-_ring-color, var(--xh-ring-focus));
  outline-offset: var(--xh-ring-offset);
}

:where([data-scope][data-part]:focus-visible) {
  box-shadow: 0 0 0 calc(var(--xh-ring-width) + var(--xh-ring-halo-width)) var(--xh-_ring-halo, var(--xh-ring-halo));
}
```

内圈 1px、偏移 0，贴着边框外沿画，压在元素所在的承载面上，与元素自己的面无关：实心面上也使用库环，不换环色。光环 3px、内圈色 30%，只是观感。两层都不随语气变化，即时出现、不进过渡。

光环这条规则零特指度：部件自己写了 `box-shadow`（浮层面板的投影、卡片的抬起影）时由部件自己胜出，光环让位。要在自己的投影之前叠光环的部件，在自己的聚焦规则里把光环接进去：

```css
[data-scope='tag'][data-part='root']:focus-visible:not([data-disabled]) {
  box-shadow: 0 0 0 calc(var(--xh-ring-width) + var(--xh-ring-halo-width)) var(--xh-_ring-halo, var(--xh-ring-halo));
}
```

焦点由别处绘制时，关环要连光环一起关，并在门禁的 `ringless` 中登记由谁绘制：

```css
[data-scope='menu'][data-part='content']:focus-visible {
  outline: none;
  --xh-_ring-halo: transparent;
}
```

`--xh-_ring-halo` 登记为不继承，只作用于写它的节点：关环的容器里，自己会获得焦点的部件照常绘制光环。首尾相接的行与格（表格单元格、时间列、树行）用 `--xh-ring-offset-inset` 把内圈收进元素里，同时关闭光环。

改环色按求值判定：`--xh-_ring-color`、`outline-color`、键盘聚焦规则中的 `outline` 简写，值只能解到库环两支（`--xh-ring-focus`、`--xh-ring-invalid`），可以经组件覆盖槽或本份皮肤的私有槽转一道；`currentColor`、前景色与底色令牌、`transparent` 都判红。`@media` 只有打印、高对比、减弱动效、粗指针、断点这几种真实媒体条件才算条件块，块里的系统色不受这条约束。库环令牌与它们解析链上经过的名称（如 `--xh-color-brand-600`）在皮肤内一律不允许赋值。

## 切换品牌色

品牌色的唯一真源是原语梯度 `--xh-color-brand-50…950`：语义令牌（`--xh-bg-brand` 等）与语气层（`data-tone='brand'`）都从它取值。切换品牌色要替换整套原语，而不是只改 `--xh-bg-brand`：后者只影响未写 `data-tone` 的默认路径，写了 `data-tone='brand'` 的组件（实心按钮、开关、进度条等）不会随之变化。

提供一枚种子色即可，运行时派生整套梯度：

```ts
import { brandId, createVisualEnvironmentController, registerBrand } from "@xihan-ui/tokens";

// 注册：从种子色派生 11 档原语，注入 [data-brand='acme'] 取值块
registerBrand("acme", "#16a34a");

// 切换：品牌是八轴视觉环境之一
const visual = createVisualEnvironmentController({ root: document.documentElement });
visual.setPreference({ brand: brandId("acme") });
```

派生只取种子的色相与彩度，明度曲线沿用基线，库内所有建立在明度上的对比度保证（如实心底白字 4.5:1）对任何种子色都继续成立。种子会被锚定到 600 档（实心底与强调文字的档位），因此种子必须完全不透明；透明品牌色依赖宿主背景，运行时会拒绝。

需要逐档手动调整时，把整套梯度直接交给 `registerBrand('acme', { 50: '...', ..., 950: '...' })`。SSR 场景用 `brandScaleCss(id, seed)` 获得取值块字符串，随首屏 HTML 下发，客户端不需要再注册。

## 透明颜色与对比度

颜色运行时把 alpha 作为 `Oklch.a` 的必填通道保留。`compositeColors(foreground, backdrop)` 按 CSS source-over 在 sRGB 编码通道合成；WCAG 相对亮度在得到最终像素后再线性化。

```ts
import { compositeColors, contrastRatio } from "@xihan-ui/tokens";

const page = "oklch(0.97 0.01 250)";
const frosted = "oklch(0.98 0.01 250 / 88%)";
const renderedFrosted = compositeColors(frosted, page);

// 背景本身透明时，第三个参数必须给出最终底色。
const ratio = contrastRatio("oklch(0.2 0.02 250)", frosted, page);
```

`relativeLuminance(transparentColor)` 和缺少最终底色的 `contrastRatio(foreground, transparentBackground)` 会直接抛错，不假设白底。磨砂面位于图片、品牌色或多层 surface 上时，应分别传入实际像素或逐层合成；平均色不能证明每一处文字都满足对比度。

`pickOnColor` 与 `pickAwayColor` 可通过 `{ backdrop: actualBackdrop }` 处理半透明背景，并比较自定义 light/dark 候选的真实对比度。没有最终底色时同样抛错，运行时不推测页面背景。

## 动画与进出场

进出场动画挂在 `data-state` 上：

```css
[data-scope='dialog'][data-part='backdrop'][data-state='open'] {
  animation: xh-fade-in var(--xh-motion-duration-enter) var(--xh-motion-ease-enter);
}

[data-scope='dialog'][data-part='backdrop'][data-state='closed'] {
  animation: xh-fade-out var(--xh-motion-duration-exit) var(--xh-motion-ease-exit);
}
```

关闭时 DOM 不会立即消失：[进出场原语](./behavior#进出场)会等待动画结束（或超时）后才允许卸载，因此 `[data-state='closed']` 的动画可以完整播放。

跨皮肤共用的关键帧只定义一次，住在 `family/motion.css`，子入口是 `@xihan-ui/styles/motion.css`：弹层进出场 `xh-overlay-pop-in` / `xh-pop-out`，页内浮现的小件与标签行加入 `xh-pop-in`，面板 `xh-sheet-in / out`，整幅滑入 `xh-slide-in / out`，淡变与页内显现 `xh-fade-in / out`、`xh-rise-in`、`xh-drop-in`，列表条目 `xh-item-in`，披露 `xh-disclosure-expand / collapse`，循环 `xh-spin`、`xh-shimmer`，倒计时 `xh-countdown`。引用它们的皮肤各自 `@import` 这份文件，所以单独引入某一份皮肤时关键帧仍会到场，全量入口按物理文件去重。同一段动画全库只有一个名字；只属于一个组件的关键帧（`xh-notification-stack-in`、`xh-skeleton-pulse` 一类）仍写在各自皮肤里。

要替换某段动画，在 `xihan.overrides` 层重定义同名关键帧即可，不必逐皮肤覆盖。共享关键帧的重定义会作用到所有引用它的组件；只想换一个组件时，改写该组件部件上的 `animation-name`，指向自己定义的关键帧。

## 升级前的形态

自定义元素在 JS 到达之前不会升级，这段时间 `data-scope` / `data-part` 尚未写入，浮层的内容会以裸文本出现在页面流中，被搜索引擎与读屏视为正文。SSR / SSG 直出时这段窗口尤其长。

`not-defined.css` 处理这种情况，按作者写的 `data-xh-part` 选中（升级前唯一存在的标记）。文件名取自它选中的 `:not(:defined)`；原名 `undefined.css`，旧路径 `@xihan-ui/styles/undefined.css` 在 5.x 里仍可引入、内容相同，6.0.0 移除：

```css
@layer xihan.components {
  :where(xh-dialog, xh-popover, xh-select /* … */):not(:defined)
    :where([data-xh-part='backdrop'], [data-xh-part='content'],
           [data-xh-part='positioner'], [data-xh-part='viewport']) {
    display: none;
  }
}
```

## 门禁

皮肤由多道门禁约束（`pnpm gate`）：

| 门禁 | 拦截内容 |
| --- | --- |
| `check-token-refs` | 皮肤引用了令牌产物中不存在的令牌名。孤儿引用不报错也不降级，整条声明在计算值阶段静默失效 |
| `check-shared-slots` | 同一个字面量在两个以上组件中作为默认值。这是一条未命名的设计决策，应先建立语义令牌 |
| `check-disabled-contrast` | 禁用态的前景色令牌上又叠加 `opacity`。两种手段同时使用会把对比度压到无法阅读 |
| `check-focus-ring-surface` | 改环色的声明（`--xh-_ring-color` / `outline-color` / 键盘聚焦规则中的 `outline` 简写）解不到库环两支（`currentColor`、前景色、底色、透明）；皮肤给库环令牌链上的名称赋值；键盘聚焦规则关了环却没在同一块里关光环（`--xh-_ring-halo: transparent`）；关环规则没在 `ringless` 中写明环由谁绘制，或登记了却已扫不到 |
| `check-focus-outline-reset` | 皮肤在 `:focus:not(:focus-visible)` 下复位 `outline`（含 `outline-style` / `outline-width` / `outline-color`）。UA 只在 `:focus-visible` 绘制环，这条复位是死代码，而 `outline` 简写会把 `outline-color` 复位成 `currentColor`，描边色一旦进过渡，焦点离开时就闪出一圈近黑描边 |
| `check-overlay-strategy` | 浮层的坐标系在状态机、`connect`、皮肤三处不一致 |
| `check-part-wiring` | 解剖中声明、`connect` 中产出、适配器却未接线的部件。皮肤为它写了规则却匹配不到任何元素 |
| `check-scrollbar-hosts` | 自绘条三端接线不齐、壳缺定位上下文或轨道底色、浮层没把壳记进层分支；皮肤里的滚动面没有登记进 `scroll-surface-registry.json`（或登记过期）、自绘面的轴与浮层 4px 档没接齐、`overscroll-behavior` / `scrollbar-gutter` 写在不该写的面上或该写的面上没写、原生面自己写 `scrollbar-width`、不是壳的部件声明 `--xh-scrollbar-track-bg` |
| stylelint | 常规 CSS 规范，含皮肤不得手写 `scrollbar-width`（`none` 除外）/ `scrollbar-color` |
| 家族门禁（`check-surface-edge` / `check-elevation-role` / `check-selection-marker` / `check-state-ladder` / `check-shape-scale` / `check-press-feedback` / `check-text-role` / `check-family-parity`） | 根面 `border` 颜色位落 `--xh-border-subtle` / `--xh-border-strong`、淡底面带影、ghost 档画边底影、raised 没登记或没带 `--xh-border-default` 描边；选中与当前态没按浮层集合 / 页内集合 / 导航 / 格状 / 开关的唯一标记走；hover / pressed 的底不从语义面派生或阶梯与承载面不符、焦点边不是 `--xh-border-control-focus`；取 circle / pill 的部件没在身份表登记、正方盒用 pill 冒充圆；铺满一行的部件登记成缩放、缩放不换底、集合行零反馈；标签 / 说明 / 标题 / 图标没按角色取令牌；同族成员不同值。存量登在 `tooling/scripts/family-backlog.json`，按门禁分段、一条一句理由，命中即放行、不命中判过期；`check-family-backlog` 用快照与 CEILING 钉住每段条目数，键集合只减不增——迁走一个组件 = 删条目 + 重录快照 + 下调 CEILING |

## 完全自定义皮肤

移除 `@xihan-ui/styles`，只保留令牌（或连令牌一起移除），组件行为不受影响。需要了解的全部接口是：

1. `data-scope` + `data-part`：结构标识，见[组件参考](../components/)中每个组件的解剖；
2. `data-state` / `data-disabled` / `data-readonly` / `data-invalid` / `data-orientation` / `data-highlighted` / `data-side` / `data-align`：状态钩子；
3. 组件自身的语义属性，如 `data-variant`、`data-position`。

两条贯穿全库的取值约定，写全局规则时可以依赖：

- 开合一律编码为 `data-state='open'|'closed'`，与元素上的 `aria-expanded` 同步。
- `role='option'` 的条目一律编码为 `data-state='checked'|'unchecked'`，与 `aria-selected` 同步，条目上不再发出 `data-selected`。
- `data-selected` 只用于结构性选中：树节点、表格行等既非 option、选中态又与展开 / 高亮各自独立的角色。
- 布尔状态为真时属性存在且值为空串，为假时属性缺席，因此选择器写 `[data-disabled]` 即可，不必写 `[data-disabled='true']`。

`data-xh-*` 前缀的属性是内部标记（层栈、集合项、焦点哨兵），不承诺稳定，不要选择它们。

## 相关

- [设计令牌与主题](./theme)：令牌的来源与形状、材质、动效的语义阶梯
- [解剖与部件契约](./anatomy)：`data-scope` / `data-part` 的约定

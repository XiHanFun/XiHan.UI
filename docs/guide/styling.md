# 皮肤与样式分层

`@xihan-ui/styles` 是**纯 CSS** 包：不依赖任何 JS 包，也不被任何 JS 包依赖。它可以脱离整个 JS 层单独使用，也可以整包丢掉自己写。

## 层序

CSS 的级联顺序由 `@layer` 声明的**首次出现顺序**决定，与 `@import` 顺序无关。人写的那份单独放在一个文件里：

```css
/* layers.css */
@layer xihan.reset, xihan.tokens, xihan.motion, xihan.components, xihan.overrides;
```

| 层 | 内容 |
| --- | --- |
| `xihan.reset` | 库自己的基线，只作用于带 `data-scope` 的节点 |
| `xihan.tokens` | 令牌声明（来自 `@xihan-ui/tokens/tokens.css`） |
| `xihan.motion` | 关键帧动画 |
| `xihan.components` | 组件皮肤 |
| `xihan.overrides` | 留给使用者，永远盖得住上面全部 |

令牌产物 `tokens.css` 由生成器带一份逐字相同的副本，好让先引令牌的项目层序照样成立；两份不许漂移，由 `check-layer-order` 门禁盯住。

按组件挑样式时**必须先引 `layers.css` 或 `tokens.css` 之一**，否则层序不成立，级联顺序就变成了引入顺序。

::: warning 本站的示例跑的是无层版本
文档站引的是 `index.unlayered.css`（VitePress 自带无层的 `button` 重置，见[安装与接入](../installation#宿主有无层-reset-时改用无层版)）。层壳被拆掉之后，本页说的这套层序在本站的示例里一条都不生效——规则改按特异性竞争。层序相关的表现本站演示不出来，请在你自己的项目里引 `index.css` 之后验。
:::

## reset 只碰自己的节点

```css
@layer xihan.reset {
  [data-scope],
  [data-scope]::before,
  [data-scope]::after {
    box-sizing: border-box;
  }

  [data-scope]:where(button, input, optgroup, select, textarea) {
    font: inherit;
    letter-spacing: inherit;
  }
}
```

没有全局 reset，不碰宿主页面的任何元素。与现有页面共存不需要做任何隔离。

## 皮肤的写法

选择器只认 `data-*`，不认类名：

```css
@layer xihan.components {
  [data-scope='button'][data-part='root'] {
    /* 私有槽位：组件令牌 → 语义令牌两级回退 */
    --xh-_bg: var(--xh-button-bg, var(--xh-bg-subtle));
    --xh-_bg-hover: var(--xh-button-bg-hover, var(--xh-bg-subtle-hover));
    --xh-_fg: var(--xh-button-fg, var(--xh-fg-default));

    block-size: var(--xh-button-h, var(--xh-control-h-md));
    padding-inline: var(--xh-button-px, var(--xh-control-px-md));
    border-radius: var(--xh-button-radius, var(--xh-shape-control));
    background: var(--xh-_bg);
    color: var(--xh-_fg);
  }

  /* 变体只改槽位，不重写整条规则 */
  [data-scope='button'][data-part='root'][data-variant='solid'] {
    --xh-_bg: var(--xh-bg-brand);
    --xh-_fg: var(--xh-fg-on-brand);
  }

  [data-scope='button'][data-part='root'][data-disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }
}
```

三层变量各司其职：

| 形式 | 名字 | 谁写 |
| --- | --- | --- |
| 组件覆盖槽 | `--xh-button-bg` | **使用者**：想改这个组件的背景就设它 |
| 语义令牌 | `--xh-bg-subtle` | 令牌产物：改它影响全库 |
| 皮肤私有槽 | `--xh-_bg` | 皮肤内部：变体只改它，规则本身不重复 |

带下划线前缀的私有槽不是公开接口，别在外面设它。

## 覆盖样式的三种粒度

```css
/* 1. 改语义令牌：影响所有直接消费它的规则 */
:root {
  --xh-shape-control: 10px;
}

/* 2. 改组件覆盖槽：只影响这一类组件 */
:root {
  --xh-button-h: 36px;
  --xh-dialog-max-w: 40rem;
}

/* 3. 直接写规则：放进 overrides 层，永远盖得住 */
@layer xihan.overrides {
  [data-scope='button'][data-part='root'] {
    text-transform: uppercase;
  }
}
```

优先选前两种。写死规则会绕开令牌体系，深色模式、密度切换这些跟着一起失效。

## 输入类控件有默认最小宽度

下拉、日期、文本框这类控件默认带 `min-inline-size: var(--xh-control-min-w)`，缺省 `12rem`（约 192px）。控件放进 flex 或 grid 里天然会被压扁——压到只剩一个箭头就没法用了，先给一条底线比让它塌掉合理。

16 份皮肤吃这条令牌（其中 file-upload 拿它当条目里文件名的下限，不是控件宽度）。窄栏场景（两列表单、抽屉里的设置项、表格上方的筛选行）会顶出容器：这条是底线不是宽度，容器再窄它也不让步。要么把它放开、要么给控件所在的栏留够宽度：

```css
/* 全局：所有吃这条令牌的控件一起改 */
:root {
  --xh-control-min-w: 0;
}

/* 单类：只改下拉，其余照旧 */
:root {
  --xh-select-control-min-w: 8rem;
}
```

槽名是 `--xh-<组件名>-control-min-w`。`text-field` · `password-input` · `clipboard` · `mention` 的**内层输入框**另有一条 `--xh-<组件名>-input-min-w`：外框放开了内框还在顶，就是漏了这一条。整表见各组件页的「CSS 变量」。

## 在自己的节点上接语气

语气轴（`data-tone`）不只给库里的组件用。在自己的节点上写一个 `data-tone`，那个节点里就能取到整族颜色——六族语气、深浅两态、换过品牌色之后的取值，全都跟着走：

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

| 令牌 | 是什么 |
| --- | --- |
| `--xh-tone-solid` | 实心底 |
| `--xh-tone-solid-hover` / `--xh-tone-solid-active` | 实心底的悬停与按下 |
| `--xh-tone-on` | 实心底上的前景色 |
| `--xh-tone-subtle` | 淡底 |
| `--xh-tone-subtle-hover` / `--xh-tone-subtle-active` | 淡底的悬停与按下 |
| `--xh-tone-fg` | 普通背景上表达该语气的文字色 |
| `--xh-tone-border` | 描边 |
| `--xh-tone-border-control` | 可操作区的边界，对面 3:1 |
| `--xh-tone-soft` | 色条、指示条这类装饰性强调，对画布 3:1 |

这一族只在写了 `data-tone` 的节点及其后代里有取值。没写就取不到——`data-tone` 是它们的开关，不是可选修饰。

对比度已经按 WCAG 逐族验过：实心底与 `--xh-tone-on`、淡底三态与 `--xh-tone-fg` 都是 4.5:1，两条非文字档是 3:1。所以自己配色时，字与底请照上表成对取，别把 `--xh-tone-fg` 压到 `--xh-tone-solid` 上。

## 聚焦环与实心面

键盘焦点的环由公共皮肤 `focus.css` 画一份，组件不必自己写 `outline`：

```css
[data-scope][data-part]:focus-visible {
  outline: var(--xh-ring-width) solid var(--xh-_ring-color, var(--xh-ring-focus));
  outline-offset: var(--xh-ring-offset);
}
```

偏移是**负的一个环宽**：环往元素里收，外沿与元素边框外沿重合，聚焦前后占的地方一样大。因此环内侧紧挨着的是**元素自己那块面**。面是实心的那几档，环色与面同族，贴上去就看不出来——最坏的档量到 1.00:1，即整条环与底完全同色。这些档把环色槽灌成 `currentColor`，环改取这块面配对的前景色：

```css
[data-scope='tag'][data-part='root'][data-variant='solid'] {
  background: var(--xh-tag-bg, var(--xh-bg-brand));
  color: var(--xh-tag-fg, var(--xh-fg-on-brand));
}

[data-scope='tag'][data-part='root'][data-variant='solid']:focus-visible {
  --xh-_ring-color: currentColor;
}
```

**环仍然不随语气。** `currentColor` 取的是那块面配对的前景色（实心底上就是 `--xh-tone-on` 那一支），不是语气色本体——语气色本体当环色，warning 压白底只有 2.70:1、success 3.04:1，够不到 3:1。没有实心面的那些档一律是 `--xh-ring-focus` 一支色。判据看的是「环压着的那块面」，不是「组件是什么语气」。

**过了线的面不为统一而灌。** 淡底、透空的面这些非实心档一律吃默认环；一条灌环色的规则罩到了非实心档（同一个部件的另一个形态、失效档、只读档），门禁判红，把选择器收窄到实心那一档，而不是登记豁免。

**「灌」按求值认，不按写法认。** 门禁看的是三条声明——`--xh-_ring-color`、`outline-color`、键盘聚焦规则里的 `outline` 简写——的值求出来是什么：顺着皮肤里的槽摊开、再顺着令牌链解到颜色，在任一主题 × 语气下与库自己的两支环（`--xh-ring-focus`、`--xh-ring-invalid`）都不相等就是灌，解不出来的（`currentColor`、使用者传进来的色值、没兜底的使用者令牌）同样算。所以下面几种写法与写 `currentColor` 受同一套判据管：

```css
/* 与面配对的前景色令牌：开关选中的轨道是 <button>、皮肤没给它 color，只能这么写 */
[data-scope='switch'][data-part='root'][data-state='checked']:focus-visible {
  --xh-_ring-color: var(--xh-_tone-on, var(--xh-fg-on-brand));
}

/* 不经槽、直接写长手：一样算灌 */
[data-scope='x'][data-part='y']:focus-visible {
  outline-color: var(--xh-fg-default);
}

/* 包进 @supports：块内条件按成立处理，一样算灌 */
@supports (color: red) {
  [data-scope='x'][data-part='y']:focus-visible {
    --xh-_ring-color: currentColor;
  }
}

/* 包进 @media screen / @container：静态判不出它什么时候不成立，按成立处理，一样算灌 */
@media screen {
  [data-scope='x'][data-part='y']:focus-visible {
    --xh-_ring-color: currentColor;
  }
}

/* 写在裸 :focus 里的 outline 简写：:focus 包含键盘落焦，一样算灌；没写颜色那一节等于 currentColor */
[data-scope='x'][data-part='y']:focus {
  outline: var(--xh-ring-width) solid var(--xh-fg-default);
}

/* 没兜底的使用者令牌：值由使用者定，解不出来，一样算灌 */
[data-scope='x'][data-part='y']:focus-visible {
  --xh-_ring-color: var(--xh-tag-fg);
}
```

显式写回 `var(--xh-ring-focus)`、校验失败换 `var(--xh-ring-invalid)` 不算灌。`@media` 只有纸面、高对比、减动效、粗指针、断点这几种真实媒体条件才算条件块。用 `[data-variant]` / `[data-state]` 这类属性存在式选择器一次罩住几个形态也逃不掉：每个形态各算一档，罩到的非实心档逐档判红——规则写了、档位没写的属性，存在式一律算罩得到（DOM 上多半有这个属性），写了取值的（`[data-state='on']`）看有没有一档兄弟档认领了它。库环两支令牌与它们顺着解到底经过的名字（`--xh-color-brand-500` 这些）皮肤里一律不许赋值。浏览器态的 `focus-ring-inset-grpring` 按同一定义从样式表里读出灌了环色的规则，逐条挂出来落焦量 3:1——静态放行的别名色（比如在实心底上写了同族的 `var(--xh-color-brand-600)`）在那里量出来就是 1:1。

自己写皮肤时，灌之前核三件事：

1. **面画在谁身上**。画在祖先上时（透空的关闭钮坐在标签那块实心底上）规则写成后代选择器，槽仍然灌在拿焦点的那个节点上。
2. **部件有没有 `color`**。圆点、滑块这类没有字的部件先补一支与面配对的墨色；不补则 `currentColor` 取到继承下来的正文色，或原生控件的 UA 前景色。只有一档要换的把那支色直接写进槽，不绕 `currentColor`。
3. **面被换走的档要退出**。失效档把面换成置灰底、前景换成置灰色甚至透明（`color: transparent` 会让整条环一起透明），中性轻档把实心底换成灰底。收窄选择器退回默认值，或把槽显式写回 `var(--xh-ring-focus)`。

## 换品牌色

品牌色的唯一真源是 **原语梯度** `--xh-color-brand-50…950`：语义令牌（`--xh-bg-brand` 等）与语气层（`data-tone='brand'`）都从它取值。所以换品牌色要换整套原语，而不是只改 `--xh-bg-brand`——那只影响没写 `data-tone` 的缺省路径，写了 `data-tone='brand'` 的组件（实心按钮、开关、进度条这些）不会跟着变。

一枚种子色就够，运行时会派生整套梯度：

```ts
import { brandId, createVisualEnvironmentController, registerBrand } from "@xihan-ui/tokens";

// 注册：从种子色派生 11 档原语，注入 [data-brand='acme'] 取值块
registerBrand("acme", "#16a34a");

// 切换：品牌是七轴视觉环境之一
const visual = createVisualEnvironmentController({ root: document.documentElement });
visual.setPreference({ brand: brandId("acme") });
```

派生只取种子的**色相与彩度**，明度曲线沿用基线——库里所有建立在明度上的对比度保证（实心底白字 4.5:1 这类）对任何种子色都继续成立。种子会被锚定到 600 档（实心底与强调文字的档位），因此种子必须完全不透明；透明品牌色依赖宿主背景，运行时会直接拒绝。

要逐档手调，把整套梯度直接交给 `registerBrand('acme', { 50: '...', ..., 950: '...' })`。SSR 场景用 `brandScaleCss(id, seed)` 拿到取值块字符串，随首屏 HTML 下发，客户端不必再注册。

## 透明颜色与对比度

颜色运行时把 alpha 作为 `Oklch.a` 的必填通道保留。`compositeColors(foreground, backdrop)` 按 CSS source-over 在 sRGB 编码通道合成；WCAG 相对亮度在得到最终像素后再线性化。

```ts
import { compositeColors, contrastRatio } from "@xihan-ui/tokens";

const page = "oklch(0.97 0.01 250)";
const glass = "oklch(0.98 0.01 250 / 82%)";
const renderedGlass = compositeColors(glass, page);

// 背景本身透明时，第三个参数必须给出最终底色。
const ratio = contrastRatio("oklch(0.2 0.02 250)", glass, page);
```

`relativeLuminance(transparentColor)` 和缺少最终底色的 `contrastRatio(foreground, transparentBackground)` 会直接抛错，不会假设白底。玻璃位于图片、品牌色或多层 surface 上时，应分别传入实际像素或逐层合成；平均色不能证明每一处文字都满足对比度。

`pickOnColor` 与 `pickAwayColor` 可通过 `{ backdrop: actualBackdrop }` 处理玻璃背景，并会比较自定义 light/dark 候选的真实对比度。没有最终底色时仍会抛错，运行时不会替你猜页面背景。

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

关闭时 DOM 不会立刻消失——[进出场原语](./behavior#进出场)会等动画结束（或超时）才允许卸载，所以 `[data-state='closed']` 的那条动画真的播得完。

## 升级前的形态

自定义元素在 JS 到达之前不会升级，那段时间 `data-scope` / `data-part` 都还没打上，浮层的内容会以裸文本堆在页面流里，被搜索引擎与读屏当作正文。SSR / SSG 直出时这段窗口尤其长。

`undefined.css` 处理这件事——按作者写的 `data-xh-part` 选中（那是升级前唯一存在的标记）：

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

皮肤不是随便写的，几道门禁盯着它（`pnpm gate`）：

| 门禁 | 拦什么 |
| --- | --- |
| `check-token-refs` | 皮肤引用了令牌产物里不存在的令牌名。孤儿引用不报错也不降级——整条声明在计算值阶段静默失效 |
| `check-shared-slots` | 同一个字面量在两个以上组件里当默认值。那是一条没被命名的设计决策，应当先立语义令牌 |
| `check-disabled-contrast` | 禁用态的前景色令牌上又叠 `opacity`。两种手段同时用会把对比度压到读不出字 |
| `check-focus-ring-surface` | 可聚焦部件的面压着环不到 3:1，那一档却没有一条规则把环色换掉（`--xh-_ring-color` / `outline-color` / 聚焦规则里的 `outline` 简写求值后仍是库环）。键盘焦点落在那块面上等于没画。反过来灌了环色的规则罩到非实心档、`:focus-visible` 里关掉环（`outline: none` / `outline-width: 0`）却没登记环由谁画、画了实心面却不接焦点也没登记的部件，同样判红；聚焦规则把环色写成透明的直接判红——失效档只豁免对比度，环不许消失。`@supports` 块里的规则按块内条件成立处理，`@media` 只认几种真实媒体条件为条件块，其余条件块与 `@container` 一律按成立处理；皮肤里给库环令牌链上的名字赋值直接判红 |
| `check-overlay-strategy` | 浮层的坐标系在机器、`connect`、皮肤三处不一致 |
| `check-part-wiring` | 解剖里声明、`connect` 里产出、适配器却没接线的部件。皮肤为它写了规则却匹配不到任何元素 |
| stylelint | 常规 CSS 规范 |

## 完全自己写皮肤

丢掉 `@xihan-ui/styles`，只留令牌（或连令牌一起丢），组件行为一点不受影响。你需要知道的全部接口是：

1. **`data-scope` + `data-part`**——结构标识，见[组件参考](../components/)里每个组件的解剖；
2. **`data-state` / `data-disabled` / `data-readonly` / `data-invalid` / `data-orientation` / `data-highlighted` / `data-side` / `data-align`**——状态钩子；
3. 组件自己的语义属性，如 `data-variant`、`data-position`。

两条贯穿全库的取值约定，写全局规则时可以依赖：

- **开合**一律编成 `data-state='open'|'closed'`，与元素上的 `aria-expanded` 同步。
- **`role='option'` 的条目**一律编成 `data-state='checked'|'unchecked'`，与 `aria-selected` 同步，条目上不再发 `data-selected`。
- **`data-selected`** 只用于结构性选中——树节点、表格行这类既非 option、选中态又与展开/高亮各自独立的角色。
- **布尔状态**为真时属性在场且值为空串，为假时属性整个缺席——所以选择器写 `[data-disabled]` 即可，不必写 `[data-disabled='true']`。

`data-xh-*` 前缀的属性是内部标记（层栈、集合项、焦点哨兵），不承诺稳定，不要选它们。

## 相关

- [设计令牌与主题](./theme)：令牌从哪来
- [解剖与部件契约](./anatomy)：`data-scope` / `data-part` 的约定

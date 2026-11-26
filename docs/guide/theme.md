# 设计令牌与主题

`@xihan-ui/tokens` 提供两部分能力：**设计令牌**（一份 CSS 自定义属性产物）与**主题运行时**（将用户偏好解析为根元素上的属性）。它位于依赖图的第二层，只依赖 `@xihan-ui/core`。

## 令牌的两层

```
primitive  ──►  semantic  ──►  组件私有槽
调色板本身      有语义的角色      单个组件的覆盖点
```

**primitive**：与场景无关的原始值，在任何作用域都不变，只声明一次。

```css
--xh-color-brand-500: oklch(0.632 0.209 277);
--xh-color-neutral-950: oklch(0.145 0.005 258);
--xh-space-4: 16px;
--xh-radius-seed: 8px;
```

颜色使用 `oklch` 而不是 `hex` / `hsl`：同一明度的不同色相在感知上亮度一致，深色反转与对比度调整不需要逐色手工修正。

**semantic**：带语义的角色，指向 primitive。皮肤只能消费这一层。

```css
--xh-bg-canvas: var(--xh-color-neutral-0);
--xh-bg-surface: var(--xh-color-neutral-0);
--xh-bg-brand: var(--xh-color-brand-600);
--xh-fg-default: var(--xh-color-neutral-900);
--xh-fg-muted: var(--xh-color-neutral-600);
--xh-border-subtle: color-mix(in oklab, var(--xh-ink) 4.7%, transparent);
--xh-control-h-md: 32px;
--xh-shape-control: var(--xh-radius-md);
--xh-elevation-floating: var(--xh-shadow-md);
--xh-motion-duration-enter: var(--xh-duration-normal);
--xh-layer-modal: var(--xh-z-modal);
--xh-overlay-max-w: 20rem;
```

语义层按角色分组：`bg-*` 背景、`fg-*` 前景、`border-*` 描边、`control-*` 控件尺寸、`shape-*` 形状、`ring-*` 焦点环、`elevation-*` 海拔、`motion-*` 时长与缓动、`layer-*` 层级、`overlay-*` 浮层尺寸、`text-*` 排版。各组取什么值、给谁用在设计一册里逐表列出：圆角见[形状与边界](/design/shape)，按压时间线见[动效 · 按压触感](/design/motion#按压触感)，排版角色见[字体 · 排版角色](/design/typography#排版角色)，海拔与材质见[阴影与材质](/design/shadow)；组件内的两档滚动条见[皮肤与样式分层 · 组件内滚动](./styling#组件内滚动)。

令牌源是 DTCG 格式的 JSON（`packages/design/tokens/tokens/`），产物由构建脚本生成，`tokens.css` / `tokens.json` / `src/generated/tokens.ts` 三份都入库。CI 会重新生成并比对产物，源与产物不同步时构建失败。

## 八轴视觉环境运行时

`VisualEnvironmentController` 是 mode、brand、density、dir、contrast、motion、transparency、material 的唯一状态与 DOM 投影入口。一次 `setPreference` 同步提交同一 scope 的完整八轴：

```ts
import { setMotionOverride } from "@xihan-ui/motion";
import {
  brandId,
  createMotionOverrideSink,
  createVisualEnvironmentController,
} from "@xihan-ui/tokens/runtime";

const visual = createVisualEnvironmentController({
  root: document.documentElement,
  storageKey: "app-visual-environment",
  onStorageError: detail => reportStorageFailure(detail),
  motionSink: createMotionOverrideSink(setMotionOverride),
  initial: {
    mode: "system",
    brand: brandId("xihan"),
    density: "comfortable",
    dir: "ltr",
    contrast: "system",
    motion: "system",
    transparency: "system",
    material: "standard",
  },
});

visual.setPreference({ mode: "dark", density: "compact" });
visual.getState();
visual.subscribe(state => console.log(state));
visual.dispose();
```

启用 `storageKey` 必须同时给 `onStorageError`。解析失败、隐私模式或配额不足会明确回调；控制器继续维护内存状态，但不会把持久化失败伪装成成功。

根控制器的 `motionSink` 是显式依赖注入：它把解析后的 motion 同步到 Presence、平滑滚动和 JS 动画。只有 `documentElement` 根作用域允许传；局部控制器只改当前 DOM scope，不能隐式污染全局 JS override。

八轴状态会投影成 Portal 可桥接的完整属性面：

```html
<html data-theme="dark" data-brand="xihan" data-density="compact" data-contrast="more" data-motion="reduce" data-transparency="reduce" data-material="liquid" dir="rtl">
```

## 偏好、状态与系统轴

| | `VisualEnvironmentPreference` | `VisualEnvironmentState` |
| --- | --- | --- |
| 含义 | 用户或服务端提交的意图 | 已完全定型的事实 |
| `undefined` | 清除本层覆盖，继承父控制器 | 不存在，八轴全部非空 |
| `'system'` | 仅 mode / contrast / motion / transparency 合法 | 不存在，已解析成具体值 |

brand、density、dir、material 没有平台媒体查询，因此不接受伪造的 `system`。其余四轴分别读取 `prefers-color-scheme`、`prefers-contrast`、`prefers-reduced-motion`、`prefers-reduced-transparency`。没有 `window` / `matchMedia` 的 SSR 环境使用浅色、默认对比度、默认动效和默认透明度，不猜测客户端偏好。

基线八轴为 light、xihan、comfortable、ltr、default、default、default、standard。`contrast='default'` 是显式恢复常规对比度的正式值；旧的 `base` 不再接受。

| DOM 轴 | 说明 |
| --- | --- |
| `data-theme` | 明暗两值各有整套语义取值；`system` 是不跑 JS 的跟随系统档，见下文 |
| `data-brand` | 切换品牌色：预设品牌直接可用，自定义品牌先 `registerBrand` |
| `data-density='compact'` | 收紧控件高度、内距与间隙，不缩字号和字形 |
| `dir` | 由逻辑属性驱动 LTR / RTL 布局；只认物理方向的量（translate、渐变角度、clip-path 左右两侧）乘 `--xh-direction-sign` 换向——它按就近的 `dir` 继承（ltr 为 1、rtl 为 -1），局部写回 `ltr` 的子树跟着翻回；`transform-origin` 这类物理坐标取 `--xh-direction-start` / `--xh-direction-end`（行内起始缘 / 末尾缘的水平位置，ltr 为 0% / 100%，rtl 反过来） |
| `data-contrast` | `more` 加强边界；`default` 显式回到常规档 |
| `data-motion` | `reduce` 触发局部 CSS 动效降级 |
| `data-transparency` | `reduce` 把主题开出的透景材质切回实体配方 |
| `data-material` | `liquid` 让浮在内容之上的导航层部件（浮动钮、媒体控制、吸顶顶栏）换成液态面；`standard` 保持原材质，最近的祖先生效 |

### 不跑 JS 跟随系统明暗

控制器的 `mode: "system"` 要等脚本跑起来才解出明暗。页面只想跟随系统、不想为此引脚本，或者要在脚本到达之前就对，直接在 HTML 里写 `data-theme="system"`：

```html
<html data-theme="system">
```

浅色系统下它与 `light` 同一套取值；系统切到深色，令牌的深色取值、`color-scheme` 与皮肤里只在深色下成立的几条规则（语气、按钮实底等）由 `prefers-color-scheme` 一并切过去，不经任何脚本，系统随时切换随时跟上。`system` 只是写在 DOM 上的一档，控制器照旧只投影 `light` / `dark`：之后若在同一个根上建控制器，它会把属性改成解出的具体值。

## 父作用域、Portal 与回收

局部控制器通过 `parent` 明确继承。父状态变化时，子控制器只重算没有本地偏好的轴；`setPreference({ motion: undefined })` 会删除本层覆盖，立即恢复继承。dispose 会退订父作用域和系统媒体，并把根元素八个属性精确还原到接管前。

```ts
const page = createVisualEnvironmentController({
  root: document.documentElement,
  initial: { mode: "dark", motion: "system" },
});
const editor = createVisualEnvironmentController({
  root: document.querySelector("#editor")!,
  parent: page,
  initial: { density: "compact", transparency: "reduce" },
});
```

React / Vue 的 `XhConfigProvider` / `provideXhConfig` 通过 `config.visualEnvironment` 接受带显式 root 的控制器选项；嵌套 Provider 自动接父控制器。Web Components 的 `<xh-config>` 自身就是局部 scope，可直接设置 `mode`、`brand`、`density`、`direction`、`contrast`、`motion`、`transparency`、`material`。三端写法见[全局配置 · 视觉环境](../runtime/config#视觉环境)。物理 Portal 仍由 Core 的 VisualBridge 桥接已解析八轴，适配器不另存一份视觉状态。

## 五轴旧视图

`createThemeController`、`resolveTheme` 与 `applyThemeAttrs` 继续存在，但只是新控制器的明确五轴视图：没有独立 resolver、媒体查询或持久化实现。新代码应使用八轴控制器；独立的 `applyThemeAttrs` 只写五轴，控制器则始终维护完整八轴 DOM 合同。

`color-scheme` 声明写在深色取值块里，所以嵌套深色区域的原生控件也会跟随。SSR 首屏应直接输出八个已解析属性，避免客户端接管前闪烁。

## 切换品牌色

品牌色的唯一真源是原语梯度 `--xh-color-brand-50…950`：语义令牌（`--xh-bg-brand` 等）与语气层（`data-tone='brand'`）都从它取值。切换品牌色要替换整套原语，而不是只改 `--xh-bg-brand`：后者只影响未写 `data-tone` 的默认路径，写了 `data-tone='brand'` 的组件（实心按钮、开关、进度条等）不会随之变化。

### 预设品牌

`@xihan-ui/tokens` 自带几档有名字的品牌，清单是 `BRAND_PRESETS`（如 `blue`、`green`、`orange`、`pink`），类型是 `BrandPreset`；`BRAND_PRESET_COLORS` 给每档一个代表色（那一档的品牌 600），画色板格子、预设清单时用。每档在 `tokens.css` 里是一个 `[data-brand='<id>']` 取值块，只换品牌原语，不必 `registerBrand`：

```ts
visual.setPreference({ brand: brandId("green") });
```

各档取基础色板里同名的色相，每一级按缺省品牌那一级的相对亮度派生；`indigo` 是原来的缺省品牌（色相 258），缺省换成色相 277 的靛蓝后留作预设。品牌参与的对比度（实心底上的字、品牌字色、品牌淡底与上面的字、聚焦环）因此与缺省品牌同样达标，浅色、深色与两档高对比都由门禁逐档核对。

### 注册自定义品牌

提供一枚种子色即可，运行时派生整套梯度：

```ts
import { brandId, createVisualEnvironmentController, registerBrand } from "@xihan-ui/tokens";

// 注册：从种子色派生 11 档原语，注入 [data-brand='acme'] 取值块
registerBrand("acme", "#16a34a");

// 切换：品牌是八轴视觉环境之一
const visual = createVisualEnvironmentController({ root: document.documentElement });
visual.setPreference({ brand: brandId("acme") });
```

派生只取种子的色相与彩度，明度曲线沿用基线，库内所有建立在明度上的对比度保证（如实心底白字 4.5:1）对任何种子色都继续成立。种子会被锚定到 600 档（实心底与强调文字的档位），因此种子必须完全不透明；透明品牌色依赖宿主背景，运行时会拒绝。`registerBrand` 注入的取值块不在层里，与预设同名时压过预设。

需要逐档手动调整时，把整套梯度直接交给 `registerBrand('acme', { 50: '...', ..., 950: '...' })`。SSR 场景用 `brandScaleCss(id, seed)` 获得取值块字符串，随首屏 HTML 下发，客户端不需要再注册。

`data-brand` 要与 `data-theme` 落在同一个元素上才换得动品牌：语义令牌在主题边界上声明，只在子元素上换品牌原语，语义令牌仍是外层解好的值。可视环境控制器的根总是同时写这两个属性；手写时在同一个元素上一并写 `data-theme`。

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

## 材质配方

材质配方有 solid、soft、frosted、elevated 四档与只在 liquid 档出现的液态面，各档给谁、光学取值、每档九项令牌的后缀含义与环境轴上的降级见[阴影与材质](/design/shadow)。这里只讲两处要自己接线的地方。

### 接入 frosted 浮层面

M2 frosted 在库里只有一份实现：材质家族配方 `@xihan-ui/styles/material.css`。组件在部件上投影 `data-xh-material="frosted"`，锚定浮层的内容面由配方画描边、底、前景与投影，背景滤镜与 1px 顶光两条通道缺省为空、留给要透景的主题；浮动钮的面归 Action Control，由配方给交互阶梯（悬停 / 按下换不透明淡底一档、二档，键盘聚焦铺 `focus-surface`）。自定义的浮层面写同一个属性即可接入，用 `--xh-frosted-bg`、`--xh-frosted-border`、`--xh-frosted-fg`、`--xh-frosted-shadow`、`--xh-frosted-backdrop`、`--xh-frosted-highlight` 覆盖。

主题要磨砂透景时怎么给值、哪些面不许透景见[阴影与材质 · frosted 浮层面](/design/shadow#frosted-浮层面)；开了透景时焦点环搭配 `focus-surface` 对应的实体隔离面。

### 液态材质

`data-material` 是应用级材质轴，缺省 `standard`，取 `liquid` 时浮在内容之上的导航层部件换成液态面（M5 liquid，`--xh-material-liquid-*`）。它写在任意祖先上，最近的一层生效，Portal 视觉桥会把它带到实例壳；standard 档下同一部件保持原材质。用了视觉环境控制器时，经它的 `material` 偏好设置（控制器始终维护根上的这个属性）。液态面的光学：可读下限浅 0.48 / 深 0.61 不透明度，8px 模糊，140% 饱和度，墨色细线加 1px 边缘光，Chromium 下边缘折射。

现有的液态部件：FloatButton 触发器与展开的动作、BackTop、MessageFeed / Log 的回到底部、Carousel 的翻页与播放钮和分页条（托在一条液态胶囊上）、ImageViewer 的工具条、计数、翻页与关闭钮，以及 Layout 固定时的顶栏。瞬态浮层、模态、Notification、Card、Table、表单与正文容器不用液态，由门禁 `check-material-scope` 守住。

```html
<html data-material="liquid">
  <!-- 图片、视频、画布这类读不到颜色的区域，由作者声明下层的明暗 -->
  <section data-xh-backdrop="dark" data-xh-backdrop-busy>…</section>
</html>
```

作者只写这一个属性。组件挂载后由 `@xihan-ui/core/visual-environment` 的液态面接管，同一文档的部件共用一套监听，不需要额外安装或调用：

- 按部件下层的计算底色与作者声明选色调：下层亮取浅色调、下层暗取深色调，部件随之成为黑墨或白墨域（相对亮度 0.179 ± 0.04 滞回，内容滚过分界附近不来回闪）。
- 下层均匀且色调已知时换通透档（浅 0.24 / 深 0.34）；下层有文字、渐变、图片、视频、画布或读不到时留在可读下限，标签在任何下层上至少 4.5:1。页面里有被设为 `inert` 的内容（命中栈里没有它们）时同样按读不到处理。
- 滚动、窗口缩放、图片加载完、过渡或动画播完、状态机驱动的平移落定（轮播翻页、看图惯性）时重读下层。
- 细指针移动时 1px 边缘光转向指针；粗指针、无指针与减弱动效下固定左上（RTL 右上）。
- Chromium 内核下距边缘 18px 以内折射下层；其余引擎、尺寸超过 640 × 120 或同一视口超过 3 个时只模糊不折射。

| 专用令牌 | 用途 |
| --- | --- |
| `--xh-material-liquid-tint` | 通透档的着色 |
| `--xh-material-liquid-alpha-clear` / `-alpha-floor` | 通透档与可读下限的不透明度 |
| `--xh-material-liquid-rim-far` | 背光一侧的弱亮边 |
| `--xh-material-liquid-bezel` | 折射带宽度 |

服务端与挂载前输出静态形态：色调随主题，不透明度取可读下限。减少透明、打印时不透明度 1 且无背景滤镜与折射，高对比档不透明度 1，强制色改由系统色表达。

## 直接取用令牌

```ts
import type { TokenName } from "@xihan-ui/tokens";
// TypeScript 侧带类型的令牌名
import { tokens } from "@xihan-ui/tokens";

// 机读产物：生成 Figma 变量、Tailwind 主题、设计稿标注都可以用
import tokens from "@xihan-ui/tokens/tokens.json" with { type: "json" };
```

### 缺省字族

组件不定字体，`font-family` 照常继承宿主。库的缺省无衬线栈收在 `--xh-font-family-sans`（系统界面字体打头，再给苹方、冬青黑、微软雅黑与思源黑体兜中文），只在引入可选入口时落到页面根上：

```ts
import "@xihan-ui/styles/global.css";
```

这份入口不在 `@xihan-ui/styles` 主入口里；规则放在最低的 `xihan.reset` 层、选择器包在 `:where()` 里，宿主自己写的字体照样压得住。代码与等宽数字取 `--xh-font-family-mono`。

## 相关

- [皮肤与样式分层](./styling)：皮肤怎么消费这些令牌
- [设计一册](/design/)：各组令牌的取值、用途与取舍
- [安装与接入](../installation)：令牌与皮肤的引入顺序

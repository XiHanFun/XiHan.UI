# 设计令牌与主题

`@xihan-ui/tokens` 提供两部分能力：**设计令牌**（一份 CSS 自定义属性产物）与**主题运行时**（将用户偏好解析为根元素上的属性）。它位于依赖图的第一层，不依赖其他包。

## 令牌的两层

```
primitive  ──►  semantic  ──►  组件私有槽
调色板本身      有语义的角色      单个组件的覆盖点
```

**primitive**：与场景无关的原始值，在任何作用域都不变，只声明一次。

```css
--xh-color-brand-500: oklch(0.623 0.214 258);
--xh-color-neutral-950: oklch(0.145 0.005 258);
--xh-space-4: 16px;
--xh-radius-md: 8px;
```

颜色使用 `oklch` 而不是 `hex` / `hsl`：同一明度的不同色相在感知上亮度一致，深色反转与对比度调整不需要逐色手工修正。

**semantic**：带语义的角色，指向 primitive。皮肤只能消费这一层。

```css
--xh-bg-canvas: var(--xh-color-neutral-0);
--xh-bg-surface: var(--xh-color-neutral-0);
--xh-bg-brand: var(--xh-color-brand-600);
--xh-fg-default: var(--xh-color-neutral-950);
--xh-fg-muted: var(--xh-color-neutral-600);
--xh-border-subtle: var(--xh-color-neutral-100);
--xh-control-h-md: 36px;
--xh-shape-control: var(--xh-radius-sm);
--xh-elevation-floating: var(--xh-shadow-md);
--xh-motion-duration-enter: var(--xh-duration-normal);
--xh-layer-modal: var(--xh-z-modal);
--xh-overlay-max-w: 20rem;
```

语义层按角色分组：`bg-*` 背景、`fg-*` 前景、`border-*` 描边、`control-*` 控件尺寸、`shape-*` 形状、`ring-*` 焦点环、`elevation-*` 海拔、`motion-*` 时长与缓动、`layer-*` 层级、`overlay-*` 浮层尺寸、`text-*` 排版。

令牌源是 DTCG 格式的 JSON（`packages/design/tokens/tokens/`），产物由构建脚本生成，`tokens.css` / `tokens.json` / `src/generated/tokens.ts` 三份都入库。CI 会重新生成并比对产物，源与产物不同步时构建失败。

## 形状阶梯

圆角只有一套语义阶梯，组件不写独立圆角值。

| 令牌 | 值 | 用途 |
| --- | ---: | --- |
| `--xh-shape-inset` | 4px | 嵌在控件里的内层：菜单项、标签内部、微型状态块 |
| `--xh-shape-control` | 4px | 控件本体：Button、Input、Select Trigger、Toggle、分页按钮 |
| `--xh-shape-surface` | 8px | 成面的静态容器：Card、Alert、Panel、列表容器、Segmented 与 Tabs 轨道 |
| `--xh-shape-overlay` | 12px | 脱离文档流的浮层：Popover、Menu、Dialog、Drawer、Toast |
| `--xh-shape-circle` | 50% | 正圆：头像、圆形图标按钮、单选指示器 |
| `--xh-shape-pill` | 9999px | 胶囊：Badge、Tag 等状态 chip，以及轨道、指示条、手柄、滚动条滑块等一维对象 |

普通按钮、字段、卡片与浮层不使用 pill；内层圆角不超过外层圆角减去内边距；相连控件消除相接侧圆角。亮色、暗色与紧凑密度不改变形状身份。正方盒取 circle，不用 pill 冒充圆。

## 点击触感

离散操作控件（Button、Toggle、图标按钮、分页按钮、工具栏按钮）共用一套按压时间线：

| 阶段 | 时长 | 缓动 | 结果 |
| --- | ---: | --- | --- |
| 按下 | `--xh-motion-duration-press`（120ms） | `--xh-motion-ease-press` | scale 1 → `--xh-motion-scale-press`（0.97），背景进入 active |
| 释放 | `--xh-motion-duration-release`（200ms） | `--xh-motion-ease-release` | scale 回到 1，背景回到 hover / rest |

Menu Item、Listbox Item、Tree Node、Table Row 等集合项与 Accordion / Collapsible 等 disclosure trigger 使用同一节奏，但只切换表面，不缩放整条，也不允许零反馈。减少动效时 `--xh-motion-scale-press` 归 1、两段时长归 1ms，颜色反馈保留。

## 组件内滚动

滚动条形态只有两档，按滚动面的身份固定，不按组件各自决定：

| 档 | 适用面 | 令牌 |
| --- | --- | --- |
| 自绘条（Scrollbar 组件接线） | Overlay 家族 positioner 下的 content / list / column；定高小列表（Listbox content、Transfer list、时间列、Cascader column） | `type` 默认 `scroll-hover`；厚度浮层 `--xh-scrollbar-thickness-sm`（4px）、页内 `--xh-scrollbar-thickness-md`（6px）；壳上 `--xh-scrollbar-track-bg: transparent` |
| 原生细条 | 页内结构容器（Table、Tree、Transfer 面板、Virtualizer viewport、Dialog / Drawer / FloatingPanel body、Layout sider / content、SideNav popout、Log / MessageFeed 视口、日历年网格、Typography `pre`）与作者自建滚动容器 | reset 层 `:where([data-scope][data-part], [data-xh-scroll])` 统一给 `scrollbar-width: thin` + `scrollbar-color: var(--xh-fg-scrollbar-thumb) var(--xh-bg-scrollbar-track)` |

滑块色阶维持三级：`--xh-fg-scrollbar-thumb` / `-hover` / `-active` 分别是前景色 15% / 25% / 35%，两档共用。作者自己的滚动容器加 `data-xh-scroll` 即得同一套细条，写法与边界见[皮肤与样式分层](./styling#组件内滚动)。

边界行为按身份给：`overscroll-behavior: contain` 只给浮层滚动面、模态 body 与粘底视口，页内结构容器保持 `auto`；`scrollbar-gutter: stable` 只给内容高度动态变化的容器（Log、MessageFeed、Dialog / Drawer body），并带 `:not([data-xh-scrollbar])` 守卫；边缘渐隐只在 ScrollArea 的 fade 变体与 Marquee 提供。文档站页面滚动条与组件滚动条同一 `type`，不另写覆写。

## 排版角色

`text-*` 排版令牌按角色取用，层级由字号、字重、行高和间距共同表达，不能只调颜色：

| 角色 | 字号 / 字重 / 颜色 | 与相邻元素的间距 |
| --- | --- | --- |
| 字段标签（单字段与 Slider、Rating、Signature、Color* 等复合单字段） | `--xh-text-label-size` 14 / `--xh-text-label-weight` 500 / `--xh-fg-default` | 贴控件 `--xh-space-1` |
| 集合标题（RadioGroup、CheckboxGroup、Listbox、Tree、TagGroup、Descriptions） | 14 / 500 / `--xh-fg-muted` | 与集合 `--xh-space-2` |
| 说明 / helper | `--xh-text-secondary-size` 13 / `--xh-fg-muted` / `--xh-leading-normal` | 与控件 `--xh-space-1` |
| 错误文案 | 13 / `--xh-fg-danger` | 与控件 `--xh-space-1` |
| Surface / Feedback / 浮层内标题 | 14 / `--xh-font-weight-semibold` | — |
| 页面级面板标题（Dialog、Drawer、Tour） | heading-3（`--xh-text-heading-3-*`） | — |
| 次级标注（计数、快捷键、时间戳、序号） | `--xh-text-caption-size` 12 | — |

必填星号与错误文案是公共层规则：`--xh-glyph-mark-required` + `--xh-space-1` + `--xh-fg-danger`，自带标签的字段不各画一套；禁用标签色统一 `--xh-fg-subtle`，单行标签 `--xh-leading-none`。控件内图标随 size 档取 `--xh-glyph-size-sm / md / lg`（16 / 20 / 24）；`--xh-glyph-size-text`（随文 1em）只给 Tag、Kbd、Breadcrumb、Typography、Highlight 这类纯行内文字组件。

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
| `data-theme` | 明暗两值各有整套语义取值 |
| `data-brand` | 注册品牌梯度后切换品牌色 |
| `data-density='compact'` | 收紧控件高度、内距与间隙，不缩字号和字形 |
| `dir` | 由逻辑属性驱动 LTR / RTL 布局 |
| `data-contrast` | `more` 加强边界；`default` 显式回到常规档 |
| `data-motion` | `reduce` 触发局部 CSS 动效降级 |
| `data-transparency` | `reduce` 把磨砂材质切成实体配方 |
| `data-material` | `liquid` 让浮在内容之上的导航层部件（浮动钮、媒体控制、吸顶顶栏）换成液态面；`standard` 保持原材质，最近的祖先生效 |

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

React / Vue 的 `XhConfigProvider` / `provideXhConfig` 通过 `config.visualEnvironment` 接受带显式 root 的控制器选项；嵌套 Provider 自动接父控制器。Web Components 的 `<xh-config>` 自身就是局部 scope，可直接设置 `mode`、`brand`、`density`、`direction`、`contrast`、`motion`、`transparency`、`material`。物理 Portal 仍由 Core 的 VisualBridge 桥接已解析八轴，适配器不另存一份视觉状态。

## 五轴旧视图

`createThemeController`、`resolveTheme` 与 `applyThemeAttrs` 继续存在，但只是新控制器的明确五轴视图：没有独立 resolver、媒体查询或持久化实现。新代码应使用八轴控制器；独立的 `applyThemeAttrs` 只写五轴，控制器则始终维护完整八轴 DOM 合同。

`color-scheme` 声明写在深色取值块里，所以嵌套深色区域的原生控件也会跟随。SSR 首屏应直接输出八个已解析属性，避免客户端接管前闪烁。

## 材质配方

令牌配方五档，每档都提供同名九项令牌：`bg`、`backdrop`、`border`、`highlight`、`shadow`、`separator`、`fg`、`fg-muted`、`focus-surface`；M5 liquid 另有五项专用令牌。透明的磨砂面只允许用于瞬态浮层；不提供玻璃材质，也不提供任何兼容别名。另有 raised / floating 两个由海拔令牌组成的叠加档：它们没有 `--xh-material-*` 令牌，只能写成 solid 描边 + solid 底 + 对应海拔的组合。

| 编号 | 令牌 | 用途 | 光学 |
| --- | --- | --- | --- |
| M0 solid | `--xh-material-solid-*` | 静态内容面缺省：border-default 描边 + surface 底 + 无影；字段静息同为描边式 | 实体底色，无高光、无投影 |
| M1 soft | `--xh-material-soft-*` | Button soft、Tag、Popconfirm 动作等次级操作；不用于 Card 与字段 | 实体底色，细微顶光与两段接触投影，无背景模糊 |
| M2 frosted | `--xh-material-frosted-*` | 短列表、菜单、tooltip、气泡等需要透景的锚定瞬态浮层；含网格或多列的锚定面板改用 solid + border-default + `--xh-elevation-floating` | 0.88 不透明度，16px 模糊，108% 饱和度，1px 可见边界 |
| M4 elevated | `--xh-material-elevated-*` | Dialog、Drawer、Command、Tour、Toast、Notification 等模态与强反馈面（sheet），必有 1px 描边 | 完全不透明，无背景模糊，三层高层投影 |
| M5 liquid | `--xh-material-liquid-*` | 只在 `data-material="liquid"` 下出现：浮在内容之上的导航层——浮动钮（FloatButton、BackTop、MessageFeed / Log 的回到底部）、媒体控制（Carousel 控制钮与分页条、ImageViewer 控制层）、吸顶的 Layout 顶栏 | 可读下限浅 0.48 / 深 0.61 不透明度，8px 模糊，140% 饱和度，墨色细线 + 1px 边缘光，Chromium 下边缘折射 |
| raised（叠加档） | solid 描边 + solid 底 + `--xh-elevation-raised` | Card 与可抬起 / 可拖起部件（Segmented、Tabs segment 的滑块，静止的滑杆拇指等），逐部件登记；描边必须在，影只是加成，只有可交互时允许 hover 抬升 | 实体底色，一层低海拔投影 |
| floating（叠加档） | solid 底 + `--xh-border-default` + `--xh-elevation-floating` | 含网格或多列的锚定面板：NavigationMenu content、Date / Time / DateRange / TimeRange picker content | 实体底色，不透景，中海拔投影 |

| 后缀 | 用途 |
| --- | --- |
| `bg` / `backdrop` | 底色 / 背景滤镜 |
| `border` / `highlight` / `shadow` | 外边界、顶部高光与投影 |
| `separator` | 内部分段线 |
| `fg` / `fg-muted` | 正文与次要文字，始终不透明 |
| `focus-surface` | 键盘聚焦时铺在焦点环内侧的实体隔离底 |

Card 只有三档形态：`outline`（缺省，solid 描边 + surface 底 + `--xh-elevation-raised`）、`subtle`（`--xh-bg-subtle` + 透明占位边 + 无影）、`ghost`（不写边、底与影，只允许分隔线）。边界只由描边承担，阴影与淡底都不作为边界。

环境轴在同一令牌名上原位降级：高对比档提高不透明度并加强边界；减少透明度与打印改为实体底并关闭背景滤镜；强制色改由 `Canvas` / `CanvasText` 表达。四档在浅色、深色两套主题下都按黑、白、中灰、页面与品牌背景验证正文至少 4.5:1、焦点环对隔离底至少 3:1。

主题与对比度可以分别声明在不同层级：每一层采用最近的 `data-theme` 和 `data-contrast`。子主题不撤销祖先的高对比度，`data-contrast="default"` 可以局部恢复常规档；兄弟区域互不影响。

### 磨砂面的使用范围

- 只用于需要保留背景空间感的瞬态浮层，正文、表单主体、Card、Table、Toast 与 Dialog 主阅读面不使用。
- 不把 `backdrop-filter` 放在页面根、大滚动区或重叠的多层表面，不对模糊半径做动画。
- 焦点环必须搭配 `focus-surface` 对应的实体隔离面。

### 紧凑磨砂

Tooltip 等小型反白表面使用三支 compact 配方组合 M2 的边界、前景与高光：

| 配方 | 常规值 |
| --- | --- |
| `--xh-material-frosted-compact-alpha` | 0.94，按内置反白与六种 tone 在黑、白、灰、页面和品牌底上验证正文对比度 |
| `--xh-material-frosted-compact-backdrop` | 8px 模糊、104% 饱和度 |
| `--xh-material-frosted-compact-shadow` | 明暗独立的两层小投影 |

高对比、强制颜色和打印分别改为不透明、无模糊、无投影；减少透明时保留小投影表达浮层位置。组件只经这三支配方消费光学参数，不直接选择 alpha 或 blur 原语。

### 液态材质

`data-material` 是应用级材质轴，缺省 `standard`，取 `liquid` 时浮在内容之上的导航层部件换成液态面。它写在任意祖先上，最近的一层生效，Portal 视觉桥会把它带到实例壳；standard 档下同一部件保持原材质。用了视觉环境控制器时，经它的 `material` 偏好设置（控制器始终维护根上的这个属性）。

现有的液态部件：FloatButton 触发器与展开的动作、BackTop、MessageFeed / Log 的回到底部、Carousel 的翻页与播放钮和分页条（托在一条液态胶囊上）、ImageViewer 的工具条、计数、翻页与关闭钮，以及 Layout 固定时的顶栏。瞬态浮层、模态、Toast / Notification、Card、Table、表单与正文容器不用液态，由门禁 `check-material-scope` 守住。

```html
<html data-material="liquid">
  <!-- 图片、视频、画布这类读不到颜色的区域，由作者声明下层的明暗 -->
  <section data-xh-backdrop="dark" data-xh-backdrop-busy>…</section>
</html>
```

作者只写这一个属性。组件挂载后由 `@xihan-ui/core/visual-environment` 的液态面接管，同一文档的部件共用一套监听，不需要额外安装或调用：

- 按部件下层的计算底色与作者声明选色调：下层亮取浅色调、下层暗取深色调，部件随之成为黑墨或白墨域（相对亮度 0.179 ± 0.04 滞回，内容滚过分界附近不来回闪）。
- 下层均匀且色调已知时换通透档（浅 0.24 / 深 0.34）；下层有文字、渐变、图片、视频、画布或读不到时留在可读下限，标签在任何下层上至少 4.5:1。模态打开、背景被设为 inert 而命中不到时同样按读不到处理。
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

## 相关

- [皮肤与样式分层](./styling)：皮肤怎么消费这些令牌
- [安装与接入](../installation)：令牌与皮肤的引入顺序

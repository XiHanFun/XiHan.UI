# 设计令牌与主题

`@xihan-ui/tokens` 装两样东西：**设计令牌**（一份 CSS 自定义属性产物）与**主题运行时**（把用户偏好折算成根元素上的属性）。它是层 1 的包，不依赖任何东西。

## 令牌的两层

```
primitive  ──►  semantic  ──►  组件私有槽
调色板本身      有语义的角色      单个组件的覆盖点
```

**primitive**：与场景无关的原始值，任何作用域都不变，只声明一次。

```css
--xh-color-brand-500: oklch(0.623 0.214 258);
--xh-color-neutral-900: oklch(0.208 0.006 258);
--xh-space-4: 16px;
--xh-radius-md: 6px;
```

颜色用 `oklch` 而不是 `hex` / `hsl`：同一明度的不同色相在感知上真的一样亮，做深色反转和对比度调整时不用逐个手调。

**semantic**：带语义的角色，指向 primitive。皮肤里只能用这一层。

```css
--xh-bg-canvas: var(--xh-color-neutral-0);
--xh-bg-surface: var(--xh-color-neutral-0);
--xh-bg-brand: var(--xh-color-brand-600);
--xh-fg-default: var(--xh-color-neutral-900);
--xh-fg-muted: var(--xh-color-neutral-550);
--xh-border-subtle: var(--xh-color-neutral-200);
--xh-control-h-md: 32px;
--xh-shape-control: var(--xh-radius-md);
--xh-elevation-floating: var(--xh-shadow-md);
--xh-motion-duration-enter: var(--xh-duration-normal);
--xh-layer-modal: var(--xh-z-modal);
--xh-overlay-max-w: 20rem;
```

语义层按角色分组：`bg-*` 背景、`fg-*` 前景、`border-*` 描边、`control-*` 控件尺寸、`shape-*` 圆角、`ring-*` 焦点环、`elevation-*` 阴影、`motion-*` 时长与缓动、`layer-*` 层级、`overlay-*` 浮层尺寸、`text-*` 排版。

令牌源是 DTCG 格式的 JSON（`packages/design/tokens/tokens/`），产物由构建脚本生成，`tokens.css` / `tokens.json` / `src/generated/tokens.ts` 三份都入库。产物与源是否同步由 CI 重跑生成后比对，改源忘了跑生成会被拦下。

## 七轴视觉环境运行时

`VisualEnvironmentController` 是 mode、brand、density、dir、contrast、motion、transparency 的唯一状态与 DOM 投影入口。一次 `setPreference` 同步提交同一 scope 的完整七轴：

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
  },
});

visual.setPreference({ mode: "dark", density: "compact" });
visual.getState();
visual.subscribe(state => console.log(state));
visual.dispose();
```

启用 `storageKey` 必须同时给 `onStorageError`。解析失败、隐私模式或配额不足会明确回调；控制器继续维护内存状态，但不会把持久化失败伪装成成功。

根控制器的 `motionSink` 是显式依赖注入：它把解析后的 motion 同步到 Presence、平滑滚动和 JS 动画。只有 `documentElement` 根作用域允许传；局部控制器只改当前 DOM scope，不能隐式污染全局 JS override。

七轴状态会投影成 Portal 可桥接的完整属性面：

```html
<html data-theme="dark" data-brand="xihan" data-density="compact" data-contrast="more" data-motion="reduce" data-transparency="reduce" dir="rtl">
```

## 偏好、状态与系统轴

| | `VisualEnvironmentPreference` | `VisualEnvironmentState` |
| --- | --- | --- |
| 含义 | 用户或服务端提交的意图 | 已完全定型的事实 |
| `undefined` | 清除本层覆盖，继承父控制器 | 不存在，七轴全部非空 |
| `'system'` | 仅 mode / contrast / motion / transparency 合法 | 不存在，已解析成具体值 |

brand、density、dir 没有平台媒体查询，因此不接受伪造的 `system`。其余四轴分别读取 `prefers-color-scheme`、`prefers-contrast`、`prefers-reduced-motion`、`prefers-reduced-transparency`。没有 `window` / `matchMedia` 的 SSR 环境使用浅色、默认对比度、默认动效和默认透明度，不猜测客户端偏好。

基线七轴为 light、xihan、comfortable、ltr、default、default、default。`contrast='default'` 是显式恢复常规对比度的正式值；旧的 `base` 不再接受。

| DOM 轴 | 说明 |
| --- | --- |
| `data-theme` | 明暗两值各有整套语义取值 |
| `data-brand` | 注册品牌梯度后切换品牌色 |
| `data-density='compact'` | 收紧控件高度、内距与间隙，不缩字号和字形 |
| `dir` | 由逻辑属性驱动 LTR / RTL 布局 |
| `data-contrast` | `more` 加强边界；`default` 显式回到常规档 |
| `data-motion` | `reduce` 触发局部 CSS 动效降级 |
| `data-transparency` | `reduce` 把玻璃材质切成实体配方 |

## 父作用域、Portal 与回收

局部控制器通过 `parent` 明确继承。父状态变化时，子控制器只重算没有本地偏好的轴；`setPreference({ motion: undefined })` 会删除本层覆盖，立即恢复继承。dispose 会退订父作用域和系统媒体，并把根元素七个属性精确还原到接管前。

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

React / Vue 的 `XhConfigProvider` / `provideXhConfig` 通过 `config.visualEnvironment` 接受带显式 root 的控制器选项；嵌套 Provider 自动接父控制器。Web Components 的 `<xh-config>` 自身就是局部 scope，可直接设置 `mode`、`brand`、`density`、`direction`、`contrast`、`motion`、`transparency`。物理 Portal 仍由 Core 的 VisualBridge 桥接已解析七轴，适配器不另存一份视觉状态。

## 五轴旧视图

`createThemeController`、`resolveTheme` 与 `applyThemeAttrs` 继续存在，但只是新控制器的明确五轴视图：没有独立 resolver、媒体查询或持久化实现。新代码应使用七轴控制器；独立的 `applyThemeAttrs` 只写五轴，控制器则始终维护完整七轴 DOM 合同。

`color-scheme` 声明写在深色取值块里，所以嵌套深色区域的原生控件也会跟随。SSR 首屏应直接输出七个已解析属性，避免客户端接管前闪烁。

## 柔和材质配方

`--xh-material-soft-*` 提供 M1 Soft Surface：完全不透明的背景、无背景模糊、浅色和深色各自的细边、高光与接触投影。它适合 Card 一类内容容器，正文不随表面降低透明度。

| 后缀 | 用途 |
| --- | --- |
| `bg` / `backdrop` | 实体底色 / `none` 背景滤镜 |
| `border` / `highlight` / `shadow` | 外边界、顶部高光与接触投影 |
| `separator` | 内部分段线 |
| `fg` / `fg-muted` | 正文与次要文字 |
| `focus-surface` | 校验焦点环对比度的实际底色 |

高对比档在当前作用域增强边界并取消装饰高光；打印档在组件节点直接取消高光与投影。常规和高对比两档都验证正文至少 4.5:1、焦点环至少 3:1。

## 浮动玻璃材质配方

M3 使用 `--xh-material-glass-*` 的九项配方，面向浮动创作面板、浮动按钮组等独立表面。浅深主题分别设计背景与光照，底色不透明度为 0.76，使用 24px 模糊与 112% 饱和度；次要文字采用更强的明暗对比，以抵抗复杂背景透入。正文和图标保持完全不透明，不应在容器上设置整体 `opacity` 或对正文施加滤镜。

`bg`、`border`、`highlight`、`shadow`、`separator`、`fg`、`fg-muted`、`backdrop`、`focus-surface` 分别控制底色、边界、独立顶光、两段投影、分隔、正文、辅助文字、背景滤镜与获焦控件实体底。高对比和减少透明度模式会改用实体配方；打印及强制色同时取消投影。嵌套区域应复用外壳，不重复叠加背景模糊。

主题与对比度可以分别声明在不同层级：每一层采用最近的 `data-theme` 和 `data-contrast`。子主题不会撤销祖先的高对比度，`data-contrast="default"` 可以局部恢复常规档；兄弟区域互不影响。

## 高层玻璃材质配方

M4 使用 `--xh-material-elevated-*` 的九项配方，供 Dialog、Drawer、Command 一类高层模态表面在后续各自的皮肤迁移中消费；令牌本身不改变任何组件默认外观。浅色档以 0.94 的高遮蔽 tint、深色档以 0.92 的独立深色 tint，配合 32px 模糊和 108% 饱和度保护正文。最外层模态壳才可使用 `backdrop`，body、工具条和嵌套浮层必须复用外层，不得重复采样。

`shadow` 固定为近距 contact、中距 ambient、远距 sheet 三层，`highlight` 独立绘制而不使用 inset 阴影；`fg`、`fg-muted` 与 `focus-surface` 始终不透明。浅色、深色均按黑、白、中灰、红绿蓝、页面及品牌背景计算最终合成对比度：正文与次要文字至少 4.5:1，焦点环对实体隔离底至少 3:1。

高对比、减少透明度与打印会在同一令牌名上改为实体底并关闭背景滤镜和高光；高对比及打印同时取消三层投影，减少透明度保留投影来表达模态层级。强制色改由 `Canvas` / `CanvasText` 决定。M4 不包含动效令牌，减少动效由各组件后续消费既有 motion 语义令牌处理。

## 磨砂材质配方

M2 使用 `--xh-material-frosted-*` 的同名九项配方，适合导航和小型锚定浮层。浅色、深色分别设计底色和光照，常规底色透明度为 0.88，背景采用 16px 模糊与 108% 饱和度；正文与次要文字始终不透明。不要把 backdrop-filter 放在页面根、大滚动区或重叠的多层表面，也不要对模糊半径做动画。

系统减少透明度、高对比、强制颜色与打印模式在原组件位置使用实体底并关闭背景滤镜。焦点环必须搭配 `focus-surface` 对应的实体隔离面；仅计算一个隔离色而没有实际绘制它，不能保证焦点可见。主题校验覆盖纯黑、纯白、中灰、页面及品牌背景上的复合颜色。

### 紧凑磨砂

Tooltip 等小型反白表面使用三支 compact 配方组合现有 M2 边界、前景和高光：

| 配方 | 常规值 |
| --- | --- |
| `--xh-material-frosted-compact-alpha` | 0.94，按内置反白与六种 tone 在黑、白、灰、页面和品牌底上验证正文对比度 |
| `--xh-material-frosted-compact-backdrop` | 8px 模糊、104% 饱和度 |
| `--xh-material-frosted-compact-shadow` | 明暗独立的两层小投影，最大模糊范围 16px |

高对比、强制颜色和打印分别改为不透明、无模糊、无投影。减少透明时保留小投影来表达浮层位置。组件经这三支配方消费光学参数，不直接选择 alpha 或 blur 原语。

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

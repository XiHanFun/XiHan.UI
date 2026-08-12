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
--xh-elevation-2: var(--xh-shadow-md);
--xh-motion-duration-enter: var(--xh-duration-normal);
--xh-layer-modal: var(--xh-z-modal);
--xh-overlay-max-w: 20rem;
```

语义层按角色分组：`bg-*` 背景、`fg-*` 前景、`border-*` 描边、`control-*` 控件尺寸、`shape-*` 圆角、`ring-*` 焦点环、`elevation-*` 阴影、`motion-*` 时长与缓动、`layer-*` 层级、`overlay-*` 浮层尺寸、`text-*` 排版。

令牌源是 DTCG 格式的 JSON（`packages/design/tokens/tokens/`），产物由构建脚本生成，`tokens.css` / `tokens.json` / `src/generated/tokens.ts` 三份都入库。产物与源是否同步由 CI 重跑生成后比对，改源忘了跑生成会被拦下。

## 主题运行时

```ts
import { createThemeController } from '@xihan-ui/tokens/runtime'

const theme = createThemeController({
  root: document.documentElement, // 默认就是它
  storageKey: 'app-theme', // 传了才持久化
  initial: { mode: 'system', density: 'comfortable' },
})

theme.getState() // 已定型的五维状态
theme.getPreference() // 用户提交的意图（可能含 undefined / 'system'）
theme.setPreference({ mode: 'dark' })
theme.subscribe(state => {})
theme.dispose()
```

它把状态投影成根元素上的五个属性：

```html
<html data-theme="dark" data-brand="xihan" data-density="comfortable" data-contrast="base" dir="ltr">
```

## 偏好与状态是两回事

这是这套设计的关键区分：

| | 偏好 `ThemePreference` | 状态 `ThemeState` |
| --- | --- | --- |
| 含义 | 用户/服务端提交的**意图** | 已完全定型的**事实** |
| 可以是 `undefined` | 可以，表示继承父作用域 | 不可以，五个维度全部非空 |
| 可以是 `'system'` | 可以（仅 `mode` 与 `contrast`） | 不可以，已折算成具体值 |

```ts
interface ThemePreference {
  mode?: 'light' | 'dark' | 'system'
  brand?: BrandId
  density?: 'comfortable' | 'compact'
  dir?: 'ltr' | 'rtl'
  contrast?: 'base' | 'more' | 'system'
}
```

只有 `mode` 与 `contrast` 接受 `'system'`，因为只有这两维有对应的媒体查询（`prefers-color-scheme`、`prefers-contrast`）。折算规则很简单：`undefined` 取父作用域值，`'system'` 读媒体查询，其余原样。

基线是浅色、`xihan` 品牌、`comfortable` 密度、`base` 对比度、`ltr`。

## 五个维度当前的落地程度

| 维度 | 状态 |
| --- | --- |
| `data-theme` | 已接完，明暗两值各有整套语义取值 |
| `data-contrast='more'` | 已接完，明暗两档各有一组边框/描边加强取值 |
| `data-brand` | 已接完，注册后生效：`registerBrand(id, 种子色)` 注入该 id 的原语取值块，切到这个品牌即换色（见[换品牌色](./styling#换品牌色)）；不注册就切只写属性、不改视觉 |
| `data-density='compact'` | 已接完，收的是盒子：控件高度、内距、间隙、区块留白整档收紧；字号与字形不动，可读性不随密度掉。属性可挂在任意子树上做局部密集区 |
| `dir` | 布局层通过逻辑属性天然支持 |

## 服务端渲染

运行时在 `document` / `window` 缺席时自动走 SSR 分支：不读媒体查询、不写 DOM，一律回退到浅色与基线对比度。

要让首屏不闪，请在服务端直接把五个属性渲染到 `<html>` 上——客户端的控制器会读到相同的偏好并算出相同的状态，属性值一致时它不会触碰 DOM。

## 局部主题

`applyThemeAttrs(el, state)` 可以把一份状态写到任意元素上，用于「侧栏永远深色」这类局部反转。属性写在哪一层，令牌就在哪一层重新解析——因为令牌块的选择器是 `:where([data-theme='dark'])` 而不是 `:root`，嵌套生效。

`color-scheme` 声明也写在深色取值块里，所以嵌套的深色区域里原生控件（滚动条、日期选择器）同样是深色的。

## 直接取用令牌

```ts
// 机读产物：生成 Figma 变量、Tailwind 主题、设计稿标注都可以用
import tokens from '@xihan-ui/tokens/tokens.json' with { type: 'json' }

// TypeScript 侧带类型的令牌名
import { tokens, type TokenName } from '@xihan-ui/tokens'
```

## 相关

- [皮肤与样式分层](./styling)：皮肤怎么消费这些令牌
- [安装与接入](../installation)：令牌与皮肤的引入顺序

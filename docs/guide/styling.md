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

15 份皮肤吃这条令牌。窄栏场景（两列表单、抽屉里的设置项、表格上方的筛选行）会顶出容器：这条是底线不是宽度，容器再窄它也不让步。要么把它放开、要么给控件所在的栏留够宽度：

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

## 换品牌色

品牌色的唯一真源是 **原语梯度** `--xh-color-brand-50…950`：语义令牌（`--xh-bg-brand` 等）与语气层（`data-tone='brand'`）都从它取值。所以换品牌色要换整套原语，而不是只改 `--xh-bg-brand`——那只影响没写 `data-tone` 的缺省路径，写了 `data-tone='brand'` 的组件（实心按钮、开关、进度条这些）不会跟着变。

一枚种子色就够，运行时会派生整套梯度：

```ts
import { brandId, createThemeController, registerBrand } from '@xihan-ui/tokens'

// 注册：从种子色派生 11 档原语，注入 [data-brand='acme'] 取值块
registerBrand('acme', '#16a34a')

// 切换：品牌是主题五维之一
const theme = createThemeController({ storageKey: 'app-theme' })
theme.setPreference({ brand: brandId('acme') })
```

派生只取种子的**色相与彩度**，明度曲线沿用基线——库里所有建立在明度上的对比度保证（实心底白字 4.5:1 这类）对任何种子色都继续成立。种子会被锚定到 600 档（实心底与强调文字的档位）。

要逐档手调，把整套梯度直接交给 `registerBrand('acme', { 50: '...', ..., 950: '...' })`。SSR 场景用 `brandScaleCss(id, seed)` 拿到取值块字符串，随首屏 HTML 下发，客户端不必再注册。

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

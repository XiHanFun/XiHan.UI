# 皮肤与样式分层

`@xihan-ui/styled` 是**纯 CSS** 包：不依赖任何 JS 包，也不被任何 JS 包依赖。它可以脱离整个 JS 层单独使用，也可以整包丢掉自己写。

## 层序

CSS 的级联顺序由 `@layer` 声明的**首次出现顺序**决定，与 `@import` 顺序无关。库把这一句单独放在一个文件里，作为唯一事实源：

```css
/* layers.css */
@layer xihan.reset, xihan.tokens, xihan.motion, xihan.components, xihan.overrides;
```

| 层 | 内容 |
| --- | --- |
| `xihan.reset` | 库自己的基线，只作用于带 `data-scope` 的节点 |
| `xihan.tokens` | 令牌声明（来自 `@xihan-ui/system/tokens.css`） |
| `xihan.motion` | 关键帧动画 |
| `xihan.components` | 组件皮肤 |
| `xihan.overrides` | 留给使用者，永远盖得住上面全部 |

按组件挑样式时**必须先引 `layers.css`**，否则层序不成立，级联顺序就变成了引入顺序。

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
/* 1. 改语义令牌：全库统一 */
:root {
  --xh-bg-brand: oklch(0.55 0.2 150);
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

丢掉 `@xihan-ui/styled`，只留令牌（或连令牌一起丢），组件行为一点不受影响。你需要知道的全部接口是：

1. **`data-scope` + `data-part`**——结构标识，见[组件参考](../components/)里每个组件的解剖；
2. **`data-state` / `data-disabled` / `data-orientation` / `data-highlighted` / `data-side` / `data-align`**——状态钩子；
3. 组件自己的语义属性，如 `data-variant`、`data-position`。

`data-xh-*` 前缀的属性是内部标记（层栈、集合项、焦点哨兵），不承诺稳定，不要选它们。

## 相关

- [设计令牌与主题](./theme)：令牌从哪来
- [解剖与部件契约](./anatomy)：`data-scope` / `data-part` 的约定

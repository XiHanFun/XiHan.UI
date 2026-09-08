---
name: xihan-ui
description: 用 XiHan.UI（曦寒视图组件）写界面时加载：框架无关的设计系统运行时，无头内核 + Vue 与 Web Components 两个适配器 + 纯 CSS 皮肤。涵盖三视觉轴、部件契约、设计令牌、三级覆盖通道与两个适配器的写法差异。触发词：XiHan.UI、曦寒视图组件、@xihan-ui、XhButton、xh-button、data-xh-part、--xh-。
---

# XiHan.UI

## 先读这一段

**这不是 React 组件库，也不是 Tailwind 那类原子类库。** 一个组件在这套库里由四份产物组成，同源：

| 产物 | 包 | 你写什么 |
| --- | --- | --- |
| 无头内核 | `@xihan-ui/headless` | 行为、状态机、无障碍。不产 DOM |
| Vue 适配器 | `@xihan-ui/vue` | `<XhButton>`、复合件逐个部件写出来 |
| 自定义元素 | `@xihan-ui/web-components` | `<xh-button>`，内部结构由你手写，用 `data-xh-part` 声明角色 |
| 默认皮肤 | `@xihan-ui/styles` | 纯 CSS，认 `data-scope` + `data-part`，**不认类名** |

写代码前先跑 `scripts/list-components.mjs` 确认组件存在，再跑 `scripts/get-component-docs.mjs <标识>` 拿这个组件的部件名、Props、事件、状态与两个适配器的示例。**不要凭印象猜 API**——部件名与 Props 是逐组件生成的，猜错在编译期不报错，只是那个部件永远没有样式。

## 判废表

| ✗ 不要这样写 | ✓ 这样写 | 为什么 |
| --- | --- | --- |
| `class="btn-primary"`、给组件传 `class` 来换长相 | `variant` / `tone` / `size` 三个 prop | 皮肤的选择器是 `[data-scope][data-part]`，类名它一条都不认 |
| 拿 `color` / `type` / `status` 去表达形态或语气 | `variant` / `tone` / `size` | 三条轴是全库公约。这几个名字在个别组件上确实存在，但表达的是别的东西——按钮与文本框的 `type` 是原生那一个，照写 |
| `padding: 9px 5px`、`border-radius: 16px` | `--xh-space-*` / `--xh-shape-*` | 裸值不在任何尺度阶梯上，密度切换对它无效 |
| `#3b82f6`、`rgba(59,130,246,.5)` | `--xh-bg-*` / `--xh-fg-*` / `--xh-border-*` | 硬编码色不跟主题、不跟深色、不跟高对比度档 |
| `transition: 0.2s ease` | `--xh-motion-duration-*` / `--xh-motion-ease-*` | 裸时长绕开减弱动效通道，用户关了动效它照跑 |
| 设 `--xh-_tone`、`--xh-_highlight-*` 这类带下划线的槽 | 设同名的公开槽 | `--xh-_*` 是库内私有槽，随时会改 |
| 自造 `.xh-` 开头的类名或 `xh-` 开头的自定义元素 | 用你自己的前缀 | `xh-` 是这个库的命名空间 |
| 在 `<xh-*>` 元素内部用 `data-part` 声明部件 | `data-xh-part` | 见下面「两个适配器」：两者不是一个属性，元素只认后者 |

### 这几条不是禁令，别当禁令用

- **`[data-scope]` / `[data-part]` 是可以当样式钩子的。** 直接写规则是库承认的第三级覆盖通道：引了层序声明时放进 `@layer xihan.overrides`，用的是无层版产物（那一份里 `xihan.overrides` 不存在）时用不低于 `[data-scope][data-part]` 的特异性。这条路被禁掉就没有别的路了。
- **`--xh-tone-*` 存在，而且是公开面。** 在你自己的节点上写一个 `data-tone`，那个节点及其后代里就能取到整族语气颜色。**它们只在写了 `data-tone` 的节点上有取值**——`data-tone` 是这一族的开关，不是可选修饰，漏了它整族取不到值。名单跑 `scripts/get-tokens.mjs tone` 查。
- **覆盖槽鼓励用。** `--xh-<组件>-<槽>` 这一族是公开接口，在 `:root` 里设就行。

## 覆盖样式的三级粒度

按这个顺序挑，能用前面的就不要用后面的：

```css
/* 1. 改语义令牌：所有直接消费它的规则一起变 */
:root {
  --xh-shape-control: 10px;
}

/* 2. 改组件覆盖槽：只影响这一类组件 */
:root {
  --xh-button-h: 36px;
}

/* 3. 直接写规则 */
@layer xihan.overrides {
  [data-scope='button'][data-part='root'] {
    text-transform: uppercase;
  }
}
```

第 3 种绕开令牌体系，深色模式与密度切换在被你写死的那几条属性上跟着失效，所以排在最后，不是不能用。

某个组件有哪些覆盖槽，看它参考页的「CSS 变量」一节，或直接读皮肤源码：`scripts/get-skin.mjs <标识>`。

## 两个适配器

**Vue**：复合件把每个部件写成一个组件，别想着只写外壳。

```vue
<script setup lang="ts">
import { XhDialogContent, XhDialogRoot, XhDialogTrigger } from '@xihan-ui/vue'
</script>

<template>
  <XhDialogRoot>
    <XhDialogTrigger>打开</XhDialogTrigger>
    <XhDialogContent>正文</XhDialogContent>
  </XhDialogRoot>
</template>
```

**自定义元素**：结构由你手写，每个节点上用 `data-xh-part` 声明它是哪个部件。

```html
<script type="module">
  import { defineXhElements } from '@xihan-ui/web-components/define'
  import '@xihan-ui/styles'
  defineXhElements()
</script>

<xh-dialog>
  <button data-xh-part="trigger">打开</button>
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">正文</div>
  </div>
</xh-dialog>
```

**`data-xh-part` 与 `data-part` 是两个属性，不能混。** 前者是作者写的声明（「这个节点想当 content」），后者是元素升级接线后打上去的事实（皮肤选的是它）。你写 `data-part`，元素不会认它；你读 `data-xh-part` 来写样式，元素没升级前它就生效了，升级后又和皮肤打架。

## 取数脚本

四个纯读脚本，都不写任何文件。有 XiHan.UI 检出或装了 `@xihan-ui/*` 时读本地，否则回落到文档站。

```bash
node scripts/list-components.mjs [关键词]      # 组件标识 · 中文名 · 分类
node scripts/get-component-docs.mjs button     # 一个组件的完整参考页
node scripts/get-tokens.mjs motion             # 令牌名与缺省取值，可按片段过滤
node scripts/get-skin.mjs button               # 默认皮肤源码（只读本地包）
```

指定数据源：`XIHAN_UI_ROOT` 指向 XiHan.UI 检出目录，`XIHAN_UI_SITE` 指向自建文档站。

## 整册机读资产

需要一次性读进上下文时用这几份，它们由文档站构建期生成，与库同源：

- `https://ui.docs.xihanfun.com/llms.txt` —— 全站索引
- `https://ui.docs.xihanfun.com/llms-components.txt` —— 全部组件参考页
- `https://ui.docs.xihanfun.com/llms-guide.txt` —— 核心概念、两个适配器、运行时
- `https://ui.docs.xihanfun.com/llms-tokens.txt` —— 令牌全表
- 任意一页把地址后缀成 `.md` 就是这一页的 Markdown，例如 `https://ui.docs.xihanfun.com/components/button.md`

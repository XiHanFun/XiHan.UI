来源：https://ui.docs.xihanfun.com/components/layout

# Layout `布局`

一整页的骨架：头与脚各横贯一行，侧栏与内容并排占中间那一行。少写一段就少一行或少一列。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/layout" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/layout.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/layout" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/layout" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/layout.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

头与脚各横贯一行，侧栏与内容并排占中间那一行；少写一段就少一行或少一列

```vue
<script setup lang="ts">
import {
  XhLayoutContent,
  XhLayoutFooter,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
} from "@xihan-ui/vue";
</script>

<template>
  <XhLayoutRoot
    bordered
    style="block-size: 280px; border-radius: 8px; overflow: hidden"
  >
    <XhLayoutHeader>控制台</XhLayoutHeader>
    <XhLayoutSider>导航</XhLayoutSider>
    <XhLayoutContent>
      正文区。四段都可缺省，只摆头和内容也是一副合法的骨架。
    </XhLayoutContent>
    <XhLayoutFooter>版本 1.0.0</XhLayoutFooter>
  </XhLayoutRoot>
</template>
```

```html
<xh-layout bordered>
  <div
    data-xh-part="root"
    style="block-size: 280px; border-radius: 8px; overflow: hidden"
  >
    <div data-xh-part="header">控制台</div>
    <div data-xh-part="sider">导航</div>
    <div data-xh-part="content">
      正文区。四段都可缺省，只摆头和内容也是一副合法的骨架。
    </div>
    <div data-xh-part="footer">版本 1.0.0</div>
  </div>
</xh-layout>
```

## 示例

### 折叠侧栏

不传 sider-collapsed 即为非受控，把手按下去只改宽度，侧栏节点一直在

```vue
<script setup lang="ts">
import {
  XhLayoutContent,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
  XhLayoutSiderTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhLayoutRoot
    bordered
    style="block-size: 240px; border-radius: 8px; overflow: hidden"
  >
    <XhLayoutHeader>
      <XhLayoutSiderTrigger>切换</XhLayoutSiderTrigger>
      <span>控制台</span>
    </XhLayoutHeader>
    <XhLayoutSider>导航 · 收藏 · 回收站</XhLayoutSider>
    <XhLayoutContent>
      折起来的是宽度不是高度，侧栏里的滚动位置与输入框都留着。
    </XhLayoutContent>
  </XhLayoutRoot>
</template>
```

```html
<xh-layout bordered>
  <div
    data-xh-part="root"
    style="block-size: 240px; border-radius: 8px; overflow: hidden"
  >
    <div data-xh-part="header">
      <button data-xh-part="sider-trigger">切换</button>
      <span>控制台</span>
    </div>
    <div data-xh-part="sider">导航 · 收藏 · 回收站</div>
    <div data-xh-part="content">
      折起来的是宽度不是高度，侧栏里的滚动位置与输入框都留着。
    </div>
  </div>
</xh-layout>
```

### 受控

传了 sider-collapsed 就由宿主说了算，组件不再自改，只发 sider-collapsed-change

```vue
<script setup lang="ts">
import {
  XhButton,
  XhLayoutContent,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
  XhLayoutSiderTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const collapsed = ref(false);
</script>

<template>
  <div style="display: grid; gap: 12px">
    <XhButton size="sm" @click="collapsed = !collapsed">
      从外面{{ collapsed ? "展开" : "收起" }}
    </XhButton>

    <XhLayoutRoot
      v-model:sider-collapsed="collapsed"
      bordered
      style="block-size: 220px; border-radius: 8px; overflow: hidden"
    >
      <XhLayoutHeader>
        <XhLayoutSiderTrigger>切换</XhLayoutSiderTrigger>
        <span>当前：{{ collapsed ? "已折叠" : "已展开" }}</span>
      </XhLayoutHeader>
      <XhLayoutSider>导航</XhLayoutSider>
      <XhLayoutContent>
        把手与上面那个按钮改的是同一份状态。
      </XhLayoutContent>
    </XhLayoutRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px">
  <xh-button size="sm">
    <button data-xh-part="root" id="layout-controlled-toggle">从外面收起</button>
  </xh-button>

  <xh-layout id="layout-controlled" sider-collapsed="false" bordered>
    <div
      data-xh-part="root"
      style="block-size: 220px; border-radius: 8px; overflow: hidden"
    >
      <div data-xh-part="header">
        <button data-xh-part="sider-trigger">切换</button>
        <span id="layout-controlled-state">当前：已展开</span>
      </div>
      <div data-xh-part="sider">导航</div>
      <div data-xh-part="content">把手与上面那个按钮改的是同一份状态。</div>
    </div>
  </xh-layout>
</div>

<script type="module">
  // 折叠态由这份脚本持有：把手与外部按钮都改它，改完写回元素
  const layout = document.getElementById("layout-controlled");
  const toggle = document.getElementById("layout-controlled-toggle");
  const state = document.getElementById("layout-controlled-state");

  function apply(collapsed) {
    layout.siderCollapsed = collapsed;
    toggle.textContent = collapsed ? "从外面展开" : "从外面收起";
    state.textContent = collapsed ? "当前：已折叠" : "当前：已展开";
  }

  layout.addEventListener("sider-collapsed-change", (event) => {
    apply(event.detail.collapsed);
  });
  toggle.addEventListener("click", () => {
    apply(!layout.siderCollapsed);
  });
</script>
```

### 侧栏位置

sider-placement 决定侧栏挂在行首还是行尾，分隔线也跟着换到挨内容的那一边

```vue
<script setup lang="ts">
import {
  XhLayoutContent,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 16px">
    <XhLayoutRoot
      sider-placement="start"
      bordered
      style="block-size: 160px; border-radius: 8px; overflow: hidden"
    >
      <XhLayoutHeader>侧栏在行首</XhLayoutHeader>
      <XhLayoutSider>导航</XhLayoutSider>
      <XhLayoutContent>正文</XhLayoutContent>
    </XhLayoutRoot>

    <XhLayoutRoot
      sider-placement="end"
      bordered
      style="block-size: 160px; border-radius: 8px; overflow: hidden"
    >
      <XhLayoutHeader>侧栏在行尾</XhLayoutHeader>
      <XhLayoutSider>属性面板</XhLayoutSider>
      <XhLayoutContent>正文</XhLayoutContent>
    </XhLayoutRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px">
  <xh-layout sider-placement="start" bordered>
    <div
      data-xh-part="root"
      style="block-size: 160px; border-radius: 8px; overflow: hidden"
    >
      <div data-xh-part="header">侧栏在行首</div>
      <div data-xh-part="sider">导航</div>
      <div data-xh-part="content">正文</div>
    </div>
  </xh-layout>

  <xh-layout sider-placement="end" bordered>
    <div
      data-xh-part="root"
      style="block-size: 160px; border-radius: 8px; overflow: hidden"
    >
      <div data-xh-part="header">侧栏在行尾</div>
      <div data-xh-part="sider">属性面板</div>
      <div data-xh-part="content">正文</div>
    </div>
  </xh-layout>
</div>
```

### 侧栏宽度

展开与折叠各一档宽度，两档都接受任意 CSS 长度，切换时按皮肤里的过渡走

```vue
<script setup lang="ts">
import {
  XhLayoutContent,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
  XhLayoutSiderTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhLayoutRoot
    sider-width="220px"
    sider-collapsed-width="56px"
    bordered
    style="block-size: 220px; border-radius: 8px; overflow: hidden"
  >
    <XhLayoutHeader>
      <XhLayoutSiderTrigger>切换</XhLayoutSiderTrigger>
      <span>220px ⇄ 56px</span>
    </XhLayoutHeader>
    <XhLayoutSider>导航</XhLayoutSider>
    <XhLayoutContent>
      只写其中一档时，另一档仍取皮肤里的缺省宽度。
    </XhLayoutContent>
  </XhLayoutRoot>
</template>
```

```html
<xh-layout sider-width="220px" sider-collapsed-width="56px" bordered>
  <div
    data-xh-part="root"
    style="block-size: 220px; border-radius: 8px; overflow: hidden"
  >
    <div data-xh-part="header">
      <button data-xh-part="sider-trigger">切换</button>
      <span>220px ⇄ 56px</span>
    </div>
    <div data-xh-part="sider">导航</div>
    <div data-xh-part="content">
      只写其中一档时，另一档仍取皮肤里的缺省宽度。
    </div>
  </div>
</xh-layout>
```

### 吸顶与固定

header-fixed 让头钉在滚动容器上沿，sider-fixed 让侧栏跟着钉住；两个一起用时侧栏自动让开头的高度

```vue
<script setup lang="ts">
import {
  XhLayoutContent,
  XhLayoutFooter,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
} from "@xihan-ui/vue";
</script>

<template>
  <!-- 滚动发生在骨架外面这一层：root 的高度跟着内容长，钉住的两段才有行程可走。
       overflow 写在这里而不是 root 上——写在 root 上，root 自己就成了一个永远滚不动的
       滚动容器，里面的吸附会静悄悄地不生效 -->
  <div
    style="
      block-size: 260px;
      overflow: auto;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <!-- 滚动容器不是视口，把它的可视高度告诉侧栏，侧栏那道高度上限才算得准 -->
    <XhLayoutRoot
      header-fixed
      sider-fixed
      bordered
      style="--xh-layout-scrollport-h: 260px"
    >
      <XhLayoutHeader>控制台</XhLayoutHeader>
      <XhLayoutSider>导航</XhLayoutSider>
      <XhLayoutContent>
        <p v-for="i in 14" :key="i" style="margin-block-end: 12px">
          第 {{ i }} 段正文。向下滚：头钉在上沿，侧栏钉在头的下沿，只有正文在走。
        </p>
      </XhLayoutContent>
      <XhLayoutFooter>版本 1.0.0</XhLayoutFooter>
    </XhLayoutRoot>
  </div>
</template>
```

```html
<!-- 滚动发生在骨架外面这一层，钉住的两段才有行程可走 -->
<div
  style="
    block-size: 260px;
    overflow: auto;
    border: 1px solid var(--xh-border-default);
    border-radius: 8px;
  "
>
  <!-- 把滚动容器的可视高度告诉侧栏，侧栏那道高度上限才算得准 -->
  <xh-layout header-fixed sider-fixed bordered>
    <div data-xh-part="root" style="--xh-layout-scrollport-h: 260px">
      <div data-xh-part="header">控制台</div>
      <div data-xh-part="sider">导航</div>
      <div data-xh-part="content">
        <p style="margin-block-end: 12px">
          第 1 段正文。向下滚：头钉在上沿，侧栏钉在头的下沿，只有正文在走。
        </p>
        <p style="margin-block-end: 12px">第 2 段正文。</p>
        <p style="margin-block-end: 12px">第 3 段正文。</p>
        <p style="margin-block-end: 12px">第 4 段正文。</p>
        <p style="margin-block-end: 12px">第 5 段正文。</p>
        <p style="margin-block-end: 12px">第 6 段正文。</p>
        <p style="margin-block-end: 12px">第 7 段正文。</p>
        <p style="margin-block-end: 12px">第 8 段正文。</p>
        <p style="margin-block-end: 12px">第 9 段正文。</p>
        <p style="margin-block-end: 12px">第 10 段正文。</p>
        <p style="margin-block-end: 12px">第 11 段正文。</p>
        <p style="margin-block-end: 12px">第 12 段正文。</p>
        <p style="margin-block-end: 12px">第 13 段正文。</p>
        <p style="margin-block-end: 12px">第 14 段正文。</p>
      </div>
      <div data-xh-part="footer">版本 1.0.0</div>
    </div>
  </xh-layout>
</div>
```

### 分别固定

两个开关各自独立：只写 header-fixed 时侧栏照常随内容滚走，只写 sider-fixed 时侧栏钉在滚动容器上沿、头照常滚走

```vue
<script setup lang="ts">
import {
  XhLayoutContent,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 16px">
    <div
      style="
        block-size: 200px;
        overflow: auto;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <XhLayoutRoot header-fixed bordered>
        <XhLayoutHeader>只固定头</XhLayoutHeader>
        <XhLayoutSider>导航会滚走</XhLayoutSider>
        <XhLayoutContent>
          <p v-for="i in 10" :key="i" style="margin-block-end: 12px">
            第 {{ i }} 段正文。
          </p>
        </XhLayoutContent>
      </XhLayoutRoot>
    </div>

    <div
      style="
        block-size: 200px;
        overflow: auto;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <!-- 头没固定，侧栏就贴滚动容器的上沿，不必让开谁 -->
      <XhLayoutRoot
        sider-fixed
        bordered
        style="--xh-layout-scrollport-h: 200px"
      >
        <XhLayoutHeader>头会滚走</XhLayoutHeader>
        <XhLayoutSider>只固定侧栏</XhLayoutSider>
        <XhLayoutContent>
          <p v-for="i in 10" :key="i" style="margin-block-end: 12px">
            第 {{ i }} 段正文。
          </p>
        </XhLayoutContent>
      </XhLayoutRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px">
  <div
    style="
      block-size: 200px;
      overflow: auto;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <xh-layout header-fixed bordered>
      <div data-xh-part="root">
        <div data-xh-part="header">只固定头</div>
        <div data-xh-part="sider">导航会滚走</div>
        <div data-xh-part="content">
          <p style="margin-block-end: 12px">第 1 段正文。</p>
          <p style="margin-block-end: 12px">第 2 段正文。</p>
          <p style="margin-block-end: 12px">第 3 段正文。</p>
          <p style="margin-block-end: 12px">第 4 段正文。</p>
          <p style="margin-block-end: 12px">第 5 段正文。</p>
          <p style="margin-block-end: 12px">第 6 段正文。</p>
          <p style="margin-block-end: 12px">第 7 段正文。</p>
          <p style="margin-block-end: 12px">第 8 段正文。</p>
          <p style="margin-block-end: 12px">第 9 段正文。</p>
          <p style="margin-block-end: 12px">第 10 段正文。</p>
        </div>
      </div>
    </xh-layout>
  </div>

  <div
    style="
      block-size: 200px;
      overflow: auto;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <!-- 头没固定，侧栏就贴滚动容器的上沿 -->
    <xh-layout sider-fixed bordered>
      <div data-xh-part="root" style="--xh-layout-scrollport-h: 200px">
        <div data-xh-part="header">头会滚走</div>
        <div data-xh-part="sider">只固定侧栏</div>
        <div data-xh-part="content">
          <p style="margin-block-end: 12px">第 1 段正文。</p>
          <p style="margin-block-end: 12px">第 2 段正文。</p>
          <p style="margin-block-end: 12px">第 3 段正文。</p>
          <p style="margin-block-end: 12px">第 4 段正文。</p>
          <p style="margin-block-end: 12px">第 5 段正文。</p>
          <p style="margin-block-end: 12px">第 6 段正文。</p>
          <p style="margin-block-end: 12px">第 7 段正文。</p>
          <p style="margin-block-end: 12px">第 8 段正文。</p>
          <p style="margin-block-end: 12px">第 9 段正文。</p>
          <p style="margin-block-end: 12px">第 10 段正文。</p>
        </div>
      </div>
    </xh-layout>
  </div>
</div>
```

### 侧栏覆盖档

sider-presentation="sheet" 把侧栏移出画外，唤出来时盖在内容之上；点遮罩或按 Escape 收起

```vue
<script setup lang="ts">
import {
  XhLayoutContent,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
  XhLayoutSiderBackdrop,
  XhLayoutSiderTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhLayoutRoot
    bordered
    default-sider-collapsed
    sider-presentation="sheet"
    style="block-size: 240px; border-radius: 8px; overflow: hidden"
  >
    <XhLayoutHeader>
      <XhLayoutSiderTrigger>菜单</XhLayoutSiderTrigger>
      <span>控制台</span>
    </XhLayoutHeader>
    <XhLayoutSiderBackdrop />
    <XhLayoutSider>导航 · 收藏 · 回收站</XhLayoutSider>
    <XhLayoutContent>
      覆盖档下侧栏不占列，内容占满整宽；面板贴住视口那条边升起来。
    </XhLayoutContent>
  </XhLayoutRoot>
</template>
```

```html
<xh-layout bordered default-sider-collapsed sider-presentation="sheet">
  <div
    data-xh-part="root"
    style="block-size: 240px; border-radius: 8px; overflow: hidden"
  >
    <div data-xh-part="header">
      <button data-xh-part="sider-trigger">菜单</button>
      <span>控制台</span>
    </div>
    <div data-xh-part="sider-backdrop"></div>
    <div data-xh-part="sider">导航 · 收藏 · 回收站</div>
    <div data-xh-part="content">
      覆盖档下侧栏不占列，内容占满整宽；面板贴住视口那条边升起来。
    </div>
  </div>
</xh-layout>
```

## 设计指引

### 何时使用

- 搭一个应用外壳：管理后台、控制台、文档站。
- 侧栏需要折叠，且折叠时节点仍在（只改宽度，不卸载）。

### 何时不用

- 只是把几个块并排：用[弹性布局](./flex)或[栅格](./grid)。
- 两块区域之间要由用户拖动分配空间：用[分栏](./splitter)。
- 侧栏本身是一棵可展开的导航树：布局只出壳，树交给[侧栏导航](./side-nav)。

### 特性

- 七个部件都可选，只写用得上的那几段。
- 折叠只改宽度，侧栏节点一直在：里面的滚动位置与焦点不会丢。
- 展开与折叠各一档宽度，两档都接受任意 CSS 长度。
- `headerFixed` 与 `siderFixed` 各自独立；两个一起用时侧栏自动让开头的高度。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-layout>` |
| Vue 组件 | `XhLayoutContent` `XhLayoutFooter` `XhLayoutHeader` `XhLayoutRoot` `XhLayoutSider` `XhLayoutSiderBackdrop` `XhLayoutSiderTrigger` |
| 组合式函数 | `useLayout` |
| 状态机 | `layoutMachine` |
| 皮肤 | `@xihan-ui/styles/layout.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="layout"`：**`root`** · `header` · `sider-backdrop` · `sider` · `content` · `footer` · `sider-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `siderCollapsed` | `boolean` |  | 受控折叠态：给了值就由宿主说了算。 |
| `defaultSiderCollapsed` | `boolean` |  | 非受控初始折叠态。 |
| `siderWidth` | `string` |  | 展开时侧栏的宽度，任意 CSS 长度；不写则用皮肤里的档位。 |
| `siderCollapsedWidth` | `string` |  | 折叠时侧栏的宽度，任意 CSS 长度；不写则用皮肤里的档位。 |
| `siderPlacement` | `LayoutSiderPlacement` |  | 侧栏挂在行首还是行尾，缺省 start。 |
| `siderBreakpoint` | `LayoutBreakpoint` |  | 侧栏的自适应断点：视口窄于这一档时侧栏按折叠宽显示。 只换宽度不改折叠态——折叠态归 siderCollapsed 那条通道，两者互不干扰。 运行期换档会重绑媒体查询；需要所属 Window.matchMedia 与对应断点令牌。 |
| `siderPresentation` | `LayoutSiderPresentation` |  | 侧栏呈现形态，缺省 inline（在骨架里占一列）。 sheet 是覆盖档：侧栏移出画外，展开时盖在内容之上并铺一层遮罩，内容因此占满整宽。 同时写了 siderBreakpoint 时它只在未达那一档时成立——宽屏照旧占一列，窄屏才覆盖， 且跨档时侧栏跟着开合（进覆盖档收起、回占位档展开），走的是 siderCollapsed 那条通道。 覆盖档不锁焦点、不把背后的内容标成惰性：它是骨架里的一段，不是模态浮层。 |
| `headerFixed` | `boolean` |  | 头吸顶：滚动时头钉在滚动容器的上沿。只落标记，钉住的实现归皮肤。 |
| `siderFixed` | `boolean` |  | 侧栏吸附：滚动时侧栏钉在滚动容器的上沿，头也吸顶时让开头那一条。只落标记，钉住的实现归皮肤。 |
| `bordered` | `boolean` |  | 在头、侧栏、脚与内容之间画分隔线。 |
| `onSiderCollapsedChange` | `(details: LayoutSiderCollapsedChangeDetails) => void` |  | 折叠态变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |
| `onSiderBreakpoint` | `(details: LayoutSiderBreakpointDetails) => void` |  | 断点跨过去时发一次，挂载或更换档位时也发一次当前值。 窄屏要把侧栏换成抽屉的，接这条：组件自己只换宽度。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `sider-collapsed-change` | `LayoutSiderCollapsedChangeDetails` | 折叠态变化；detail 为 `{ collapsed: boolean }` |
| `sider-breakpoint` | `LayoutSiderBreakpointDetails` | 断点跨过去时发，挂载时也发一次当前值；detail 为 `{ matched: boolean }` |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`expanded` · `collapsed`

**事件**：`SIDER.COLLAPSE` · `SIDER.EXPAND` · `SIDER.TOGGLE` · `CONTROLLED.COLLAPSE` · `CONTROLLED.EXPAND`

**判据**：`isSiderCollapsedControlled`

## connect API

`useLayout` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `siderCollapsed` | `boolean` | 侧栏当前是否折叠。 |
| `siderPresentation` | `LayoutSiderPresentation` | 已解析的侧栏呈现形态：写了断点时，覆盖档只在未达那一档时成立。 |
| `setSiderCollapsed` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getSiderBackdropProps` | `() => T['element']` | 覆盖档铺在内容之上的那一层遮罩：点它收起侧栏。 占位档下它带 hidden，不占位也不吃指针。渲染时排在侧栏之前——两层同一个层号，谁盖谁看文档序。 |
| `getSiderProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |
| `getSiderTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in sider-trigger | 折叠/展开 sider |
| `Escape` | sider 按覆盖档盖在内容之上 | 收起 sider |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `sider-backdrop` | `aria-hidden` | 'true' |
| `sider-trigger` | `aria-controls` | `sider` 部件的 id |
| `sider-trigger` | `aria-expanded` | 'false' \| 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/layout.css` 按部件选择：`[data-scope="layout"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-bordered` | ''（条件成立时才出现） |
| `root` | `data-collapsed` | ''（条件成立时才出现） |
| `root` | `data-header-fixed` | ''（条件成立时才出现） |
| `root` | `data-sider-breakpoint` | props.siderBreakpoint |
| `root` | `data-sider-fixed` | ''（条件成立时才出现） |
| `root` | `data-sider-placement` | props.siderPlacement |
| `root` | `data-sider-presentation` | resolveSiderPresentation( prop('siderPresentation'), … |
| `header` | `data-fixed` | ''（条件成立时才出现） |
| `sider-backdrop` | `data-collapsed` | ''（条件成立时才出现） |
| `sider` | `data-collapsed` | ''（条件成立时才出现） |
| `sider` | `data-fixed` | ''（条件成立时才出现） |
| `sider` | `data-placement` | props.siderPlacement |
| `sider` | `data-presentation` | resolveSiderPresentation( prop('siderPresentation'), … |
| `sider-trigger` | `data-collapsed` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-layout-bg` | `root` | `background` | `default` | `--xh-bg-page` | layout 的 root 部件 background 覆盖槽。 |
| `--xh-layout-border` | `footer`<br>`header`<br>`root`<br>`sider` | `border-block-end`<br>`border-block-start`<br>`border-inline-end`<br>`border-inline-start` | `bordered`<br>`placement=end`<br>`placement=start` | `--xh-border-default` | layout 的 footer、header、root、sider 部件 border-block-end、border-block-start、border-inline-end、border-inline-start 覆盖槽。 |
| `--xh-layout-content-padding` | `content` | `padding` | `default` | `--xh-space-4` | layout 的 content 部件 padding 覆盖槽。 |
| `--xh-layout-fg` | `root` | `color` | `default` | `--xh-fg-default` | layout 的 root 部件 color 覆盖槽。 |
| `--xh-layout-footer-bg` | `footer` | `background` | `default` | `--xh-bg-surface` | layout 的 footer 部件 background 覆盖槽。 |
| `--xh-layout-footer-padding` | `footer` | `padding` | `default` | `--xh-space-3` | layout 的 footer 部件 padding 覆盖槽。 |
| `--xh-layout-header-bg` | `header` | `background` | `default` | `--xh-bg-surface` | layout 的 header 部件 background 覆盖槽。 |
| `--xh-layout-header-gap` | `header` | `gap` | `default` | `--xh-space-3` | layout 的 header 部件 gap 覆盖槽。 |
| `--xh-layout-header-h` | `header`<br>`root`<br>`sider` | `block-size`<br>`grid-template-rows`<br>`inset-block-start`<br>`max-block-size` | `default`<br>`fixed`<br>`header-fixed`<br>`sider-fixed` | `3.5rem` | layout 的 header、root、sider 部件 block-size、grid-template-rows、inset-block-start、max-block-size 覆盖槽。 |
| `--xh-layout-header-layer` | `header` | `z-index` | `fixed` | `--xh-layer-sticky` | layout 的 header 部件 z-index 覆盖槽。 |
| `--xh-layout-header-px` | `header` | `padding-inline` | `default` | `--xh-space-4` | layout 的 header 部件 padding-inline 覆盖槽。 |
| `--xh-layout-scrollport-h` | `sider` | `max-block-size` | `fixed`<br>`presentation=sheet` | `100dvh`<br>`100vh` | layout 的 sider 部件 max-block-size 覆盖槽。 |
| `--xh-layout-sider-backdrop-bg` | `sider-backdrop` | `background` | `default` | `--xh-bg-overlay` | layout 的 sider-backdrop 部件 background 覆盖槽。 |
| `--xh-layout-sider-backdrop-layer` | `sider-backdrop` | `z-index` | `default` | `--xh-layer-drawer` | layout 的 sider-backdrop 部件 z-index 覆盖槽。 |
| `--xh-layout-sider-bg` | `sider` | `background` | `default` | `--xh-bg-subtle` | layout 的 sider 部件 background 覆盖槽。 |
| `--xh-layout-sider-collapsed-w` | `root`<br>`sider` | `inline-size` | `collapsed`<br>`sider-breakpoint` | `4rem` | layout 的 root、sider 部件 inline-size 覆盖槽。 |
| `--xh-layout-sider-layer` | `sider` | `z-index` | `presentation=sheet` | `--xh-layer-drawer` | layout 的 sider 部件 z-index 覆盖槽。 |
| `--xh-layout-sider-padding` | `sider` | `padding`<br>`padding-block-end`<br>`padding-block-start`<br>`padding-inline` | `default`<br>`presentation=sheet` | `--xh-space-3` | layout 的 sider 部件 padding、padding-block-end、padding-block-start、padding-inline 覆盖槽。 |
| `--xh-layout-sider-shadow` | `sider` | `box-shadow` | `presentation=sheet` | `--xh-elevation-sheet` | layout 的 sider 部件 box-shadow 覆盖槽。 |
| `--xh-layout-sider-trigger-bg` | `sider-trigger` | `background` | `default` | `transparent` | layout 的 sider-trigger 部件 background 覆盖槽。 |
| `--xh-layout-sider-trigger-bg-active` | `sider-trigger` | `background` | `active` | `--xh-bg-subtle-active` | layout 的 sider-trigger 部件 background 覆盖槽。 |
| `--xh-layout-sider-trigger-bg-hover` | `sider-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | layout 的 sider-trigger 部件 background 覆盖槽。 |
| `--xh-layout-sider-trigger-fg` | `sider-trigger` | `color` | `default` | `--xh-fg-default` | layout 的 sider-trigger 部件 color 覆盖槽。 |
| `--xh-layout-sider-trigger-gap` | `sider-trigger` | `gap` | `default` | `--xh-control-gap-sm` | layout 的 sider-trigger 部件 gap 覆盖槽。 |
| `--xh-layout-sider-trigger-px` | `sider-trigger` | `padding-inline` | `default` | `--xh-control-px-sm` | layout 的 sider-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-layout-sider-trigger-radius` | `sider-trigger` | `border-radius` | `default` | `--xh-shape-control` | layout 的 sider-trigger 部件 border-radius 覆盖槽。 |
| `--xh-layout-sider-w` | `root`<br>`sider` | `inline-size` | `@media (min-width: 1024px)`<br>`@media (min-width: 1280px)`<br>`@media (min-width: 640px)`<br>`@media (min-width: 768px)`<br>`default`<br>`presentation=sheet`<br>`sider-breakpoint=lg`<br>`sider-breakpoint=md`<br>`sider-breakpoint=sm`<br>`sider-breakpoint=xl` | `15rem` | layout 的 root、sider 部件 inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `inline-size` · `opacity` · `scale` · `translate` · `visibility` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤按视口分档：`min-width: 1024px` · `min-width: 1280px` · `min-width: 640px` · `min-width: 768px`。

- `siderBreakpoint` 给一档（`sm` / `md` / `lg` / `xl`），视口窄于这一档时侧栏按折叠宽显示。
  它只换宽度、不改折叠态：折叠态归 `siderCollapsed` 那条通道，两者互不干扰。
- 断点跨过去时发 `onSiderBreakpoint`，挂载时也发一次当前值。要在窄屏改换别的排布，接这个回调。
- 运行期修改 `siderBreakpoint` 会立即切换媒体查询、报告新档位当前值；移除该属性会解除观察并清除窄屏标记，保留当前折叠态。
  `siderPresentation` 切到 `sheet` 时立即应用当前断点，受控折叠态仍由宿主写回。
  断点令牌在属性更新和媒体查询事件时重新读取，单独修改 CSSOM 不会主动触发重绑。
  已指定断点却缺少令牌或所属 Window 的 `matchMedia` 会明确报错；同步失败会解除监听，不再沿用旧档位，需以有效属性更新重新建立。
- `siderPresentation="sheet"` 是覆盖档：侧栏移出画外，展开时盖在内容之上并铺一层遮罩，内容占满整宽。
  与 `siderBreakpoint` 配着写就是「宽屏占一列、窄屏覆盖」——跨档时侧栏跟着开合，
  进覆盖档收起、回占位档展开，走的仍是 `siderCollapsed` 那条通道。
- 覆盖档下点遮罩或按 Escape 收起侧栏，`sider-trigger` 照旧是把它唤出来的那个控件。
- 覆盖侧栏通过共享 Document Hub 的空栈 fallback 接收 Escape，并读取当前组件的
  `RuntimeConfig.layerRegistry`。capture 时只要该栈存在对话框、菜单等 Layer，本键就归上层消费；
  即使 Layer 同步退栈，仍要到下一次 Escape 才收侧栏。自定义 LayerRegistry 与同一 Document
  的默认注册表互不干扰。
- 同一 LayerRegistry 下同时展开多个覆盖侧栏时，每次 Escape 只收最近展开的一个；受控侧栏未写回
  折叠态时持续占住这个位置。占位档与当前断点解析为 inline 的侧栏会被动态跳过。
- 直接使用 headless 机器时，要在 mount 前把与机器 Scope 属于同一 Document 的 `RuntimeConfig`
  写进 `LayoutRefs.config`；缺失或跨 Document 混接都会明确失败。Vue、React 与 Web Components
  适配器已经完成这段接线。
- 覆盖档不锁焦点、不把背后的内容标成惰性：它是骨架里的一段，不是模态浮层。要模态用[抽屉](./drawer)。
- 遮罩渲染在侧栏之前：两层同一个层号，谁盖谁由文档序决定。
- 覆盖档下侧栏贴死视口，内衬与安全区取大的一头，所以 `--xh-layout-sider-padding` 在这一档要写单值（`max()` 收不了简写的多值）。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- `sider` 里放[侧栏导航](./side-nav)，`header` 里放[菜单栏](./menubar)或[工具栏](./toolbar)，`content` 里放[页头](./page-header)。

## 最佳实践

- 内容区自己定高、内部滚动，别让整页滚动——吸顶的头与侧栏才立得住。
- 折叠态的宽度要放得下图标加内边距，否则图标会被裁。

## 反模式

- 折叠时把侧栏整个卸载再挂回来：展开的分支、滚动位置、焦点全部重置。
- 头和侧栏都不吸附却给它们设了 `position: fixed`：占位没了，内容会被盖住。

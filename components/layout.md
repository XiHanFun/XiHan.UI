来源：https://ui.docs.xihanfun.com/components/layout

# 布局 `layout`

一整页的骨架：头与脚各横贯一行，侧栏与内容并排占中间那一行。少写一段就少一行或少一列。

## 何时使用

- 搭一个应用外壳：管理后台、控制台、文档站。
- 侧栏需要折叠，且折叠时节点仍在（只改宽度，不卸载）。

## 何时不用

- 只是把几个块并排：用[弹性布局](./flex)或[栅格](./grid)。
- 两块区域之间要由用户拖动分配空间：用[分栏](./splitter)。
- 侧栏本身是一棵可展开的导航树：布局只出壳，树交给[侧栏导航](./side-nav)。

## 特性

- 七个部件都可选，只写用得上的那几段。
- 折叠只改宽度，侧栏节点一直在：里面的滚动位置与焦点不会丢。
- 展开与折叠各一档宽度，两档都接受任意 CSS 长度。
- `headerFixed` 与 `siderFixed` 各自独立；两个一起用时侧栏自动让开头的高度。

## 示例

### 基础用法

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
| `siderBreakpoint` | `LayoutBreakpoint` |  | 侧栏的自适应断点：视口窄于这一档时侧栏按折叠宽显示。 只换宽度不改折叠态——折叠态归 siderCollapsed 那条通道，两者互不干扰。 |
| `siderPresentation` | `LayoutSiderPresentation` |  | 侧栏呈现形态，缺省 inline（在骨架里占一列）。 sheet 是覆盖档：侧栏移出画外，展开时盖在内容之上并铺一层遮罩，内容因此占满整宽。 同时写了 siderBreakpoint 时它只在未达那一档时成立——宽屏照旧占一列，窄屏才覆盖， 且跨档时侧栏跟着开合（进覆盖档收起、回占位档展开），走的是 siderCollapsed 那条通道。 覆盖档不锁焦点、不把背后的内容标成惰性：它是骨架里的一段，不是模态浮层。 |
| `headerFixed` | `boolean` |  | 头吸顶：滚动时头钉在滚动容器的上沿。只落标记，钉住的实现归皮肤。 |
| `siderFixed` | `boolean` |  | 侧栏吸附：滚动时侧栏钉在滚动容器的上沿，头也吸顶时让开头那一条。只落标记，钉住的实现归皮肤。 |
| `bordered` | `boolean` |  | 在头、侧栏、脚与内容之间画分隔线。 |
| `onSiderCollapsedChange` | `(details: LayoutSiderCollapsedChangeDetails) => void` |  | 折叠态变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |
| `onSiderBreakpoint` | `(details: LayoutSiderBreakpointDetails) => void` |  | 断点跨过去时发一次，挂载时也发一次当前值。 窄屏要把侧栏换成抽屉的，接这条：组件自己只换宽度。 |

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

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-layout-bg` · `--xh-layout-border` · `--xh-layout-content-padding` · `--xh-layout-fg` · `--xh-layout-footer-bg` · `--xh-layout-footer-padding` · `--xh-layout-header-bg` · `--xh-layout-header-gap` · `--xh-layout-header-h` · `--xh-layout-header-layer` · `--xh-layout-header-px` · `--xh-layout-scrollport-h` · `--xh-layout-sider-backdrop-bg` · `--xh-layout-sider-backdrop-layer` · `--xh-layout-sider-bg` · `--xh-layout-sider-collapsed-w` · `--xh-layout-sider-layer` · `--xh-layout-sider-padding` · `--xh-layout-sider-shadow` · `--xh-layout-sider-trigger-bg` · `--xh-layout-sider-trigger-bg-active` · `--xh-layout-sider-trigger-bg-hover` · `--xh-layout-sider-trigger-fg` · `--xh-layout-sider-trigger-gap` · `--xh-layout-sider-trigger-px` · `--xh-layout-sider-trigger-radius` · `--xh-layout-sider-w`

## 动效

`background` · `inline-size` · `opacity` · `scale` · `translate` · `visibility` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤按视口分档：`min-width: 1024px` · `min-width: 1280px` · `min-width: 640px` · `min-width: 768px`。

- `siderBreakpoint` 给一档（`sm` / `md` / `lg` / `xl`），视口窄于这一档时侧栏按折叠宽显示。
  它只换宽度、不改折叠态：折叠态归 `siderCollapsed` 那条通道，两者互不干扰。
- 断点跨过去时发 `onSiderBreakpoint`，挂载时也发一次当前值。要在窄屏改换别的排布，接这个回调。
- `siderPresentation="sheet"` 是覆盖档：侧栏移出画外，展开时盖在内容之上并铺一层遮罩，内容占满整宽。
  与 `siderBreakpoint` 配着写就是「宽屏占一列、窄屏覆盖」——跨档时侧栏跟着开合，
  进覆盖档收起、回占位档展开，走的仍是 `siderCollapsed` 那条通道。
- 覆盖档下点遮罩或按 Escape 收起侧栏，`sider-trigger` 照旧是把它唤出来的那个控件。
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

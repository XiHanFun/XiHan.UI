来源：https://ui.docs.xihanfun.com/components/affix

# Affix `固钉`

滚过判定线就把内容钉在滚动容器可视区的边上；占位盒留在原位，页面不跳。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/affix" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/affix.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/affix" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/affix" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/affix.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

滚过判定线就把内容钉在滚动容器可视区的上边；占位盒留在原位，页面不跳

```vue
<script setup lang="ts">
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="scrollEl"
    style="
      block-size: 240px;
      overflow: auto;
      padding: 12px;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <p style="block-size: 120px">往下滚，下面那条会钉在容器顶边。</p>

    <!-- target 指向真正在滚的那层；不给就按整页滚动算 -->
    <XhAffixRoot :target="scrollEl">
      <XhAffixContent
        style="
          padding: 8px 12px;
          border-radius: 6px;
          background: var(--xh-bg-brand);
          color: var(--xh-fg-on-brand);
        "
      >
        我会钉在顶边
      </XhAffixContent>
    </XhAffixRoot>

    <p style="block-size: 600px">后面还有很长的内容，一直滚到底再滚回去。</p>
  </div>
</template>
```

```html
<div
  id="affix-basic-scroll"
  style="
    block-size: 240px;
    overflow: auto;
    padding: 12px;
    border: 1px solid var(--xh-border-default);
    border-radius: 8px;
  "
>
  <p style="block-size: 120px">往下滚，下面那条会钉在容器顶边。</p>

  <!-- target 指向真正在滚的那层；不给就按整页滚动算 -->
  <template id="affix-basic-tpl">
    <xh-affix style="display: block">
      <div data-xh-part="root">
        <div
          data-xh-part="content"
          style="
            padding: 8px 12px;
            border-radius: 6px;
            background: var(--xh-bg-brand);
            color: var(--xh-fg-on-brand);
          "
        >
          我会钉在顶边
        </div>
      </div>
    </xh-affix>
  </template>

  <p style="block-size: 600px">后面还有很长的内容，一直滚到底再滚回去。</p>
</div>

<script type="module">
  // 滚动容器是 DOM 句柄，只走属性；先交句柄再进 DOM，滚动观察器才挂得到这一层
  const template = document.getElementById("affix-basic-tpl");
  const affix = template.content.firstElementChild;
  affix.target = document.getElementById("affix-basic-scroll");
  template.replaceWith(affix);
</script>
```

## 示例

### 让出吸顶栏

offset-top 把判定线往下挪，钉住后也在同一位置留出这段高度

```vue
<script setup lang="ts">
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="scrollEl"
    style="
      position: relative;
      block-size: 240px;
      overflow: auto;
      padding: 12px;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <!-- 容器自带一条 40px 的吸顶栏，钉住的内容要躲开它 -->
    <div
      style="
        position: sticky;
        inset-block-start: 0;
        z-index: 1;
        block-size: 40px;
        display: flex;
        align-items: center;
        padding-inline: 8px;
        background: var(--xh-bg-subtle);
      "
    >
      吸顶栏
    </div>

    <p style="block-size: 120px">往下滚。</p>

    <XhAffixRoot :target="scrollEl" :offset-top="40">
      <XhAffixContent
        style="
          padding: 8px 12px;
          border-radius: 6px;
          background: var(--xh-bg-brand);
          color: var(--xh-fg-on-brand);
        "
      >
        钉在吸顶栏下方 40px 处
      </XhAffixContent>
    </XhAffixRoot>

    <p style="block-size: 600px">后面还有很长的内容。</p>
  </div>
</template>
```

```html
<div
  id="affix-offset-top-scroll"
  style="
    position: relative;
    block-size: 240px;
    overflow: auto;
    padding: 12px;
    border: 1px solid var(--xh-border-default);
    border-radius: 8px;
  "
>
  <!-- 容器自带一条 40px 的吸顶栏，钉住的内容要躲开它 -->
  <div
    style="
      position: sticky;
      inset-block-start: 0;
      z-index: 1;
      block-size: 40px;
      display: flex;
      align-items: center;
      padding-inline: 8px;
      background: var(--xh-bg-subtle);
    "
  >
    吸顶栏
  </div>

  <p style="block-size: 120px">往下滚。</p>

  <template id="affix-offset-top-tpl">
    <xh-affix offset-top="40" style="display: block">
      <div data-xh-part="root">
        <div
          data-xh-part="content"
          style="
            padding: 8px 12px;
            border-radius: 6px;
            background: var(--xh-bg-brand);
            color: var(--xh-fg-on-brand);
          "
        >
          钉在吸顶栏下方 40px 处
        </div>
      </div>
    </xh-affix>
  </template>

  <p style="block-size: 600px">后面还有很长的内容。</p>
</div>

<script type="module">
  // 滚动容器是 DOM 句柄，只走属性；先交句柄再进 DOM，滚动观察器才挂得到这一层
  const template = document.getElementById("affix-offset-top-tpl");
  const affix = template.content.firstElementChild;
  affix.target = document.getElementById("affix-offset-top-scroll");
  template.replaceWith(affix);
</script>
```

### 贴下边

给了 offset-bottom 就改贴可视区的下边，判定线也换到下边

```vue
<script setup lang="ts">
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="scrollEl"
    style="
      block-size: 240px;
      overflow: auto;
      padding: 12px;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <p style="block-size: 80px">这块工具条在滚到它之前就贴在容器底边，滚过去之后回到常规流。</p>

    <XhAffixRoot :target="scrollEl" :offset-bottom="12">
      <XhAffixContent
        style="
          display: flex;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          background: var(--xh-bg-surface-raised);
          box-shadow: var(--xh-elevation-floating);
        "
      >
        <span>共 42 项</span>
        <span>已选 3 项</span>
      </XhAffixContent>
    </XhAffixRoot>

    <p style="block-size: 600px">下面是很长的列表内容。</p>
  </div>
</template>
```

```html
<div
  id="affix-offset-bottom-scroll"
  style="
    block-size: 240px;
    overflow: auto;
    padding: 12px;
    border: 1px solid var(--xh-border-default);
    border-radius: 8px;
  "
>
  <p style="block-size: 80px">
    这块工具条在滚到它之前就贴在容器底边，滚过去之后回到常规流。
  </p>

  <template id="affix-offset-bottom-tpl">
    <xh-affix offset-bottom="12" style="display: block">
      <div data-xh-part="root">
        <div
          data-xh-part="content"
          style="
            display: flex;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 6px;
            background: var(--xh-bg-surface-raised);
            box-shadow: var(--xh-elevation-floating);
          "
        >
          <span>共 42 项</span>
          <span>已选 3 项</span>
        </div>
      </div>
    </xh-affix>
  </template>

  <p style="block-size: 600px">下面是很长的列表内容。</p>
</div>

<script type="module">
  // 滚动容器是 DOM 句柄，只走属性；先交句柄再进 DOM，滚动观察器才挂得到这一层
  const template = document.getElementById("affix-offset-bottom-tpl");
  const affix = template.content.firstElementChild;
  affix.target = document.getElementById("affix-offset-bottom-scroll");
  template.replaceWith(affix);
</script>
```

### 监听吸附状态

affix-change 报吸住与松开；默认插槽也把 affixed 透出来

```vue
<script setup lang="ts">
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
const affixed = ref(false);

function onAffixChange(details: { affixed: boolean }): void {
  affixed.value = details.affixed;
}
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%">
    <div
      ref="scrollEl"
      style="
        block-size: 220px;
        overflow: auto;
        padding: 12px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <p style="block-size: 120px">往下滚，下面的状态会跟着变。</p>

      <XhAffixRoot v-slot="{ affixed: pinned }" :target="scrollEl" @affix-change="onAffixChange">
        <XhAffixContent
          style="padding: 8px 12px; border-radius: 6px; background: var(--xh-bg-subtle)"
        >
          {{ pinned ? "已钉住" : "在常规流里" }}
        </XhAffixContent>
      </XhAffixRoot>

      <p style="block-size: 600px">后面还有很长的内容。</p>
    </div>

    <span>affix-change 最近一次报的是：{{ affixed ? "吸住" : "松开" }}</span>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; inline-size: 100%">
  <div
    id="affix-change-scroll"
    style="
      block-size: 220px;
      overflow: auto;
      padding: 12px;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <p style="block-size: 120px">往下滚，下面的状态会跟着变。</p>

    <template id="affix-change-tpl">
      <xh-affix style="display: block">
        <div data-xh-part="root">
          <!-- 同一份状态也写在这个部件的 data-fixed 上，纯样式的场合不必接事件 -->
          <div
            data-xh-part="content"
            style="padding: 8px 12px; border-radius: 6px; background: var(--xh-bg-subtle)"
          >
            在常规流里
          </div>
        </div>
      </xh-affix>
    </template>

    <p style="block-size: 600px">后面还有很长的内容。</p>
  </div>

  <span>affix-change 最近一次报的是：<span id="affix-change-readout">松开</span></span>
</div>

<script type="module">
  // 滚动容器是 DOM 句柄，只走属性；先交句柄再进 DOM，滚动观察器才挂得到这一层
  const template = document.getElementById("affix-change-tpl");
  const affix = template.content.firstElementChild;
  const content = affix.querySelector('[data-xh-part="content"]');
  const readout = document.getElementById("affix-change-readout");
  affix.target = document.getElementById("affix-change-scroll");
  template.replaceWith(affix);

  affix.addEventListener("affix-change", (event) => {
    const { affixed } = event.detail;
    content.textContent = affixed ? "已钉住" : "在常规流里";
    readout.textContent = affixed ? "吸住" : "松开";
  });
</script>
```

## 设计指引

### 何时使用

- 表格的操作栏、表单的提交条、文章的目录，需要滚动时一直可达。

### 何时不用

- 元素从一开始就该钉住：直接写 `position: sticky`，不需要判定线。
- 要钉的是整块页面骨架（头、侧栏）：用[布局](./layout)的吸顶开关。
- 需要滚到顶部的按钮：那是[回到顶部](./back-top)。

### 特性

- 占位盒留在原位：吸住的那一刻页面不会突然少一段高度。
- `offsetTop` 把判定线往下挪，钉住后也在同一位置留出这段高度；给了 `offsetBottom` 就改贴下边。
- 吸附状态会回调，默认插槽也把它透出来。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-affix>` |
| Vue 组件 | `XhAffixContent` `XhAffixRoot` |
| 组合式函数 | `useAffix` |
| 状态机 | `affixMachine` |
| 皮肤 | `@xihan-ui/styles/affix.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="affix"`：**`root`** · **`content`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `offsetTop` | `number` |  | 吸住后距滚动容器可视区上边的距离（px）。 |
| `offsetBottom` | `number` |  | 吸住后距滚动容器可视区下边的距离（px）；给了它就改贴下边。 |
| `onAffixChange` | `(details: AffixChangeDetails) => void` |  | 吸附状态变化回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `affix-change` | `AffixChangeDetails` | 吸附状态变化；detail 为 `{ affixed: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhAffixRoot` | `default` | `AffixRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`released` · `affixed`

**事件**：`SCROLL.RESOLVE`

**判据**：`shouldAffix` · `shouldRelease`

## connect API

`useAffix` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `affixed` | `boolean` | 此刻是不是吸住了。 |
| `getRootProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/affix.css` 按部件选择：`[data-scope="affix"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `content` | `data-fixed` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-affix-layer` | `content` | `z-index` | `fixed` | `--xh-layer-sticky` | affix 的 content 部件 z-index 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

## 组合

- 与[锚点](./anchor)配合做吸顶目录；与[工具栏](./toolbar)配合做吸顶操作条。

## 最佳实践

- 页面已有吸顶栏时把栏高填进 `offsetTop`，否则会两层叠在一起。
- 钉住后给一点视觉变化（阴影或描边），让用户知道它已经脱离了原位。

## 反模式

- 一屏里钉住多个条：可视高度被吃光，正文只剩一条缝。
- 在移动端钉住高条：小屏上这块面积很贵。

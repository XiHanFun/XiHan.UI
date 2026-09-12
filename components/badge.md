来源：https://ui.docs.xihanfun.com/components/badge

# Badge `徽标`

提醒你注意某个东西：它有几条未读、处在什么状态、是不是新的。
徽标说的是「有事情发生了」，不是「这是什么」——后者是[标签](./tag)的活。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/badge" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/badge.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/badge" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/badge" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/badge.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

被标记的东西写进默认插槽，角标自己贴到它的角上；计数、上限截断与 0 值收起都归角标算

```vue
<script setup lang="ts">
import { XhBadge, XhButton } from "@xihan-ui/vue";
import { ref } from "vue";

const count = ref(5);
</script>

<template>
  <div style="display: flex; align-items: center; gap: 24px">
    <XhBadge :count="count" tone="danger" :label="`${count} 条未读`">
      <XhButton variant="outline">收件箱</XhButton>
    </XhBadge>

    <XhBadge :count="128" :max="99" tone="danger" label="128 条未读">
      <XhButton variant="outline">通知</XhButton>
    </XhBadge>

    <!-- 计数为 0 时整枚收起，宿主不必自己判 -->
    <XhBadge :count="0" tone="danger">
      <XhButton variant="outline">已读完</XhButton>
    </XhBadge>

    <div style="display: flex; gap: 8px">
      <XhButton size="sm" @click="count += 1">+1</XhButton>
      <XhButton size="sm" @click="count = Math.max(0, count - 1)">-1</XhButton>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 24px">
  <xh-badge count="5" tone="danger" label="5 条未读">
    <span data-xh-part="root">
      <xh-button variant="outline"><button data-xh-part="root">收件箱</button></xh-button>
      <span data-xh-part="indicator"></span>
    </span>
  </xh-badge>

  <xh-badge count="128" max="99" tone="danger" label="128 条未读">
    <span data-xh-part="root">
      <xh-button variant="outline"><button data-xh-part="root">通知</button></xh-button>
      <span data-xh-part="indicator"></span>
    </span>
  </xh-badge>

  <!-- 计数为 0 时整枚收起，宿主不必自己判 -->
  <xh-badge count="0" tone="danger">
    <span data-xh-part="root">
      <xh-button variant="outline"><button data-xh-part="root">已读完</button></xh-button>
      <span data-xh-part="indicator"></span>
    </span>
  </xh-badge>
</div>
```

## 示例

### 圆点与落点

dot 只表示「有」不表示「有几个」；placement 决定挂在哪个角，rtl 下 end 自动落到左边

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarRoot, XhBadge, XhButton } from "@xihan-ui/vue";

const corners = ["top-end", "top-start", "bottom-end", "bottom-start"] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px">
    <div style="display: flex; align-items: center; gap: 24px">
      <XhBadge dot tone="danger" label="有新消息">
        <XhButton variant="outline">消息</XhButton>
      </XhBadge>

      <!-- 在线状态点挂在头像右下角 -->
      <XhBadge dot tone="success" placement="bottom-end" label="在线">
        <XhAvatarRoot>
          <XhAvatarFallback>曦</XhAvatarFallback>
        </XhAvatarRoot>
      </XhBadge>

      <XhBadge dot tone="neutral" placement="bottom-end" label="离线">
        <XhAvatarRoot>
          <XhAvatarFallback>寒</XhAvatarFallback>
        </XhAvatarRoot>
      </XhBadge>
    </div>

    <div style="display: flex; align-items: center; gap: 24px">
      <XhBadge v-for="c in corners" :key="c" :count="9" tone="danger" :placement="c">
        <XhButton variant="outline">{{ c }}</XhButton>
      </XhBadge>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 24px">
  <div style="display: flex; align-items: center; gap: 24px">
    <xh-badge dot tone="danger" label="有新消息">
      <span data-xh-part="root">
        <xh-button variant="outline"><button data-xh-part="root">消息</button></xh-button>
        <span data-xh-part="indicator"></span>
      </span>
    </xh-badge>

    <!-- 在线状态点挂在头像右下角 -->
    <xh-badge dot tone="success" placement="bottom-end" label="在线">
      <span data-xh-part="root">
        <xh-avatar>
          <span data-xh-part="root">
            <span data-xh-part="fallback">曦</span>
          </span>
        </xh-avatar>
        <span data-xh-part="indicator"></span>
      </span>
    </xh-badge>

    <xh-badge dot tone="neutral" placement="bottom-end" label="离线">
      <span data-xh-part="root">
        <xh-avatar>
          <span data-xh-part="root">
            <span data-xh-part="fallback">寒</span>
          </span>
        </xh-avatar>
        <span data-xh-part="indicator"></span>
      </span>
    </xh-badge>
  </div>

  <div style="display: flex; align-items: center; gap: 24px">
    <xh-badge count="9" tone="danger" placement="top-end">
      <span data-xh-part="root">
        <xh-button variant="outline"
          ><button data-xh-part="root">top-end</button></xh-button
        >
        <span data-xh-part="indicator"></span>
      </span>
    </xh-badge>

    <xh-badge count="9" tone="danger" placement="top-start">
      <span data-xh-part="root">
        <xh-button variant="outline"
          ><button data-xh-part="root">top-start</button></xh-button
        >
        <span data-xh-part="indicator"></span>
      </span>
    </xh-badge>

    <xh-badge count="9" tone="danger" placement="bottom-end">
      <span data-xh-part="root">
        <xh-button variant="outline"
          ><button data-xh-part="root">bottom-end</button></xh-button
        >
        <span data-xh-part="indicator"></span>
      </span>
    </xh-badge>

    <xh-badge count="9" tone="danger" placement="bottom-start">
      <span data-xh-part="root">
        <xh-button variant="outline"
          ><button data-xh-part="root">bottom-start</button></xh-button
        >
        <span data-xh-part="indicator"></span>
      </span>
    </xh-badge>
  </div>
</div>
```

### 语气与尺寸

tone 决定用哪族颜色——角标现实里主要是未读红点与在线/离线点；size 换的是圆点直径、两位数时的最小宽度与字号

```vue
<script setup lang="ts">
import { XhBadge, XhButton } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px">
    <div style="display: flex; align-items: center; gap: 24px">
      <XhBadge v-for="t in tones" :key="t" :count="9" :tone="t">
        <XhButton variant="outline">{{ t }}</XhButton>
      </XhBadge>
    </div>

    <div style="display: flex; align-items: center; gap: 24px">
      <XhBadge v-for="s in sizes" :key="s" :count="88" tone="danger" :size="s">
        <XhButton variant="outline">{{ s }}</XhButton>
      </XhBadge>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 24px">
  <div style="display: flex; align-items: center; gap: 24px">
    <xh-badge count="9" tone="brand">
      <span data-xh-part="root">
        <xh-button variant="outline"><button data-xh-part="root">brand</button></xh-button>
        <span data-xh-part="indicator"></span>
      </span>
    </xh-badge>

    <xh-badge count="9" tone="neutral">
      <span data-xh-part="root">
        <xh-button variant="outline"
          ><button data-xh-part="root">neutral</button></xh-button
        >
        <span data-xh-part="indicator"></span>
      </span>
    </xh-badge>

    <xh-badge count="9" tone="success">
      <span data-xh-part="root">
        <xh-button variant="outline"
          ><button data-xh-part="root">success</button></xh-button
        >
        <span data-xh-part="indicator"></span>
      </span>
    </xh-badge>

    <xh-badge count="9" tone="warning">
      <span data-xh-part="root">
        <xh-button variant="outline"
          ><button data-xh-part="root">warning</button></xh-button
        >
        <span data-xh-part="indicator"></span>
      </span>
    </xh-badge>

    <xh-badge count="9" tone="danger">
      <span data-xh-part="root">
        <xh-button variant="outline"
          ><button data-xh-part="root">danger</button></xh-button
        >
        <span data-xh-part="indicator"></span>
      </span>
    </xh-badge>

    <xh-badge count="9" tone="info">
      <span data-xh-part="root">
        <xh-button variant="outline"><button data-xh-part="root">info</button></xh-button>
        <span data-xh-part="indicator"></span>
      </span>
    </xh-badge>
  </div>

  <div style="display: flex; align-items: center; gap: 24px">
    <xh-badge count="88" tone="danger" size="sm">
      <span data-xh-part="root">
        <xh-button variant="outline"><button data-xh-part="root">sm</button></xh-button>
        <span data-xh-part="indicator"></span>
      </span>
    </xh-badge>

    <xh-badge count="88" tone="danger" size="md">
      <span data-xh-part="root">
        <xh-button variant="outline"><button data-xh-part="root">md</button></xh-button>
        <span data-xh-part="indicator"></span>
      </span>
    </xh-badge>

    <xh-badge count="88" tone="danger" size="lg">
      <span data-xh-part="root">
        <xh-button variant="outline"><button data-xh-part="root">lg</button></xh-button>
        <span data-xh-part="indicator"></span>
      </span>
    </xh-badge>
  </div>
</div>
```

### 自定义角标内容

拆成 Root + Indicator 两件：角标里能自己排版，插槽拿得到算好的计数；不写内容才回落那串数字，showZero 让 0 留在原地

```vue
<script setup lang="ts">
import {
  XhAvatarFallback,
  XhAvatarRoot,
  XhBadgeIndicator,
  XhBadgeRoot,
  XhButton,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 32px">
    <!-- 插槽拿到算好的计数，单位由作者往后接 -->
    <XhBadgeRoot :count="12" tone="danger" label="12 条未读">
      <XhButton variant="outline">收件箱</XhButton>
      <XhBadgeIndicator v-slot="{ text }">{{ text }} 条</XhBadgeIndicator>
    </XhBadgeRoot>

    <!-- 不吃 count 的一枚：角标里是一句短标记，不是数字 -->
    <XhBadgeRoot tone="brand" label="有新功能">
      <XhButton variant="outline">工作台</XhButton>
      <XhBadgeIndicator>NEW</XhBadgeIndicator>
    </XhBadgeRoot>

    <!-- showZero：计数归零也留在原地，报的是「这里确实是 0」而不是「这里没有角标」 -->
    <XhBadgeRoot :count="0" show-zero tone="neutral" label="0 条待办">
      <XhAvatarRoot>
        <XhAvatarFallback>曦</XhAvatarFallback>
      </XhAvatarRoot>
      <XhBadgeIndicator />
    </XhBadgeRoot>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 32px">
  <!-- 作者自己写了内容就以内容为准，元素不再往里填计数 -->
  <xh-badge count="12" tone="danger" label="12 条未读">
    <span data-xh-part="root">
      <xh-button variant="outline"><button data-xh-part="root">收件箱</button></xh-button>
      <span data-xh-part="indicator">12 条</span>
    </span>
  </xh-badge>

  <!-- 不吃 count 的一枚：角标里是一句短标记，不是数字 -->
  <xh-badge tone="brand" label="有新功能">
    <span data-xh-part="root">
      <xh-button variant="outline"><button data-xh-part="root">工作台</button></xh-button>
      <span data-xh-part="indicator">NEW</span>
    </span>
  </xh-badge>

  <!-- show-zero：计数归零也留在原地，报的是「这里确实是 0」而不是「这里没有角标」 -->
  <xh-badge count="0" show-zero tone="neutral" label="0 条待办">
    <span data-xh-part="root">
      <xh-avatar>
        <span data-xh-part="root">
          <span data-xh-part="fallback">曦</span>
        </span>
      </xh-avatar>
      <span data-xh-part="indicator"></span>
    </span>
  </xh-badge>
</div>
```

## 设计指引

### 何时使用

- 计数角标：未读消息、购物车件数、待办条数。
- 小红点：只表示「有新的」，不说有几条。
- 状态提示：在线 / 离线、进行中、新。
- 附着在按钮、头像、标签页、菜单项上，报告那个东西的状态。

### 何时不用

- 表达「这是什么」——分类、技能、筛选条件：用[标签](./tag)，它承载实体身份，还能被摘掉。
- 用户要点它来筛选或删除：徽标不接交互，那是标签的语义。
- 表达进度：用[进度条](./progress)。
- 是一个可开关的选项：用[切换按钮](./toggle)。

### 特性

- 语气 · 尺寸两轴与其余组件同源；角标只有一种形态，没有形态轴。
- `placement` 决定挂在哪个角，四角可选，跟随文字方向。
- `count` 自己出数字，超过 `max`（默认 99）写成「99+」。
- 计数为 0 时整枚收起，要显示 0 就开 `showZero`。
- `dot` 收成一个圆点：只表示「有」，不表示「有几个」。
- `label` 给读屏一整句：光念「3」听不出是什么的 3。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-badge>` |
| Vue 组件 | `XhBadge` `XhBadgeIndicator` `XhBadgeRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/badge.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="badge"`：**`root`** · `indicator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `count` | `number` |  | 计数。给了它角标就自己出数字，超过 max 写成「max+」。 与 indicator 的默认插槽二选一：插槽有内容时以插槽为准。 |
| `dot` | `boolean` |  | 只出一个点，不出数字。给了它 count 只用来决定显不显示。 |
| `label` | `string` |  | 读屏怎么念这枚角标。 角标挂在按钮、头像上时，光念数字听不出这是什么，得由宿主给出「3 条未读」这样的整句。 |
| `max` | `number` |  | 计数上限，默认 99：再多也只写 99+，免得角标被撑变形。 |
| `placement` | `BadgePlacement` |  | 挂在哪个角上，默认 top-end（右上角；rtl 下自动落到左上）。 |
| `showZero` | `boolean` |  | 计数为 0 时是否照样显示，默认不显示——没有未读就不该有角标。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。换的是圆点直径、两位数时的最小宽度与字号。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 角标现实里主要用 danger（未读小红点）与 success / neutral（在线 / 离线点）。 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhBadge` | `default` | — |  |
| `XhBadgeIndicator` | `default` | `{ text: string }` |  |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `visible` | `boolean` | 此刻该不该渲染：计数为 0 且没开 showZero 时为假。 |
| `text` | `string` | 算好的显示文本：超过 max 的写成「99+」；dot 模式与无 count 时为空串。 |
| `getRootProps` | `() => T['element']` | 锚点：被标记的那个东西（按钮、头像、标签页）放进它里面。 |
| `getIndicatorProps` | `() => T['element']` | 角标本身，绝对定位在 root 的某个角上。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `indicator` | `aria-label` | props.label |
| `indicator` | `role` | 'status' \| undefined |

## 样式

默认皮肤 `@xihan-ui/styles/badge.css` 按部件选择：`[data-scope="badge"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-placement` | props.placement |
| `indicator` | `data-dot` | ''（条件成立时才出现） |
| `indicator` | `data-placement` | props.placement |
| `indicator` | `data-size` | props.size |
| `indicator` | `data-tone` | props.tone |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-badge-bg` | `indicator` | `background` | `default` | `--xh-_tone` | badge 的 indicator 部件 background 覆盖槽。 |
| `--xh-badge-dot-size` | `indicator` | `block-size`<br>`inline-size`<br>`min-inline-size` | `dot` | `--xh-_badge-dot` | badge 的 indicator 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-badge-fg` | `indicator` | `color` | `default` | `--xh-_tone-on` | badge 的 indicator 部件 color 覆盖槽。 |
| `--xh-badge-font-size` | `indicator` | `font-size` | `default` | `--xh-_badge-font` | badge 的 indicator 部件 font-size 覆盖槽。 |
| `--xh-badge-font-weight` | `indicator` | `font-weight` | `default` | `--xh-font-weight-medium` | badge 的 indicator 部件 font-weight 覆盖槽。 |
| `--xh-badge-min-size` | `indicator` | `block-size`<br>`min-inline-size` | `default` | `--xh-_badge-min` | badge 的 indicator 部件 block-size、min-inline-size 覆盖槽。 |
| `--xh-badge-px` | `indicator` | `padding-inline` | `default` | `--xh-_badge-px` | badge 的 indicator 部件 padding-inline 覆盖槽。 |
| `--xh-badge-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-pill` | badge 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-badge-ring` | `indicator` | `border` | `default` | `--xh-bg-surface` | badge 的 indicator 部件 border 覆盖槽。 |
| `--xh-badge-shadow` | `indicator` | `box-shadow` | `default` | `--xh-_badge-highlight` | badge 的 indicator 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 挂在[头像](./avatar)、[按钮](./button)、[标签页](./tabs)的标签上做角标：
  被标记的那个东西直接写进默认插槽，定位与偏移由组件自己承担，不必外层再套定位上下文。

## 最佳实践

- 角标要给 `label`：读屏念到孤零零一个数字，用户不知道那是未读数还是别的。
- 状态别只用颜色区分：红绿色觉障碍的用户看不出差别，文字必须说清楚。
- 计数会变的地方交给 `count` 算，别自己拼「99+」——上限口径散在各处迟早不一致。

## 反模式

- 拿徽标当分类标签用：它不可交互、摘不掉，用户点了没反应。
- 一屏里到处都是高饱和度的徽标：全都在喊，等于都没喊。
- 用徽标承载长句子。

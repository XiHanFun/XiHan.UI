来源：https://ui.docs.xihanfun.com/components/badge

# Badge 徽标

提示某个对象有需要注意的变化：未读数量、当前状态、是否为新。徽标表达“发生了什么”，不表达“这是什么”；后者由[标签](./tag)承担。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/badge" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/badge.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/badge" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/badge" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/badge.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

被标记的元素写进默认插槽，角标自行贴到它的角上；计数、上限截断与 0 值收起都由角标计算

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

## 组件结构

加粗的是必需部件。

`data-scope="badge"`：**`root`** · **`indicator`**

## 示例

### 圆点与落点

dot 只表示有而不表示数量；placement 决定挂在哪个角，rtl 下 end 自动落到左边

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

tone 决定使用哪族颜色：角标实际以未读红点与在线/离线点为主；size 改变圆点直径、两位数时的最小宽度与字号

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

拆为 Root + Indicator 两件：角标内可自行排版，插槽可得到计算好的计数；不写内容才回落为数字，showZero 让 0 保留显示

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
- 小圆点：只表示有新内容，不表示数量。
- 状态提示：在线 / 离线、进行中、新。
- 附着在按钮、头像、标签页、菜单项上，报告该对象的状态。

### 何时不用

- 表达分类、技能、筛选条件等实体身份时，使用[标签](./tag)，它可以被移除。
- 用户需要点击它进行筛选或删除时，徽标不接受交互，应使用标签。
- 表达进度时，使用[进度条](./progress)。
- 可开关的选项使用[切换按钮](./toggle)。

### 特性

- 语气与尺寸两轴与其他组件同源；角标只有一种形态，没有形态轴。
- 默认使用 neutral；未读、错误等强提醒显式使用 danger。
- `placement` 决定挂在哪个角，四角可选，跟随文字方向。
- `count` 输出数字，超过 `max`（默认 99）时显示为“99+”。
- 计数为 0 时整个收起，需要显示 0 时开启 `showZero`。
- `dot` 收成一个圆点，只表示存在，不表示数量。
- 计数盒三档最小尺寸为 16 / 28 / 32px，角标只探出宿主四分之一，保持与宿主的视觉连接。
- `label` 为读屏提供完整语句，避免只读出一个数字。

### 组合

- 挂在[头像](./avatar)、[按钮](./button)、[标签页](./tabs)的标签上作为角标：被标记的对象直接写进默认插槽，定位与偏移由组件承担，不需要外层再提供定位上下文。

### 最佳实践

- 角标必须给 `label`：读屏只读出一个数字时，用户无法判断它的含义。
- 状态不能只用颜色区分，文字必须说明。
- 数量变化的场景交给 `count` 计算，不自行拼接“99+”，避免上限口径不一致。

### 反模式

- 将徽标用作分类标签：它不可交互、不可移除。
- 一屏内大量使用高饱和度徽标，会使提醒失去意义。
- 用徽标承载长句子。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-badge>` |
| Vue 组件 | `XhBadge` `XhBadgeIndicator` `XhBadgeRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/badge.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `count` | `number` |  | 计数。提供后角标自行显示数字，超过 max 时显示为「max+」。 与 indicator 的默认插槽二选一：插槽有内容时以插槽为准。 |
| `dot` | `boolean` |  | 只显示圆点，不显示数字。提供后 count 只用于决定是否显示。 |
| `label` | `string` |  | 读屏朗读该角标的方式。 角标挂在按钮、头像上时只朗读数字无法表达含义，需要由宿主提供「3 条未读」这类完整语句。 |
| `max` | `number` |  | 计数上限，默认 99：超过时只显示 99+，避免角标变形。 |
| `placement` | `BadgePlacement` |  | 挂在哪个角，默认 top-end（右上角；rtl 下自动落到左上）。 |
| `showZero` | `boolean` |  | 计数为 0 时是否仍然显示，默认不显示：没有未读时不应出现角标。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。影响圆点直径、两位数时的最小宽度与字号。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色，默认 neutral。 角标实际使用中主要为 danger（未读红点）与 success / neutral（在线 / 离线点）。 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhBadge` | `default` | — |  |
| `XhBadgeIndicator` | `default` | `{ text: string }` |  |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `visible` | `boolean` | 当前是否应渲染：计数为 0 且未开启 showZero 时为假。 |
| `text` | `string` | 计算后的显示文本：超过 max 时显示为「99+」；dot 模式与无 count 时为空串。 |
| `getRootProps` | `() => T['element']` | 锚点：被标记的对象（按钮、头像、标签页）放置在其中。 |
| `getIndicatorProps` | `() => T['element']` | 角标本身，绝对定位在 root 的某个角。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `indicator` | `aria-label` | props.label |
| `indicator` | `role` | 'status' \| undefined |

## 样式参考

### 皮肤

`@xihan-ui/styles/badge.css` 使用 `[data-scope="badge"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-placement` | props.placement |
| `indicator` | `data-dot` | ''（条件成立时才出现） |
| `indicator` | `data-placement` | props.placement |
| `indicator` | `data-size` | props.size |
| `indicator` | `data-tone` | props.tone |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-badge-bg` | `indicator` | `background` | `default` | `--xh-_tone` | badge 的 indicator 部件 background 覆盖槽。 |
| `--xh-badge-dot-radius` | `indicator` | `border-radius` | `dot` | `--xh-shape-circle` | badge 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-badge-dot-size` | `indicator` | `block-size`<br>`inline-size`<br>`min-inline-size` | `dot` | `--xh-_badge-dot` | badge 的 indicator 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-badge-fg` | `indicator` | `color` | `default` | `--xh-_tone-on` | badge 的 indicator 部件 color 覆盖槽。 |
| `--xh-badge-font-size` | `indicator` | `font-size` | `default` | `--xh-_badge-font` | badge 的 indicator 部件 font-size 覆盖槽。 |
| `--xh-badge-font-weight` | `indicator` | `font-weight` | `default` | `--xh-font-weight-medium` | badge 的 indicator 部件 font-weight 覆盖槽。 |
| `--xh-badge-min-size` | `indicator` | `block-size`<br>`min-inline-size` | `default` | `--xh-_badge-min` | badge 的 indicator 部件 block-size、min-inline-size 覆盖槽。 |
| `--xh-badge-px` | `indicator` | `padding-inline` | `default` | `--xh-_badge-px` | badge 的 indicator 部件 padding-inline 覆盖槽。 |
| `--xh-badge-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-pill` | badge 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-badge-ring` | `indicator` | `border` | `default` | `--xh-bg-surface` | badge 的 indicator 部件 border 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

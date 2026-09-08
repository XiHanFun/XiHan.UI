来源：https://ui.docs.xihanfun.com/components/avatar-group

# 头像组 `avatar-group`

把若干头像叠成一排，超出上限的收成一个计数。

## 何时使用

- 表示"这几个人参与了这件事"，且个体身份不需要逐一确认。

## 何时不用

- 需要逐个识别或操作：排成[列表](./list)。
- 只有一个人。

## 特性

- `max` 决定显示几个，其余落进 `overflow-item` 计数。
- 尺寸写在组上，组内头像一并跟着换。

## 示例

### 基础用法

一排叠放的头像：后一枚压在前一枚上，被压住的边由一圈底色分开

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarGroupRoot, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";

const members = ["曦", "寒", "懿", "承"];
</script>

<template>
  <XhAvatarGroupRoot>
    <XhAvatarRoot v-for="m in members" :key="m">
      <XhAvatarImage />
      <XhAvatarFallback>{{ m }}</XhAvatarFallback>
    </XhAvatarRoot>
  </XhAvatarGroupRoot>
</template>
```

```html
<xh-avatar-group>
  <div data-xh-part="root">
    <xh-avatar>
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">曦</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">寒</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">懿</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">承</span>
      </span>
    </xh-avatar>
  </div>
</xh-avatar-group>
```

### 上限与溢出计数

摆到上限为止，其余收成一枚「+N」；裁到几枚、N 写多少由作者定，组件只给这一枚身份与位置

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarGroupOverflowItem, XhAvatarGroupRoot, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";

const members = ["曦", "寒", "懿", "承", "临", "旭"];
const max = 4;

const shown = members.slice(0, max);
const rest = members.length - shown.length;
</script>

<template>
  <XhAvatarGroupRoot :max="max">
    <XhAvatarRoot v-for="m in shown" :key="m">
      <XhAvatarImage />
      <XhAvatarFallback>{{ m }}</XhAvatarFallback>
    </XhAvatarRoot>

    <!-- 计数那一枚没有图，写什么都行 -->
    <XhAvatarGroupOverflowItem v-if="rest > 0">+{{ rest }}</XhAvatarGroupOverflowItem>
  </XhAvatarGroupRoot>
</template>
```

```html
<xh-avatar-group max="4">
  <div data-xh-part="root">
    <xh-avatar>
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">曦</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">寒</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">懿</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">承</span>
      </span>
    </xh-avatar>

    <!-- 计数那一枚没有图，写什么都行 -->
    <span data-xh-part="overflow-item">+2</span>
  </div>
</xh-avatar-group>
```

### 尺寸

直径、字号与叠放量在组上写一次，沿自定义属性流给组内每一枚，「+N」跟着一起换

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarGroupOverflowItem, XhAvatarGroupRoot, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"];
const shown = ["曦", "寒", "懿"];
</script>

<template>
  <div style="display: grid; gap: 16px; justify-items: start">
    <XhAvatarGroupRoot v-for="s in sizes" :key="s" :size="s" :max="3">
      <XhAvatarRoot v-for="m in shown" :key="m">
        <XhAvatarImage />
        <XhAvatarFallback>{{ m }}</XhAvatarFallback>
      </XhAvatarRoot>
      <XhAvatarGroupOverflowItem>+3</XhAvatarGroupOverflowItem>
    </XhAvatarGroupRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px; justify-items: start">
  <xh-avatar-group size="sm" max="3">
    <div data-xh-part="root">
      <xh-avatar>
        <span data-xh-part="root">
          <img data-xh-part="image" />
          <span data-xh-part="fallback">曦</span>
        </span>
      </xh-avatar>
      <xh-avatar>
        <span data-xh-part="root">
          <img data-xh-part="image" />
          <span data-xh-part="fallback">寒</span>
        </span>
      </xh-avatar>
      <xh-avatar>
        <span data-xh-part="root">
          <img data-xh-part="image" />
          <span data-xh-part="fallback">懿</span>
        </span>
      </xh-avatar>
      <span data-xh-part="overflow-item">+3</span>
    </div>
  </xh-avatar-group>

  <xh-avatar-group size="md" max="3">
    <div data-xh-part="root">
      <xh-avatar>
        <span data-xh-part="root">
          <img data-xh-part="image" />
          <span data-xh-part="fallback">曦</span>
        </span>
      </xh-avatar>
      <xh-avatar>
        <span data-xh-part="root">
          <img data-xh-part="image" />
          <span data-xh-part="fallback">寒</span>
        </span>
      </xh-avatar>
      <xh-avatar>
        <span data-xh-part="root">
          <img data-xh-part="image" />
          <span data-xh-part="fallback">懿</span>
        </span>
      </xh-avatar>
      <span data-xh-part="overflow-item">+3</span>
    </div>
  </xh-avatar-group>

  <xh-avatar-group size="lg" max="3">
    <div data-xh-part="root">
      <xh-avatar>
        <span data-xh-part="root">
          <img data-xh-part="image" />
          <span data-xh-part="fallback">曦</span>
        </span>
      </xh-avatar>
      <xh-avatar>
        <span data-xh-part="root">
          <img data-xh-part="image" />
          <span data-xh-part="fallback">寒</span>
        </span>
      </xh-avatar>
      <xh-avatar>
        <span data-xh-part="root">
          <img data-xh-part="image" />
          <span data-xh-part="fallback">懿</span>
        </span>
      </xh-avatar>
      <span data-xh-part="overflow-item">+3</span>
    </div>
  </xh-avatar-group>
</div>
```

### 使用者令牌

直径、叠放量、分隔那圈底色都留了槽位，写在组上就整组换掉

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarGroupOverflowItem, XhAvatarGroupRoot, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";

const shown = ["曦", "寒", "懿", "承"];

// 方头像、叠得更深、计数那一枚也跟着换形状
const tokens = {
  "--xh-avatar-group-size": "34px",
  "--xh-avatar-group-overlap": "14px",
  "--xh-avatar-group-radius": "var(--xh-radius-md)",
  "--xh-avatar-radius": "var(--xh-radius-md)",
};
</script>

<template>
  <XhAvatarGroupRoot :max="4" :style="tokens">
    <XhAvatarRoot v-for="m in shown" :key="m">
      <XhAvatarImage />
      <XhAvatarFallback>{{ m }}</XhAvatarFallback>
    </XhAvatarRoot>
    <XhAvatarGroupOverflowItem>+2</XhAvatarGroupOverflowItem>
  </XhAvatarGroupRoot>
</template>
```

```html
<xh-avatar-group max="4">
  <!-- 方头像、叠得更深、计数那一枚也跟着换形状 -->
  <div
    data-xh-part="root"
    style="
      --xh-avatar-group-size: 34px;
      --xh-avatar-group-overlap: 14px;
      --xh-avatar-group-radius: var(--xh-radius-md);
      --xh-avatar-radius: var(--xh-radius-md);
    "
  >
    <xh-avatar>
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">曦</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">寒</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">懿</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">承</span>
      </span>
    </xh-avatar>
    <span data-xh-part="overflow-item">+2</span>
  </div>
</xh-avatar-group>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-avatar-group>` |
| Vue 组件 | `XhAvatarGroupOverflowItem` `XhAvatarGroupRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/avatar-group.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="avatar-group"`：**`root`** · `overflow-item`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `max` | `number` |  | 展示上限：这一组打算摆出几枚，其余收进 overflow-item 那一枚。 头像由作者渲染，所以裁到几枚、「+N」里的 N 写多少都在作者手里； 组件把这个上限如实落成根上的 data-max。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，落到根上沿继承流下发给组内每一枚。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getOverflowItemProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/avatar-group.css` 按部件选择：`[data-scope="avatar-group"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-avatar-group-font-size` · `--xh-avatar-group-font-weight` · `--xh-avatar-group-overflow-item-bg` · `--xh-avatar-group-overflow-item-fg` · `--xh-avatar-group-overlap` · `--xh-avatar-group-radius` · `--xh-avatar-group-ring` · `--xh-avatar-group-size`

## 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 里面放[头像](./avatar)；溢出计数点开可以是一张[气泡卡片](./popover)里的完整名单。

## 最佳实践

- 溢出计数要能点开看到完整名单。
- 每个头像都配[文字提示](./tooltip)给出姓名。

## 反模式

- 叠得太密以致看不出有几个人。
- 上限设得太大，一排头像占满整行。

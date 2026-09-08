来源：https://ui.docs.xihanfun.com/components/skeleton

# 骨架屏 `skeleton`

内容还没到时，先按最终版面占位。

## 何时使用

- 首屏或整块区域的加载，且版面结构可预测。
- 加载时间通常在几百毫秒到几秒之间。

## 何时不用

- 加载极快：骨架闪一下比直接出现更烦人。
- 版面完全不可预测：用[加载指示器](./spinner)。
- 是一次动作的等待（提交中）：用按钮的载入态。

## 特性

- `loading` 翻假即换成真内容。
- `variant` 决定骨块的形状（文本行、圆形、矩形）。

## 示例

### 基础用法

容器竖着码放骨架条，形状缺省是一行文字

```vue
<script setup lang="ts">
import { XhSkeletonItem, XhSkeletonRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhSkeletonRoot style="inline-size: 260px">
    <XhSkeletonItem />
    <XhSkeletonItem />
    <XhSkeletonItem />
  </XhSkeletonRoot>
</template>
```

```html
<xh-skeleton>
  <div data-xh-part="root" style="inline-size: 260px">
    <div data-xh-part="item"></div>
    <div data-xh-part="item"></div>
    <div data-xh-part="item"></div>
  </div>
</xh-skeleton>
```

### 形状

容器的 shape 是这一组的默认形状，单根骨架条自带 shape 就按自己的来

```vue
<script setup lang="ts">
import { XhSkeletonItem, XhSkeletonRoot } from "@xihan-ui/vue";
</script>

<template>
  <!-- 头像位与两行文字并排：容器默认 text，头像那一根单独声明 circle -->
  <XhSkeletonRoot
    style="inline-size: 260px; flex-direction: row; align-items: center"
  >
    <XhSkeletonItem shape="circle" />
    <XhSkeletonItem />
  </XhSkeletonRoot>

  <!-- 整组都是块：容器给了 rect，里面不必逐根再写 -->
  <XhSkeletonRoot shape="rect" style="inline-size: 200px">
    <XhSkeletonItem />
  </XhSkeletonRoot>
</template>
```

```html
<!-- 头像位与两行文字并排：容器默认 text，头像那一根单独声明 circle -->
<xh-skeleton>
  <div
    data-xh-part="root"
    style="inline-size: 260px; flex-direction: row; align-items: center"
  >
    <div data-xh-part="item" shape="circle"></div>
    <div data-xh-part="item"></div>
  </div>
</xh-skeleton>

<!-- 整组都是块：容器给了 rect，里面不必逐根再写 -->
<xh-skeleton shape="rect">
  <div data-xh-part="root" style="inline-size: 200px">
    <div data-xh-part="item"></div>
  </div>
</xh-skeleton>
```

### 加载结束

loading 期间容器报 aria-busy，翻成 false 后整块收起，位置让给真内容

```vue
<script setup lang="ts">
import { XhSkeletonItem, XhSkeletonRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const loading = ref(true);
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <button type="button" @click="loading = !loading">
      {{ loading ? "数据回来了" : "重新加载" }}
    </button>

    <XhSkeletonRoot :loading="loading" style="inline-size: 260px">
      <XhSkeletonItem />
      <XhSkeletonItem />
    </XhSkeletonRoot>

    <p v-if="!loading" style="margin: 0">这两行是接口回来之后的真内容。</p>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
  <button id="skeleton-loading-toggle" type="button">数据回来了</button>

  <xh-skeleton id="skeleton-loading">
    <div data-xh-part="root" style="inline-size: 260px">
      <div data-xh-part="item"></div>
      <div data-xh-part="item"></div>
    </div>
  </xh-skeleton>

  <p id="skeleton-loading-text" hidden style="margin: 0">
    这两行是接口回来之后的真内容。
  </p>
</div>

<script type="module">
  // 按钮翻转加载态，真内容跟着显隐
  const skeleton = document.getElementById("skeleton-loading");
  const toggle = document.getElementById("skeleton-loading-toggle");
  const text = document.getElementById("skeleton-loading-text");
  toggle.addEventListener("click", () => {
    const next = skeleton.loading === false;
    skeleton.loading = next;
    toggle.textContent = next ? "数据回来了" : "重新加载";
    text.hidden = next;
  });
</script>
```

### 按版面占位

骨架条的宽高由内联样式与组件令牌定，占位形状贴着真内容将来的样子

```vue
<script setup lang="ts">
import { XhSkeletonItem, XhSkeletonRoot } from "@xihan-ui/vue";
</script>

<template>
  <!-- 卡片位：一块封面加两行正文，末行收窄，看起来像一段还没排出来的字 -->
  <XhSkeletonRoot style="inline-size: 240px">
    <XhSkeletonItem
      shape="rect"
      style="--xh-skeleton-rect-block-size: 120px"
    />
    <XhSkeletonItem />
    <XhSkeletonItem style="inline-size: 60%" />
  </XhSkeletonRoot>

  <!-- 控件位：圆点直径与两个按钮的宽高各自定死，加载结束后位置不会跳 -->
  <XhSkeletonRoot
    style="inline-size: 240px; flex-direction: row; align-items: center"
  >
    <XhSkeletonItem
      shape="circle"
      style="--xh-skeleton-circle-size: 28px"
    />
    <XhSkeletonItem
      shape="rect"
      style="inline-size: 96px; --xh-skeleton-rect-block-size: 32px"
    />
    <XhSkeletonItem
      shape="rect"
      style="inline-size: 64px; --xh-skeleton-rect-block-size: 32px"
    />
  </XhSkeletonRoot>
</template>
```

```html
<!-- 卡片位：一块封面加两行正文，末行收窄，看起来像一段还没排出来的字 -->
<xh-skeleton>
  <div data-xh-part="root" style="inline-size: 240px">
    <div
      data-xh-part="item"
      shape="rect"
      style="--xh-skeleton-rect-block-size: 120px"
    ></div>
    <div data-xh-part="item"></div>
    <div data-xh-part="item" style="inline-size: 60%"></div>
  </div>
</xh-skeleton>

<!-- 控件位：圆点直径与两个按钮的宽高各自定死，加载结束后位置不会跳 -->
<xh-skeleton>
  <div
    data-xh-part="root"
    style="inline-size: 240px; flex-direction: row; align-items: center"
  >
    <div
      data-xh-part="item"
      shape="circle"
      style="--xh-skeleton-circle-size: 28px"
    ></div>
    <div
      data-xh-part="item"
      shape="rect"
      style="inline-size: 96px; --xh-skeleton-rect-block-size: 32px"
    ></div>
    <div
      data-xh-part="item"
      shape="rect"
      style="inline-size: 64px; --xh-skeleton-rect-block-size: 32px"
    ></div>
  </div>
</xh-skeleton>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-skeleton>` |
| Vue 组件 | `XhSkeletonItem` `XhSkeletonRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/skeleton.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="skeleton"`：**`root`** · **`item`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `animation` | `SkeletonAnimation` |  | 动效档，默认 'shimmer'；缺省档不输出 data-animation。 |
| `loading` | `boolean` |  | 是否还在加载，默认 true。 |
| `shape` | `SkeletonShape` |  | 容器内骨架条的默认形状，默认 'text'。 |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'loading' \| 'loaded' |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `loading` | `boolean` | 当前是否处于加载态。 |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(item?: SkeletonItemProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `item` | `aria-hidden` | 'true' \| undefined |

## 样式

默认皮肤 `@xihan-ui/styles/skeleton.css` 按部件选择：`[data-scope="skeleton"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-animation` | props.animation |
| `root` | `data-state` | 'loading' \| 'loaded' |
| `item` | `data-shape` | item.shape |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-skeleton-bg` · `--xh-skeleton-circle-radius` · `--xh-skeleton-circle-size` · `--xh-skeleton-duration` · `--xh-skeleton-gap` · `--xh-skeleton-pulse-duration` · `--xh-skeleton-radius` · `--xh-skeleton-rect-block-size` · `--xh-skeleton-rect-radius` · `--xh-skeleton-sheen` · `--xh-skeleton-text-block-size` · `--xh-skeleton-text-radius`

## 动效

关键帧 `xh-skeleton-pulse` · `xh-skeleton-shimmer` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## 组合

- 按最终版面用[栅格](./grid)或[弹性布局](./flex)摆骨块。

## 最佳实践

- 骨架的形状与真内容对上：行数、宽度、圆角都要接近，否则内容一到就整块跳。
- 别做得比真内容还花哨。

## 反模式

- 一块巨大的灰色矩形代替所有内容。
- 加载失败后骨架一直闪着。

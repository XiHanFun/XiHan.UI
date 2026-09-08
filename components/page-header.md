来源：https://ui.docs.xihanfun.com/components/page-header

# 页头 `page-header`

一页内容的抬头：面包屑、返回位、头像位、标题、副标题、行尾操作与页脚各占一段。

## 何时使用

- 详情页、编辑页需要一个统一的抬头，带返回与本页主操作。

## 何时不用

- 页面就是一张表或一块卡片，标题写在卡片里更近：用[卡片](./card)。
- 需要的是站点级的头（logo、全局搜索、账户）：那属于[布局](./layout)的 `header`。

## 特性

- 除了 `root`，返回位、副标题、操作、页脚都可选，只写用得上的那几段。
- 返回位就是作者自己的按钮：组件只给身份与位置，类型、可及名字与点击行为自己写。
- `extra` 贴在整行的末尾；面包屑整行排在标题之上，头像 / 图标排在返回位与标题之间。
- 形态分三档：不写即不画面（贴在页面底色上），`surface` 加底色与圆角，`raised` 再加一层抬起投影；后两档的 `bordered` 改画整圈描边。

## 示例

### 基础用法

除了 root，返回位、副标题、操作、页脚都可选；只写用得上的那几段

```vue
<script setup lang="ts">
import { XhPageHeaderDescription, XhPageHeaderRoot, XhPageHeaderTitle } from "@xihan-ui/vue";
</script>

<template>
  <XhPageHeaderRoot>
    <XhPageHeaderTitle>订单详情</XhPageHeaderTitle>
    <XhPageHeaderDescription>编号 SO-20260731-004</XhPageHeaderDescription>
  </XhPageHeaderRoot>
</template>
```

```html
<xh-page-header>
  <div data-xh-part="root">
    <div data-xh-part="title">订单详情</div>
    <div data-xh-part="description">编号 SO-20260731-004</div>
  </div>
</xh-page-header>
```

### 返回位

返回位就是作者自己的按钮：组件只给身份与位置，type、可及名字与点击行为自己写

```vue
<script setup lang="ts">
import {
  XhPageHeaderBackTrigger,
  XhPageHeaderDescription,
  XhPageHeaderRoot,
  XhPageHeaderTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

const times = ref(0);
</script>

<template>
  <XhPageHeaderRoot>
    <XhPageHeaderBackTrigger type="button" aria-label="返回上一页" @click="times++">
      ←
    </XhPageHeaderBackTrigger>
    <XhPageHeaderTitle>订单详情</XhPageHeaderTitle>
    <XhPageHeaderDescription>已点返回 {{ times }} 次</XhPageHeaderDescription>
  </XhPageHeaderRoot>
</template>
```

```html
<xh-page-header id="page-header-back">
  <div data-xh-part="root">
    <button data-xh-part="back-trigger" type="button" aria-label="返回上一页">
      ←
    </button>
    <div data-xh-part="title">订单详情</div>
    <div data-xh-part="description">
      已点返回 <span id="page-header-back-times">0</span> 次
    </div>
  </div>
</xh-page-header>

<script type="module">
  // 点击行为归作者：这里只数次数
  const host = document.getElementById("page-header-back");
  const trigger = host.querySelector('[data-xh-part="back-trigger"]');
  const readout = document.getElementById("page-header-back-times");
  let times = 0;
  trigger.addEventListener("click", () => {
    times += 1;
    readout.textContent = times;
  });
</script>
```

### 行尾操作

extra 贴在整行的末尾，里面放什么按钮由作者决定

```vue
<script setup lang="ts">
import {
  XhPageHeaderDescription,
  XhPageHeaderExtra,
  XhPageHeaderRoot,
  XhPageHeaderTitle,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPageHeaderRoot>
    <XhPageHeaderTitle>订单详情</XhPageHeaderTitle>
    <XhPageHeaderDescription>编号 SO-20260731-004</XhPageHeaderDescription>
    <XhPageHeaderExtra>
      <button type="button">导出</button>
      <button type="button">打印</button>
    </XhPageHeaderExtra>
  </XhPageHeaderRoot>
</template>
```

```html
<xh-page-header>
  <div data-xh-part="root">
    <div data-xh-part="title">订单详情</div>
    <div data-xh-part="description">编号 SO-20260731-004</div>
    <div data-xh-part="extra">
      <button type="button">导出</button>
      <button type="button">打印</button>
    </div>
  </div>
</xh-page-header>
```

### 尺寸

size 换的是标题字号与整块的上下留白，不写 size 即默认档

```vue
<script setup lang="ts">
import { XhPageHeaderDescription, XhPageHeaderRoot, XhPageHeaderTitle } from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column">
    <XhPageHeaderRoot v-for="s in sizes" :key="s.label" :size="s.size" bordered>
      <XhPageHeaderTitle>{{ s.label }}档标题</XhPageHeaderTitle>
      <XhPageHeaderDescription>副标题跟着标题排在同一行</XhPageHeaderDescription>
    </XhPageHeaderRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column">
  <xh-page-header size="sm" bordered>
    <div data-xh-part="root">
      <div data-xh-part="title">小档标题</div>
      <div data-xh-part="description">副标题跟着标题排在同一行</div>
    </div>
  </xh-page-header>

  <!-- 中间一档不写 size -->
  <xh-page-header bordered>
    <div data-xh-part="root">
      <div data-xh-part="title">默认档标题</div>
      <div data-xh-part="description">副标题跟着标题排在同一行</div>
    </div>
  </xh-page-header>

  <xh-page-header size="lg" bordered>
    <div data-xh-part="root">
      <div data-xh-part="title">大档标题</div>
      <div data-xh-part="description">副标题跟着标题排在同一行</div>
    </div>
  </xh-page-header>
</div>
```

### 分隔线与页脚

bordered 在底部画一条线，footer 整行另起，装描述或一组摘要

```vue
<script setup lang="ts">
import {
  XhPageHeaderExtra,
  XhPageHeaderFooter,
  XhPageHeaderRoot,
  XhPageHeaderTitle,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPageHeaderRoot bordered>
    <XhPageHeaderTitle>七月账单</XhPageHeaderTitle>
    <XhPageHeaderExtra>
      <button type="button">去支付</button>
    </XhPageHeaderExtra>
    <XhPageHeaderFooter>账期 7 月 1 日至 7 月 31 日，共 128 笔，合计 3,240.00 元。</XhPageHeaderFooter>
  </XhPageHeaderRoot>
</template>
```

```html
<xh-page-header bordered>
  <div data-xh-part="root">
    <div data-xh-part="title">七月账单</div>
    <div data-xh-part="extra">
      <button type="button">去支付</button>
    </div>
    <div data-xh-part="footer">账期 7 月 1 日至 7 月 31 日，共 128 笔，合计 3,240.00 元。</div>
  </div>
</xh-page-header>
```

### 形态

不写 variant 即不画面（与写 plain 一个样）；surface 加底色、圆角与左右内衬，raised 再加一层抬起投影，bordered 在这两档改画整圈描边

```vue
<script setup lang="ts">
import { XhPageHeaderDescription, XhPageHeaderRoot, XhPageHeaderTitle } from "@xihan-ui/vue";

// 第一档不写 variant，用 undefined 表达
const variants = [
  { variant: undefined, label: "不画面" },
  { variant: "surface", label: "有面" },
  { variant: "raised", label: "抬起" },
] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhPageHeaderRoot v-for="v in variants" :key="v.label" :variant="v.variant" bordered>
      <XhPageHeaderTitle>{{ v.label }}</XhPageHeaderTitle>
      <XhPageHeaderDescription>页头贴在什么底上，由这一轴决定</XhPageHeaderDescription>
    </XhPageHeaderRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px">
  <!-- 第一档不写 variant -->
  <xh-page-header bordered>
    <div data-xh-part="root">
      <div data-xh-part="title">不画面</div>
      <div data-xh-part="description">页头贴在什么底上，由这一轴决定</div>
    </div>
  </xh-page-header>

  <xh-page-header variant="surface" bordered>
    <div data-xh-part="root">
      <div data-xh-part="title">有面</div>
      <div data-xh-part="description">页头贴在什么底上，由这一轴决定</div>
    </div>
  </xh-page-header>

  <xh-page-header variant="raised" bordered>
    <div data-xh-part="root">
      <div data-xh-part="title">抬起</div>
      <div data-xh-part="description">页头贴在什么底上，由这一轴决定</div>
    </div>
  </xh-page-header>
</div>
```

### 面包屑与头像位

面包屑整行排在标题之上（写在标记最前面），头像/图标排在返回位与标题之间；两块都可缺省

```vue
<script setup lang="ts">
import {
  XhAvatarFallback,
  XhAvatarRoot,
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhBreadcrumbSeparator,
  XhPageHeaderBreadcrumb,
  XhPageHeaderDescription,
  XhPageHeaderMedia,
  XhPageHeaderRoot,
  XhPageHeaderTitle,
} from "@xihan-ui/vue";

const trail = [
  { label: "工作台", href: "#" },
  { label: "订单", href: "#" },
];
</script>

<template>
  <XhPageHeaderRoot variant="surface" bordered>
    <XhPageHeaderBreadcrumb>
      <XhBreadcrumbRoot>
        <XhBreadcrumbList>
          <template v-for="item in trail" :key="item.label">
            <XhBreadcrumbItem>
              <XhBreadcrumbLink :href="item.href">{{ item.label }}</XhBreadcrumbLink>
            </XhBreadcrumbItem>
            <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
          </template>
          <XhBreadcrumbItem>
            <XhBreadcrumbLink href="#" current>SO-20260731-004</XhBreadcrumbLink>
          </XhBreadcrumbItem>
        </XhBreadcrumbList>
      </XhBreadcrumbRoot>
    </XhPageHeaderBreadcrumb>
    <XhPageHeaderMedia>
      <XhAvatarRoot size="sm">
        <XhAvatarFallback>赵</XhAvatarFallback>
      </XhAvatarRoot>
    </XhPageHeaderMedia>
    <XhPageHeaderTitle>订单详情</XhPageHeaderTitle>
    <XhPageHeaderDescription>负责人 赵一 · 编号 SO-20260731-004</XhPageHeaderDescription>
  </XhPageHeaderRoot>
</template>
```

```html
<xh-page-header variant="surface" bordered>
  <div data-xh-part="root">
    <div data-xh-part="breadcrumb">
      <xh-breadcrumb>
        <nav data-xh-part="root">
          <ol data-xh-part="list">
            <li data-xh-part="item">
              <a data-xh-part="link" href="#">工作台</a>
            </li>
            <li data-xh-part="separator">/</li>
            <li data-xh-part="item">
              <a data-xh-part="link" href="#">订单</a>
            </li>
            <li data-xh-part="separator">/</li>
            <li data-xh-part="item">
              <a data-xh-part="link" href="#" current>SO-20260731-004</a>
            </li>
          </ol>
        </nav>
      </xh-breadcrumb>
    </div>
    <div data-xh-part="media">
      <xh-avatar size="sm">
        <span data-xh-part="root">
          <span data-xh-part="fallback">赵</span>
        </span>
      </xh-avatar>
    </div>
    <div data-xh-part="title">订单详情</div>
    <div data-xh-part="description">负责人 赵一 · 编号 SO-20260731-004</div>
  </div>
</xh-page-header>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-page-header>` |
| Vue 组件 | `XhPageHeaderBackTrigger` `XhPageHeaderBreadcrumb` `XhPageHeaderDescription` `XhPageHeaderExtra` `XhPageHeaderFooter` `XhPageHeaderMedia` `XhPageHeaderRoot` `XhPageHeaderTitle` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/page-header.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="page-header"`：**`root`** · `breadcrumb` · `back-trigger` · `media` · `title` · `description` · `extra` · `footer`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `bordered` | `boolean` |  | 底部画一条分隔线，把页头与下面的内容分开。给了面的两档改画整圈描边。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定标题字号与整块的上下留白。 |
| `variant` | `PageHeaderVariant` |  | 形态：plain / surface / raised。不写即不画面，与写 plain 同一个样子。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getBreadcrumbProps` | `() => T['element']` | 面包屑位：整行排在标题之上。放什么归作者，组件只圈出位置。 |
| `getBackTriggerProps` | `() => T['element']` |  |
| `getMediaProps` | `() => T['element']` | 头像 / 图标位：排在返回位与标题之间，不随标题行换行。 |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getExtraProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/page-header.css` 按部件选择：`[data-scope="page-header"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-bordered` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-variant` | props.variant |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-page-header-bg` · `--xh-page-header-border` · `--xh-page-header-breadcrumb-fg` · `--xh-page-header-breadcrumb-font-size` · `--xh-page-header-column-gap` · `--xh-page-header-description-fg` · `--xh-page-header-description-font-size` · `--xh-page-header-extra-gap` · `--xh-page-header-fg` · `--xh-page-header-footer-fg` · `--xh-page-header-footer-font-size` · `--xh-page-header-px` · `--xh-page-header-py` · `--xh-page-header-radius` · `--xh-page-header-row-gap` · `--xh-page-header-shadow` · `--xh-page-header-title-fg` · `--xh-page-header-title-font-size` · `--xh-page-header-title-font-weight`

## 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 面包屑位里放[面包屑](./breadcrumb)，头像位里放[头像](./avatar)，`extra` 里放[按钮组](./button-group)，`footer` 里放[描述列表](./descriptions)或一组[统计数值](./statistic)。

## 最佳实践

- 标题写具体对象的名字，不写页面类型。
- `extra` 里的主操作只留一个，其余收进[菜单](./menu)。

## 反模式

- 返回位直接调 `history.back()`：用户从外链进来时会退出站点。给它一个确定的上级地址。
- 页头里塞进整块表单。

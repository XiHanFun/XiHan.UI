来源：https://ui.docs.xihanfun.com/components/list

# 列表 `list`

一列同构的条目，每条可以有媒体位、标题、描述与操作位。

## 何时使用

- 同构记录的纵向排列：通知、文件、成员。
- 每条信息量适中，不需要多列对齐。

## 何时不用

- 每条有多个字段需要按列对照：用[表格](./table)。
- 条目可选：用[列表框](./listbox)。

## 特性

- 六个部件都可选。
- `split` 在条目之间画线，`bordered` 给外框，`hoverable` 给悬停反馈。

## 示例

### 基础用法

根与条目的标签由使用者定，这里写成 ul 与 li；条目里只写用得上的那几个位

```vue
<script setup lang="ts">
import {
  XhListItem,
  XhListItemContent,
  XhListItemDescription,
  XhListItemTitle,
  XhListRoot,
} from "@xihan-ui/vue";

const people = [
  { name: "张三", desc: "技术部 · 前端" },
  { name: "李四", desc: "技术部 · 后端" },
  { name: "王五", desc: "设计部 · 交互" },
];
</script>

<template>
  <XhListRoot style="max-inline-size: 360px">
    <XhListItem v-for="p in people" :key="p.name">
      <XhListItemContent>
        <XhListItemTitle>{{ p.name }}</XhListItemTitle>
        <XhListItemDescription>{{ p.desc }}</XhListItemDescription>
      </XhListItemContent>
    </XhListItem>
  </XhListRoot>
</template>
```

```html
<!-- 宿主设 display: contents，列表落在 root 上 -->
<xh-list style="display: contents">
  <ul data-xh-part="root" style="max-inline-size: 360px">
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">张三</div>
        <div data-xh-part="item-description">技术部 · 前端</div>
      </div>
    </li>
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">李四</div>
        <div data-xh-part="item-description">技术部 · 后端</div>
      </div>
    </li>
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">王五</div>
        <div data-xh-part="item-description">设计部 · 交互</div>
      </div>
    </li>
  </ul>
</xh-list>
```

### 分隔线

split 在条目之间画一条线，第一条上面不画

```vue
<script setup lang="ts">
import { XhListItem, XhListItemContent, XhListItemTitle, XhListRoot } from "@xihan-ui/vue";

const logs = ["提交了一次构建", "合并了一个分支", "关闭了一个议题"];
</script>

<template>
  <XhListRoot split style="max-inline-size: 360px">
    <XhListItem v-for="log in logs" :key="log">
      <XhListItemContent>
        <XhListItemTitle>{{ log }}</XhListItemTitle>
      </XhListItemContent>
    </XhListItem>
  </XhListRoot>
</template>
```

```html
<!-- 宿主设 display: contents，列表落在 root 上 -->
<xh-list split style="display: contents">
  <ul data-xh-part="root" style="max-inline-size: 360px">
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">提交了一次构建</div>
      </div>
    </li>
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">合并了一个分支</div>
      </div>
    </li>
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">关闭了一个议题</div>
      </div>
    </li>
  </ul>
</xh-list>
```

### 外框与悬停

bordered 给整份列表画一圈描边，hoverable 让条目在指针悬停时换底色

```vue
<script setup lang="ts">
import { XhListItem, XhListItemContent, XhListItemTitle, XhListRoot } from "@xihan-ui/vue";

const files = ["设计稿.fig", "接口文档.md", "会议纪要.docx"];
</script>

<template>
  <XhListRoot bordered hoverable split style="max-inline-size: 360px">
    <XhListItem v-for="file in files" :key="file">
      <XhListItemContent>
        <XhListItemTitle>{{ file }}</XhListItemTitle>
      </XhListItemContent>
    </XhListItem>
  </XhListRoot>
</template>
```

```html
<!-- 宿主设 display: contents，列表落在 root 上 -->
<xh-list bordered hoverable split style="display: contents">
  <ul data-xh-part="root" style="max-inline-size: 360px">
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">设计稿.fig</div>
      </div>
    </li>
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">接口文档.md</div>
      </div>
    </li>
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">会议纪要.docx</div>
      </div>
    </li>
  </ul>
</xh-list>
```

### 媒体位与操作位

一条条目最全的形态：媒体、标题、说明、操作四个位都摆上

```vue
<script setup lang="ts">
import {
  XhListItem,
  XhListItemAction,
  XhListItemContent,
  XhListItemDescription,
  XhListItemMedia,
  XhListItemTitle,
  XhListRoot,
} from "@xihan-ui/vue";

const members = [
  { initial: "张", name: "张三", desc: "zhangsan@example.com" },
  { initial: "李", name: "李四", desc: "lisi@example.com" },
];
</script>

<template>
  <XhListRoot bordered hoverable split style="max-inline-size: 420px">
    <XhListItem v-for="m in members" :key="m.name">
      <!-- 媒体位画什么由使用者决定，这里放一个首字头像 -->
      <XhListItemMedia
        style="
          inline-size: 32px;
          block-size: 32px;
          border-radius: 999px;
          background: var(--xh-bg-subtle);
        "
      >
        {{ m.initial }}
      </XhListItemMedia>
      <XhListItemContent>
        <XhListItemTitle>{{ m.name }}</XhListItemTitle>
        <XhListItemDescription>{{ m.desc }}</XhListItemDescription>
      </XhListItemContent>
      <XhListItemAction>
        <button type="button">移除</button>
      </XhListItemAction>
    </XhListItem>
  </XhListRoot>
</template>
```

```html
<style>
  #list-media-action [data-xh-part="item-media"] {
    inline-size: 32px;
    block-size: 32px;
    border-radius: 999px;
    background: var(--xh-bg-subtle);
  }
</style>

<!-- 宿主设 display: contents，列表落在 root 上 -->
<xh-list id="list-media-action" bordered hoverable split style="display: contents">
  <ul data-xh-part="root" style="max-inline-size: 420px">
    <li data-xh-part="item">
      <!-- 媒体位画什么由使用者决定，这里放一个首字头像 -->
      <div data-xh-part="item-media">张</div>
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">张三</div>
        <div data-xh-part="item-description">zhangsan@example.com</div>
      </div>
      <div data-xh-part="item-action">
        <button type="button">移除</button>
      </div>
    </li>
    <li data-xh-part="item">
      <div data-xh-part="item-media">李</div>
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">李四</div>
        <div data-xh-part="item-description">lisi@example.com</div>
      </div>
      <div data-xh-part="item-action">
        <button type="button">移除</button>
      </div>
    </li>
  </ul>
</xh-list>
```

### 尺寸

size 换的是条目的内边距、图文间距与两行文字的字号，不传 size 即默认档

```vue
<script setup lang="ts">
import {
  XhListItem,
  XhListItemContent,
  XhListItemDescription,
  XhListItemTitle,
  XhListRoot,
} from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
    <XhListRoot
      v-for="s in sizes"
      :key="s.label"
      :size="s.size"
      bordered
      split
      style="inline-size: 200px"
    >
      <XhListItem>
        <XhListItemContent>
          <XhListItemTitle>{{ s.label }}</XhListItemTitle>
          <XhListItemDescription>说明文字</XhListItemDescription>
        </XhListItemContent>
      </XhListItem>
      <XhListItem>
        <XhListItemContent>
          <XhListItemTitle>第二条</XhListItemTitle>
          <XhListItemDescription>说明文字</XhListItemDescription>
        </XhListItemContent>
      </XhListItem>
    </XhListRoot>
  </div>
</template>
```

```html
<!-- 三份宿主都设 display: contents，三个 root 直接当排布容器的子项 -->
<div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
  <xh-list size="sm" bordered split style="display: contents">
    <ul data-xh-part="root" style="inline-size: 200px">
      <li data-xh-part="item">
        <div data-xh-part="item-content">
          <div data-xh-part="item-title">小</div>
          <div data-xh-part="item-description">说明文字</div>
        </div>
      </li>
      <li data-xh-part="item">
        <div data-xh-part="item-content">
          <div data-xh-part="item-title">第二条</div>
          <div data-xh-part="item-description">说明文字</div>
        </div>
      </li>
    </ul>
  </xh-list>

  <!-- 中间一档不写 size -->
  <xh-list bordered split style="display: contents">
    <ul data-xh-part="root" style="inline-size: 200px">
      <li data-xh-part="item">
        <div data-xh-part="item-content">
          <div data-xh-part="item-title">默认</div>
          <div data-xh-part="item-description">说明文字</div>
        </div>
      </li>
      <li data-xh-part="item">
        <div data-xh-part="item-content">
          <div data-xh-part="item-title">第二条</div>
          <div data-xh-part="item-description">说明文字</div>
        </div>
      </li>
    </ul>
  </xh-list>

  <xh-list size="lg" bordered split style="display: contents">
    <ul data-xh-part="root" style="inline-size: 200px">
      <li data-xh-part="item">
        <div data-xh-part="item-content">
          <div data-xh-part="item-title">大</div>
          <div data-xh-part="item-description">说明文字</div>
        </div>
      </li>
      <li data-xh-part="item">
        <div data-xh-part="item-content">
          <div data-xh-part="item-title">第二条</div>
          <div data-xh-part="item-description">说明文字</div>
        </div>
      </li>
    </ul>
  </xh-list>
</div>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-list>` |
| Vue 组件 | `XhListItem` `XhListItemAction` `XhListItemContent` `XhListItemDescription` `XhListItemMedia` `XhListItemTitle` `XhListRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/list.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="list"`：**`root`** · `item` · `item-media` · `item-content` · `item-title` · `item-description` · `item-action`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `bordered` | `boolean` |  | 外框：给整份列表画一圈描边与圆角。 |
| `hoverable` | `boolean` |  | 指针悬停时条目换底色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `split` | `boolean` |  | 条目之间画分隔线。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |
| `getItemMediaProps` | `() => T['element']` |  |
| `getItemContentProps` | `() => T['element']` |  |
| `getItemTitleProps` | `() => T['element']` |  |
| `getItemDescriptionProps` | `() => T['element']` |  |
| `getItemActionProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/list.css` 按部件选择：`[data-scope="list"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-list-action-gap` · `--xh-list-bg` · `--xh-list-border` · `--xh-list-content-gap` · `--xh-list-description-fg` · `--xh-list-description-font-size` · `--xh-list-divider` · `--xh-list-fg` · `--xh-list-item-bg-hover` · `--xh-list-item-gap` · `--xh-list-item-px` · `--xh-list-item-px-lg` · `--xh-list-item-px-md` · `--xh-list-item-px-sm` · `--xh-list-item-py` · `--xh-list-item-py-lg` · `--xh-list-item-py-md` · `--xh-list-item-py-sm` · `--xh-list-radius` · `--xh-list-title-fg` · `--xh-list-title-font-size` · `--xh-list-title-font-weight`

## 动效

`background` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤另按输入能力分档：`hover: hover`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 媒体位放[头像](./avatar)或[图标块](./icon-wrapper)；操作位放[按钮](./button)或[菜单](./menu)；下面接[分页](./pagination)或[无限滚动](./infinite-scroll)。

## 最佳实践

- 每条的高度尽量一致，参差不齐的列表很难扫读。
- 整条可点时让整条进 Tab 序列，别只让标题可点。

## 反模式

- 用列表排一张有五六个字段的表。
- 每条都塞三四个操作按钮。

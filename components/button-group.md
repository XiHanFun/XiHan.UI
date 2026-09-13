来源：https://ui.docs.xihanfun.com/components/button-group

# ButtonGroup 按钮组

将一组相关操作组合为连续的按钮控件。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/button-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/button-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/button-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/button-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/button-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

组合相关操作

```vue
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";

const views = ["照片", "视频", "更多"];
</script>

<template>
  <XhButtonGroup>
    <XhButton v-for="view in views" :key="view">{{ view }}</XhButton>
  </XhButtonGroup>
</template>
```

```html
<xh-button-group>
  <div data-xh-part="root">
    <xh-button>
      <button data-xh-part="root">照片</button>
    </xh-button>
    <xh-button>
      <button data-xh-part="root">视频</button>
    </xh-button>
    <xh-button>
      <button data-xh-part="root">更多</button>
    </xh-button>
  </div>
</xh-button-group>
```

## 组件结构

加粗的是必需部件。

`data-scope="button-group"`：**`root`**

## 示例

### 变体

设置整组外观

```vue
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";

const variants = [
  { label: "主要", variant: "solid", tone: "brand" },
  { label: "次要", variant: "subtle", tone: "brand" },
  { label: "第三", variant: "subtle", tone: "neutral" },
  { label: "线框", variant: "outline", tone: undefined },
  { label: "幽灵", variant: "ghost", tone: undefined },
  { label: "危险", variant: "solid", tone: "danger" },
] as const;
const views = ["日", "周", "月"];
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <div v-for="item in variants" :key="item.label" style="display: grid; gap: 6px">
      <span>{{ item.label }}</span>
      <XhButtonGroup :variant="item.variant" :tone="item.tone">
        <XhButton v-for="label in views" :key="label">{{ label }}</XhButton>
      </XhButtonGroup>
    </div>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; justify-items: start">
  <div style="display: grid; gap: 6px"><span>主要</span><xh-button-group variant="solid" tone="brand"><div data-xh-part="root">
    <xh-button><button data-xh-part="root">日</button></xh-button>
    <xh-button><button data-xh-part="root">周</button></xh-button>
    <xh-button><button data-xh-part="root">月</button></xh-button>
  </div></xh-button-group></div>
  <div style="display: grid; gap: 6px"><span>次要</span><xh-button-group variant="subtle" tone="brand"><div data-xh-part="root">
    <xh-button><button data-xh-part="root">日</button></xh-button>
    <xh-button><button data-xh-part="root">周</button></xh-button>
    <xh-button><button data-xh-part="root">月</button></xh-button>
  </div></xh-button-group></div>
  <div style="display: grid; gap: 6px"><span>第三</span><xh-button-group variant="subtle" tone="neutral"><div data-xh-part="root">
    <xh-button><button data-xh-part="root">日</button></xh-button>
    <xh-button><button data-xh-part="root">周</button></xh-button>
    <xh-button><button data-xh-part="root">月</button></xh-button>
  </div></xh-button-group></div>
  <div style="display: grid; gap: 6px"><span>线框</span><xh-button-group variant="outline"><div data-xh-part="root">
    <xh-button><button data-xh-part="root">日</button></xh-button>
    <xh-button><button data-xh-part="root">周</button></xh-button>
    <xh-button><button data-xh-part="root">月</button></xh-button>
  </div></xh-button-group></div>
  <div style="display: grid; gap: 6px"><span>幽灵</span><xh-button-group variant="ghost"><div data-xh-part="root">
    <xh-button><button data-xh-part="root">日</button></xh-button>
    <xh-button><button data-xh-part="root">周</button></xh-button>
    <xh-button><button data-xh-part="root">月</button></xh-button>
  </div></xh-button-group></div>
  <div style="display: grid; gap: 6px"><span>危险</span><xh-button-group variant="solid" tone="danger"><div data-xh-part="root">
    <xh-button><button data-xh-part="root">日</button></xh-button>
    <xh-button><button data-xh-part="root">周</button></xh-button>
    <xh-button><button data-xh-part="root">月</button></xh-button>
  </div></xh-button-group></div>
</div>
```

### 尺寸

设置整组尺寸

```vue
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"];
const views = ["日", "周", "月"];
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhButtonGroup v-for="s in sizes" :key="s" :size="s">
      <XhButton v-for="view in views" :key="view">{{ view }}</XhButton>
    </XhButtonGroup>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 16px">
  <xh-button-group size="sm">
    <div data-xh-part="root">
      <xh-button>
        <button data-xh-part="root">日</button>
      </xh-button>
      <xh-button>
        <button data-xh-part="root">周</button>
      </xh-button>
      <xh-button>
        <button data-xh-part="root">月</button>
      </xh-button>
    </div>
  </xh-button-group>

  <xh-button-group size="md">
    <div data-xh-part="root">
      <xh-button>
        <button data-xh-part="root">日</button>
      </xh-button>
      <xh-button>
        <button data-xh-part="root">周</button>
      </xh-button>
      <xh-button>
        <button data-xh-part="root">月</button>
      </xh-button>
    </div>
  </xh-button-group>

  <xh-button-group size="lg">
    <div data-xh-part="root">
      <xh-button>
        <button data-xh-part="root">日</button>
      </xh-button>
      <xh-button>
        <button data-xh-part="root">周</button>
      </xh-button>
      <xh-button>
        <button data-xh-part="root">月</button>
      </xh-button>
    </div>
  </xh-button-group>
</div>
```

### 方向

水平或垂直排列

```vue
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";

const actions = ["复制", "剪切", "粘贴"];
</script>

<template>
  <div style="display: flex; align-items: flex-start; gap: 24px">
    <XhButtonGroup>
      <XhButton v-for="action in actions" :key="action">{{ action }}</XhButton>
    </XhButtonGroup>

    <XhButtonGroup orientation="vertical">
      <XhButton v-for="action in actions" :key="action">{{ action }}</XhButton>
    </XhButtonGroup>
  </div>
</template>
```

```html
<div style="display: flex; align-items: flex-start; gap: 24px">
  <xh-button-group>
    <div data-xh-part="root">
      <xh-button>
        <button data-xh-part="root">复制</button>
      </xh-button>
      <xh-button>
        <button data-xh-part="root">剪切</button>
      </xh-button>
      <xh-button>
        <button data-xh-part="root">粘贴</button>
      </xh-button>
    </div>
  </xh-button-group>

  <xh-button-group orientation="vertical">
    <div data-xh-part="root">
      <xh-button>
        <button data-xh-part="root">复制</button>
      </xh-button>
      <xh-button>
        <button data-xh-part="root">剪切</button>
      </xh-button>
      <xh-button>
        <button data-xh-part="root">粘贴</button>
      </xh-button>
    </div>
  </xh-button-group>
</div>
```

### 图标与标签

组合图标按钮与文字按钮

```vue
<script setup lang="ts">
import { EllipsisIcon, ImageIcon, VideoIcon } from "@xihan-ui/icons";
import {
  XhButton,
  XhButtonGroup,
  XhButtonLabel,
  XhButtonPrefix,
  XhIcon,
} from "@xihan-ui/vue";
</script>

<template>
  <XhButtonGroup>
    <XhButton>
      <XhButtonPrefix><XhIcon :icon="ImageIcon" /></XhButtonPrefix>
      <XhButtonLabel>照片</XhButtonLabel>
    </XhButton>
    <XhButton>
      <XhButtonPrefix><XhIcon :icon="VideoIcon" /></XhButtonPrefix>
      <XhButtonLabel>视频</XhButtonLabel>
    </XhButton>
    <XhButton icon-only aria-label="更多选项">
      <XhIcon :icon="EllipsisIcon" />
    </XhButton>
  </XhButtonGroup>
</template>
```

```html
<xh-button-group>
  <div data-xh-part="root">
    <xh-button>
      <button data-xh-part="root">
        <span data-xh-part="prefix">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2"></rect>
            <circle cx="8.5" cy="9" r="1.5"></circle>
            <path d="m21 15-5-5L5 20"></path>
          </svg>
        </span>
        <span data-xh-part="label">照片</span>
      </button>
    </xh-button>
    <xh-button>
      <button data-xh-part="root">
        <span data-xh-part="prefix">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="3" y="6" width="13" height="12" rx="2"></rect>
            <path d="m16 10 5-3v10l-5-3"></path>
          </svg>
        </span>
        <span data-xh-part="label">视频</span>
      </button>
    </xh-button>
    <xh-button icon-only>
      <button data-xh-part="root" aria-label="更多选项">
        <span data-xh-part="prefix">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="5" cy="12" r="1.75"></circle>
            <circle cx="12" cy="12" r="1.75"></circle>
            <circle cx="19" cy="12" r="1.75"></circle>
          </svg>
        </span>
      </button>
    </xh-button>
  </div>
</xh-button-group>
```

### 宽度充满

按钮等分可用宽度

```vue
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";
</script>

<template>
  <div style="inline-size: min(100%, 420px)">
    <XhButtonGroup full-width>
      <XhButton>上一页</XhButton>
      <XhButton>下一页</XhButton>
    </XhButtonGroup>
  </div>
</template>
```

```html
<div style="inline-size: min(100%, 420px)">
  <xh-button-group full-width>
    <div data-xh-part="root">
      <xh-button><button data-xh-part="root">上一页</button></xh-button>
      <xh-button><button data-xh-part="root">下一页</button></xh-button>
    </div>
  </xh-button-group>
</div>
```

### 禁用

禁用整组按钮

```vue
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";
</script>

<template>
  <XhButtonGroup disabled>
    <XhButton>照片</XhButton>
    <XhButton>视频</XhButton>
    <XhButton>更多</XhButton>
  </XhButtonGroup>
</template>
```

```html
<xh-button-group disabled>
  <div data-xh-part="root">
    <xh-button><button data-xh-part="root">照片</button></xh-button>
    <xh-button><button data-xh-part="root">视频</button></xh-button>
    <xh-button><button data-xh-part="root">更多</button></xh-button>
  </div>
</xh-button-group>
```

### 无分隔线

省略分隔线部件

```vue
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";
</script>

<template>
  <XhButtonGroup :separators="false">
    <XhButton>照片</XhButton>
    <XhButton>视频</XhButton>
    <XhButton>更多</XhButton>
  </XhButtonGroup>
</template>
```

```html
<xh-button-group separators="false">
  <div data-xh-part="root">
    <xh-button><button data-xh-part="root">照片</button></xh-button>
    <xh-button><button data-xh-part="root">视频</button></xh-button>
    <xh-button><button data-xh-part="root">更多</button></xh-button>
  </div>
</xh-button-group>
```

## 设计指引

### 何时使用

- 并列展示作用相近的操作。
- 统一一组按钮的尺寸、变体和颜色。

### 何时不用

- 需要表达单选或多选状态时，使用[切换按钮组](./toggle-group)。
- 操作之间没有直接关系时，分别放置按钮并保留间距。

### 特性

- 支持水平和垂直排列。
- 自动合并相邻边界，只保留首尾圆角。
- 支持统一设置尺寸、变体、颜色、禁用状态和宽度。
- 默认在相邻按钮之间显示分隔线，可通过 `separators=false` 关闭。
- 按下按钮时不缩放，避免组内边界断开。

### 组合

- 在组内直接放置[按钮](./button)。
- 将菜单触发器放在末尾，可组成分裂按钮。

### 最佳实践

- 每组只放置同一任务下的操作。
- 操作较多时，保留常用项，其余收纳到菜单中。
- 窄容器中使用垂直方向，不要让按钮组换行。
- 尺寸和变体优先设置在按钮组上。

### 反模式

- 不要用按钮组表示已选中项。
- 不要在按钮之间插入说明文字。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-button-group>` |
| Vue 组件 | `XhButtonGroup` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/button-group.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `disabled` | `boolean` |  | 整组禁用：适配器把它落到组内每一段的原生 disabled 上，段自己写了禁用的仍然禁用。 |
| `fullWidth` | `boolean` |  | 撑满行宽：整组占满可用宽度，每段等分剩余空间。 |
| `orientation` | `'horizontal' \| 'vertical'` |  | 排布：horizontal / vertical，决定相邻两段在哪个轴上合边。 |
| `separators` | `boolean` |  | 是否自动在相邻按钮之间插入分隔线，默认 true。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，落到根上供皮肤写进组内按钮的高度、内边距与字号槽位。 |
| `tone` | `Tone` |  | 颜色：brand / neutral / success / warning / danger / info，落到根上沿继承流给组内每一段。 |
| `variant` | `ActionVariant` |  | 变体：solid / subtle / outline / ghost，落到根上供皮肤写进组内按钮的颜色槽位。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` |  |
| `disabled` | `boolean` | 整组是否禁用。适配器据此把禁用传给组内每一段——只打 data-* 是假禁用。 |
| `separators` | `boolean` | 适配器是否自动生成相邻按钮间的分隔线。 |
| `getRootProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `role` | 'group' |

## 样式参考

### 皮肤

`@xihan-ui/styles/button-group.css` 使用 `[data-scope="button-group"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-full-width` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-button-group-outline-color` | `root` | `border` | `variant=outline` | `--xh-_tone-border-control` | button-group 的 root 部件 border 覆盖槽。 |
| `--xh-button-group-radius` | `root` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `first-child`<br>`last-child`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`variant=outline` | `--xh-shape-pill` | button-group 的 root 部件 border-end-end-radius、border-end-start-radius、border-radius、border-start-end-radius、border-start-start-radius 覆盖槽。 |
| `--xh-button-group-separator-color` | `root` | `background` | `xh-button-group-separator` | `--xh-fg-default` | button-group 的 root 部件 background 覆盖槽。 |
| `--xh-button-group-separator-color-disabled` | `root` | `background` | `disabled`<br>`xh-button-group-separator` | `--xh-border-subtle` | button-group 的 root 部件 background 覆盖槽。 |
| `--xh-button-group-separator-opacity` | `root` | `opacity` | `xh-button-group-separator` | `--xh-control-separator-opacity` | button-group 的 root 部件 opacity 覆盖槽。 |
| `--xh-button-group-separator-opacity-disabled` | `root` | `opacity` | `disabled`<br>`xh-button-group-separator` | `--xh-control-separator-disabled-opacity` | button-group 的 root 部件 opacity 覆盖槽。 |
| `--xh-button-group-separator-radius` | `root` | `border-radius` | `xh-button-group-separator` | `--xh-shape-pill` | button-group 的 root 部件 border-radius 覆盖槽。 |
| `--xh-button-group-separator-size` | `root` | `block-size`<br>`inline-size` | `orientation=horizontal`<br>`orientation=vertical`<br>`xh-button-group-separator` | `--xh-_group-separator-size` | button-group 的 root 部件 block-size、inline-size 覆盖槽。 |
| `--xh-button-group-separator-thickness` | `root` | `block-size`<br>`inline-size`<br>`margin-block-start`<br>`margin-inline-start` | `orientation=horizontal`<br>`orientation=vertical`<br>`xh-button-group-separator` | `--xh-stroke-thin` | button-group 的 root 部件 block-size、inline-size、margin-block-start、margin-inline-start 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background-color` · `opacity` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

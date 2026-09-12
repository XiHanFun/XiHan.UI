来源：https://ui.docs.xihanfun.com/components/button-group

# ButtonGroup `按钮组`

把一组语义相关的按钮连成一条：相邻两段共用一条边，圆角只留在两端，视觉上是一个控件。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/button-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/button-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/button-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/button-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/button-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一组相关按钮连成一条：相邻两段共用一条边，圆角只留在两端

```vue
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";

const views = ["日", "周", "月"];
</script>

<template>
  <!-- 段就是组的直接子节点；形态写在组上，组内每段都取得到 -->
  <XhButtonGroup variant="outline">
    <XhButton v-for="v in views" :key="v">{{ v }}</XhButton>
  </XhButtonGroup>
</template>
```

```html
<!-- 段是组根的直接子节点；形态写在组上，组内每段都取得到 -->
<xh-button-group variant="outline">
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
```

## 示例

### 排布

横排在左右两端留圆角，竖排改在上下两端；合边跟着换轴

```vue
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";

const actions = ["复制", "剪切", "粘贴"];
</script>

<template>
  <div style="display: flex; align-items: flex-start; gap: 24px">
    <XhButtonGroup variant="outline">
      <XhButton v-for="a in actions" :key="a">{{ a }}</XhButton>
    </XhButtonGroup>

    <XhButtonGroup orientation="vertical" variant="outline">
      <XhButton v-for="a in actions" :key="a">{{ a }}</XhButton>
    </XhButtonGroup>
  </div>
</template>
```

```html
<div style="display: flex; align-items: flex-start; gap: 24px">
  <xh-button-group variant="outline">
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

  <xh-button-group orientation="vertical" variant="outline">
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

### 尺寸

高度、内边距与字号在组上写一次，沿自定义属性流给组内每一段

```vue
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"];
const views = ["日", "周", "月"];
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhButtonGroup v-for="s in sizes" :key="s" :size="s" variant="outline">
      <XhButton v-for="v in views" :key="v">{{ v }}</XhButton>
    </XhButtonGroup>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 16px">
  <xh-button-group size="sm" variant="outline">
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

  <xh-button-group size="md" variant="outline">
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

  <xh-button-group size="lg" variant="outline">
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

### 形态与语气

形态决定颜色怎么用、语气决定用哪族颜色，两者都写在组上，段自己不重复标注

```vue
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";

const variants = ["solid", "subtle", "outline", "ghost"];
const views = ["日", "周", "月"];
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <XhButtonGroup v-for="v in variants" :key="v" :variant="v" tone="brand">
      <XhButton v-for="label in views" :key="label">{{ label }}</XhButton>
    </XhButtonGroup>

    <!-- 换一族颜色只改语气，形态那条规则一个字不动 -->
    <XhButtonGroup variant="solid" tone="danger">
      <XhButton v-for="label in views" :key="label">{{ label }}</XhButton>
    </XhButtonGroup>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; justify-items: start">
  <xh-button-group variant="solid" tone="brand">
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

  <xh-button-group variant="subtle" tone="brand">
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

  <xh-button-group variant="outline" tone="brand">
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

  <xh-button-group variant="ghost" tone="brand">
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

  <!-- 换一族颜色只改语气，形态那条规则一个字不动 -->
  <xh-button-group variant="solid" tone="danger">
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

## 设计指引

### 何时使用

- 几个动作属于同一件事，且并列关系明确（保存 / 另存为 / 导出）。
- 想让整组按钮的档位、形态与语气写一次就够。

### 何时不用

- 组内各段是互斥选项、要选中其中一个：那是[切换按钮组](./toggle-group)——它有选中语义与方向键导航，按钮组两样都没有。
- 各按钮之间没有语义关联：单独摆开，用间距区分，别硬连成一条。

### 特性

- `root` 是唯一必需部件；需要把一排动作分成小段时，可在按钮之间放可选的装饰性 `separator`。
  组内按钮仍是作者自己的动作，不是 ButtonGroup 的角色节点。
- 尺寸、形态、语气写在容器上，沿自定义属性流给组内每一段。
- 横排在左右两端留圆角，竖排改在上下两端；合边跟着换轴。
- 段没有声明形态时继承组的形态；显式写在某一段上的 `solid` / `subtle` / `outline` / `ghost`
  只管该段，组不会用自己的 outline 描边盖过去。组内按压保留换底反馈，但不缩放段盒，以免共边裂开。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-button-group>` |
| Vue 组件 | `XhButtonGroup` `XhButtonGroupSeparator` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/button-group.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="button-group"`：**`root`** · `separator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `disabled` | `boolean` |  | 整组禁用：适配器把它落到组内每一段的原生 disabled 上，段自己写了禁用的仍然禁用。 |
| `fullWidth` | `boolean` |  | 撑满行宽：整组占满可用宽度，每段等分剩余空间。 |
| `orientation` | `'horizontal' \| 'vertical'` |  | 排布：horizontal / vertical，决定相邻两段在哪个轴上合边。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，落到根上供皮肤写进组内按钮的高度、内边距与字号槽位。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，落到根上沿继承流给组内每一段。 |
| `variant` | `ActionVariant` |  | 形态：solid / subtle / outline / ghost，落到根上供皮肤写进组内按钮的颜色槽位。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `disabled` | `boolean` | 整组是否禁用。适配器据此把禁用传给组内每一段——只打 data-* 是假禁用。 |
| `getRootProps` | `() => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` | 段与段之间的装饰线，纯视觉、读屏不念。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `role` | 'group' |
| `separator` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/button-group.css` 按部件选择：`[data-scope="button-group"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-full-width` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `separator` | `data-disabled` | ''（条件成立时才出现） |
| `separator` | `data-orientation` | 'vertical' \| 'horizontal' |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-button-group-radius` | `root` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `first-child`<br>`last-child`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-shape-control` | button-group 的 root 部件 border-end-end-radius、border-end-start-radius、border-start-end-radius、border-start-start-radius 覆盖槽。 |
| `--xh-button-group-separator-color` | `separator` | `background` | `default` | `--xh-border-default` | button-group 的 separator 部件 background 覆盖槽。 |
| `--xh-button-group-separator-color-disabled` | `separator` | `background` | `disabled` | `--xh-border-subtle` | button-group 的 separator 部件 background 覆盖槽。 |
| `--xh-button-group-separator-gap` | `separator` | `margin-block`<br>`margin-inline` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-space-1` | button-group 的 separator 部件 margin-block、margin-inline 覆盖槽。 |
| `--xh-button-group-separator-inset` | `separator` | `margin-block`<br>`margin-inline` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-space-1` | button-group 的 separator 部件 margin-block、margin-inline 覆盖槽。 |
| `--xh-button-group-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` | button-group 的 separator 部件 border-radius 覆盖槽。 |
| `--xh-button-group-separator-thickness` | `separator` | `block-size`<br>`inline-size` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thin` | button-group 的 separator 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 组内放[按钮](./button)；最后一段放一个带菜单的按钮即得"主动作 + 更多"的分裂按钮。

## 最佳实践

- 一组以三到五段为宜，再多就该收进[菜单](./menu)。
- 窄容器里放不下整条时，显式给 `orientation="vertical"` 让它竖排。它不会自己折行：一条焊死的按钮条折了行，两端的圆角就切在行末与行首。
- 尺寸档位只写在组上，避免各段高度与内距错位。某一段确需强调时可单独声明形态；不要把同一份
  形态和语气在组与每段重复一遍。

## 反模式

- 用按钮组表达选中态：它不出 `aria-pressed`，读屏用户听不出哪一段是当前项。
- 组内混进不可点的说明文字，破坏"每一段都是动作"的预期。

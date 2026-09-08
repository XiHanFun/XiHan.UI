来源：https://ui.docs.xihanfun.com/components/segmented

# 分段控制器 `segmented`

一排连在一起的互斥选项，选中的那一段底下有一块会滑动的指示器。它是单选组，参与表单提交。

## 何时使用

- 二到五个平级选项之间切换：视图模式（列表 / 网格）、时间粒度（日 / 周 / 月）、排序方式。
- 选项少、名字短，且值得一直摊开给用户看——分段控件的价值就在于不用点开就知道有哪几个。
- 需要随表单一起提交这个选择。

## 何时不用

- 选项超过六个，或选项文字长短悬殊：改用[单选组](./radio-group)竖排，或[选择器](./select)收进浮层。
- 需要多选，或表达的是按钮的按下态而不是一个字段值：用[切换按钮组](./toggle-group)——它没有 `name`、不参与表单，也没有滑动指示器。
- 切换的是同一块区域的几屏内容：那是[标签页](./tabs)，它管的是面板的显隐，不是一个值。

## 特性

- 集合入口：给 `collection` 就只交数据，条目文本与禁用都以数据为准；要改结构再写部件。
- 受控与非受控两态齐全：`value` 给了即受控，只发 `onValueChange` 不自改。
- 参与表单：给 `name` 后隐藏输入才带上它；宿主表单点重置，选中值回落到 `defaultValue`。隐藏输入只在「只交 `collection`、由组件铺开结构」时自动铺；自己写默认插槽排版的话，得记得放一个隐藏输入部件，否则给了 `name` 也没有任何东西参与提交。
- 指示器位置由组件量出来，横排竖排、ltr 与 rtl 都是同一条规则。
- 语气 · 尺寸两轴与其余组件同源；`block` 让整组撑满行宽、各段等分。

## 示例

### 基础用法

一排互斥选项：root 是 radiogroup、每段是 radio；整组只占一个 Tab 位，进组后四个方向键都能走

```vue
<script setup lang="ts">
import { XhSegmentedRoot } from "@xihan-ui/vue";

const ranges = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
</script>

<template>
  <!-- 不传 value 即非受控，default-value 只给初值；组本身没有可见标题，名字要自己给 -->
  <XhSegmentedRoot
    :collection="ranges"
    default-value="week"
    aria-label="时间粒度"
  />
</template>
```

```html
<!-- 指示器写在段之前：它绝对定位，靠文档序让段压在它上面 -->
<!-- 段内文字包一层 item-text 部件，与 Vue 侧铺开的结构逐个节点对得上 -->
<xh-segmented default-value="week">
  <div data-xh-part="root" aria-label="时间粒度">
    <span data-xh-part="indicator"></span>
    <button data-xh-part="item" value="day">
      <span data-xh-part="item-text">日</span>
    </button>
    <button data-xh-part="item" value="week">
      <span data-xh-part="item-text">周</span>
    </button>
    <button data-xh-part="item" value="month">
      <span data-xh-part="item-text">月</span>
    </button>
    <input data-xh-part="hidden-input" />
  </div>
</xh-segmented>
```

### 受控

传了 value 就由宿主说了算；值可以是 null，表示一段都没选中

```vue
<script setup lang="ts">
import { XhSegmentedRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const view = ref<string | null>("list");
const views = [
  { value: "list", label: "列表" },
  { value: "board", label: "看板" },
  { value: "calendar", label: "日历" },
];
</script>

<template>
  <XhSegmentedRoot v-model:value="view" :collection="views" aria-label="视图" />
  <span>当前：{{ view ?? "（未选）" }}</span>
  <button type="button" @click="view = null">清空</button>
</template>
```

```html
<xh-segmented id="segmented-controlled" value="list">
  <div data-xh-part="root" aria-label="视图">
    <span data-xh-part="indicator"></span>
    <button data-xh-part="item" value="list">
      <span data-xh-part="item-text">列表</span>
    </button>
    <button data-xh-part="item" value="board">
      <span data-xh-part="item-text">看板</span>
    </button>
    <button data-xh-part="item" value="calendar">
      <span data-xh-part="item-text">日历</span>
    </button>
    <input data-xh-part="hidden-input" />
  </div>
</xh-segmented>
<span id="segmented-controlled-readout">当前：list</span>
<button id="segmented-controlled-clear" type="button">清空</button>

<script type="module">
  // 选中值由宿主写回元素，清空按钮把它置为 null
  const group = document.getElementById("segmented-controlled");
  const readout = document.getElementById("segmented-controlled-readout");
  const clear = document.getElementById("segmented-controlled-clear");

  function render() {
    readout.textContent = `当前：${group.value ?? "（未选）"}`;
  }

  group.addEventListener("value-change", (event) => {
    group.value = event.detail.value;
    render();
  });
  clear.addEventListener("click", () => {
    group.value = null;
    render();
  });
</script>
```

### 撑满行宽

block 让整组占满一行，各段等分剩余空间，长短不一的文字也排得齐

```vue
<script setup lang="ts">
import { XhSegmentedRoot } from "@xihan-ui/vue";

const modes = [
  { value: "auto", label: "自动" },
  { value: "manual", label: "手动" },
  { value: "scheduled", label: "按计划执行" },
];
</script>

<template>
  <div style="inline-size: 420px">
    <XhSegmentedRoot
      :collection="modes"
      block
      default-value="auto"
      aria-label="执行方式"
    />
  </div>
</template>
```

```html
<div style="inline-size: 420px">
  <xh-segmented block default-value="auto">
    <div data-xh-part="root" aria-label="执行方式">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="auto">
        <span data-xh-part="item-text">自动</span>
      </button>
      <button data-xh-part="item" value="manual">
        <span data-xh-part="item-text">手动</span>
      </button>
      <button data-xh-part="item" value="scheduled">
        <span data-xh-part="item-text">按计划执行</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
</div>
```

### 竖排

orientation 只改视觉排布，四个方向键与 Home/End 照样都能走

```vue
<script setup lang="ts">
import { XhSegmentedRoot } from "@xihan-ui/vue";

const densities = [
  { value: "compact", label: "紧凑" },
  { value: "cozy", label: "适中" },
  { value: "comfortable", label: "宽松" },
];
</script>

<template>
  <XhSegmentedRoot
    :collection="densities"
    orientation="vertical"
    default-value="cozy"
    aria-label="行高"
  />
</template>
```

```html
<xh-segmented orientation="vertical" default-value="cozy">
  <div data-xh-part="root" aria-label="行高">
    <span data-xh-part="indicator"></span>
    <button data-xh-part="item" value="compact">
      <span data-xh-part="item-text">紧凑</span>
    </button>
    <button data-xh-part="item" value="cozy">
      <span data-xh-part="item-text">适中</span>
    </button>
    <button data-xh-part="item" value="comfortable">
      <span data-xh-part="item-text">宽松</span>
    </button>
    <input data-xh-part="hidden-input" />
  </div>
</xh-segmented>
```

### 禁用

单段禁用仍可聚焦、仍是方向键的起点，只是走不到它上面；整组禁用则谁都改不动

```vue
<script setup lang="ts">
import { XhSegmentedRoot } from "@xihan-ui/vue";

const plans = [
  { value: "free", label: "免费版" },
  { value: "pro", label: "专业版" },
  { value: "enterprise", label: "企业版", disabled: true },
];
</script>

<template>
  <div style="display: flex; gap: 24px; flex-wrap: wrap">
    <XhSegmentedRoot
      :collection="plans"
      default-value="free"
      aria-label="套餐"
    />
    <XhSegmentedRoot
      :collection="plans"
      disabled
      default-value="pro"
      aria-label="套餐（整组禁用）"
    />
  </div>
</template>
```

```html
<!-- 段的禁用由作者写 aria-disabled 声明，不用原生 disabled：原生禁用的按钮不可聚焦，当不成方向键的起点 -->
<div style="display: flex; gap: 24px; flex-wrap: wrap">
  <xh-segmented default-value="free">
    <div data-xh-part="root" aria-label="套餐">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="free">
        <span data-xh-part="item-text">免费版</span>
      </button>
      <button data-xh-part="item" value="pro">
        <span data-xh-part="item-text">专业版</span>
      </button>
      <button data-xh-part="item" value="enterprise" aria-disabled="true">
        <span data-xh-part="item-text">企业版</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
  <!-- 两组用的是同一份选项，末段照样自报禁用；整组禁用是叠在它之上的另一层 -->
  <xh-segmented disabled default-value="pro">
    <div data-xh-part="root" aria-label="套餐（整组禁用）">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="free">
        <span data-xh-part="item-text">免费版</span>
      </button>
      <button data-xh-part="item" value="pro">
        <span data-xh-part="item-text">专业版</span>
      </button>
      <button data-xh-part="item" value="enterprise" aria-disabled="true">
        <span data-xh-part="item-text">企业版</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
</div>
```

### 语气

tone 决定指示器与选中段文字用哪族颜色，六种语气各一组

```vue
<script setup lang="ts">
import { XhSegmentedRoot } from "@xihan-ui/vue";

const tones = [
  "brand",
  "neutral",
  "success",
  "warning",
  "danger",
  "info",
] as const;
const answers = [
  { value: "on", label: "开" },
  { value: "off", label: "关" },
];
</script>

<template>
  <div style="display: flex; gap: 24px; flex-wrap: wrap">
    <XhSegmentedRoot
      v-for="t in tones"
      :key="t"
      :collection="answers"
      :tone="t"
      :aria-label="t"
      default-value="on"
    />
  </div>
</template>
```

```html
<div style="display: flex; gap: 24px; flex-wrap: wrap">
  <xh-segmented tone="brand" default-value="on">
    <div data-xh-part="root" aria-label="brand">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="on">
        <span data-xh-part="item-text">开</span>
      </button>
      <button data-xh-part="item" value="off">
        <span data-xh-part="item-text">关</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
  <xh-segmented tone="neutral" default-value="on">
    <div data-xh-part="root" aria-label="neutral">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="on">
        <span data-xh-part="item-text">开</span>
      </button>
      <button data-xh-part="item" value="off">
        <span data-xh-part="item-text">关</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
  <xh-segmented tone="success" default-value="on">
    <div data-xh-part="root" aria-label="success">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="on">
        <span data-xh-part="item-text">开</span>
      </button>
      <button data-xh-part="item" value="off">
        <span data-xh-part="item-text">关</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
  <xh-segmented tone="warning" default-value="on">
    <div data-xh-part="root" aria-label="warning">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="on">
        <span data-xh-part="item-text">开</span>
      </button>
      <button data-xh-part="item" value="off">
        <span data-xh-part="item-text">关</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
  <xh-segmented tone="danger" default-value="on">
    <div data-xh-part="root" aria-label="danger">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="on">
        <span data-xh-part="item-text">开</span>
      </button>
      <button data-xh-part="item" value="off">
        <span data-xh-part="item-text">关</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
  <xh-segmented tone="info" default-value="on">
    <div data-xh-part="root" aria-label="info">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="on">
        <span data-xh-part="item-text">开</span>
      </button>
      <button data-xh-part="item" value="off">
        <span data-xh-part="item-text">关</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
</div>
```

### 尺寸

size 换的是段的高度、内边距与字号，指示器跟着量出来的段走

```vue
<script setup lang="ts">
import { XhSegmentedRoot } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"] as const;
const aligns = [
  { value: "start", label: "左" },
  { value: "center", label: "中" },
  { value: "end", label: "右" },
];
</script>

<template>
  <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap">
    <XhSegmentedRoot
      v-for="s in sizes"
      :key="s"
      :collection="aligns"
      :size="s"
      :aria-label="s"
      default-value="center"
    />
  </div>
</template>
```

```html
<div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap">
  <xh-segmented size="sm" default-value="center">
    <div data-xh-part="root" aria-label="sm">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="start">
        <span data-xh-part="item-text">左</span>
      </button>
      <button data-xh-part="item" value="center">
        <span data-xh-part="item-text">中</span>
      </button>
      <button data-xh-part="item" value="end">
        <span data-xh-part="item-text">右</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
  <xh-segmented size="md" default-value="center">
    <div data-xh-part="root" aria-label="md">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="start">
        <span data-xh-part="item-text">左</span>
      </button>
      <button data-xh-part="item" value="center">
        <span data-xh-part="item-text">中</span>
      </button>
      <button data-xh-part="item" value="end">
        <span data-xh-part="item-text">右</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
  <xh-segmented size="lg" default-value="center">
    <div data-xh-part="root" aria-label="lg">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="start">
        <span data-xh-part="item-text">左</span>
      </button>
      <button data-xh-part="item" value="center">
        <span data-xh-part="item-text">中</span>
      </button>
      <button data-xh-part="item" value="end">
        <span data-xh-part="item-text">右</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
</div>
```

### 表单

给了 name 才带上隐藏输入参与提交；宿主表单点重置，选中值回落到 default-value

```vue
<script setup lang="ts">
import { XhSegmentedRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const submitted = ref("");
const channels = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
  { value: "push", label: "推送" },
];

function onSubmit(event: Event) {
  const data = new FormData(event.target as HTMLFormElement);
  submitted.value = String(data.get("channel") ?? "");
}
</script>

<template>
  <form
    style="display: flex; gap: 12px; align-items: center"
    @submit.prevent="onSubmit"
  >
    <XhSegmentedRoot
      :collection="channels"
      name="channel"
      default-value="email"
      aria-label="通知渠道"
    />
    <button type="submit">提交</button>
    <button type="reset">重置</button>
    <span>已提交：{{ submitted || "（还没提交）" }}</span>
  </form>
</template>
```

```html
<form id="segmented-form" style="display: flex; gap: 12px; align-items: center">
  <xh-segmented name="channel" default-value="email">
    <div data-xh-part="root" aria-label="通知渠道">
      <span data-xh-part="indicator"></span>
      <button data-xh-part="item" value="email">
        <span data-xh-part="item-text">邮件</span>
      </button>
      <button data-xh-part="item" value="sms">
        <span data-xh-part="item-text">短信</span>
      </button>
      <button data-xh-part="item" value="push">
        <span data-xh-part="item-text">推送</span>
      </button>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-segmented>
  <button type="submit">提交</button>
  <button type="reset">重置</button>
  <span id="segmented-form-readout">已提交：（还没提交）</span>
</form>

<script type="module">
  // 提交读的就是隐藏输入里的值；重置由元素自己接住，值回落到 default-value
  const form = document.getElementById("segmented-form");
  const readout = document.getElementById("segmented-form-readout");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    readout.textContent = `已提交：${data.get("channel") ?? ""}`;
  });
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-segmented>` |
| Vue 组件 | `XhSegmentedHiddenInput` `XhSegmentedIndicator` `XhSegmentedItem` `XhSegmentedItemText` `XhSegmentedRoot` |
| 组合式函数 | `useSegmented` |
| 状态机 | `segmentedMachine` |
| 皮肤 | `@xihan-ui/styles/segmented.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="segmented"`：**`root`** · **`item`** · `item-text` · `indicator` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `SegmentedNode[]` |  | 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用都写在条目部件上」的老路。 |
| `value` | `string \| null` |  | 选中值。给定即受控：内部不再自改，只发 onValueChange。 |
| `defaultValue` | `string \| null` |  |  |
| `disabled` | `boolean` |  | 整组禁用：条目全部 aria-disabled，点击与方向键都不生效。 |
| `readOnly` | `boolean` |  | 只读：选不动，但仍可聚焦、方向键照常移焦点，对比度不降。 |
| `invalid` | `boolean` |  | 校验失败：只改呈现，不挡交互。 |
| `required` | `boolean` |  | 必填：随表单校验一起用，只发无障碍属性，不自行拦提交。 |
| `name` | `string` |  | 表单字段名。给定后隐藏输入才带 name 并参与提交。 |
| `orientation` | `Orientation` |  | 视觉排布，默认 horizontal。方向键接受的轴与它无关（四个方向键恒响应）。 |
| `dir` | `Direction` |  | 文字方向，只改写左右方向键的语义与指示器的起始缘，上下键与之无关。 不给即从根节点的计算样式现读（祖先链上的 dir 与 CSS direction 都算），给了就以它为准。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `block` | `boolean` |  | 撑满行宽，各段等分剩余空间。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: SegmentedValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `SegmentedValueChangeDetails` | 选中值变化；detail 为 `{ value: string \| null }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSegmentedRoot` | `default` | — |  |
| `XhSegmentedRoot` | `item` | `SegmentedNodeMeta` | 铺开 collection 时每一段的文本插槽。 |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.SELECT` · `ITEM.FOCUS` · `GROUP.BLUR` · `INDICATOR.MEASURE` · `FORM.RESET`

## connect API

`useSegmented` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 当前选中值；一个都没选中时为 null。 |
| `collection` | `readonly SegmentedNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `focusedValue` | `string \| null` | 焦点在组外时为 null。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `setValue` | `(next: string \| null) => void` |  |
| `measure` | `() => void` | 重量一遍指示器。选中值变化与 collection 增删改名都会自动重量，根的尺寸变化由尺寸观察器接住； 剩下这一类要手动叫：段的文字由部件手写（没走 collection）而后改动，或字体加载完把段撑宽了。 |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(props: SegmentedItemProps) => T['button']` |  |
| `getItemTextProps` | `(props: SegmentedItemProps) => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getHiddenInputProps` | `() => T['input']` | 选中值随这份原生输入提交。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the group | 整组只占一个 Tab 位：焦点落到锚点段（即选中段），锚点缺席或被禁用时先落容器再由它转投首个可停留段 |
| `ArrowRight` / `ArrowDown` | focus in group, 组未禁用 | 焦点移到下一个可停留段并选中它（禁用段跳过、尽头按 loop 回绕）；只读时焦点照走但不落值；dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowLeft` / `ArrowUp` | focus in group, 组未禁用 | 焦点移到上一个可停留段并选中它；只读时焦点照走但不落值；dir=rtl 时改由 ArrowRight 承担 |
| `Home` | focus in group, 组未禁用 | 焦点移到首个可停留段并选中它；只读时只移焦点 |
| `End` | focus in group, 组未禁用 | 焦点移到末个可停留段并选中它；只读时只移焦点 |
| `Enter` / `Space` | focus on item, 该段未禁用且组非只读 | 选中当前段；段是原生 button，这两个键由平台翻成 click |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-invalid` | 'true' \| 'false' |
| `root` | `aria-orientation` | props.orientation |
| `root` | `aria-readonly` | 'true' \| 'false' |
| `root` | `aria-required` | 'true' \| 'false' |
| `root` | `role` | 'radiogroup' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `role` | 'radio' |
| `indicator` | `aria-hidden` | 'true' |

- 根节点是 `radiogroup`，每一段是 `radio` 并显式报 `aria-checked`。
- 整组只占一个 Tab 位，组内靠方向键走，Home/End 直达首末段；焦点进组落在已选中的那一段上。
- 禁用的段用 `aria-disabled` 而不是原生 `disabled`：它仍然可以聚焦、仍然是方向键的起点。
- 组本身没有可见标题，请自己给根节点写 `aria-label` 或 `aria-labelledby`，否则读屏只会念"单选组"。
- 指示器是纯装饰，对读屏隐藏；"当前是哪一段"靠段自己的选中态表达，指示器不渲染也读得出来。

## 样式

默认皮肤 `@xihan-ui/styles/segmented.css` 按部件选择：`[data-scope="segmented"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-block` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-required` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `indicator` | `data-value` | context.get('value') |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-segmented-bg` · `--xh-segmented-bg-disabled` · `--xh-segmented-border` · `--xh-segmented-border-invalid` · `--xh-segmented-font-size` · `--xh-segmented-h` · `--xh-segmented-indicator-bg` · `--xh-segmented-indicator-radius` · `--xh-segmented-indicator-shadow` · `--xh-segmented-indicator-shadow-disabled` · `--xh-segmented-item-bg-hover` · `--xh-segmented-item-fg` · `--xh-segmented-item-fg-checked` · `--xh-segmented-item-fg-checked-disabled` · `--xh-segmented-item-fg-hover` · `--xh-segmented-item-font-weight` · `--xh-segmented-item-gap` · `--xh-segmented-item-h` · `--xh-segmented-item-press-scale` · `--xh-segmented-item-px` · `--xh-segmented-item-radius` · `--xh-segmented-radius` · `--xh-segmented-track-padding`

## 动效

`background-color` · `block-size` · `box-shadow` · `color` · `inline-size` · `inset-block-start` · `inset-inline-start` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 方向从 DOM 现读：整页或某个祖先声明了 `dir='rtl'`（或 CSS `direction`），左右方向键的语义与指示器的起始缘就一起翻过来，不必再给组件传一遍。上下键不受影响。
- `dir` 属性是显式覆盖：给了就以它为准，用在「整页 ltr、局部一块 rtl」这类场合。
- 指示器的偏移按逻辑起始缘量，rtl 下自动从右缘算起，不必另写一套样式。

## 组合

- 放进[表单字段](./field)里，让标签、说明与错误文案一并接上。
- 与[标签页](./tabs)搭：分段控件切数据口径，标签页切内容面板，两者不要互相顶替。

## 最佳实践

- 各段文字长度尽量接近：长短悬殊时指示器一滑，整排宽度会跟着跳。
- 段数固定下来再上：分段控件不适合数量会变的选项集。
- 选中态别只靠指示器的颜色区分，文字色也要跟着变，色觉障碍的用户才分得出。
- 段的文字不走 `collection` 而是自己手写、且会在运行期改动时，改完叫一次 `measure()`：指示器只跟着选中值、集合与根的尺寸走，段内文字撑宽了它看不见。
- 动态摘掉正持有焦点的那一段（比如按权限过滤掉它）之后，焦点会掉回 `<body>`。组件只保证 Tab 位退回容器、键盘还进得来；要不丢位置，得由页面自己把焦点挪到相邻的那一段上。

## 反模式

- 把它当按钮组用：段是一个值的几个取值，不是几个动作。要触发动作用[按钮组](./button-group)。
- 一行里塞七八段：那已经是个下拉框了，还占着整行宽度。
- 用它切换整页内容却不改地址：用户刷新一次就回到了第一段。

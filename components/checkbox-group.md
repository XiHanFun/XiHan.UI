来源：https://ui.docs.xihanfun.com/components/checkbox-group

# CheckboxGroup 复选框组

从一组选项中选择任意多项。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/checkbox-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/checkbox-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/checkbox-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/checkbox-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/checkbox-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

从一组选项中选择任意多项

```vue
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";

const items = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
  { value: "push", label: "推送通知" },
];
</script>

<template>
  <XhCheckboxGroupRoot
    :collection="items"
    :default-value="['email']"
    label="通知方式"
    name="notification"
  />
</template>
```

```html
<xh-checkbox-group default-value="email" name="notification">
  <div data-xh-part="root">
    <span data-xh-part="label">通知方式</span>
    <div data-xh-part="item" value="email">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">邮件</span>
    </div>
    <div data-xh-part="item" value="sms">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">短信</span>
    </div>
    <div data-xh-part="item" value="push">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">推送通知</span>
    </div>
  </div>
</xh-checkbox-group>
```

## 组件结构

加粗的是必需部件。

`data-scope="checkbox-group"`：**`root`** · `label` · **`item`** · `indicator` · `item-text` · `item-description` · `hidden-input` · `select-all-trigger`

## 示例

### 全选与半选

使用 itemValues 计算全选和半选状态

```vue
<script setup lang="ts">
import {
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
  XhCheckboxGroupSelectAllTrigger,
} from "@xihan-ui/vue";

const items = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
  { value: "push", label: "推送通知" },
];
const itemValues = items.map(t => t.value);
</script>

<template>
  <XhCheckboxGroupRoot :default-value="['email']" :item-values="itemValues">
    <XhCheckboxGroupLabel>通知方式</XhCheckboxGroupLabel>
    <XhCheckboxGroupSelectAllTrigger>全选</XhCheckboxGroupSelectAllTrigger>
    <XhCheckboxGroupItem
      v-for="item in items"
      :key="item.value"
      :value="item.value"
    >
      <XhCheckboxGroupIndicator />
      <XhCheckboxGroupItemText>{{ item.label }}</XhCheckboxGroupItemText>
    </XhCheckboxGroupItem>
  </XhCheckboxGroupRoot>
</template>
```

```html
<xh-checkbox-group default-value="email" item-values="email,sms,push">
  <div data-xh-part="root">
    <span data-xh-part="label">通知方式</span>
    <div data-xh-part="select-all-trigger">全选</div>
    <div data-xh-part="item" value="email">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">邮件</span>
    </div>
    <div data-xh-part="item" value="sms">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">短信</span>
    </div>
    <div data-xh-part="item" value="push">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">推送通知</span>
    </div>
  </div>
</xh-checkbox-group>
```

### 横向排布

使用 orientation 设置排列方向

```vue
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const channels = ref<string[]>(["email"]);
const items = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
  { value: "push", label: "推送" },
];
</script>

<template>
  <XhCheckboxGroupRoot
    v-model:value="channels"
    :collection="items"
    label="通知渠道"
    orientation="horizontal"
  />
</template>
```

```html
<xh-checkbox-group default-value="email" orientation="horizontal">
  <div data-xh-part="root">
    <span data-xh-part="label">通知渠道</span>
    <div data-xh-part="item" value="email">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">邮件</span>
    </div>
    <div data-xh-part="item" value="sms">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">短信</span>
    </div>
    <div data-xh-part="item" value="push">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">推送</span>
    </div>
  </div>
</xh-checkbox-group>
```

### 禁用与只读

禁用项不可操作，只读项仍可聚焦

```vue
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";

const items = [
  { value: "cheese", label: "芝士" },
  { value: "bacon", label: "培根" },
];

// 单项禁用写在数据里，条目部件上不必再声明一遍
const partly = [
  { value: "cheese", label: "芝士" },
  { value: "truffle", label: "松露", disabled: true },
];
</script>

<template>
  <XhCheckboxGroupRoot :default-value="['cheese']" :collection="items" label="整组禁用" disabled />

  <XhCheckboxGroupRoot :default-value="['cheese']" :collection="items" label="整组只读" read-only />

  <XhCheckboxGroupRoot :default-value="['cheese']" :collection="partly" label="单项禁用" />
</template>
```

```html
<xh-checkbox-group default-value="cheese" disabled>
  <div data-xh-part="root">
    <span data-xh-part="label">整组禁用</span>
    <div data-xh-part="item" value="cheese">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">芝士</span>
    </div>
    <div data-xh-part="item" value="bacon">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">培根</span>
    </div>
  </div>
</xh-checkbox-group>

<xh-checkbox-group default-value="cheese" read-only>
  <div data-xh-part="root">
    <span data-xh-part="label">整组只读</span>
    <div data-xh-part="item" value="cheese">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">芝士</span>
    </div>
    <div data-xh-part="item" value="bacon">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">培根</span>
    </div>
  </div>
</xh-checkbox-group>

<xh-checkbox-group default-value="cheese">
  <div data-xh-part="root">
    <span data-xh-part="label">单项禁用</span>
    <div data-xh-part="item" value="cheese">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">芝士</span>
    </div>
    <!-- 单项禁用写在条目节点上 -->
    <div data-xh-part="item" value="truffle" aria-disabled="true">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">松露</span>
    </div>
  </div>
</xh-checkbox-group>
```

### 尺寸

size 决定方框与条目文字的几何档位，组标题不随档

```vue
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"] as const;
const items = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start">
    <XhCheckboxGroupRoot
      v-for="s in sizes"
      :key="s"
      :collection="items"
      :default-value="['email']"
      :label="s"
      :size="s"
    />
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start">
  <xh-checkbox-group size="sm" default-value="email">
    <div data-xh-part="root">
      <span data-xh-part="label">sm</span>
      <div data-xh-part="item" value="email">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">邮件</span>
      </div>
      <div data-xh-part="item" value="sms">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">短信</span>
      </div>
    </div>
  </xh-checkbox-group>

  <xh-checkbox-group default-value="email">
    <div data-xh-part="root">
      <span data-xh-part="label">md</span>
      <div data-xh-part="item" value="email">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">邮件</span>
      </div>
      <div data-xh-part="item" value="sms">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">短信</span>
      </div>
    </div>
  </xh-checkbox-group>

  <xh-checkbox-group size="lg" default-value="email">
    <div data-xh-part="root">
      <span data-xh-part="label">lg</span>
      <div data-xh-part="item" value="email">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">邮件</span>
      </div>
      <div data-xh-part="item" value="sms">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">短信</span>
      </div>
    </div>
  </xh-checkbox-group>
</div>
```

### 卡片

variant="card" 把每个选项画成一张可点的卡；collection 里的 description 铺成文案下方的说明行

```vue
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";

const items = [
  { value: "email", label: "邮件", description: "每天早上汇总一封" },
  { value: "sms", label: "短信", description: "只发需要立即处理的事项" },
  { value: "push", label: "推送通知", description: "在手机与桌面端即时提醒" },
];
</script>

<template>
  <XhCheckboxGroupRoot
    variant="card"
    :collection="items"
    :default-value="['email']"
    label="通知方式"
    style="max-inline-size: 24rem"
  />
</template>
```

```html
<xh-checkbox-group variant="card" default-value="email">
  <div data-xh-part="root" style="max-inline-size: 24rem">
    <span data-xh-part="label">通知方式</span>
    <div data-xh-part="item" value="email">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">邮件</span>
      <span data-xh-part="item-description">每天早上汇总一封</span>
    </div>
    <div data-xh-part="item" value="sms">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">短信</span>
      <span data-xh-part="item-description">只发需要立即处理的事项</span>
    </div>
    <div data-xh-part="item" value="push">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">推送通知</span>
      <span data-xh-part="item-description">在手机与桌面端即时提醒</span>
    </div>
  </div>
</xh-checkbox-group>
```

### 限定选择数

min / max 约束选中数：选满时没选的项置灰，降到下限时已选的项摘不掉

```vue
<script setup lang="ts">
import {
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
} from "@xihan-ui/vue";

const items = [
  { value: "design", label: "设计" },
  { value: "frontend", label: "前端" },
  { value: "backend", label: "后端" },
  { value: "data", label: "数据" },
];
</script>

<template>
  <XhCheckboxGroupRoot v-slot="{ value, atMax }" :default-value="['design']" :min="1" :max="2">
    <XhCheckboxGroupLabel>擅长方向（选 1 到 2 项）</XhCheckboxGroupLabel>
    <XhCheckboxGroupItem v-for="item in items" :key="item.value" :value="item.value">
      <XhCheckboxGroupIndicator />
      <XhCheckboxGroupItemText>{{ item.label }}</XhCheckboxGroupItemText>
    </XhCheckboxGroupItem>
    <span>已选 {{ value.length }} 项{{ atMax ? "，已达上限" : "" }}</span>
  </XhCheckboxGroupRoot>
</template>
```

```html
<xh-checkbox-group id="checkbox-group-limit" default-value="design" min="1" max="2">
  <div data-xh-part="root">
    <span data-xh-part="label">擅长方向（选 1 到 2 项）</span>
    <div data-xh-part="item" value="design">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">设计</span>
    </div>
    <div data-xh-part="item" value="frontend">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">前端</span>
    </div>
    <div data-xh-part="item" value="backend">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">后端</span>
    </div>
    <div data-xh-part="item" value="data">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">数据</span>
    </div>
    <span id="checkbox-group-limit-status">已选 1 项</span>
  </div>
</xh-checkbox-group>

<script type="module">
  const group = document.getElementById("checkbox-group-limit");
  const status = document.getElementById("checkbox-group-limit-status");
  group.addEventListener("value-change", (event) => {
    status.textContent = `已选 ${event.detail.value.length} 项${group.atMax ? "，已达上限" : ""}`;
  });
</script>
```

## 设计指引

### 何时使用

- 用于偏好设置、筛选条件和批量选择。
- 选项之间要靠一两句说明才分得清（通知渠道、附加服务）时，用 `variant="card"` 把每个选项画成一张卡。

### 何时不用

- 选项较多或需要搜索时，使用[选择器](./select)的多选或[穿梭框](./transfer)。
- 选项互斥时，使用[单选组](./radio-group)。

### 特性

- `collection` 提供选项文本与禁用状态。
- 全选触发器自动计算全选与半选状态。
- `min` / `max` 约束选中数：选满 `max` 时没选的条目报 `aria-disabled` 并置灰、点不动，降到 `min` 时已选的条目摘不掉；全选只补到 `max` 为止，已满时再按是全不选（仍保住 `min`）。被下限锁住的已选项照常随表单提交。约束只落在用户的点选与全选上，程序化的 `setValue` 与初值原样落地；`min` 大于 `max` 或不是非负整数时立即报错。插槽载荷与元素上的 `atMax` / `atMin` 报此刻是否顶到了上下限。
- `orientation` 设置横向或纵向排列。
- 方框是字段家族的控制盒：不填底、描边与无影，勾中后以语气色填充；整行接 Action Control row 档，悬停 / 按下换面不缩放，方框随行换到承载面阶梯的下一档。
- `variant` 是结构形态：缺省 `list` 是一列「方框 + 文案」的行；`card` 把每个条目画成一张可点的描边卡（surface 圆角，白底承载阶梯悬停 100 → 按下 200），方框在卡的行首，整张卡是命中区。勾中的卡换品牌淡底（写了 `tone` 换语气淡底），与表格选中行、穿梭框选中项同一种标记，描边不换；只读时卡片不给悬停与按下面。竖排时卡片撑满一列，横排时各卡等分一行、放不下就折行。全选触发器在两种形态里都是一行。
- `item-description` 是文案下方的说明行（13 / `--xh-fg-muted`），与文案一起构成条目的可及名；`collection` 里的 `description` 会自动铺出这一行。
- 根是 `role=group`，`label` 部件真渲染了时才经 `aria-labelledby` 给组命名；不写标题时给根节点写 `aria-label`。Vue / React 的 `label` 属性不论手写选项还是数据驱动都会铺出标题。

### 组合

- 每一项都是一个[复选框](./checkbox)，全选触发器是组内额外的一项，半选状态由组计算。
- 在[表单](./form)中以整组的值数组作为一个字段参与校验与提交。
- 直接放进[表单字段](./field)即可：字段的标题并进组名、说明进描述链，读屏进组时一起念出。

### 最佳实践

- 使用简短、互不重叠的选项标签。
- 保持选项顺序稳定。
- 设了 `min` / `max` 就在标题或说明里写明范围（「选 1 到 2 项」），置灰的条目不会自己解释为什么点不动。
- 卡片里只放一两句说明，不放按钮、链接等第二个可点目标：整张卡是一次勾选，内嵌的动作会与勾选抢同一次点击。

### 反模式

- 用复选框组表达互斥选项。
- 将全选项放在列表末尾。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-checkbox-group>` |
| Vue 组件 | `XhCheckboxGroupIndicator` `XhCheckboxGroupItem` `XhCheckboxGroupItemDescription` `XhCheckboxGroupItemText` `XhCheckboxGroupLabel` `XhCheckboxGroupRoot` `XhCheckboxGroupSelectAllTrigger` |
| 组合式函数 | `useCheckboxGroup` |
| 状态机 | `checkboxGroupMachine` |
| 皮肤 | `@xihan-ui/styles/checkbox-group.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `CheckboxGroupNode[]` |  | 条目数据，显示文本与禁用的事实源。提供后条目部件只需声明 value。 未提供时回到文本与禁用都写在条目部件上的方式。 |
| `value` | `string[]` |  | 选中值集合。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 |
| `defaultValue` | `string[]` |  |  |
| `itemValues` | `string[]` |  | 组内全部条目的值，按书写顺序声明；未提供时 checkedState 退化为 unchecked / indeterminate 两态。 |
| `min` | `number` |  | 至少选几项，非负整数；选中数降到它时已选的条目改不动（aria-disabled）。 只约束用户的点选与全选，不校验程序化写入与初值。 |
| `max` | `number` |  | 至多选几项，非负整数；选中数到了它时未选的条目改不动（aria-disabled），全选只补到它为止。 只约束用户的点选与全选，不校验程序化写入与初值。min 大于 max 立即报错。 |
| `disabled` | `boolean` |  | 整组禁用：每一项随之禁用，且隐藏输入不参与提交。 |
| `readOnly` | `boolean` |  | 只读：仍可聚焦与朗读，但用户不可修改。 |
| `invalid` | `boolean` |  | 校验失败标注，写入每个条目的 aria-invalid。 |
| `name` | `string` |  | 表单字段名；提供后每个条目的隐藏输入才带 name，同名多值一并提交。 |
| `orientation` | `Orientation` |  | 视觉排布，默认 vertical。只输出 data-orientation，不输出 aria-orientation。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定勾选方框使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定方框与文字的几何档位。 |
| `variant` | `CheckboxGroupVariant` |  | 结构形态，默认 list；card 把每个条目画成一张可点的卡。 |
| `labelled` | `boolean` |  | 作者渲染了 label 部件时置真，由适配器统计而不是判断标题文字是否有值。 为假时根不输出 aria-labelledby：指向未渲染的 id 会让组没有名字，作者写在根上的 aria-label 也会被它压住。 |
| `onValueChange` | `(details: CheckboxGroupValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |

### CheckboxGroupNode

`collection` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 是 |  |
| `label` | `string` |  | 展示文本；默认回退为 value。 |
| `description` | `string` |  | 说明文字，写入 item-description 部件；未提供时本条不铺该部件。 |
| `disabled` | `boolean` |  | 条目禁用：仍可聚焦、仍占一个 Tab 停靠点，但不可修改，全选也跳过它。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `CheckboxGroupValueChangeDetails` | 选中值变化；detail 为 `{ value: string[] }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCheckboxGroupRoot` | `default` | `CheckboxGroupRootSlotProps` |  |
| `XhCheckboxGroupRoot` | `label` | — |  |
| `XhCheckboxGroupRoot` | `item` | `CheckboxGroupNodeMeta` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhCheckboxGroupItem` | `value` | `string` | 是 |  |
| `XhCheckboxGroupItem` | `disabled` | `boolean` |  | 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 |
| `XhCheckboxGroupRoot` | `label` | `ReactNode` |  | 标题文字。提供后不必再写 label 部件。 |
| `XhCheckboxGroupRoot` | `renderItem` | `(node: CheckboxGroupNodeMeta) => ReactNode` |  | 每个条目的自定义内容；未提供时使用 collection 中的 label。 |
| `XhCheckboxGroupRoot` | `children` | `SlotChildren<CheckboxGroupRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `item` | 'checked' \| 'unchecked' |
| `indicator` | 'checked' \| 'unchecked' |
| `item-text` | 'checked' \| 'unchecked' |
| `item-description` | 'checked' \| 'unchecked' |
| `hidden-input` | 'checked' \| 'unchecked' |
| `select-all-trigger` | resolveCheckedState(value, prop('itemValues') ?? []) |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.TOGGLE` · `ALL.TOGGLE` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**判据**：`editable` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` |  |
| `collection` | `readonly CheckboxGroupNodeMeta[]` | 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `checkedState` | `CheckboxGroupCheckedState` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `atMax` | `boolean` | 选中数到了 max：未选的条目改不动。未设 max 时恒为 false。 |
| `atMin` | `boolean` | 选中数降到 min：已选的条目改不动。未设 min（或为 0）时恒为 false。 |
| `isChecked` | `(value: string) => boolean` |  |
| `setValue` | `(next: string[]) => void` | 整体替换选中集合。程序化入口，不受 readOnly 拦截。 |
| `toggleValue` | `(value: string) => void` | 切换某个值；整组禁用或只读时无效。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getItemProps` | `(props: CheckboxGroupItemProps) => T['element']` |  |
| `getIndicatorProps` | `(props: CheckboxGroupItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: CheckboxGroupItemProps) => T['element']` |  |
| `getItemDescriptionProps` | `(props: CheckboxGroupItemProps) => T['element']` | 条目的说明：文案下方一行次级文字，常用在 card 形态里。 |
| `getHiddenInputProps` | `(props: CheckboxGroupItemProps) => T['input']` | 条目的表单影子：一份视觉隐藏的原生 checkbox，由条目内部渲染。 |
| `getSelectAllTriggerProps` | `() => T['element']` | 全选 / 半选的父复选框。必须写在 root 之内，它依靠祖先链找到本组。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus enters or leaves the group | 组内有几个条目就有几个 Tab 停靠点（禁用条目也留一个），容器自己不占位；单选组的"整组一个停靠点"在这里不成立 |
| `Space` | focus on item, group editable and item not disabled | 翻转该条目的选中态；改不动时放行按键给页面滚动 |
| `Space` | focus on select-all-trigger, group editable | 可用条目未全选则一并勾上，已全选则一并取消；禁用条目不受影响 |
| `Space` | held on item / select-all-trigger, group editable and item not disabled | 按住期间该行投影 data-pressed，与指针 :active 同一副按压面（行换面、方框随行换底，不缩放）；抬起或失焦撤下，按住途中整组转入禁用或只读也撤下。role=checkbox 只有 Space 是激活键，Enter 不进按压面；选中与按压互相独立 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-labelledby` | `label` 部件的 id \| undefined |
| `root` | `role` | 'group' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-invalid` | 'true' \| 'false' |
| `item` | `aria-readonly` | 'true' \| 'false' |
| `item` | `role` | 'checkbox' |
| `indicator` | `aria-hidden` | 'true' |
| `hidden-input` | `aria-hidden` | 'true' |
| `select-all-trigger` | `aria-checked` | 'true' \| 'mixed' \| 'false' |
| `select-all-trigger` | `aria-disabled` | 'false' \| 'true' |
| `select-all-trigger` | `aria-labelledby` | `label` 部件的 id `select-all-trigger` 部件的 id \| `select-all-trigger` 部件的 id |
| `select-all-trigger` | `aria-readonly` | 'true' \| 'false' |
| `select-all-trigger` | `role` | 'checkbox' |

## 样式参考

### 皮肤

`@xihan-ui/styles/checkbox-group.css` 按 `[data-scope="checkbox-group"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-checkbox-group` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-readonly` | ''（条件成立时才出现） |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-xh-action-control` | '' |
| `item` | `data-xh-action-display` | 'always' |
| `item` | `data-xh-action-profile` | 'row' |
| `item` | `data-xh-action-size` | 'xs' |
| `item` | `data-xh-action-variant` | 'outline' \| 'ghost' |
| `item` | `data-xh-choice-card` | ''（条件成立时才出现） |
| `indicator` | `data-disabled` | ''（条件成立时才出现） |
| `indicator` | `data-state` | 'checked' \| 'unchecked' |
| `indicator` | `data-xh-check-mark` | 'checked' \| 'unchecked' |
| `indicator` | `data-xh-check-mark-profile` | 'box' |
| `item-text` | `data-disabled` | ''（条件成立时才出现） |
| `item-text` | `data-state` | 'checked' \| 'unchecked' |
| `item-description` | `data-disabled` | ''（条件成立时才出现） |
| `item-description` | `data-state` | 'checked' \| 'unchecked' |
| `hidden-input` | `data-disabled` | ''（条件成立时才出现） |
| `hidden-input` | `data-state` | 'checked' \| 'unchecked' |
| `select-all-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `select-all-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `select-all-trigger` | `data-readonly` | ''（条件成立时才出现） |
| `select-all-trigger` | `data-state` | resolveCheckedState(value, prop('itemValues') ?? []) |
| `select-all-trigger` | `data-xh-action-control` | '' |
| `select-all-trigger` | `data-xh-action-display` | 'always' |
| `select-all-trigger` | `data-xh-action-profile` | 'row' |
| `select-all-trigger` | `data-xh-action-size` | 'xs' |
| `select-all-trigger` | `data-xh-action-variant` | 'ghost' |
| `select-all-trigger` | `data-xh-check-mark` | resolveCheckedState(value, prop('itemValues') ?? []) |
| `select-all-trigger` | `data-xh-check-mark-profile` | 'row' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-checkbox-group-card-title-font-weight` | `item`<br>`item-text` | `font-weight` | `xh-choice-card` | `--xh-text-label-weight` | checkbox-group 的 item、item-text 部件 font-weight 覆盖槽。 |
| `--xh-checkbox-group-gap` | `root` | `gap` | `default` | `--xh-space-2` | checkbox-group 的 root 部件 gap 覆盖槽。 |
| `--xh-checkbox-group-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-_checkbox-group-glyph` | checkbox-group 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-checkbox-group-indicator-bg` | `indicator`<br>`root`<br>`select-all-trigger` | `background-color` | `default` | `transparent` | checkbox-group 的 indicator、root、select-all-trigger 部件 background-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-bg-checked` | `indicator`<br>`select-all-trigger` | `background-color` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`state=checked`<br>`state=indeterminate` | `--xh-_checkbox-group-accent` | checkbox-group 的 indicator、select-all-trigger 部件 background-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-bg-checked-pressed` | `indicator`<br>`item`<br>`root`<br>`select-all-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`is([data-state='checked'], [data-state='indeterminate'])`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly`<br>`state=checked`<br>`state=indeterminate` | `--xh-_tone-active` | checkbox-group 的 indicator、item、root、select-all-trigger 部件 background-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-bg-disabled` | `indicator`<br>`item`<br>`root`<br>`select-all-trigger` | `background-color` | `disabled` | `--xh-bg-subtle` | checkbox-group 的 indicator、item、root、select-all-trigger 部件 background-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-bg-pressed` | `indicator`<br>`item`<br>`root`<br>`select-all-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly` | `--xh-_checkbox-group-host-bg-pressed` | checkbox-group 的 indicator、item、root、select-all-trigger 部件 background-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-border` | `indicator`<br>`select-all-trigger` | `border` | `default` | `--xh-border-control` | checkbox-group 的 indicator、select-all-trigger 部件 border 覆盖槽。 |
| `--xh-checkbox-group-indicator-border-checked` | `indicator`<br>`select-all-trigger` | `border-color` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`state=checked`<br>`state=indeterminate` | `--xh-_checkbox-group-accent` | checkbox-group 的 indicator、select-all-trigger 部件 border-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-border-disabled` | `indicator`<br>`item`<br>`root`<br>`select-all-trigger` | `border-color` | `disabled` | `--xh-border-default` | checkbox-group 的 indicator、item、root、select-all-trigger 部件 border-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-border-hover` | `indicator`<br>`item`<br>`root`<br>`select-all-trigger` | `border-color` | `@media (hover: hover)`<br>`disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-readonly])`<br>`not([data-state='checked'])`<br>`not([data-state='indeterminate'])`<br>`readonly`<br>`state=checked`<br>`state=indeterminate` | `--xh-border-control-hover` | checkbox-group 的 indicator、item、root、select-all-trigger 部件 border-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-border-invalid` | `indicator`<br>`root` | `border-color` | `invalid` | `--xh-border-invalid` | checkbox-group 的 indicator、root 部件 border-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-fg` | `indicator`<br>`select-all-trigger` | `--xh-check-mark-fg`<br>`color` | `default` | `--xh-_checkbox-group-on-accent` | checkbox-group 的 indicator、select-all-trigger 部件 --xh-check-mark-fg、color 覆盖槽。 |
| `--xh-checkbox-group-indicator-fg-disabled` | `indicator`<br>`item`<br>`root`<br>`select-all-trigger` | `--xh-check-mark-fg`<br>`color` | `disabled` | `--xh-fg-disabled` | checkbox-group 的 indicator、item、root、select-all-trigger 部件 --xh-check-mark-fg、color 覆盖槽。 |
| `--xh-checkbox-group-indicator-font-size` | `indicator`<br>`select-all-trigger` | `font-size` | `default` | `--xh-_checkbox-group-glyph` | checkbox-group 的 indicator、select-all-trigger 部件 font-size 覆盖槽。 |
| `--xh-checkbox-group-indicator-radius` | `indicator`<br>`select-all-trigger` | `border-radius` | `default` | `--xh-shape-inset` | checkbox-group 的 indicator、select-all-trigger 部件 border-radius 覆盖槽。 |
| `--xh-checkbox-group-indicator-shadow` | `indicator`<br>`select-all-trigger` | `box-shadow` | `default` | `none` | checkbox-group 的 indicator、select-all-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-checkbox-group-indicator-size` | `indicator`<br>`select-all-trigger` | `--xh-check-mark-box-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-_checkbox-group-box` | checkbox-group 的 indicator、select-all-trigger 部件 --xh-check-mark-box-size、block-size、inline-size 覆盖槽。 |
| `--xh-checkbox-group-item-bg-hover` | `item` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle` | checkbox-group 的 item 部件 background-color 覆盖槽。 |
| `--xh-checkbox-group-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` | checkbox-group 的 item 部件 background-color 覆盖槽。 |
| `--xh-checkbox-group-item-description-fg` | `item-description` | `color` | `default` | `--xh-fg-muted` | checkbox-group 的 item-description 部件 color 覆盖槽。 |
| `--xh-checkbox-group-item-description-fg-disabled` | `item`<br>`item-description` | `color` | `disabled` | `--xh-fg-disabled` | checkbox-group 的 item、item-description 部件 color 覆盖槽。 |
| `--xh-checkbox-group-item-description-font-size` | `item-description` | `font-size` | `default` | `--xh-text-secondary-size` | checkbox-group 的 item-description 部件 font-size 覆盖槽。 |
| `--xh-checkbox-group-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | checkbox-group 的 item 部件 color 覆盖槽。 |
| `--xh-checkbox-group-item-fg-disabled` | `item` | `color` | `disabled` | `--xh-fg-disabled` | checkbox-group 的 item 部件 color 覆盖槽。 |
| `--xh-checkbox-group-item-font-size` | `item` | `font-size` | `default` | `--xh-_checkbox-group-font-size` | checkbox-group 的 item 部件 font-size 覆盖槽。 |
| `--xh-checkbox-group-item-gap` | `item` | `gap` | `default` | `--xh-_checkbox-group-gap` | checkbox-group 的 item 部件 gap 覆盖槽。 |
| `--xh-checkbox-group-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | checkbox-group 的 item 部件 border-radius 覆盖槽。 |
| `--xh-checkbox-group-item-row-gap` | `item` | `row-gap` | `has(> [data-scope='checkbox-group'][data-part='item-description'])`<br>`not([data-xh-choice-card])`<br>`xh-choice-card` | `--xh-space-1` | checkbox-group 的 item 部件 row-gap 覆盖槽。 |
| `--xh-checkbox-group-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | checkbox-group 的 label 部件 color 覆盖槽。 |
| `--xh-checkbox-group-label-fg-disabled` | `label`<br>`root` | `color` | `disabled` | `--xh-fg-subtle` | checkbox-group 的 label、root 部件 color 覆盖槽。 |
| `--xh-checkbox-group-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | checkbox-group 的 label 部件 font-size 覆盖槽。 |
| `--xh-checkbox-group-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | checkbox-group 的 label 部件 font-weight 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-bg-hover` | `select-all-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle` | checkbox-group 的 select-all-trigger 部件 background-color 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-bg-pressed` | `select-all-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` | checkbox-group 的 select-all-trigger 部件 background-color 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-fg` | `select-all-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | checkbox-group 的 select-all-trigger 部件 color 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-fg-disabled` | `select-all-trigger` | `color` | `disabled` | `--xh-fg-disabled` | checkbox-group 的 select-all-trigger 部件 color 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-font-size` | `select-all-trigger` | `font-size` | `default` | `--xh-_checkbox-group-font-size` | checkbox-group 的 select-all-trigger 部件 font-size 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-font-weight` | `select-all-trigger` | `font-weight` | `default` | `--xh-font-weight-medium` | checkbox-group 的 select-all-trigger 部件 font-weight 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-gap` | `select-all-trigger` | `gap` | `default` | `--xh-_checkbox-group-gap` | checkbox-group 的 select-all-trigger 部件 gap 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-radius` | `select-all-trigger` | `border-radius` | `default` | `--xh-shape-inset` | checkbox-group 的 select-all-trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 切换（见[动效规范](../design/motion#角色)）。

`-webkit-mask-size` · `background-color` · `border-color` · `mask-size` · `opacity` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`hover: hover` · `pointer: coarse`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

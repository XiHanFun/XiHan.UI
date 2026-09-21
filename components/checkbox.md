来源：https://ui.docs.xihanfun.com/components/checkbox

# Checkbox 复选框 `alpha`

用于选择一个或多个独立选项。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/checkbox" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/checkbox.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/checkbox" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/checkbox" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/checkbox.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

标记一个独立选项

```vue
<script setup lang="ts">
import { XhCheckbox } from "@xihan-ui/vue";
</script>

<template>
  <XhCheckbox name="updates" default-checked>接收产品更新</XhCheckbox>
</template>
```

```html
<xh-checkbox name="updates" default-checked>
  <label data-xh-part="label">
    <button data-xh-part="root">
      <span data-xh-part="indicator"></span>
      <input data-xh-part="hidden-input" />
    </button>
    <span data-xh-part="text">接收产品更新</span>
  </label>
</xh-checkbox>
```

## 组件结构

加粗的是必需部件。

`data-scope="checkbox"`：**`root`** · `indicator` · `hidden-input` · `label` · `text`

## 示例

### 不确定状态

表示部分选中

```vue
<script setup lang="ts">
import { XhCheckbox } from "@xihan-ui/vue";
import { ref } from "vue";

const checked = ref<boolean | "indeterminate">("indeterminate");
</script>

<template>
  <XhCheckbox v-model:checked="checked">选择全部</XhCheckbox>
</template>
```

```html
<xh-checkbox id="checkbox-tristate" checked="indeterminate">
  <label data-xh-part="label">
    <button data-xh-part="root">
      <span data-xh-part="indicator"></span>
    </button>
    <span data-xh-part="text">选择全部</span>
  </label>
</xh-checkbox>

<script type="module">
  const checkbox = document.getElementById("checkbox-tristate");
  checkbox.addEventListener("checked-change", (event) => {
    checkbox.checked = event.detail.checked;
  });
</script>
```

### 颜色

tone 决定勾中后方框使用哪族颜色，因此这里都设为勾中

```vue
<script setup lang="ts">
import { XhCheckbox } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap">
    <XhCheckbox v-for="t in tones" :key="t" :tone="t" default-checked>{{ t }}</XhCheckbox>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap">
  <xh-checkbox tone="brand" default-checked>
    <label data-xh-part="label">
      <button data-xh-part="root"><span data-xh-part="indicator"></span></button>
      <span data-xh-part="text">brand</span>
    </label>
  </xh-checkbox>
  <xh-checkbox tone="neutral" default-checked>
    <label data-xh-part="label">
      <button data-xh-part="root"><span data-xh-part="indicator"></span></button>
      <span data-xh-part="text">neutral</span>
    </label>
  </xh-checkbox>
  <xh-checkbox tone="success" default-checked>
    <label data-xh-part="label">
      <button data-xh-part="root"><span data-xh-part="indicator"></span></button>
      <span data-xh-part="text">success</span>
    </label>
  </xh-checkbox>
  <xh-checkbox tone="warning" default-checked>
    <label data-xh-part="label">
      <button data-xh-part="root"><span data-xh-part="indicator"></span></button>
      <span data-xh-part="text">warning</span>
    </label>
  </xh-checkbox>
  <xh-checkbox tone="danger" default-checked>
    <label data-xh-part="label">
      <button data-xh-part="root"><span data-xh-part="indicator"></span></button>
      <span data-xh-part="text">danger</span>
    </label>
  </xh-checkbox>
  <xh-checkbox tone="info" default-checked>
    <label data-xh-part="label">
      <button data-xh-part="root"><span data-xh-part="indicator"></span></button>
      <span data-xh-part="text">info</span>
    </label>
  </xh-checkbox>
</div>
```

### 尺寸

适配不同的界面密度

```vue
<script setup lang="ts">
import { XhCheckbox } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhCheckbox size="sm" default-checked>小</XhCheckbox>
    <XhCheckbox default-checked>中</XhCheckbox>
    <XhCheckbox size="lg" default-checked>大</XhCheckbox>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 16px">
  <xh-checkbox size="sm" default-checked>
    <label data-xh-part="label">
      <button data-xh-part="root"><span data-xh-part="indicator"></span></button>
      <span data-xh-part="text">小</span>
    </label>
  </xh-checkbox>
  <xh-checkbox default-checked>
    <label data-xh-part="label">
      <button data-xh-part="root"><span data-xh-part="indicator"></span></button>
      <span data-xh-part="text">中</span>
    </label>
  </xh-checkbox>
  <xh-checkbox size="lg" default-checked>
    <label data-xh-part="label">
      <button data-xh-part="root"><span data-xh-part="indicator"></span></button>
      <span data-xh-part="text">大</span>
    </label>
  </xh-checkbox>
</div>
```

### 禁用与只读

区分不可用与不可修改状态

```vue
<script setup lang="ts">
import { XhCheckbox } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 12px">
    <XhCheckbox disabled>禁用</XhCheckbox>
    <XhCheckbox default-checked disabled>已选中且禁用</XhCheckbox>
    <XhCheckbox default-checked read-only>只读</XhCheckbox>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px">
  <xh-checkbox disabled>
    <label data-xh-part="label"><button data-xh-part="root"><span data-xh-part="indicator"></span></button><span data-xh-part="text">禁用</span></label>
  </xh-checkbox>
  <xh-checkbox default-checked disabled>
    <label data-xh-part="label"><button data-xh-part="root"><span data-xh-part="indicator"></span></button><span data-xh-part="text">已选中且禁用</span></label>
  </xh-checkbox>
  <xh-checkbox default-checked read-only>
    <label data-xh-part="label"><button data-xh-part="root"><span data-xh-part="indicator"></span></button><span data-xh-part="text">只读</span></label>
  </xh-checkbox>
</div>
```

### 校验状态

标记必须处理的选项

```vue
<script setup lang="ts">
import { XhCheckbox } from "@xihan-ui/vue";
</script>

<template>
  <XhCheckbox invalid required>我同意服务条款</XhCheckbox>
</template>
```

```html
<xh-checkbox invalid required>
  <label data-xh-part="label">
    <button data-xh-part="root"><span data-xh-part="indicator"></span></button>
    <span data-xh-part="text">我同意服务条款</span>
  </label>
</xh-checkbox>
```

## 设计指引

### 何时使用

- 表单中的同意、订阅或启用选项。
- 需要表达部分选中的汇总状态。

### 何时不用

- 立即生效的设置使用[开关](./switch)。
- 互斥选择使用[单选组](./radio-group)。
- 管理一组值时使用[复选框组](./checkbox-group)。

### 特性

- 支持选中、未选中与 `indeterminate` 状态。
- 方框是字段家族的控制盒：canvas 底、描边与无影，勾中后以语气色填充，按下缩放并换底。
- `readOnly` 仍可聚焦并参与提交，`disabled` 不参与提交。
- 标签、三档尺寸、校验状态和自定义指示器均使用同一状态动画。
- `name` 与 `value` 通过隐藏字段参与原生表单。

### 组合

- 将文字直接放入默认插槽，整行即可点击。
- 成组选择使用[复选框组](./checkbox-group)。

### 最佳实践

- 始终提供可见标签或 `aria-label`。
- 半选只用于表示下级选项的汇总状态。

### 反模式

- 不要用复选框表达互斥选项。
- 不要将半选状态作为第三个业务值。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-checkbox>` |
| Vue 组件 | `XhCheckbox` |
| 组合式函数 | `useCheckbox` |
| 状态机 | `checkboxMachine` |
| 皮肤 | `@xihan-ui/styles/checkbox.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `checked` | `CheckboxCheckedState` |  |  |
| `defaultChecked` | `CheckboxCheckedState` |  |  |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  | 只读：不可勾选，但仍可聚焦、仍参与提交，对比度不降低。 |
| `invalid` | `boolean` |  | 校验失败：只改变呈现，不阻止交互。 |
| `required` | `boolean` |  | 必填：随表单校验一起使用，只发无障碍属性，不自行拦截提交。 |
| `name` | `string` |  | 表单字段名；提供后 hidden-input 才带 name 并参与提交。 |
| `value` | `string` |  | 提交的值，默认 'on'，与原生复选框一致。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定选中态使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定方框边长与勾选符号的字号档位。 |
| `onCheckedChange` | `(details: CheckboxCheckedChangeDetails) => void` |  | checked 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `checked-change` | `CheckboxCheckedChangeDetails` | checked 状态变化；detail 为 `{ checked: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCheckbox` | `default` | — | 方框旁的文字；未写时只有一个方框。 |
| `XhCheckbox` | `indicator` | — | 方框中的图形；未写时由皮肤绘制勾选标记。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `indicator` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `label` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `text` | 'indeterminate' \| 'checked' \| 'unchecked' |

以下名称仅用于内部状态机。

**状态**：`off` · `on` · `indeterminate`

**事件**：`TOGGLE` · `CHECK` · `UNCHECK` · `CONTROLLED.ON` · `CONTROLLED.OFF` · `CONTROLLED.INDETERMINATE` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**判据**：`isCheckedControlled` · `defaultsToChecked` · `defaultsToIndeterminate` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `checked` | `CheckboxCheckedState` |  |
| `setChecked` | `(next: boolean) => void` | 半选只能由 checked prop 给出，这里只接受全选 / 全不选。 |
| `getRootProps` | `() => T['button']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getHiddenInputProps` | `() => T['input']` | 表单影子：勾选后才提交，半选按未勾选处理。提供 name 后才带 name。 |
| `getLabelProps` | `() => T['label']` | 包裹方框与文字的 &lt;label&gt;：点击文字即切换，方框的可及名来自文字。只在带文字时渲染。 |
| `getTextProps` | `() => T['element']` | 方框旁的文字。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in root, not disabled | 切换 checked 状态 |
| `Space` / `Enter` | held in root, not disabled, not readOnly | 按住期间投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，按住途中转入禁用或只读也撤下。与勾选态互相独立 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-checked` | 'mixed' \| 'true' \| 'false' |
| `root` | `aria-invalid` | 'true' \| 'false' |
| `root` | `aria-readonly` | 'true' \| 'false' |
| `root` | `aria-required` | 'true' \| 'false' |
| `root` | `role` | 'checkbox' |
| `indicator` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/checkbox.css` 使用 `[data-scope="checkbox"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-pressed` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-required` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `root` | `data-tone` | props.tone |
| `root` | `data-xh-action-control` | '' |
| `root` | `data-xh-action-display` | 'always' |
| `root` | `data-xh-action-profile` | 'icon' |
| `root` | `data-xh-action-size` | props.size |
| `root` | `data-xh-action-variant` | 'outline' |
| `indicator` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `label` | `data-invalid` | ''（条件成立时才出现） |
| `label` | `data-readonly` | ''（条件成立时才出现） |
| `label` | `data-size` | props.size |
| `label` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `text` | `data-disabled` | ''（条件成立时才出现） |
| `text` | `data-invalid` | ''（条件成立时才出现） |
| `text` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-checkbox-bg` | `root` | `background-color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`readonly` | `--xh-bg-canvas` | checkbox 的 root 部件 background-color 覆盖槽。 |
| `--xh-checkbox-bg-checked` | `root` | `background-color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`readonly`<br>`state=checked`<br>`state=indeterminate` | `--xh-_checkbox-accent` | checkbox 的 root 部件 background-color 覆盖槽。 |
| `--xh-checkbox-bg-checked-pressed` | `root` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=checked`<br>`state=indeterminate` | `--xh-_tone-active` | checkbox 的 root 部件 background-color 覆盖槽。 |
| `--xh-checkbox-bg-disabled` | `root` | `background-color` | `disabled` | `--xh-bg-subtle` | checkbox 的 root 部件 background-color 覆盖槽。 |
| `--xh-checkbox-bg-pressed` | `root` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` | checkbox 的 root 部件 background-color 覆盖槽。 |
| `--xh-checkbox-border` | `label`<br>`root` | `border`<br>`border-color` | `@media (hover: hover)`<br>`contrast=more`<br>`default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly`<br>`state=unchecked`<br>`where([data-contrast='more'])` | `--xh-border-control`<br>`--xh-border-strong` | checkbox 的 label、root 部件 border、border-color 覆盖槽。 |
| `--xh-checkbox-border-checked` | `label`<br>`root` | `border`<br>`border-color` | `@media (hover: hover)`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly`<br>`state=checked`<br>`state=indeterminate` | `--xh-_checkbox-accent` | checkbox 的 label、root 部件 border、border-color 覆盖槽。 |
| `--xh-checkbox-border-disabled` | `root` | `border-color` | `disabled` | `--xh-border-default` | checkbox 的 root 部件 border-color 覆盖槽。 |
| `--xh-checkbox-border-hover` | `label`<br>`root` | `border-color` | `@media (hover: hover)`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly` | `--xh-border-control-hover` | checkbox 的 label、root 部件 border-color 覆盖槽。 |
| `--xh-checkbox-border-invalid` | `label`<br>`root` | `border`<br>`border-color` | `@media (hover: hover)`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`invalid`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly`<br>`state=checked`<br>`state=indeterminate` | `--xh-border-invalid` | checkbox 的 label、root 部件 border、border-color 覆盖槽。 |
| `--xh-checkbox-fg` | `root` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_checkbox-on-accent` | checkbox 的 root 部件 color 覆盖槽。 |
| `--xh-checkbox-fg-disabled` | `indicator`<br>`root` | `background-color`<br>`color` | `disabled`<br>`state=indeterminate` | `--xh-fg-disabled` | checkbox 的 indicator、root 部件 background-color、color 覆盖槽。 |
| `--xh-checkbox-fg-invalid` | `label`<br>`text` | `color` | `invalid` | `--xh-fg-danger` | checkbox 的 label、text 部件 color 覆盖槽。 |
| `--xh-checkbox-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-_checkbox-glyph` | checkbox 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-checkbox-indicator-fg` | `indicator` | `background-color` | `state=indeterminate` | `--xh-_checkbox-on-accent` | checkbox 的 indicator 部件 background-color 覆盖槽。 |
| `--xh-checkbox-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | checkbox 的 label 部件 color 覆盖槽。 |
| `--xh-checkbox-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | checkbox 的 label 部件 color 覆盖槽。 |
| `--xh-checkbox-label-font-size` | `label` | `font-size` | `default` | `--xh-_checkbox-label-font-size` | checkbox 的 label 部件 font-size 覆盖槽。 |
| `--xh-checkbox-label-gap` | `label` | `gap` | `default` | `--xh-_checkbox-label-gap` | checkbox 的 label 部件 gap 覆盖槽。 |
| `--xh-checkbox-label-leading` | `label` | `line-height` | `default` | `--xh-leading-normal` | checkbox 的 label 部件 line-height 覆盖槽。 |
| `--xh-checkbox-radius` | `root` | `border-radius` | `default` | `--xh-shape-inset` | checkbox 的 root 部件 border-radius 覆盖槽。 |
| `--xh-checkbox-shadow` | `root` | `box-shadow` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `none` | checkbox 的 root 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`opacity` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`hover: hover` · `pointer: coarse`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

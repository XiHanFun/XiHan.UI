来源：https://ui.docs.xihanfun.com/components/field

# Field `表单字段`

把标签、控件、说明与错误文本绑成一组，并把 `id` 与 ARIA 关联接好。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/field" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/field.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/field" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/field" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/field.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

控件由自己写，Field 只把属性并上去：标题的 for、控件的 id 与描述链（aria-describedby）自动对齐

```vue
<script setup lang="ts">
import { XhFieldControl, XhFieldDescription, XhFieldLabel, XhFieldRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhFieldRoot style="inline-size: 280px;">
    <XhFieldLabel>邮箱</XhFieldLabel>
    <XhFieldControl>
      <input type="email" placeholder="you@example.com">
    </XhFieldControl>
    <XhFieldDescription>用于接收账单与安全提醒</XhFieldDescription>
  </XhFieldRoot>
</template>
```

```html
<xh-field>
  <div data-xh-part="root" style="inline-size: 280px">
    <label data-xh-part="label">邮箱</label>
    <input data-xh-part="control" type="email" placeholder="you@example.com" />
    <p data-xh-part="description">用于接收账单与安全提醒</p>
  </div>
</xh-field>
```

## 示例

### 无效与必填

invalid 一翻，错误文案接入描述链并显出，控件上同时落 aria-invalid；required 只落 aria-required，校验仍归宿主

```vue
<script setup lang="ts">
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const email = ref("zhaifanhua");
// 无效与否由宿主判定，Field 只负责把这个结论铺成属性
const invalid = computed(() => email.value !== "" && !email.value.includes("@"));
</script>

<template>
  <XhFieldRoot :invalid="invalid" required style="inline-size: 280px;">
    <XhFieldLabel>邮箱</XhFieldLabel>
    <XhFieldControl>
      <input v-model="email" type="email" placeholder="you@example.com">
    </XhFieldControl>
    <XhFieldDescription>用于接收账单与安全提醒</XhFieldDescription>
    <!-- 错误文案带 role=alert，翻转的那一刻读屏立即播报 -->
    <XhFieldErrorText>邮箱格式不正确</XhFieldErrorText>
  </XhFieldRoot>
</template>
```

```html
<xh-field id="field-invalid" required>
  <div data-xh-part="root" style="inline-size: 280px">
    <label data-xh-part="label">邮箱</label>
    <input
      data-xh-part="control"
      type="email"
      value="zhaifanhua"
      placeholder="you@example.com"
    />
    <p data-xh-part="description">用于接收账单与安全提醒</p>
    <!-- 错误文案带 role=alert，翻转的那一刻读屏立即播报 -->
    <p data-xh-part="error-text">邮箱格式不正确</p>
  </div>
</xh-field>

<script type="module">
  // 无效与否由宿主判定，Field 只负责把这个结论铺成属性
  const field = document.getElementById("field-invalid");
  const control = field.querySelector('[data-xh-part="control"]');
  const sync = () => {
    field.invalid = control.value !== "" && !control.value.includes("@");
  };
  control.addEventListener("input", sync);
  sync();
</script>
```

### 禁用

Field 的 disabled 只把 data-disabled 铺到各部件上；真正改不动还得在自己的控件上落原生 disabled

```vue
<script setup lang="ts">
import { XhFieldControl, XhFieldDescription, XhFieldLabel, XhFieldRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhFieldRoot disabled style="inline-size: 280px;">
    <XhFieldLabel>登录账号</XhFieldLabel>
    <XhFieldControl>
      <input value="zhaifanhua" disabled>
    </XhFieldControl>
    <XhFieldDescription>账号创建后不可更改</XhFieldDescription>
  </XhFieldRoot>
</template>
```

```html
<xh-field disabled>
  <div data-xh-part="root" style="inline-size: 280px">
    <label data-xh-part="label">登录账号</label>
    <input data-xh-part="control" value="zhaifanhua" disabled />
    <p data-xh-part="description">账号创建后不可更改</p>
  </div>
</xh-field>
```

### 标签左置

各部件都是独立节点，把根节点改成两列网格就能把标题挪到控件左边，说明与错误文案跟着对齐到控件那一列

```vue
<script setup lang="ts">
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <!-- 第一列放标题，第二列放控件、说明与错误文案 -->
  <XhFieldRoot
    invalid
    style="display: grid; grid-template-columns: 72px 1fr; align-items: center; column-gap: 12px; row-gap: 4px; inline-size: 360px;"
  >
    <XhFieldLabel>端口</XhFieldLabel>
    <XhFieldControl>
      <input value="abc">
    </XhFieldControl>
    <XhFieldDescription style="grid-column-start: 2;">留空表示使用默认端口</XhFieldDescription>
    <XhFieldErrorText style="grid-column-start: 2;">端口只能是数字</XhFieldErrorText>
  </XhFieldRoot>
</template>
```

```html
<xh-field invalid>
  <!-- 第一列放标题，第二列放控件、说明与错误文案 -->
  <div
    data-xh-part="root"
    style="
      display: grid;
      grid-template-columns: 72px 1fr;
      align-items: center;
      column-gap: 12px;
      row-gap: 4px;
      inline-size: 360px;
    "
  >
    <label data-xh-part="label">端口</label>
    <input data-xh-part="control" value="abc" />
    <p data-xh-part="description" style="grid-column-start: 2">
      留空表示使用默认端口
    </p>
    <p data-xh-part="error-text" style="grid-column-start: 2">端口只能是数字</p>
  </div>
</xh-field>
```

### 字段横排

一行里摆多个字段：每个字段自成一块，谁跟谁排一行是外层容器的事

```vue
<script setup lang="ts">
import { XhFieldControl, XhFieldLabel, XhFieldRoot } from "@xihan-ui/vue";
</script>

<template>
  <!-- 外层给一行的排布，宽度逐个字段自己定 -->
  <div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px;">
    <XhFieldRoot style="inline-size: 160px;">
      <XhFieldLabel>姓名</XhFieldLabel>
      <XhFieldControl>
        <input placeholder="请输入姓名">
      </XhFieldControl>
    </XhFieldRoot>

    <XhFieldRoot style="inline-size: 96px;">
      <XhFieldLabel>年龄</XhFieldLabel>
      <XhFieldControl>
        <input type="number" placeholder="18">
      </XhFieldControl>
    </XhFieldRoot>

    <XhFieldRoot style="inline-size: 180px;">
      <XhFieldLabel>电话</XhFieldLabel>
      <XhFieldControl>
        <input type="tel" placeholder="请输入电话">
      </XhFieldControl>
    </XhFieldRoot>
  </div>
</template>
```

```html
<!-- 外层给一行的排布，宽度逐个字段自己定 -->
<div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px">
  <xh-field>
    <div data-xh-part="root" style="inline-size: 160px">
      <label data-xh-part="label">姓名</label>
      <input data-xh-part="control" placeholder="请输入姓名" />
    </div>
  </xh-field>

  <xh-field>
    <div data-xh-part="root" style="inline-size: 96px">
      <label data-xh-part="label">年龄</label>
      <input data-xh-part="control" type="number" placeholder="18" />
    </div>
  </xh-field>

  <xh-field>
    <div data-xh-part="root" style="inline-size: 180px">
      <label data-xh-part="label">电话</label>
      <input data-xh-part="control" type="tel" placeholder="请输入电话" />
    </div>
  </xh-field>
</div>
```

### 提示、警告与错误

三档语气各归各的部件：提示与警告都写在描述里，控件的 aria-invalid 保持 false；只有真出错才翻 invalid、错误文案才接进描述链

```vue
<script setup lang="ts">
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
} from "@xihan-ui/vue";

// 警告档只换配色：边框取语气层的强调色，描述取语气层的文字色
const warningStyle = {
  "--xh-field-control-border": "var(--xh-_tone-soft)",
  "--xh-field-description-fg": "var(--xh-_tone-fg)",
};
</script>

<template>
  <div style="display: grid; gap: 16px; inline-size: 280px;">
    <XhFieldRoot>
      <XhFieldLabel>项目名</XhFieldLabel>
      <XhFieldControl>
        <input value="xihan-ui">
      </XhFieldControl>
      <XhFieldDescription>创建之后还能改</XhFieldDescription>
    </XhFieldRoot>

    <!-- 警告：值可疑但不算错，invalid 不翻，读屏经描述链念出这一句 -->
    <XhFieldRoot data-tone="warning" :style="warningStyle">
      <XhFieldLabel>实例规格</XhFieldLabel>
      <XhFieldControl>
        <input value="1 核 1G">
      </XhFieldControl>
      <XhFieldDescription>这个规格跑构建会偏紧，仍然可以保存</XhFieldDescription>
    </XhFieldRoot>

    <XhFieldRoot invalid>
      <XhFieldLabel>端口</XhFieldLabel>
      <XhFieldControl>
        <input value="70000">
      </XhFieldControl>
      <XhFieldDescription>可用范围 1 到 65535</XhFieldDescription>
      <XhFieldErrorText>端口超出可用范围</XhFieldErrorText>
    </XhFieldRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px; inline-size: 280px">
  <xh-field>
    <div data-xh-part="root">
      <label data-xh-part="label">项目名</label>
      <input data-xh-part="control" value="xihan-ui" />
      <p data-xh-part="description">创建之后还能改</p>
    </div>
  </xh-field>

  <!-- 警告：值可疑但不算错，invalid 不翻，读屏经描述链念出这一句 -->
  <!-- 警告档只换配色：边框取语气层的强调色，描述取语气层的文字色 -->
  <xh-field>
    <div
      data-xh-part="root"
      data-tone="warning"
      style="
        --xh-field-control-border: var(--xh-_tone-soft);
        --xh-field-description-fg: var(--xh-_tone-fg);
      "
    >
      <label data-xh-part="label">实例规格</label>
      <input data-xh-part="control" value="1 核 1G" />
      <p data-xh-part="description">这个规格跑构建会偏紧，仍然可以保存</p>
    </div>
  </xh-field>

  <xh-field invalid>
    <div data-xh-part="root">
      <label data-xh-part="label">端口</label>
      <input data-xh-part="control" value="70000" />
      <p data-xh-part="description">可用范围 1 到 65535</p>
      <p data-xh-part="error-text">端口超出可用范围</p>
    </div>
  </xh-field>
</div>
```

### 控件在薄封装里

封装的根不是可聚焦元素时，关掉 asChild、让封装内部用 useFieldControl 自取

```vue
<script setup lang="ts">
import { useFieldControl, XhFieldControl, XhFieldDescription, XhFieldLabel, XhFieldRoot } from "@xihan-ui/vue";
import { defineComponent, h } from "vue";

// 典型的薄封装：根是个 div，真正可聚焦的 input 在里面
const MyInput = defineComponent({
  name: "MyInput",
  setup() {
    const controlProps = useFieldControl();
    return () =>
      h("div", { style: "display: flex; gap: 6px; align-items: center;" }, [
        h("span", "@"),
        h("input", { ...controlProps.value, placeholder: "you@example.com", style: "flex: 1;" }),
      ]);
  },
});
</script>

<template>
  <XhFieldRoot style="inline-size: 280px;">
    <XhFieldLabel>邮箱</XhFieldLabel>
    <!-- 不关 asChild 的话，id 与 aria-* 会落在封装的 div 上，标题的 for 就指不到 input -->
    <XhFieldControl :as-child="false">
      <MyInput />
    </XhFieldControl>
    <XhFieldDescription>点标题能聚焦到里面的输入框</XhFieldDescription>
  </XhFieldRoot>
</template>
```

```html
<xh-field>
  <div data-xh-part="root" style="inline-size: 280px">
    <label data-xh-part="label">邮箱</label>
    <!-- 典型的薄封装：外面这层是个 div，真正可聚焦的 input 在里面 -->
    <div style="display: flex; gap: 6px; align-items: center">
      <span>@</span>
      <!-- 角色标在 input 上而不是这层 div 上：id 与 aria-* 得落在真控件身上，
           标题的 for 才指得到它 -->
      <input data-xh-part="control" type="email" placeholder="you@example.com" style="flex: 1" />
    </div>
    <p data-xh-part="description">点标题能聚焦到里面的输入框</p>
  </div>
</xh-field>
```

## 设计指引

### 何时使用

- 任何一个需要标签的表单控件——这是所有录入组件的外壳。
- 需要说明文字或错误提示与控件正确关联时。

### 何时不用

- 控件在工具栏或表格里、没有可见标签：给控件本身写 `aria-label`。
- 需要整表的值管理与校验：外面再套[表单](./form)，字段只管一格。

### 特性

- 标签的 `for`、说明与错误文本的 `aria-describedby`、无效态的 `aria-invalid` 全部自动接上，作者不写 `id`。
- `disabled` / `readOnly` / `invalid` / `required` 沿字段流给里面的控件。控件实例没写才继承；
  显式 `false` 顶掉最近的 Field/Form 状态。TextField 收到后会把行为与 ARIA 写到真正的 input，
  不只停在包装根。
- 有错误文本时说明文字不会被顶掉，两者可以同时在。
- 默认把接线属性合到控件槽里唯一的子节点上，这条只适用于「子节点的根就是可聚焦控件」。控件藏在薄封装里时关掉 asChild，由封装内部自取——标签的 for 只对可标注元素生效，指到封装的根上会静默失效。
- `FieldControl` 的默认 `asChild` 必须提供唯一可挂载子节点，允许包在 Fragment 中；零节点、多个节点或并列非空文本明确报错，不再静默丢失标签和 ARIA 接线。需要手工组织多个节点时显式设置 `asChild=false`，并通过插槽载荷或 `useFieldControl` 绑定真控件。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-field>` |
| Vue 组件 | `XhFieldControl` `XhFieldDescription` `XhFieldErrorText` `XhFieldLabel` `XhFieldRoot` |
| 组合式函数 | `useField` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/field.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="field"`：**`root`** · `label` · **`control`** · `description` · `error-text`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `controlId` | `string` |  | 控件 id；作者接管时以它为准。 |
| `disabled` | `boolean` |  |  |
| `invalid` | `boolean` |  | 校验失败态：控件上 aria-invalid=true，错误文案接入描述链并显出。 |
| `readOnly` | `boolean` |  | 只读：控件上 aria-readonly=true。与 disabled 不同，只读仍可聚焦、仍参与提交。 |
| `required` | `boolean` |  | 必填：控件上 aria-required=true。 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFieldControl` | `default` | `FieldControlSlotProps` |  |

## connect API

`useField` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `controlId` | `string` | 控件实际使用的 id，label 的 for 与它一致。 |
| `labelId` | `string` | 标签节点的 id。复合控件把它并进自己的名字链，字段的标签才念得到。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` | 控件本身由作者渲染，这里只产出要合并上去的属性。 |
| `getDescriptionProps` | `() => T['element']` |  |
| `getErrorTextProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `control` | `aria-describedby` | `description` 部件的 id `error-text` 部件的 id \| `description` 部件的 id |
| `control` | `aria-invalid` | 'true' \| 'false' |
| `control` | `aria-labelledby` | `label` 部件的 id |
| `control` | `aria-readonly` | 'true' \| 'false' |
| `control` | `aria-required` | 'true' \| 'false' |
| `error-text` | `aria-atomic` | 'true' |
| `error-text` | `aria-live` | 'polite' |
| `error-text` | `role` | 'status' |

## 样式

默认皮肤 `@xihan-ui/styles/field.css` 按部件选择：`[data-scope="field"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-required` | ''（条件成立时才出现） |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `label` | `data-readonly` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `description` | `data-disabled` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-field-control-bg` | `control` | `background` | `default` | `--xh-bg-canvas` | field 的 control 部件 background 覆盖槽。 |
| `--xh-field-control-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-subtle` | field 的 control 部件 background 覆盖槽。 |
| `--xh-field-control-border` | `control` | `border` | `default` | `--xh-border-control` | field 的 control 部件 border 覆盖槽。 |
| `--xh-field-control-border-focus` | `control` | `border-color` | `focus-visible` | `--xh-_tone` | field 的 control 部件 border-color 覆盖槽。 |
| `--xh-field-control-border-invalid` | `control` | `border-color` | `invalid` | `--xh-border-invalid` | field 的 control 部件 border-color 覆盖槽。 |
| `--xh-field-control-fg` | `control` | `color` | `default` | `--xh-fg-default` | field 的 control 部件 color 覆盖槽。 |
| `--xh-field-control-font-size` | `control` | `font-size` | `default` | `--xh-text-body-size` | field 的 control 部件 font-size 覆盖槽。 |
| `--xh-field-control-h` | `control`<br>`label`<br>`root` | `block-size`<br>`padding-block` | `default`<br>`layout=horizontal` | `--xh-control-h-md` | field 的 control、label、root 部件 block-size、padding-block 覆盖槽。 |
| `--xh-field-control-px` | `control` | `padding-inline` | `default` | `--xh-control-px-md` | field 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-field-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` | field 的 control 部件 border-radius 覆盖槽。 |
| `--xh-field-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | field 的 description 部件 color 覆盖槽。 |
| `--xh-field-description-fg-disabled` | `description` | `color` | `disabled` | `--xh-fg-subtle` | field 的 description 部件 color 覆盖槽。 |
| `--xh-field-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | field 的 description 部件 font-size 覆盖槽。 |
| `--xh-field-error-fg` | `error-text` | `color` | `default` | `--xh-fg-danger` | field 的 error-text 部件 color 覆盖槽。 |
| `--xh-field-error-font-size` | `description`<br>`error-text`<br>`root` | `block-size`<br>`font-size` | `default`<br>`has(> [data-scope='field'][data-part='error-text'][hidden])`<br>`not(:has(> [data-scope='field'][data-part='description']:not([hidden])` | `--xh-text-secondary-size` | field 的 description、error-text、root 部件 block-size、font-size 覆盖槽。 |
| `--xh-field-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` | field 的 label、root 部件 gap、margin-block-end 覆盖槽。 |
| `--xh-field-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | field 的 label 部件 color 覆盖槽。 |
| `--xh-field-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | field 的 label 部件 color 覆盖槽。 |
| `--xh-field-label-font-size` | `label`<br>`root` | `font-size`<br>`padding-block` | `default`<br>`layout=horizontal` | `--xh-text-label-size` | field 的 label、root 部件 font-size、padding-block 覆盖槽。 |
| `--xh-field-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | field 的 label 部件 font-weight 覆盖槽。 |
| `--xh-field-label-gap` | `root` | `column-gap` | `layout=horizontal` | `--xh-space-3` | field 的 root 部件 column-gap 覆盖槽。 |
| `--xh-field-label-gap-block` | `label` | `margin-block-end` | `default` | `--xh-field-gap` | field 的 label 部件 margin-block-end 覆盖槽。 |
| `--xh-field-label-leading` | `label`<br>`root` | `line-height`<br>`padding-block` | `layout=horizontal` | `--xh-leading-normal` | field 的 label、root 部件 line-height、padding-block 覆盖槽。 |
| `--xh-field-label-star` | `label`<br>`root` | `color` | `required` | `--xh-fg-danger` | field 的 label、root 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `border-color` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 里面放任何一个录入组件；外面用[栅格](./grid)排成两列。

## 最佳实践

- 标签写完整的名词短语，别写占位符当标签——占位符一输入就消失。
- 错误文本说清楚怎么改，不只说"格式不对"。

## 反模式

- 用占位符代替标签。
- 自己手写 `aria-describedby`，与组件生成的那份互相覆盖。

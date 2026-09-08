来源：https://ui.docs.xihanfun.com/components/field

# 表单字段 `field`

把标签、控件、说明与错误文本绑成一组，并把 `id` 与 ARIA 关联接好。

## 何时使用

- 任何一个需要标签的表单控件——这是所有录入组件的外壳。
- 需要说明文字或错误提示与控件正确关联时。

## 何时不用

- 控件在工具栏或表格里、没有可见标签：给控件本身写 `aria-label`。
- 需要整表的值管理与校验：外面再套[表单](./form)，字段只管一格。

## 特性

- 标签的 `for`、说明与错误文本的 `aria-describedby`、无效态的 `aria-invalid` 全部自动接上，作者不写 `id`。
- `disabled` / `readOnly` / `invalid` / `required` 沿字段流给里面的控件。
- 有错误文本时说明文字不会被顶掉，两者可以同时在。
- 默认把接线属性合到控件槽里唯一的子节点上，这条只适用于「子节点的根就是可聚焦控件」。控件藏在薄封装里时关掉 asChild，由封装内部自取——标签的 for 只对可标注元素生效，指到封装的根上会静默失效。

## 示例

### 基础用法

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

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-field-control-bg` · `--xh-field-control-bg-disabled` · `--xh-field-control-border` · `--xh-field-control-border-focus` · `--xh-field-control-border-invalid` · `--xh-field-control-fg` · `--xh-field-control-font-size` · `--xh-field-control-h` · `--xh-field-control-px` · `--xh-field-control-radius` · `--xh-field-description-fg` · `--xh-field-description-fg-disabled` · `--xh-field-description-font-size` · `--xh-field-error-fg` · `--xh-field-error-font-size` · `--xh-field-gap` · `--xh-field-label-fg` · `--xh-field-label-fg-disabled` · `--xh-field-label-font-size` · `--xh-field-label-font-weight` · `--xh-field-label-gap` · `--xh-field-label-gap-block` · `--xh-field-label-leading` · `--xh-field-label-star`

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

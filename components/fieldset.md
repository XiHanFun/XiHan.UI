来源：https://ui.docs.xihanfun.com/components/fieldset

# 字段集 `fieldset`

把若干相关字段收成一组，组标题由 `legend` 给，禁用与无效沿这一组下发。

根节点是原生 `<fieldset>`：整组禁用只写一个属性，浏览器就把组内所有表单控件一并停掉——这是本组件存在的理由，换成 `<div>` 只剩一层灰样式。

## 何时使用

- 一份表单里有几段主题相同的字段（收货信息、发票抬头、通知偏好），需要一个组标题把它们收起来。
- 需要一次禁用一整段字段，而不是逐个控件写 `disabled`。
- 一组单选或复选选项需要共用一个问句作为组名。

## 何时不用

- 只有一个控件加一个标签：用[表单字段](./field)，字段管一格，字段集管一组格。
- 需要整表的值管理与校验：外面套[表单](./form)，字段集只管把一段字段圈起来。
- 只想在视觉上分段、没有共同的组名与共同的禁用语义：用[分割线](./separator)或[卡片](./card)。

## 特性

- `disabled` 落成原生 `fieldset[disabled]`，组内控件不可聚焦、不可编辑、不参与提交，无需逐个控件接线。
- 说明文字与错误文案自动派生 `id` 并接进根节点的 `aria-describedby`，作者不写 `id`。
- 错误文案带 `role="status"` + `aria-live="polite"`，节点常挂、靠 `hidden` 显隐，`invalid` 翻转时读屏排队播报，不打断当前朗读。整表提交失败时打断式播报只由 Form 的错误摘要发出。
- `invalid` 落成 `data-invalid`，皮肤据此把组标题转成警示色，同时把错误文案接进描述链并显出。
- `required` 落成 `data-required`，皮肤据此给组标题加星号。
- `field-group` 把并排的几个字段圈成一段（够宽自动分栏），`actions` 承载组末尾那一行按钮。
- `disabled` 只连坐原生表单控件：组里 `div` 型控件（滑块、评分这类）要各自接 `disabled`。

## 示例

### 基础用法

一组字段收进原生 fieldset：legend 是这一组的名字，说明文案自动派生 id 并接进 aria-describedby

```vue
<script setup lang="ts">
import { XhFieldsetDescription, XhFieldsetLegend, XhFieldsetRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhFieldsetRoot style="inline-size: 320px;">
    <XhFieldsetLegend>通知方式</XhFieldsetLegend>
    <label style="display: flex; gap: 8px; align-items: center;">
      <input type="checkbox" checked>
      站内消息
    </label>
    <label style="display: flex; gap: 8px; align-items: center;">
      <input type="checkbox">
      邮件
    </label>
    <label style="display: flex; gap: 8px; align-items: center;">
      <input type="checkbox">
      短信
    </label>
    <XhFieldsetDescription>至少保留一种，重要变更会照此通知你</XhFieldsetDescription>
  </XhFieldsetRoot>
</template>
```

```html
<xh-fieldset>
  <fieldset data-xh-part="root" style="inline-size: 320px">
    <legend data-xh-part="legend">通知方式</legend>
    <label style="display: flex; gap: 8px; align-items: center">
      <input type="checkbox" checked />
      站内消息
    </label>
    <label style="display: flex; gap: 8px; align-items: center">
      <input type="checkbox" />
      邮件
    </label>
    <label style="display: flex; gap: 8px; align-items: center">
      <input type="checkbox" />
      短信
    </label>
    <p data-xh-part="description">至少保留一种，重要变更会照此通知你</p>
  </fieldset>
</xh-fieldset>
```

### 整组禁用

disabled 落成原生 fieldset[disabled]，组内每个控件一并停掉，不必逐个写 disabled

```vue
<script setup lang="ts">
import { XhFieldsetDescription, XhFieldsetLegend, XhFieldsetRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const locked = ref(true);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 320px;">
    <label style="display: flex; gap: 8px; align-items: center;">
      <input v-model="locked" type="checkbox">
      锁定这段设置
    </label>
    <XhFieldsetRoot :disabled="locked">
      <XhFieldsetLegend>发票抬头</XhFieldsetLegend>
      <input type="text" placeholder="公司名称" style="inline-size: 100%;">
      <input type="text" placeholder="纳税人识别号" style="inline-size: 100%;">
      <XhFieldsetDescription>锁定期间这两个输入框既不能聚焦，也不参与提交</XhFieldsetDescription>
    </XhFieldsetRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 320px">
  <label style="display: flex; gap: 8px; align-items: center">
    <input id="fieldset-lock" type="checkbox" checked />
    锁定这段设置
  </label>
  <xh-fieldset id="fieldset-billing" disabled>
    <fieldset data-xh-part="root">
      <legend data-xh-part="legend">发票抬头</legend>
      <input type="text" placeholder="公司名称" style="inline-size: 100%" />
      <input type="text" placeholder="纳税人识别号" style="inline-size: 100%" />
      <p data-xh-part="description">锁定期间这两个输入框既不能聚焦，也不参与提交</p>
    </fieldset>
  </xh-fieldset>
</div>

<script type="module">
  const lock = document.getElementById("fieldset-lock");
  const billing = document.getElementById("fieldset-billing");
  lock.addEventListener("change", () => {
    billing.disabled = lock.checked;
  });
</script>
```

### 无效态

invalid 一翻，错误文案接进描述链并显出；它带 role=alert，翻转那一刻读屏立即播报

```vue
<script setup lang="ts">
import {
  XhFieldsetDescription,
  XhFieldsetErrorText,
  XhFieldsetLegend,
  XhFieldsetRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const email = ref("");
const phone = ref("");
// 整组的校验结论由宿主判定，字段集只负责把它铺成属性
const invalid = computed(() => email.value === "" && phone.value === "");
</script>

<template>
  <XhFieldsetRoot :invalid="invalid" style="inline-size: 320px;">
    <XhFieldsetLegend>联系方式</XhFieldsetLegend>
    <input v-model="email" type="email" placeholder="邮箱" style="inline-size: 100%;">
    <input v-model="phone" type="tel" placeholder="手机号" style="inline-size: 100%;">
    <XhFieldsetDescription>两者填一个即可</XhFieldsetDescription>
    <XhFieldsetErrorText>请至少填写一种联系方式</XhFieldsetErrorText>
  </XhFieldsetRoot>
</template>
```

```html
<xh-fieldset id="fieldset-contact" invalid>
  <fieldset data-xh-part="root" style="inline-size: 320px">
    <legend data-xh-part="legend">联系方式</legend>
    <input type="email" placeholder="邮箱" style="inline-size: 100%" />
    <input type="tel" placeholder="手机号" style="inline-size: 100%" />
    <p data-xh-part="description">两者填一个即可</p>
    <p data-xh-part="error-text">请至少填写一种联系方式</p>
  </fieldset>
</xh-fieldset>

<script type="module">
  // 整组的校验结论由宿主判定，字段集只负责把它铺成属性
  const contact = document.getElementById("fieldset-contact");
  const inputs = [...contact.querySelectorAll("input")];
  const sync = () => {
    contact.invalid = inputs.every((el) => el.value === "");
  };
  for (const el of inputs) el.addEventListener("input", sync);
  sync();
</script>
```

### 必填标记

required 落成 data-required，皮肤据此给组标题加星号；星号只是视觉冗余，必填这件事要一并写进文案

```vue
<script setup lang="ts">
import { XhFieldsetDescription, XhFieldsetLegend, XhFieldsetRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhFieldsetRoot required style="inline-size: 320px;">
    <XhFieldsetLegend>配送时段</XhFieldsetLegend>
    <label style="display: flex; gap: 8px; align-items: center;">
      <input type="radio" name="fieldset-slot" value="am">
      上午（9:00–12:00）
    </label>
    <label style="display: flex; gap: 8px; align-items: center;">
      <input type="radio" name="fieldset-slot" value="pm">
      下午（13:00–18:00）
    </label>
    <XhFieldsetDescription>必选一项，下单后不可更改</XhFieldsetDescription>
  </XhFieldsetRoot>
</template>
```

```html
<xh-fieldset required>
  <fieldset data-xh-part="root" style="inline-size: 320px">
    <legend data-xh-part="legend">配送时段</legend>
    <label style="display: flex; gap: 8px; align-items: center">
      <input type="radio" name="fieldset-slot" value="am" />
      上午（9:00–12:00）
    </label>
    <label style="display: flex; gap: 8px; align-items: center">
      <input type="radio" name="fieldset-slot" value="pm" />
      下午（13:00–18:00）
    </label>
    <p data-xh-part="description">必选一项，下单后不可更改</p>
  </fieldset>
</xh-fieldset>
```

### 总开关放进 legend

按 HTML 规范，首个 legend 里的控件不受 fieldset[disabled] 连坐，总开关因此始终可点

```vue
<script setup lang="ts">
import { XhFieldsetDescription, XhFieldsetLegend, XhFieldsetRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const enabled = ref(false);
</script>

<template>
  <XhFieldsetRoot :disabled="!enabled" style="inline-size: 320px;">
    <XhFieldsetLegend>
      <label style="display: flex; gap: 8px; align-items: center;">
        <input v-model="enabled" type="checkbox">
        启用自动备份
      </label>
    </XhFieldsetLegend>
    <label style="display: flex; gap: 8px; align-items: center;">
      备份频率
      <select>
        <option>每天</option>
        <option>每周</option>
      </select>
    </label>
    <label style="display: flex; gap: 8px; align-items: center;">
      <input type="checkbox">
      失败时发通知
    </label>
    <XhFieldsetDescription>关掉总开关，下面两项跟着停用，唯独总开关自己还能点</XhFieldsetDescription>
  </XhFieldsetRoot>
</template>
```

```html
<xh-fieldset id="fieldset-backup" disabled>
  <fieldset data-xh-part="root" style="inline-size: 320px">
    <legend data-xh-part="legend">
      <label style="display: flex; gap: 8px; align-items: center">
        <input id="fieldset-backup-toggle" type="checkbox" />
        启用自动备份
      </label>
    </legend>
    <label style="display: flex; gap: 8px; align-items: center">
      备份频率
      <select>
        <option>每天</option>
        <option>每周</option>
      </select>
    </label>
    <label style="display: flex; gap: 8px; align-items: center">
      <input type="checkbox" />
      失败时发通知
    </label>
    <p data-xh-part="description">关掉总开关，下面两项跟着停用，唯独总开关自己还能点</p>
  </fieldset>
</xh-fieldset>

<script type="module">
  const backup = document.getElementById("fieldset-backup");
  const toggle = document.getElementById("fieldset-backup-toggle");
  toggle.addEventListener("change", () => {
    backup.disabled = !toggle.checked;
  });
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-fieldset>` |
| Vue 组件 | `XhFieldsetActions` `XhFieldsetDescription` `XhFieldsetErrorText` `XhFieldsetFieldGroup` `XhFieldsetLegend` `XhFieldsetRoot` |
| 组合式函数 | `useFieldset` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/fieldset.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="fieldset"`：**`root`** · **`legend`** · `description` · `field-group` · `actions` · `error-text`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `disabled` | `boolean` |  | 整组禁用。root 是原生 `&lt;fieldset&gt;`，这一条落成原生 disabled 属性， 浏览器会把组内每个表单控件一并停掉（首个 `&lt;legend&gt;` 里的控件按 HTML 规范除外）。 |
| `invalid` | `boolean` |  | 校验失败态：root 上落 data-invalid，错误文案接入描述链并显出。 |
| `required` | `boolean` |  | 必填标记：落成 data-required，供皮肤给组标题加星号，校验仍归宿主。 不产出 aria-required —— 该属性在 group 角色上不被支持，写了也不进无障碍树。 |
| `translations` | `Partial<FieldsetTranslations>` |  | 文案覆盖。本组件当前没有外露文案，位先留着，接全局配置的通道由适配器铺好。 |

## connect API

`useFieldset` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `disabled` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLegendProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getFieldGroupProps` | `() => T['element']` | 把并排的几个字段圈成一段；纯排版，不承担分组语义（组名与描述归 root）。 |
| `getActionsProps` | `() => T['element']` | 组末尾那一行按钮；纯排版。 |
| `getErrorTextProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/form-elements.html#the-fieldset-element)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-describedby` | `description` 部件的 id `error-text` 部件的 id \| `description` 部件的 id |
| `error-text` | `aria-atomic` | 'true' |
| `error-text` | `aria-live` | 'polite' |
| `error-text` | `role` | 'status' |

- 组名来自原生 `<legend>`，它必须是 `<fieldset>` 的首个子节点，否则浏览器不把它当组名。
- 组标题不再另发 `aria-labelledby`：多一份名字来源会与原生那份叠加，读屏把组名念两遍。
- 根节点不产出 `aria-invalid` / `aria-required`——这两个属性在 `group` 角色上不被支持，写了也不进无障碍树；无效与必填的读屏出口是错误文案与描述链。
- **只要 `invalid` 有可能为真，就必须渲染错误文案部件。** 它是这一态唯一的读屏出口：组标题转色只是视觉提示，无障碍树里一个字节都不会变。
- **必填要写进组标题的可见文字或说明文案**（"通知方式（必填）"、"以下三项至少填一项"）。皮肤的星号是 CSS 生成内容，用户自定义样式表关掉 `content` 或读屏不朗读生成内容时它就不存在了，只能当视觉冗余。
- 按 HTML 规范，首个 `<legend>` 里的控件不受 `fieldset[disabled]` 连坐。想让一个开关在整组停用时仍可操作（例如"启用本段"的总开关），就把它放进 `<legend>`。

## 样式

默认皮肤 `@xihan-ui/styles/fieldset.css` 按部件选择：`[data-scope="fieldset"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-required` | ''（条件成立时才出现） |
| `legend` | `data-disabled` | ''（条件成立时才出现） |
| `description` | `data-disabled` | ''（条件成立时才出现） |
| `field-group` | `data-disabled` | ''（条件成立时才出现） |
| `actions` | `data-disabled` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-fieldset-actions-gap` · `--xh-fieldset-description-fg` · `--xh-fieldset-description-fg-disabled` · `--xh-fieldset-description-font-size` · `--xh-fieldset-error-fg` · `--xh-fieldset-error-font-size` · `--xh-fieldset-field-group-col-w` · `--xh-fieldset-field-group-gap` · `--xh-fieldset-gap` · `--xh-fieldset-legend-fg` · `--xh-fieldset-legend-fg-disabled` · `--xh-fieldset-legend-fg-invalid` · `--xh-fieldset-legend-font-size` · `--xh-fieldset-legend-font-weight` · `--xh-fieldset-legend-gap` · `--xh-fieldset-legend-star`

## 动效

`color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 里面按顺序放若干[表单字段](./field)，每格自己管标签与错误文案。
- 一组单选放[单选组](./radio-group)、一组多选放[复选框组](./checkbox-group)。**这两个组仍要写自己的 `label` 部件**：字段集的标题命名的是外层这一段，内层那一组要自己有名字，legend 不会往下传。
- 外面套[表单](./form)统一收值与校验，字段集只承担分组与整段禁用。

## 最佳实践

- 组标题写成一句能读通的名词短语或问句（"通知方式"而不是"选项"）——读屏进组时念的就是它。
- 整段停用优先写在字段集上，别逐个控件写 `disabled`：漏一个就是一个能点却不该点的控件。
- 错误文案说清楚整组哪里不满足（"至少填写一种联系方式"），单格自己的错误留给该格的字段。

## 反模式

- 用 `<div>` 冒充字段集：禁用不再连坐，读屏也听不出这是一组。
- 把 `<legend>` 挪到中间或包一层容器：它一旦不是首个子节点，就不再是这一组的名字。
- 只用一条分割线和一行加粗文字表示分组：视觉上像一组，无障碍树里仍是散的。
- 一个字段集里塞进三四个互不相关的主题，标题只好写成"其他"。
- 打开 `invalid` 却不渲染错误文案：屏幕上只有组标题换了个颜色，读屏用户完全不知道这一组出了问题。

来源：https://ui.docs.xihanfun.com/components/form

# 表单 `form`

一整张表的值、校验与提交：字段各自录入，表单负责汇总、校验和拦下不合格的提交。

## 何时使用

- 多个字段需要一起提交，且存在跨字段规则。
- 需要统一的校验时机与错误汇总。

## 何时不用

- 只有一两个立即生效的开关：直接改，别包表单。
- 只是要一格标签加控件：用[表单字段](./field)。

## 特性

- `validateOn` 决定何时校验：输入时、失焦时还是提交时。
- 支持异步校验、跨字段规则与手动触发入口。
- 嵌套模型走路径字段名，字段值表与业务模型形状一致。
- 错误汇总（`error-summary`）把所有错误列在一处，每条都能点回对应字段。
- "提醒但不拦下"是一档独立行为：警告级的问题不阻断提交。

## 示例

### 基础用法

默认只在提交时整表校验：过了发 submit，没过发 invalid、摘要显形并把焦点送到第一个出错的字段

```vue
<script setup lang="ts">
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormErrorSummary,
  XhFormErrorSummaryItem,
  XhFormFieldGroup,
  XhFormResetTrigger,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const submitted = ref("");

// 校验整表跑一遍，返回「字段名 → 错误文案」；空串表示这条没错
function validate(values: Record<string, unknown>) {
  return {
    email: String(values.email ?? "").includes("@") ? "" : "邮箱要带一个 @",
    nickname: String(values.nickname ?? "").trim() ? "" : "昵称不能为空",
  };
}

function onSubmit(details: { values: Record<string, unknown> }) {
  submitted.value = JSON.stringify(details.values);
}
</script>

<template>
  <XhFormRoot
    :default-values="{ email: '', nickname: '' }"
    :validate="validate"
    style="inline-size: 320px;"
    @submit="onSubmit"
  >
    <!-- 摘要只在提交失败后显形；条目一次全写上，谁露面由当下的错误表决定 -->
    <XhFormErrorSummary v-slot="{ errorCount }">
      <span>共 {{ errorCount }} 处需要修改</span>
      <XhFormErrorSummaryItem v-slot="{ error }" value="email">{{ error }}</XhFormErrorSummaryItem>
      <XhFormErrorSummaryItem v-slot="{ error }" value="nickname">{{ error }}</XhFormErrorSummaryItem>
    </XhFormErrorSummary>

    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" value="email">
      <XhFieldRoot :invalid="invalid" required>
        <XhFieldLabel>邮箱</XhFieldLabel>
        <XhFieldControl>
          <input
            type="email"
            placeholder="you@example.com"
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          >
        </XhFieldControl>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" value="nickname">
      <XhFieldRoot :invalid="invalid" required>
        <XhFieldLabel>昵称</XhFieldLabel>
        <XhFieldControl>
          <input
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          >
        </XhFieldControl>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <div style="display: flex; gap: 8px;">
      <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
      <XhFormResetTrigger>重置</XhFormResetTrigger>
    </div>

    <p v-if="submitted" style="margin: 0; font-size: 13px;">已提交：{{ submitted }}</p>
  </XhFormRoot>
</template>
```

```html
<xh-form id="form-basic">
  <form data-xh-part="root" style="inline-size: 320px">
    <!-- 摘要只在提交失败后显形；条目一次全写上，谁露面由当下的错误表决定 -->
    <div data-xh-part="error-summary">
      <span id="form-basic-count">共 0 处需要修改</span>
      <a data-xh-part="error-summary-item" value="email"></a>
      <a data-xh-part="error-summary-item" value="nickname"></a>
    </div>

    <div data-xh-part="field-group" value="email">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">邮箱</label>
          <input data-xh-part="control" type="email" placeholder="you@example.com" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" value="nickname">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">昵称</label>
          <input data-xh-part="control" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div style="display: flex; gap: 8px">
      <button data-xh-part="submit-trigger">提交</button>
      <button data-xh-part="reset-trigger">重置</button>
    </div>

    <p id="form-basic-submitted" hidden style="margin: 0; font-size: 13px"></p>
  </form>
</xh-form>

<script type="module">
  const host = document.getElementById("form-basic");
  const count = document.getElementById("form-basic-count");
  const submitted = document.getElementById("form-basic-submitted");

  const defaults = { email: "", nickname: "" };
  let values = { ...defaults };

  // 校验整表跑一遍，返回「字段名 → 错误文案」；空串表示这条没错
  host.validate = (source) => ({
    email: String(source.email ?? "").includes("@") ? "" : "邮箱要带一个 @",
    nickname: String(source.nickname ?? "").trim() ? "" : "昵称不能为空",
  });
  host.defaultValues = defaults;
  host.values = values;

  const groups = [...host.querySelectorAll('[data-xh-part="field-group"]')];
  const nameOf = (el) => el.getAttribute("value");

  // 控件是作者自己的：敲字写回表单，值表变了再刷回控件
  for (const group of groups) {
    const input = group.querySelector('[data-xh-part="control"]');
    input.addEventListener("input", () => host.setFieldValue(nameOf(group), input.value));
  }

  function syncControls() {
    for (const group of groups) {
      const input = group.querySelector('[data-xh-part="control"]');
      const next = String(values[nameOf(group)] ?? "");
      if (input.value !== next) input.value = next;
    }
  }

  // 错误文案由作者自己写进字段与摘要条目
  function paintErrors(errors) {
    for (const group of groups)
      group.querySelector('[data-xh-part="error-text"]').textContent = errors[nameOf(group)] ?? "";
    for (const item of host.querySelectorAll('[data-xh-part="error-summary-item"]'))
      item.textContent = errors[nameOf(item)] ?? "";
    count.textContent = `共 ${Object.keys(errors).length} 处需要修改`;
  }

  // 值给了即受控，写值只发通知，改动由宿主自己写回
  host.addEventListener("values-change", (event) => {
    values = event.detail.values;
    host.values = values;
    syncControls();
  });
  host.addEventListener("errors-change", (event) => paintErrors(event.detail.errors));
  host.addEventListener("submit", (event) => {
    submitted.hidden = false;
    submitted.textContent = `已提交：${JSON.stringify(event.detail.values)}`;
  });

  syncControls();
</script>
```

### 校验时机

blur 与 change 两种模式下 validate 仍整表跑（校验可能带跨字段规则），但只把当事字段那一条写回错误表

```vue
<script setup lang="ts">
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";

function validate(values: Record<string, unknown>) {
  const port = String(values.port ?? "").trim();
  return { port: /^\d+$/.test(port) ? "" : "端口只能是数字" };
}
</script>

<template>
  <!-- 失焦时校验这一个字段：填的过程中不打断 -->
  <XhFormRoot
    :default-values="{ port: 'abc' }"
    :validate="validate"
    validate-on="blur"
    style="inline-size: 240px;"
  >
    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" value="port">
      <XhFieldRoot :invalid="invalid">
        <XhFieldLabel>端口（失焦校验）</XhFieldLabel>
        <XhFieldControl>
          <input :value="value" @input="setValue(($event.target as HTMLInputElement).value)">
        </XhFieldControl>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>
    <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
  </XhFormRoot>

  <!-- 改一个字就校验一次：错误随输入实时消长 -->
  <XhFormRoot
    :default-values="{ port: 'abc' }"
    :validate="validate"
    validate-on="change"
    style="inline-size: 240px;"
  >
    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" value="port">
      <XhFieldRoot :invalid="invalid">
        <XhFieldLabel>端口（改动即校验）</XhFieldLabel>
        <XhFieldControl>
          <input :value="value" @input="setValue(($event.target as HTMLInputElement).value)">
        </XhFieldControl>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>
    <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
  </XhFormRoot>
</template>
```

```html
<!-- 失焦时校验这一个字段：填的过程中不打断 -->
<xh-form id="form-validate-blur" validate-on="blur">
  <form data-xh-part="root" style="inline-size: 240px">
    <div data-xh-part="field-group" value="port">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">端口（失焦校验）</label>
          <input data-xh-part="control" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>
    <button data-xh-part="submit-trigger">提交</button>
  </form>
</xh-form>

<!-- 改一个字就校验一次：错误随输入实时消长 -->
<xh-form id="form-validate-change" validate-on="change">
  <form data-xh-part="root" style="inline-size: 240px">
    <div data-xh-part="field-group" value="port">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">端口（改动即校验）</label>
          <input data-xh-part="control" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>
    <button data-xh-part="submit-trigger">提交</button>
  </form>
</xh-form>

<script type="module">
  function validate(source) {
    const port = String(source.port ?? "").trim();
    return { port: /^\d+$/.test(port) ? "" : "端口只能是数字" };
  }

  // 两份表单接线相同，只有校验时机那一条属性不一样
  function wire(id) {
    const host = document.getElementById(id);
    const defaults = { port: "abc" };
    let values = { ...defaults };

    host.validate = validate;
    host.defaultValues = defaults;
    host.values = values;

    const group = host.querySelector('[data-xh-part="field-group"]');
    const input = group.querySelector('[data-xh-part="control"]');
    const errorText = group.querySelector('[data-xh-part="error-text"]');

    input.addEventListener("input", () => host.setFieldValue("port", input.value));
    host.addEventListener("values-change", (event) => {
      values = event.detail.values;
      host.values = values;
      const next = String(values.port ?? "");
      if (input.value !== next) input.value = next;
    });
    host.addEventListener("errors-change", (event) => {
      errorText.textContent = event.detail.errors.port ?? "";
    });

    input.value = String(values.port ?? "");
  }

  wire("form-validate-blur");
  wire("form-validate-change");
</script>
```

### 受控值表

传了 values 就由宿主说了算：组件内部不再落值，只发变更通知；页面别处也能直接改这张表

```vue
<script setup lang="ts">
import {
  XhFieldControl,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormResetTrigger,
  XhFormRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const defaults = { host: "127.0.0.1", port: "5173" };
const values = ref<Record<string, unknown>>({ ...defaults });
</script>

<template>
  <XhFormRoot
    v-model:values="values"
    :default-values="defaults"
    style="inline-size: 260px;"
  >
    <XhFormFieldGroup v-slot="{ value, setValue }" value="host">
      <XhFieldRoot>
        <XhFieldLabel>主机</XhFieldLabel>
        <XhFieldControl>
          <input :value="value" @input="setValue(($event.target as HTMLInputElement).value)">
        </XhFieldControl>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <XhFormFieldGroup v-slot="{ value, setValue }" value="port">
      <XhFieldRoot>
        <XhFieldLabel>端口</XhFieldLabel>
        <XhFieldControl>
          <input :value="value" @input="setValue(($event.target as HTMLInputElement).value)">
        </XhFieldControl>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <!-- 重置把值送回 default-values，同样经由 update:values 落到宿主这张表上 -->
    <XhFormResetTrigger>重置</XhFormResetTrigger>
  </XhFormRoot>

  <span style="font-size: 13px;">宿主持有的值：{{ JSON.stringify(values) }}</span>
</template>
```

```html
<xh-form id="form-controlled">
  <form data-xh-part="root" style="inline-size: 260px">
    <div data-xh-part="field-group" value="host">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">主机</label>
          <!-- 内容属性上的 value 是原生重置的落点，与 default-values 写同一个值 -->
          <input data-xh-part="control" value="127.0.0.1" />
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" value="port">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">端口</label>
          <input data-xh-part="control" value="5173" />
        </div>
      </xh-field>
    </div>

    <!-- 重置把值送回 default-values，同样经由变更通知落到宿主这张表上 -->
    <button data-xh-part="reset-trigger">重置</button>
  </form>
</xh-form>

<span id="form-controlled-readout" style="font-size: 13px"></span>

<script type="module">
  const host = document.getElementById("form-controlled");
  const readout = document.getElementById("form-controlled-readout");

  const defaults = { host: "127.0.0.1", port: "5173" };
  let values = { ...defaults };

  host.defaultValues = defaults;
  host.values = values;

  const groups = [...host.querySelectorAll('[data-xh-part="field-group"]')];
  const nameOf = (el) => el.getAttribute("value");

  for (const group of groups) {
    const input = group.querySelector('[data-xh-part="control"]');
    input.addEventListener("input", () => host.setFieldValue(nameOf(group), input.value));
  }

  function render() {
    for (const group of groups) {
      const input = group.querySelector('[data-xh-part="control"]');
      const next = String(values[nameOf(group)] ?? "");
      if (input.value !== next) input.value = next;
    }
    readout.textContent = `宿主持有的值：${JSON.stringify(values)}`;
  }

  host.addEventListener("values-change", (event) => {
    values = event.detail.values;
    host.values = values;
    render();
  });

  render();
</script>
```

### 禁用与只读

disabled 把提交、重置、写值三条路一起封死；read-only 只封写值与重置，提交照发

```vue
<script setup lang="ts">
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormResetTrigger,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const submitted = ref("（还没提交过）");

function onSubmit(details: { values: Record<string, unknown> }) {
  submitted.value = JSON.stringify(details.values);
}
</script>

<template>
  <!-- 整表禁用：两颗按钮自带原生 disabled，控件那一侧的 disabled 由自己落 -->
  <XhFormRoot disabled :default-values="{ token: 'xh-0f2a' }" style="inline-size: 260px;">
    <XhFormFieldGroup v-slot="{ value, setValue }" value="token">
      <XhFieldRoot disabled>
        <XhFieldLabel>接入令牌</XhFieldLabel>
        <XhFieldControl>
          <input
            disabled
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          >
        </XhFieldControl>
        <XhFieldDescription>整表禁用</XhFieldDescription>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <div style="display: flex; gap: 8px;">
      <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
      <XhFormResetTrigger>重置</XhFormResetTrigger>
    </div>
  </XhFormRoot>

  <!-- 只读：重置键置灰、写值不发生，提交仍旧把当下这份值交出去 -->
  <XhFormRoot
    read-only
    :default-values="{ token: 'xh-0f2a' }"
    style="inline-size: 260px;"
    @submit="onSubmit"
  >
    <XhFormFieldGroup v-slot="{ value, setValue }" value="token">
      <XhFieldRoot>
        <XhFieldLabel>接入令牌</XhFieldLabel>
        <XhFieldControl>
          <input
            readonly
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          >
        </XhFieldControl>
        <XhFieldDescription>只读：能提交，改不动</XhFieldDescription>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <div style="display: flex; gap: 8px;">
      <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
      <XhFormResetTrigger>重置</XhFormResetTrigger>
    </div>
  </XhFormRoot>

  <p style="margin: 0; font-size: 13px;">已提交：{{ submitted }}</p>
</template>
```

```html
<!-- 整表禁用：两颗按钮自带原生 disabled，控件那一侧的 disabled 由自己落 -->
<xh-form id="form-disabled" disabled>
  <form data-xh-part="root" style="inline-size: 260px">
    <div data-xh-part="field-group" value="token">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">接入令牌</label>
          <input data-xh-part="control" disabled />
          <p data-xh-part="description">整表禁用</p>
        </div>
      </xh-field>
    </div>

    <div style="display: flex; gap: 8px">
      <button data-xh-part="submit-trigger">提交</button>
      <button data-xh-part="reset-trigger">重置</button>
    </div>
  </form>
</xh-form>

<!-- 只读：重置键置灰、写值不发生，提交仍旧把当下这份值交出去 -->
<xh-form id="form-readonly" read-only>
  <form data-xh-part="root" style="inline-size: 260px">
    <div data-xh-part="field-group" value="token">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">接入令牌</label>
          <input data-xh-part="control" readonly />
          <p data-xh-part="description">只读：能提交，改不动</p>
        </div>
      </xh-field>
    </div>

    <div style="display: flex; gap: 8px">
      <button data-xh-part="submit-trigger">提交</button>
      <button data-xh-part="reset-trigger">重置</button>
    </div>
  </form>
</xh-form>

<p id="form-disabled-submitted" style="margin: 0; font-size: 13px">已提交：（还没提交过）</p>

<script type="module">
  const submitted = document.getElementById("form-disabled-submitted");

  function wire(id) {
    const host = document.getElementById(id);
    const defaults = { token: "xh-0f2a" };
    let values = { ...defaults };

    host.defaultValues = defaults;
    host.values = values;

    const input = host.querySelector('[data-xh-part="control"]');
    input.addEventListener("input", () => host.setFieldValue("token", input.value));
    host.addEventListener("values-change", (event) => {
      values = event.detail.values;
      host.values = values;
      const next = String(values.token ?? "");
      if (input.value !== next) input.value = next;
    });
    host.addEventListener("submit", (event) => {
      submitted.textContent = `已提交：${JSON.stringify(event.detail.values)}`;
    });

    input.value = String(values.token ?? "");
  }

  wire("form-disabled");
  wire("form-readonly");
</script>
```

### 动态字段

字段容器随数组增删，值表的键跟着字段名走；校验只遍历当下这几行，删掉的行不再参与

```vue
<script setup lang="ts">
import {
  XhButton,
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

let nextId = 1;
const rows = ref([{ id: nextId }]);
const submitted = ref("（还没提交过）");

// 字段名的派生规则只此一处：模板、校验、提交回调都读它
function fieldName(id: number) {
  return `tag-${id}`;
}

function add() {
  nextId += 1;
  rows.value.push({ id: nextId });
}

function remove(id: number) {
  rows.value = rows.value.filter(row => row.id !== id);
}

function validate(values: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  for (const row of rows.value) {
    const name = fieldName(row.id);
    errors[name] = String(values[name] ?? "").trim() ? "" : "标签不能为空";
  }
  return errors;
}

function onSubmit(details: { values: Record<string, unknown> }) {
  submitted.value = rows.value
    .map(row => String(details.values[fieldName(row.id)] ?? ""))
    .join(" / ");
}
</script>

<template>
  <XhFormRoot :validate="validate" style="inline-size: 320px;" @submit="onSubmit">
    <template v-for="(row, index) in rows" :key="row.id">
      <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" :value="fieldName(row.id)">
        <XhFieldRoot :invalid="invalid">
          <XhFieldLabel>标签 {{ index + 1 }}</XhFieldLabel>
          <XhFieldControl>
            <input :value="value" @input="setValue(($event.target as HTMLInputElement).value)">
          </XhFieldControl>
          <XhFieldErrorText>{{ error }}</XhFieldErrorText>
        </XhFieldRoot>
        <XhButton variant="ghost" size="sm" @click="remove(row.id)">删掉这一行</XhButton>
      </XhFormFieldGroup>
    </template>

    <div style="display: flex; gap: 8px;">
      <XhButton variant="outline" @click="add">添加一行</XhButton>
      <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
    </div>

    <p style="margin: 0; font-size: 13px;">已提交：{{ submitted }}</p>
  </XhFormRoot>
</template>
```

```html
<xh-form id="form-dynamic">
  <form data-xh-part="root" style="inline-size: 320px">
    <div id="form-dynamic-actions" style="display: flex; gap: 8px">
      <xh-button variant="outline">
        <button data-xh-part="root" id="form-dynamic-add">添加一行</button>
      </xh-button>
      <button data-xh-part="submit-trigger">提交</button>
    </div>

    <p id="form-dynamic-submitted" style="margin: 0; font-size: 13px">已提交：（还没提交过）</p>
  </form>
</xh-form>

<!-- 一行的骨架，脚本按当前行数组克隆出字段容器来 -->
<template id="form-dynamic-row">
  <div data-xh-part="field-group">
    <xh-field>
      <div data-xh-part="root">
        <label data-xh-part="label"></label>
        <input data-xh-part="control" />
        <p data-xh-part="error-text"></p>
      </div>
    </xh-field>
    <xh-button variant="ghost" size="sm">
      <button data-xh-part="root">删掉这一行</button>
    </xh-button>
  </div>
</template>

<script type="module">
  const host = document.getElementById("form-dynamic");
  const root = host.querySelector('[data-xh-part="root"]');
  const template = document.getElementById("form-dynamic-row");
  const actions = document.getElementById("form-dynamic-actions");
  const submitted = document.getElementById("form-dynamic-submitted");

  // 字段名的派生规则只此一处：铺行、校验、提交回调都读它
  const fieldName = (id) => `tag-${id}`;

  let nextId = 1;
  let rows = [{ id: nextId }];
  let values = {};

  host.values = values;
  host.validate = (source) => {
    const errors = {};
    for (const row of rows) {
      const name = fieldName(row.id);
      errors[name] = String(source[name] ?? "").trim() ? "" : "标签不能为空";
    }
    return errors;
  };

  const groups = () => [...root.querySelectorAll('[data-xh-part="field-group"]')];

  function render() {
    for (const group of groups()) group.remove();
    rows.forEach((row, index) => {
      const name = fieldName(row.id);
      const group = template.content.firstElementChild.cloneNode(true);
      group.setAttribute("value", name);
      group.querySelector('[data-xh-part="label"]').textContent = `标签 ${index + 1}`;

      const input = group.querySelector('[data-xh-part="control"]');
      input.value = String(values[name] ?? "");
      input.addEventListener("input", () => host.setFieldValue(name, input.value));

      group.querySelector("xh-button button").addEventListener("click", () => {
        rows = rows.filter((item) => item.id !== row.id);
        render();
      });

      root.insertBefore(group, actions);
    });
  }

  host.addEventListener("values-change", (event) => {
    values = event.detail.values;
    host.values = values;
    for (const group of groups()) {
      const input = group.querySelector('[data-xh-part="control"]');
      const next = String(values[group.getAttribute("value")] ?? "");
      if (input.value !== next) input.value = next;
    }
  });

  host.addEventListener("errors-change", (event) => {
    for (const group of groups()) {
      const message = event.detail.errors[group.getAttribute("value")] ?? "";
      group.querySelector('[data-xh-part="error-text"]').textContent = message;
    }
  });

  host.addEventListener("submit", (event) => {
    submitted.textContent = `已提交：${rows
      .map((row) => String(event.detail.values[fieldName(row.id)] ?? ""))
      .join(" / ")}`;
  });

  document.getElementById("form-dynamic-add").addEventListener("click", () => {
    nextId += 1;
    rows = [...rows, { id: nextId }];
    render();
  });

  render();
</script>
```

### 异步校验

规则里的 validator 直接返回 Promise：提交时机器等它回来再放行或拦下，期间 validating 置真可用来标忙

```vue
<script setup lang="ts">
import type { FormRules } from "@xihan-ui/headless";
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const taken = ["admin", "root", "xihan"];
const submitted = ref("（还没提交过）");

// 远程唯一性核验：这里用定时器模拟服务端往返
const rules: FormRules = {
  username: [
    { required: true, message: "用户名不能为空" },
    {
      validator: async (value) => {
        await new Promise(r => setTimeout(r, 700));
        return taken.includes(String(value).trim()) ? "这个用户名已经有人用了" : undefined;
      },
    },
  ],
};

function onSubmit(details: { values: Record<string, unknown> }) {
  submitted.value = String(details.values.username ?? "");
}
</script>

<template>
  <XhFormRoot
    v-slot="{ validating }"
    :default-values="{ username: '' }"
    :rules="rules"
    style="inline-size: 320px"
    @submit="onSubmit"
  >
    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" value="username">
      <XhFieldRoot :invalid="invalid" required>
        <XhFieldLabel>用户名</XhFieldLabel>
        <XhFieldControl>
          <input
            placeholder="试试 admin"
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          >
        </XhFieldControl>
        <XhFieldDescription>{{ validating ? "正在核验…" : "提交时先问一次服务端，占用的名字会被挡下" }}</XhFieldDescription>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <XhFormSubmitTrigger>{{ validating ? "核验中…" : "提交" }}</XhFormSubmitTrigger>
    <p style="margin: 0; font-size: 13px">已提交：{{ submitted }}</p>
  </XhFormRoot>
</template>
```

```html
<xh-form id="form-async">
  <form data-xh-part="root" style="inline-size: 320px; display: grid; gap: 12px">
    <div data-xh-part="field-group" value="username">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">用户名</label>
          <input data-xh-part="control" placeholder="试试 admin" />
          <p data-xh-part="description">提交时先问一次服务端，占用的名字会被挡下</p>
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <button data-xh-part="submit-trigger" id="form-async-submit">提交</button>
    <p style="margin: 0; font-size: 13px">已提交：<span id="form-async-submitted">（还没提交过）</span></p>
  </form>
</xh-form>

<script type="module">
  const host = document.getElementById("form-async");
  const input = host.querySelector('[data-xh-part="control"]');
  // 部件节点上的 id 由组件自己派生，别写自己的：查它们一律按角色名
  const hint = host.querySelector('[data-xh-part="description"]');
  const error = host.querySelector('[data-xh-part="error-text"]');
  const submit = document.getElementById("form-async-submit");
  const submitted = document.getElementById("form-async-submitted");

  const TAKEN = ["admin", "root", "xihan"];
  const HINT = "提交时先问一次服务端，占用的名字会被挡下";

  const defaults = { username: "" };
  let values = { ...defaults };

  // 远程唯一性核验：这里用定时器模拟服务端往返
  host.rules = {
    username: [
      { required: true, message: "用户名不能为空" },
      {
        validator: async (value) => {
          await new Promise((resolve) => setTimeout(resolve, 700));
          return TAKEN.includes(String(value).trim()) ? "这个用户名已经有人用了" : undefined;
        },
      },
    ],
  };

  host.defaultValues = defaults;
  host.values = values;

  // 提交发出到结果回来之间标忙：这一段正是机器里 validating 为真的那一段
  function setBusy(busy) {
    submit.textContent = busy ? "核验中…" : "提交";
    hint.textContent = busy ? "正在核验…" : HINT;
  }

  input.addEventListener("input", () => host.setFieldValue("username", input.value));

  host.addEventListener("values-change", (event) => {
    values = event.detail.values;
    host.values = values;
    const next = String(values.username ?? "");
    if (input.value !== next) input.value = next;
  });

  host.addEventListener("errors-change", (event) => {
    error.textContent = event.detail.errors.username ?? "";
  });

  submit.addEventListener("click", () => setBusy(true));
  host.addEventListener("submit", (event) => {
    setBusy(false);
    submitted.textContent = String(event.detail.values.username ?? "");
  });
  host.addEventListener("invalid", () => setBusy(false));
</script>
```

### 跨字段规则与手动入口

validate 拿到的是整张值表，可以写两个字段互相约束的规则；setFieldError 与 clearErrors 随时能单独动一条

```vue
<script setup lang="ts">
import {
  XhButton,
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";

// 确认密码这一条要跟密码比，单看自己判不出来
function confirmError(values: Record<string, unknown>) {
  const password = String(values.password ?? "");
  const confirm = String(values.confirm ?? "");
  if (confirm === "")
    return "请再输入一遍密码";
  return confirm === password ? "" : "两次输入不一致";
}

function validate(values: Record<string, unknown>) {
  return {
    password: String(values.password ?? "").length >= 8 ? "" : "密码至少 8 位",
    confirm: confirmError(values),
  };
}
</script>

<template>
  <XhFormRoot
    v-slot="{ values, setFieldError, clearErrors }"
    :default-values="{ password: '', confirm: '' }"
    :validate="validate"
    style="inline-size: 320px;"
  >
    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" value="password">
      <XhFieldRoot :invalid="invalid" required>
        <XhFieldLabel>密码</XhFieldLabel>
        <XhFieldControl>
          <input
            type="password"
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          >
        </XhFieldControl>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" value="confirm">
      <XhFieldRoot :invalid="invalid" required>
        <XhFieldLabel>确认密码</XhFieldLabel>
        <XhFieldControl>
          <input
            type="password"
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          >
        </XhFieldControl>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <div style="display: flex; gap: 8px;">
      <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
      <!-- 只动确认密码这一条：给文案就写上，给空串就撤掉 -->
      <XhButton variant="outline" @click="setFieldError('confirm', confirmError(values))">
        只查确认密码
      </XhButton>
      <XhButton variant="ghost" @click="clearErrors()">清空错误</XhButton>
    </div>
  </XhFormRoot>
</template>
```

```html
<xh-form id="form-manual">
  <form data-xh-part="root" style="inline-size: 320px">
    <div data-xh-part="field-group" value="password">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">密码</label>
          <input data-xh-part="control" type="password" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" value="confirm">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">确认密码</label>
          <input data-xh-part="control" type="password" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div style="display: flex; gap: 8px">
      <button data-xh-part="submit-trigger">提交</button>
      <!-- 只动确认密码这一条：给文案就写上，给空串就撤掉 -->
      <xh-button variant="outline">
        <button data-xh-part="root" id="form-manual-check">只查确认密码</button>
      </xh-button>
      <xh-button variant="ghost">
        <button data-xh-part="root" id="form-manual-clear">清空错误</button>
      </xh-button>
    </div>
  </form>
</xh-form>

<script type="module">
  const host = document.getElementById("form-manual");

  const defaults = { password: "", confirm: "" };
  let values = { ...defaults };

  // 确认密码这一条要跟密码比，单看自己判不出来
  function confirmError(source) {
    const password = String(source.password ?? "");
    const confirm = String(source.confirm ?? "");
    if (confirm === "") return "请再输入一遍密码";
    return confirm === password ? "" : "两次输入不一致";
  }

  host.defaultValues = defaults;
  host.values = values;
  host.validate = (source) => ({
    password: String(source.password ?? "").length >= 8 ? "" : "密码至少 8 位",
    confirm: confirmError(source),
  });

  const groups = [...host.querySelectorAll('[data-xh-part="field-group"]')];
  const nameOf = (el) => el.getAttribute("value");

  for (const group of groups) {
    const input = group.querySelector('[data-xh-part="control"]');
    input.addEventListener("input", () => host.setFieldValue(nameOf(group), input.value));
  }

  host.addEventListener("values-change", (event) => {
    values = event.detail.values;
    host.values = values;
    for (const group of groups) {
      const input = group.querySelector('[data-xh-part="control"]');
      const next = String(values[nameOf(group)] ?? "");
      if (input.value !== next) input.value = next;
    }
  });

  host.addEventListener("errors-change", (event) => {
    for (const group of groups)
      group.querySelector('[data-xh-part="error-text"]').textContent
        = event.detail.errors[nameOf(group)] ?? "";
  });

  document.getElementById("form-manual-check").addEventListener("click", () => {
    host.setFieldError("confirm", confirmError(values));
  });
  document.getElementById("form-manual-clear").addEventListener("click", () => {
    host.clearErrors();
  });
</script>
```

### 提醒但不拦下

可疑的值只在描述里提醒一句，不写进错误表：控件的 aria-invalid 仍是 false，提交照样放行

```vue
<script setup lang="ts">
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const personal = ["qq.com", "163.com", "gmail.com"];
const values = ref<Record<string, unknown>>({ email: "zhaifanhua@qq.com" });
const submitted = ref("（还没提交过）");

// 拦得住的只有格式这一条，它才进错误表
function validate(source: Record<string, unknown>) {
  return {
    email: String(source.email ?? "").includes("@") ? "" : "邮箱要带一个 @",
  };
}

// 提醒由值现算，与错误表无关
const warning = computed(() => {
  const text = String(values.value.email ?? "");
  const domain = text.slice(text.indexOf("@") + 1).toLowerCase();
  return text.includes("@") && personal.includes(domain)
    ? "这是个人邮箱，同事之间通常填公司邮箱"
    : "";
});

// 警告档只换配色：边框取语气层的强调色，描述取语气层的文字色
const warningStyle = {
  "--xh-field-control-border": "var(--xh-_tone-soft)",
  "--xh-field-description-fg": "var(--xh-_tone-fg)",
};

function onSubmit(details: { values: Record<string, unknown> }) {
  submitted.value = String(details.values.email ?? "");
}
</script>

<template>
  <XhFormRoot
    v-model:values="values"
    :default-values="{ email: 'zhaifanhua@qq.com' }"
    :validate="validate"
    style="inline-size: 320px;"
    @submit="onSubmit"
  >
    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" value="email">
      <XhFieldRoot
        :invalid="invalid"
        :data-tone="!invalid && warning ? 'warning' : undefined"
        :style="!invalid && warning ? warningStyle : undefined"
      >
        <XhFieldLabel>邮箱</XhFieldLabel>
        <XhFieldControl>
          <input
            type="email"
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          >
        </XhFieldControl>
        <!-- 描述恒在描述链里：提醒会被念出来，又不会把控件标成无效 -->
        <XhFieldDescription>{{ warning || "用于接收账单与安全提醒" }}</XhFieldDescription>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
    <p style="margin: 0; font-size: 13px;">已提交：{{ submitted }}</p>
  </XhFormRoot>
</template>
```

```html
<xh-form id="form-warning">
  <form data-xh-part="root" style="inline-size: 320px">
    <div data-xh-part="field-group" value="email">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">邮箱</label>
          <input data-xh-part="control" type="email" />
          <!-- 描述恒在描述链里：提醒会被念出来，又不会把控件标成无效 -->
          <p data-xh-part="description"></p>
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <button data-xh-part="submit-trigger">提交</button>
    <p id="form-warning-submitted" style="margin: 0; font-size: 13px">已提交：（还没提交过）</p>
  </form>
</xh-form>

<script type="module">
  const host = document.getElementById("form-warning");
  const submitted = document.getElementById("form-warning-submitted");
  const group = host.querySelector('[data-xh-part="field-group"]');
  const fieldRoot = group.querySelector("xh-field > [data-xh-part='root']");
  const input = group.querySelector('[data-xh-part="control"]');
  const description = group.querySelector('[data-xh-part="description"]');
  const errorText = group.querySelector('[data-xh-part="error-text"]');

  const personal = ["qq.com", "163.com", "gmail.com"];
  const defaults = { email: "zhaifanhua@qq.com" };
  let values = { ...defaults };
  let errors = {};

  // 拦得住的只有格式这一条，它才进错误表
  host.defaultValues = defaults;
  host.values = values;
  host.validate = (source) => ({
    email: String(source.email ?? "").includes("@") ? "" : "邮箱要带一个 @",
  });

  // 提醒由值现算，与错误表无关
  function warningOf() {
    const text = String(values.email ?? "");
    const domain = text.slice(text.indexOf("@") + 1).toLowerCase();
    return text.includes("@") && personal.includes(domain)
      ? "这是个人邮箱，同事之间通常填公司邮箱"
      : "";
  }

  // 警告档只换配色：边框取语气层的强调色，描述取语气层的文字色
  function render() {
    const warning = warningOf();
    const invalid = errors.email !== undefined;
    if (!invalid && warning) {
      fieldRoot.dataset.tone = "warning";
      fieldRoot.style.setProperty("--xh-field-control-border", "var(--xh-_tone-soft)");
      fieldRoot.style.setProperty("--xh-field-description-fg", "var(--xh-_tone-fg)");
    } else {
      delete fieldRoot.dataset.tone;
      fieldRoot.style.removeProperty("--xh-field-control-border");
      fieldRoot.style.removeProperty("--xh-field-description-fg");
    }
    description.textContent = warning || "用于接收账单与安全提醒";
    errorText.textContent = errors.email ?? "";
    const next = String(values.email ?? "");
    if (input.value !== next) input.value = next;
  }

  input.addEventListener("input", () => host.setFieldValue("email", input.value));
  host.addEventListener("values-change", (event) => {
    values = event.detail.values;
    host.values = values;
    render();
  });
  host.addEventListener("errors-change", (event) => {
    errors = event.detail.errors;
    render();
  });
  host.addEventListener("submit", (event) => {
    submitted.textContent = `已提交：${String(event.detail.values.email ?? "")}`;
  });

  render();
</script>
```

### 分步校验

校验函数每次提交现读一次：闭住当前这一步，提交就只校验这一步的字段；存草稿走的是普通按钮，一条规则都不跑

```vue
<script setup lang="ts">
import {
  XhButton,
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const steps = [
  {
    title: "第 1 步 · 联系人",
    fields: [
      { name: "name", label: "姓名" },
      { name: "phone", label: "手机" },
    ],
  },
  {
    title: "第 2 步 · 任职",
    fields: [
      { name: "company", label: "公司" },
      { name: "title", label: "职位" },
    ],
  },
];

const step = ref(0);
const current = computed(() => steps[step.value]);
const isLast = computed(() => step.value === steps.length - 1);
const draft = ref("（还没存过）");
const done = ref("");

function ruleOf(name: string, text: string) {
  if (!text.trim())
    return "这一项不能为空";
  if (name === "phone" && !/^\d{11}$/.test(text.trim()))
    return "手机号要 11 位数字";
  return "";
}

// 只返回当前这一步的字段，别的步骤这一次不参与
function validate(values: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  for (const field of current.value.fields)
    errors[field.name] = ruleOf(field.name, String(values[field.name] ?? ""));
  return errors;
}

// 这一步过了才走到这里：不是最后一步就往下推一步
function onSubmit(details: { values: Record<string, unknown> }) {
  if (!isLast.value) {
    step.value += 1;
    return;
  }
  done.value = JSON.stringify(details.values);
}

function saveDraft(values: Record<string, unknown>) {
  draft.value = JSON.stringify(values);
}
</script>

<template>
  <XhFormRoot
    v-slot="{ values }"
    :default-values="{ name: '', phone: '', company: '', title: '' }"
    :validate="validate"
    style="inline-size: 320px;"
    @submit="onSubmit"
  >
    <strong style="font-size: 13px;">{{ current.title }}</strong>

    <!-- 上一步的字段容器这会儿并没渲染，值仍留在值表里 -->
    <template v-for="field in current.fields" :key="field.name">
      <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" :value="field.name">
        <XhFieldRoot :invalid="invalid" required>
          <XhFieldLabel>{{ field.label }}</XhFieldLabel>
          <XhFieldControl>
            <input :value="value" @input="setValue(($event.target as HTMLInputElement).value)">
          </XhFieldControl>
          <XhFieldErrorText>{{ error }}</XhFieldErrorText>
        </XhFieldRoot>
      </XhFormFieldGroup>
    </template>

    <div style="display: flex; gap: 8px;">
      <XhFormSubmitTrigger>{{ isLast ? "提交" : "下一步" }}</XhFormSubmitTrigger>
      <!-- 普通按钮不是提交键，点了不发提交，也就不跑校验 -->
      <XhButton variant="outline" @click="saveDraft(values)">存草稿</XhButton>
      <XhButton v-if="step > 0" variant="ghost" @click="step -= 1">上一步</XhButton>
    </div>

    <p style="margin: 0; font-size: 13px;">草稿：{{ draft }}</p>
    <p v-if="done" style="margin: 0; font-size: 13px;">已提交：{{ done }}</p>
  </XhFormRoot>
</template>
```

```html
<xh-form id="form-steps">
  <form data-xh-part="root" style="inline-size: 320px">
    <strong id="form-steps-title" style="font-size: 13px"></strong>

    <div id="form-steps-actions" style="display: flex; gap: 8px">
      <button data-xh-part="submit-trigger" id="form-steps-next">下一步</button>
      <!-- 普通按钮不是提交键，点了不发提交，也就不跑校验 -->
      <xh-button variant="outline">
        <button data-xh-part="root" id="form-steps-draft">存草稿</button>
      </xh-button>
      <xh-button variant="ghost" id="form-steps-back-host">
        <button data-xh-part="root" id="form-steps-back">上一步</button>
      </xh-button>
    </div>

    <p id="form-steps-draft-out" style="margin: 0; font-size: 13px">草稿：（还没存过）</p>
    <p id="form-steps-done" hidden style="margin: 0; font-size: 13px"></p>
  </form>
</xh-form>

<!-- 一个字段的骨架，脚本按当前这一步克隆出字段容器来 -->
<template id="form-steps-field">
  <div data-xh-part="field-group">
    <xh-field>
      <div data-xh-part="root">
        <label data-xh-part="label"></label>
        <input data-xh-part="control" />
        <p data-xh-part="error-text"></p>
      </div>
    </xh-field>
  </div>
</template>

<script type="module">
  const host = document.getElementById("form-steps");
  const root = host.querySelector('[data-xh-part="root"]');
  const template = document.getElementById("form-steps-field");
  const actions = document.getElementById("form-steps-actions");
  const title = document.getElementById("form-steps-title");
  const next = document.getElementById("form-steps-next");
  const backHost = document.getElementById("form-steps-back-host");
  const draftOut = document.getElementById("form-steps-draft-out");
  const done = document.getElementById("form-steps-done");

  const steps = [
    {
      title: "第 1 步 · 联系人",
      fields: [
        { name: "name", label: "姓名" },
        { name: "phone", label: "手机" },
      ],
    },
    {
      title: "第 2 步 · 任职",
      fields: [
        { name: "company", label: "公司" },
        { name: "title", label: "职位" },
      ],
    },
  ];

  const defaults = { name: "", phone: "", company: "", title: "" };
  let values = { ...defaults };
  let step = 0;

  const current = () => steps[step];
  const isLast = () => step === steps.length - 1;

  function ruleOf(name, text) {
    if (!text.trim()) return "这一项不能为空";
    if (name === "phone" && !/^\d{11}$/.test(text.trim())) return "手机号要 11 位数字";
    return "";
  }

  host.defaultValues = defaults;
  host.values = values;
  // 只返回当前这一步的字段，别的步骤这一次不参与
  host.validate = (source) => {
    const errors = {};
    for (const field of current().fields)
      errors[field.name] = ruleOf(field.name, String(source[field.name] ?? ""));
    return errors;
  };

  const groups = () => [...root.querySelectorAll('[data-xh-part="field-group"]')];

  // 上一步的字段容器这会儿并没渲染，值仍留在值表里
  function render() {
    for (const group of groups()) group.remove();
    for (const field of current().fields) {
      const group = template.content.firstElementChild.cloneNode(true);
      group.setAttribute("value", field.name);
      group.querySelector('[data-xh-part="label"]').textContent = field.label;
      const input = group.querySelector('[data-xh-part="control"]');
      input.value = String(values[field.name] ?? "");
      input.addEventListener("input", () => host.setFieldValue(field.name, input.value));
      root.insertBefore(group, actions);
    }
    title.textContent = current().title;
    next.textContent = isLast() ? "提交" : "下一步";
    backHost.style.display = step > 0 ? "" : "none";
  }

  host.addEventListener("values-change", (event) => {
    values = event.detail.values;
    host.values = values;
    for (const group of groups()) {
      const input = group.querySelector('[data-xh-part="control"]');
      const text = String(values[group.getAttribute("value")] ?? "");
      if (input.value !== text) input.value = text;
    }
  });

  host.addEventListener("errors-change", (event) => {
    for (const group of groups())
      group.querySelector('[data-xh-part="error-text"]').textContent
        = event.detail.errors[group.getAttribute("value")] ?? "";
  });

  // 这一步过了才走到这里：不是最后一步就往下推一步
  host.addEventListener("submit", (event) => {
    if (!isLast()) {
      step += 1;
      render();
      return;
    }
    done.hidden = false;
    done.textContent = `已提交：${JSON.stringify(event.detail.values)}`;
  });

  document.getElementById("form-steps-draft").addEventListener("click", () => {
    draftOut.textContent = `草稿：${JSON.stringify(values)}`;
  });
  document.getElementById("form-steps-back").addEventListener("click", () => {
    step -= 1;
    render();
  });

  render();
</script>
```

### 嵌套模型与路径字段名

字段名直接写成路径，值仍住在宿主自己的嵌套对象里：表单只管错误、id 与摘要跳转，提交时不用把扁平表折回去

```vue
<script setup lang="ts">
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormErrorSummary,
  XhFormErrorSummaryItem,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const model = ref({
  user: { name: "", email: "" },
  hobbies: [{ hobby: "" }, { hobby: "" }],
});
const submitted = ref("（还没提交过）");

// 路径名的派生规则只此一处：模板、校验、摘要都读它
function hobbyName(index: number) {
  return `hobbies[${index}].hobby`;
}

// 校验不看入参，直接读宿主的嵌套模型；返回的键就是那几条路径
function validate() {
  const errors: Record<string, string> = {
    "user.name": model.value.user.name.trim() ? "" : "姓名不能为空",
    "user.email": model.value.user.email.includes("@") ? "" : "邮箱要带一个 @",
  };
  model.value.hobbies.forEach((row, index) => {
    errors[hobbyName(index)] = row.hobby.trim() ? "" : "爱好不能为空";
  });
  return errors;
}

function onSubmit() {
  submitted.value = JSON.stringify(model.value);
}
</script>

<template>
  <XhFormRoot :validate="validate" style="inline-size: 320px;" @submit="onSubmit">
    <!-- 摘要条目按路径名指过去，点一下焦点落进对应的字段容器 -->
    <XhFormErrorSummary v-slot="{ errorCount }">
      <span>共 {{ errorCount }} 处需要修改</span>
      <XhFormErrorSummaryItem v-slot="{ error }" value="user.name">姓名：{{ error }}</XhFormErrorSummaryItem>
      <XhFormErrorSummaryItem v-slot="{ error }" value="user.email">邮箱：{{ error }}</XhFormErrorSummaryItem>
      <template v-for="(row, index) in model.hobbies" :key="index">
        <XhFormErrorSummaryItem v-slot="{ error }" :value="hobbyName(index)">
          爱好 {{ index + 1 }}：{{ error }}
        </XhFormErrorSummaryItem>
      </template>
    </XhFormErrorSummary>

    <XhFormFieldGroup v-slot="{ error, invalid }" value="user.name">
      <XhFieldRoot :invalid="invalid" required>
        <XhFieldLabel>姓名</XhFieldLabel>
        <XhFieldControl>
          <!-- 控件直接绑在嵌套模型上，值不经过表单的值表 -->
          <input v-model="model.user.name">
        </XhFieldControl>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <XhFormFieldGroup v-slot="{ error, invalid }" value="user.email">
      <XhFieldRoot :invalid="invalid" required>
        <XhFieldLabel>邮箱</XhFieldLabel>
        <XhFieldControl>
          <input v-model="model.user.email" type="email">
        </XhFieldControl>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <template v-for="(row, index) in model.hobbies" :key="index">
      <XhFormFieldGroup v-slot="{ error, invalid }" :value="hobbyName(index)">
        <XhFieldRoot :invalid="invalid" required>
          <XhFieldLabel>爱好 {{ index + 1 }}</XhFieldLabel>
          <XhFieldControl>
            <input v-model="row.hobby">
          </XhFieldControl>
          <XhFieldErrorText>{{ error }}</XhFieldErrorText>
        </XhFieldRoot>
      </XhFormFieldGroup>
    </template>

    <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
    <p style="margin: 0; font-size: 13px;">已提交：{{ submitted }}</p>
  </XhFormRoot>
</template>
```

```html
<xh-form id="form-nested">
  <form data-xh-part="root" style="inline-size: 320px">
    <!-- 摘要条目按路径名指过去，点一下焦点落进对应的字段容器 -->
    <div data-xh-part="error-summary">
      <span id="form-nested-count">共 0 处需要修改</span>
      <a data-xh-part="error-summary-item" value="user.name"></a>
      <a data-xh-part="error-summary-item" value="user.email"></a>
      <a data-xh-part="error-summary-item" value="hobbies[0].hobby"></a>
      <a data-xh-part="error-summary-item" value="hobbies[1].hobby"></a>
    </div>

    <div data-xh-part="field-group" value="user.name">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">姓名</label>
          <!-- 控件直接绑在嵌套模型上，值不经过表单的值表 -->
          <input data-xh-part="control" data-path="user.name" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" value="user.email">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">邮箱</label>
          <input data-xh-part="control" type="email" data-path="user.email" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" value="hobbies[0].hobby">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">爱好 1</label>
          <input data-xh-part="control" data-path="hobbies[0].hobby" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" value="hobbies[1].hobby">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">爱好 2</label>
          <input data-xh-part="control" data-path="hobbies[1].hobby" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <button data-xh-part="submit-trigger">提交</button>
    <p id="form-nested-submitted" style="margin: 0; font-size: 13px">已提交：（还没提交过）</p>
  </form>
</xh-form>

<script type="module">
  const host = document.getElementById("form-nested");
  const count = document.getElementById("form-nested-count");
  const submitted = document.getElementById("form-nested-submitted");

  const model = {
    user: { name: "", email: "" },
    hobbies: [{ hobby: "" }, { hobby: "" }],
  };

  // 路径名的派生规则只此一处：标记、校验、摘要都读它
  const hobbyName = (index) => `hobbies[${index}].hobby`;

  // 校验不看入参，直接读宿主的嵌套模型；返回的键就是那几条路径
  host.validate = () => {
    const errors = {
      "user.name": model.user.name.trim() ? "" : "姓名不能为空",
      "user.email": model.user.email.includes("@") ? "" : "邮箱要带一个 @",
    };
    model.hobbies.forEach((row, index) => {
      errors[hobbyName(index)] = row.hobby.trim() ? "" : "爱好不能为空";
    });
    return errors;
  };

  const groups = [...host.querySelectorAll('[data-xh-part="field-group"]')];
  const labels = {
    "user.name": "姓名",
    "user.email": "邮箱",
    "hobbies[0].hobby": "爱好 1",
    "hobbies[1].hobby": "爱好 2",
  };

  // 控件写回的是模型上的那一格，不经表单
  for (const group of groups) {
    const input = group.querySelector('[data-xh-part="control"]');
    const path = input.dataset.path;
    input.addEventListener("input", () => {
      if (path.startsWith("user.")) model.user[path.slice(5)] = input.value;
      else model.hobbies[Number(path.slice(8, 9))].hobby = input.value;
    });
  }

  host.addEventListener("errors-change", (event) => {
    const errors = event.detail.errors;
    for (const group of groups)
      group.querySelector('[data-xh-part="error-text"]').textContent
        = errors[group.getAttribute("value")] ?? "";
    for (const item of host.querySelectorAll('[data-xh-part="error-summary-item"]')) {
      const name = item.getAttribute("value");
      item.textContent = errors[name] ? `${labels[name]}：${errors[name]}` : "";
    }
    count.textContent = `共 ${Object.keys(errors).length} 处需要修改`;
  });

  host.addEventListener("submit", () => {
    submitted.textContent = `已提交：${JSON.stringify(model)}`;
  });
</script>
```

### 重置回默认值

复合控件的值攥在组件里，原生重置只还原原生控件——它们各自认这条事件，一起回到 defaultValue

```vue
<script setup lang="ts">
import {
  XhButton,
  XhCheckbox,
  XhRadioGroupItem,
  XhRadioGroupRoot,
  XhRatingControl,
  XhRatingItem,
  XhRatingRoot,
  XhSwitch,
} from "@xihan-ui/vue";
import { ref } from "vue";

const submitted = ref("");

function onSubmit(event: Event) {
  const data = new FormData(event.target as HTMLFormElement);
  submitted.value = [...data.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .join("  ") || "（空）";
}
</script>

<template>
  <form style="display: grid; gap: 12px" @submit.prevent="onSubmit">
    <label>
      套餐
      <XhRadioGroupRoot name="plan" default-value="standard">
        <XhRadioGroupItem value="standard">标准</XhRadioGroupItem>
        <XhRadioGroupItem value="pro">专业</XhRadioGroupItem>
      </XhRadioGroupRoot>
    </label>

    <label>
      评分
      <XhRatingRoot name="score" :default-value="3" :count="5">
        <XhRatingControl>
          <XhRatingItem v-for="i in 5" :key="i" :value="i" />
        </XhRatingControl>
      </XhRatingRoot>
    </label>

    <!-- 原生输入框做对照：它靠 value 这个内容属性还原，组件靠自己的 defaultValue -->
    <label>备注 <input name="note" value="默认备注"></label>

    <label><XhCheckbox name="agree" default-checked /> 已阅读条款</label>
    <label><XhSwitch name="notify" /> 接收通知</label>

    <div style="display: flex; gap: 8px">
      <XhButton type="submit" size="sm">提交</XhButton>
      <!-- 原生 reset：组件与旁边那个原生输入框会一起回到各自的默认值 -->
      <XhButton type="reset" size="sm" variant="outline">重置</XhButton>
    </div>

    <span v-if="submitted">表单收到：{{ submitted }}</span>
  </form>
</template>
```

```html
<form id="form-reset" style="display: grid; gap: 12px">
  <label>
    套餐
    <xh-radio-group name="plan" default-value="standard">
      <div data-xh-part="root">
        <div data-xh-part="item" value="standard">
          <input data-xh-part="hidden-input" />
          <span data-xh-part="indicator"></span>
          <span data-xh-part="item-text">标准</span>
        </div>
        <div data-xh-part="item" value="pro">
          <input data-xh-part="hidden-input" />
          <span data-xh-part="indicator"></span>
          <span data-xh-part="item-text">专业</span>
        </div>
      </div>
    </xh-radio-group>
  </label>

  <label>
    评分
    <xh-rating name="score" default-value="3" count="5">
      <div data-xh-part="root">
        <div data-xh-part="control">
          <span data-xh-part="item" value="1">★</span>
          <span data-xh-part="item" value="2">★</span>
          <span data-xh-part="item" value="3">★</span>
          <span data-xh-part="item" value="4">★</span>
          <span data-xh-part="item" value="5">★</span>
        </div>
        <input data-xh-part="hidden-input" />
      </div>
    </xh-rating>
  </label>

  <!-- 原生输入框做对照：它靠 value 这个内容属性还原，组件靠自己的 defaultValue -->
  <label>备注 <input name="note" value="默认备注" /></label>

  <label>
    <xh-checkbox name="agree" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="indicator"></span>
        <input data-xh-part="hidden-input" />
      </button>
    </xh-checkbox>
    已阅读条款
  </label>

  <label>
    <xh-switch name="notify">
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
        <input data-xh-part="hidden-input" />
      </button>
    </xh-switch>
    接收通知
  </label>

  <div style="display: flex; gap: 8px">
    <xh-button type="submit" size="sm">
      <button data-xh-part="root">提交</button>
    </xh-button>
    <!-- 原生 reset：组件与旁边那个原生输入框会一起回到各自的默认值 -->
    <xh-button type="reset" size="sm" variant="outline">
      <button data-xh-part="root">重置</button>
    </xh-button>
  </div>

  <span id="form-reset-result"></span>
</form>

<script type="module">
  const form = document.getElementById("form-reset");
  const result = document.getElementById("form-reset-result");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = [...new FormData(form).entries()].map(([k, v]) => `${k}=${v}`);
    result.textContent = `表单收到：${fields.length ? fields.join("  ") : "（空）"}`;
  });
</script>
```

### 声明式规则

rules 按字段声明 required/min/max/pattern/type，一个字段多条规则首败即停；文案取 rule.message，再退 validateMessages 模板（{name}/{min}/{max} 现场代入）。组里的字段自取校验态：invalid 与必填星号都不用手接

```vue
<script setup lang="ts">
import type { FormRules, FormValidateMessages } from "@xihan-ui/headless";
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const rules: FormRules = {
  username: [
    { required: true, message: "用户名不能为空" },
    { min: 3, max: 12 },
    { pattern: /^[a-z][a-z0-9-]*$/i, message: "只能用字母、数字与连字符，且以字母开头" },
  ],
  email: [
    { required: true, message: "邮箱不能为空" },
    { type: "email", message: "这不是一个合法邮箱" },
  ],
  age: { type: "integer", min: 1, max: 150 },
};

// 模板统一改成中文；rule.message 写了的仍然赢过它
const validateMessages: FormValidateMessages = {
  minLength: "{name} 至少 {min} 个字符",
  maxLength: "{name} 不能超过 {max} 个字符",
  minNumber: "{name} 不能小于 {min}",
  maxNumber: "{name} 不能大于 {max}",
  type: { integer: "{name} 得是整数" },
};

const fields = [
  { name: "username", label: "用户名", placeholder: "3-12 位，字母开头" },
  { name: "email", label: "邮箱", placeholder: "you@example.com" },
  { name: "age", label: "年龄", placeholder: "选填" },
];

const submitted = ref("（还没提交过）");

function onSubmit(details: { values: Record<string, unknown> }) {
  submitted.value = JSON.stringify(details.values);
}
</script>

<template>
  <XhFormRoot
    :default-values="{ username: '', email: '', age: '' }"
    :rules="rules"
    :validate-messages="validateMessages"
    style="inline-size: 320px; display: grid; gap: 12px"
    @submit="onSubmit"
  >
    <XhFormFieldGroup
      v-for="f in fields"
      :key="f.name"
      v-slot="{ value, setValue }"
      :value="f.name"
    >
      <!-- Field 不接任何校验 props：invalid、必填星号与错误文案全部从表单上下文自取 -->
      <XhFieldRoot>
        <XhFieldLabel>{{ f.label }}</XhFieldLabel>
        <XhFieldControl>
          <input
            :placeholder="f.placeholder"
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          >
        </XhFieldControl>
        <XhFieldErrorText />
      </XhFieldRoot>
    </XhFormFieldGroup>

    <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
    <p style="margin: 0; font-size: 13px">已提交：{{ submitted }}</p>
  </XhFormRoot>
</template>
```

```html
<xh-form id="form-rules">
  <form data-xh-part="root" style="inline-size: 320px; display: grid; gap: 12px">
    <!-- 字段不接任何校验属性：invalid 与必填星号由表单驱动 -->
    <div data-xh-part="field-group" value="username">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">用户名</label>
          <input data-xh-part="control" placeholder="3-12 位，字母开头" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" value="email">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">邮箱</label>
          <input data-xh-part="control" placeholder="you@example.com" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" value="age">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">年龄</label>
          <input data-xh-part="control" placeholder="选填" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <button data-xh-part="submit-trigger">提交</button>
    <p id="form-rules-submitted" style="margin: 0; font-size: 13px">已提交：（还没提交过）</p>
  </form>
</xh-form>

<script type="module">
  const host = document.getElementById("form-rules");
  const submitted = document.getElementById("form-rules-submitted");

  const defaults = { username: "", email: "", age: "" };
  let values = { ...defaults };

  host.rules = {
    username: [
      { required: true, message: "用户名不能为空" },
      { min: 3, max: 12 },
      { pattern: /^[a-z][a-z0-9-]*$/i, message: "只能用字母、数字与连字符，且以字母开头" },
    ],
    email: [
      { required: true, message: "邮箱不能为空" },
      { type: "email", message: "这不是一个合法邮箱" },
    ],
    age: { type: "integer", min: 1, max: 150 },
  };

  // 模板统一改成中文；rule.message 写了的仍然赢过它
  host.validateMessages = {
    minLength: "{name} 至少 {min} 个字符",
    maxLength: "{name} 不能超过 {max} 个字符",
    minNumber: "{name} 不能小于 {min}",
    maxNumber: "{name} 不能大于 {max}",
    type: { integer: "{name} 得是整数" },
  };

  host.defaultValues = defaults;
  host.values = values;

  const groups = [...host.querySelectorAll('[data-xh-part="field-group"]')];
  const nameOf = (el) => el.getAttribute("value");

  for (const group of groups) {
    const input = group.querySelector('[data-xh-part="control"]');
    input.addEventListener("input", () => host.setFieldValue(nameOf(group), input.value));
  }

  host.addEventListener("values-change", (event) => {
    values = event.detail.values;
    host.values = values;
    for (const group of groups) {
      const input = group.querySelector('[data-xh-part="control"]');
      const next = String(values[nameOf(group)] ?? "");
      if (input.value !== next) input.value = next;
    }
  });

  host.addEventListener("errors-change", (event) => {
    for (const group of groups)
      group.querySelector('[data-xh-part="error-text"]').textContent
        = event.detail.errors[nameOf(group)] ?? "";
  });

  host.addEventListener("submit", (event) => {
    submitted.textContent = `已提交：${JSON.stringify(event.detail.values)}`;
  });
</script>
```

### 排布

layout 四档：vertical 竖排（默认）、horizontal 标签左置两列（labelWidth 统一列宽、labelAlign 换对齐缘）、inline 横排一行流、grid 等宽列的网格（columns 给列数）；整表排布一个开关搞定，不必逐字段写栅格

```vue
<script setup lang="ts">
import type { FormLayout } from "@xihan-ui/headless";
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const layout = ref<FormLayout>("horizontal");
const layouts: FormLayout[] = ["vertical", "horizontal", "inline", "grid"];

const fields = [
  { name: "username", label: "用户名", placeholder: "字母开头" },
  { name: "email", label: "邮箱", placeholder: "you@example.com" },
  { name: "city", label: "所在城市", placeholder: "选填" },
];

const rules = {
  username: { required: true, message: "用户名不能为空" },
  email: { required: true, message: "邮箱不能为空" },
};
</script>

<template>
  <div style="display: grid; gap: 16px; justify-items: start">
    <label style="display: flex; gap: 8px; align-items: center; font-size: 13px">
      排布
      <select v-model="layout">
        <option v-for="l in layouts" :key="l" :value="l">{{ l }}</option>
      </select>
    </label>

    <XhFormRoot
      :layout="layout"
      :columns="{ base: 1, md: 2 }"
      :label-width="96"
      :rules="rules"
      :default-values="{ username: '', email: '', city: '' }"
      style="inline-size: 100%; max-inline-size: 460px"
    >
      <XhFormFieldGroup
        v-for="f in fields"
        :key="f.name"
        v-slot="{ value, setValue }"
        :value="f.name"
      >
        <XhFieldRoot>
          <XhFieldLabel>{{ f.label }}</XhFieldLabel>
          <XhFieldControl>
            <input
              :placeholder="f.placeholder"
              :value="value"
              @input="setValue(($event.target as HTMLInputElement).value)"
            >
          </XhFieldControl>
          <XhFieldErrorText />
        </XhFieldRoot>
      </XhFormFieldGroup>

      <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
    </XhFormRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px; justify-items: start">
  <label style="display: flex; gap: 8px; align-items: center; font-size: 13px">
    排布
    <select id="form-layout-picker">
      <option value="vertical">vertical</option>
      <option value="horizontal" selected>horizontal</option>
      <option value="inline">inline</option>
      <option value="grid">grid</option>
    </select>
  </label>

  <xh-form
    id="form-layout"
    layout="horizontal"
    columns='{"base":1,"md":2}'
    label-width="96px"
  >
    <form data-xh-part="root" style="inline-size: 100%; max-inline-size: 460px">
      <div data-xh-part="field-group" value="username">
        <xh-field>
          <div data-xh-part="root">
            <label data-xh-part="label">用户名</label>
            <input data-xh-part="control" placeholder="字母开头" />
            <p data-xh-part="error-text"></p>
          </div>
        </xh-field>
      </div>

      <div data-xh-part="field-group" value="email">
        <xh-field>
          <div data-xh-part="root">
            <label data-xh-part="label">邮箱</label>
            <input data-xh-part="control" placeholder="you@example.com" />
            <p data-xh-part="error-text"></p>
          </div>
        </xh-field>
      </div>

      <div data-xh-part="field-group" value="city">
        <xh-field>
          <div data-xh-part="root">
            <label data-xh-part="label">所在城市</label>
            <input data-xh-part="control" placeholder="选填" />
            <p data-xh-part="error-text"></p>
          </div>
        </xh-field>
      </div>

      <button data-xh-part="submit-trigger">提交</button>
    </form>
  </xh-form>
</div>

<script type="module">
  const host = document.getElementById("form-layout");
  const picker = document.getElementById("form-layout-picker");

  const defaults = { username: "", email: "", city: "" };
  let values = { ...defaults };

  host.rules = {
    username: { required: true, message: "用户名不能为空" },
    email: { required: true, message: "邮箱不能为空" },
  };
  host.defaultValues = defaults;
  host.values = values;

  const groups = [...host.querySelectorAll('[data-xh-part="field-group"]')];
  const nameOf = (el) => el.getAttribute("value");

  for (const group of groups) {
    const input = group.querySelector('[data-xh-part="control"]');
    input.addEventListener("input", () => host.setFieldValue(nameOf(group), input.value));
  }

  host.addEventListener("values-change", (event) => {
    values = event.detail.values;
    host.values = values;
    for (const group of groups) {
      const input = group.querySelector('[data-xh-part="control"]');
      const next = String(values[nameOf(group)] ?? "");
      if (input.value !== next) input.value = next;
    }
  });

  host.addEventListener("errors-change", (event) => {
    for (const group of groups)
      group.querySelector('[data-xh-part="error-text"]').textContent
        = event.detail.errors[nameOf(group)] ?? "";
  });

  // 换一档排布就是换一个属性，字段标记一个字都不用动
  picker.addEventListener("change", () => {
    host.layout = picker.value;
  });
</script>
```

### 网格排布

columns 给列数、窄视口自动收成一列；字段自报 span 跨列，span="full" 占满整行且跟着当下列数走

```vue
<script setup lang="ts">
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";

const fields = [
  { name: "name", label: "姓名", placeholder: "必填" },
  { name: "phone", label: "手机号", placeholder: "11 位数字" },
  { name: "company", label: "公司", placeholder: "选填" },
  { name: "title", label: "职位", placeholder: "选填" },
  { name: "address", label: "通讯地址", placeholder: "选填", span: "full" as const },
];

const rules = {
  name: { required: true, message: "姓名不能为空" },
  phone: { required: true, message: "手机号不能为空" },
};
</script>

<template>
  <XhFormRoot
    layout="grid"
    :columns="{ base: 1, md: 2 }"
    :rules="rules"
    :default-values="{ name: '', phone: '', company: '', title: '', address: '' }"
    style="inline-size: 100%"
  >
    <XhFormFieldGroup
      v-for="f in fields"
      :key="f.name"
      v-slot="{ value, setValue }"
      :value="f.name"
      :span="f.span"
    >
      <XhFieldRoot>
        <XhFieldLabel>{{ f.label }}</XhFieldLabel>
        <XhFieldControl>
          <input
            :placeholder="f.placeholder"
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          >
        </XhFieldControl>
        <XhFieldErrorText />
      </XhFieldRoot>
    </XhFormFieldGroup>

    <!-- 按钮不是字段，它是网格里的普通一格：想让它自己占一行就写 grid-column -->
    <XhFormSubmitTrigger style="grid-column: 1 / -1; justify-self: start">
      提交
    </XhFormSubmitTrigger>
  </XhFormRoot>
</template>
```

```html
<xh-form id="form-grid" layout="grid" columns='{"base":1,"md":2}'>
  <form data-xh-part="root" style="inline-size: 100%">
    <div data-xh-part="field-group" value="name">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">姓名</label>
          <input data-xh-part="control" placeholder="必填" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" value="phone">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">手机号</label>
          <input data-xh-part="control" placeholder="11 位数字" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" value="company">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">公司</label>
          <input data-xh-part="control" placeholder="选填" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" value="title">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">职位</label>
          <input data-xh-part="control" placeholder="选填" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" value="address" span="full">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">通讯地址</label>
          <input data-xh-part="control" placeholder="选填" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <!-- 按钮不是字段，它是网格里的普通一格：想让它自己占一行就写 grid-column -->
    <button data-xh-part="submit-trigger" style="grid-column: 1 / -1; justify-self: start">
      提交
    </button>
  </form>
</xh-form>

<script type="module">
  const host = document.getElementById("form-grid");

  const defaults = { name: "", phone: "", company: "", title: "", address: "" };
  let values = { ...defaults };

  host.rules = {
    name: { required: true, message: "姓名不能为空" },
    phone: { required: true, message: "手机号不能为空" },
  };
  host.defaultValues = defaults;
  host.values = values;

  const groups = [...host.querySelectorAll('[data-xh-part="field-group"]')];
  const nameOf = (el) => el.getAttribute("value");

  for (const group of groups) {
    const input = group.querySelector('[data-xh-part="control"]');
    input.addEventListener("input", () => host.setFieldValue(nameOf(group), input.value));
  }

  host.addEventListener("values-change", (event) => {
    values = event.detail.values;
    host.values = values;
    for (const group of groups) {
      const input = group.querySelector('[data-xh-part="control"]');
      const next = String(values[nameOf(group)] ?? "");
      if (input.value !== next) input.value = next;
    }
  });

  host.addEventListener("errors-change", (event) => {
    for (const group of groups)
      group.querySelector('[data-xh-part="error-text"]').textContent
        = event.detail.errors[nameOf(group)] ?? "";
  });
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-form>` |
| Vue 组件 | `XhFormErrorSummary` `XhFormErrorSummaryItem` `XhFormFieldGroup` `XhFormResetTrigger` `XhFormRoot` `XhFormSubmitTrigger` |
| 组合式函数 | `useForm` |
| 状态机 | `formMachine` |
| 皮肤 | `@xihan-ui/styles/form.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="form"`：**`root`** · `field-group` · `error-summary` · `error-summary-item` · `submit-trigger` · `reset-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `values` | `FormValues` |  | 受控值表；给定即受控：cell 直读 prop，写只发 onValuesChange 不落内部值。 |
| `defaultValues` | `FormValues` |  | 非受控初值，同时也是 reset 的落点。 |
| `errors` | `FormErrorPatch` |  | 受控错误表；给定即受控。空串会被清理掉（空串不是一条错误）。 |
| `defaultErrors` | `FormErrorPatch` |  |  |
| `validate` | `(values: FormValues) => FormErrorPatch \| Promise<FormErrorPatch>` |  | 校验函数。返回「字段名 → 错误文案」，没错的字段给空串或干脆不写； 允许返回 Promise（远程校验），期间 validating 置真。 与 rules 并用时同字段两边都报错按 rules 的文案算。 |
| `rules` | `FormRules` |  | 声明式校验规则：字段名 → 一条或一组规则，与 validate 可并用。 |
| `validateMessages` | `FormValidateMessages` |  | 规则文案模板，{name}/{min}/{max} 现场代入；缺省用内置英文模板。 |
| `validateOn` | `FormValidateOn` |  | 校验时机，默认 submit。 |
| `layout` | `FormLayout` |  | 排布，默认 vertical。 |
| `columns` | `FormColumns` |  | grid 排布下分几列：1 至 4 的整数，不写按一列排；范围外的值也按一列排。 也收断点对象 `{ base, sm, md, lg, xl }`，逐档写各自的列数，没写的档沿用比它窄的那一档。 其余三档排布下不参与排版。 |
| `labelWidth` | `number \| string` |  | horizontal 下标签列宽（number 视作 px），整表统一、字段据此对齐。 |
| `labelAlign` | `'start' \| 'end'` |  | horizontal 下标签文字的对齐缘，默认 end（贴着控件）。 |
| `disabled` | `boolean` |  | 整个表单禁用：提交、重置、写值一概不发生，两颗按钮带原生 disabled。 |
| `readOnly` | `boolean` |  | 只读：写值与重置不发生，但仍可提交。 |
| `onValuesChange` | `(details: FormValuesChangeDetails) => void` |  | 值表变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onErrorsChange` | `(details: FormErrorsChangeDetails) => void` |  | 错误表变化意图回调；受控时是唯一出口。 |
| `onSubmit` | `(details: FormSubmitDetails) => void` |  | 校验通过才调。 |
| `onInvalid` | `(details: FormInvalidDetails) => void` |  | 校验不通过时调，带上拦下来的整张错误表。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `values-change` | `FormValuesChangeDetails` | 值表变化；detail 为 `{ values }` |
| `errors-change` | `FormErrorsChangeDetails` | 错误表变化；detail 为 `{ errors }` |
| `submit` | `FormSubmitDetails` | 校验通过才派发；detail 为 `{ values }` |
| `invalid` | `FormInvalidDetails` | 校验不通过时派发；detail 为 `{ errors, values }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFormErrorSummary` | `default` | `FormErrorSummarySlotProps` |  |
| `XhFormErrorSummaryItem` | `default` | `FormErrorSummaryItemSlotProps` |  |
| `XhFormFieldGroup` | `default` | `FormFieldGroupSlotProps` |  |
| `XhFormRoot` | `default` | `FormRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'invalid' \| 'idle' |
| `error-summary` | 'invalid' \| 'idle' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `invalid`

**事件**：`SUBMIT` · `RESET` · `VALIDATION.PASS` · `VALIDATION.FAIL` · `FIELD.SET` · `FIELD.BLUR` · `ERROR.SET` · `ERRORS.CLEAR` · `ERROR.FOCUS`

**判据**：`isEnabled` · `isEditable`

## connect API

`useForm` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `values` | `FormValues` | 当下的值表。 |
| `errors` | `FormErrors` | 当下的错误表（已清理）。 |
| `errorNames` | `string[]` | 出错的字段名，插入顺序。 |
| `errorCount` | `number` |  |
| `invalid` | `boolean` | 错误表非空。与"提交失败过"无关，挂载时作者塞进来的错误也算。 |
| `submitFailed` | `boolean` | 上一次提交被拦下了：错误摘要据此显形。 |
| `validating` | `boolean` | 异步校验进行中（提交或逐字段都算）。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `validateOn` | `FormValidateOn` |  |
| `layout` | `FormLayout` | 当下的排布档。 |
| `getFieldId` | `(name: string) => string` | 字段容器的 DOM id；错误摘要的链接指向它。 |
| `getFieldValue` | `(name: string) => unknown` |  |
| `getFieldError` | `(name: string) => string \| undefined` | 该字段此刻的错误文案；没错时为 undefined。 |
| `isFieldInvalid` | `(name: string) => boolean` |  |
| `isFieldRequired` | `(name: string) => boolean` | 该字段的规则里声明了 required：字段的必填标记从这里推。 |
| `setFieldValue` | `(name: string, value: unknown) => void` | 写一个字段的值；禁用或只读时不动。 |
| `setFieldError` | `(name: string, message?: string) => void` | 写一个字段的错误；不给文案（或给空串）即清掉这一条。 |
| `clearErrors` | `() => void` |  |
| `submit` | `() => void` | 走完整的校验与提交流程，与用户按提交键同一条路。 |
| `reset` | `() => void` | 值与错误都回到初始；禁用或只读时不动。 |
| `getRootProps` | `() => T['element']` |  |
| `getFieldGroupProps` | `(props: FormFieldGroupProps) => T['element']` |  |
| `getErrorSummaryProps` | `() => T['element']` |  |
| `getErrorSummaryItemProps` | `(props: FormErrorSummaryItemProps) => T['element']` |  |
| `getSubmitTriggerProps` | `() => T['button']` |  |
| `getResetTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `error-summary` | `aria-atomic` | 'true' |
| `error-summary` | `aria-live` | 'assertive' |
| `error-summary` | `role` | 'alert' |

## 样式

默认皮肤 `@xihan-ui/styles/form.css` 按部件选择：`[data-scope="form"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-columns` | columns.base |
| `root` | `data-columns-lg` | columns.lg |
| `root` | `data-columns-md` | columns.md |
| `root` | `data-columns-sm` | columns.sm |
| `root` | `data-columns-xl` | columns.xl |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-label-align` | props.labelAlign |
| `root` | `data-layout` | props.layout |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-state` | 'invalid' \| 'idle' |
| `field-group` | `data-disabled` | ''（条件成立时才出现） |
| `field-group` | `data-invalid` | ''（条件成立时才出现） |
| `field-group` | `data-readonly` | ''（条件成立时才出现） |
| `field-group` | `data-span` | fieldSpan(field.span) |
| `error-summary` | `data-count` | String(errorCount) |
| `error-summary` | `data-state` | 'invalid' \| 'idle' |
| `error-summary-item` | `data-invalid` | ''（条件成立时才出现） |
| `submit-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `reset-trigger` | `data-disabled` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-form-field-gap` · `--xh-form-field-invalid-border` · `--xh-form-field-invalid-px` · `--xh-form-gap` · `--xh-form-inline-gap` · `--xh-form-submit-bg` · `--xh-form-submit-bg-active` · `--xh-form-submit-bg-hover` · `--xh-form-submit-border` · `--xh-form-submit-border-active` · `--xh-form-submit-border-hover` · `--xh-form-submit-fg` · `--xh-form-submit-shadow` · `--xh-form-summary-bg` · `--xh-form-summary-border` · `--xh-form-summary-fg` · `--xh-form-summary-font-size` · `--xh-form-summary-gap` · `--xh-form-summary-item-fg-hover` · `--xh-form-summary-item-font-size` · `--xh-form-summary-item-underline-offset` · `--xh-form-summary-px` · `--xh-form-summary-py` · `--xh-form-summary-radius` · `--xh-form-summary-shadow` · `--xh-form-trigger-bg` · `--xh-form-trigger-bg-active` · `--xh-form-trigger-bg-disabled` · `--xh-form-trigger-bg-hover` · `--xh-form-trigger-border` · `--xh-form-trigger-border-disabled` · `--xh-form-trigger-border-hover` · `--xh-form-trigger-fg` · `--xh-form-trigger-font-size` · `--xh-form-trigger-h` · `--xh-form-trigger-px` · `--xh-form-trigger-radius`

## 动效

关键帧 `xh-form-summary-enter` 随皮肤自带，不引用别处文件里的名字；`background` · `box-shadow` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤按视口分档：`min-width: 1024px` · `min-width: 1280px` · `min-width: 640px` · `min-width: 768px`。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 每格用[表单字段](./field)；分步表单与[步骤条](./steps)配合；行数可变的段落用[字段数组](./field-array)。

## 最佳实践

- 首次校验放在失焦而不是输入时：边打字边报红会让用户觉得自己一直在犯错。
- 提交失败后把焦点移到错误汇总或第一个出错字段。

## 反模式

- 提交按钮长期禁用直到全部合法：用户不知道还差什么。让他按下去，然后告诉他哪里不对。
- 校验规则只写在前端。

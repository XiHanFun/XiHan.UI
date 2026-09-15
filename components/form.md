来源：https://ui.docs.xihanfun.com/components/form

# Form 表单 `alpha`

管理一组字段的值、校验、提交和重置。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/form" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/form.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/form" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/form" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/form.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

提交并校验表单

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

function validate(values: Record<string, unknown>) {
  return {
    email: String(values.email ?? "").includes("@") ? "" : "邮箱要带一个 @",
    nickname: String(values.nickname ?? "").trim() ? "" : "昵称不能为空",
  };
}
</script>

<template>
  <XhFormRoot
    :default-values="{ email: '', nickname: '' }"
    :validate="validate"
    style="inline-size: 320px;"
  >
    <XhFormErrorSummary v-slot="{ errorCount }">
      <span>共 {{ errorCount }} 处需要修改</span>
      <XhFormErrorSummaryItem v-slot="{ error }" name="email">{{ error }}</XhFormErrorSummaryItem>
      <XhFormErrorSummaryItem v-slot="{ error }" name="nickname">{{ error }}</XhFormErrorSummaryItem>
    </XhFormErrorSummary>

    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" name="email">
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

    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" name="nickname">
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
  </XhFormRoot>
</template>
```

```html
<xh-form id="form-basic">
  <form data-xh-part="root" style="inline-size: 320px">
    <div data-xh-part="error-summary">
      <span id="form-basic-count">共 0 处需要修改</span>
      <a data-xh-part="error-summary-item" name="email"></a>
      <a data-xh-part="error-summary-item" name="nickname"></a>
    </div>

    <div data-xh-part="field-group" name="email">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">邮箱</label>
          <input data-xh-part="control" type="email" placeholder="you@example.com" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" name="nickname">
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
  </form>
</xh-form>

<script type="module">
  const host = document.getElementById("form-basic");
  const count = document.getElementById("form-basic-count");

  const defaults = { email: "", nickname: "" };
  let values = { ...defaults };

  host.validate = (source) => ({
    email: String(source.email ?? "").includes("@") ? "" : "邮箱要带一个 @",
    nickname: String(source.nickname ?? "").trim() ? "" : "昵称不能为空",
  });
  host.defaultValues = defaults;
  host.values = values;

  const groups = [...host.querySelectorAll('[data-xh-part="field-group"]')];
  const nameOf = (el) => el.getAttribute("name");

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

  syncControls();
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="form"`：**`root`** · `field-group` · `error-summary` · `error-summary-item` · `submit-trigger` · `reset-trigger`

## 示例

### 校验时机

在失焦或输入时校验

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
    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" name="port">
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
    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" name="port">
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
    <div data-xh-part="field-group" name="port">
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
    <div data-xh-part="field-group" name="port">
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

### 状态

禁用与只读表单

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
</script>

<template>
  <XhFormRoot disabled :default-values="{ token: 'xh-0f2a' }" style="inline-size: 260px;">
    <XhFormFieldGroup v-slot="{ value, setValue }" name="token">
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

  <XhFormRoot
    read-only
    :default-values="{ token: 'xh-0f2a' }"
    style="inline-size: 260px;"
  >
    <XhFormFieldGroup v-slot="{ value, setValue }" name="token">
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
</template>
```

```html
<xh-form id="form-disabled" disabled>
  <form data-xh-part="root" style="inline-size: 260px">
    <div data-xh-part="field-group" name="token">
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

<xh-form id="form-readonly" read-only>
  <form data-xh-part="root" style="inline-size: 260px">
    <div data-xh-part="field-group" name="token">
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


<script type="module">

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

    input.value = String(values.token ?? "");
  }

  wire("form-disabled");
  wire("form-readonly");
</script>
```

### 异步校验

提交前检查用户名

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

const taken = ["admin", "root", "xihan"];

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
</script>

<template>
  <XhFormRoot
    v-slot="{ validating }"
    :default-values="{ username: '' }"
    :rules="rules"
    style="inline-size: 320px"
  >
    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" name="username">
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
  </XhFormRoot>
</template>
```

```html
<xh-form id="form-async">
  <form data-xh-part="root" style="inline-size: 320px; display: grid; gap: 12px">
    <div data-xh-part="field-group" name="username">
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
  </form>
</xh-form>

<script type="module">
  const host = document.getElementById("form-async");
  const input = host.querySelector('[data-xh-part="control"]');
  // 部件节点上的 id 由组件自己派生，别写自己的：查它们一律按角色名
  const hint = host.querySelector('[data-xh-part="description"]');
  const error = host.querySelector('[data-xh-part="error-text"]');
  const submit = document.getElementById("form-async-submit");

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
  host.addEventListener("submit", () => {
    setBusy(false);
  });
  host.addEventListener("invalid", () => setBusy(false));
</script>
```

### 声明式规则

配置字段校验规则

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
</script>

<template>
  <XhFormRoot
    :default-values="{ username: '', email: '', age: '' }"
    :rules="rules"
    :validate-messages="validateMessages"
    style="inline-size: 320px; display: grid; gap: 12px"
  >
    <XhFormFieldGroup
      v-for="f in fields"
      :key="f.name"
      v-slot="{ value, setValue }"
      :name="f.name"
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
  </XhFormRoot>
</template>
```

```html
<xh-form id="form-rules">
  <form data-xh-part="root" style="inline-size: 320px; display: grid; gap: 12px">
    <!-- 字段不接任何校验属性：invalid 与必填星号由表单驱动 -->
    <div data-xh-part="field-group" name="username">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">用户名</label>
          <input data-xh-part="control" placeholder="3-12 位，字母开头" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" name="email">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">邮箱</label>
          <input data-xh-part="control" placeholder="you@example.com" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <div data-xh-part="field-group" name="age">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">年龄</label>
          <input data-xh-part="control" placeholder="选填" />
          <p data-xh-part="error-text"></p>
        </div>
      </xh-field>
    </div>

    <button data-xh-part="submit-trigger">提交</button>
  </form>
</xh-form>

<script type="module">
  const host = document.getElementById("form-rules");

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
  const nameOf = (el) => el.getAttribute("name");

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

### 布局

设置纵向、横向、行内或网格布局

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
        :name="f.name"
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
      <div data-xh-part="field-group" name="username">
        <xh-field>
          <div data-xh-part="root">
            <label data-xh-part="label">用户名</label>
            <input data-xh-part="control" placeholder="字母开头" />
            <p data-xh-part="error-text"></p>
          </div>
        </xh-field>
      </div>

      <div data-xh-part="field-group" name="email">
        <xh-field>
          <div data-xh-part="root">
            <label data-xh-part="label">邮箱</label>
            <input data-xh-part="control" placeholder="you@example.com" />
            <p data-xh-part="error-text"></p>
          </div>
        </xh-field>
      </div>

      <div data-xh-part="field-group" name="city">
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
  const nameOf = (el) => el.getAttribute("name");

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

## 设计指引

### 何时使用

- 多个字段需要一起提交或校验。
- 需要统一管理错误信息和校验时机。

### 何时不用

- 只有一个立即生效的控件时直接处理其值。
- 只需要标签、说明和错误信息时使用[表单字段](./field)。

### 特性

- `validateOn` 设置输入、失焦或提交时校验。
- 支持声明式规则、自定义校验和异步校验。
- 字段值、错误和校验状态均可受控。
- 错误汇总可跳转到对应字段。
- 支持纵向、横向、行内和网格布局。
- 嵌套字段与字段数组使用显式 `FormPath`。

### 组合

- 字段用[表单字段](./field)包住控件，成组的用[字段集](./fieldset)分区，数量可变的用[字段数组](./field-array)。
- 提交与重置用[按钮](./button)；错误汇总放在表单顶部，可跳转到对应字段。
- 分步填写时外面套一层[步骤条](./steps)。

### 最佳实践

- 首次校验优先放在失焦或提交时。
- 提交失败后聚焦第一个错误字段。
- 异步校验期间显示明确的加载状态。

### 反模式

- 在用户尚未尝试提交时持续显示全部错误。
- 只在前端执行关键业务校验。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-form>` |
| Vue 组件 | `XhFormErrorSummary` `XhFormErrorSummaryItem` `XhFormFieldGroup` `XhFormResetTrigger` `XhFormRoot` `XhFormSubmitTrigger` |
| 组合式函数 | `useForm` |
| 状态机 | `formMachine` |
| 皮肤 | `@xihan-ui/styles/form.css` |

### Props

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
| `onValidationError` | `(details: FormValidationErrorDetails) => void` |  | 校验器抛错或拒绝 Promise 时调用；不触发 onInvalid 或 onSubmit。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `values-change` | `FormValuesChangeDetails` | 值表变化；detail 为 `{ values }` |
| `errors-change` | `FormErrorsChangeDetails` | 错误表变化；detail 为 `{ errors }` |
| `submit` | `FormSubmitDetails` | 校验通过才派发；detail 为 `{ values }` |
| `invalid` | `FormInvalidDetails` | 校验不通过时派发；detail 为 `{ errors, values }` |
| `validation-error` | `FormValidationErrorDetails` | 校验器执行异常；detail 为 `{ cause, values, field }`，field 为 null 表示整表提交 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFormErrorSummary` | `default` | `FormErrorSummarySlotProps` |  |
| `XhFormErrorSummaryItem` | `default` | `FormErrorSummaryItemSlotProps` |  |
| `XhFormFieldGroup` | `default` | `FormFieldGroupSlotProps` |  |
| `XhFormRoot` | `default` | `FormRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'invalid' \| 'idle' |
| `error-summary` | 'invalid' \| 'idle' |

以下名称仅用于内部状态机。

**状态**：`idle` · `invalid`

**事件**：`SUBMIT` · `RESET` · `VALIDATION.PASS` · `VALIDATION.FAIL` · `FIELD.SET` · `FIELD.ARRAY.MUTATE` · `FIELD.BLUR` · `ERROR.SET` · `ERRORS.CLEAR` · `ERROR.FOCUS`

**判据**：`isEnabled` · `isEditable` · `isValidationSnapshotCurrent`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `values` | `FormValues` | 当下的值表。 |
| `errors` | `FormErrors` | 当下的错误表（已清理）。 |
| `errorNames` | `FormPath[]` | 出错的字段名，插入顺序。 |
| `errorCount` | `number` |  |
| `invalid` | `boolean` | 错误表非空。与"提交失败过"无关，挂载时作者塞进来的错误也算。 |
| `submitFailed` | `boolean` | 上一次提交被拦下了：错误摘要据此显形。 |
| `validating` | `boolean` | 异步校验进行中（提交或逐字段都算）。 |
| `validationError` | `FormValidationErrorDetails \| null` | 校验服务异常；null 表示没有异常，字段错误仍从 errors 读取。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `validateOn` | `FormValidateOn` |  |
| `layout` | `FormLayout` | 当下的排布档。 |
| `getFieldId` | `(name: FormPath) => string` | 字段容器的 DOM id；错误摘要的链接指向它。 |
| `getFieldValue` | `(name: FormPath) => unknown` |  |
| `getFieldError` | `(name: FormPath) => string \| undefined` | 该字段此刻的错误文案；没错时为 undefined。 |
| `isFieldInvalid` | `(name: FormPath) => boolean` |  |
| `isFieldRequired` | `(name: FormPath) => boolean` | 该字段的规则里声明了 required：字段的必填标记从这里推。 |
| `setFieldValue` | `(name: FormPath, value: unknown) => void` | 写一个字段的值；禁用或只读时不动。 |
| `setFieldError` | `(name: FormPath, message?: string) => void` | 写一个字段的错误；不给文案（或给空串）即清掉这一条。 |
| `clearErrors` | `() => void` |  |
| `submit` | `() => void` | 走完整的校验与提交流程，与用户按提交键同一条路。 |
| `reset` | `() => void` | 值与错误都回到初始；禁用或只读时不动。 |
| `getRootProps` | `() => T['element']` |  |
| `getFieldGroupProps` | `(props: FormFieldGroupProps) => T['element']` |  |
| `getErrorSummaryProps` | `() => T['element']` |  |
| `getErrorSummaryItemProps` | `(props: FormErrorSummaryItemProps) => T['element']` |  |
| `getSubmitTriggerProps` | `() => T['button']` |  |
| `getResetTriggerProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `error-summary` | `aria-atomic` | 'true' |
| `error-summary` | `aria-live` | 'assertive' |
| `error-summary` | `role` | 'alert' |

## 样式参考

### 皮肤

`@xihan-ui/styles/form.css` 使用 `[data-scope="form"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

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

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-form-field-gap` | `field-group` | `gap` | `default` | `--xh-space-1` | form 的 field-group 部件 gap 覆盖槽。 |
| `--xh-form-field-invalid-border` | `field-group` | `border-inline-start` | `invalid` | `--xh-border-invalid` | form 的 field-group 部件 border-inline-start 覆盖槽。 |
| `--xh-form-field-invalid-px` | `field-group` | `padding-inline-start` | `invalid` | `--xh-space-2` | form 的 field-group 部件 padding-inline-start 覆盖槽。 |
| `--xh-form-gap` | `root` | `gap` | `default` | `--xh-stack-gap-md` | form 的 root 部件 gap 覆盖槽。 |
| `--xh-form-inline-gap` | `root` | `column-gap` | `layout=inline` | `--xh-space-4` | form 的 root 部件 column-gap 覆盖槽。 |
| `--xh-form-label-w` | `root` | `grid-template-columns` | `layout=horizontal` | `30%` | form 的 root 部件 grid-template-columns 覆盖槽。 |
| `--xh-form-submit-bg` | `submit-trigger` | `background`<br>`border-color` | `not(:disabled)` | `--xh-bg-brand` | form 的 submit-trigger 部件 background、border-color 覆盖槽。 |
| `--xh-form-submit-bg-active` | `submit-trigger` | `background`<br>`border-color` | `active`<br>`not(:disabled)` | `--xh-bg-brand-active` | form 的 submit-trigger 部件 background、border-color 覆盖槽。 |
| `--xh-form-submit-bg-hover` | `submit-trigger` | `background`<br>`border-color` | `hover`<br>`not(:disabled)` | `--xh-bg-brand-hover` | form 的 submit-trigger 部件 background、border-color 覆盖槽。 |
| `--xh-form-submit-border` | `submit-trigger` | `border-color` | `not(:disabled)` | `--xh-form-submit-bg` | form 的 submit-trigger 部件 border-color 覆盖槽。 |
| `--xh-form-submit-border-active` | `submit-trigger` | `border-color` | `active`<br>`not(:disabled)` | `--xh-form-submit-bg-active` | form 的 submit-trigger 部件 border-color 覆盖槽。 |
| `--xh-form-submit-border-hover` | `submit-trigger` | `border-color` | `hover`<br>`not(:disabled)` | `--xh-form-submit-bg-hover` | form 的 submit-trigger 部件 border-color 覆盖槽。 |
| `--xh-form-submit-fg` | `submit-trigger` | `color` | `not(:disabled)` | `--xh-fg-on-brand` | form 的 submit-trigger 部件 color 覆盖槽。 |
| `--xh-form-submit-shadow` | `submit-trigger` | `box-shadow` | `not(:disabled)` | `--xh-_form-submit-highlight` | form 的 submit-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-form-summary-bg` | `error-summary` | `background` | `default` | `--xh-bg-surface` | form 的 error-summary 部件 background 覆盖槽。 |
| `--xh-form-summary-border` | `error-summary` | `border` | `default` | `--xh-border-invalid` | form 的 error-summary 部件 border 覆盖槽。 |
| `--xh-form-summary-fg` | `error-summary` | `color` | `default` | `--xh-fg-danger` | form 的 error-summary 部件 color 覆盖槽。 |
| `--xh-form-summary-font-size` | `error-summary` | `font-size` | `default` | `--xh-text-body-size` | form 的 error-summary 部件 font-size 覆盖槽。 |
| `--xh-form-summary-gap` | `error-summary` | `gap` | `default` | `--xh-space-1_5` | form 的 error-summary 部件 gap 覆盖槽。 |
| `--xh-form-summary-item-fg-hover` | `error-summary-item` | `color` | `hover` | `--xh-fg-danger-hover` | form 的 error-summary-item 部件 color 覆盖槽。 |
| `--xh-form-summary-item-font-size` | `error-summary-item` | `font-size` | `default` | `--xh-text-secondary-size` | form 的 error-summary-item 部件 font-size 覆盖槽。 |
| `--xh-form-summary-item-underline-offset` | `error-summary-item` | `text-underline-offset` | `default` | `--xh-space-0_5` | form 的 error-summary-item 部件 text-underline-offset 覆盖槽。 |
| `--xh-form-summary-px` | `error-summary` | `padding-inline` | `default` | `--xh-control-px-md` | form 的 error-summary 部件 padding-inline 覆盖槽。 |
| `--xh-form-summary-py` | `error-summary` | `padding-block` | `default` | `--xh-space-3` | form 的 error-summary 部件 padding-block 覆盖槽。 |
| `--xh-form-summary-radius` | `error-summary` | `border-radius` | `default` | `--xh-shape-surface` | form 的 error-summary 部件 border-radius 覆盖槽。 |
| `--xh-form-summary-shadow` | `error-summary` | `box-shadow` | `default` | `--xh-elevation-raised` | form 的 error-summary 部件 box-shadow 覆盖槽。 |
| `--xh-form-trigger-bg` | `reset-trigger`<br>`submit-trigger` | `background` | `default` | `--xh-bg-subtle` | form 的 reset-trigger、submit-trigger 部件 background 覆盖槽。 |
| `--xh-form-trigger-bg-active` | `reset-trigger`<br>`submit-trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | form 的 reset-trigger、submit-trigger 部件 background 覆盖槽。 |
| `--xh-form-trigger-bg-disabled` | `reset-trigger`<br>`submit-trigger` | `background` | `disabled` | `--xh-bg-muted` | form 的 reset-trigger、submit-trigger 部件 background 覆盖槽。 |
| `--xh-form-trigger-bg-hover` | `reset-trigger`<br>`submit-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | form 的 reset-trigger、submit-trigger 部件 background 覆盖槽。 |
| `--xh-form-trigger-border` | `reset-trigger`<br>`submit-trigger` | `border` | `default` | `--xh-border-control` | form 的 reset-trigger、submit-trigger 部件 border 覆盖槽。 |
| `--xh-form-trigger-border-disabled` | `reset-trigger`<br>`submit-trigger` | `border-color` | `disabled` | `--xh-border-subtle` | form 的 reset-trigger、submit-trigger 部件 border-color 覆盖槽。 |
| `--xh-form-trigger-border-hover` | `reset-trigger`<br>`submit-trigger` | `border-color` | `hover`<br>`not(:disabled)` | `--xh-border-control-hover` | form 的 reset-trigger、submit-trigger 部件 border-color 覆盖槽。 |
| `--xh-form-trigger-fg` | `reset-trigger`<br>`submit-trigger` | `color` | `default` | `--xh-fg-default` | form 的 reset-trigger、submit-trigger 部件 color 覆盖槽。 |
| `--xh-form-trigger-font-size` | `reset-trigger`<br>`submit-trigger` | `font-size` | `default` | `--xh-text-body-size` | form 的 reset-trigger、submit-trigger 部件 font-size 覆盖槽。 |
| `--xh-form-trigger-h` | `reset-trigger`<br>`submit-trigger` | `block-size` | `default` | `--xh-control-h-md` | form 的 reset-trigger、submit-trigger 部件 block-size 覆盖槽。 |
| `--xh-form-trigger-px` | `reset-trigger`<br>`submit-trigger` | `padding-inline` | `default` | `--xh-control-px-md` | form 的 reset-trigger、submit-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-form-trigger-radius` | `reset-trigger`<br>`submit-trigger` | `border-radius` | `default` | `--xh-shape-control` | form 的 reset-trigger、submit-trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-form-summary-enter` 随皮肤自带，不引用别处文件里的名字；`background` · `box-shadow` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤按视口分档：`min-width: 1024px` · `min-width: 1280px` · `min-width: 640px` · `min-width: 768px`。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

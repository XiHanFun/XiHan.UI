来源：https://ui.docs.xihanfun.com/components/pin-input

# PinInput `分格输入`

把一串短码拆成几个格子，一格一个字符。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/pin-input" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/pin-input.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/pin-input" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/pin-input" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/pin-input.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

每格都是原生输入框，敲一个字符自动跳下一格；粘贴整串会从落点那一格起按格铺开

```vue
<script setup lang="ts">
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhPinInputRoot :length="4" placeholder="·">
    <XhPinInputLabel>验证码</XhPinInputLabel>
    <!-- 格间距长在格子自己身上，这层包裹只负责排成一行、不要再加 gap -->
    <div style="display: flex">
      <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
    </div>
  </XhPinInputRoot>
</template>
```

```html
<xh-pin-input length="4" placeholder="·">
  <div data-xh-part="root">
    <label data-xh-part="label">验证码</label>
    <!-- 格间距长在格子自己身上，这层包裹只负责排成一行、不要再加 gap -->
    <div style="display: flex">
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
    </div>
  </div>
</xh-pin-input>
```

## 示例

### 一次性验证码

otp 补上 autocomplete=one-time-code，隐藏输入把拼好的整串交给表单，填满那一刻发 value-complete

```vue
<script setup lang="ts">
import {
  XhPinInputHiddenInput,
  XhPinInputInput,
  XhPinInputLabel,
  XhPinInputRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const code = ref<string[]>([]);
const submitted = ref("");
</script>

<template>
  <XhPinInputRoot
    v-model:value="code"
    :length="6"
    name="code"
    placeholder="·"
    otp
    @value-complete="submitted = $event.valueAsString"
  >
    <XhPinInputLabel>短信验证码</XhPinInputLabel>
    <div style="display: flex">
      <XhPinInputInput v-for="i in 6" :key="i" :index="i - 1" />
    </div>
    <XhPinInputHiddenInput />
  </XhPinInputRoot>
  <span>填满时拿到：{{ submitted || "（未填满）" }}</span>
</template>
```

```html
<xh-pin-input id="pin-input-otp" length="6" name="code" placeholder="·" otp>
  <div data-xh-part="root">
    <label data-xh-part="label">短信验证码</label>
    <div style="display: flex">
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
    </div>
    <input data-xh-part="hidden-input" />
  </div>
</xh-pin-input>
<span>填满时拿到：<span id="pin-input-otp-value">（未填满）</span></span>

<script type="module">
  const pin = document.getElementById("pin-input-otp");
  const readout = document.getElementById("pin-input-otp-value");

  pin.addEventListener("value-complete", (event) => {
    readout.textContent = event.detail.valueAsString;
  });
</script>
```

### 遮蔽与字符类别

mask 把每格转成密码框，type 决定哪类字符进得来，其余按键既不进值也不留在框里

```vue
<script setup lang="ts">
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhPinInputRoot :length="4" mask>
    <XhPinInputLabel>支付密码（遮蔽）</XhPinInputLabel>
    <div style="display: flex">
      <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
    </div>
  </XhPinInputRoot>

  <XhPinInputRoot :length="4" type="alphanumeric">
    <XhPinInputLabel>兑换码（数字与字母）</XhPinInputLabel>
    <div style="display: flex">
      <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
    </div>
  </XhPinInputRoot>
</template>
```

```html
<xh-pin-input length="4" mask>
  <div data-xh-part="root">
    <label data-xh-part="label">支付密码（遮蔽）</label>
    <div style="display: flex">
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
    </div>
  </div>
</xh-pin-input>

<xh-pin-input length="4" type="alphanumeric">
  <div data-xh-part="root">
    <label data-xh-part="label">兑换码（数字与字母）</label>
    <div style="display: flex">
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
    </div>
  </div>
</xh-pin-input>
```

### 禁用与校验失败

disabled 让每格都带原生 disabled 且不参与提交，invalid 只做标注、照样能改

```vue
<script setup lang="ts">
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhPinInputRoot :length="4" :default-value="['1', '2', '3', '4']" disabled>
    <XhPinInputLabel>禁用</XhPinInputLabel>
    <div style="display: flex">
      <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
    </div>
  </XhPinInputRoot>

  <XhPinInputRoot :length="4" :default-value="['1', '2', '3', '4']" invalid>
    <XhPinInputLabel>校验失败</XhPinInputLabel>
    <div style="display: flex">
      <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
    </div>
  </XhPinInputRoot>
</template>
```

```html
<xh-pin-input length="4" default-value="1234" disabled>
  <div data-xh-part="root">
    <label data-xh-part="label">禁用</label>
    <div style="display: flex">
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
    </div>
  </div>
</xh-pin-input>

<xh-pin-input length="4" default-value="1234" invalid>
  <div data-xh-part="root">
    <label data-xh-part="label">校验失败</label>
    <div style="display: flex">
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
    </div>
  </div>
</xh-pin-input>
```

### 形态

variant 只改每格的颜色槽位，跳格与粘贴铺开的行为三档一致

```vue
<script setup lang="ts">
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 20px">
    <XhPinInputRoot v-for="v in variants" :key="v" :variant="v" :length="4" placeholder="·">
      <XhPinInputLabel>{{ v }}</XhPinInputLabel>
      <!-- 格间距长在格子自己身上，这层包裹只负责排成一行 -->
      <div style="display: flex">
        <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
      </div>
    </XhPinInputRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 20px">
  <xh-pin-input variant="outline" length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">outline</label>
      <!-- 格间距长在格子自己身上，这层包裹只负责排成一行 -->
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-pin-input>

  <xh-pin-input variant="subtle" length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">subtle</label>
      <!-- 格间距长在格子自己身上，这层包裹只负责排成一行 -->
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-pin-input>

  <xh-pin-input variant="ghost" length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">ghost</label>
      <!-- 格间距长在格子自己身上，这层包裹只负责排成一行 -->
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-pin-input>
</div>
```

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 outline 只看语气的差别

```vue
<script setup lang="ts">
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 20px">
    <XhPinInputRoot
      v-for="t in tones"
      :key="t"
      variant="outline"
      :tone="t"
      :length="4"
      placeholder="·"
    >
      <XhPinInputLabel>{{ t }}</XhPinInputLabel>
      <div style="display: flex">
        <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
      </div>
    </XhPinInputRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 20px">
  <xh-pin-input variant="outline" tone="brand" length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">brand</label>
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-pin-input>

  <xh-pin-input variant="outline" tone="neutral" length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">neutral</label>
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-pin-input>

  <xh-pin-input variant="outline" tone="success" length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">success</label>
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-pin-input>

  <xh-pin-input variant="outline" tone="warning" length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">warning</label>
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-pin-input>

  <xh-pin-input variant="outline" tone="danger" length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">danger</label>
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-pin-input>

  <xh-pin-input variant="outline" tone="info" length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">info</label>
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-pin-input>
</div>
```

### 尺寸

每格的边长随 size 换档，不传 size 即默认档

```vue
<script setup lang="ts">
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 20px">
    <XhPinInputRoot v-for="s in sizes" :key="s.label" :size="s.size" :length="4" placeholder="·">
      <XhPinInputLabel>{{ s.label }}</XhPinInputLabel>
      <div style="display: flex">
        <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
      </div>
    </XhPinInputRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 20px">
  <xh-pin-input size="sm" length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">小</label>
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-pin-input>

  <xh-pin-input length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">默认</label>
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-pin-input>

  <xh-pin-input size="lg" length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">大</label>
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-pin-input>
</div>
```

### 分组排布

格子由作者逐个写出，中间插什么都行；下标接着排，跳格与整串粘贴仍按文档序走

```vue
<script setup lang="ts">
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhPinInputRoot :length="6" type="alphanumeric" placeholder="·">
    <XhPinInputLabel>邀请码（3 + 3）</XhPinInputLabel>
    <div style="display: flex; align-items: center">
      <XhPinInputInput v-for="i in 3" :key="`a${i}`" :index="i - 1" />
      <span style="margin-inline: 8px">—</span>
      <XhPinInputInput v-for="i in 3" :key="`b${i}`" :index="i + 2" />
    </div>
  </XhPinInputRoot>
</template>
```

```html
<xh-pin-input length="6" type="alphanumeric" placeholder="·">
  <div data-xh-part="root">
    <label data-xh-part="label">邀请码（3 + 3）</label>
    <div style="display: flex; align-items: center">
      <input data-xh-part="input" index="0" />
      <input data-xh-part="input" index="1" />
      <input data-xh-part="input" index="2" />
      <span style="margin-inline: 8px">—</span>
      <input data-xh-part="input" index="3" />
      <input data-xh-part="input" index="4" />
      <input data-xh-part="input" index="5" />
    </div>
  </div>
</xh-pin-input>
```

### 填满才可提交

每格都有字才算填满，作者据此点亮提交按钮；重填一次清空整组

```vue
<script setup lang="ts">
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const submitted = ref("");

function reset(clear: () => void) {
  clear();
  submitted.value = "";
}
</script>

<template>
  <XhPinInputRoot v-slot="{ complete, valueAsString, clear }" :length="4" placeholder="·">
    <XhPinInputLabel>兑换码</XhPinInputLabel>
    <div style="display: flex">
      <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
    </div>
    <div style="display: flex; gap: 8px">
      <button type="button" :disabled="!complete" @click="submitted = valueAsString">
        提交
      </button>
      <button type="button" @click="reset(clear)">重填</button>
    </div>
    <span>{{ submitted ? `已提交：${submitted}` : "四格都填满才能提交" }}</span>
  </XhPinInputRoot>
</template>
```

```html
<form id="pin-input-complete-form">
  <xh-pin-input id="pin-input-complete" length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">兑换码</label>
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
      <div style="display: flex; gap: 8px">
        <button type="button" id="pin-input-complete-submit" disabled>提交</button>
        <!-- 重填走原生表单重置，组件认它并把整组清回落点 -->
        <button type="reset">重填</button>
      </div>
      <span id="pin-input-complete-readout">四格都填满才能提交</span>
    </div>
  </xh-pin-input>
</form>

<script type="module">
  const form = document.getElementById("pin-input-complete-form");
  const pin = document.getElementById("pin-input-complete");
  const root = pin.querySelector('[data-xh-part="root"]');
  const submit = document.getElementById("pin-input-complete-submit");
  const readout = document.getElementById("pin-input-complete-readout");
  let code = "";

  // 填满与否由组件写在根上，照它点亮提交按钮
  function sync() {
    submit.disabled = !root.hasAttribute("data-complete");
  }

  new MutationObserver(sync).observe(root, {
    attributes: true,
    attributeFilter: ["data-complete"],
  });
  sync();

  pin.addEventListener("value-change", (event) => (code = event.detail.valueAsString));
  submit.addEventListener("click", () => (readout.textContent = "已提交：" + code));
  form.addEventListener("reset", () => (readout.textContent = "四格都填满才能提交"));
</script>
```

### 只读

格子带上原生 readonly，值走受控且宿主不回写：能聚焦、能选中复制，改不动

```vue
<script setup lang="ts">
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/vue";

// 传了 value 就由宿主说了算，不回写值就恒定不变
const code = ["8", "1", "9", "2"];

// 皮肤没有只读档，底色由作者压下去表示改不动
const box = "background: var(--xh-bg-subtle)";
</script>

<template>
  <XhPinInputRoot :length="4" :value="code">
    <XhPinInputLabel>上一次的验证码</XhPinInputLabel>
    <div style="display: flex">
      <XhPinInputInput
        v-for="i in 4"
        :key="i"
        :index="i - 1"
        :style="box"
        readonly
      />
    </div>
  </XhPinInputRoot>
  <span>点进任意一格可以选中复制，敲键盘与粘贴都改不动它。</span>
</template>
```

```html
<!-- 传了 value 就由宿主说了算，不回写值就恒定不变 -->
<xh-pin-input length="4" value="8192">
  <div data-xh-part="root">
    <label data-xh-part="label">上一次的验证码</label>
    <!-- 皮肤没有只读档，底色由作者压下去表示改不动 -->
    <div style="display: flex">
      <input data-xh-part="input" readonly style="background: var(--xh-bg-subtle)" />
      <input data-xh-part="input" readonly style="background: var(--xh-bg-subtle)" />
      <input data-xh-part="input" readonly style="background: var(--xh-bg-subtle)" />
      <input data-xh-part="input" readonly style="background: var(--xh-bg-subtle)" />
    </div>
  </div>
</xh-pin-input>
<span>点进任意一格可以选中复制，敲键盘与粘贴都改不动它。</span>
```

### 自定义准入字符

pattern 是一段正则源码，逐个字符整格匹配；写坏了退回 type 的准入表

```vue
<script setup lang="ts">
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/vue";
</script>

<template>
  <!-- 十六进制：准入放宽到 A-F，type 也一并改成 alphanumeric，
       否则移动端弹的还是数字键盘、那几个字母敲不进来 -->
  <XhPinInputRoot :length="6" type="alphanumeric" pattern="[0-9A-Fa-f]" placeholder="·">
    <XhPinInputLabel>颜色值（十六进制）</XhPinInputLabel>
    <div style="display: flex">
      <XhPinInputInput v-for="i in 6" :key="i" :index="i - 1" />
    </div>
  </XhPinInputRoot>

  <!-- 只收这四个字，粘贴整串时同样按它过滤 -->
  <XhPinInputRoot :length="4" type="alphanumeric" pattern="[上下左右]" placeholder="·">
    <XhPinInputLabel>方向口令</XhPinInputLabel>
    <div style="display: flex">
      <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
    </div>
  </XhPinInputRoot>
</template>
```

```html
<!-- 十六进制：准入放宽到 A-F，type 也一并改成 alphanumeric，
     否则移动端弹的还是数字键盘、那几个字母敲不进来 -->
<xh-pin-input length="6" type="alphanumeric" pattern="[0-9A-Fa-f]" placeholder="·">
  <div data-xh-part="root">
    <label data-xh-part="label">颜色值（十六进制）</label>
    <div style="display: flex">
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
    </div>
  </div>
</xh-pin-input>

<!-- 只收这四个字，粘贴整串时同样按它过滤 -->
<xh-pin-input length="4" type="alphanumeric" pattern="[上下左右]" placeholder="·">
  <div data-xh-part="root">
    <label data-xh-part="label">方向口令</label>
    <div style="display: flex">
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
    </div>
  </div>
</xh-pin-input>
```

## 设计指引

### 何时使用

- 一次性验证码、支付密码、邀请码这类定长的短串。

### 何时不用

- 长度不固定或较长：用[文本输入](./text-field)。
- 输入的是密码：用 `type="password"` 的文本输入，密码管理器认得它。

### 特性

- `otp` 一开就接上平台的验证码自动填充。
- 按顺序录入：焦点落在第一个空格上，还轮不到的格子既点不进、也不是 Tab 停靠点；
  往回改已填的格子照走，填满之后哪一格都能改。`readOnly` 与 `disabled` 不设这道限。
- 粘贴一整串会按格拆开填进去。
- `mask` 遮蔽字符、`type` 与 `pattern` 限制可输入字符类别。
- `onValueComplete` 在填满那一刻发一次，用来自动提交。
- `group` 与 `separator` 把格子分段排（123-456），下标仍按文档序算。
- `readOnly` 让格子只能看与复制，`required` 给每格补上原生必填。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-pin-input>` |
| Vue 组件 | `XhPinInputGroup` `XhPinInputHiddenInput` `XhPinInputInput` `XhPinInputLabel` `XhPinInputRoot` `XhPinInputSeparator` |
| 组合式函数 | `usePinInput` |
| 状态机 | `pinInputMachine` |
| 皮肤 | `@xihan-ui/styles/pin-input.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="pin-input"`：**`root`** · `label` · `group` · **`input`** · `separator` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string[]` |  | 逐格的值。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string[]` |  |  |
| `length` | `number` |  | 格数，默认 6。值的长度恒被归一到它。 |
| `type` | `PinInputType` |  | 接受的字符类别，默认 numeric。同时决定移动端弹哪种键盘。 |
| `pattern` | `string` |  | 自定义准入：一段正则源码，逐个字符整格匹配（内部自动加首尾锚与 u 标志， 所以写 `[0-9A-Fa-f]` 即可，不必自己写 `^...$`）。给了它就盖过 type 的准入表。 弹哪种键盘仍由 type 说了算——准入放宽到字母时记得把 type 一并改掉， 否则移动端弹的还是数字键盘，用户敲不进那些字符。 写坏了（编不成正则）退回 type 的准入表，不抛。 |
| `mask` | `boolean` |  | 遮蔽显示：输入框转 type=password。 |
| `otp` | `boolean` |  | 一次性验证码：补 autocomplete=one-time-code，短信验证码才能被系统自动填入。 |
| `placeholder` | `string` |  | 空格子的占位字符。 |
| `disabled` | `boolean` |  | 禁用：每格都带原生 disabled（不可聚焦、不可输入），隐藏输入不参与提交。 |
| `readOnly` | `boolean` |  | 只读：每格仍可聚焦、可复制，写不进；隐藏输入照常参与提交。 |
| `required` | `boolean` |  | 必填标注：每格都带原生 required。 |
| `invalid` | `boolean` |  | 校验失败标注。 |
| `blurOnComplete` | `boolean` |  | 填满即把焦点撤走，常用于"填满就自动提交"的表单。 |
| `name` | `string` |  | 表单字段名；给了隐藏输入才带 name，整串值随表单一并提交。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定颜色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<PinInputTranslations>` |  |  |
| `onValueChange` | `(details: PinInputValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onValueComplete` | `(details: PinInputValueChangeDetails) => void` |  | 每格都填满的那一刻触发；值没真变时不重复触发。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `PinInputValueChangeDetails` | 值变化；detail 为 `{ value: string[], valueAsString: string }` |
| `value-complete` | `PinInputValueChangeDetails` | 每格都填满；detail 同上 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPinInputRoot` | `default` | `PinInputRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.FILL` · `VALUE.CLEAR_AT` · `VALUE.CLEAR` · `INPUT.FOCUS` · `INPUT.BLUR` · `FORM.RESET`

**判据**：`canEdit`

## connect API

`usePinInput` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 逐格的值，长度恒等于 length。 |
| `valueAsString` | `string` |  |
| `complete` | `boolean` | 每格都填满了。作者据此点亮提交按钮。 |
| `length` | `number` |  |
| `focusedIndex` | `number` | 焦点该落在哪一格；焦点在组外时为 -1。按顺序录入时它不会越过第一个空格。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `setValue` | `(next: string[]) => void` |  |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getGroupProps` | `() => T['element']` | 连着的几格圈成一段（123-456 这种分段写法）；纯排版，不参与下标计算。 |
| `getInputProps` | `(props: PinInputInputProps) => T['input']` |  |
| `getSeparatorProps` | `() => T['element']` | 段与段之间的分隔；对读屏隐藏，念出来只会打断验证码。 |
| `getHiddenInputProps` | `() => T['input']` | 整份验证码的表单出口：一份 type=hidden 的原生输入，随表单提交拼好的串。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#textbox)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` | focus in a box, not disabled | 焦点移到下一格；越不过第一个空格，已在末格则不动，不回绕 |
| `ArrowLeft` | focus in a box, not disabled | 焦点移到上一格；已在首格则不动，不回绕 |
| `Home` | focus in a box, not disabled | 焦点移到首格 |
| `End` | focus in a box, not disabled | 焦点移到最后一格可落焦的格子：填满时是末格，还有空格时是第一个空格 |
| `Backspace` | focus in a box, not disabled | 本格有值则清本格；本格为空则退回上一格并清掉上一格 |
| `Delete` | focus in a box, not disabled | 清掉本格，焦点不动 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-labelledby` | `label` 部件的 id |
| `root` | `role` | 'group' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-label` | label.input(index + 1, length) |
| `separator` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/pin-input.css` 按部件选择：`[data-scope="pin-input"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-complete` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `group` | `data-disabled` | ''（条件成立时才出现） |
| `group` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-empty` | ''（条件成立时才出现） |
| `input` | `data-focus` | ''（条件成立时才出现） |
| `input` | `data-index` | String(index) |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-readonly` | ''（条件成立时才出现） |
| `separator` | `data-disabled` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-pin-input-box-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-canvas` | pin-input 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-pin-input-box-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` | pin-input 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-pin-input-box-bg` | `input` | `background` | `default` | `--xh-_pin-input-box-bg` | pin-input 的 input 部件 background 覆盖槽。 |
| `--xh-pin-input-box-bg-disabled` | `input` | `background` | `disabled` | `--xh-bg-subtle` | pin-input 的 input 部件 background 覆盖槽。 |
| `--xh-pin-input-box-bg-hover` | `input` | `background` | `hover`<br>`invalid`<br>`not(:disabled, [data-readonly], [data-invalid])`<br>`readonly` | `--xh-_pin-input-box-bg-hover` | pin-input 的 input 部件 background 覆盖槽。 |
| `--xh-pin-input-box-bg-readonly` | `input` | `background` | `readonly` | `--xh-bg-subtle` | pin-input 的 input 部件 background 覆盖槽。 |
| `--xh-pin-input-box-border` | `input` | `border` | `default` | `--xh-_pin-input-box-border` | pin-input 的 input 部件 border 覆盖槽。 |
| `--xh-pin-input-box-border-complete` | `input`<br>`root` | `border-color` | `complete`<br>`invalid`<br>`not([data-invalid], :disabled)` | `--xh-_pin-input-accent` | pin-input 的 input、root 部件 border-color 覆盖槽。 |
| `--xh-pin-input-box-border-focus` | `input` | `border-color` | `focus`<br>`focus-visible` | `--xh-_tone` | pin-input 的 input 部件 border-color 覆盖槽。 |
| `--xh-pin-input-box-border-hover` | `input` | `border-color` | `hover`<br>`invalid`<br>`not(:disabled, [data-readonly], [data-invalid])`<br>`readonly` | `--xh-_pin-input-box-border-hover` | pin-input 的 input 部件 border-color 覆盖槽。 |
| `--xh-pin-input-box-border-invalid` | `input` | `border-color` | `invalid` | `--xh-border-invalid` | pin-input 的 input 部件 border-color 覆盖槽。 |
| `--xh-pin-input-box-fg` | `input` | `color` | `default` | `--xh-fg-default` | pin-input 的 input 部件 color 覆盖槽。 |
| `--xh-pin-input-box-font-size` | `input` | `font-size` | `default` | `--xh-_pin-input-box-font-size` | pin-input 的 input 部件 font-size 覆盖槽。 |
| `--xh-pin-input-box-gap` | `input` | `margin-inline-start` | `default` | `--xh-_pin-input-box-gap` | pin-input 的 input 部件 margin-inline-start 覆盖槽。 |
| `--xh-pin-input-box-radius` | `input` | `border-radius` | `default` | `--xh-shape-control` | pin-input 的 input 部件 border-radius 覆盖槽。 |
| `--xh-pin-input-box-shadow` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`default` | `--xh-_pin-input-box-shadow` | pin-input 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-pin-input-box-size` | `input` | `block-size`<br>`inline-size` | `default` | `--xh-_pin-input-box-size` | pin-input 的 input 部件 block-size、inline-size 覆盖槽。 |
| `--xh-pin-input-gap` | `root` | `gap` | `default` | `--xh-space-1` | pin-input 的 root 部件 gap 覆盖槽。 |
| `--xh-pin-input-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | pin-input 的 label 部件 color 覆盖槽。 |
| `--xh-pin-input-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | pin-input 的 label 部件 color 覆盖槽。 |
| `--xh-pin-input-label-font-size` | `label` | `font-size` | `default` | `--xh-_pin-input-label-font-size` | pin-input 的 label 部件 font-size 覆盖槽。 |
| `--xh-pin-input-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | pin-input 的 label 部件 font-weight 覆盖槽。 |
| `--xh-pin-input-placeholder-fg` | `input` | `color` | `placeholder` | `--xh-fg-subtle` | pin-input 的 input 部件 color 覆盖槽。 |
| `--xh-pin-input-separator-fg` | `separator` | `color` | `default` | `--xh-fg-muted` | pin-input 的 separator 部件 color 覆盖槽。 |
| `--xh-pin-input-separator-fg-disabled` | `separator` | `color` | `disabled` | `--xh-fg-disabled` | pin-input 的 separator 部件 color 覆盖槽。 |
| `--xh-pin-input-separator-font-size` | `separator` | `font-size` | `default` | `--xh-_pin-input-box-font-size` | pin-input 的 separator 部件 font-size 覆盖槽。 |
| `--xh-pin-input-separator-gap` | `separator` | `margin-inline` | `default` | `--xh-_pin-input-box-gap` | pin-input 的 separator 部件 margin-inline 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `border-color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[表单](./form)配合，填满才允许提交。

## 最佳实践

- 验证码务必开 `otp`，否则短信里的码要用户手打。
- 填满后自动提交，别让用户再找一次按钮。

## 反模式

- 格数超过八个：视觉上就不再是"一串短码"了。
- 遮蔽验证码：用户看不见自己输错在哪一位。

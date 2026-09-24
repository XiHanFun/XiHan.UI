来源：https://ui.docs.xihanfun.com/components/password-input

# PasswordInput 密码输入

一格密码框，带明暗切换按钮，并在大写锁定开启时给出提示。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/password-input" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/password-input.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/password-input" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/password-input" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/password-input.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

root 持有状态，control 是视觉盒；不传 value 与 revealed 即为非受控，明暗由组件自行管理，按钮中的图标随明暗切换

```vue
<script setup lang="ts">
import {
  XhPasswordInputCapsLockIndicator,
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPasswordInputRoot
    placeholder="请输入密码"
    :translations="{
      visibilityTriggerShow: '显示密码',
      visibilityTriggerHide: '隐藏密码',
      capsLockOn: '大写锁定已打开',
      strengthMeter: '密码强度',
    }"
  >
    <XhPasswordInputLabel>密码</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput />
      <!-- 节点留空，大写锁定开着时组件把文字写进来，读屏念的就是这一段 -->
      <XhPasswordInputCapsLockIndicator />
      <!-- 留空即使用皮肤内置的显示/隐藏图标，名字也由组件按状态切换 -->
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>
</template>
```

```html
<xh-password-input id="password-input-basic" placeholder="请输入密码">
  <div data-xh-part="root">
    <label data-xh-part="label">密码</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <!-- 节点留空，大写锁定开着时元素把文字写进来，读屏念的就是这一段 -->
      <span data-xh-part="caps-lock-indicator"></span>
      <!-- 留空即使用皮肤内置的显示/隐藏图标，名字也由组件按状态切换 -->
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>

<script type="module">
  // 大写锁定提示文案由组件写入对应状态区
  const field = document.getElementById("password-input-basic");

  field.translations = {
    visibilityTriggerShow: "显示密码",
    visibilityTriggerHide: "隐藏密码",
    capsLockOn: "大写锁定已打开",
    strengthMeter: "密码强度",
  };
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="password-input"`：**`root`** · `label` · `control` · **`input`** · **`visibility-trigger`** · `caps-lock-indicator` · `strength-meter`

## 示例

### 受控

值与明暗都可受控：传入后由宿主决定，组件只报告意图，是否写回由宿主决定

```vue
<script setup lang="ts">
import {
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const password = ref("hunter2");
const revealed = ref(false);
</script>

<template>
  <XhPasswordInputRoot v-model:value="password" v-model:revealed="revealed">
    <XhPasswordInputLabel>密码</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput />
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>
  <span>当前：{{ revealed ? password : "•".repeat(password.length) }}</span>
  <button type="button" @click="revealed = false">收起明文</button>
</template>
```

```html
<xh-password-input id="password-input-controlled" value="hunter2" revealed="false">
  <div data-xh-part="root">
    <label data-xh-part="label">密码</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>
<span>当前：<span id="password-input-controlled-value">•••••••</span></span>
<button type="button" id="password-input-controlled-hide">收起明文</button>

<script type="module">
  // 值与明暗都由外面这份状态持有，组件报上来才写回去
  const field = document.getElementById("password-input-controlled");
  const readout = document.getElementById("password-input-controlled-value");
  const hide = document.getElementById("password-input-controlled-hide");

  const state = { value: "hunter2", revealed: false };

  function apply(next) {
    Object.assign(state, next);
    field.value = state.value;
    field.revealed = state.revealed;
    readout.textContent = state.revealed ? state.value : "•".repeat(state.value.length);
  }

  field.addEventListener("value-change", (event) => apply({ value: event.detail.value }));
  field.addEventListener("revealed-change", (event) => apply({ revealed: event.detail.revealed }));
  hide.addEventListener("click", () => apply({ revealed: false }));
</script>
```

### 大写锁定提示

打开大写锁定后在框中输入一个字符：提示显示，读屏也会朗读一次；焦点离开输入框即消失

```vue
<script setup lang="ts">
import {
  XhPasswordInputCapsLockIndicator,
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPasswordInputRoot
    placeholder="打开大写锁定再敲一个字"
    :translations="{ capsLockOn: '大写锁定已打开' }"
  >
    <XhPasswordInputLabel>密码</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput />
      <!-- 节点留空：区里的文字由组件写，写的就是 translations.capsLockOn -->
      <XhPasswordInputCapsLockIndicator />
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>
</template>
```

```html
<xh-password-input id="password-input-caps" placeholder="打开大写锁定再敲一个字">
  <div data-xh-part="root">
    <label data-xh-part="label">密码</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <!-- 节点留空：区里的文字由元素写，写的就是 translations.capsLockOn -->
      <span data-xh-part="caps-lock-indicator"></span>
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>

<script type="module">
  // 文案是对象，进不了 HTML 属性，只能作为 property 赋
  document.getElementById("password-input-caps").translations = { capsLockOn: "大写锁定已打开" };
</script>
```

### 禁用与校验态

disabled 连明暗切换一起停止，read-only 只锁定值、明暗照常切换，invalid 只标注不拦截输入

```vue
<script setup lang="ts">
import {
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPasswordInputRoot default-value="hunter2" disabled>
    <XhPasswordInputLabel>禁用</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput />
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>

  <XhPasswordInputRoot default-value="hunter2" read-only>
    <XhPasswordInputLabel>只读</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput />
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>

  <XhPasswordInputRoot default-value="123" invalid>
    <XhPasswordInputLabel>校验失败</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput />
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>
</template>
```

```html
<xh-password-input default-value="hunter2" disabled>
  <div data-xh-part="root">
    <label data-xh-part="label">禁用</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>

<xh-password-input default-value="hunter2" read-only>
  <div data-xh-part="root">
    <label data-xh-part="label">只读</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>

<xh-password-input default-value="123" invalid>
  <div data-xh-part="root">
    <label data-xh-part="label">校验失败</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>
```

### 变体

variant 决定底色与描边的绘制方式：描边、淡色填底、无框；密码框没有实心档

```vue
<script setup lang="ts">
import {
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
</script>

<template>
  <XhPasswordInputRoot v-for="v in variants" :key="v" :variant="v" default-value="hunter2">
    <XhPasswordInputLabel>{{ v }}</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput />
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>
</template>
```

```html
<xh-password-input variant="outline" default-value="hunter2">
  <div data-xh-part="root">
    <label data-xh-part="label">outline</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>

<xh-password-input variant="subtle" default-value="hunter2">
  <div data-xh-part="root">
    <label data-xh-part="label">subtle</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>

<xh-password-input variant="ghost" default-value="hunter2">
  <div data-xh-part="root">
    <label data-xh-part="label">ghost</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>
```

### 颜色

tone 决定使用哪族颜色，与 variant 正交；这里固定 subtle 形态，语气的底色差别不必聚焦即可看到

```vue
<script setup lang="ts">
import {
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <!-- 框里的字不归语气管，语气只落在底色、悬停描边与聚焦描边上；聚焦环恒用同一族色 -->
  <XhPasswordInputRoot
    v-for="t in tones"
    :key="t"
    variant="subtle"
    :tone="t"
    default-value="hunter2"
  >
    <XhPasswordInputLabel>{{ t }}</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput />
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>
</template>
```

```html
<!-- 框里的字不归语气管，语气只落在底色、悬停描边与聚焦描边上；聚焦环恒用同一族色 -->
<xh-password-input variant="subtle" tone="brand" default-value="hunter2">
  <div data-xh-part="root">
    <label data-xh-part="label">brand</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>

<xh-password-input variant="subtle" tone="neutral" default-value="hunter2">
  <div data-xh-part="root">
    <label data-xh-part="label">neutral</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>

<xh-password-input variant="subtle" tone="success" default-value="hunter2">
  <div data-xh-part="root">
    <label data-xh-part="label">success</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>

<xh-password-input variant="subtle" tone="warning" default-value="hunter2">
  <div data-xh-part="root">
    <label data-xh-part="label">warning</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>

<xh-password-input variant="subtle" tone="danger" default-value="hunter2">
  <div data-xh-part="root">
    <label data-xh-part="label">danger</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>

<xh-password-input variant="subtle" tone="info" default-value="hunter2">
  <div data-xh-part="root">
    <label data-xh-part="label">info</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>
```

### 尺寸

size 只改变高度、内边距与字号，标签、切换按钮与大写锁定提示一起换档；不写即默认档

```vue
<script setup lang="ts">
import {
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPasswordInputRoot size="sm" default-value="hunter2">
    <XhPasswordInputLabel>sm</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput />
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>

  <XhPasswordInputRoot default-value="hunter2">
    <XhPasswordInputLabel>缺省</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput />
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>

  <XhPasswordInputRoot size="lg" default-value="hunter2">
    <XhPasswordInputLabel>lg</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput />
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>
</template>
```

```html
<xh-password-input size="sm" default-value="hunter2">
  <div data-xh-part="root">
    <label data-xh-part="label">sm</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>

<xh-password-input default-value="hunter2">
  <div data-xh-part="root">
    <label data-xh-part="label">缺省</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>

<xh-password-input size="lg" default-value="hunter2">
  <div data-xh-part="root">
    <label data-xh-part="label">lg</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>
```

### 注册表单

提供 name 后才参与提交，auto-complete 写为 new-password 密码管理器才会保存新密码而不是填入旧密码

```vue
<script setup lang="ts">
import {
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <!-- 点表单的重置：值回到 default-value，明文也一并收起来 -->
  <form style="display: flex; align-items: flex-end; gap: 8px">
    <XhPasswordInputRoot name="new-password" auto-complete="new-password" default-value="" required>
      <XhPasswordInputLabel>设置新密码</XhPasswordInputLabel>
      <XhPasswordInputControl>
        <XhPasswordInputInput />
        <XhPasswordInputVisibilityTrigger />
      </XhPasswordInputControl>
    </XhPasswordInputRoot>
    <button type="reset">重置</button>
  </form>
</template>
```

```html
<!-- 点表单的重置：值回到 default-value，明文也一并收起来 -->
<form style="display: flex; align-items: flex-end; gap: 8px">
  <xh-password-input name="new-password" auto-complete="new-password" default-value="" required>
    <div data-xh-part="root">
      <label data-xh-part="label">设置新密码</label>
      <div data-xh-part="control">
        <input data-xh-part="input" />
        <button data-xh-part="visibility-trigger"></button>
      </div>
    </div>
  </xh-password-input>
  <button type="reset">重置</button>
</form>
```

## 设计指引

### 何时使用

- 登录、注册、修改密码等需要遮蔽输入内容的字段。
- 用户需要核对输入：切换为明文查看，再切回。

### 何时不用

- 只需要遮蔽输入、不需要明暗切换与大写锁定提示时，使用[文本字段](./text-field)的 `type="password"`，结构更少。
- 输入短验证码或一次性密码时，使用[分格输入](./pin-input)。
- 需要比较两次输入是否一致时，属于表单校验，交给[表单](./form)与[表单字段](./field)。

### 特性

- 明暗切换在 `revealed` / `defaultRevealed` 两态齐全，受控与非受控走同一条路径。
- 切换之后焦点留在切换按钮上，框内的光标与选中范围原样恢复。
- 大写锁定提示由按键事件驱动，焦点离开输入框即熄灭。
- `autoComplete` 默认 `current-password`，注册表单应显式改为 `new-password`。
- `strength` 传入 0–4 五档即显示强度条；评分算法由调用方负责，组件只绘制档位。
- 形态、语气、尺寸三轴与[文本字段](./text-field)同源，并排放置不会相差一档。
- 一体式 `control` 投影 Field Chrome 家族，描边式静息、无影，聚焦描边一律 `--xh-border-control-focus`；显隐动作走 Action Control 的 `field-inset` ghost 档（正方视觉盒、inset 圆角、悬停 100 / 按下 200 中性底与 0.97 按压），与输入 / 状态区之间有半高语义分隔，三档尺寸和 compact 密度使用同一比例。
- 自动填充由家族用 canvas 实体底与默认前景重绘，避免浏览器注入的颜色把框切成异色段。

### 组合

- 外层放[表单字段](./field)获取标签、说明与错误文本。
- 切换按钮留空时由皮肤按 `data-state` 绘制显示或隐藏图标。需要品牌图标时可放入[图标](./icon)替换内置字形，组件仍负责切换按钮的可访问名称。

### 最佳实践

- 自行编写角色节点时（Web Components 用法），三个角色必须使用对应标签：标题是原生 `<label>`、输入框是原生 `<input>`、切换按钮是原生 `<button>`。标题的 `for` 始终指向输入框的 id，写成 `<span>` 则无法点击；切换按钮写成 `<div>` 则没有 Enter / Space 激活；两种情况都不报错，只是静默失效。
- 大写锁定提示节点也由作者写出（元素不生成结构），写成空壳即可，文字由组件填充。Vue 侧由组件代劳。
- 明文只在用户主动切换时出现，不默认 `defaultRevealed`。
- 切换按钮在切换后不消失、不换位置：它持有焦点，移动会让键盘用户丢失位置。
- `readOnly` 只禁止改值，不禁止显隐：用户仍可聚焦、复制和核对已有密码；`disabled` 才同时禁用输入与显隐动作。
- 大写锁定提示只提示，不拦截提交：它是键盘的物理状态，用户可能确实需要输入大写。
- 注册表单把 `autoComplete` 写成 `new-password`，否则密码管理器会填入旧密码。

### 当前边界

- anatomy 尚无正式的 prefix / suffix 部件；`control` 中的作者节点目前只按统一 gap 排布，不承诺前后缀语义或专门状态。需要时应以独立三端部件提交，不用 CSS 推断任意子节点的职责。
- `control` 在 meta 中仍是可选部件，但共享 Field Chrome、组合焦点环与动作分隔都以它为边界；无 `control` 的结构只是独立输入框和按钮，不再绘制独立外壳。是否将其提升为必需部件属于后续公共结构合同变更。

### 反模式

- 用它接收“请再输入一次”的确认格却不提供独立标签：读屏读出的两格完全相同。
- 把明暗状态存入接口或本地存储：下次打开页面时密码是明文。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-password-input>` |
| Vue 组件 | `XhPasswordInputCapsLockIndicator` `XhPasswordInputControl` `XhPasswordInputInput` `XhPasswordInputLabel` `XhPasswordInputRoot` `XhPasswordInputStrengthMeter` `XhPasswordInputVisibilityTrigger` |
| 组合式函数 | `usePasswordInput` |
| 状态机 | `passwordInputMachine` |
| 皮肤 | `@xihan-ui/styles/password-input.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 受控值；提供后由宿主决定，状态机不自行修改。 |
| `defaultValue` | `string` |  | 非受控初值。 |
| `revealed` | `boolean` |  | 受控的显隐态：明文是否显示；提供后由宿主决定。 |
| `defaultRevealed` | `boolean` |  | 非受控的初始显隐态，默认隐藏。 |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `required` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；提供后才参与提交。 |
| `placeholder` | `string` |  |  |
| `autoComplete` | `string` |  | 写到 input 上的 autocomplete，默认 current-password。 密码管理器据此决定该字段是填入旧密码还是保存新密码，注册表单要显式写 new-password。 |
| `strength` | `number` |  | 强度档位，0 到 4 共五档。提供后才显示强度条，默认不显示。 打分算法归调用方：口令强弱是产品规则（字典、泄漏库、业务口径），组件只负责绘制档位。 超出区间的值被夹回区间。 |
| `translations` | `Partial<PasswordInputTranslations>` |  | 读屏文案覆盖；未提供的条目使用组件内建英文。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定底色与描边的绘制方式。默认 outline。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: PasswordInputValueChangeDetails) => void` |  |  |
| `onRevealedChange` | `(details: PasswordInputRevealedChangeDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `PasswordInputValueChangeDetails` | 值变化；detail 为 `{ value: string }` |
| `revealed-change` | `PasswordInputRevealedChangeDetails` | 显隐变化；detail 为 `{ revealed: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPasswordInputRoot` | `default` | `PasswordInputRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhPasswordInputRoot` | `children` | `SlotChildren<PasswordInputRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `visibility-trigger` | 'visible' \| 'hidden' |
| `caps-lock-indicator` | 'visible' \| 'hidden' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `REVEALED.SET` · `REVEALED.TOGGLE` · `CAPS_LOCK.SET` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**判据**：`canEdit` · `canReveal`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` |  |
| `empty` | `boolean` | 值为空串。 |
| `revealed` | `boolean` | 当前明文是否已显示。 |
| `capsLock` | `boolean` | 大写锁定是否开启；为真时提示部件才显示。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `inputType` | `PasswordInputType` | 输入框当前的 type，随 revealed 变化。 |
| `capsLockMessage` | `string` | 大写锁定播报区当前的文字：开启时是 `translations.capsLockOn`，关闭时是空串。 适配器把它写为提示部件的文本内容，读屏朗读的即这一段。 |
| `strength` | `number \| undefined` | 夹回 0–4 后的强度档位；未提供 strength 时为 undefined，此时强度条收起。 |
| `setValue` | `(next: string) => void` | 直接写值，只受 disabled / readOnly 约束。 |
| `setRevealed` | `(next: boolean) => void` | 指定显隐态；整个控件禁用时不生效。 |
| `toggleRevealed` | `() => void` | 切换显隐态；整个控件禁用时不生效。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['input']` |  |
| `getVisibilityTriggerProps` | `() => T['button']` |  |
| `getCapsLockIndicatorProps` | `() => T['element']` |  |
| `getStrengthMeterProps` | `() => T['element']` | 强度条：档位写在 data-level 与 aria-valuenow 上；未提供 strength 时带 hidden 收起。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus on visibility-trigger, 控件未禁用 | 切换明暗；切换按钮是原生 button，这两个键由平台转换为 click。焦点留在按钮上，输入框中的光标与选中范围原样恢复 |
| `CapsLock` | focus in input | 每次按键都重读一次大写锁定状态：开着就亮起提示，焦点离开输入框即熄灭 |
| `Enter` / `Space` | held on visibility-trigger, 控件未禁用 | 按住期间切换按钮投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，按住途中明暗翻面不影响按压面。只读不拦明暗，按压面也照常给 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-describedby` | `capsLock` 部件的 id \| undefined |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `visibility-trigger` | `aria-controls` | `password-input-input` 部件的 id |
| `visibility-trigger` | `aria-label` | label.visibilityTriggerHide \| label.visibilityTriggerShow |
| `caps-lock-indicator` | `aria-atomic` | 'true' |
| `caps-lock-indicator` | `aria-live` | 'polite' |
| `caps-lock-indicator` | `role` | 'status' |
| `strength-meter` | `aria-label` | label.strengthMeter |
| `strength-meter` | `aria-valuemax` | 4 |
| `strength-meter` | `aria-valuemin` | 0 |
| `strength-meter` | `aria-valuenow` | undefined \| Math.min(Math.max(Math.trunc(rawStrength), 0), STRENG… |
| `strength-meter` | `role` | 'meter' |

- 切换按钮的名称随状态变化：隐藏时为“显示密码”，显示时为“隐藏密码”，两句都来自 `translations`。名称已经说明当前状态，因此不再叠加 `aria-pressed`，避免读出“隐藏密码 已按下”这类混淆信息。
- 切换按钮的 `aria-controls` 指向输入框，读屏可以跳到被切换的输入框。
- 大写锁定提示是 `role="status"` 的活动区域，节点始终在场、始终渲染，开与关只替换区内文字。活动区域播报的是内容变化，区域本身被 `hidden` 或 `display: none` 撤下再出现时，读屏会视为插入新节点而多数不读，因此该区域不按需挂载，也不依赖显隐触发播报。
- 提示区的文字来自 `translations.capsLockOn`，由组件写入节点，作者把该节点留空即可；需要图标时在该部件上挂 `::before`。
- 焦点晚于提示出现的用户，通过输入框的 `aria-describedby` 也能听到同一句。
- 输入框始终带 `spellcheck="false"` / `autocapitalize="off"` / `autocorrect="off"`：切换为明文时它就是普通文本框，拼写检查会把内容发送到远端服务，移动端还会自动大写首字母并按词典纠错。

## 样式参考

### 皮肤

`@xihan-ui/styles/password-input.css` 使用 `[data-scope="password-input"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-readonly` | ''（条件成立时才出现） |
| `input` | `data-xh-field-input` | '' |
| `input` | `data-xh-field-layout` | 'single-line' |
| `visibility-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `visibility-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `visibility-trigger` | `data-state` | 'visible' \| 'hidden' |
| `visibility-trigger` | `data-xh-action-control` | '' |
| `visibility-trigger` | `data-xh-action-display` | 'always' |
| `visibility-trigger` | `data-xh-action-profile` | 'field-inset' |
| `visibility-trigger` | `data-xh-action-size` | props.size |
| `visibility-trigger` | `data-xh-action-variant` | 'ghost' |
| `caps-lock-indicator` | `data-state` | 'visible' \| 'hidden' |
| `strength-meter` | `data-disabled` | ''（条件成立时才出现） |
| `strength-meter` | `data-level` | undefined \| String(strength) |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-password-input-caps-lock-fg` | `caps-lock-indicator` | `color` | `default` | `--xh-fg-muted` | password-input 的 caps-lock-indicator 部件 color 覆盖槽。 |
| `--xh-password-input-caps-lock-fg-disabled` | `caps-lock-indicator`<br>`control` | `color` | `disabled` | `--xh-fg-disabled` | password-input 的 caps-lock-indicator、control 部件 color 覆盖槽。 |
| `--xh-password-input-caps-lock-font-size` | `caps-lock-indicator` | `font-size` | `default` | `--xh-_password-input-caps-lock-font-size` | password-input 的 caps-lock-indicator 部件 font-size 覆盖槽。 |
| `--xh-password-input-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` | password-input 的 control 部件 background-color 覆盖槽。 |
| `--xh-password-input-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` | password-input 的 control 部件 background-color 覆盖槽。 |
| `--xh-password-input-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` | password-input 的 control 部件 background-color 覆盖槽。 |
| `--xh-password-input-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` | password-input 的 control 部件 background-color 覆盖槽。 |
| `--xh-password-input-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` | password-input 的 control 部件 border 覆盖槽。 |
| `--xh-password-input-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` | password-input 的 control 部件 border-color 覆盖槽。 |
| `--xh-password-input-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` | password-input 的 control 部件 border-color 覆盖槽。 |
| `--xh-password-input-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` | password-input 的 control 部件 border-color 覆盖槽。 |
| `--xh-password-input-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` | password-input 的 control 部件 color 覆盖槽。 |
| `--xh-password-input-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_password-input-gap` | password-input 的 control 部件 gap 覆盖槽。 |
| `--xh-password-input-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_password-input-h` | password-input 的 control 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-password-input-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` | password-input 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-password-input-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_password-input-px` | password-input 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-password-input-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` | password-input 的 control 部件 border-radius 覆盖槽。 |
| `--xh-password-input-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` | password-input 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-password-input-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` | password-input 的 root 部件 inline-size、min-inline-size 覆盖槽。 |
| `--xh-password-input-gap` | `root` | `gap` | `default` | `--xh-space-1` | password-input 的 root 部件 gap 覆盖槽。 |
| `--xh-password-input-icon-size` | `control`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | password-input 的 control、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-password-input-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-bg-canvas` | password-input 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-password-input-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-fg-default` | password-input 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-password-input-input-fg` | `input` | `color` | `xh-field-input` | `--xh-fg-default` | password-input 的 input 部件 color 覆盖槽。 |
| `--xh-password-input-input-font-size` | `input` | `font-size` | `xh-field-input` | `--xh-_password-input-font-size` | password-input 的 input 部件 font-size 覆盖槽。 |
| `--xh-password-input-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | password-input 的 label 部件 color 覆盖槽。 |
| `--xh-password-input-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | password-input 的 label 部件 color 覆盖槽。 |
| `--xh-password-input-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | password-input 的 label 部件 font-size 覆盖槽。 |
| `--xh-password-input-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | password-input 的 label 部件 font-weight 覆盖槽。 |
| `--xh-password-input-placeholder-fg` | `input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` | password-input 的 input 部件 color 覆盖槽。 |
| `--xh-password-input-strength-fg` | `strength-meter` | `background` | `empty` | `--xh-_password-input-strength-fg` | password-input 的 strength-meter 部件 background 覆盖槽。 |
| `--xh-password-input-strength-radius` | `strength-meter` | `border-radius` | `default` | `--xh-shape-pill` | password-input 的 strength-meter 部件 border-radius 覆盖槽。 |
| `--xh-password-input-strength-thickness` | `strength-meter` | `block-size` | `default` | `--xh-track-thickness` | password-input 的 strength-meter 部件 block-size 覆盖槽。 |
| `--xh-password-input-strength-track` | `strength-meter` | `background` | `default` | `--xh-bg-subtle-active` | password-input 的 strength-meter 部件 background 覆盖槽。 |
| `--xh-password-input-trigger-bg` | `visibility-trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | password-input 的 visibility-trigger 部件 background-color 覆盖槽。 |
| `--xh-password-input-trigger-bg-active` | `visibility-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | password-input 的 visibility-trigger 部件 background-color 覆盖槽。 |
| `--xh-password-input-trigger-bg-hover` | `visibility-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | password-input 的 visibility-trigger 部件 background-color 覆盖槽。 |
| `--xh-password-input-trigger-fg` | `visibility-trigger` | `color` | `default` | `--xh-fg-muted` | password-input 的 visibility-trigger 部件 color 覆盖槽。 |
| `--xh-password-input-trigger-fg-hover` | `visibility-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` | password-input 的 visibility-trigger 部件 color 覆盖槽。 |
| `--xh-password-input-trigger-font-size` | `visibility-trigger` | `font-size` | `default` | `--xh-_password-input-trigger-font-size` | password-input 的 visibility-trigger 部件 font-size 覆盖槽。 |
| `--xh-password-input-trigger-radius` | `visibility-trigger` | `border-radius` | `default` | `--xh-shape-inset` | password-input 的 visibility-trigger 部件 border-radius 覆盖槽。 |
| `--xh-password-input-trigger-size` | `visibility-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` | password-input 的 visibility-trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-password-input-visibility-trigger-separator-color` | `control`<br>`input`<br>`visibility-trigger` | `background-image` | `has(~ [data-scope='password-input'][data-part='input'])` | `--xh-border-subtle` | password-input 的 control、input、visibility-trigger 部件 background-image 覆盖槽。 |
| `--xh-password-input-visibility-trigger-separator-h` | `control`<br>`input`<br>`visibility-trigger` | `background-size` | `has(~ [data-scope='password-input'][data-part='input'])` | `--xh-_password-input-divider-h` | password-input 的 control、input、visibility-trigger 部件 background-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

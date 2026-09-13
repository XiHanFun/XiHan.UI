来源：https://ui.docs.xihanfun.com/components/hotkeys

# Hotkeys 快捷键 `alpha`

用于注册全局或局部键盘快捷键，不渲染 DOM。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/hotkeys" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/hotkeys" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/hotkeys" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/hotkeys.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

注册全局快捷键

```vue
<script setup lang="ts">
import { XhHotkeys } from "@xihan-ui/vue";
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <XhHotkeys :keys="['Mod', 'S']" @hot-key="count += 1" />
  <output>按下 Mod + S · {{ count ? `已触发 ${count} 次` : "等待输入" }}</output>
</template>
```

```html
<xh-hotkeys id="save-hotkey" keys="Mod,S"></xh-hotkeys>
<output id="save-hotkey-output">按下 Mod + S · 等待输入</output>

<script type="module">
  let count = 0;
  document.querySelector("#save-hotkey").addEventListener("hot-key", () => {
    count += 1;
    document.querySelector("#save-hotkey-output").textContent = `按下 Mod + S · 已触发 ${count} 次`;
  });
</script>
```

## 示例

### 局部范围

仅在指定区域内响应

```vue
<script setup lang="ts">
import { XhHotkeys } from "@xihan-ui/vue";
import { ref } from "vue";

const count = ref(0);
const scope = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="scope"
    tabindex="0"
    style="padding: 12px 16px; border-radius: var(--xh-shape-control); background: var(--xh-bg-subtle)"
  >
    聚焦后按 Mod + Enter · {{ count ? `已触发 ${count} 次` : "等待输入" }}
    <XhHotkeys :keys="['Mod', 'Enter']" :target="() => scope" @hot-key="count += 1" />
  </div>
</template>
```

```html
<div id="scoped-hotkey-area" tabindex="0" style="padding: 12px 16px; border-radius: var(--xh-shape-control); background: var(--xh-bg-subtle)">
  聚焦后按 Mod + Enter · <span>等待输入</span>
  <xh-hotkeys id="scoped-hotkey" keys="Mod,Enter"></xh-hotkeys>
</div>

<script type="module">
  const area = document.querySelector("#scoped-hotkey-area");
  const hotkey = document.querySelector("#scoped-hotkey");
  let count = 0;
  hotkey.target = () => area;
  hotkey.addEventListener("hot-key", () => {
    count += 1;
    area.querySelector("span").textContent = `已触发 ${count} 次`;
  });
</script>
```

### 启用状态

动态启用或暂停监听

```vue
<script setup lang="ts">
import { XhHotkeys } from "@xihan-ui/vue";
import { ref } from "vue";

const enabled = ref(true);
const count = ref(0);
</script>

<template>
  <label style="display: flex; align-items: center; gap: 8px">
    <input v-model="enabled" type="checkbox">
    启用 Mod + B
  </label>
  <XhHotkeys :keys="['Mod', 'B']" :enabled="enabled" @hot-key="count += 1" />
  <output>{{ count ? `已触发 ${count} 次` : "等待输入" }}</output>
</template>
```

```html
<label style="display: flex; align-items: center; gap: 8px">
  <input id="toggle-hotkey-enabled" type="checkbox" checked />
  启用 Mod + B
</label>
<xh-hotkeys id="toggle-hotkey" keys="Mod,B"></xh-hotkeys>
<output id="toggle-hotkey-output">等待输入</output>

<script type="module">
  const enabled = document.querySelector("#toggle-hotkey-enabled");
  const hotkey = document.querySelector("#toggle-hotkey");
  const output = document.querySelector("#toggle-hotkey-output");
  let count = 0;
  enabled.addEventListener("change", () => {
    hotkey.enabled = enabled.checked;
  });
  hotkey.addEventListener("hot-key", () => {
    count += 1;
    output.textContent = `已触发 ${count} 次`;
  });
</script>
```

### 组合式函数

不渲染组件实例

```vue
<script setup lang="ts">
import { useHotkeys } from "@xihan-ui/vue";
import { ref } from "vue";

const count = ref(0);

useHotkeys(() => ({
  keys: ["Mod", "K"],
  onHotKey: () => {
    count.value += 1;
  },
}));
</script>

<template>
  <output>按下 Mod + K · {{ count ? `已触发 ${count} 次` : "等待输入" }}</output>
</template>
```

```html
<xh-hotkeys id="register-only-hotkey" keys="Mod,K"></xh-hotkeys>
<output id="register-only-output">按下 Mod + K · 等待输入</output>

<script type="module">
  let count = 0;
  document.querySelector("#register-only-hotkey").addEventListener("hot-key", () => {
    count += 1;
    document.querySelector("#register-only-output").textContent = `按下 Mod + K · 已触发 ${count} 次`;
  });
</script>
```

## 设计指引

### 何时使用

- 为按钮、菜单项或命令增加键盘入口。
- 在指定区域内监听组合键。

### 何时不用

- 仅展示快捷键时，使用[键帽组](./kbd-group)。
- 组件内部的方向键导航由对应组件处理。

### 特性

- 支持组件和 `useHotkeys` 两种注册方式。
- `Mod` 在 macOS 上匹配 Meta，其他平台匹配 Control。
- 组合键精确匹配，不忽略额外修饰键。
- 默认阻止命中的浏览器动作。
- 输入和输入法组合期间保留正常文字输入。
- `target` 可限制监听范围。

### 组合

- 与[键帽组](./kbd-group)组合展示快捷键提示。

### 最佳实践

- 跨平台主修饰键使用 `Mod`。
- 局部快捷键显式提供目标元素。
- 为快捷键提供可点击的等价操作。

### 反模式

- 不要仅为展示键帽而注册监听。
- 不要为同一动作注册冲突组合。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-hotkeys>` |
| Vue 组件 | `XhHotkeys` |
| 组合式函数 | `useHotkeys` |
| 状态机 | 无，`connect` 直接由 props 算属性 |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `boolean` |  | 监听是否生效，缺省开启；关掉后组合不再触发。 |
| `keys` | `string[]` | 是 | 组合里的各枚键，如 `['Mod', 'S']`。 'Mod' 在 Mac 上是 ⌘、其余平台是 Ctrl；'Shift' / 'Alt' / 'Ctrl' / 'Meta' 各自对应那一枚。 除修饰键外必须且只能有一枚主键；空组合、空键或多主键声明直接报错。 |
| `onHotKey` | `(details: HotkeysTriggerDetails) => void` |  | 组合被按出来时的回调。 |
| `platform` | `HotkeysPlatform` |  | 按哪个平台解析匹配。 缺省 'auto'：读 navigator 会在服务端渲染时炸，所以 headless 只认显式值， 由适配器挂载后测出来传进来；未落定前按非 Mac 出。 |
| `preventDefault` | `boolean` |  | 命中后拦下浏览器的默认动作，缺省开启（注册 Mod+S 就是为了不让浏览器弹保存）。 |
| `target` | `HotkeysTarget` |  | 监听装在哪儿，缺省 'document'；局部监听传返回 EventTarget 的函数。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `hot-key` | `HotkeysTriggerDetails` | 组合被按出来；detail 为 `{ keys: string[], event: KeyboardEvent }` |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `platform` | `HotkeysResolvedPlatform` | 实际采用的平台写法。 |
| `enabled` | `boolean` | 监听当前是否生效。 |
| `target` | `HotkeysTarget` | 监听该装在哪儿，适配器据此挑节点。 |
| `resolveTarget` | `(documentTarget: EventTarget \| null) => EventTarget \| null` | 解析并校验真实监听目标；适配器只负责提供所属 Document，不各自复制判断。 |
| `matches` | `(event: KeyboardEvent) => boolean` | 这次按键是否命中本组合（含输入法组合期与打字落点的排除）。 |
| `handleKeyDown` | `(event: KeyboardEvent) => void` | 适配器把它挂到监听节点的 keydown 上：命中即按 preventDefault 决定拦不拦，并回调 onHotKey。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/TR/uievents/#event-type-keydown)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `keys 指定的组合` | enabled 未关，且不在输入法组合期 | 触发 onHotKey；preventDefault 开启（默认）时同时拦下浏览器的默认动作 |
| `keys 指定的组合` | 组合里没有 Ctrl / Meta / Alt，且按键落在输入框、文本域或可编辑区里 | 不触发也不拦：这类组合与打字撞车，输入优先 |

- 快捷键不能成为操作的唯一路径。
- 避免覆盖浏览器和辅助技术的常用组合。

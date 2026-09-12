来源：https://ui.docs.xihanfun.com/components/hotkeys

# Hotkeys `快捷键`

注册并匹配一组键盘组合，不渲染任何 DOM。可见键帽由[键帽](./kbd)与[键帽组](./kbd-group)负责，展示不会隐式安装全局监听。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/hotkeys" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/hotkeys" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/hotkeys" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/hotkeys.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一组组合的键帽：Mod 在 Mac 上出 ⌘、其余平台出 Ctrl，平台由组件自己测出来

```vue
<script setup lang="ts">
import { XhHotkeys, XhKbdGroup } from "@xihan-ui/vue";
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <div style="display: flex; align-items: center; gap: 8px">
    <!-- 展示与注册显式组合；Hotkeys 自身不渲染 DOM -->
    <XhKbdGroup :keys="['Mod', 'S']" />
    <XhHotkeys :keys="['Mod', 'S']" @hot-key="count += 1" />
    <span>已按下 {{ count }} 次</span>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 8px">
  <!-- 展示与注册显式组合；两者各自挂载后使用同一平台规则 -->
  <xh-kbd-group keys="Mod,S">
    <span data-xh-part="root"></span>
  </xh-kbd-group>
  <xh-hotkeys id="hotkeys-basic" keys="Mod,S"></xh-hotkeys>
  <span id="hotkeys-basic-count">已按下 0 次</span>
</div>

<script type="module">
  // 行为宿主不生成任何展示节点，组合命中经 hot-key 事件冒泡出来
  const host = document.getElementById("hotkeys-basic");
  const readout = document.getElementById("hotkeys-basic-count");
  let count = 0;
  host.addEventListener("hot-key", () => {
    count += 1;
    readout.textContent = `已按下 ${count} 次`;
  });
</script>
```

## 示例

### 限定范围

target 显式返回真实容器，只在这一层接组合

```vue
<script setup lang="ts">
import { XhHotkeys, XhKbdGroup } from "@xihan-ui/vue";
import { ref } from "vue";

const hits = ref(0);
const scope = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="scope"
    style="
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border: 1px solid currentColor;
      border-radius: 8px;
    "
  >
    <!-- 监听装在这一层容器上：焦点在框外时按同一组合不会触发 -->
    <input placeholder="在这里按 Mod+Enter">
    <XhKbdGroup :keys="['Mod', 'Enter']" />
    <XhHotkeys :keys="['Mod', 'Enter']" :target="() => scope" @hot-key="hits += 1" />
    <span>框内已触发 {{ hits }} 次</span>
  </div>
</template>
```

```html
<div
  id="hotkeys-scope"
  style="
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border: 1px solid currentColor;
    border-radius: 8px;
  "
>
  <!-- 监听装在这一层容器上：焦点在框外时按同一组合不会触发 -->
  <input placeholder="在这里按 Mod+Enter" />
  <xh-kbd-group keys="Mod,Enter">
    <span data-xh-part="root"></span>
  </xh-kbd-group>
  <xh-hotkeys id="hotkeys-scoped" keys="Mod,Enter"></xh-hotkeys>
  <span id="hotkeys-scoped-count">框内已触发 0 次</span>
</div>

<script type="module">
  // 监听虽然装在容器上，事件仍从元素自己派出来
  const host = document.getElementById("hotkeys-scoped");
  const scope = document.getElementById("hotkeys-scope");
  host.target = () => scope;
  const readout = document.getElementById("hotkeys-scoped-count");
  let hits = 0;
  host.addEventListener("hot-key", () => {
    hits += 1;
    readout.textContent = `框内已触发 ${hits} 次`;
  });
</script>
```

### 开关监听

enabled 只控制行为，KbdGroup 的 disabled 由业务显式同步

```vue
<script setup lang="ts">
import { XhHotkeys, XhKbdGroup } from "@xihan-ui/vue";
import { ref } from "vue";

const enabled = ref(true);
const hits = ref(0);
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <label style="display: flex; align-items: center; gap: 4px">
      <input v-model="enabled" type="checkbox">
      监听生效
    </label>
    <XhKbdGroup :keys="['Mod', 'B']" :disabled="!enabled" />
    <XhHotkeys :keys="['Mod', 'B']" :enabled="enabled" @hot-key="hits += 1" />
    <span>已触发 {{ hits }} 次</span>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 12px">
  <label style="display: flex; align-items: center; gap: 4px">
    <input id="hotkeys-toggle-switch" type="checkbox" checked />
    监听生效
  </label>
  <xh-kbd-group id="hotkeys-toggle-display" keys="Mod,B">
    <span data-xh-part="root"></span>
  </xh-kbd-group>
  <xh-hotkeys id="hotkeys-toggle" keys="Mod,B"></xh-hotkeys>
  <span id="hotkeys-toggle-count">已触发 0 次</span>
</div>

<script type="module">
  // enabled 是三态属性：关掉要写 enabled="false"，摘掉属性等于回到默认的开启
  const host = document.getElementById("hotkeys-toggle");
  const display = document.getElementById("hotkeys-toggle-display");
  const box = document.getElementById("hotkeys-toggle-switch");
  const readout = document.getElementById("hotkeys-toggle-count");
  let hits = 0;
  box.addEventListener("change", () => {
    host.setAttribute("enabled", box.checked ? "true" : "false");
    display.setAttribute("disabled", box.checked ? "false" : "true");
  });
  host.addEventListener("hot-key", () => {
    hits += 1;
    readout.textContent = `已触发 ${hits} 次`;
  });
</script>
```

### 只注册不显示

useHotkeys 只安装监听，展示是 Kbd/KbdGroup 的独立职责

```vue
<script setup lang="ts">
import { useHotkeys } from "@xihan-ui/vue";
import { ref } from "vue";

const hits = ref(0);

useHotkeys(() => ({
  keys: ["Mod", "k"],
  preventDefault: true,
  onHotKey: () => {
    hits.value += 1;
  },
}));
</script>

<template>
  <p>按 Mod+K（Mac 上是 ⌘K）：已命中 {{ hits }} 次。这一段没有渲染任何键帽。</p>
</template>
```

```html
<p>
  按 Mod+K（Mac 上是 ⌘K）：已命中 <span id="hotkeys-register-only-count">0</span>
  次。这一段没有显示任何键帽。
</p>

<!-- 元素本身就是无视觉行为宿主，不需要 hidden root 或任何其他子节点 -->
<xh-hotkeys id="hotkeys-register-only" keys="Mod,k"></xh-hotkeys>

<script type="module">
  // 命中经 hot-key 事件冒泡出来，这里只记次数
  const host = document.getElementById("hotkeys-register-only");
  const readout = document.getElementById("hotkeys-register-only-count");
  let hits = 0;
  host.addEventListener("hot-key", () => {
    hits += 1;
    readout.textContent = String(hits);
  });
</script>
```

## 设计指引

### 何时使用

- 给已有按钮、菜单项或命令增加键盘通路。
- 在组件生命周期内注册一条全局或明确局部范围的组合。

### 何时不用

- 只展示组合：用[键帽组](./kbd-group)。
- 只展示一枚键：用[键帽](./kbd)。
- 处理菜单、工具条等 APG 组件自身的方向键导航：使用对应组件内建行为。

### 特性

- `XhHotkeys` / `<xh-hotkeys>` 与 `useHotkeys` 都只安装监听，不输出键帽或展示容器。
- `keys` 必填、非空且必须恰好包含一枚主键；无效声明直接报错，不注册永远无法命中的死监听。
- `Mod` 在 Mac 上匹配 Meta，其余平台匹配 Control；平台自动侦测只在适配器挂载后发生。
- 修饰键逐个全等比对：注册 Ctrl+S 时，Ctrl+Shift+S 不会误命中。
- 命中后默认阻止浏览器默认动作，`preventDefault` 可显式关闭。
- 没有 Ctrl / Meta / Alt 的组合在输入框、文本域、下拉或可编辑区内让给输入。
- 输入法组合期间不响应。
- `target` 缺省为所属 Document；局部监听必须传返回真实 EventTarget 的 resolver，不猜组件父节点。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-hotkeys>` |
| Vue 组件 | `XhHotkeys` |
| 组合式函数 | `useHotkeys` |
| 状态机 | 无，`connect` 直接由 props 算属性 |

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `boolean` |  | 监听是否生效，缺省开启；关掉后组合不再触发。 |
| `keys` | `string[]` | 是 | 组合里的各枚键，如 `['Mod', 'S']`。 'Mod' 在 Mac 上是 ⌘、其余平台是 Ctrl；'Shift' / 'Alt' / 'Ctrl' / 'Meta' 各自对应那一枚。 除修饰键外必须且只能有一枚主键；空组合、空键或多主键声明直接报错。 |
| `onHotKey` | `(details: HotkeysTriggerDetails) => void` |  | 组合被按出来时的回调。 |
| `platform` | `HotkeysPlatform` |  | 按哪个平台解析匹配。 缺省 'auto'：读 navigator 会在服务端渲染时炸，所以 headless 只认显式值， 由适配器挂载后测出来传进来；未落定前按非 Mac 出。 |
| `preventDefault` | `boolean` |  | 命中后拦下浏览器的默认动作，缺省开启（注册 Mod+S 就是为了不让浏览器弹保存）。 |
| `target` | `HotkeysTarget` |  | 监听装在哪儿，缺省 'document'；局部监听传返回 EventTarget 的函数。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `hot-key` | `HotkeysTriggerDetails` | 组合被按出来；detail 为 `{ keys: string[], event: KeyboardEvent }` |

## connect API

`useHotkeys` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `platform` | `HotkeysResolvedPlatform` | 实际采用的平台写法。 |
| `enabled` | `boolean` | 监听当前是否生效。 |
| `target` | `HotkeysTarget` | 监听该装在哪儿，适配器据此挑节点。 |
| `resolveTarget` | `(documentTarget: EventTarget \| null) => EventTarget \| null` | 解析并校验真实监听目标；适配器只负责提供所属 Document，不各自复制判断。 |
| `matches` | `(event: KeyboardEvent) => boolean` | 这次按键是否命中本组合（含输入法组合期与打字落点的排除）。 |
| `handleKeyDown` | `(event: KeyboardEvent) => void` | 适配器把它挂到监听节点的 keydown 上：命中即按 preventDefault 决定拦不拦，并回调 onHotKey。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/TR/uievents/#event-type-keydown)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `keys 指定的组合` | enabled 未关，且不在输入法组合期 | 触发 onHotKey；preventDefault 开启（默认）时同时拦下浏览器的默认动作 |
| `keys 指定的组合` | 组合里没有 Ctrl / Meta / Alt，且按键落在输入框、文本域或可编辑区里 | 不触发也不拦：这类组合与打字撞车，输入优先 |

## 无障碍

- 快捷键不能成为动作的唯一路径，必须有可见且可点击的等价入口。
- 展示提示显式组合 KbdGroup；它用组级名称只朗读一次组合。
- 避免占用浏览器和读屏既有组合。

## 组合

- XhHotkeys 负责触发动作，XhKbdGroup 负责在动作入口旁展示同一份 `keys`。
- React/Vue 的 renderless 组件不渲染 children；Web Components 行为宿主也不接管子节点，保持元素为空。

## 最佳实践

- 全局动作使用 `target="document"` 缺省；局部动作显式返回面板节点。
- 组件卸载或组合式作用域销毁后监听会自动解绑；命令式提前停止使用 `stop()`。
- 跨平台主修饰键写 `Mod`，不要写死 Ctrl 或 Meta。

## 反模式

- 用 XhHotkeys 只为了显示键帽。
- 使用已删除的 `target="parent"` 依赖不可见宿主猜测范围。
- 传空 keys 或多个主键，得到静默无效注册。

来源：https://ui.docs.xihanfun.com/components/toast

# Toast 轻提示

一条会自动消失的短反馈：状态字形、标题与可选的一行补充说明。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/toast" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/toast.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/toast" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/toast" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/toast.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

默认由状态图标、文本列和悬停显示的关闭按钮组成；duration 设为 0 即不自动消失

```vue
<script setup lang="ts">
import {
  XhButton,
  XhToastCloseTrigger,
  XhToastContent,
  XhToastIndicator,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 关掉之后换一个 key 重新挂一条，方便反复看
const seq = ref(0);
</script>

<template>
  <div style="display: grid; width: 100%; gap: 12px; justify-items: center">
    <XhToastRoot
      :key="seq"
      title="草稿已保存"
      :duration="0"
      :translations="{ close: '关闭' }"
    >
      <XhToastIndicator />
      <XhToastContent><XhToastTitle /></XhToastContent>
      <XhToastCloseTrigger />
    </XhToastRoot>
    <XhButton size="sm" variant="outline" @click="seq++">再挂一条</XhButton>
  </div>
</template>
```

```html
<div style="display: grid; width: 100%; gap: 12px; justify-items: center">
  <div id="toast-basic-slot"></div>
  <xh-button id="toast-basic-again" size="sm" variant="outline">
    <button data-xh-part="root">再挂一条</button>
  </xh-button>
</div>

<template id="toast-basic-template">
  <xh-toast title="草稿已保存" duration="0">
    <div data-xh-part="root">
      <span data-xh-part="indicator"></span>
      <div data-xh-part="content"><div data-xh-part="title"></div></div>
      <button data-xh-part="close-trigger"></button>
    </div>
  </xh-toast>
</template>

<script type="module">
  const slot = document.getElementById("toast-basic-slot");
  const template = document.getElementById("toast-basic-template");

  // 关掉之后换一条新的挂上去，方便反复看
  function mount() {
    const node = document.importNode(template.content.firstElementChild, true);
    // 文案是对象，只走 property
    node.translations = { close: "关闭" };
    slot.replaceChildren(node);
  }

  mount();
  document.getElementById("toast-basic-again").addEventListener("click", mount);
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="toast"`：**`root`** · `indicator` · **`content`** · `title` · `description` · `action-trigger` · `progress` · `close-trigger` · `group`

## 示例

### 颜色

卡片保持中性，tone 只改变标题与状态字形；danger 使用 assertive 实时区，loading 另有一档，显示加载且不自动消失

```vue
<script setup lang="ts">
import {
  XhToastContent,
  XhToastIndicator,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/vue";

const items = [
  { tone: "info", loading: false, title: "草稿已保存" },
  { tone: "success", loading: false, title: "发布成功" },
  { tone: "warning", loading: false, title: "配额即将用尽" },
  { tone: "danger", loading: false, title: "同步失败，稍后自动重试" },
  { tone: "info", loading: true, title: "正在上传" },
] as const;
</script>

<template>
  <div style="display: grid; width: 100%; gap: 12px; justify-items: center">
    <XhToastRoot
      v-for="item in items"
      :key="item.title"
      :tone="item.tone"
      :loading="item.loading"
      :title="item.title"
      :duration="0"
      :closable="false"
    >
      <XhToastIndicator />
      <XhToastContent><XhToastTitle /></XhToastContent>
    </XhToastRoot>
  </div>
</template>
```

```html
<div style="display: grid; width: 100%; gap: 12px; justify-items: center">
  <xh-toast tone="info" title="草稿已保存" duration="0" closable="false">
    <div data-xh-part="root"><span data-xh-part="indicator"></span><div data-xh-part="content"><div data-xh-part="title"></div></div></div>
  </xh-toast>
  <xh-toast tone="success" title="发布成功" duration="0" closable="false">
    <div data-xh-part="root"><span data-xh-part="indicator"></span><div data-xh-part="content"><div data-xh-part="title"></div></div></div>
  </xh-toast>
  <xh-toast tone="warning" title="配额即将用尽" duration="0" closable="false">
    <div data-xh-part="root"><span data-xh-part="indicator"></span><div data-xh-part="content"><div data-xh-part="title"></div></div></div>
  </xh-toast>
  <xh-toast tone="danger" title="同步失败，稍后自动重试" duration="0" closable="false">
    <div data-xh-part="root"><span data-xh-part="indicator"></span><div data-xh-part="content"><div data-xh-part="title"></div></div></div>
  </xh-toast>
  <xh-toast loading title="正在上传" duration="0" closable="false">
    <div data-xh-part="root"><span data-xh-part="indicator"></span><div data-xh-part="content"><div data-xh-part="title"></div></div></div>
  </xh-toast>
</div>
```

### 计时与暂停

duration 结束后自动退场；指针停在提示条上或焦点进入提示条内都会暂停计时，离开后继续剩余部分

```vue
<script setup lang="ts">
import {
  XhButton,
  XhToastCloseTrigger,
  XhToastContent,
  XhToastIndicator,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

const seq = ref(0);
</script>

<template>
  <div style="display: grid; width: 100%; gap: 12px; justify-items: center">
    <XhToastRoot
      :key="seq"
      v-slot="{ status, paused }"
      title="6 秒后自动收走"
      :duration="6000"
      :translations="{ close: '关闭' }"
    >
      <XhToastIndicator />
      <XhToastContent>
        <XhToastTitle />
        <span style="font-size: 12px; opacity: 0.75">
          状态：{{ status }} · {{ paused ? "计时已按住" : "计时在走" }}
        </span>
      </XhToastContent>
      <XhToastCloseTrigger />
    </XhToastRoot>
    <XhButton size="sm" variant="outline" @click="seq++">重新计时</XhButton>
  </div>
</template>
```

```html
<div style="display: grid; width: 100%; gap: 12px; justify-items: center">
  <div id="toast-pause-slot"></div>
  <xh-button id="toast-pause-again" size="sm" variant="outline">
    <button data-xh-part="root">重新计时</button>
  </xh-button>
</div>

<template id="toast-pause-template">
  <xh-toast
    title="6 秒后自动收走"
    duration="6000"
  >
    <div data-xh-part="root">
      <span data-xh-part="indicator"></span>
      <div data-xh-part="content">
        <div data-xh-part="title"></div>
        <span data-readout style="font-size: 12px; opacity: 0.75"></span>
      </div>
      <button data-xh-part="close-trigger"></button>
    </div>
  </xh-toast>
</template>

<script type="module">
  const slot = document.getElementById("toast-pause-slot");
  const template = document.getElementById("toast-pause-template");
  let watcher;

  // 生命周期与暂停态都写在 root 上，照它回显
  function mount() {
    const node = document.importNode(template.content.firstElementChild, true);
    node.translations = { close: "关闭" };
    slot.replaceChildren(node);

    const root = node.querySelector('[data-xh-part="root"]');
    const readout = node.querySelector("[data-readout]");
    const paint = () => {
      const paused = root.hasAttribute("data-paused");
      readout.textContent = `状态：${root.dataset.state ?? ""} · ${
        paused ? "计时已按住" : "计时在走"
      }`;
    };

    watcher?.disconnect();
    watcher = new MutationObserver(paint);
    watcher.observe(root, {
      attributes: true,
      attributeFilter: ["data-state", "data-paused"],
    });
    paint();
  }

  mount();
  document.getElementById("toast-pause-again").addEventListener("click", mount);
</script>
```

### 操作按钮

action-trigger 按下时先发 action 事件，再使该条进入退场；closable 决定是否保留关闭按钮

```vue
<script setup lang="ts">
import {
  XhButton,
  XhToastActionTrigger,
  XhToastCloseTrigger,
  XhToastContent,
  XhToastIndicator,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

const seq = ref(0);
const log = ref("（还没点）");

function onAction(details: { id: string }): void {
  log.value = `撤销了：${details.id}`;
}
</script>

<template>
  <div style="display: grid; width: 100%; gap: 12px; justify-items: center">
    <XhToastRoot
      id="toast-demo-action"
      :key="seq"
      title="已删除 1 个文件"
      :duration="0"
      :translations="{ close: '关闭' }"
      @action="onAction"
    >
      <XhToastIndicator />
      <XhToastContent><XhToastTitle /></XhToastContent>
      <XhToastActionTrigger>撤销</XhToastActionTrigger>
      <XhToastCloseTrigger />
    </XhToastRoot>
    <div style="display: flex; align-items: center; gap: 12px">
      <XhButton size="sm" variant="outline" @click="seq++">再挂一条</XhButton>
      <span>{{ log }}</span>
    </div>
  </div>
</template>
```

```html
<div style="display: grid; width: 100%; gap: 12px; justify-items: center">
  <div id="toast-action-slot"></div>
  <div style="display: flex; align-items: center; gap: 12px">
    <xh-button id="toast-action-again" size="sm" variant="outline">
      <button data-xh-part="root">再挂一条</button>
    </xh-button>
    <span id="toast-action-log">（还没点）</span>
  </div>
</div>

<template id="toast-action-template">
  <xh-toast
    id="toast-demo-action"
    title="已删除 1 个文件"
    duration="0"
  >
    <div data-xh-part="root">
      <span data-xh-part="indicator"></span>
      <div data-xh-part="content"><div data-xh-part="title"></div></div>
      <button data-xh-part="action-trigger">撤销</button>
      <button data-xh-part="close-trigger"></button>
    </div>
  </xh-toast>
</template>

<script type="module">
  const slot = document.getElementById("toast-action-slot");
  const template = document.getElementById("toast-action-template");
  const log = document.getElementById("toast-action-log");

  function mount() {
    const node = document.importNode(template.content.firstElementChild, true);
    node.translations = { close: "关闭" };
    slot.replaceChildren(node);
  }

  // action 带的是这条轻提示的身份，从容器上接冒泡上来的那一份
  slot.addEventListener("action", (event) => {
    log.textContent = `撤销了：${event.detail.id}`;
  });

  mount();
  document.getElementById("toast-action-again").addEventListener("click", mount);
</script>
```

### 补充说明

description 提供一行简短上下文；需要长时间阅读的内容改用 Notification

```vue
<script setup lang="ts">
import {
  XhToastCloseTrigger,
  XhToastContent,
  XhToastDescription,
  XhToastIndicator,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/vue";
</script>

<template>
  <XhToastRoot
    tone="success"
    title="文件已上传"
    description="可在项目资源中继续查看"
    :duration="0"
    :translations="{ close: '关闭' }"
  >
    <XhToastIndicator />
    <XhToastContent>
      <XhToastTitle />
      <XhToastDescription />
    </XhToastContent>
    <XhToastCloseTrigger />
  </XhToastRoot>
</template>
```

```html
<xh-toast
  tone="success"
  title="文件已上传"
  description="可在项目资源中继续查看"
  duration="0"
>
  <div data-xh-part="root">
    <span data-xh-part="indicator"></span>
    <div data-xh-part="content">
      <div data-xh-part="title"></div>
      <div data-xh-part="description"></div>
    </div>
    <button data-xh-part="close-trigger"></button>
  </div>
</xh-toast>

<script type="module">
  document.querySelector("xh-toast").translations = { close: "关闭" };
</script>
```

### 全局服务

轻提示没有容器组件，堆叠区由 createToastService 渲染；模块作用域随处可调用（请求拦截器、store）

```vue
<script setup lang="ts">
import type { ToastService } from "@xihan-ui/vue";
import { createToastService, XhButton } from "@xihan-ui/vue";
import { onBeforeUnmount } from "vue";

// 惰性建单例：服务要 document，等到第一次调用（必然在客户端）再建
let toast: ToastService | undefined;
function use(): ToastService {
  toast ??= createToastService();
  return toast;
}
onBeforeUnmount(() => toast?.dispose());

function save(): void {
  const id = use().loading("保存中");
  setTimeout(() => use().update(id, { loading: false, tone: "success", title: "已保存" }), 900);
}
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 8px">
    <XhButton variant="solid" @click="save()">保存（loading 收尾成 success）</XhButton>
    <XhButton variant="outline" @click="use().success('已发布')">success</XhButton>
    <XhButton variant="outline" @click="use().warning('配额即将用尽')">warning</XhButton>
    <XhButton variant="outline" @click="use().danger('同步失败')">danger</XhButton>
  </div>
</template>
```

## 设计指引

### 何时使用

- 一次操作的结果：“已保存”“已复制”“发送失败”。
- 反馈重要但不需要打断用户。

### 何时不用

- 用户必须知道并处理时，使用[警告提示](./alert)常驻，或使用[对话框](./dialog)阻断。
- 内容较长、需要持续阅读，或不是由用户操作触发时，使用[通知](./notification)。

### 特性

- `duration` 默认 4000ms；指针悬停或焦点进入时暂停计时，全局服务还会在页面转入后台时暂停。
- 可以带一个操作按钮（撤销、查看详情）。
- `tone` 只改变标题与状态字形，卡片始终使用中性浮层；`loading` 单独一档，字形换为旋转指示器且不自动消失。
- `closable` 默认开启；悬停或焦点进入卡片时显示关闭按钮。
- 全局服务默认将最新一条置于最前，后两层按 12px 偏移与 0.05 比例收拢；鼠标或焦点进入后按真实高度展开。

### 组合

- 没有容器组件：全局服务在底部渲染队列，默认最多显示 3 条、间距 12px。
- `content` 是必需的文本列，内部组合 `title` 与可选的 `description`。

### 最佳实践

- 破坏性操作配“撤销”按钮，体验优于事前确认对话框。
- 错误类提示停留更久，或不自动消失。

### 反模式

- 把错误详情放进轻提示，用户尚未读完就消失。
- 同一个动作连续发出多条。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toast>` |
| Vue 组件 | `XhToastActionTrigger` `XhToastCloseTrigger` `XhToastContent` `XhToastDescription` `XhToastIndicator` `XhToastProgress` `XhToastRoot` `XhToastTitle` |
| 组合式函数 | `useToast` |
| 状态机 | `toastMachine` |
| 皮肤 | `@xihan-ui/styles/toast.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` |  | 队列身份。服务档用它作为 create / update / dismiss 的寻址键。 |
| `title` | `string` |  | 标题文本；作者未在 title 部件中写内容时由适配器填入。 |
| `description` | `string` |  | 可选的补充说明；应保持简短，需要持续阅读的长内容改用 notification。 |
| `tone` | `ToastTone` |  | 语气，默认 info。danger 使用 alert + assertive。 |
| `loading` | `boolean` |  | 事情尚未完成：行首换为转圈，且不自动消失（duration 不再生效），完成后改写为其他语气收尾。 |
| `duration` | `number` |  | 停留毫秒，默认 4000。&lt;=0 或非有限数即不自动消失。 |
| `removeDelay` | `number` |  | 退场窗口毫秒，默认 300：进入 dismissing 后停留该时长再转为 unmounted，留给退场动画。 |
| `closable` | `boolean` |  | 是否显示可用的关闭按钮，默认 true。 |
| `pauseOnPageIdle` | `boolean` |  | 页面切到后台时暂停计时，默认 false；全局服务默认开启。 |
| `paused` | `boolean` |  | 由宿主暂停计时，默认 false。整组一起暂停经此路径： 置真时登记 'service' 暂停来源，置假时移除它，与指针、焦点等来源并存。 |
| `translations` | `Partial<ToastTranslations>` |  |  |
| `onStatusChange` | `(details: ToastStatusChangeDetails) => void` |  | 生命周期落定时通知：dismissing 与 unmounted 各一次。宿主据此把条目移出队列。 |
| `onAction` | `(details: ToastActionDetails) => void` |  | 操作按钮被按下。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `status-change` | `ToastStatusChangeDetails` | 生命周期落定；detail 为 `{ id: string, status: 'dismissing'\|'unmounted' }` |
| `action` | `ToastActionDetails` | 操作按钮被按下；detail 为 `{ id: string }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhToastRoot` | `default` | `ToastRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhToastRoot` | `children` | `SlotChildren<ToastRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | toStatus(state.get()) |
| `progress` | toStatus(state.get()) |

以下名称仅用于内部状态机。

**状态**：`visible` · `visible.running` · `visible.paused` · `dismissing` · `unmounted`

**事件**：`TOAST.DISMISS` · `TOAST.ACTION` · `TOAST.PAUSE` · `TOAST.RESUME` · `TOAST.RESET` · `after.duration` · `after.removeDelay` · `PRESS.START` · `PRESS.END`

**判据**：`isLastPauseSource` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` |  |
| `status` | `ToastStatus` |  |
| `tone` | `ToastTone` |  |
| `loading` | `boolean` |  |
| `title` | `string \| undefined` |  |
| `description` | `string \| undefined` |  |
| `paused` | `boolean` | 计时暂停中。倒计时的可见反馈由使用者自行渲染，该标记是留给使用者的钩子：自带皮肤不绘制。 |
| `closable` | `boolean` |  |
| `remaining` | `number` | 剩余毫秒；不自动消失时为 Infinity。 |
| `dismiss` | `() => void` |  |
| `pause` | `() => void` |  |
| `resume` | `() => void` |  |
| `duration` | `number` | 停留总时长（毫秒）；不自动消失时为 Infinity。 |
| `getRootProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` | 语气指示符：作者放入自己的图形，未放入时由皮肤按语气绘制兜底字形，加载中换为转圈。 |
| `getContentProps` | `() => T['element']` | 标题与说明的文本列。 |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getActionTriggerProps` | `() => T['button']` |  |
| `getProgressProps` | `() => T['element']` | 倒计时条：不自动消失时收起。 |
| `getCloseTriggerProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus 在 close-trigger 上且 closable | 立即进入 dismissing，走完 removeDelay 后转 unmounted |
| `Enter` / `Space` | focus 在 action-trigger 上 | 触发 onAction 并进入 dismissing |
| `Enter` / `Space` | held in close-trigger / action-trigger（close-trigger 须 closable） | 按住期间该按钮投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或进入退场撤下。notification 的卡片按钮同此 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-atomic` | 'true' |
| `root` | `aria-describedby` | `description` 部件的 id \| undefined |
| `root` | `aria-labelledby` | `title` 部件的 id |
| `root` | `aria-live` | 'assertive' \| 'polite' |
| `root` | `role` | 'alert' \| 'status' |
| `indicator` | `aria-hidden` | 'true' |
| `progress` | `aria-hidden` | 'true' |
| `close-trigger` | `aria-label` | props.translations.close |

## 样式参考

### 皮肤

`@xihan-ui/styles/toast.css` 使用 `[data-scope="toast"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-paused` | ''（条件成立时才出现） |
| `root` | `data-state` | toStatus(state.get()) |
| `root` | `data-tone` | props.tone |
| `indicator` | `data-loading` | ''（条件成立时才出现） |
| `action-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `action-trigger` | `data-xh-action-control` | '' |
| `action-trigger` | `data-xh-action-display` | 'always' |
| `action-trigger` | `data-xh-action-profile` | 'text' |
| `action-trigger` | `data-xh-action-size` | 'sm' |
| `action-trigger` | `data-xh-action-variant` | 'outline' |
| `progress` | `data-state` | toStatus(state.get()) |
| `close-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `close-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `close-trigger` | `data-xh-action-control` | '' |
| `close-trigger` | `data-xh-action-display` | 'always' |
| `close-trigger` | `data-xh-action-profile` | 'icon' |
| `close-trigger` | `data-xh-action-size` | 'xs' |
| `close-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-toast-action-bg` | `action-trigger` | `background-color` | `default` | `transparent` | toast 的 action-trigger 部件 background-color 覆盖槽。 |
| `--xh-toast-action-bg-active` | `action-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` | toast 的 action-trigger 部件 background-color 覆盖槽。 |
| `--xh-toast-action-bg-hover` | `action-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle` | toast 的 action-trigger 部件 background-color 覆盖槽。 |
| `--xh-toast-action-border` | `action-trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-border-control`<br>`--xh-border-control-hover` | toast 的 action-trigger 部件 border、border-color 覆盖槽。 |
| `--xh-toast-action-fg` | `action-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | toast 的 action-trigger 部件 color 覆盖槽。 |
| `--xh-toast-action-font-weight` | `action-trigger` | `font-weight` | `default` | `--xh-font-weight-medium` | toast 的 action-trigger 部件 font-weight 覆盖槽。 |
| `--xh-toast-action-h` | `action-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | toast 的 action-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-toast-action-px` | `action-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | toast 的 action-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-toast-action-radius` | `action-trigger` | `border-radius` | `default` | `--xh-shape-control` | toast 的 action-trigger 部件 border-radius 覆盖槽。 |
| `--xh-toast-bg` | `root` | `background` | `default` | `--xh-material-elevated-bg` | toast 的 root 部件 background 覆盖槽。 |
| `--xh-toast-border` | `root` | `border` | `default` | `--xh-material-elevated-border` | toast 的 root 部件 border 覆盖槽。 |
| `--xh-toast-close-bg` | `close-trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | toast 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-toast-close-bg-active` | `close-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | toast 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-toast-close-bg-hover` | `close-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | toast 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-toast-close-border` | `close-trigger` | `border` | `default` | `--xh-_action-variant-border-rest` | toast 的 close-trigger 部件 border 覆盖槽。 |
| `--xh-toast-close-fg` | `close-trigger` | `color` | `default` | `--xh-fg-muted` | toast 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-toast-close-fg-hover` | `close-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | toast 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-toast-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | toast 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-toast-close-size` | `close-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | toast 的 close-trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-toast-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | toast 的 description 部件 color 覆盖槽。 |
| `--xh-toast-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | toast 的 description 部件 font-size 覆盖槽。 |
| `--xh-toast-description-leading` | `description` | `line-height` | `default` | `--xh-leading-normal` | toast 的 description 部件 line-height 覆盖槽。 |
| `--xh-toast-dir` | `*`<br>`root` | `transform` | `@keyframes xh-toast-in`<br>`@keyframes xh-toast-out`<br>`default` | `1` | toast 的 *、root 部件 transform 覆盖槽。 |
| `--xh-toast-fg` | `root` | `color` | `default` | `--xh-material-elevated-fg` | toast 的 root 部件 color 覆盖槽。 |
| `--xh-toast-font-size` | `root` | `font-size` | `default` | `--xh-text-label-size` | toast 的 root 部件 font-size 覆盖槽。 |
| `--xh-toast-front-height` | `root` | `block-size` | `expanded`<br>`frontmost`<br>`not([data-expanded])`<br>`not([data-frontmost])`<br>`stack-index` | `auto` | toast 的 root 部件 block-size 覆盖槽。 |
| `--xh-toast-gap` | `root` | `gap` | `default` | `--xh-space-1_5` | toast 的 root 部件 gap 覆盖槽。 |
| `--xh-toast-height` | `root` | `block-size` | `expanded` | `auto` | toast 的 root 部件 block-size 覆盖槽。 |
| `--xh-toast-icon-fg` | `indicator`<br>`root` | `background-color`<br>`color` | `default` | `--xh-_tone-fg` | toast 的 indicator、root 部件 background-color、color 覆盖槽。 |
| `--xh-toast-icon-size` | `close-trigger`<br>`root` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` | toast 的 close-trigger、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-toast-indicator-p` | `indicator` | `padding` | `default` | `--xh-space-1` | toast 的 indicator 部件 padding 覆盖槽。 |
| `--xh-toast-inline-size` | `group`<br>`root` | `inline-size` | `default` | `28.75rem` | toast 的 group、root 部件 inline-size 覆盖槽。 |
| `--xh-toast-inset` | `group` | `inset-block-end`<br>`inset-block-start`<br>`inset-inline-end`<br>`inset-inline-start` | `placement=-end`<br>`placement=-start`<br>`placement=bottom`<br>`placement=top` | `--xh-space-4` | toast 的 group 部件 inset-block-end、inset-block-start、inset-inline-end、inset-inline-start 覆盖槽。 |
| `--xh-toast-layer` | `group` | `z-index` | `default` | `--xh-layer-toast` | toast 的 group 部件 z-index 覆盖槽。 |
| `--xh-toast-leading` | `root` | `line-height` | `default` | `--xh-text-body-leading` | toast 的 root 部件 line-height 覆盖槽。 |
| `--xh-toast-offset-collapsed` | `*`<br>`root` | `--xh-toast-y`<br>`transform` | `@keyframes xh-toast-in`<br>`default` | `0px` | toast 的 *、root 部件 --xh-toast-y、transform 覆盖槽。 |
| `--xh-toast-offset-expanded` | `root` | `--xh-toast-y` | `expanded` | `0px` | toast 的 root 部件 --xh-toast-y 覆盖槽。 |
| `--xh-toast-progress-bg` | `progress` | `background` | `default` | `--xh-_tone-soft` | toast 的 progress 部件 background 覆盖槽。 |
| `--xh-toast-progress-duration` | `progress` | `animation` | `default` | `--xh-motion-duration-slide` | toast 的 progress 部件 animation 覆盖槽。 |
| `--xh-toast-progress-thickness` | `progress` | `block-size` | `default` | `--xh-space-0_5` | toast 的 progress 部件 block-size 覆盖槽。 |
| `--xh-toast-px` | `root` | `padding-inline` | `default` | `--xh-space-4` | toast 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-toast-py` | `root` | `padding-block` | `default` | `--xh-space-3` | toast 的 root 部件 padding-block 覆盖槽。 |
| `--xh-toast-radius` | `root` | `border-radius` | `default` | `--xh-shape-overlay` | toast 的 root 部件 border-radius 覆盖槽。 |
| `--xh-toast-scale` | `*` | `transform` | `@keyframes xh-toast-out` | `1` | toast 的 * 部件 transform 覆盖槽。 |
| `--xh-toast-scale-collapsed` | `*`<br>`root` | `--xh-toast-scale`<br>`transform` | `@keyframes xh-toast-in`<br>`default` | `1` | toast 的 *、root 部件 --xh-toast-scale、transform 覆盖槽。 |
| `--xh-toast-shadow` | `root` | `box-shadow` | `default` | `--xh-material-elevated-shadow` | toast 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-toast-title-fg` | `title` | `color` | `default` | `--xh-_tone-fg` | toast 的 title 部件 color 覆盖槽。 |
| `--xh-toast-title-font-size` | `title` | `font-size` | `default` | `--xh-text-label-size` | toast 的 title 部件 font-size 覆盖槽。 |
| `--xh-toast-title-font-weight` | `title` | `font-weight` | `default` | `--xh-font-weight-semibold` | toast 的 title 部件 font-weight 覆盖槽。 |
| `--xh-toast-title-leading` | `title` | `line-height` | `default` | `--xh-text-body-leading` | toast 的 title 部件 line-height 覆盖槽。 |
| `--xh-toast-y` | `*` | `transform` | `@keyframes xh-toast-out` | `0px` | toast 的 * 部件 transform 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-countdown` · `xh-toast-in` · `xh-toast-out` · `xh-toast-spin` 随皮肤自带，不引用别处文件里的名字；`block-size` · `opacity` · `transform` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### 响应式

皮肤另按输入能力分档：`hover: hover`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

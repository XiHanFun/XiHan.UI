来源：https://ui.docs.xihanfun.com/components/toast

# Toast `轻提示`

一条会自己消失的短反馈：一枚状态字形加一句话，横排一行、贴着文字收缩。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/toast" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/toast.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/toast" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/toast" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/toast.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一条一句话：title 部件留空时由属性上的文案填入；duration 给 0 即不自动消失

```vue
<script setup lang="ts">
import {
  XhButton,
  XhToastCloseTrigger,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 关掉之后换一个 key 重新挂一条，方便反复看
const seq = ref(0);
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <XhToastRoot
      :key="seq"
      title="草稿已保存"
      :duration="0"
      :translations="{ close: '关闭' }"
    >
      <XhToastTitle />
      <XhToastCloseTrigger />
    </XhToastRoot>
    <XhButton size="sm" variant="outline" @click="seq++">再挂一条</XhButton>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; justify-items: start">
  <div id="toast-basic-slot"></div>
  <xh-button id="toast-basic-again" size="sm" variant="outline">
    <button data-xh-part="root">再挂一条</button>
  </xh-button>
</div>

<template id="toast-basic-template">
  <xh-toast title="草稿已保存" duration="0">
    <div data-xh-part="root">
      <div data-xh-part="title"></div>
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

## 示例

### 语气

type 落成 data-severity，淡底、描边与字形一起换族，正文留中性；error 走 alert + assertive，loading 表示事情还没完、不自动消失

```vue
<script setup lang="ts">
import {
  CheckIcon,
  CircleInfoIcon,
  LoaderIcon,
  TriangleAlertIcon,
  XIcon,
} from "@xihan-ui/icons";
import { XhIcon, XhToastRoot, XhToastTitle } from "@xihan-ui/vue";

const items = [
  { type: "info", glyph: CircleInfoIcon, title: "草稿已保存" },
  { type: "success", glyph: CheckIcon, title: "发布成功" },
  { type: "warning", glyph: TriangleAlertIcon, title: "配额即将用尽" },
  { type: "error", glyph: XIcon, title: "同步失败，稍后自动重试" },
  { type: "loading", glyph: LoaderIcon, title: "正在上传" },
] as const;

// 字形只是装饰（读屏念标题就够了），颜色跟着 root 上由 type 派生的 data-tone 走
const glyphStyle = {
  display: "grid",
  placeItems: "center",
  flex: "none",
  inlineSize: "var(--xh-icon-size)",
  blockSize: "var(--xh-icon-size)",
  color: "var(--xh-_tone-fg)",
};
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <XhToastRoot
      v-for="item in items"
      :key="item.type"
      :type="item.type"
      :title="item.title"
      :duration="0"
      :closable="false"
    >
      <span aria-hidden="true" :style="glyphStyle"><XhIcon :icon="item.glyph" /></span>
      <XhToastTitle />
    </XhToastRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; justify-items: start">
  <xh-toast
    type="info"
    title="草稿已保存"
    duration="0"
    closable="false"
  >
    <div data-xh-part="root">
      <!-- 字形只是装饰，读屏念标题就够了 -->
      <span
        aria-hidden="true"
        style="
          display: grid;
          place-items: center;
          flex: none;
          inline-size: var(--xh-icon-size);
          block-size: var(--xh-icon-size);
          color: var(--xh-_tone-fg);
        "
        ><svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 16.5V11"/><path d="M12 7.5h.01"/></svg></span
      >
      <div data-xh-part="title"></div>
    </div>
  </xh-toast>

  <xh-toast
    type="success"
    title="发布成功"
    duration="0"
    closable="false"
  >
    <div data-xh-part="root">
      <span
        aria-hidden="true"
        style="
          display: grid;
          place-items: center;
          flex: none;
          inline-size: var(--xh-icon-size);
          block-size: var(--xh-icon-size);
          color: var(--xh-_tone-fg);
        "
        ><svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg></span
      >
      <div data-xh-part="title"></div>
    </div>
  </xh-toast>

  <xh-toast
    type="warning"
    title="配额即将用尽"
    duration="0"
    closable="false"
  >
    <div data-xh-part="root">
      <span
        aria-hidden="true"
        style="
          display: grid;
          place-items: center;
          flex: none;
          inline-size: var(--xh-icon-size);
          block-size: var(--xh-icon-size);
          color: var(--xh-_tone-fg);
        "
        ><svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4L21 20H3Z"/><path d="M12 10V14"/><path d="M12 17.5h.01"/></svg></span
      >
      <div data-xh-part="title"></div>
    </div>
  </xh-toast>

  <xh-toast
    type="error"
    title="同步失败，稍后自动重试"
    duration="0"
    closable="false"
  >
    <div data-xh-part="root">
      <span
        aria-hidden="true"
        style="
          display: grid;
          place-items: center;
          flex: none;
          inline-size: var(--xh-icon-size);
          block-size: var(--xh-icon-size);
          color: var(--xh-_tone-fg);
        "
        ><svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6L18 18"/><path d="M18 6L6 18"/></svg></span
      >
      <div data-xh-part="title"></div>
    </div>
  </xh-toast>

  <xh-toast
    type="loading"
    title="正在上传"
    duration="0"
    closable="false"
  >
    <div data-xh-part="root">
      <span
        aria-hidden="true"
        style="
          display: grid;
          place-items: center;
          flex: none;
          inline-size: var(--xh-icon-size);
          block-size: var(--xh-icon-size);
          color: var(--xh-_tone-fg);
        "
        ><svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></span
      >
      <div data-xh-part="title"></div>
    </div>
  </xh-toast>
</div>
```

### 计时与暂停

duration 走完自动退场；指针停在条子上或焦点进到条子里都会把计时按住，离开才接着走剩下那一段

```vue
<script setup lang="ts">
import {
  XhButton,
  XhToastCloseTrigger,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

const seq = ref(0);
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <XhToastRoot
      :key="seq"
      v-slot="{ status, paused }"
      title="6 秒后自动收走"
      :duration="6000"
      :translations="{ close: '关闭' }"
    >
      <XhToastTitle />
      <span style="font-size: 12px; opacity: 0.75">
        状态：{{ status }} · {{ paused ? "计时已按住" : "计时在走" }}
      </span>
      <XhToastCloseTrigger />
    </XhToastRoot>
    <XhButton size="sm" variant="outline" @click="seq++">重新计时</XhButton>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; justify-items: start">
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
      <div data-xh-part="title"></div>
      <span data-readout style="font-size: 12px; opacity: 0.75"></span>
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

action-trigger 按下时先发 action 事件，再让这条进入退场；closable 决定还要不要那颗叉

```vue
<script setup lang="ts">
import {
  XhButton,
  XhToastActionTrigger,
  XhToastCloseTrigger,
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
  <div style="display: grid; gap: 12px; justify-items: start">
    <XhToastRoot
      id="toast-demo-action"
      :key="seq"
      title="已删除 1 个文件"
      :duration="0"
      :translations="{ close: '关闭' }"
      @action="onAction"
    >
      <XhToastTitle />
      <div style="display: flex; align-items: center; gap: 8px">
        <XhToastActionTrigger>撤销</XhToastActionTrigger>
        <XhToastCloseTrigger />
      </div>
    </XhToastRoot>
    <div style="display: flex; align-items: center; gap: 12px">
      <XhButton size="sm" variant="outline" @click="seq++">再挂一条</XhButton>
      <span>{{ log }}</span>
    </div>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; justify-items: start">
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
      <div data-xh-part="title"></div>
      <div style="display: flex; align-items: center; gap: 8px">
        <button data-xh-part="action-trigger">撤销</button>
        <button data-xh-part="close-trigger"></button>
      </div>
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

### 自定义排版

条子本身就是一行 flex，摆什么、摆在哪一侧都归作者；组件只管盒子、计时与退场

```vue
<script setup lang="ts">
import { CopyIcon, RocketIcon } from "@xihan-ui/icons";
import { XhIcon, XhToastRoot, XhToastTitle } from "@xihan-ui/vue";

// 尺寸与语气色都取条子给的槽，换个 type 图标就跟着换族
const glyphStyle = {
  display: "grid",
  placeItems: "center",
  flex: "none",
  inlineSize: "var(--xh-icon-size)",
  blockSize: "var(--xh-icon-size)",
  color: "var(--xh-_tone-fg)",
};
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <!-- 换一枚业务自己的图标 -->
    <XhToastRoot type="info" :duration="0" :closable="false">
      <span aria-hidden="true" :style="glyphStyle"><XhIcon :icon="RocketIcon" /></span>
      <XhToastTitle>部署已开始</XhToastTitle>
    </XhToastRoot>

    <!-- 图标摆到行尾 -->
    <XhToastRoot type="success" :duration="0" :closable="false">
      <XhToastTitle>已复制到剪贴板</XhToastTitle>
      <span aria-hidden="true" :style="glyphStyle"><XhIcon :icon="CopyIcon" /></span>
    </XhToastRoot>

    <!-- 什么都不摆，只有一句话 -->
    <XhToastRoot type="info" :duration="0" :closable="false">
      <XhToastTitle>已切换到只读模式</XhToastTitle>
    </XhToastRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; justify-items: start">
  <!-- 换一枚业务自己的图标；尺寸与语气色都取条子给的槽 -->
  <xh-toast type="info" duration="0" closable="false">
    <div data-xh-part="root">
      <span
        aria-hidden="true"
        style="
          display: grid;
          place-items: center;
          flex: none;
          inline-size: var(--xh-icon-size);
          block-size: var(--xh-icon-size);
          color: var(--xh-_tone-fg);
        "
        ><svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5c2.5 2.5 4 6 4 9.5 0 1.8-.4 3.3-1.2 4.5H9.2C8.4 15.3 8 13.8 8 12c0-3.5 1.5-7 4-9.5Z"/><circle cx="12" cy="10" r="0.75"/><path d="M8.2 13.5C6 14.7 4.5 17 4.5 19.5L9.2 16.5"/><path d="M15.8 13.5C18 14.7 19.5 17 19.5 19.5L14.8 16.5"/><path d="M10 17.5c0 1.5 .9 2.8 2 3.5 1.1-.7 2-2 2-3.5"/></svg></span
      >
      <div data-xh-part="title">部署已开始</div>
    </div>
  </xh-toast>

  <!-- 图标摆到行尾 -->
  <xh-toast type="success" duration="0" closable="false">
    <div data-xh-part="root">
      <div data-xh-part="title">已复制到剪贴板</div>
      <span
        aria-hidden="true"
        style="
          display: grid;
          place-items: center;
          flex: none;
          inline-size: var(--xh-icon-size);
          block-size: var(--xh-icon-size);
          color: var(--xh-_tone-fg);
        "
        ><svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M15 6V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1"/></svg></span
      >
    </div>
  </xh-toast>

  <!-- 什么都不摆，只有一句话 -->
  <xh-toast type="info" duration="0" closable="false">
    <div data-xh-part="root">
      <div data-xh-part="title">已切换到只读模式</div>
    </div>
  </xh-toast>
</div>
```

### 全局服务

轻提示没有容器组件，那一摞由 createToastService 渲染；模块作用域随处可调（请求拦截器、store）

```vue
<script setup lang="ts">
import type { ToastService } from "@xihan-ui/vue";
import { createToastService, XhButton } from "@xihan-ui/vue";
import { onBeforeUnmount } from "vue";

// 惰性建单例：服务要 document，等到第一次调用（必然在客户端）再建
let toast: ToastService | undefined;
function use(): ToastService {
  toast ??= createToastService({ placement: "top" });
  return toast;
}
onBeforeUnmount(() => toast?.dispose());

function save(): void {
  const id = use().loading("保存中");
  setTimeout(() => use().update(id, { type: "success", title: "已保存" }), 900);
}
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 8px">
    <XhButton variant="solid" @click="save()">保存（loading 转 success）</XhButton>
    <XhButton variant="outline" @click="use().success('已发布')">success</XhButton>
    <XhButton variant="outline" @click="use().warning('配额即将用尽')">warning</XhButton>
    <XhButton variant="outline" @click="use().error('同步失败')">error</XhButton>
  </div>
</template>
```

## 设计指引

### 何时使用

- 一次操作的结果："已保存"、"已复制"、"发送失败"。
- 反馈重要但不需要打断用户。

### 何时不用

- 用户必须知道并处理：用[警告提示](./alert)让它常驻，或用[对话框](./dialog)阻断。
- 内容较长、分标题与正文两层，或不是用户点出来的：用[通知](./notification)。

### 特性

- `duration` 决定停留时长，指针悬停或页面失焦时计时暂停。
- 可以带一个操作按钮（撤销、查看详情）。
- `type` 决定语气：淡底、描边与状态字形一起换族，正文留中性。
- 组件档 `closable` 缺省为真，叉写不写由作者定；全局服务的默认模板反过来——
  到点自己走的不出叉，走不掉的（`loading`、`duration` 给 0）才出。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toast>` |
| Vue 组件 | `XhToastActionTrigger` `XhToastCloseTrigger` `XhToastIndicator` `XhToastProgress` `XhToastRoot` `XhToastTitle` |
| 组合式函数 | `useToast` |
| 状态机 | `toastMachine` |
| 皮肤 | `@xihan-ui/styles/toast.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="toast"`：**`root`** · `indicator` · `title` · `action-trigger` · `progress` · `close-trigger` · `group`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` |  | 队列身份。服务档用它做 create/update/dismiss 的寻址键。 |
| `title` | `string` |  | 标题文本；作者没在 title 部件里写内容时由适配器填入。 |
| `description` | `string` |  | 补充说明。轻提示自己不出这一层——两层文本是 notification 的活； 这条 prop 留着是因为 notification 的单条卡片复用同一台机器。 |
| `type` | `ToastType` |  | 语气，默认 info。error 走 alert + assertive，loading 不自动消失。 |
| `duration` | `number` |  | 停留毫秒，默认 5000。&lt;=0 或非有限数即不自动消失。 |
| `removeDelay` | `number` |  | 退场窗口毫秒，默认 200：进入 dismissing 后停留这么久再转 unmounted，留给退场动画。 |
| `closable` | `boolean` |  | 是否显示可用的关闭按钮，默认 true。 |
| `pauseOnPageIdle` | `boolean` |  | 页面切到后台时暂停计时，默认 false。由服务档统一下发。 |
| `paused` | `boolean` |  | 由宿主按住计时，默认 false。整摞一起暂停走这条： 置真时登记 'service' 这个暂停来源，置假时把它摘掉，与指针、焦点那几路并存。 |
| `translations` | `Partial<ToastTranslations>` |  |  |
| `onStatusChange` | `(details: ToastStatusChangeDetails) => void` |  | 生命周期落位时通知：dismissing 与 unmounted 各一次。宿主据此把条目移出队列。 |
| `onAction` | `(details: ToastActionDetails) => void` |  | 操作按钮被按下。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `status-change` | `ToastStatusChangeDetails` | 生命周期落位；detail 为 `{ id: string, status: 'dismissing'\|'unmounted' }` |
| `action` | `ToastActionDetails` | 操作按钮被按下；detail 为 `{ id: string }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhToastRoot` | `default` | `ToastRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | toStatus(state.get()) |
| `progress` | toStatus(state.get()) |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`visible` · `visible.running` · `visible.paused` · `dismissing` · `unmounted`

**事件**：`TOAST.DISMISS` · `TOAST.ACTION` · `TOAST.PAUSE` · `TOAST.RESUME` · `TOAST.RESET` · `after.duration` · `after.removeDelay`

**判据**：`isLastPauseSource`

## connect API

`useToast` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` |  |
| `status` | `ToastStatus` |  |
| `type` | `ToastType` |  |
| `title` | `string \| undefined` |  |
| `paused` | `boolean` | 计时被按住中。倒计时的可见反馈由使用者自己渲染，这个标记是留给他的钩子——自带皮肤不画。 |
| `closable` | `boolean` |  |
| `remaining` | `number` | 剩余毫秒；不自动消失时为 Infinity。 |
| `dismiss` | `() => void` |  |
| `pause` | `() => void` |  |
| `resume` | `() => void` |  |
| `duration` | `number` | 停留总时长（毫秒）；不自动消失时为 Infinity。 |
| `getRootProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` | 严重度指示符：作者塞自己的图形，不塞则由皮肤画兜底字形。 |
| `getTitleProps` | `() => T['element']` |  |
| `getActionTriggerProps` | `() => T['button']` |  |
| `getProgressProps` | `() => T['element']` | 倒计时条：不自动消失时收起。 |
| `getCloseTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus 在 close-trigger 上且 closable | 立即进入 dismissing，走完 removeDelay 后转 unmounted |
| `Enter` / `Space` | focus 在 action-trigger 上 | 触发 onAction 并进入 dismissing |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-atomic` | 'true' |
| `root` | `aria-labelledby` | `title` 部件的 id |
| `root` | `aria-live` | 'assertive' \| 'polite' |
| `root` | `role` | 'alert' \| 'status' |
| `indicator` | `aria-hidden` | 'true' |
| `progress` | `aria-hidden` | 'true' |
| `close-trigger` | `aria-label` | props.translations.close |

## 样式

默认皮肤 `@xihan-ui/styles/toast.css` 按部件选择：`[data-scope="toast"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-paused` | ''（条件成立时才出现） |
| `root` | `data-severity` | props.type |
| `root` | `data-state` | toStatus(state.get()) |
| `root` | `data-tone` | toneOf(type) |
| `indicator` | `data-severity` | props.type |
| `progress` | `data-state` | toStatus(state.get()) |
| `close-trigger` | `data-disabled` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-toast-action-bg` | `action-trigger` | `background` | `default` | `--xh-bg-subtle` | toast 的 action-trigger 部件 background 覆盖槽。 |
| `--xh-toast-action-bg-active` | `action-trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | toast 的 action-trigger 部件 background 覆盖槽。 |
| `--xh-toast-action-bg-hover` | `action-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | toast 的 action-trigger 部件 background 覆盖槽。 |
| `--xh-toast-action-border` | `action-trigger` | `border` | `default` | `--xh-border-default` | toast 的 action-trigger 部件 border 覆盖槽。 |
| `--xh-toast-action-fg` | `action-trigger` | `color` | `default` | `--xh-fg-default` | toast 的 action-trigger 部件 color 覆盖槽。 |
| `--xh-toast-action-font-weight` | `action-trigger` | `font-weight` | `default` | `--xh-font-weight-medium` | toast 的 action-trigger 部件 font-weight 覆盖槽。 |
| `--xh-toast-action-h` | `action-trigger` | `block-size` | `default` | `--xh-control-h-sm` | toast 的 action-trigger 部件 block-size 覆盖槽。 |
| `--xh-toast-action-px` | `action-trigger` | `padding-inline` | `default` | `--xh-control-px-sm` | toast 的 action-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-toast-action-radius` | `action-trigger` | `border-radius` | `default` | `--xh-shape-control` | toast 的 action-trigger 部件 border-radius 覆盖槽。 |
| `--xh-toast-bg` | `root` | `background` | `default` | `--xh-_toast-tint` | toast 的 root 部件 background 覆盖槽。 |
| `--xh-toast-border` | `root` | `border` | `default` | `--xh-_toast-edge` | toast 的 root 部件 border 覆盖槽。 |
| `--xh-toast-close-bg-active` | `close-trigger` | `background` | `active` | `--xh-bg-subtle-active` | toast 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-toast-close-bg-hover` | `close-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | toast 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-toast-close-fg` | `close-trigger` | `color` | `default` | `--xh-fg-muted` | toast 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-toast-close-fg-hover` | `close-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-default` | toast 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-toast-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | toast 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-toast-close-size` | `close-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | toast 的 close-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-toast-fg` | `root` | `color` | `default` | `--xh-fg-default` | toast 的 root 部件 color 覆盖槽。 |
| `--xh-toast-font-size` | `root` | `font-size` | `default` | `--xh-text-body-size` | toast 的 root 部件 font-size 覆盖槽。 |
| `--xh-toast-gap` | `root` | `gap` | `default` | `--xh-control-gap-md` | toast 的 root 部件 gap 覆盖槽。 |
| `--xh-toast-icon-fg` | `indicator`<br>`root` | `background-color`<br>`color` | `default` | `--xh-_tone-fg` | toast 的 indicator、root 部件 background-color、color 覆盖槽。 |
| `--xh-toast-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-control-indicator-size` | toast 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-toast-inset` | `group` | `padding-block-end`<br>`padding-block-start`<br>`padding-inline` | `default` | `--xh-space-6` | toast 的 group 部件 padding-block-end、padding-block-start、padding-inline 覆盖槽。 |
| `--xh-toast-layer` | `group` | `z-index` | `default` | `--xh-layer-toast` | toast 的 group 部件 z-index 覆盖槽。 |
| `--xh-toast-leading` | `root` | `line-height` | `default` | `--xh-text-body-leading` | toast 的 root 部件 line-height 覆盖槽。 |
| `--xh-toast-progress-bg` | `progress` | `background` | `default` | `--xh-_tone-soft` | toast 的 progress 部件 background 覆盖槽。 |
| `--xh-toast-progress-duration` | `progress` | `animation` | `default` | `--xh-motion-duration-slide` | toast 的 progress 部件 animation 覆盖槽。 |
| `--xh-toast-progress-thickness` | `progress` | `block-size` | `default` | `--xh-space-0_5` | toast 的 progress 部件 block-size 覆盖槽。 |
| `--xh-toast-px` | `root` | `padding-inline` | `default` | `--xh-surface-px-sm` | toast 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-toast-py` | `root` | `padding-block` | `default` | `--xh-field-py` | toast 的 root 部件 padding-block 覆盖槽。 |
| `--xh-toast-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | toast 的 root 部件 border-radius 覆盖槽。 |
| `--xh-toast-shadow` | `root` | `box-shadow` | `default` | `--xh-elevation-sheet` | toast 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-toast-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | toast 的 title 部件 color 覆盖槽。 |
| `--xh-toast-title-font-size` | `title` | `font-size` | `default` | `--xh-text-body-size` | toast 的 title 部件 font-size 覆盖槽。 |
| `--xh-toast-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-body-weight` | toast 的 title 部件 font-weight 覆盖槽。 |
| `--xh-toast-title-leading` | `title` | `line-height` | `default` | `--xh-text-body-leading` | toast 的 title 部件 line-height 覆盖槽。 |
| `--xh-toast-w` | `root` | `inline-size` | `default` | `auto` | toast 的 root 部件 inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-countdown` · `xh-toast-in` · `xh-toast-out` · `xh-toast-spin` 随皮肤自带，不引用别处文件里的名字；`background` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 没有容器组件：那一摞由全局服务渲染，业务代码 `toast.success('已保存')` 一行调用即可。

## 最佳实践

- 破坏性操作配"撤销"按钮，比事前确认对话框体验好得多。
- 错误类的提示停留久一点，或干脆不自动消失。

## 反模式

- 把错误详情放进轻提示：用户还没读完就没了。
- 同一个动作连发好几条。

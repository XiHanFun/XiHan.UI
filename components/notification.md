来源：https://ui.docs.xihanfun.com/components/notification

# Notification 通知

主动推送给用户的一条消息：有标题、有正文，可以带操作按钮。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/notification" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/notification.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/notification" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/notification" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/notification.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

create 入队并返回 id，队列中的每条由作者渲染为一条通知；退场窗口结束后只收起不删除，宿主在 status-change 中把它移出队列

```vue
<script setup lang="ts">
import {
  XhButton,
  XhNotificationGroup,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemDescription,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
  XhNotificationRoot,
} from "@xihan-ui/vue";

// 存一份放在外面：写在模板里每渲染一次都是个新对象，白白惊动一轮 props
const itemTranslations = { close: "关闭" };
</script>

<template>
  <XhNotificationRoot v-slot="{ create, dismiss, count }">
    <XhButton
      variant="solid"
      @click="create({ title: '草稿已保存', description: '内容已同步到云端' })"
    >
      弹一条
    </XhButton>
    <XhButton
      variant="outline"
      @click="
        create({
          tone: 'danger',
          title: '同步失败',
          description: '网络中断，稍后自动重试',
        })
      "
    >
      弹一条 danger
    </XhButton>
    <span>队列：{{ count }} 条</span>

    <XhNotificationGroup>
      <template #default="{ item }">
        <XhNotificationItem
          :id="item.id"
          :title="item.title"
          :description="item.description"
          :tone="item.tone"
          :loading="item.loading"
          :duration="item.duration"
          :remove-delay="item.removeDelay"
          :closable="item.closable"
          :translations="itemTranslations"
          @status-change="
            ({ id, status }) => status === 'unmounted' && dismiss(id)
          "
        >
          <XhNotificationItemIndicator />
          <XhNotificationItemTitle />
          <XhNotificationItemDescription />
          <XhNotificationItemCloseTrigger />
        </XhNotificationItem>
      </template>
    </XhNotificationGroup>
  </XhNotificationRoot>
</template>
```

```html
<xh-notification id="notification-basic">
  <div data-xh-part="root">
    <xh-button variant="solid" data-create="save">
      <button data-xh-part="root">弹一条</button>
    </xh-button>
    <xh-button variant="outline" data-create="danger">
      <button data-xh-part="root">弹一条 danger</button>
    </xh-button>
    <span>队列：<span id="notification-basic-count">0</span> 条</span>

    <div data-xh-part="group"></div>
  </div>
</xh-notification>

<!-- 单条通知的节点归作者，元素不替作者生成，模板照队列克隆 -->
<template id="notification-basic-template">
  <xh-notification-item>
    <div data-xh-part="item">
      <span data-xh-part="item-indicator"></span>
      <div data-xh-part="item-title"></div>
      <div data-xh-part="item-description"></div>
      <button data-xh-part="item-close-trigger"></button>
    </div>
  </xh-notification-item>
</template>

<script type="module">
  const notification = document.getElementById("notification-basic");
  const group = notification.querySelector('[data-xh-part="group"]');
  const template = document.getElementById("notification-basic-template");
  const count = document.getElementById("notification-basic-count");
  const translations = { close: "关闭" };

  // 队列变了就把这一摞重铺一遍：没了的摘掉，新来的克隆一条，剩下的把文案摊上去
  function render() {
    const list = notification.visibleNotifications;
    const alive = new Set(list.map((item) => item.id));
    for (const node of [...group.children]) {
      if (!alive.has(node.itemId)) {
        node.remove();
      }
    }
    for (const item of list) {
      let node = [...group.children].find((el) => el.itemId === item.id);
      if (!node) {
        node = document.importNode(template.content.firstElementChild, true);
        node.itemId = item.id;
        node.translations = translations;
        group.append(node);
      }
      node.titleText = item.title;
      node.description = item.description;
      node.tone = item.tone;
      node.loading = item.loading;
      node.duration = item.duration;
      node.removeDelay = item.removeDelay;
      node.closable = item.closable;
    }
    count.textContent = String(notification.count);
  }

  notification.addEventListener("items-change", render);

  const messages = {
    save: { title: "草稿已保存", description: "内容已同步到云端" },
    danger: {
      tone: "danger",
      title: "同步失败",
      description: "网络中断，稍后自动重试",
    },
  };

  for (const button of notification.querySelectorAll("[data-create]")) {
    button.addEventListener("click", () =>
      notification.create(messages[button.dataset.create])
    );
  }
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="notification"`：**`root`** · **`group`** · `item` · `item-indicator` · `item-title` · `item-description` · `item-action-trigger` · `item-progress` · `item-close-trigger`

## 示例

### 落位

placement 决定该堆叠贴视口的哪个角，更换的只是 group 上的 data-placement，队列本身不变

```vue
<script setup lang="ts">
import {
  XhButton,
  XhNotificationGroup,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemDescription,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
  XhNotificationRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const placements = [
  "top-start",
  "top",
  "top-end",
  "bottom-start",
  "bottom",
  "bottom-end",
] as const;

const placement = ref<(typeof placements)[number]>("top-end");
const itemTranslations = { close: "关闭" };
</script>

<template>
  <XhNotificationRoot v-slot="{ create, dismiss }" :placement="placement">
    <XhButton
      v-for="p in placements"
      :key="p"
      size="sm"
      :variant="p === placement ? 'solid' : 'outline'"
      @click="placement = p"
    >
      {{ p }}
    </XhButton>
    <XhButton
      variant="ghost"
      @click="create({ title: '换个角看看', description: `现在贴在 ${placement}` })"
    >
      弹一条
    </XhButton>

    <XhNotificationGroup>
      <template #default="{ item }">
        <XhNotificationItem
          :id="item.id"
          :title="item.title"
          :description="item.description"
          :tone="item.tone"
          :loading="item.loading"
          :duration="item.duration"
          :remove-delay="item.removeDelay"
          :closable="item.closable"
          :translations="itemTranslations"
          @status-change="
            ({ id, status }) => status === 'unmounted' && dismiss(id)
          "
        >
          <XhNotificationItemIndicator />
          <XhNotificationItemTitle />
          <XhNotificationItemDescription />
          <XhNotificationItemCloseTrigger />
        </XhNotificationItem>
      </template>
    </XhNotificationGroup>
  </XhNotificationRoot>
</template>
```

```html
<xh-notification id="notification-placement" placement="top-end">
  <div data-xh-part="root">
    <xh-button size="sm" variant="outline" data-spot="top-start">
      <button data-xh-part="root">top-start</button>
    </xh-button>
    <xh-button size="sm" variant="outline" data-spot="top">
      <button data-xh-part="root">top</button>
    </xh-button>
    <xh-button size="sm" variant="solid" data-spot="top-end">
      <button data-xh-part="root">top-end</button>
    </xh-button>
    <xh-button size="sm" variant="outline" data-spot="bottom-start">
      <button data-xh-part="root">bottom-start</button>
    </xh-button>
    <xh-button size="sm" variant="outline" data-spot="bottom">
      <button data-xh-part="root">bottom</button>
    </xh-button>
    <xh-button size="sm" variant="outline" data-spot="bottom-end">
      <button data-xh-part="root">bottom-end</button>
    </xh-button>
    <xh-button variant="ghost" data-create>
      <button data-xh-part="root">弹一条</button>
    </xh-button>

    <div data-xh-part="group"></div>
  </div>
</xh-notification>

<template id="notification-placement-template">
  <xh-notification-item>
    <div data-xh-part="item">
      <span data-xh-part="item-indicator"></span>
      <div data-xh-part="item-title"></div>
      <div data-xh-part="item-description"></div>
      <button data-xh-part="item-close-trigger"></button>
    </div>
  </xh-notification-item>
</template>

<script type="module">
  const notification = document.getElementById("notification-placement");
  const group = notification.querySelector('[data-xh-part="group"]');
  const template = document.getElementById("notification-placement-template");
  const translations = { close: "关闭" };

  // 队列变了就把这一摞重铺一遍
  function render() {
    const list = notification.visibleNotifications;
    const alive = new Set(list.map((item) => item.id));
    for (const node of [...group.children]) {
      if (!alive.has(node.itemId)) {
        node.remove();
      }
    }
    for (const item of list) {
      let node = [...group.children].find((el) => el.itemId === item.id);
      if (!node) {
        node = document.importNode(template.content.firstElementChild, true);
        node.itemId = item.id;
        node.translations = translations;
        group.append(node);
      }
      node.titleText = item.title;
      node.description = item.description;
      node.tone = item.tone;
      node.loading = item.loading;
      node.duration = item.duration;
      node.removeDelay = item.removeDelay;
      node.closable = item.closable;
    }
  }

  notification.addEventListener("items-change", render);

  // 换落位只改 notification 的一个属性，选中的那颗按钮换成实心
  const spots = [...notification.querySelectorAll("[data-spot]")];
  for (const button of spots) {
    button.addEventListener("click", () => {
      notification.placement = button.dataset.spot;
      for (const other of spots) {
        other.setAttribute("variant", other === button ? "solid" : "outline");
      }
    });
  }

  notification.querySelector("[data-create]").addEventListener("click", () => {
    notification.create({
      title: "换个角看看",
      description: `现在贴在 ${notification.placement}`,
    });
  });
</script>
```

### 就地改写

同一个 id 再次 create 是原地改写而不是新弹出一条，位置不变；loading 不自动消失，换为 success 后才开始倒计时

```vue
<script setup lang="ts">
import {
  XhButton,
  XhNotificationGroup,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemDescription,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
  XhNotificationRoot,
} from "@xihan-ui/vue";

type Create = (options: Record<string, unknown>) => string;
type Update = (id: string, options: Record<string, unknown>) => void;

const itemTranslations = { close: "关闭" };

// 命令由 XhNotificationRoot 的插槽作用域交下来
function startUpload(create: Create, update: Update): void {
  create({
    id: "upload",
    loading: true,
    title: "正在上传",
    description: "3 个文件排队中",
  });
  // 改一条已经在队列里的
  window.setTimeout(update, 1200, "upload", { description: "已传 2 / 3" });
  // 同一个 id 再 create 一次同样是就地改写
  window.setTimeout(create, 2400, {
    id: "upload",
    loading: false,
    tone: "success",
    title: "上传完成",
    description: "3 个文件已入库",
  });
}
</script>

<template>
  <XhNotificationRoot v-slot="{ create, update, dismiss }">
    <XhButton variant="solid" @click="startUpload(create, update)">
      上传（loading → success）
    </XhButton>

    <XhNotificationGroup>
      <template #default="{ item }">
        <XhNotificationItem
          :id="item.id"
          :title="item.title"
          :description="item.description"
          :tone="item.tone"
          :loading="item.loading"
          :duration="item.duration"
          :remove-delay="item.removeDelay"
          :closable="item.closable"
          :translations="itemTranslations"
          @status-change="
            ({ id, status }) => status === 'unmounted' && dismiss(id)
          "
        >
          <XhNotificationItemIndicator />
          <XhNotificationItemTitle />
          <XhNotificationItemDescription />
          <XhNotificationItemCloseTrigger />
        </XhNotificationItem>
      </template>
    </XhNotificationGroup>
  </XhNotificationRoot>
</template>
```

```html
<xh-notification id="notification-update">
  <div data-xh-part="root">
    <xh-button variant="solid" data-start>
      <button data-xh-part="root">上传（loading → success）</button>
    </xh-button>

    <div data-xh-part="group"></div>
  </div>
</xh-notification>

<template id="notification-update-template">
  <xh-notification-item>
    <div data-xh-part="item">
      <span data-xh-part="item-indicator"></span>
      <div data-xh-part="item-title"></div>
      <div data-xh-part="item-description"></div>
      <button data-xh-part="item-close-trigger"></button>
    </div>
  </xh-notification-item>
</template>

<script type="module">
  const notification = document.getElementById("notification-update");
  const group = notification.querySelector('[data-xh-part="group"]');
  const template = document.getElementById("notification-update-template");
  const translations = { close: "关闭" };

  // 队列变了就把这一摞重铺一遍；同一条 id 命中已有节点，位置不动
  function render() {
    const list = notification.visibleNotifications;
    const alive = new Set(list.map((item) => item.id));
    for (const node of [...group.children]) {
      if (!alive.has(node.itemId)) {
        node.remove();
      }
    }
    for (const item of list) {
      let node = [...group.children].find((el) => el.itemId === item.id);
      if (!node) {
        node = document.importNode(template.content.firstElementChild, true);
        node.itemId = item.id;
        node.translations = translations;
        group.append(node);
      }
      node.titleText = item.title;
      node.description = item.description;
      node.tone = item.tone;
      node.loading = item.loading;
      node.duration = item.duration;
      node.removeDelay = item.removeDelay;
      node.closable = item.closable;
    }
  }

  notification.addEventListener("items-change", render);

  notification.querySelector("[data-start]").addEventListener("click", () => {
    notification.create({
      id: "upload",
      loading: true,
      title: "正在上传",
      description: "3 个文件排队中",
    });
    // 改一条已经在队列里的
    window.setTimeout(() => {
      notification.updateItem("upload", { description: "已传 2 / 3" });
    }, 1200);
    // 同一个 id 再 create 一次同样是就地改写
    window.setTimeout(() => {
      notification.create({
        id: "upload",
        loading: false,
        tone: "success",
        title: "上传完成",
        description: "3 个文件已入库",
      });
    }, 2400);
  });
</script>
```

### 上限与清空

max 限制每个位置同时显示几条，超出时移除最旧的；dismissAll 直接清空队列，不经退场窗口

```vue
<script setup lang="ts">
import {
  XhButton,
  XhNotificationGroup,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemDescription,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
  XhNotificationRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const seq = ref(0);
const itemTranslations = { close: "关闭" };

function nextTitle(): string {
  seq.value += 1;
  return `第 ${seq.value} 条通知`;
}
</script>

<template>
  <XhNotificationRoot
    v-slot="{ create, dismiss, dismissAll, count }"
    :max="3"
    :gap="12"
    :duration="20000"
  >
    <XhButton
      variant="solid"
      @click="create({ title: nextTitle(), description: '连按几下看最旧的被挤掉' })"
    >
      连着弹
    </XhButton>
    <XhButton variant="ghost" @click="dismissAll()">全部清空</XhButton>
    <span>队列：{{ count }} 条（上限 3）</span>

    <XhNotificationGroup>
      <template #default="{ item }">
        <XhNotificationItem
          :id="item.id"
          :title="item.title"
          :description="item.description"
          :tone="item.tone"
          :loading="item.loading"
          :duration="item.duration"
          :remove-delay="item.removeDelay"
          :closable="item.closable"
          :translations="itemTranslations"
          @status-change="
            ({ id, status }) => status === 'unmounted' && dismiss(id)
          "
        >
          <XhNotificationItemIndicator />
          <XhNotificationItemTitle />
          <XhNotificationItemDescription />
          <XhNotificationItemCloseTrigger />
        </XhNotificationItem>
      </template>
    </XhNotificationGroup>
  </XhNotificationRoot>
</template>
```

```html
<xh-notification id="notification-max" max="3" gap="12" duration="20000">
  <div data-xh-part="root">
    <xh-button variant="solid" data-create>
      <button data-xh-part="root">连着弹</button>
    </xh-button>
    <xh-button variant="ghost" data-clear>
      <button data-xh-part="root">全部清空</button>
    </xh-button>
    <span>队列：<span id="notification-max-count">0</span> 条（上限 3）</span>

    <div data-xh-part="group"></div>
  </div>
</xh-notification>

<template id="notification-max-template">
  <xh-notification-item>
    <div data-xh-part="item">
      <span data-xh-part="item-indicator"></span>
      <div data-xh-part="item-title"></div>
      <div data-xh-part="item-description"></div>
      <button data-xh-part="item-close-trigger"></button>
    </div>
  </xh-notification-item>
</template>

<script type="module">
  const notification = document.getElementById("notification-max");
  const group = notification.querySelector('[data-xh-part="group"]');
  const template = document.getElementById("notification-max-template");
  const count = document.getElementById("notification-max-count");
  const translations = { close: "关闭" };
  let seq = 0;

  // 队列变了就把这一摞重铺一遍；被挤掉的那条随之摘走
  function render() {
    const list = notification.visibleNotifications;
    const alive = new Set(list.map((item) => item.id));
    for (const node of [...group.children]) {
      if (!alive.has(node.itemId)) {
        node.remove();
      }
    }
    for (const item of list) {
      let node = [...group.children].find((el) => el.itemId === item.id);
      if (!node) {
        node = document.importNode(template.content.firstElementChild, true);
        node.itemId = item.id;
        node.translations = translations;
        group.append(node);
      }
      node.titleText = item.title;
      node.description = item.description;
      node.tone = item.tone;
      node.loading = item.loading;
      node.duration = item.duration;
      node.removeDelay = item.removeDelay;
      node.closable = item.closable;
    }
    count.textContent = String(notification.count);
  }

  notification.addEventListener("items-change", render);

  notification.querySelector("[data-create]").addEventListener("click", () => {
    seq += 1;
    notification.create({
      title: `第 ${seq} 条通知`,
      description: "连按几下看最旧的被挤掉",
    });
  });

  notification.querySelector("[data-clear]").addEventListener("click", () => {
    notification.dismissAll();
  });
</script>
```

### 手动关闭

create 返回的就是队列身份 id，保存后可随时 dismiss 该条；dismiss 直接移出队列，不经退场窗口

```vue
<script setup lang="ts">
import {
  XhButton,
  XhNotificationGroup,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemDescription,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
  XhNotificationRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

type Create = (options: Record<string, unknown>) => string;
type Dismiss = (id: string) => void;

const pending = ref("");
const itemTranslations = { close: "关闭" };

function start(create: Create): void {
  pending.value = create({
    loading: true,
    title: "正在导出",
    description: "loading 不自动消失，等宿主来收",
  });
}

function finish(dismiss: Dismiss): void {
  if (!pending.value) {
    return;
  }
  dismiss(pending.value);
  pending.value = "";
}

// 用户自己按叉关掉时，记下的 id 也要作废
function settle(
  details: { id: string; status: string },
  dismiss: Dismiss,
): void {
  if (details.status !== "unmounted") {
    return;
  }
  dismiss(details.id);
  if (details.id === pending.value) {
    pending.value = "";
  }
}
</script>

<template>
  <XhNotificationRoot v-slot="{ create, dismiss, count }">
    <XhButton variant="solid" :disabled="!!pending" @click="start(create)">
      开始导出
    </XhButton>
    <XhButton variant="outline" :disabled="!pending" @click="finish(dismiss)">
      手动收走
    </XhButton>
    <span>队列：{{ count }} 条 · 记下的 id：{{ pending || "（无）" }}</span>

    <XhNotificationGroup>
      <template #default="{ item }">
        <XhNotificationItem
          :id="item.id"
          :title="item.title"
          :description="item.description"
          :tone="item.tone"
          :loading="item.loading"
          :duration="item.duration"
          :remove-delay="item.removeDelay"
          :closable="item.closable"
          :translations="itemTranslations"
          @status-change="(details) => settle(details, dismiss)"
        >
          <XhNotificationItemIndicator />
          <XhNotificationItemTitle />
          <XhNotificationItemDescription />
          <XhNotificationItemCloseTrigger />
        </XhNotificationItem>
      </template>
    </XhNotificationGroup>
  </XhNotificationRoot>
</template>
```

```html
<xh-notification id="notification-manual">
  <div data-xh-part="root">
    <xh-button variant="solid" data-start>
      <button data-xh-part="root">开始导出</button>
    </xh-button>
    <xh-button variant="outline" data-finish disabled>
      <button data-xh-part="root">手动收走</button>
    </xh-button>
    <span>
      队列：<span id="notification-manual-count">0</span> 条 · 记下的 id：<span
        id="notification-manual-id"
        >（无）</span
      >
    </span>

    <div data-xh-part="group"></div>
  </div>
</xh-notification>

<template id="notification-manual-template">
  <xh-notification-item>
    <div data-xh-part="item">
      <span data-xh-part="item-indicator"></span>
      <div data-xh-part="item-title"></div>
      <div data-xh-part="item-description"></div>
      <button data-xh-part="item-close-trigger"></button>
    </div>
  </xh-notification-item>
</template>

<script type="module">
  const notification = document.getElementById("notification-manual");
  const group = notification.querySelector('[data-xh-part="group"]');
  const template = document.getElementById("notification-manual-template");
  const count = document.getElementById("notification-manual-count");
  const idText = document.getElementById("notification-manual-id");
  const start = notification.querySelector("[data-start]");
  const finish = notification.querySelector("[data-finish]");
  const translations = { close: "关闭" };
  let pending = "";

  // 队列变了就把这一摞重铺一遍；记下的那条已经不在队列里就作废
  function render() {
    const list = notification.visibleNotifications;
    const alive = new Set(list.map((item) => item.id));
    for (const node of [...group.children]) {
      if (!alive.has(node.itemId)) {
        node.remove();
      }
    }
    for (const item of list) {
      let node = [...group.children].find((el) => el.itemId === item.id);
      if (!node) {
        node = document.importNode(template.content.firstElementChild, true);
        node.itemId = item.id;
        node.translations = translations;
        group.append(node);
      }
      node.titleText = item.title;
      node.description = item.description;
      node.tone = item.tone;
      node.loading = item.loading;
      node.duration = item.duration;
      node.removeDelay = item.removeDelay;
      node.closable = item.closable;
    }
    if (pending && !alive.has(pending)) {
      pending = "";
    }
    count.textContent = String(notification.count);
    idText.textContent = pending || "（无）";
    start.toggleAttribute("disabled", !!pending);
    finish.toggleAttribute("disabled", !pending);
  }

  notification.addEventListener("items-change", render);

  start.addEventListener("click", () => {
    pending = notification.create({
      loading: true,
      title: "正在导出",
      description: "loading 不自动消失，等宿主来收",
    });
    render();
  });

  finish.addEventListener("click", () => {
    if (pending) {
      notification.dismiss(pending);
    }
  });
</script>
```

### 逐条落位

单条通知自带 placement 即覆盖 notification 的默认落位；placements 报告当前有条目的位置，一个位置一个堆叠

```vue
<script setup lang="ts">
import {
  XhButton,
  XhNotificationGroup,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemDescription,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
  XhNotificationRoot,
} from "@xihan-ui/vue";

type Create = (options: Record<string, unknown>) => string;

const spots = [
  { placement: "top-start", label: "左上" },
  { placement: "top-end", label: "右上" },
  { placement: "bottom", label: "正下" },
] as const;

const itemTranslations = { close: "关闭" };

function pop(create: Create, placement: string, label: string): void {
  create({
    placement,
    title: `落在${label}`,
    description: "每个位置各排各的队，互不挤占",
  });
}
</script>

<template>
  <XhNotificationRoot v-slot="{ create, dismiss, placements }" :duration="8000">
    <XhButton
      v-for="spot in spots"
      :key="spot.placement"
      size="sm"
      variant="outline"
      @click="pop(create, spot.placement, spot.label)"
    >
      弹到{{ spot.label }}
    </XhButton>
    <span>眼下有条目的位置：{{ placements.join("、") || "（无）" }}</span>

    <!-- 一个位置一摞，没有条目的位置不必渲染 -->
    <XhNotificationGroup v-for="p in placements" :key="p" :placement="p">
      <template #default="{ item }">
        <XhNotificationItem
          :id="item.id"
          :title="item.title"
          :description="item.description"
          :tone="item.tone"
          :loading="item.loading"
          :duration="item.duration"
          :remove-delay="item.removeDelay"
          :closable="item.closable"
          :translations="itemTranslations"
          @status-change="
            ({ id, status }) => status === 'unmounted' && dismiss(id)
          "
        >
          <XhNotificationItemIndicator />
          <XhNotificationItemTitle />
          <XhNotificationItemDescription />
          <XhNotificationItemCloseTrigger />
        </XhNotificationItem>
      </template>
    </XhNotificationGroup>
  </XhNotificationRoot>
</template>
```

```html
<xh-notification id="notification-spots" duration="8000">
  <div data-xh-part="root">
    <xh-button size="sm" variant="outline" data-spot="top-start" data-label="左上">
      <button data-xh-part="root">弹到左上</button>
    </xh-button>
    <xh-button size="sm" variant="outline" data-spot="top-end" data-label="右上">
      <button data-xh-part="root">弹到右上</button>
    </xh-button>
    <xh-button size="sm" variant="outline" data-spot="bottom" data-label="正下">
      <button data-xh-part="root">弹到正下</button>
    </xh-button>
    <span>眼下有条目的位置：<span id="notification-spots-list">（无）</span></span>

    <!-- 一个位置一摞，group 自带 placement 声明自己是哪一个 -->
    <div data-xh-part="group" placement="top-start"></div>
    <div data-xh-part="group" placement="top-end"></div>
    <div data-xh-part="group" placement="bottom"></div>
  </div>
</xh-notification>

<template id="notification-spots-template">
  <xh-notification-item>
    <div data-xh-part="item">
      <span data-xh-part="item-indicator"></span>
      <div data-xh-part="item-title"></div>
      <div data-xh-part="item-description"></div>
      <button data-xh-part="item-close-trigger"></button>
    </div>
  </xh-notification-item>
</template>

<script type="module">
  const notification = document.getElementById("notification-spots");
  const groups = [...notification.querySelectorAll('[data-xh-part="group"]')];
  const template = document.getElementById("notification-spots-template");
  const list = document.getElementById("notification-spots-list");
  const translations = { close: "关闭" };

  // 每一摞各按自己的位置取条目，各排各的队
  function render() {
    for (const group of groups) {
      const items = notification.getItemsByPlacement(group.getAttribute("placement"));
      const alive = new Set(items.map((item) => item.id));
      for (const node of [...group.children]) {
        if (!alive.has(node.itemId)) {
          node.remove();
        }
      }
      for (const item of items) {
        let node = [...group.children].find((el) => el.itemId === item.id);
        if (!node) {
          node = document.importNode(template.content.firstElementChild, true);
          node.itemId = item.id;
          node.translations = translations;
          group.append(node);
        }
        node.titleText = item.title;
        node.description = item.description;
        node.tone = item.tone;
        node.loading = item.loading;
        node.duration = item.duration;
        node.removeDelay = item.removeDelay;
        node.closable = item.closable;
      }
    }
    list.textContent = notification.placements.join("、") || "（无）";
  }

  notification.addEventListener("items-change", render);

  for (const button of notification.querySelectorAll("[data-spot]")) {
    button.addEventListener("click", () => {
      notification.create({
        placement: button.dataset.spot,
        title: `落在${button.dataset.label}`,
        description: "每个位置各排各的队，互不挤占",
      });
    });
  }
</script>
```

## 设计指引

### 何时使用

- 系统或他人发起的消息：新评论、审批到达、任务完成。
- 后台完成的长任务，用户当时可能在做其他事。
- 一句话说不完，需要标题加正文两层信息。

### 何时不用

- 用户刚点击按钮、只需要一句结果反馈时，使用[轻提示](./toast)。
- 用户必须处理才能继续时，使用[对话框](./dialog)阻断。
- 页面内某块区域的常驻状态说明使用[警告提示](./alert)。

### 特性

- 九宫格落位，`placement` 决定整摞的位置，也可以逐条指定。
- `max` 限制每个位置同时显示的条数，默认 5，超出时先挤出低优先级，同级中挤出最旧的；设为 `Infinity` 即不限制。
- 同一个 id 再次发出即就地改写，位置不变，用于“处理中 → 已完成”。
- 每条自带计时与暂停：指针停在卡片上或焦点进入时暂停计时。
- `duration` 为 0 时常驻不消失，适合需要用户处理的消息。

### 组合

- 卡片可以放一个操作按钮（查看详情、撤销），按下即退场。
- 队列的增删改由根插槽统一给出，业务代码不需要自行维护数组。

### 最佳实践

- 整个应用只挂一个队列，挂在最外层。
- 落位避开固定的操作条与移动端手势区。
- 重要的消息把 `duration` 设为 0，由用户自行关闭。

### 反模式

- 用它做操作反馈：一次点击弹出一张两层文本的大卡片，喧宾夺主。
- 每个页面各挂一个队列，多摞互相遮盖。
- `max` 过大，一屏被通知占满。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-notification>` |
| Vue 组件 | `XhNotificationGroup` `XhNotificationItem` `XhNotificationItemActionTrigger` `XhNotificationItemCloseTrigger` `XhNotificationItemDescription` `XhNotificationItemIndicator` `XhNotificationItemProgress` `XhNotificationItemTitle` `XhNotificationRoot` |
| 组合式函数 | `useNotification` |
| 状态机 | `notificationMachine` |
| 皮肤 | `@xihan-ui/styles/notification.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `items` | `NotificationRecord[]` |  | 受控队列：提供后由宿主决定，内部写入只发 onItemsChange。 |
| `defaultItems` | `NotificationRecord[]` |  |  |
| `placement` | `NotificationPlacement` |  | 默认落位，默认 bottom-end。 |
| `max` | `number` |  | 每个位置最多同时保留几条，超出时先移除低优先级、同级中移除最旧的。默认 5；提供 Infinity 即不限。 |
| `dedupe` | `NotificationDedupe` |  | 重复的处理方式，默认 'id'。 |
| `gap` | `number` |  | 同一组内的间距（px），默认 16。 |
| `duration` | `number` |  | 单条未写 duration 时的默认停留毫秒。 |
| `removeDelay` | `number` |  | 单条未写 removeDelay 时的默认退场窗口毫秒。 |
| `pauseOnPageIdle` | `boolean` |  | 页面切到后台时暂停计时，逐条下发给 toast。 |
| `translations` | `Partial<NotificationTranslations>` |  |  |
| `onItemsChange` | `(details: NotificationItemsChangeDetails) => void` |  |  |

### NotificationRecord

`items` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 是 |  |
| `title` | `string` |  |  |
| `description` | `string` |  |  |
| `tone` | `NotificationTone` |  |  |
| `loading` | `boolean` |  | 事情尚未完成：图标换为转圈，且不自动消失。 |
| `duration` | `number` |  |  |
| `removeDelay` | `number` |  |  |
| `closable` | `boolean` |  |  |
| `placement` | `NotificationPlacement` |  | 单条覆盖落位；未提供时使用 notification 的 placement。 |
| `actionLabel` | `string` |  | 行内动作按钮的文案。提供后才渲染动作部件。 只存放文案不存放回调：该条记录需要能被整份替换、序列化、比对， 按下之后的行为由宿主按 id 自行查询。 |
| `priority` | `number` |  | 移除时优先移除低优先级。未提供时按语气派生：error=2 / warning=1 / 其余=0。 |
| `count` | `number` |  | 按内容合并后的条数，&gt;1 时由 Headless 服务投影在标题后追加计数。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `items-change` | `NotificationItemsChangeDetails` | 队列变化；detail 为 `{ items: NotificationRecord[] }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhNotificationGroup` | `default` | `NotificationGroupSlotProps` |  |
| `XhNotificationItem` | `default` | `{ item: NotificationItemApi }` |  |
| `XhNotificationRoot` | `default` | `NotificationRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhNotificationGroup` | `placement` | `NotificationPlacement` |  | 未写时使用 notification 的 placement；写了则只接收该位置上的条目。 |
| `XhNotificationGroup` | `children` | `SlotChildren<NotificationGroupSlotProps>` |  |  |
| `XhNotificationItem` | `id` | `string` |  |  |
| `XhNotificationItem` | `title` | `string` |  |  |
| `XhNotificationItem` | `description` | `string` |  |  |
| `XhNotificationItem` | `tone` | `ToastTone` |  |  |
| `XhNotificationItem` | `loading` | `boolean` |  |  |
| `XhNotificationItem` | `duration` | `number` |  |  |
| `XhNotificationItem` | `removeDelay` | `number` |  |  |
| `XhNotificationItem` | `closable` | `boolean` |  |  |
| `XhNotificationItem` | `pauseOnPageIdle` | `boolean` |  |  |
| `XhNotificationItem` | `paused` | `boolean` |  | 由宿主整组一起暂停计时；与指针、焦点等路径并存，最后一个释放后才继续。 |
| `XhNotificationItem` | `translations` | `NotificationProps['translations']` |  |  |
| `XhNotificationItem` | `onStatusChange` | `ToastSchema['props']['onStatusChange']` |  |  |
| `XhNotificationItem` | `onAction` | `ToastSchema['props']['onAction']` |  |  |
| `XhNotificationItem` | `children` | `SlotChildren<NotificationItemSlotProps>` |  |  |
| `XhNotificationRoot` | `children` | `SlotChildren<NotificationRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `item` | toStatus(state.get()) |
| `item-progress` | toStatus(state.get()) |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`ITEMS.CREATE` · `ITEMS.UPDATE` · `ITEMS.DISMISS` · `ITEMS.DISMISS_ALL`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `visibleNotifications` | `ResolvedNotification[]` | max 之内、按加入先后排列的可见条目，已补齐默认值。 |
| `placements` | `NotificationPlacement[]` | 当前有条目的位置，按九宫格固定顺序。作者据此决定渲染哪几个 group。 |
| `count` | `number` |  |
| `getItemsByPlacement` | `(placement: NotificationPlacement) => ResolvedNotification[]` |  |
| `create` | `(options?: NotificationOptions) => string` | 入队并返回 id；同 id 已存在则就地改写，位置不变。 |
| `update` | `(id: string, options: Partial<NotificationOptions>) => void` |  |
| `dismiss` | `(id: string) => void` |  |
| `dismissAll` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getGroupProps` | `(props?: NotificationGroupProps) => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `group` | `aria-label` | props.translations.region |
| `group` | `role` | 'region' |
| `item` | `aria-atomic` | 'true' |
| `item` | `aria-describedby` | `description` 部件的 id |
| `item` | `aria-labelledby` | `title` 部件的 id |
| `item` | `aria-live` | 'assertive' \| 'polite' |
| `item` | `role` | 'alert' \| 'status' |
| `item-indicator` | `aria-hidden` | 'true' |
| `item-progress` | `aria-hidden` | 'true' |
| `item-close-trigger` | `aria-label` | props.translations.close |

## 样式参考

### 皮肤

`@xihan-ui/styles/notification.css` 使用 `[data-scope="notification"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-count` | list.length |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `group` | `data-count` | group.length |
| `group` | `data-empty` | ''（条件成立时才出现） |
| `group` | `data-placement` | props.placement |
| `item` | `data-loading` | ''（条件成立时才出现） |
| `item` | `data-paused` | ''（条件成立时才出现） |
| `item` | `data-state` | toStatus(state.get()) |
| `item` | `data-tone` | props.tone |
| `item-action-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `item-action-trigger` | `data-xh-action-control` | '' |
| `item-action-trigger` | `data-xh-action-display` | 'always' |
| `item-action-trigger` | `data-xh-action-profile` | 'text' |
| `item-action-trigger` | `data-xh-action-size` | 'sm' |
| `item-action-trigger` | `data-xh-action-variant` | 'outline' |
| `item-progress` | `data-state` | toStatus(state.get()) |
| `item-close-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `item-close-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `item-close-trigger` | `data-xh-action-control` | '' |
| `item-close-trigger` | `data-xh-action-display` | 'always' |
| `item-close-trigger` | `data-xh-action-profile` | 'icon' |
| `item-close-trigger` | `data-xh-action-size` | 'sm' |
| `item-close-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-notification-action-bg` | `item-action-trigger` | `background-color` | `default` | `transparent` | notification 的 item-action-trigger 部件 background-color 覆盖槽。 |
| `--xh-notification-action-bg-active` | `item-action-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` | notification 的 item-action-trigger 部件 background-color 覆盖槽。 |
| `--xh-notification-action-bg-hover` | `item-action-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle` | notification 的 item-action-trigger 部件 background-color 覆盖槽。 |
| `--xh-notification-action-border` | `item-action-trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-border-control`<br>`--xh-border-control-hover` | notification 的 item-action-trigger 部件 border、border-color 覆盖槽。 |
| `--xh-notification-action-fg` | `item-action-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | notification 的 item-action-trigger 部件 color 覆盖槽。 |
| `--xh-notification-action-font-weight` | `item-action-trigger` | `font-weight` | `default` | `--xh-font-weight-medium` | notification 的 item-action-trigger 部件 font-weight 覆盖槽。 |
| `--xh-notification-action-h` | `item-action-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | notification 的 item-action-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-notification-action-px` | `item-action-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | notification 的 item-action-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-notification-action-radius` | `item-action-trigger` | `border-radius` | `default` | `--xh-shape-control` | notification 的 item-action-trigger 部件 border-radius 覆盖槽。 |
| `--xh-notification-close-bg-active` | `item-close-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | notification 的 item-close-trigger 部件 background-color 覆盖槽。 |
| `--xh-notification-close-bg-hover` | `item-close-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | notification 的 item-close-trigger 部件 background-color 覆盖槽。 |
| `--xh-notification-close-fg` | `item-close-trigger` | `color` | `default` | `--xh-fg-muted` | notification 的 item-close-trigger 部件 color 覆盖槽。 |
| `--xh-notification-close-fg-hover` | `item-close-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | notification 的 item-close-trigger 部件 color 覆盖槽。 |
| `--xh-notification-close-inset` | `item`<br>`item-close-trigger`<br>`item-title` | `inset-block-start`<br>`inset-inline-end`<br>`padding-inline-end` | `default`<br>`has([data-part='item-close-trigger'])` | `--xh-surface-action-inset` | notification 的 item、item-close-trigger、item-title 部件 inset-block-start、inset-inline-end、padding-inline-end 覆盖槽。 |
| `--xh-notification-close-radius` | `item-close-trigger` | `border-radius` | `default` | `--xh-shape-control` | notification 的 item-close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-notification-close-size` | `item`<br>`item-close-trigger`<br>`item-title` | `block-size`<br>`inline-size`<br>`min-inline-size`<br>`padding-inline-end` | `default`<br>`has([data-part='item-close-trigger'])`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size`<br>`--xh-control-h-sm` | notification 的 item、item-close-trigger、item-title 部件 block-size、inline-size、min-inline-size、padding-inline-end 覆盖槽。 |
| `--xh-notification-description-fg` | `item-description` | `color` | `default` | `--xh-fg-muted` | notification 的 item-description 部件 color 覆盖槽。 |
| `--xh-notification-description-font-size` | `item-description` | `font-size` | `default` | `--xh-text-secondary-size` | notification 的 item-description 部件 font-size 覆盖槽。 |
| `--xh-notification-icon-size` | `item`<br>`item-action-trigger`<br>`item-close-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` | notification 的 item、item-action-trigger、item-close-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-notification-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-_tone-fg` | notification 的 item-indicator 部件 color 覆盖槽。 |
| `--xh-notification-indicator-size` | `item-indicator` | `--xh-icon-size`<br>`inline-size` | `default` | `--xh-glyph-size-md` | notification 的 item-indicator 部件 --xh-icon-size、inline-size 覆盖槽。 |
| `--xh-notification-inset` | `group` | `padding-block-end`<br>`padding-block-start`<br>`padding-inline` | `default` | `--xh-space-6` | notification 的 group 部件 padding-block-end、padding-block-start、padding-inline 覆盖槽。 |
| `--xh-notification-item-bg` | `item` | `background` | `default` | `--xh-material-elevated-bg` | notification 的 item 部件 background 覆盖槽。 |
| `--xh-notification-item-border` | `item` | `border` | `default` | `--xh-material-elevated-border` | notification 的 item 部件 border 覆盖槽。 |
| `--xh-notification-item-fg` | `item` | `color` | `default` | `--xh-material-elevated-fg` | notification 的 item 部件 color 覆盖槽。 |
| `--xh-notification-item-font-size` | `item` | `font-size` | `default` | `--xh-text-body-size` | notification 的 item 部件 font-size 覆盖槽。 |
| `--xh-notification-item-gap` | `item` | `column-gap` | `default` | `--xh-space-3` | notification 的 item 部件 column-gap 覆盖槽。 |
| `--xh-notification-item-leading` | `item` | `line-height` | `default` | `--xh-text-body-leading` | notification 的 item 部件 line-height 覆盖槽。 |
| `--xh-notification-item-px` | `item` | `padding-inline` | `default` | `--xh-surface-pad-lg` | notification 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-notification-item-py` | `item` | `padding-block` | `default` | `--xh-surface-pad-lg` | notification 的 item 部件 padding-block 覆盖槽。 |
| `--xh-notification-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-overlay` | notification 的 item 部件 border-radius 覆盖槽。 |
| `--xh-notification-item-row-gap` | `item` | `row-gap` | `default` | `--xh-space-2` | notification 的 item 部件 row-gap 覆盖槽。 |
| `--xh-notification-item-shadow` | `item` | `box-shadow` | `default` | `--xh-material-elevated-shadow` | notification 的 item 部件 box-shadow 覆盖槽。 |
| `--xh-notification-item-w` | `item` | `inline-size` | `default` | `--xh-overlay-max-w-lg` | notification 的 item 部件 inline-size 覆盖槽。 |
| `--xh-notification-layer` | `group` | `z-index` | `default` | `--xh-layer-toast` | notification 的 group 部件 z-index 覆盖槽。 |
| `--xh-notification-progress-bg` | `item-progress` | `background` | `default` | `--xh-_tone-soft` | notification 的 item-progress 部件 background 覆盖槽。 |
| `--xh-notification-progress-duration` | `item-progress` | `animation` | `default` | `--xh-motion-duration-slide` | notification 的 item-progress 部件 animation 覆盖槽。 |
| `--xh-notification-progress-radius` | `item-progress` | `border-radius` | `default` | `--xh-shape-pill` | notification 的 item-progress 部件 border-radius 覆盖槽。 |
| `--xh-notification-progress-thickness` | `item-progress` | `block-size` | `default` | `--xh-space-0_5` | notification 的 item-progress 部件 block-size 覆盖槽。 |
| `--xh-notification-title-fg` | `item-title` | `color` | `default` | `--xh-fg-default` | notification 的 item-title 部件 color 覆盖槽。 |
| `--xh-notification-title-font-size` | `item-indicator`<br>`item-title` | `block-size`<br>`font-size` | `default` | `--xh-text-label-size` | notification 的 item-indicator、item-title 部件 block-size、font-size 覆盖槽。 |
| `--xh-notification-title-font-weight` | `item-title` | `font-weight` | `default` | `--xh-font-weight-semibold` | notification 的 item-title 部件 font-weight 覆盖槽。 |
| `--xh-notification-title-leading` | `item-title` | `line-height` | `default` | `--xh-leading-tight` | notification 的 item-title 部件 line-height 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-countdown` · `xh-notification-in` · `xh-notification-out` · `xh-notification-spin` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

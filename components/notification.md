来源：https://ui.docs.xihanfun.com/components/notification

# Notification 通知

到期自行消失的一条消息：一枚状态字形、标题与可选的说明，可以带一个操作按钮。两种预设：卡片（`card`）承载主动推送的两层消息，轻提示（`toast`）是刚才那个操作的一句结果。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/notification" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/notification.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/notification" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/notification" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/notification.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

create 入队并返回 id，队列中的每条由作者渲染为一条通知；退场动画播完后只收起不删除，宿主在 status-change 中把它移出队列

```vue
<script setup lang="ts">
import {
  XhButton,
  XhNotificationGroup,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemContent,
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
          :closable="item.closable"
          :translations="itemTranslations"
          @status-change="
            ({ id, status }) => status === 'unmounted' && dismiss(id)
          "
        >
          <XhNotificationItemIndicator />
          <XhNotificationItemContent>
            <XhNotificationItemTitle />
            <XhNotificationItemDescription />
          </XhNotificationItemContent>
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
      <div data-xh-part="item-content">
        <div data-xh-part="item-title"></div>
        <div data-xh-part="item-description"></div>
      </div>
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

`data-scope="notification"`：**`root`** · **`group`** · `item` · `item-indicator` · `item-content` · `item-title` · `item-description` · `item-action-trigger` · `item-progress` · `item-close-trigger`

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
  XhNotificationItemContent,
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
          :closable="item.closable"
          :translations="itemTranslations"
          @status-change="
            ({ id, status }) => status === 'unmounted' && dismiss(id)
          "
        >
          <XhNotificationItemIndicator />
          <XhNotificationItemContent>
            <XhNotificationItemTitle />
            <XhNotificationItemDescription />
          </XhNotificationItemContent>
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
      <div data-xh-part="item-content">
        <div data-xh-part="item-title"></div>
        <div data-xh-part="item-description"></div>
      </div>
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
  XhNotificationItemContent,
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
          :closable="item.closable"
          :translations="itemTranslations"
          @status-change="
            ({ id, status }) => status === 'unmounted' && dismiss(id)
          "
        >
          <XhNotificationItemIndicator />
          <XhNotificationItemContent>
            <XhNotificationItemTitle />
            <XhNotificationItemDescription />
          </XhNotificationItemContent>
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
      <div data-xh-part="item-content">
        <div data-xh-part="item-title"></div>
        <div data-xh-part="item-description"></div>
      </div>
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

max 限制每个位置同时显示几条，超出时移除最旧的；dismissAll 直接清空队列，不播退场动画

```vue
<script setup lang="ts">
import {
  XhButton,
  XhNotificationGroup,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemContent,
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
          :closable="item.closable"
          :translations="itemTranslations"
          @status-change="
            ({ id, status }) => status === 'unmounted' && dismiss(id)
          "
        >
          <XhNotificationItemIndicator />
          <XhNotificationItemContent>
            <XhNotificationItemTitle />
            <XhNotificationItemDescription />
          </XhNotificationItemContent>
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
      <div data-xh-part="item-content">
        <div data-xh-part="item-title"></div>
        <div data-xh-part="item-description"></div>
      </div>
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

create 返回的就是队列身份 id，保存后可随时 dismiss 该条；dismiss 直接移出队列，不播退场动画

```vue
<script setup lang="ts">
import {
  XhButton,
  XhNotificationGroup,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemContent,
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
          :closable="item.closable"
          :translations="itemTranslations"
          @status-change="(details) => settle(details, dismiss)"
        >
          <XhNotificationItemIndicator />
          <XhNotificationItemContent>
            <XhNotificationItemTitle />
            <XhNotificationItemDescription />
          </XhNotificationItemContent>
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
      <div data-xh-part="item-content">
        <div data-xh-part="item-title"></div>
        <div data-xh-part="item-description"></div>
      </div>
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
  XhNotificationItemContent,
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
          :closable="item.closable"
          :translations="itemTranslations"
          @status-change="
            ({ id, status }) => status === 'unmounted' && dismiss(id)
          "
        >
          <XhNotificationItemIndicator />
          <XhNotificationItemContent>
            <XhNotificationItemTitle />
            <XhNotificationItemDescription />
          </XhNotificationItemContent>
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
      <div data-xh-part="item-content">
        <div data-xh-part="item-title"></div>
        <div data-xh-part="item-description"></div>
      </div>
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

### 轻提示预设

preset="toast" 换成一句话的轻提示：落底部居中、最多 3 条、叠成一摞，鼠标或焦点进入即展开；卡片要把队列交下来的 preset 带上

```vue
<script setup lang="ts">
import {
  XhButton,
  XhNotificationGroup,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemContent,
  XhNotificationItemDescription,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
  XhNotificationRoot,
} from "@xihan-ui/vue";

type Create = (options: Record<string, unknown>) => string;
type Update = (id: string, options: Record<string, unknown>) => void;

const itemTranslations = { close: "关闭" };

// 加载中不自动消失，落定成 success 后才开始计时
function save(create: Create, update: Update): void {
  const id = create({ loading: true, title: "保存中" });
  window.setTimeout(update, 900, id, { loading: false, tone: "success", title: "已保存" });
}
</script>

<template>
  <XhNotificationRoot v-slot="{ create, update, dismiss }" preset="toast">
    <XhButton variant="solid" @click="save(create, update)">保存</XhButton>
    <XhButton variant="outline" @click="create({ tone: 'success', title: '已发布' })">success</XhButton>
    <XhButton variant="outline" @click="create({ tone: 'warning', title: '配额即将用尽' })">warning</XhButton>
    <XhButton variant="outline" @click="create({ tone: 'danger', title: '同步失败' })">danger</XhButton>

    <XhNotificationGroup>
      <template #default="{ item }">
        <XhNotificationItem
          :id="item.id"
          :preset="item.preset"
          :title="item.title"
          :description="item.description"
          :tone="item.tone"
          :loading="item.loading"
          :duration="item.duration"
          :closable="item.closable"
          :pause-on-page-idle="item.pauseOnPageIdle"
          :translations="itemTranslations"
          @status-change="
            ({ id, status }) => status === 'unmounted' && dismiss(id)
          "
        >
          <XhNotificationItemIndicator />
          <XhNotificationItemContent>
            <XhNotificationItemTitle />
            <XhNotificationItemDescription />
          </XhNotificationItemContent>
          <XhNotificationItemCloseTrigger />
        </XhNotificationItem>
      </template>
    </XhNotificationGroup>
  </XhNotificationRoot>
</template>
```

```html
<xh-notification id="notification-toast" preset="toast">
  <div data-xh-part="root">
    <xh-button variant="solid" data-save>
      <button data-xh-part="root">保存</button>
    </xh-button>
    <xh-button variant="outline" data-create="success">
      <button data-xh-part="root">success</button>
    </xh-button>
    <xh-button variant="outline" data-create="warning">
      <button data-xh-part="root">warning</button>
    </xh-button>
    <xh-button variant="outline" data-create="danger">
      <button data-xh-part="root">danger</button>
    </xh-button>

    <div data-xh-part="group"></div>
  </div>
</xh-notification>

<template id="notification-toast-template">
  <xh-notification-item>
    <div data-xh-part="item">
      <span data-xh-part="item-indicator"></span>
      <div data-xh-part="item-content">
        <div data-xh-part="item-title"></div>
        <div data-xh-part="item-description"></div>
      </div>
      <button data-xh-part="item-close-trigger"></button>
    </div>
  </xh-notification-item>
</template>

<script type="module">
  const notification = document.getElementById("notification-toast");
  const group = notification.querySelector('[data-xh-part="group"]');
  const template = document.getElementById("notification-toast-template");
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
      node.preset = item.preset;
      node.titleText = item.title;
      node.description = item.description;
      node.tone = item.tone;
      node.loading = item.loading;
      node.duration = item.duration;
      node.closable = item.closable;
      node.pauseOnPageIdle = item.pauseOnPageIdle;
    }
  }

  notification.addEventListener("items-change", render);

  const messages = {
    success: { tone: "success", title: "已发布" },
    warning: { tone: "warning", title: "配额即将用尽" },
    danger: { tone: "danger", title: "同步失败" },
  };

  for (const button of notification.querySelectorAll("[data-create]")) {
    button.addEventListener("click", () =>
      notification.create(messages[button.dataset.create])
    );
  }

  // 加载中不自动消失，落定成 success 后才开始计时
  notification.querySelector("[data-save]").addEventListener("click", () => {
    const id = notification.create({ loading: true, title: "保存中" });
    window.setTimeout(() => {
      notification.updateItem(id, { loading: false, tone: "success", title: "已保存" });
    }, 900);
  });
</script>
```

### 全局服务

createNotificationService 自带宿主，传 preset: 'toast' 即轻提示；模块作用域随处可调用（请求拦截器、store）

```vue
<script setup lang="ts">
import type { NotificationService } from "@xihan-ui/vue";
import { createNotificationService, XhButton } from "@xihan-ui/vue";
import { onBeforeUnmount } from "vue";

// 惰性建单例：服务要 document，等到第一次调用（必然在客户端）再建
let toast: NotificationService | undefined;
function use(): NotificationService {
  toast ??= createNotificationService({ preset: "toast" });
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

```html
<div style="display: flex; flex-wrap: wrap; gap: 8px">
  <xh-button id="notification-service-save" variant="solid">
    <button data-xh-part="root">保存（loading 收尾成 success）</button>
  </xh-button>
  <xh-button id="notification-service-success" variant="outline">
    <button data-xh-part="root">success</button>
  </xh-button>
  <xh-button id="notification-service-warning" variant="outline">
    <button data-xh-part="root">warning</button>
  </xh-button>
  <xh-button id="notification-service-danger" variant="outline">
    <button data-xh-part="root">danger</button>
  </xh-button>
</div>

<script type="module">
  import { createNotificationService } from "@xihan-ui/web-components/services";

  // 服务自带宿主，建一次，句柄在模块作用域随处可调
  const toast = createNotificationService({ preset: "toast" });

  document.getElementById("notification-service-save").addEventListener("click", () => {
    const id = toast.loading("保存中");
    setTimeout(() => toast.update(id, { loading: false, tone: "success", title: "已保存" }), 900);
  });
  document.getElementById("notification-service-success").addEventListener("click", () => toast.success("已发布"));
  document.getElementById("notification-service-warning").addEventListener("click", () => toast.warning("配额即将用尽"));
  document.getElementById("notification-service-danger").addEventListener("click", () => toast.danger("同步失败"));
</script>
```

### 计时与暂停

duration 结束后自动退场；指针停在卡片上或焦点进入卡片内都会暂停计时，离开后继续剩余部分；单条卡片也可以单独摆放

```vue
<script setup lang="ts">
import {
  XhButton,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemContent,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

const seq = ref(0);
</script>

<template>
  <div style="display: grid; width: 100%; gap: 12px; justify-items: center">
    <XhNotificationItem
      :key="seq"
      v-slot="{ item }"
      preset="toast"
      title="6 秒后自动收走"
      :duration="6000"
      :translations="{ close: '关闭' }"
    >
      <XhNotificationItemIndicator />
      <XhNotificationItemContent>
        <XhNotificationItemTitle />
        <span style="font-size: 12px; opacity: 0.75">
          状态：{{ item.status }} · {{ item.paused ? "计时已按住" : "计时在走" }}
        </span>
      </XhNotificationItemContent>
      <XhNotificationItemCloseTrigger />
    </XhNotificationItem>
    <XhButton size="sm" variant="outline" @click="seq++">重新计时</XhButton>
  </div>
</template>
```

```html
<div style="display: grid; width: 100%; gap: 12px; justify-items: center">
  <div id="notification-pause-slot"></div>
  <xh-button id="notification-pause-again" size="sm" variant="outline">
    <button data-xh-part="root">重新计时</button>
  </xh-button>
</div>

<template id="notification-pause-template">
  <xh-notification-item preset="toast" title="6 秒后自动收走" duration="6000">
    <div data-xh-part="item">
      <span data-xh-part="item-indicator"></span>
      <div data-xh-part="item-content">
        <div data-xh-part="item-title"></div>
        <span data-readout style="font-size: 12px; opacity: 0.75"></span>
      </div>
      <button data-xh-part="item-close-trigger"></button>
    </div>
  </xh-notification-item>
</template>

<script type="module">
  const slot = document.getElementById("notification-pause-slot");
  const template = document.getElementById("notification-pause-template");
  let watcher;

  // 生命周期与暂停态都写在卡片上，照它回显
  function mount() {
    const node = document.importNode(template.content.firstElementChild, true);
    node.translations = { close: "关闭" };
    slot.replaceChildren(node);

    const item = node.querySelector('[data-xh-part="item"]');
    const readout = node.querySelector("[data-readout]");
    const paint = () => {
      const paused = item.hasAttribute("data-paused");
      readout.textContent = `状态：${item.dataset.state ?? ""} · ${
        paused ? "计时已按住" : "计时在走"
      }`;
    };

    watcher?.disconnect();
    watcher = new MutationObserver(paint);
    watcher.observe(item, {
      attributes: true,
      attributeFilter: ["data-state", "data-paused"],
    });
    paint();
  }

  mount();
  document.getElementById("notification-pause-again").addEventListener("click", mount);
</script>
```

### 操作按钮

item-action-trigger 按下时先发 action 事件，再使该条进入退场；破坏性操作配“撤销”优于事前确认

```vue
<script setup lang="ts">
import {
  XhButton,
  XhNotificationItem,
  XhNotificationItemActionTrigger,
  XhNotificationItemCloseTrigger,
  XhNotificationItemContent,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
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
    <XhNotificationItem
      id="notification-demo-action"
      :key="seq"
      preset="toast"
      title="已删除 1 个文件"
      :duration="0"
      :translations="{ close: '关闭' }"
      @action="onAction"
    >
      <XhNotificationItemIndicator />
      <XhNotificationItemContent><XhNotificationItemTitle /></XhNotificationItemContent>
      <XhNotificationItemActionTrigger>撤销</XhNotificationItemActionTrigger>
      <XhNotificationItemCloseTrigger />
    </XhNotificationItem>
    <div style="display: flex; align-items: center; gap: 12px">
      <XhButton size="sm" variant="outline" @click="seq++">再挂一条</XhButton>
      <span>{{ log }}</span>
    </div>
  </div>
</template>
```

```html
<div style="display: grid; width: 100%; gap: 12px; justify-items: center">
  <div id="notification-action-slot"></div>
  <div style="display: flex; align-items: center; gap: 12px">
    <xh-button id="notification-action-again" size="sm" variant="outline">
      <button data-xh-part="root">再挂一条</button>
    </xh-button>
    <span id="notification-action-log">（还没点）</span>
  </div>
</div>

<template id="notification-action-template">
  <xh-notification-item
    id="notification-demo-action"
    preset="toast"
    title="已删除 1 个文件"
    duration="0"
  >
    <div data-xh-part="item">
      <span data-xh-part="item-indicator"></span>
      <div data-xh-part="item-content"><div data-xh-part="item-title"></div></div>
      <button data-xh-part="item-action-trigger">撤销</button>
      <button data-xh-part="item-close-trigger"></button>
    </div>
  </xh-notification-item>
</template>

<script type="module">
  const slot = document.getElementById("notification-action-slot");
  const template = document.getElementById("notification-action-template");
  const log = document.getElementById("notification-action-log");

  function mount() {
    const node = document.importNode(template.content.firstElementChild, true);
    node.translations = { close: "关闭" };
    slot.replaceChildren(node);
  }

  // action 带的是这张卡片的身份，从容器上接冒泡上来的那一份
  slot.addEventListener("action", (event) => {
    log.textContent = `撤销了：${event.detail.id}`;
  });

  mount();
  document.getElementById("notification-action-again").addEventListener("click", mount);
</script>
```

## 设计指引

### 何时使用

- 一次操作的结果：“已保存”“已复制”“发送失败”，用轻提示预设。
- 系统或他人发起的消息：新评论、审批到达、后台任务完成，用卡片预设。
- 反馈重要但不需要打断用户。

### 何时不用

- 用户必须处理才能继续时，使用[对话框](./dialog)阻断。
- 页面内某块区域的常驻状态说明使用[警告提示](./alert)。
- 需要持续阅读的长内容不放进轻提示，改用卡片预设或页面内的说明。

### 特性

- `preset` 决定一组缺省值：卡片落右下、每个位置最多 5 条、逐条排开、停留 5000ms；轻提示落底部居中、最多 3 条、叠成一摞、停留 4000ms，页面转入后台时暂停计时。每一项都可以用同名 prop 单独改写。
- 九宫格落位，`placement` 决定整摞的位置，也可以逐条指定。
- 正文（`item-description`）有上限：缺省是中档滚动面高（`--xh-viewport-h-md`，16rem），长文在正文里竖滚、滚到头不带动页面，标题与操作钮留在卡片上；`--xh-notification-description-max-h` 可以改这条上限。整摞是不吃指针、不裁切的视口定位面，撑出视口的部分既看不到也滚不到，所以卡片不随正文无限长高。
- `max` 限制每个位置同时显示的条数，超出时先挤出低优先级，同级中挤出最旧的；设为 `Infinity` 即不限制。
- 同一个 id 再次发出即就地改写，位置不变，用于“处理中 → 已完成”；`loading` 期间换为加载环且不自动消失。
- 每条自带计时与暂停：指针停在卡片上或焦点进入时暂停计时。`duration` 为 0 时常驻不消失。
- `stacked` 把同一位置的几条叠成一摞：最新一条在最前，后层按层深收拢；鼠标或焦点进入后按真实高度展开，整摞计时一并按住，`Escape` 收起。
- 轻提示预设的关闭按钮排在行尾，可悬停设备上悬停或焦点进入卡片时才显示；卡片预设的关闭按钮钉在右上角。

### 组合

- 卡片的文本列是 `item-content`，内部组合 `item-title` 与可选的 `item-description`。
- 卡片可以放一个操作按钮（查看详情、撤销），按下即退场。
- 队列的增删改由根插槽统一给出，业务代码不需要自行维护数组；命令式服务 `createNotificationService` 自带宿主，`preset` 传给它即得到同一种形态。

### 最佳实践

- 整个应用每种预设只挂一个队列，挂在最外层。
- 破坏性操作配“撤销”按钮，体验优于事前确认对话框。
- 错误类消息停留更久，或把 `duration` 设为 0，由用户自行关闭。
- 落位避开固定的操作条与移动端手势区。

### 反模式

- 把错误详情放进轻提示，用户尚未读完就消失。
- 用卡片做一次点击的结果反馈：两层文本的大卡片喧宾夺主。
- 同一个动作连续发出多条，或每个页面各挂一个队列、多摞互相遮盖。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-notification>` |
| Vue 组件 | `XhNotificationGroup` `XhNotificationItem` `XhNotificationItemActionTrigger` `XhNotificationItemCloseTrigger` `XhNotificationItemContent` `XhNotificationItemDescription` `XhNotificationItemIndicator` `XhNotificationItemProgress` `XhNotificationItemTitle` `XhNotificationRoot` |
| 组合式函数 | `useNotification` |
| 状态机 | `notificationMachine` |
| 皮肤 | `@xihan-ui/styles/notification.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `items` | `NotificationRecord[]` |  | 受控队列：提供后由宿主决定，内部写入只发 onItemsChange。 |
| `defaultItems` | `NotificationRecord[]` |  |  |
| `preset` | `NotificationPreset` |  | 形态预设，默认 card。决定下面几项未写时的缺省值，以及卡片排版与关闭钮档位。 |
| `placement` | `NotificationPlacement` |  | 默认落位：card 为 bottom-end，toast 为 bottom。 |
| `max` | `number` |  | 每个位置最多同时保留几条，超出时先移除低优先级、同级中移除最旧的。card 为 5、toast 为 3；提供 Infinity 即不限。 |
| `dedupe` | `NotificationDedupe` |  | 重复的处理方式，默认 'id'。 |
| `gap` | `number` |  | 同一组内的间距（px）：card 为 16、toast 为 12。 |
| `duration` | `number` |  | 单条未写 duration 时的默认停留毫秒：card 为 5000、toast 为 4000。 |
| `stacked` | `boolean` |  | 同一位置的几条叠成一摞：最新的一条在最前，后层按层深收拢；指针或焦点进入后按真实高度展开， 展开期间整摞的计时一并按住。card 默认不叠，toast 默认叠。 |
| `pauseOnPageIdle` | `boolean` |  | 页面切到后台时暂停计时，逐条下发：card 默认关闭，toast 默认开启。 |
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
| `loading` | `boolean` |  | 事情尚未完成：行首换为加载环，且不自动消失。 |
| `duration` | `number` |  |  |
| `closable` | `boolean` |  |  |
| `placement` | `NotificationPlacement` |  | 单条覆盖落位；未提供时使用 notification 的 placement。 |
| `actionLabel` | `string` |  | 行内动作按钮的文案。提供后才渲染动作部件。 只存放文案不存放回调：该条记录需要能被整份替换、序列化、比对， 按下之后的行为由宿主按 id 自行查询。 |
| `priority` | `number` |  | 移除时优先移除低优先级。未提供时按语气派生：danger=2 / warning=1 / 其余=0。 |
| `count` | `number` |  | 按内容合并后的条数，&gt;1 时由服务投影在标题后追加计数。 |

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
| `XhNotificationItem` | `default` | `NotificationItemSlotProps` |  |
| `XhNotificationRoot` | `default` | `NotificationRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhNotificationGroup` | `placement` | `NotificationPlacement` |  | 未写时使用 notification 的 placement；写了则只接收该位置上的条目。 |
| `XhNotificationGroup` | `children` | `SlotChildren<NotificationGroupSlotProps>` |  |  |
| `XhNotificationItem` | `id` | `string` |  | 队列身份，不是 DOM id；未提供时回落到实例的 scope id。 |
| `XhNotificationItem` | `preset` | `NotificationPreset` |  |  |
| `XhNotificationItem` | `title` | `string` |  |  |
| `XhNotificationItem` | `description` | `string` |  |  |
| `XhNotificationItem` | `tone` | `NotificationTone` |  |  |
| `XhNotificationItem` | `loading` | `boolean` |  |  |
| `XhNotificationItem` | `duration` | `number` |  |  |
| `XhNotificationItem` | `closable` | `boolean` |  |  |
| `XhNotificationItem` | `pauseOnPageIdle` | `boolean` |  |  |
| `XhNotificationItem` | `paused` | `boolean` |  | 由宿主整组一起暂停计时；与指针、焦点等路径并存，最后一个释放后才继续。 |
| `XhNotificationItem` | `translations` | `NotificationItemProps['translations']` |  |  |
| `XhNotificationItem` | `onStatusChange` | `NotificationItemProps['onStatusChange']` |  |  |
| `XhNotificationItem` | `onAction` | `NotificationItemProps['onAction']` |  |  |
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

**事件**：`ITEMS.CREATE` · `ITEMS.UPDATE` · `ITEMS.DISMISS` · `ITEMS.DISMISS_ALL` · `STACK.EXPAND` · `STACK.COLLAPSE`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `preset` | `NotificationPreset` | 形态预设，已补齐缺省。 |
| `stacked` | `boolean` | 是否叠成一摞，已补齐缺省。 |
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

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus 在 item-close-trigger 上且 closable | 立即进入 dismissing，退场动画播完后转 unmounted |
| `Enter` / `Space` | focus 在 item-action-trigger 上 | 触发 onAction 并进入 dismissing |
| `Enter` / `Space` | held in item-close-trigger / item-action-trigger（item-close-trigger 须 closable） | 按住期间该按钮投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或进入退场撤下 |
| `Escape` | focus 在叠放的一摞（stacked）里 | 收起展开的一摞，焦点离开卡片；整摞的计时随之放开 |

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

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-count` | list.length |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `group` | `data-count` | group.length |
| `group` | `data-empty` | ''（条件成立时才出现） |
| `group` | `data-expanded` | ''（条件成立时才出现） |
| `group` | `data-placement` | props.placement |
| `group` | `data-preset` | props.preset |
| `group` | `data-stacked` | ''（条件成立时才出现） |
| `item` | `data-loading` | ''（条件成立时才出现） |
| `item` | `data-paused` | ''（条件成立时才出现） |
| `item` | `data-preset` | props.preset |
| `item` | `data-state` | toStatus(state.get()) |
| `item` | `data-tone` | props.tone |
| `item` | `data-xh-loading-ring` | '' |
| `item-indicator` | `data-loading` | ''（条件成立时才出现） |
| `item-indicator` | `data-xh-loading-ring` | '' |
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
| `item-close-trigger` | `data-xh-action-size` | 'xs' \| 'sm' |
| `item-close-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-notification-action-bg` | `item-action-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `transparent` | notification 的 item-action-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-notification-action-bg-active` | `item-action-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` | notification 的 item-action-trigger 部件 background-color 覆盖槽。 |
| `--xh-notification-action-bg-hover` | `item-action-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle` | notification 的 item-action-trigger 部件 background-color 覆盖槽。 |
| `--xh-notification-action-border` | `item-action-trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-border-control`<br>`--xh-border-control-hover` | notification 的 item-action-trigger 部件 border、border-color 覆盖槽。 |
| `--xh-notification-action-fg` | `item-action-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | notification 的 item-action-trigger 部件 color 覆盖槽。 |
| `--xh-notification-action-font-weight` | `item-action-trigger` | `font-weight` | `default` | `--xh-font-weight-medium` | notification 的 item-action-trigger 部件 font-weight 覆盖槽。 |
| `--xh-notification-action-h` | `item-action-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | notification 的 item-action-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-notification-action-px` | `item-action-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | notification 的 item-action-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-notification-action-radius` | `item-action-trigger` | `border-radius` | `default` | `--xh-shape-control` | notification 的 item-action-trigger 部件 border-radius 覆盖槽。 |
| `--xh-notification-close-bg` | `item-close-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` | notification 的 item-close-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-notification-close-bg-active` | `item-close-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | notification 的 item-close-trigger 部件 background-color 覆盖槽。 |
| `--xh-notification-close-bg-hover` | `item-close-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | notification 的 item-close-trigger 部件 background-color 覆盖槽。 |
| `--xh-notification-close-border` | `item-close-trigger` | `border` | `default` | `--xh-_action-variant-border-rest` | notification 的 item-close-trigger 部件 border 覆盖槽。 |
| `--xh-notification-close-fg` | `item-close-trigger` | `color` | `default` | `--xh-fg-muted` | notification 的 item-close-trigger 部件 color 覆盖槽。 |
| `--xh-notification-close-fg-hover` | `item-close-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | notification 的 item-close-trigger 部件 color 覆盖槽。 |
| `--xh-notification-close-inset` | `item`<br>`item-close-trigger`<br>`item-title` | `inset-block-start`<br>`inset-inline-end`<br>`padding-inline-end` | `has([data-part='item-close-trigger'])`<br>`preset=card` | `--xh-surface-action-inset` | notification 的 item、item-close-trigger、item-title 部件 inset-block-start、inset-inline-end、padding-inline-end 覆盖槽。 |
| `--xh-notification-close-radius` | `item-close-trigger` | `border-radius` | `default` | `--xh-shape-control` | notification 的 item-close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-notification-close-size` | `item`<br>`item-close-trigger`<br>`item-title` | `block-size`<br>`inline-size`<br>`min-inline-size`<br>`padding-inline-end` | `default`<br>`has([data-part='item-close-trigger'])`<br>`preset=card`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size`<br>`--xh-control-h-sm` | notification 的 item、item-close-trigger、item-title 部件 block-size、inline-size、min-inline-size、padding-inline-end 覆盖槽。 |
| `--xh-notification-description-fg` | `item-description` | `color` | `default` | `--xh-fg-muted` | notification 的 item-description 部件 color 覆盖槽。 |
| `--xh-notification-description-font-size` | `item-description` | `font-size` | `default` | `--xh-text-secondary-size` | notification 的 item-description 部件 font-size 覆盖槽。 |
| `--xh-notification-description-leading` | `item`<br>`item-description` | `line-height` | `preset=toast` | `--xh-leading-normal` | notification 的 item、item-description 部件 line-height 覆盖槽。 |
| `--xh-notification-description-max-h` | `item-description` | `max-block-size` | `default` | `--xh-viewport-h-md` | notification 的 item-description 部件 max-block-size 覆盖槽。 |
| `--xh-notification-icon-size` | `item`<br>`item-action-trigger`<br>`item-close-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` | notification 的 item、item-action-trigger、item-close-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-notification-indicator-fg` | `item`<br>`item-indicator` | `background-color`<br>`border-block-start-color`<br>`border-color`<br>`color` | `@media (prefers-reduced-motion: reduce)`<br>`@media print`<br>`default`<br>`motion=reduce`<br>`preset=toast`<br>`where([data-motion='reduce'])`<br>`xh-loading-ring` | `--xh-_tone-fg` | notification 的 item、item-indicator 部件 background-color、border-block-start-color、border-color、color 覆盖槽。 |
| `--xh-notification-indicator-p` | `item`<br>`item-indicator` | `padding` | `preset=toast` | `--xh-space-1` | notification 的 item、item-indicator 部件 padding 覆盖槽。 |
| `--xh-notification-indicator-size` | `item-indicator` | `--xh-icon-size`<br>`inline-size` | `default` | `--xh-glyph-size-md` | notification 的 item-indicator 部件 --xh-icon-size、inline-size 覆盖槽。 |
| `--xh-notification-inset` | `group` | `inset-block-end`<br>`inset-block-start`<br>`inset-inline-end`<br>`inset-inline-start`<br>`padding-block-end`<br>`padding-block-start`<br>`padding-inline` | `default`<br>`not([data-stacked])`<br>`placement=-end`<br>`placement=-start`<br>`placement=bottom`<br>`placement=top`<br>`preset=toast`<br>`stacked` | `--xh-space-4`<br>`--xh-space-6` | notification 的 group 部件 inset-block-end、inset-block-start、inset-inline-end、inset-inline-start、padding-block-end、padding-block-start、padding-inline 覆盖槽。 |
| `--xh-notification-item-bg` | `item` | `background` | `default` | `--xh-material-elevated-bg` | notification 的 item 部件 background 覆盖槽。 |
| `--xh-notification-item-border` | `item` | `border` | `default` | `--xh-material-elevated-border` | notification 的 item 部件 border 覆盖槽。 |
| `--xh-notification-item-fg` | `item` | `color` | `default` | `--xh-material-elevated-fg` | notification 的 item 部件 color 覆盖槽。 |
| `--xh-notification-item-font-size` | `item` | `font-size` | `default`<br>`preset=toast` | `--xh-text-body-size`<br>`--xh-text-label-size` | notification 的 item 部件 font-size 覆盖槽。 |
| `--xh-notification-item-gap` | `item` | `column-gap` | `default`<br>`preset=toast` | `--xh-space-2`<br>`--xh-space-3` | notification 的 item 部件 column-gap 覆盖槽。 |
| `--xh-notification-item-leading` | `item` | `line-height` | `default` | `--xh-text-body-leading` | notification 的 item 部件 line-height 覆盖槽。 |
| `--xh-notification-item-px` | `item` | `inset-inline-start`<br>`padding-inline` | `default`<br>`preset=toast` | `--xh-space-4`<br>`--xh-surface-pad-lg` | notification 的 item 部件 inset-inline-start、padding-inline 覆盖槽。 |
| `--xh-notification-item-py` | `item` | `inset-block-start`<br>`padding-block` | `default`<br>`preset=toast` | `--xh-space-3`<br>`--xh-surface-pad-lg` | notification 的 item 部件 inset-block-start、padding-block 覆盖槽。 |
| `--xh-notification-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-overlay` | notification 的 item 部件 border-radius 覆盖槽。 |
| `--xh-notification-item-row-gap` | `item`<br>`item-content` | `row-gap` | `default` | `--xh-space-2` | notification 的 item、item-content 部件 row-gap 覆盖槽。 |
| `--xh-notification-item-shadow` | `item` | `box-shadow` | `default` | `--xh-material-elevated-shadow` | notification 的 item 部件 box-shadow 覆盖槽。 |
| `--xh-notification-item-w` | `group`<br>`item` | `inline-size` | `default`<br>`preset=toast`<br>`stacked` | `--xh-overlay-max-w-lg`<br>`--xh-overlay-toast-w` | notification 的 group、item 部件 inline-size 覆盖槽。 |
| `--xh-notification-layer` | `group` | `z-index` | `default` | `--xh-layer-toast` | notification 的 group 部件 z-index 覆盖槽。 |
| `--xh-notification-progress-bg` | `item-progress` | `background` | `default` | `--xh-_tone-soft` | notification 的 item-progress 部件 background 覆盖槽。 |
| `--xh-notification-progress-duration` | `item-progress` | `animation` | `default` | `--xh-motion-duration-slide` | notification 的 item-progress 部件 animation 覆盖槽。 |
| `--xh-notification-progress-radius` | `item`<br>`item-progress` | `border-radius`<br>`clip-path` | `@keyframes xh-countdown`<br>`preset=card` | `--xh-shape-pill` | notification 的 item、item-progress 部件 border-radius、clip-path 覆盖槽。 |
| `--xh-notification-progress-thickness` | `item-progress` | `block-size` | `default` | `--xh-space-0_5` | notification 的 item-progress 部件 block-size 覆盖槽。 |
| `--xh-notification-stack-scale` | `*`<br>`group`<br>`item` | `scale` | `@keyframes xh-notification-stack-in`<br>`@keyframes xh-notification-stack-out`<br>`preset=toast`<br>`stacked` | `--xh-_notification-stack-scale` | notification 的 *、group、item 部件 scale 覆盖槽。 |
| `--xh-notification-title-fg` | `item`<br>`item-title` | `color` | `default`<br>`preset=toast` | `--xh-_tone-fg`<br>`--xh-fg-default` | notification 的 item、item-title 部件 color 覆盖槽。 |
| `--xh-notification-title-font-size` | `item-indicator`<br>`item-title` | `block-size`<br>`font-size` | `default` | `--xh-text-label-size` | notification 的 item-indicator、item-title 部件 block-size、font-size 覆盖槽。 |
| `--xh-notification-title-font-weight` | `item-title` | `font-weight` | `default` | `--xh-font-weight-semibold` | notification 的 item-title 部件 font-weight 覆盖槽。 |
| `--xh-notification-title-leading` | `item-title` | `line-height` | `default` | `--xh-leading-tight` | notification 的 item-title 部件 line-height 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 指示与换位 · 出现（面板） · 导航 · 数值（见[动效规范](../design/motion#角色)）。

可覆盖的动效槽：`--xh-notification-progress-duration`。

关键帧 `xh-notification-stack-in` · `xh-notification-stack-out` 随皮肤自带，不引用别处文件里的名字；共享关键帧 `xh-countdown` · `xh-sheet-in` · `xh-sheet-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`block-size` · `opacity` · `scale` · `translate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### 响应式

皮肤另按输入能力分档：`hover: hover`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；只认物理方向的量乘 `--xh-direction-sign` 换向，按就近的 `dir` 走。

来源：https://ui.docs.xihanfun.com/components/notification

# Notification `通知`

主动推给用户的一条消息：有标题、有正文，可以带操作按钮。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/notification" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/notification.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/notification" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/notification" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/notification.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

create 入队并返回 id，队列里的每条由作者渲染成一条通知；退场窗口走完只收起不删，宿主在 status-change 里把它移出队列

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
          type: 'error',
          title: '同步失败',
          description: '网络中断，稍后自动重试',
        })
      "
    >
      弹一条 error
    </XhButton>
    <span>队列：{{ count }} 条</span>

    <XhNotificationGroup>
      <template #default="{ item }">
        <XhNotificationItem
          :id="item.id"
          :title="item.title"
          :description="item.description"
          :type="item.type"
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
    <xh-button variant="outline" data-create="error">
      <button data-xh-part="root">弹一条 error</button>
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
      node.type = item.type;
      node.duration = item.duration;
      node.removeDelay = item.removeDelay;
      node.closable = item.closable;
    }
    count.textContent = String(notification.count);
  }

  notification.addEventListener("items-change", render);

  const messages = {
    save: { title: "草稿已保存", description: "内容已同步到云端" },
    error: {
      type: "error",
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

## 示例

### 落位

placement 决定这一摞贴视口的哪个角，换的只是 group 上的 data-placement，队列本身不动

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
          :type="item.type"
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
      node.type = item.type;
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

同一个 id 再 create 一次是原地改写而不是新弹一条，位置不动；loading 不自动消失，换成 success 才开始倒计时

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
    type: "loading",
    title: "正在上传",
    description: "3 个文件排队中",
  });
  // 改一条已经在队列里的
  window.setTimeout(update, 1200, "upload", { description: "已传 2 / 3" });
  // 同一个 id 再 create 一次同样是就地改写
  window.setTimeout(create, 2400, {
    id: "upload",
    type: "success",
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
          :type="item.type"
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
      node.type = item.type;
      node.duration = item.duration;
      node.removeDelay = item.removeDelay;
      node.closable = item.closable;
    }
  }

  notification.addEventListener("items-change", render);

  notification.querySelector("[data-start]").addEventListener("click", () => {
    notification.create({
      id: "upload",
      type: "loading",
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
        type: "success",
        title: "上传完成",
        description: "3 个文件已入库",
      });
    }, 2400);
  });
</script>
```

### 上限与清空

max 限制每个位置同时显示几条，超出挤掉最旧的；dismissAll 把队列直接倒掉，不走退场窗口

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
          :type="item.type"
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
      node.type = item.type;
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

### 手动收走

create 返回的就是队列身份 id，存下来随时 dismiss 掉那一条；dismiss 直接移出队列，不走退场窗口

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
    type: "loading",
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
          :type="item.type"
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
      node.type = item.type;
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
      type: "loading",
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

单条通知自带 placement 就盖掉 notification 的默认落位；placements 报出眼下有条目的位置，一个位置一摞

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
          :type="item.type"
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
        node.type = item.type;
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

- 系统或他人发起的消息：新评论、审批到达、任务跑完了。
- 后台完成的长任务：用户当时可能已经在做别的事。
- 一句话讲不完，需要标题加正文两层的信息。

### 何时不用

- 用户刚点了一下按钮，只要一句结果反馈：用[轻提示](./toast)。
- 用户必须处理才能继续：用[对话框](./dialog)阻断。
- 页面内某块区域的常驻状态说明：用[警告提示](./alert)。

### 特性

- 九宫格落位，`placement` 决定这一摞落在哪儿；也可以按条逐个指定。
- `max` 限制每个位置同时显示几条，默认 5，超出先挤低优先级、同级里挤最旧的；给 `Infinity` 即不限。
- 同一个 id 再发一次即就地改写，位置不动，用来做"处理中 → 已完成"。
- 每条自带计时与暂停：指针停在卡片上、或焦点落进去时不再走表。
- `duration` 给 0 即常驻不消失，适合需要用户处理的消息。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-notification>` |
| Vue 组件 | `XhNotificationGroup` `XhNotificationItem` `XhNotificationItemActionTrigger` `XhNotificationItemCloseTrigger` `XhNotificationItemDescription` `XhNotificationItemIndicator` `XhNotificationItemProgress` `XhNotificationItemTitle` `XhNotificationRoot` |
| 组合式函数 | `useNotification` |
| 状态机 | `notificationMachine` |
| 皮肤 | `@xihan-ui/styles/notification.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="notification"`：**`root`** · **`group`** · `item` · `item-indicator` · `item-title` · `item-description` · `item-action-trigger` · `item-progress` · `item-close-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `items` | `NotificationRecord[]` |  | 受控队列：给了就由宿主说了算，内部写入只发 onItemsChange。 |
| `defaultItems` | `NotificationRecord[]` |  |  |
| `placement` | `NotificationPlacement` |  | 默认落位，默认 bottom-end。 |
| `max` | `number` |  | 每个位置最多同时留几条，超出先挤低优先级、同级里挤最旧的。默认 5；给 Infinity 即不限。 |
| `dedupe` | `NotificationDedupe` |  | 重复怎么算，默认 'id'。 |
| `gap` | `number` |  | 同一摞内的间距（px），默认 16。 |
| `duration` | `number` |  | 单条没写 duration 时的默认停留毫秒。 |
| `removeDelay` | `number` |  | 单条没写 removeDelay 时的默认退场窗口毫秒。 |
| `pauseOnPageIdle` | `boolean` |  | 页面切到后台时暂停计时，逐条下发给 toast。 |
| `translations` | `Partial<NotificationTranslations>` |  |  |
| `onItemsChange` | `(details: NotificationItemsChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `items-change` | `NotificationItemsChangeDetails` | 队列变化；detail 为 `{ items: NotificationRecord[] }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhNotificationGroup` | `default` | `NotificationGroupSlotProps` |  |
| `XhNotificationItem` | `default` | `{ item: NotificationItemApi }` |  |
| `XhNotificationRoot` | `default` | `NotificationRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `item` | toStatus(state.get()) |
| `item-progress` | toStatus(state.get()) |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`ITEMS.CREATE` · `ITEMS.UPDATE` · `ITEMS.DISMISS` · `ITEMS.DISMISS_ALL`

## connect API

`useNotification` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `visibleNotifications` | `ResolvedNotification[]` | max 之内、按加入先后排列的可见条目，已补齐默认值。 |
| `placements` | `NotificationPlacement[]` | 当前有条目的位置，按九宫格固定顺序。作者据此决定渲染哪几个 group。 |
| `count` | `number` |  |
| `getItemsByPlacement` | `(placement: NotificationPlacement) => ResolvedNotification[]` |  |
| `create` | `(options?: NotificationOptions) => string` | 入队并返回 id；同 id 已存在则就地改写，位置不动。 |
| `update` | `(id: string, options: Partial<NotificationOptions>) => void` |  |
| `dismiss` | `(id: string) => void` |  |
| `dismissAll` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getGroupProps` | `(props?: NotificationGroupProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

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

## 样式

默认皮肤 `@xihan-ui/styles/notification.css` 按部件选择：`[data-scope="notification"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-count` | list.length |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `group` | `data-count` | group.length |
| `group` | `data-empty` | ''（条件成立时才出现） |
| `group` | `data-placement` | props.placement |
| `item` | `data-paused` | ''（条件成立时才出现） |
| `item` | `data-severity` | props.type |
| `item` | `data-state` | toStatus(state.get()) |
| `item` | `data-tone` | toneOf(type) |
| `item-progress` | `data-state` | toStatus(state.get()) |
| `item-close-trigger` | `data-disabled` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-notification-action-bg` | `item-action-trigger` | `background` | `default` | `--xh-bg-subtle` | notification 的 item-action-trigger 部件 background 覆盖槽。 |
| `--xh-notification-action-bg-active` | `item-action-trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | notification 的 item-action-trigger 部件 background 覆盖槽。 |
| `--xh-notification-action-bg-hover` | `item-action-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | notification 的 item-action-trigger 部件 background 覆盖槽。 |
| `--xh-notification-action-border` | `item-action-trigger` | `border` | `default` | `--xh-border-default` | notification 的 item-action-trigger 部件 border 覆盖槽。 |
| `--xh-notification-action-fg` | `item-action-trigger` | `color` | `default` | `--xh-fg-default` | notification 的 item-action-trigger 部件 color 覆盖槽。 |
| `--xh-notification-action-font-weight` | `item-action-trigger` | `font-weight` | `default` | `--xh-font-weight-medium` | notification 的 item-action-trigger 部件 font-weight 覆盖槽。 |
| `--xh-notification-action-h` | `item-action-trigger` | `block-size` | `default` | `--xh-control-h-sm` | notification 的 item-action-trigger 部件 block-size 覆盖槽。 |
| `--xh-notification-action-px` | `item-action-trigger` | `padding-inline` | `default` | `--xh-control-px-sm` | notification 的 item-action-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-notification-action-radius` | `item-action-trigger` | `border-radius` | `default` | `--xh-shape-control` | notification 的 item-action-trigger 部件 border-radius 覆盖槽。 |
| `--xh-notification-close-bg-active` | `item-close-trigger` | `background` | `active` | `--xh-bg-subtle-active` | notification 的 item-close-trigger 部件 background 覆盖槽。 |
| `--xh-notification-close-bg-hover` | `item-close-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | notification 的 item-close-trigger 部件 background 覆盖槽。 |
| `--xh-notification-close-fg` | `item-close-trigger` | `color` | `default` | `--xh-fg-muted` | notification 的 item-close-trigger 部件 color 覆盖槽。 |
| `--xh-notification-close-fg-hover` | `item-close-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-default` | notification 的 item-close-trigger 部件 color 覆盖槽。 |
| `--xh-notification-close-inset` | `item`<br>`item-close-trigger`<br>`item-title` | `inset-block-start`<br>`inset-inline-end`<br>`padding-inline-end` | `default`<br>`has([data-part='item-close-trigger'])` | `--xh-surface-action-inset` | notification 的 item、item-close-trigger、item-title 部件 inset-block-start、inset-inline-end、padding-inline-end 覆盖槽。 |
| `--xh-notification-close-radius` | `item-close-trigger` | `border-radius` | `default` | `--xh-shape-control` | notification 的 item-close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-notification-close-size` | `item`<br>`item-close-trigger`<br>`item-title` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default`<br>`has([data-part='item-close-trigger'])` | `--xh-control-h-sm` | notification 的 item、item-close-trigger、item-title 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-notification-description-fg` | `item-description` | `color` | `default` | `--xh-fg-muted` | notification 的 item-description 部件 color 覆盖槽。 |
| `--xh-notification-description-font-size` | `item-description` | `font-size` | `default` | `--xh-text-secondary-size` | notification 的 item-description 部件 font-size 覆盖槽。 |
| `--xh-notification-icon-size` | `item` | `--xh-icon-size` | `default` | `--xh-control-indicator-size` | notification 的 item 部件 --xh-icon-size 覆盖槽。 |
| `--xh-notification-indicator-fg` | `item`<br>`item-indicator` | `color` | `default`<br>`severity=loading` | `--xh-_tone-fg`<br>`--xh-fg-muted` | notification 的 item、item-indicator 部件 color 覆盖槽。 |
| `--xh-notification-indicator-size` | `item-indicator` | `--xh-icon-size`<br>`inline-size` | `default` | `--xh-glyph-size-md` | notification 的 item-indicator 部件 --xh-icon-size、inline-size 覆盖槽。 |
| `--xh-notification-inset` | `group` | `padding-block-end`<br>`padding-block-start`<br>`padding-inline` | `default` | `--xh-space-6` | notification 的 group 部件 padding-block-end、padding-block-start、padding-inline 覆盖槽。 |
| `--xh-notification-item-bg` | `item` | `background` | `default` | `--xh-bg-surface-raised` | notification 的 item 部件 background 覆盖槽。 |
| `--xh-notification-item-border` | `item` | `border` | `default` | `--xh-border-default` | notification 的 item 部件 border 覆盖槽。 |
| `--xh-notification-item-fg` | `item` | `color` | `default` | `--xh-fg-default` | notification 的 item 部件 color 覆盖槽。 |
| `--xh-notification-item-font-size` | `item` | `font-size` | `default` | `--xh-text-body-size` | notification 的 item 部件 font-size 覆盖槽。 |
| `--xh-notification-item-gap` | `item` | `column-gap` | `default` | `--xh-space-3` | notification 的 item 部件 column-gap 覆盖槽。 |
| `--xh-notification-item-leading` | `item` | `line-height` | `default` | `--xh-text-body-leading` | notification 的 item 部件 line-height 覆盖槽。 |
| `--xh-notification-item-px` | `item` | `padding-inline` | `default` | `--xh-surface-pad-lg` | notification 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-notification-item-py` | `item` | `padding-block` | `default` | `--xh-surface-pad-lg` | notification 的 item 部件 padding-block 覆盖槽。 |
| `--xh-notification-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-surface` | notification 的 item 部件 border-radius 覆盖槽。 |
| `--xh-notification-item-row-gap` | `item` | `row-gap` | `default` | `--xh-space-2` | notification 的 item 部件 row-gap 覆盖槽。 |
| `--xh-notification-item-shadow` | `item` | `box-shadow` | `default` | `--xh-elevation-sheet` | notification 的 item 部件 box-shadow 覆盖槽。 |
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

## 动效

关键帧 `xh-countdown` · `xh-notification-in` · `xh-notification-out` · `xh-notification-spin` 随皮肤自带，不引用别处文件里的名字；`background` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 卡片可以放一个操作按钮（查看详情、撤销），按下即退场。
- 队列的增删改一并从根插槽给出，业务代码不必自己维护数组。

## 最佳实践

- 整个应用只挂一个队列，挂在最外层。
- 落位躲开固定的操作条与移动端手势区。
- 重要的那条把 `duration` 关掉，让用户自己收走。

## 反模式

- 拿它做操作反馈：一次点击弹出一张两层文本的大卡片，喧宾夺主。
- 每个页面各挂一个队列：多摞互相盖。
- `max` 设得太大，一屏被通知占满。

来源：https://ui.docs.xihanfun.com/components/dialog

# Dialog `对话框`

浮在页面之上的一层，通常需要用户处理完才能回到下面。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/dialog" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/dialog.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/dialog" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/dialog" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/dialog.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

不传 open 即为非受控；Esc 或点遮罩关闭，关闭后焦点回到触发按钮

```vue
<script setup lang="ts">
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhDialogRoot v-slot="{ setOpen }" :translations="{ close: '关闭' }">
    <XhDialogTrigger>打开对话框</XhDialogTrigger>
    <XhDialogContent>
      <XhDialogTitle>确认发布</XhDialogTitle>
      <XhDialogDescription>
        发布后这篇文档对所有人可见，之后仍可撤回。
      </XhDialogDescription>
      <div style="display: flex; justify-content: flex-end; gap: 8px">
        <XhButton variant="ghost" @click="setOpen(false)">取消</XhButton>
        <XhButton variant="solid" @click="setOpen(false)">发布</XhButton>
      </div>
      <XhDialogCloseTrigger />
    </XhDialogContent>
  </XhDialogRoot>
</template>
```

```html
<xh-dialog id="dialog-basic">
  <button data-xh-part="trigger">打开对话框</button>
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <h2 data-xh-part="title">确认发布</h2>
      <p data-xh-part="description">
        发布后这篇文档对所有人可见，之后仍可撤回。
      </p>
      <div style="display: flex; justify-content: flex-end; gap: 8px">
        <xh-button variant="ghost">
          <button data-xh-part="root" data-dismiss>取消</button>
        </xh-button>
        <xh-button variant="solid">
          <button data-xh-part="root" data-dismiss>发布</button>
        </xh-button>
      </div>
      <button data-xh-part="close-trigger" aria-label="关闭"></button>
    </div>
  </div>
</xh-dialog>

<script type="module">
  // 底部两个按钮把关闭转交给已接线的关闭部件
  const dialog = document.getElementById("dialog-basic");
  const close = dialog.querySelector('[data-xh-part="close-trigger"]');
  for (const button of dialog.querySelectorAll("[data-dismiss]")) {
    button.addEventListener("click", () => close.click());
  }
</script>
```

## 示例

### 受控

传了 open 就由宿主说了算，组件自己不再改状态；Esc、点遮罩、按叉都只回写 open

```vue
<script setup lang="ts">
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

const open = ref(false);
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhButton variant="solid" @click="open = true">打开</XhButton>
    <span>当前：{{ open ? "展开" : "收起" }}</span>
  </div>

  <XhDialogRoot v-model:open="open" :translations="{ close: '关闭' }">
    <XhDialogContent>
      <XhDialogTitle>受控对话框</XhDialogTitle>
      <XhDialogDescription>
        这里没有 trigger，开合完全由外面那颗按钮与 open 决定。
      </XhDialogDescription>
      <XhDialogCloseTrigger />
    </XhDialogContent>
  </XhDialogRoot>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 12px">
  <xh-button variant="solid">
    <button data-xh-part="root" id="dialog-controlled-open">打开</button>
  </xh-button>
  <span>当前：<span id="dialog-controlled-state">收起</span></span>
</div>

<xh-dialog id="dialog-controlled" open="false">
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <h2 data-xh-part="title">受控对话框</h2>
      <p data-xh-part="description">
        这里没有 trigger，开合完全由外面那颗按钮与 open 决定。
      </p>
      <button data-xh-part="close-trigger" aria-label="关闭"></button>
    </div>
  </div>
</xh-dialog>

<script type="module">
  // 开合状态存在宿主这一侧，组件只按 open 显示
  const dialog = document.getElementById("dialog-controlled");
  const opener = document.getElementById("dialog-controlled-open");
  const state = document.getElementById("dialog-controlled-state");

  function render(open) {
    dialog.open = open;
    state.textContent = open ? "展开" : "收起";
  }

  opener.addEventListener("click", () => render(true));
  dialog.addEventListener("open-change", (event) => render(event.detail.open));
</script>
```

### 警示对话框

role=alertdialog 交给读屏更强的语气；关掉 Esc 与点遮罩后，只剩里面这两颗按钮能走出去

```vue
<script setup lang="ts">
import {
  XhButton,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhDialogRoot
    v-slot="{ setOpen }"
    role="alertdialog"
    :close-on-escape="false"
    :close-on-interact-outside="false"
  >
    <XhDialogTrigger>删除这台设备</XhDialogTrigger>
    <XhDialogContent>
      <XhDialogTitle>删除后不可恢复</XhDialogTitle>
      <XhDialogDescription>
        设备上的离线数据会一并清除，请确认这是你要的结果。
      </XhDialogDescription>
      <div style="display: flex; justify-content: flex-end; gap: 8px">
        <XhButton variant="outline" @click="setOpen(false)">再想想</XhButton>
        <XhButton variant="solid" @click="setOpen(false)">确认删除</XhButton>
      </div>
    </XhDialogContent>
  </XhDialogRoot>
</template>
```

```html
<!-- alertdialog 一律不许点遮罩关闭，再关掉 Esc 就只剩里面两颗按钮这一条出路 -->
<xh-dialog id="dialog-alert" role="alertdialog" close-on-escape="false">
  <button data-xh-part="trigger">删除这台设备</button>
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <h2 data-xh-part="title">删除后不可恢复</h2>
      <p data-xh-part="description">
        设备上的离线数据会一并清除，请确认这是你要的结果。
      </p>
      <div style="display: flex; justify-content: flex-end; gap: 8px">
        <xh-button variant="outline">
          <button data-xh-part="root" data-dismiss>再想想</button>
        </xh-button>
        <xh-button variant="solid">
          <button data-xh-part="root" data-dismiss>确认删除</button>
        </xh-button>
      </div>
      <!-- 关闭部件不出现在版面上，只作两颗按钮的关闭出口 -->
      <button data-xh-part="close-trigger" hidden aria-label="关闭"></button>
    </div>
  </div>
</xh-dialog>

<script type="module">
  // 两颗按钮把关闭转交给已接线的关闭部件
  const dialog = document.getElementById("dialog-alert");
  const close = dialog.querySelector('[data-xh-part="close-trigger"]');
  for (const button of dialog.querySelectorAll("[data-dismiss]")) {
    button.addEventListener("click", () => close.click());
  }
</script>
```

### 尺寸

size 落成 content 的 data-size，只改面板的最大宽度；三档各自一个对话框，点开才看得出宽窄

```vue
<script setup lang="ts">
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/vue";

// 中间档不传 size，缺省即中档
const sizes = [
  { key: "sm", size: "sm", label: "sm 窄" },
  { key: "md", size: undefined, label: "缺省" },
  { key: "lg", size: "lg", label: "lg 宽" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 12px">
    <XhDialogRoot
      v-for="s in sizes"
      :key="s.key"
      v-slot="{ setOpen }"
      :size="s.size"
      :translations="{ close: '关闭' }"
    >
      <XhDialogTrigger>{{ s.label }}</XhDialogTrigger>
      <XhDialogContent>
        <XhDialogTitle>{{ s.label }}对话框</XhDialogTitle>
        <XhDialogDescription>
          内边距与字号三档一致，只有宽度上限不同。
        </XhDialogDescription>
        <div style="display: flex; justify-content: flex-end">
          <XhButton variant="solid" @click="setOpen(false)">知道了</XhButton>
        </div>
        <XhDialogCloseTrigger />
      </XhDialogContent>
    </XhDialogRoot>
  </div>
</template>
```

```html
<div id="dialog-size" style="display: flex; flex-wrap: wrap; gap: 12px">
  <xh-dialog size="sm">
    <button data-xh-part="trigger">sm 窄</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h2 data-xh-part="title">sm 窄对话框</h2>
        <p data-xh-part="description">内边距与字号三档一致，只有宽度上限不同。</p>
        <div style="display: flex; justify-content: flex-end">
          <xh-button variant="solid">
            <button data-xh-part="root" data-dismiss>知道了</button>
          </xh-button>
        </div>
        <button data-xh-part="close-trigger" aria-label="关闭"></button>
      </div>
    </div>
  </xh-dialog>

  <!-- 中间档不写 size，缺省即中档 -->
  <xh-dialog>
    <button data-xh-part="trigger">缺省</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h2 data-xh-part="title">缺省对话框</h2>
        <p data-xh-part="description">内边距与字号三档一致，只有宽度上限不同。</p>
        <div style="display: flex; justify-content: flex-end">
          <xh-button variant="solid">
            <button data-xh-part="root" data-dismiss>知道了</button>
          </xh-button>
        </div>
        <button data-xh-part="close-trigger" aria-label="关闭"></button>
      </div>
    </div>
  </xh-dialog>

  <xh-dialog size="lg">
    <button data-xh-part="trigger">lg 宽</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h2 data-xh-part="title">lg 宽对话框</h2>
        <p data-xh-part="description">内边距与字号三档一致，只有宽度上限不同。</p>
        <div style="display: flex; justify-content: flex-end">
          <xh-button variant="solid">
            <button data-xh-part="root" data-dismiss>知道了</button>
          </xh-button>
        </div>
        <button data-xh-part="close-trigger" aria-label="关闭"></button>
      </div>
    </div>
  </xh-dialog>
</div>

<script type="module">
  // 每个对话框里的按钮把关闭转交给自己那份关闭部件
  const stage = document.getElementById("dialog-size");
  for (const dialog of stage.querySelectorAll("xh-dialog")) {
    const close = dialog.querySelector('[data-xh-part="close-trigger"]');
    for (const button of dialog.querySelectorAll("[data-dismiss]")) {
      button.addEventListener("click", () => close.click());
    }
  }
</script>
```

### 头尾固定、正文滚动

header / body / footer 把面板切成三段：头与尾定在原处，只有正文那一段在滚

```vue
<script setup lang="ts">
import {
  XhButton,
  XhDialogBody,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogFooter,
  XhDialogHeader,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/vue";

const clauses = Array.from({ length: 16 }, (_, i) => `第 ${i + 1} 条 条款正文`);
</script>

<template>
  <XhDialogRoot v-slot="{ setOpen }" :translations="{ close: '关闭' }">
    <XhDialogTrigger>阅读服务条款</XhDialogTrigger>
    <XhDialogContent>
      <XhDialogHeader>
        <XhDialogTitle>服务条款</XhDialogTitle>
        <XhDialogDescription>
          写了 body 那一段，面板自己封顶、正文自己滚，头尾不跟着走。
        </XhDialogDescription>
      </XhDialogHeader>
      <XhDialogBody>
        <p v-for="c in clauses" :key="c" style="margin: 0 0 8px">{{ c }}</p>
      </XhDialogBody>
      <XhDialogFooter>
        <XhButton variant="ghost" @click="setOpen(false)">再看看</XhButton>
        <XhButton variant="solid" @click="setOpen(false)">同意</XhButton>
      </XhDialogFooter>
      <XhDialogCloseTrigger />
    </XhDialogContent>
  </XhDialogRoot>
</template>
```

```html
<xh-dialog id="dialog-scroll">
  <button data-xh-part="trigger">阅读服务条款</button>
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <header data-xh-part="header">
        <h2 data-xh-part="title">服务条款</h2>
        <p data-xh-part="description">
          写了 body 那一段，面板自己封顶、正文自己滚，头尾不跟着走。
        </p>
      </header>
      <div data-xh-part="body">
        <p style="margin: 0 0 8px">第 1 条 条款正文</p>
        <p style="margin: 0 0 8px">第 2 条 条款正文</p>
        <p style="margin: 0 0 8px">第 3 条 条款正文</p>
        <p style="margin: 0 0 8px">第 4 条 条款正文</p>
        <p style="margin: 0 0 8px">第 5 条 条款正文</p>
        <p style="margin: 0 0 8px">第 6 条 条款正文</p>
        <p style="margin: 0 0 8px">第 7 条 条款正文</p>
        <p style="margin: 0 0 8px">第 8 条 条款正文</p>
        <p style="margin: 0 0 8px">第 9 条 条款正文</p>
        <p style="margin: 0 0 8px">第 10 条 条款正文</p>
        <p style="margin: 0 0 8px">第 11 条 条款正文</p>
        <p style="margin: 0 0 8px">第 12 条 条款正文</p>
        <p style="margin: 0 0 8px">第 13 条 条款正文</p>
        <p style="margin: 0 0 8px">第 14 条 条款正文</p>
        <p style="margin: 0 0 8px">第 15 条 条款正文</p>
        <p style="margin: 0 0 8px">第 16 条 条款正文</p>
      </div>
      <footer data-xh-part="footer">
        <xh-button variant="ghost">
          <button data-xh-part="root" data-dismiss>再看看</button>
        </xh-button>
        <xh-button variant="solid">
          <button data-xh-part="root" data-dismiss>同意</button>
        </xh-button>
      </footer>
      <button data-xh-part="close-trigger" aria-label="关闭"></button>
    </div>
  </div>
</xh-dialog>

<script type="module">
  // 底部两个按钮把关闭转交给已接线的关闭部件
  const dialog = document.getElementById("dialog-scroll");
  const close = dialog.querySelector('[data-xh-part="close-trigger"]');
  for (const button of dialog.querySelectorAll("[data-dismiss]")) {
    button.addEventListener("click", () => close.click());
  }
</script>
```

### 异步确认

提交期间按钮转圈，Esc 与点遮罩这两条出口一并封住，落定之后才把 open 写回 false

```vue
<script setup lang="ts">
import {
  XhButton,
  XhButtonIndicator,
  XhButtonLabel,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const open = ref(false);
const submitting = ref(false);
const archived = ref(false);

function submit() {
  submitting.value = true;
  setTimeout(() => {
    submitting.value = false;
    archived.value = true;
    open.value = false;
  }, 1200);
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhDialogRoot
      v-model:open="open"
      :close-on-escape="!submitting"
      :close-on-interact-outside="!submitting"
    >
      <XhDialogTrigger>归档这个项目</XhDialogTrigger>
      <XhDialogContent>
        <XhDialogTitle>归档项目</XhDialogTitle>
        <XhDialogDescription>
          {{ submitting ? "正在归档，先别走开。" : "归档后项目转为只读，随时可以恢复。" }}
        </XhDialogDescription>
        <div style="display: flex; justify-content: flex-end; gap: 8px">
          <XhButton variant="ghost" :disabled="submitting" @click="open = false">
            取消
          </XhButton>
          <XhButton variant="solid" :loading="submitting" @click="submit">
            <XhButtonIndicator v-if="submitting" />
            <XhButtonLabel>{{ submitting ? "归档中" : "确认归档" }}</XhButtonLabel>
          </XhButton>
        </div>
      </XhDialogContent>
    </XhDialogRoot>
    <span>{{ archived ? "已归档" : "未归档" }}</span>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 12px">
  <xh-dialog id="dialog-async" open="false">
    <button data-xh-part="trigger">归档这个项目</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h2 data-xh-part="title">归档项目</h2>
        <p data-xh-part="description">归档后项目转为只读，随时可以恢复。</p>
        <div style="display: flex; justify-content: flex-end; gap: 8px">
          <xh-button variant="ghost" id="dialog-async-cancel">
            <button data-xh-part="root">取消</button>
          </xh-button>
          <xh-button variant="solid" id="dialog-async-submit">
            <button data-xh-part="root">
              <span data-xh-part="indicator" style="display: none"></span>
              <span data-xh-part="label">确认归档</span>
            </button>
          </xh-button>
        </div>
      </div>
    </div>
  </xh-dialog>
  <span id="dialog-async-state">未归档</span>
</div>

<script type="module">
  const dialog = document.getElementById("dialog-async");
  // 标题与描述的 id 由元素改写成 aria 引用的目标，取节点只能按角色查
  const text = dialog.querySelector('[data-xh-part="description"]');
  const cancel = document.getElementById("dialog-async-cancel");
  const submit = document.getElementById("dialog-async-submit");
  const spinner = submit.querySelector('[data-xh-part="indicator"]');
  const label = submit.querySelector('[data-xh-part="label"]');
  const state = document.getElementById("dialog-async-state");

  let submitting = false;

  // 提交态一并写进正文、两颗按钮与转圈指示器
  function render() {
    text.textContent = submitting
      ? "正在归档，先别走开。"
      : "归档后项目转为只读，随时可以恢复。";
    cancel.disabled = submitting;
    submit.loading = submitting;
    spinner.style.display = submitting ? "" : "none";
    label.textContent = submitting ? "归档中" : "确认归档";
  }

  // open 握在宿主这一侧：提交期间 Esc 与点遮罩照常发意图，不写回就关不掉
  dialog.addEventListener("open-change", (event) => {
    if (submitting) return;
    dialog.open = event.detail.open;
  });

  cancel.addEventListener("click", () => {
    dialog.open = false;
  });

  submit.addEventListener("click", () => {
    submitting = true;
    render();
    setTimeout(() => {
      submitting = false;
      render();
      state.textContent = "已归档";
      dialog.open = false;
    }, 1200);
  });

  render();
</script>
```

### 命令式确认框

一次函数调用把描述符推进表里并展开对话框；拿回的对象随后可改标题、正文与按钮状态，表里就是当前所有实例

```vue
<script setup lang="ts">
import {
  XhButton,
  XhButtonIndicator,
  XhButtonLabel,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
} from "@xihan-ui/vue";
import { reactive, ref } from "vue";

interface Spec {
  id: number;
  title: string;
  text: string;
  confirmLabel: string;
  loading: boolean;
}

const specs = reactive<Spec[]>([]);
const current = ref<Spec | null>(null);
const open = ref(false);
let seq = 0;

// 一行调用：造描述符、入表、置为当前并展开，最后把它交回调用方
function ask(title: string, text: string): Spec {
  seq += 1;
  const spec = reactive<Spec>({ id: seq, title, text, confirmLabel: "确认", loading: false });
  specs.push(spec);
  current.value = spec;
  open.value = true;
  return spec;
}

// 改的是描述符本身，对话框跟着变
function submit(): void {
  const spec = current.value;
  if (!spec)
    return;
  spec.loading = true;
  spec.confirmLabel = "提交中";
  spec.text = "正在提交，稍等一下。";
  setTimeout(() => {
    spec.loading = false;
    spec.confirmLabel = "确认";
    spec.text = "这次已经提交完成。";
    open.value = false;
  }, 1200);
}
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <XhButton variant="solid" @click="ask('删除工作区', '删除后 30 天内还能恢复。')">
        删除工作区
      </XhButton>
      <XhButton
        variant="outline"
        @click="ask('导出数据', '导出任务在后台跑，完成后发一条通知。')"
      >
        导出数据
      </XhButton>
    </div>

    <ol style="display: grid; gap: 4px; margin: 0; padding-inline-start: 20px">
      <li v-for="spec in specs" :key="spec.id">
        {{ spec.title }} — {{ spec.loading ? "提交中" : "空闲" }}
      </li>
      <li v-if="specs.length === 0">（还没有描述符）</li>
    </ol>

    <XhDialogRoot
      v-model:open="open"
      :close-on-escape="!current?.loading"
      :close-on-interact-outside="!current?.loading"
    >
      <XhDialogContent v-if="current">
        <XhDialogTitle>{{ current.title }}</XhDialogTitle>
        <XhDialogDescription>{{ current.text }}</XhDialogDescription>
        <div style="display: flex; justify-content: flex-end; gap: 8px">
          <XhButton variant="ghost" :disabled="current.loading" @click="open = false">
            取消
          </XhButton>
          <XhButton variant="solid" :loading="current.loading" @click="submit">
            <XhButtonIndicator v-if="current.loading" />
            <XhButtonLabel>{{ current.confirmLabel }}</XhButtonLabel>
          </XhButton>
        </div>
      </XhDialogContent>
    </XhDialogRoot>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
  <div style="display: flex; flex-wrap: wrap; gap: 8px">
    <xh-button variant="solid" id="dialog-imperative-remove">
      <button data-xh-part="root">删除工作区</button>
    </xh-button>
    <xh-button variant="outline" id="dialog-imperative-export">
      <button data-xh-part="root">导出数据</button>
    </xh-button>
  </div>

  <ol
    id="dialog-imperative-specs"
    style="display: grid; gap: 4px; margin: 0; padding-inline-start: 20px"
  >
    <li>（还没有描述符）</li>
  </ol>

  <xh-dialog id="dialog-imperative" open="false">
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h2 data-xh-part="title"></h2>
        <p data-xh-part="description"></p>
        <div style="display: flex; justify-content: flex-end; gap: 8px">
          <xh-button variant="ghost" id="dialog-imperative-cancel">
            <button data-xh-part="root">取消</button>
          </xh-button>
          <xh-button variant="solid" id="dialog-imperative-ok">
            <button data-xh-part="root">
              <span data-xh-part="indicator" style="display: none"></span>
              <span data-xh-part="label">确认</span>
            </button>
          </xh-button>
        </div>
      </div>
    </div>
  </xh-dialog>
</div>

<script type="module">
  const dialog = document.getElementById("dialog-imperative");
  const title = dialog.querySelector('[data-xh-part="title"]');
  const description = dialog.querySelector('[data-xh-part="description"]');
  const cancel = document.getElementById("dialog-imperative-cancel");
  const ok = document.getElementById("dialog-imperative-ok");
  const spinner = ok.querySelector('[data-xh-part="indicator"]');
  const label = ok.querySelector('[data-xh-part="label"]');
  const list = document.getElementById("dialog-imperative-specs");

  const specs = [];
  let current = null;
  let seq = 0;

  // 一行调用：造描述符、入表、置为当前并展开，最后把它交回调用方
  function ask(specTitle, text) {
    seq += 1;
    const spec = {
      id: seq,
      title: specTitle,
      text,
      confirmLabel: "确认",
      loading: false,
    };
    specs.push(spec);
    current = spec;
    dialog.open = true;
    render();
    return spec;
  }

  // 对话框与下面那张表都照当前描述符重画
  function render() {
    if (current) {
      title.textContent = current.title;
      description.textContent = current.text;
      label.textContent = current.confirmLabel;
      ok.loading = current.loading;
      spinner.style.display = current.loading ? "" : "none";
      cancel.disabled = current.loading;
    }
    const rows = specs.map(
      (spec) => `${spec.title} — ${spec.loading ? "提交中" : "空闲"}`,
    );
    list.replaceChildren(
      ...(rows.length === 0 ? ["（还没有描述符）"] : rows).map((line) => {
        const li = document.createElement("li");
        li.textContent = line;
        return li;
      }),
    );
  }

  // 改的是描述符本身，对话框跟着变
  function submit() {
    const spec = current;
    if (!spec) return;
    spec.loading = true;
    spec.confirmLabel = "提交中";
    spec.text = "正在提交，稍等一下。";
    render();
    setTimeout(() => {
      spec.loading = false;
      spec.confirmLabel = "确认";
      spec.text = "这次已经提交完成。";
      render();
      dialog.open = false;
    }, 1200);
  }

  // 提交在途时不写回 open，Esc 与点遮罩都关不掉
  dialog.addEventListener("open-change", (event) => {
    if (current?.loading) return;
    dialog.open = event.detail.open;
  });

  document
    .getElementById("dialog-imperative-remove")
    .addEventListener("click", () => {
      ask("删除工作区", "删除后 30 天内还能恢复。");
    });
  document
    .getElementById("dialog-imperative-export")
    .addEventListener("click", () => {
      ask("导出数据", "导出任务在后台跑，完成后发一条通知。");
    });

  cancel.addEventListener("click", () => {
    dialog.open = false;
  });
  ok.addEventListener("click", submit);
</script>
```

### 拖动标题栏挪窗口

指针按在标题上，顺着 DOM 找到 content 部件，把累计位移写进它的 translate；入场动画走的是 transform，两者互不覆盖

```vue
<script setup lang="ts">
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const offset = ref({ x: 0, y: 0 });
const dragging = ref(false);
let panel: HTMLElement | null = null;
let startX = 0;
let startY = 0;

function begin(event: PointerEvent): void {
  const handle = event.currentTarget as HTMLElement;
  panel = handle.closest<HTMLElement>("[data-scope=\"dialog\"][data-part=\"content\"]");
  if (!panel)
    return;
  dragging.value = true;
  startX = event.clientX - offset.value.x;
  startY = event.clientY - offset.value.y;
  handle.setPointerCapture(event.pointerId);
}

function move(event: PointerEvent): void {
  if (!dragging.value || !panel)
    return;
  offset.value = { x: event.clientX - startX, y: event.clientY - startY };
  panel.style.translate = `${offset.value.x}px ${offset.value.y}px`;
}

function end(event: PointerEvent): void {
  if (!dragging.value)
    return;
  dragging.value = false;
  panel = null;
  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
}

// 每次重新展开都是一块新面板，位移从零算起
function reset(details: { open: boolean }): void {
  if (details.open)
    offset.value = { x: 0, y: 0 };
}
</script>

<template>
  <XhDialogRoot v-slot="{ setOpen }" :translations="{ close: '关闭' }" @open-change="reset">
    <XhDialogTrigger>打开可拖动的对话框</XhDialogTrigger>
    <XhDialogContent>
      <XhDialogTitle
        style="cursor: move; touch-action: none"
        @pointerdown="begin"
        @pointermove="move"
        @pointerup="end"
        @pointercancel="end"
      >
        拖住这一行挪窗口
      </XhDialogTitle>
      <XhDialogDescription>
        位移是相对居中位置累计的，收起再打开会回到正中。
      </XhDialogDescription>
      <p style="margin: 0; color: var(--xh-fg-muted)">
        当前位移：{{ Math.round(offset.x) }} / {{ Math.round(offset.y) }}
      </p>
      <div style="display: flex; justify-content: flex-end">
        <XhButton variant="solid" @click="setOpen(false)">关闭</XhButton>
      </div>
      <XhDialogCloseTrigger />
    </XhDialogContent>
  </XhDialogRoot>
</template>
```

```html
<xh-dialog id="dialog-draggable">
  <button data-xh-part="trigger">打开可拖动的对话框</button>
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <h2 data-xh-part="title" style="cursor: move; touch-action: none">
        拖住这一行挪窗口
      </h2>
      <p data-xh-part="description">
        位移是相对居中位置累计的，收起再打开会回到正中。
      </p>
      <p style="margin: 0; color: var(--xh-fg-muted)">
        当前位移：<span id="dialog-draggable-offset">0 / 0</span>
      </p>
      <div style="display: flex; justify-content: flex-end">
        <xh-button variant="solid">
          <button data-xh-part="root" data-dismiss>关闭</button>
        </xh-button>
      </div>
      <button data-xh-part="close-trigger" aria-label="关闭"></button>
    </div>
  </div>
</xh-dialog>

<script type="module">
  const dialog = document.getElementById("dialog-draggable");
  const handle = dialog.querySelector('[data-xh-part="title"]');
  const close = dialog.querySelector('[data-xh-part="close-trigger"]');
  const readout = document.getElementById("dialog-draggable-offset");

  let panel = null;
  let dragging = false;
  let offset = { x: 0, y: 0 };
  let startX = 0;
  let startY = 0;

  // 位移写进 content 的 translate，回显同步刷新
  function apply() {
    readout.textContent = `${Math.round(offset.x)} / ${Math.round(offset.y)}`;
    if (panel) panel.style.translate = `${offset.x}px ${offset.y}px`;
  }

  handle.addEventListener("pointerdown", (event) => {
    panel = handle.closest('[data-scope="dialog"][data-part="content"]');
    if (!panel) return;
    dragging = true;
    startX = event.clientX - offset.x;
    startY = event.clientY - offset.y;
    handle.setPointerCapture(event.pointerId);
  });

  handle.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    offset = { x: event.clientX - startX, y: event.clientY - startY };
    apply();
  });

  const end = (event) => {
    if (!dragging) return;
    dragging = false;
    handle.releasePointerCapture(event.pointerId);
  };
  handle.addEventListener("pointerup", end);
  handle.addEventListener("pointercancel", end);

  // 面板节点常挂不卸载，重新展开时把上一轮的位移抹掉
  dialog.addEventListener("open-change", (event) => {
    if (!event.detail.open) return;
    offset = { x: 0, y: 0 };
    apply();
  });

  for (const button of dialog.querySelectorAll("[data-dismiss]")) {
    button.addEventListener("click", () => close.click());
  }
</script>
```

### 命令式服务

createDialogService 的 confirm 与单按钮预设：一行调用弹出，onOk 返回 Promise 时确认钮自动 pending 并拦住关闭；多次调用排队顺次弹

```vue
<script setup lang="ts">
import type { DialogService } from "@xihan-ui/vue";
import { createDialogService, XhButton } from "@xihan-ui/vue";
import { onBeforeUnmount, ref } from "vue";

let modal: DialogService | undefined;
function use(): DialogService {
  modal ??= createDialogService();
  return modal;
}
onBeforeUnmount(() => modal?.dispose());

const lastAnswer = ref("（还没问过）");

async function remove(): Promise<void> {
  const ok = await use().confirm({
    title: "删除工作区",
    content: "删除后 30 天内还能恢复。",
    tone: "danger",
    okText: "删除",
    onOk: () => new Promise(r => setTimeout(r, 900)),
  });
  lastAnswer.value = ok ? "已删除" : "取消了";
}
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
    <XhButton variant="solid" tone="danger" @click="remove()">删除工作区</XhButton>
    <XhButton
      variant="outline"
      @click="use().error({ title: '同步失败', content: '稍后重试。' })"
    >
      error 告知框
    </XhButton>
    <span>上次答复：{{ lastAnswer }}</span>
  </div>
</template>
```

## 设计指引

### 何时使用

- 需要用户做出决定且不能忽略（确认删除、填一段必要信息）。
- 一段独立的子任务，完成后回到原处。

### 何时不用

- 只是提示一条结果：用[轻提示](./toast)。
- 内容是页面主流程的一部分：直接展开在页面里。
- 内容很长或是一整个表单：用[抽屉](./drawer)或单独一页。

### 特性

- `modal` 决定是否锁住下层：非模态不创建遮罩，页面仍可点击、聚焦和滚动；展开期间切换会同步更新这些约束。
- 焦点进入时落在 `initialFocus`，关闭后归还触发器。
- `closeOnEscape` 与 `closeOnInteractOutside` 各自可关——填了一半的表单不该点一下外面就没了。
- 内容区可以内部滚动，标题栏可以拖动挪窗口。
- 关闭时内容立即失活并退出可访问树，内容与遮罩的有限退场动画全部完成后再释放模态资源，并发出 `onExitComplete` / `exit-complete`。重开撤销旧退出，卸载立即清理。
- 另有命令式服务，业务代码一次调用即弹出。
- 命令式服务与声明式组件共用 `Header / Body / Footer` 三段：标题和徽记在 Header，字符串、函数正文及取值表单在 Body，操作按钮在 Footer。长内容只滚动 Body，头尾保留在面板内。
- 命令式服务的 `onOk` 返回 `false` 只阻止关闭；同步抛错或 Promise 拒绝会保持对话框打开，设置独立 `service.actionError` 并触发 `onActionError({ cause })`。`cause` 保留原始异常，不直接转成用户提示。
- 失败提示通过服务的 `actionErrorText` 本地化：Vue 支持字符串/ref/getter，React 支持字符串/getter，Web Components 使用字符串，与各端按钮文案合同一致；提示位于 Body 的 `role=alert` 实时区。重试先清理旧异常，关闭或切换请求后旧 Promise 不再写回。
- 服务宿主或函数正文渲染失败会拒绝所属请求，`onActionError` 通知自身失败也会拒绝所属请求；业务需要处理返回 Promise 的拒绝。显式 `target` 必须是当前文档中已经连接的元素，无法展示时不会解析为取消或永久等待。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-dialog>` |
| Vue 组件 | `XhDialogBody` `XhDialogCloseTrigger` `XhDialogContent` `XhDialogDescription` `XhDialogFooter` `XhDialogHeader` `XhDialogIndicator` `XhDialogRoot` `XhDialogTitle` `XhDialogTrigger` |
| 组合式函数 | `useDialog` |
| 状态机 | `dialogMachine` |
| 皮肤 | `@xihan-ui/styles/dialog.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="dialog"`：`trigger` · `backdrop` · `positioner` · **`content`** · `header` · `indicator` · `title` · `description` · `body` · `footer` · `close-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `modal` | `boolean` |  |  |
| `role` | `'dialog' \| 'alertdialog'` |  |  |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `restoreFocus` | `boolean` |  |  |
| `initialFocus` | `string` |  | 展开后先聚焦到 content 内匹配此选择器的元素；选择器不匹配时回落默认聚焦顺序。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。只换 content 的最大宽度，落在 content 上（本组件没有 root 部件）。 |
| `variant` | `OverlayBackdropVariant` |  | 遮罩形态：opaque / blur / transparent。落在 backdrop 上，只换那一层的底色与模糊。 |
| `translations` | `Partial<DialogTranslations>` |  |  |
| `onOpenChange` | `(details: DialogOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onExitComplete` | `() => void` |  | 退出动画结束或取消，且本层资源全部释放后通知；卸载和重新打开不通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `exit-complete` | `CustomEvent` | 退出完成且本层资源已释放 |
| `open-change` | `DialogOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDialogRoot` | `default` | `DialogRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `backdrop` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

## connect API

`useDialog` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getBackdropProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getBodyProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 打开对话框并把焦点移入 content |
| `Escape` | open | 关闭并把焦点还给 trigger |
| `Tab` | open | 在 content 内向后循环焦点 |
| `Shift+Tab` | open | 在 content 内向前循环焦点 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `content` | `aria-describedby` | `description` 部件的 id |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-labelledby` | `title` 部件的 id |
| `content` | `aria-modal` | 'true' \| 'false' |
| `content` | `role` | props.role |
| `indicator` | `aria-hidden` | 'true' |
| `close-trigger` | `aria-label` | props.translations.close |

## 样式

默认皮肤 `@xihan-ui/styles/dialog.css` 按部件选择：`[data-scope="dialog"][data-part="trigger"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-variant` | props.variant |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-dialog-backdrop-bg` | `backdrop` | `background` | `default` | `--xh-bg-overlay` | dialog 的 backdrop 部件 background 覆盖槽。 |
| `--xh-dialog-backdrop-blur` | `backdrop` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `variant=blur` | `--xh-overlay-backdrop-blur` | dialog 的 backdrop 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-dialog-backdrop-filter` | `backdrop`<br>`content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default`<br>`variant=blur` | `--xh-dialog-backdrop-blur`<br>`--xh-material-elevated-backdrop` | dialog 的 backdrop、content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-dialog-backdrop-layer` | `backdrop` | `z-index` | `default` | `--xh-_layer` | dialog 的 backdrop 部件 z-index 覆盖槽。 |
| `--xh-dialog-bg` | `content` | `background` | `@media (forced-colors: active)`<br>`default` | `--xh-material-elevated-bg` | dialog 的 content 部件 background 覆盖槽。 |
| `--xh-dialog-border` | `content` | `border` | `default` | `--xh-material-elevated-border` | dialog 的 content 部件 border 覆盖槽。 |
| `--xh-dialog-close-bg-active` | `close-trigger` | `background` | `active` | `--xh-bg-subtle-active` | dialog 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-dialog-close-bg-focus` | `close-trigger` | `background` | `focus-visible` | `--xh-material-elevated-focus-surface` | dialog 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-dialog-close-bg-hover` | `close-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | dialog 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-dialog-close-fg` | `close-trigger` | `color` | `default` | `--xh-fg-muted` | dialog 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-dialog-close-fg-focus` | `close-trigger` | `color` | `focus-visible` | `--xh-material-elevated-fg` | dialog 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-dialog-close-fg-hover` | `close-trigger` | `color` | `hover` | `--xh-fg-default` | dialog 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-dialog-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | dialog 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-dialog-close-size` | `close-trigger`<br>`content`<br>`title` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default`<br>`has([data-scope='dialog'][data-part='close-trigger'])` | `--xh-control-h-sm` | dialog 的 close-trigger、content、title 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-dialog-content-backdrop-filter` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-dialog-backdrop-filter` | dialog 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-dialog-content-lens-bg` | `content` | `background` | `default` | `--xh-dialog-header-bg` | dialog 的 content 部件 background 覆盖槽。 |
| `--xh-dialog-content-lens-depth` | `content` | `background` | `default` | `--xh-dialog-header-lens-depth` | dialog 的 content 部件 background 覆盖槽。 |
| `--xh-dialog-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | dialog 的 description 部件 color 覆盖槽。 |
| `--xh-dialog-description-font-size` | `description` | `font-size` | `default` | `--xh-text-body-size` | dialog 的 description 部件 font-size 覆盖槽。 |
| `--xh-dialog-fg` | `content` | `color` | `default` | `--xh-material-elevated-fg` | dialog 的 content 部件 color 覆盖槽。 |
| `--xh-dialog-footer-gap` | `footer` | `gap` | `default` | `--xh-control-gap-md` | dialog 的 footer 部件 gap 覆盖槽。 |
| `--xh-dialog-footer-pt` | `footer` | `padding-block-start` | `default` | `--xh-space-2` | dialog 的 footer 部件 padding-block-start 覆盖槽。 |
| `--xh-dialog-gap` | `content` | `gap` | `default` | `--xh-stack-gap-md` | dialog 的 content 部件 gap 覆盖槽。 |
| `--xh-dialog-header-bg` | `content` | `background` | `default` | `--xh-material-glass-bg` | dialog 的 content 部件 background 覆盖槽。 |
| `--xh-dialog-header-gap` | `header` | `gap` | `default` | `--xh-stack-gap-sm` | dialog 的 header 部件 gap 覆盖槽。 |
| `--xh-dialog-header-lens-depth` | `content` | `background` | `default` | `--xh-dialog-py` | dialog 的 content 部件 background 覆盖槽。 |
| `--xh-dialog-header-pb` | `header` | `padding-block-end` | `default` | `--xh-space-2` | dialog 的 header 部件 padding-block-end 覆盖槽。 |
| `--xh-dialog-highlight` | `content` | `background` | `default` | `--xh-material-elevated-highlight` | dialog 的 content 部件 background 覆盖槽。 |
| `--xh-dialog-icon-size` | `content` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | dialog 的 content 部件 --xh-icon-size 覆盖槽。 |
| `--xh-dialog-indicator-bg` | `indicator` | `background` | `default` | `--xh-_tone-subtle` | dialog 的 indicator 部件 background 覆盖槽。 |
| `--xh-dialog-indicator-fg` | `indicator` | `color` | `default` | `--xh-_tone-fg` | dialog 的 indicator 部件 color 覆盖槽。 |
| `--xh-dialog-indicator-mark-size` | `indicator` | `--xh-icon-size` | `default` | `--xh-dialog-indicator-size` | dialog 的 indicator 部件 --xh-icon-size 覆盖槽。 |
| `--xh-dialog-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-pill` | dialog 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-dialog-indicator-size` | `indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-glyph-size-md` | dialog 的 indicator 部件 --xh-icon-size、block-size、inline-size 覆盖槽。 |
| `--xh-dialog-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | dialog 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-dialog-max-w` | `content` | `max-inline-size` | `default` | `--xh-_dialog-max-w` | dialog 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-dialog-positioner-padding` | `positioner` | `padding-block-end`<br>`padding-block-start`<br>`padding-inline` | `default` | `--xh-space-4` | dialog 的 positioner 部件 padding-block-end、padding-block-start、padding-inline 覆盖槽。 |
| `--xh-dialog-px` | `content` | `padding-inline` | `default` | `--xh-surface-px-md` | dialog 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-dialog-py` | `content` | `background`<br>`padding-block` | `default` | `--xh-surface-py-md` | dialog 的 content 部件 background、padding-block 覆盖槽。 |
| `--xh-dialog-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | dialog 的 content 部件 border-radius 覆盖槽。 |
| `--xh-dialog-separator` | `body`<br>`content`<br>`footer`<br>`header` | `border-block-end`<br>`border-block-start` | `has([data-scope='dialog'][data-part='body'])`<br>`has([data-scope='dialog'][data-part='footer'])` | `--xh-material-elevated-separator` | dialog 的 body、content、footer、header 部件 border-block-end、border-block-start 覆盖槽。 |
| `--xh-dialog-shadow` | `content` | `box-shadow` | `default` | `--xh-material-elevated-shadow` | dialog 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-dialog-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | dialog 的 title 部件 color 覆盖槽。 |
| `--xh-dialog-title-font-size` | `title` | `font-size` | `default` | `--xh-text-heading-3-size` | dialog 的 title 部件 font-size 覆盖槽。 |
| `--xh-dialog-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-heading-3-weight` | dialog 的 title 部件 font-weight 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-dialog-in` · `xh-dialog-out` · `xh-fade-in` · `xh-fade-out` 随皮肤自带，不引用别处文件里的名字；`background` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 内容区套[滚动区域](./scroll-area)；按钮行用[按钮组](./button-group)；确认类的轻量场景改用[弹出确认](./popconfirm)。

## 最佳实践

- 标题写这次要做什么，别写"提示"。
- 确认按钮的文字写具体动作（"删除"），不写"确定"。
- 破坏性操作用危险语气，并让取消是默认焦点。

## 反模式

- 对话框里再开对话框。
- 点外面就关，而里面有未保存的输入。

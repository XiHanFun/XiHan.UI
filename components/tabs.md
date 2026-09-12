来源：https://ui.docs.xihanfun.com/components/tabs

# Tabs `标签页`

在同一块区域里切换几组并列的内容，同时只显示一组。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tabs" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tabs.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tabs" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tabs" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tabs.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

default-value 指定初始选中项，禁用的标签方向键会跳过；面板常挂，靠 hidden 显隐

```vue
<script setup lang="ts">
import { XhTabsRoot } from "@xihan-ui/vue";

const tabs = [
  { value: "overview", label: "概览" },
  { value: "usage", label: "用法" },
  // 禁用写在数据里，方向键会跳过它
  { value: "api", label: "API（禁用）", disabled: true },
];

// 面板正文按条目取
const panels: Record<string, string> = {
  overview: "概览面板：默认 automatic，方向键移动焦点时顺带切换选中。",
  usage: "用法面板：面板不做懒挂载，切走再切回来，里面的滚动位置与表单态都还在。",
  api: "API 面板。",
};
</script>

<template>
  <XhTabsRoot
    :collection="tabs"
    default-value="overview"
    style="inline-size: 100%"
  >
    <!-- 面板内容归作者，走 panel 插槽 -->
    <template #panel="node">{{ panels[node.value] }}</template>
  </XhTabsRoot>
</template>
```

```html
<xh-tabs default-value="overview">
  <div data-xh-part="root" style="inline-size: 100%">
    <div data-xh-part="list">
      <button data-xh-part="trigger" value="overview">概览</button>
      <button data-xh-part="trigger" value="usage">用法</button>
      <button data-xh-part="trigger" value="api" aria-disabled="true">
        API（禁用）
      </button>
    </div>
    <div data-xh-part="content" value="overview">
      概览面板：默认 automatic，方向键移动焦点时顺带切换选中。
    </div>
    <div data-xh-part="content" value="usage">
      用法面板：面板不做懒挂载，切走再切回来，里面的滚动位置与表单态都还在。
    </div>
    <div data-xh-part="content" value="api">API 面板。</div>
  </div>
</xh-tabs>
```

## 示例

### 受控

传了 value 就由宿主说了算，组件自己不再改选中值；切换意图从 value-change 出来，写回才真的切

```vue
<script setup lang="ts">
import {
  XhButton,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("account");
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhTabsRoot v-model:value="value">
      <XhTabsList>
        <XhTabsTrigger value="account">账户</XhTabsTrigger>
        <XhTabsTrigger value="security">安全</XhTabsTrigger>
        <XhTabsTrigger value="notice">通知</XhTabsTrigger>
      </XhTabsList>

      <XhTabsContent value="account">账户面板</XhTabsContent>
      <XhTabsContent value="security">安全面板</XhTabsContent>
      <XhTabsContent value="notice">通知面板</XhTabsContent>
    </XhTabsRoot>

    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton variant="outline" @click="value = 'security'">
        跳到安全
      </XhButton>
      <span>当前：{{ value }}</span>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <xh-tabs id="tabs-controlled" value="account">
    <div data-xh-part="root">
      <div data-xh-part="list">
        <button data-xh-part="trigger" value="account">账户</button>
        <button data-xh-part="trigger" value="security">安全</button>
        <button data-xh-part="trigger" value="notice">通知</button>
      </div>

      <div data-xh-part="content" value="account">账户面板</div>
      <div data-xh-part="content" value="security">安全面板</div>
      <div data-xh-part="content" value="notice">通知面板</div>
    </div>
  </xh-tabs>

  <div style="display: flex; align-items: center; gap: 8px">
    <xh-button id="tabs-controlled-jump" variant="outline">
      <button data-xh-part="root">跳到安全</button>
    </xh-button>
    <span>当前：<span id="tabs-controlled-value">account</span></span>
  </div>
</div>

<script type="module">
  // 选中值只在这里写，标签栏与下面那行文字都跟着它走
  const tabs = document.getElementById("tabs-controlled");
  const readout = document.getElementById("tabs-controlled-value");
  const jump = document.getElementById("tabs-controlled-jump");

  function setValue(next) {
    tabs.value = next;
    readout.textContent = next;
  }

  tabs.addEventListener("value-change", (event) => setValue(event.detail.value));
  jump.addEventListener("click", () => setValue("security"));
</script>
```

### 手动激活

activation-mode="manual" 时方向键只搬焦点，按 Enter 或空格才真的切面板

```vue
<script setup lang="ts">
import { XhTabsRoot } from "@xihan-ui/vue";

const tabs = [
  { value: "daily", label: "日报" },
  { value: "weekly", label: "周报" },
  { value: "monthly", label: "月报" },
];
</script>

<template>
  <XhTabsRoot
    :collection="tabs"
    default-value="daily"
    activation-mode="manual"
    style="inline-size: 100%"
  >
    <template #panel="node">{{ node.label }}面板</template>
  </XhTabsRoot>
</template>
```

```html
<xh-tabs default-value="daily" activation-mode="manual">
  <div data-xh-part="root" style="inline-size: 100%">
    <div data-xh-part="list">
      <button data-xh-part="trigger" value="daily">日报</button>
      <button data-xh-part="trigger" value="weekly">周报</button>
      <button data-xh-part="trigger" value="monthly">月报</button>
    </div>

    <div data-xh-part="content" value="daily">日报面板</div>
    <div data-xh-part="content" value="weekly">周报面板</div>
    <div data-xh-part="content" value="monthly">月报面板</div>
  </div>
</xh-tabs>
```

### 竖排

orientation 换掉方向键收哪一对键：竖排认上下键，左右键原样放行给页面

```vue
<script setup lang="ts">
import { XhTabsRoot } from "@xihan-ui/vue";

const tabs = [
  { value: "general", label: "通用" },
  { value: "appearance", label: "外观" },
  { value: "advanced", label: "高级" },
];
</script>

<template>
  <XhTabsRoot
    :collection="tabs"
    default-value="general"
    orientation="vertical"
    style="inline-size: 100%"
  >
    <template #panel="node">{{ node.label }}设置面板</template>
  </XhTabsRoot>
</template>
```

```html
<xh-tabs default-value="general" orientation="vertical">
  <div data-xh-part="root" style="inline-size: 100%">
    <div data-xh-part="list">
      <button data-xh-part="trigger" value="general">通用</button>
      <button data-xh-part="trigger" value="appearance">外观</button>
      <button data-xh-part="trigger" value="advanced">高级</button>
    </div>

    <div data-xh-part="content" value="general">通用设置面板</div>
    <div data-xh-part="content" value="appearance">外观设置面板</div>
    <div data-xh-part="content" value="advanced">高级设置面板</div>
  </div>
</xh-tabs>
```

### 形态

variant 只改选中态怎么画，切换行为与键盘操作三档一致；不写 variant 即 line 档

```vue
<script setup lang="ts">
import { XhTabsRoot } from "@xihan-ui/vue";

// 第一档不写 variant，用 undefined 表达 line 缺省
const variants = [
  { variant: undefined, label: "line（缺省）" },
  { variant: "card", label: "card" },
  { variant: "segment", label: "segment" },
] as const;

const tabs = [
  { value: "overview", label: "概览" },
  { value: "usage", label: "用法" },
  { value: "api", label: "API" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px; inline-size: 100%">
    <div v-for="v in variants" :key="v.label">
      <div style="margin-block-end: 8px; font-size: 12px">{{ v.label }}</div>
      <XhTabsRoot
        :variant="v.variant"
        :collection="tabs"
        default-value="overview"
        style="inline-size: 100%"
      >
        <template #panel="node">{{ node.label }}面板</template>
      </XhTabsRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 24px; inline-size: 100%">
  <!-- 第一档不写 variant，落在 line 缺省 -->
  <div>
    <div style="margin-block-end: 8px; font-size: 12px">line（缺省）</div>
    <xh-tabs default-value="overview">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="list">
          <button data-xh-part="trigger" value="overview">概览</button>
          <button data-xh-part="trigger" value="usage">用法</button>
          <button data-xh-part="trigger" value="api">API</button>
        </div>

        <div data-xh-part="content" value="overview">概览面板</div>
        <div data-xh-part="content" value="usage">用法面板</div>
        <div data-xh-part="content" value="api">API面板</div>
      </div>
    </xh-tabs>
  </div>

  <div>
    <div style="margin-block-end: 8px; font-size: 12px">card</div>
    <xh-tabs variant="card" default-value="overview">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="list">
          <button data-xh-part="trigger" value="overview">概览</button>
          <button data-xh-part="trigger" value="usage">用法</button>
          <button data-xh-part="trigger" value="api">API</button>
        </div>

        <div data-xh-part="content" value="overview">概览面板</div>
        <div data-xh-part="content" value="usage">用法面板</div>
        <div data-xh-part="content" value="api">API面板</div>
      </div>
    </xh-tabs>
  </div>

  <div>
    <div style="margin-block-end: 8px; font-size: 12px">segment</div>
    <xh-tabs variant="segment" default-value="overview">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="list">
          <button data-xh-part="trigger" value="overview">概览</button>
          <button data-xh-part="trigger" value="usage">用法</button>
          <button data-xh-part="trigger" value="api">API</button>
        </div>

        <div data-xh-part="content" value="overview">概览面板</div>
        <div data-xh-part="content" value="usage">用法面板</div>
        <div data-xh-part="content" value="api">API面板</div>
      </div>
    </xh-tabs>
  </div>
</div>
```

### 语气

tone 决定选中态用哪族颜色，与 variant 正交；这里固定 card 形态只看语气的差别

```vue
<script setup lang="ts">
import { XhTabsRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

// 每族一套标签，选中那张的文本带上语气名
const groups = tones.map(tone => ({
  tone,
  tabs: [
    { value: "selected", label: `${tone}（选中）` },
    { value: "other", label: "未选" },
  ],
}));

const panels: Record<string, string> = {
  selected: "选中面板",
  other: "另一个面板",
};
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; inline-size: 100%">
    <XhTabsRoot
      v-for="g in groups"
      :key="g.tone"
      variant="card"
      :tone="g.tone"
      :collection="g.tabs"
      default-value="selected"
      style="inline-size: 100%"
    >
      <template #panel="node">{{ panels[node.value] }}</template>
    </XhTabsRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 16px; inline-size: 100%">
  <xh-tabs variant="card" tone="brand" default-value="selected">
    <div data-xh-part="root" style="inline-size: 100%">
      <div data-xh-part="list">
        <button data-xh-part="trigger" value="selected">brand（选中）</button>
        <button data-xh-part="trigger" value="other">未选</button>
      </div>

      <div data-xh-part="content" value="selected">选中面板</div>
      <div data-xh-part="content" value="other">另一个面板</div>
    </div>
  </xh-tabs>

  <xh-tabs variant="card" tone="neutral" default-value="selected">
    <div data-xh-part="root" style="inline-size: 100%">
      <div data-xh-part="list">
        <button data-xh-part="trigger" value="selected">neutral（选中）</button>
        <button data-xh-part="trigger" value="other">未选</button>
      </div>

      <div data-xh-part="content" value="selected">选中面板</div>
      <div data-xh-part="content" value="other">另一个面板</div>
    </div>
  </xh-tabs>

  <xh-tabs variant="card" tone="success" default-value="selected">
    <div data-xh-part="root" style="inline-size: 100%">
      <div data-xh-part="list">
        <button data-xh-part="trigger" value="selected">success（选中）</button>
        <button data-xh-part="trigger" value="other">未选</button>
      </div>

      <div data-xh-part="content" value="selected">选中面板</div>
      <div data-xh-part="content" value="other">另一个面板</div>
    </div>
  </xh-tabs>

  <xh-tabs variant="card" tone="warning" default-value="selected">
    <div data-xh-part="root" style="inline-size: 100%">
      <div data-xh-part="list">
        <button data-xh-part="trigger" value="selected">warning（选中）</button>
        <button data-xh-part="trigger" value="other">未选</button>
      </div>

      <div data-xh-part="content" value="selected">选中面板</div>
      <div data-xh-part="content" value="other">另一个面板</div>
    </div>
  </xh-tabs>

  <xh-tabs variant="card" tone="danger" default-value="selected">
    <div data-xh-part="root" style="inline-size: 100%">
      <div data-xh-part="list">
        <button data-xh-part="trigger" value="selected">danger（选中）</button>
        <button data-xh-part="trigger" value="other">未选</button>
      </div>

      <div data-xh-part="content" value="selected">选中面板</div>
      <div data-xh-part="content" value="other">另一个面板</div>
    </div>
  </xh-tabs>

  <xh-tabs variant="card" tone="info" default-value="selected">
    <div data-xh-part="root" style="inline-size: 100%">
      <div data-xh-part="list">
        <button data-xh-part="trigger" value="selected">info（选中）</button>
        <button data-xh-part="trigger" value="other">未选</button>
      </div>

      <div data-xh-part="content" value="selected">选中面板</div>
      <div data-xh-part="content" value="other">另一个面板</div>
    </div>
  </xh-tabs>
</div>
```

### 尺寸

size 换标签的高度、内边距与字号，不传 size 即默认档

```vue
<script setup lang="ts">
import { XhTabsRoot } from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

const tabs = [
  { value: "overview", label: "概览" },
  { value: "usage", label: "用法" },
  { value: "api", label: "API" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px; inline-size: 100%">
    <div v-for="s in sizes" :key="s.label">
      <div style="margin-block-end: 8px; font-size: 12px">{{ s.label }}</div>
      <XhTabsRoot
        :size="s.size"
        :collection="tabs"
        default-value="overview"
        style="inline-size: 100%"
      >
        <template #panel="node">{{ node.label }}面板</template>
      </XhTabsRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 24px; inline-size: 100%">
  <div>
    <div style="margin-block-end: 8px; font-size: 12px">小</div>
    <xh-tabs size="sm" default-value="overview">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="list">
          <button data-xh-part="trigger" value="overview">概览</button>
          <button data-xh-part="trigger" value="usage">用法</button>
          <button data-xh-part="trigger" value="api">API</button>
        </div>

        <div data-xh-part="content" value="overview">概览面板</div>
        <div data-xh-part="content" value="usage">用法面板</div>
        <div data-xh-part="content" value="api">API面板</div>
      </div>
    </xh-tabs>
  </div>

  <!-- 这一档不写 size，落在默认 -->
  <div>
    <div style="margin-block-end: 8px; font-size: 12px">默认</div>
    <xh-tabs default-value="overview">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="list">
          <button data-xh-part="trigger" value="overview">概览</button>
          <button data-xh-part="trigger" value="usage">用法</button>
          <button data-xh-part="trigger" value="api">API</button>
        </div>

        <div data-xh-part="content" value="overview">概览面板</div>
        <div data-xh-part="content" value="usage">用法面板</div>
        <div data-xh-part="content" value="api">API面板</div>
      </div>
    </xh-tabs>
  </div>

  <div>
    <div style="margin-block-end: 8px; font-size: 12px">大</div>
    <xh-tabs size="lg" default-value="overview">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="list">
          <button data-xh-part="trigger" value="overview">概览</button>
          <button data-xh-part="trigger" value="usage">用法</button>
          <button data-xh-part="trigger" value="api">API</button>
        </div>

        <div data-xh-part="content" value="overview">概览面板</div>
        <div data-xh-part="content" value="usage">用法面板</div>
        <div data-xh-part="content" value="api">API面板</div>
      </div>
    </xh-tabs>
  </div>
</div>
```

### 标签栏前后缀

list 里只收 trigger；要在标签栏两侧摆东西，把它们与 list 排进同一行

```vue
<script setup lang="ts">
import {
  XhButton,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTabsRoot default-value="all" variant="segment" style="inline-size: 100%">
    <!-- 前后缀是这一行的兄弟节点，不进 list：list 里只放标签 -->
    <div style="display: flex; align-items: center; gap: 12px">
      <span style="font-size: 12px">收件箱</span>
      <XhTabsList>
        <XhTabsTrigger value="all">全部</XhTabsTrigger>
        <XhTabsTrigger value="unread">未读</XhTabsTrigger>
        <XhTabsTrigger value="flagged">已标记</XhTabsTrigger>
      </XhTabsList>
      <XhButton size="sm" variant="outline" style="margin-inline-start: auto">
        写邮件
      </XhButton>
    </div>

    <XhTabsContent value="all">全部邮件。</XhTabsContent>
    <XhTabsContent value="unread">未读邮件。</XhTabsContent>
    <XhTabsContent value="flagged">已标记邮件。</XhTabsContent>
  </XhTabsRoot>
</template>
```

```html
<xh-tabs default-value="all" variant="segment">
  <div data-xh-part="root" style="inline-size: 100%">
    <!-- 前后缀是这一行的兄弟节点，不进 list：list 里只放标签 -->
    <div style="display: flex; align-items: center; gap: 12px">
      <span style="font-size: 12px">收件箱</span>
      <div data-xh-part="list">
        <button data-xh-part="trigger" value="all">全部</button>
        <button data-xh-part="trigger" value="unread">未读</button>
        <button data-xh-part="trigger" value="flagged">已标记</button>
      </div>
      <xh-button size="sm" variant="outline" style="margin-inline-start: auto">
        <button data-xh-part="root">写邮件</button>
      </xh-button>
    </div>

    <div data-xh-part="content" value="all">全部邮件。</div>
    <div data-xh-part="content" value="unread">未读邮件。</div>
    <div data-xh-part="content" value="flagged">已标记邮件。</div>
  </div>
</xh-tabs>
```

### 拦截切换

受控下 value-change 只是意图，宿主校验不过就不写回 value，标签页原地不动

```vue
<script setup lang="ts">
import {
  XhButton,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("draft");
const dirty = ref(true);
const notice = ref("");

// 只单向绑 value，写不写回由这里说了算
function onValueChange(details: { value: string | null }): void {
  if (dirty.value) {
    notice.value = "草稿还没保存，切不过去";
    return;
  }
  notice.value = "";
  value.value = details.value ?? value.value;
}

function save(): void {
  dirty.value = false;
  notice.value = "已保存，现在可以切走了";
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhTabsRoot :value="value" @value-change="onValueChange">
      <XhTabsList>
        <XhTabsTrigger value="draft">草稿</XhTabsTrigger>
        <XhTabsTrigger value="preview">预览</XhTabsTrigger>
        <XhTabsTrigger value="publish">发布</XhTabsTrigger>
      </XhTabsList>

      <XhTabsContent value="draft">草稿面板：内容改过还没保存。</XhTabsContent>
      <XhTabsContent value="preview">预览面板。</XhTabsContent>
      <XhTabsContent value="publish">发布面板。</XhTabsContent>
    </XhTabsRoot>

    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton variant="outline" :disabled="!dirty" @click="save">
        保存草稿
      </XhButton>
      <span>{{ notice || `当前：${value}` }}</span>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <xh-tabs id="tabs-guard" value="draft">
    <div data-xh-part="root">
      <div data-xh-part="list">
        <button data-xh-part="trigger" value="draft">草稿</button>
        <button data-xh-part="trigger" value="preview">预览</button>
        <button data-xh-part="trigger" value="publish">发布</button>
      </div>

      <div data-xh-part="content" value="draft">草稿面板：内容改过还没保存。</div>
      <div data-xh-part="content" value="preview">预览面板。</div>
      <div data-xh-part="content" value="publish">发布面板。</div>
    </div>
  </xh-tabs>

  <div style="display: flex; align-items: center; gap: 8px">
    <xh-button id="tabs-guard-save" variant="outline">
      <button data-xh-part="root">保存草稿</button>
    </xh-button>
    <span id="tabs-guard-notice">当前：draft</span>
  </div>
</div>

<script type="module">
  // 切换意图先过这一关，草稿没保存就不写回 value
  const tabs = document.getElementById("tabs-guard");
  const notice = document.getElementById("tabs-guard-notice");
  const save = document.getElementById("tabs-guard-save");
  let dirty = true;

  tabs.addEventListener("value-change", (event) => {
    if (dirty) {
      notice.textContent = "草稿还没保存，切不过去";
      return;
    }
    tabs.value = event.detail.value ?? tabs.value;
    notice.textContent = `当前：${tabs.value}`;
  });

  save.addEventListener("click", () => {
    dirty = false;
    save.disabled = true;
    notice.textContent = "已保存，现在可以切走了";
  });
</script>
```

### 动态增删

标签清单归宿主维护；关掉当前这页时把选中值挪到相邻一项，全关完选中值是 null

```vue
<script setup lang="ts">
import {
  XhButton,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const tabs = ref([
  { value: "doc-1", label: "文档 1" },
  { value: "doc-2", label: "文档 2" },
]);
const active = ref<string | null>("doc-1");
let seed = 2;

function addTab(): void {
  seed += 1;
  const value = `doc-${seed}`;
  tabs.value.push({ value, label: `文档 ${seed}` });
  active.value = value;
}

function closeTab(value: string): void {
  const index = tabs.value.findIndex(tab => tab.value === value);
  if (index < 0) {
    return;
  }
  tabs.value.splice(index, 1);
  if (active.value !== value) {
    return;
  }
  // 关掉的正是当前页：往后顺延，没有后一项就退回最后一项
  const next = tabs.value[Math.min(index, tabs.value.length - 1)];
  active.value = next ? next.value : null;
}
</script>

<template>
  <XhTabsRoot v-model:value="active" variant="card" style="inline-size: 100%">
    <div style="display: flex; align-items: center; gap: 8px">
      <XhTabsList>
        <XhTabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
          {{ tab.label }}
        </XhTabsTrigger>
      </XhTabsList>
      <XhButton size="sm" variant="outline" @click="addTab">新增一页</XhButton>
    </div>

    <XhTabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value">
      <div style="display: flex; align-items: center; gap: 8px">
        <span>{{ tab.label }} 的内容</span>
        <XhButton size="sm" variant="outline" @click="closeTab(tab.value)">
          关闭本页
        </XhButton>
      </div>
    </XhTabsContent>

    <p v-if="tabs.length === 0">已经全部关掉，当前选中值是 null。</p>
  </XhTabsRoot>
</template>
```

```html
<xh-tabs id="tabs-dynamic" variant="card" value="doc-1">
  <div data-xh-part="root" id="tabs-dynamic-root" style="inline-size: 100%">
    <div style="display: flex; align-items: center; gap: 8px">
      <div data-xh-part="list" id="tabs-dynamic-list">
        <button data-xh-part="trigger" value="doc-1">文档 1</button>
        <button data-xh-part="trigger" value="doc-2">文档 2</button>
      </div>
      <xh-button id="tabs-dynamic-add" size="sm" variant="outline">
        <button data-xh-part="root">新增一页</button>
      </xh-button>
    </div>

    <div data-xh-part="content" value="doc-1">
      <div style="display: flex; align-items: center; gap: 8px">
        <span>文档 1 的内容</span>
        <xh-button size="sm" variant="outline" data-close>
          <button data-xh-part="root">关闭本页</button>
        </xh-button>
      </div>
    </div>
    <div data-xh-part="content" value="doc-2">
      <div style="display: flex; align-items: center; gap: 8px">
        <span>文档 2 的内容</span>
        <xh-button size="sm" variant="outline" data-close>
          <button data-xh-part="root">关闭本页</button>
        </xh-button>
      </div>
    </div>

    <p id="tabs-dynamic-empty" hidden>已经全部关掉，当前选中值是 null。</p>
  </div>
</xh-tabs>

<script type="module">
  // 标签与面板由这段脚本增删，选中值也由它写
  const tabs = document.getElementById("tabs-dynamic");
  const root = document.getElementById("tabs-dynamic-root");
  const list = document.getElementById("tabs-dynamic-list");
  const add = document.getElementById("tabs-dynamic-add");
  const empty = document.getElementById("tabs-dynamic-empty");
  let seed = 2;

  function panels() {
    return [...root.querySelectorAll(':scope > [data-xh-part="content"]')];
  }

  function setValue(next) {
    tabs.value = next;
    empty.hidden = panels().length > 0;
  }

  add.addEventListener("click", () => {
    seed += 1;
    const value = `doc-${seed}`;

    const trigger = document.createElement("button");
    trigger.dataset.xhPart = "trigger";
    trigger.setAttribute("value", value);
    trigger.textContent = `文档 ${seed}`;
    list.append(trigger);

    const content = document.createElement("div");
    content.dataset.xhPart = "content";
    content.setAttribute("value", value);
    content.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px">
        <span>文档 ${seed} 的内容</span>
        <xh-button size="sm" variant="outline" data-close>
          <button data-xh-part="root">关闭本页</button>
        </xh-button>
      </div>`;
    empty.before(content);

    setValue(value);
  });

  root.addEventListener("click", (event) => {
    const closer = event.target.closest("[data-close]");
    if (!closer) {
      return;
    }
    const panel = closer.closest('[data-xh-part="content"]');
    const value = panel.getAttribute("value");
    const index = panels().indexOf(panel);

    list.querySelector(`[data-xh-part="trigger"][value="${value}"]`).remove();
    panel.remove();

    if (tabs.value !== value) {
      setValue(tabs.value);
      return;
    }
    // 关掉的正是当前页：往后顺延，没有后一项就退回最后一项
    const rest = panels().map((el) => el.getAttribute("value"));
    setValue(rest[Math.min(index, rest.length - 1)] ?? null);
  });

  tabs.addEventListener("value-change", (event) => setValue(event.detail.value));
</script>
```

### 可滚动的标签栏

标签多到一行放不下时，把 list 装进作者自建的横滚容器，两端各摆一个滚动按钮

```vue
<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from "@xihan-ui/icons";
import {
  XhButton,
  XhIcon,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const tabs = Array.from({ length: 12 }, (_, i) => ({
  value: `module-${i + 1}`,
  label: `模块 ${i + 1}`,
}));

const viewport = ref<HTMLElement | null>(null);

function scrollStrip(delta: number): void {
  viewport.value?.scrollBy({ left: delta, behavior: "smooth" });
}
</script>

<template>
  <XhTabsRoot default-value="module-1" style="inline-size: 100%">
    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton
        size="sm"
        variant="outline"
        aria-label="向前滚动"
        @click="scrollStrip(-200)"
      >
        <XhIcon :icon="ChevronLeftIcon" />
      </XhButton>

      <!-- 滚动视口是 list 外面的一层普通容器：条目查询只以 list 为界，键盘与切换都不受它影响 -->
      <div ref="viewport" style="flex: 1; min-inline-size: 0; overflow-x: auto">
        <!-- 让 list 撑到内容宽度，基线才跟着标签一起滚 -->
        <XhTabsList style="inline-size: max-content">
          <XhTabsTrigger v-for="t in tabs" :key="t.value" :value="t.value">
            {{ t.label }}
          </XhTabsTrigger>
        </XhTabsList>
      </div>

      <XhButton
        size="sm"
        variant="outline"
        aria-label="向后滚动"
        @click="scrollStrip(200)"
      >
        <XhIcon :icon="ChevronRightIcon" />
      </XhButton>
    </div>

    <XhTabsContent v-for="t in tabs" :key="t.value" :value="t.value">
      {{ t.label }} 的面板
    </XhTabsContent>
  </XhTabsRoot>
</template>
```

```html
<xh-tabs default-value="module-1">
  <div data-xh-part="root" style="inline-size: 100%">
    <div style="display: flex; align-items: center; gap: 8px">
      <xh-button id="tabs-scroll-prev" size="sm" variant="outline">
        <button data-xh-part="root" aria-label="向前滚动"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6L9 12L15 18"/></svg></button>
      </xh-button>

      <!-- 滚动视口是 list 外面的一层普通容器：条目查询只以 list 为界，键盘与切换都不受它影响 -->
      <div
        id="tabs-scroll-viewport"
        style="flex: 1; min-inline-size: 0; overflow-x: auto"
      >
        <!-- 让 list 撑到内容宽度，基线才跟着标签一起滚 -->
        <div data-xh-part="list" style="inline-size: max-content">
          <button data-xh-part="trigger" value="module-1">模块 1</button>
          <button data-xh-part="trigger" value="module-2">模块 2</button>
          <button data-xh-part="trigger" value="module-3">模块 3</button>
          <button data-xh-part="trigger" value="module-4">模块 4</button>
          <button data-xh-part="trigger" value="module-5">模块 5</button>
          <button data-xh-part="trigger" value="module-6">模块 6</button>
          <button data-xh-part="trigger" value="module-7">模块 7</button>
          <button data-xh-part="trigger" value="module-8">模块 8</button>
          <button data-xh-part="trigger" value="module-9">模块 9</button>
          <button data-xh-part="trigger" value="module-10">模块 10</button>
          <button data-xh-part="trigger" value="module-11">模块 11</button>
          <button data-xh-part="trigger" value="module-12">模块 12</button>
        </div>
      </div>

      <xh-button id="tabs-scroll-next" size="sm" variant="outline">
        <button data-xh-part="root" aria-label="向后滚动"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6L15 12L9 18"/></svg></button>
      </xh-button>
    </div>

    <div data-xh-part="content" value="module-1">模块 1 的面板</div>
    <div data-xh-part="content" value="module-2">模块 2 的面板</div>
    <div data-xh-part="content" value="module-3">模块 3 的面板</div>
    <div data-xh-part="content" value="module-4">模块 4 的面板</div>
    <div data-xh-part="content" value="module-5">模块 5 的面板</div>
    <div data-xh-part="content" value="module-6">模块 6 的面板</div>
    <div data-xh-part="content" value="module-7">模块 7 的面板</div>
    <div data-xh-part="content" value="module-8">模块 8 的面板</div>
    <div data-xh-part="content" value="module-9">模块 9 的面板</div>
    <div data-xh-part="content" value="module-10">模块 10 的面板</div>
    <div data-xh-part="content" value="module-11">模块 11 的面板</div>
    <div data-xh-part="content" value="module-12">模块 12 的面板</div>
  </div>
</xh-tabs>

<script type="module">
  // 两端的按钮横向推动视口
  const viewport = document.getElementById("tabs-scroll-viewport");
  const prev = document.getElementById("tabs-scroll-prev");
  const next = document.getElementById("tabs-scroll-next");

  prev.addEventListener("click", () => {
    viewport.scrollBy({ left: -200, behavior: "smooth" });
  });
  next.addEventListener("click", () => {
    viewport.scrollBy({ left: 200, behavior: "smooth" });
  });
</script>
```

### 切换后滚进视野

每个标签都带 data-value 身份标记，选中值一变就按它取到那个标签，滚到视口正中

```vue
<script setup lang="ts">
import {
  XhButton,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
import { ref, watch } from "vue";

const tabs = Array.from({ length: 12 }, (_, i) => ({
  value: `chapter-${i + 1}`,
  label: `第 ${i + 1} 章`,
}));

const value = ref("chapter-1");
const viewport = ref<HTMLElement | null>(null);

// 监听选中值而不是切换事件：外部改值、键盘走位、点击三条路都在这里收口
watch(value, (next) => {
  viewport.value
    ?.querySelector<HTMLElement>(`[data-part="trigger"][data-value="${next}"]`)
    ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhTabsRoot v-model:value="value" variant="segment">
      <div ref="viewport" style="overflow-x: auto">
        <XhTabsList style="inline-size: max-content">
          <XhTabsTrigger v-for="t in tabs" :key="t.value" :value="t.value">
            {{ t.label }}
          </XhTabsTrigger>
        </XhTabsList>
      </div>

      <XhTabsContent v-for="t in tabs" :key="t.value" :value="t.value">
        {{ t.label }} 的面板
      </XhTabsContent>
    </XhTabsRoot>

    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton size="sm" variant="outline" @click="value = 'chapter-12'">
        跳到第 12 章
      </XhButton>
      <XhButton size="sm" variant="outline" @click="value = 'chapter-1'">
        回到第 1 章
      </XhButton>
      <span>用方向键走位时，标签栏也会跟着滚</span>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <xh-tabs id="tabs-into-view" variant="segment" value="chapter-1">
    <div data-xh-part="root">
      <div id="tabs-into-view-viewport" style="overflow-x: auto">
        <div data-xh-part="list" style="inline-size: max-content">
          <button data-xh-part="trigger" value="chapter-1">第 1 章</button>
          <button data-xh-part="trigger" value="chapter-2">第 2 章</button>
          <button data-xh-part="trigger" value="chapter-3">第 3 章</button>
          <button data-xh-part="trigger" value="chapter-4">第 4 章</button>
          <button data-xh-part="trigger" value="chapter-5">第 5 章</button>
          <button data-xh-part="trigger" value="chapter-6">第 6 章</button>
          <button data-xh-part="trigger" value="chapter-7">第 7 章</button>
          <button data-xh-part="trigger" value="chapter-8">第 8 章</button>
          <button data-xh-part="trigger" value="chapter-9">第 9 章</button>
          <button data-xh-part="trigger" value="chapter-10">第 10 章</button>
          <button data-xh-part="trigger" value="chapter-11">第 11 章</button>
          <button data-xh-part="trigger" value="chapter-12">第 12 章</button>
        </div>
      </div>

      <div data-xh-part="content" value="chapter-1">第 1 章 的面板</div>
      <div data-xh-part="content" value="chapter-2">第 2 章 的面板</div>
      <div data-xh-part="content" value="chapter-3">第 3 章 的面板</div>
      <div data-xh-part="content" value="chapter-4">第 4 章 的面板</div>
      <div data-xh-part="content" value="chapter-5">第 5 章 的面板</div>
      <div data-xh-part="content" value="chapter-6">第 6 章 的面板</div>
      <div data-xh-part="content" value="chapter-7">第 7 章 的面板</div>
      <div data-xh-part="content" value="chapter-8">第 8 章 的面板</div>
      <div data-xh-part="content" value="chapter-9">第 9 章 的面板</div>
      <div data-xh-part="content" value="chapter-10">第 10 章 的面板</div>
      <div data-xh-part="content" value="chapter-11">第 11 章 的面板</div>
      <div data-xh-part="content" value="chapter-12">第 12 章 的面板</div>
    </div>
  </xh-tabs>

  <div style="display: flex; align-items: center; gap: 8px">
    <xh-button id="tabs-into-view-last" size="sm" variant="outline">
      <button data-xh-part="root">跳到第 12 章</button>
    </xh-button>
    <xh-button id="tabs-into-view-first" size="sm" variant="outline">
      <button data-xh-part="root">回到第 1 章</button>
    </xh-button>
    <span>用方向键走位时，标签栏也会跟着滚</span>
  </div>
</div>

<script type="module">
  // 选中值只从这一个口子写：外部改值、键盘走位、点击三条路都经过它
  const tabs = document.getElementById("tabs-into-view");
  const viewport = document.getElementById("tabs-into-view-viewport");
  const last = document.getElementById("tabs-into-view-last");
  const first = document.getElementById("tabs-into-view-first");

  function setValue(next) {
    tabs.value = next;
    viewport
      .querySelector(`[data-part="trigger"][data-value="${next}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }

  tabs.addEventListener("value-change", (event) => setValue(event.detail.value));
  last.addEventListener("click", () => setValue("chapter-12"));
  first.addEventListener("click", () => setValue("chapter-1"));
</script>
```

### 标签栏摆在哪一边

root 按书写顺序渲染子节点：把面板写在 list 前面，标签栏就落到内容之后，基线换到另一边

```vue
<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";

const tabs = [
  { value: "overview", label: "概览" },
  { value: "usage", label: "用法" },
  { value: "api", label: "API" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px; inline-size: 100%">
    <div>
      <div style="margin-block-end: 8px; font-size: 12px">标签在下</div>
      <XhTabsRoot default-value="overview" style="inline-size: 100%">
        <XhTabsContent v-for="t in tabs" :key="t.value" :value="t.value">
          {{ t.label }} 的面板
        </XhTabsContent>
        <!-- 基线跟着换边：横排的基线在 list 底边，标签在下就把它挪到顶边 -->
        <XhTabsList
          style="
            border-block-end: 0;
            border-block-start: var(--xh-stroke-thin) solid var(--xh-border-default);
          "
        >
          <XhTabsTrigger v-for="t in tabs" :key="t.value" :value="t.value">
            {{ t.label }}
          </XhTabsTrigger>
        </XhTabsList>
      </XhTabsRoot>
    </div>

    <div>
      <div style="margin-block-end: 8px; font-size: 12px">标签在右</div>
      <XhTabsRoot
        default-value="overview"
        orientation="vertical"
        style="inline-size: 100%"
      >
        <XhTabsContent
          v-for="t in tabs"
          :key="t.value"
          :value="t.value"
          style="flex: 1"
        >
          {{ t.label }} 的面板
        </XhTabsContent>
        <XhTabsList
          style="
            border-inline-end: 0;
            border-inline-start: var(--xh-stroke-thin) solid var(--xh-border-default);
          "
        >
          <XhTabsTrigger v-for="t in tabs" :key="t.value" :value="t.value">
            {{ t.label }}
          </XhTabsTrigger>
        </XhTabsList>
      </XhTabsRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 24px; inline-size: 100%">
  <div>
    <div style="margin-block-end: 8px; font-size: 12px">标签在下</div>
    <xh-tabs default-value="overview">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="content" value="overview">概览 的面板</div>
        <div data-xh-part="content" value="usage">用法 的面板</div>
        <div data-xh-part="content" value="api">API 的面板</div>

        <!-- 基线跟着换边：横排的基线在 list 底边，标签在下就把它挪到顶边 -->
        <div
          data-xh-part="list"
          style="
            border-block-end: 0;
            border-block-start: var(--xh-stroke-thin) solid var(--xh-border-default);
          "
        >
          <button data-xh-part="trigger" value="overview">概览</button>
          <button data-xh-part="trigger" value="usage">用法</button>
          <button data-xh-part="trigger" value="api">API</button>
        </div>
      </div>
    </xh-tabs>
  </div>

  <div>
    <div style="margin-block-end: 8px; font-size: 12px">标签在右</div>
    <xh-tabs default-value="overview" orientation="vertical">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="content" value="overview" style="flex: 1">
          概览 的面板
        </div>
        <div data-xh-part="content" value="usage" style="flex: 1">用法 的面板</div>
        <div data-xh-part="content" value="api" style="flex: 1">API 的面板</div>

        <div
          data-xh-part="list"
          style="
            border-inline-end: 0;
            border-inline-start: var(--xh-stroke-thin) solid var(--xh-border-default);
          "
        >
          <button data-xh-part="trigger" value="overview">概览</button>
          <button data-xh-part="trigger" value="usage">用法</button>
          <button data-xh-part="trigger" value="api">API</button>
        </div>
      </div>
    </xh-tabs>
  </div>
</div>
```

### 拖拽换位

整个标签都是拖动源：按住往旁边拖，落点画成一条线、被拖的标签原地不动；也可以聚焦标签带后按 Alt + 左右键挪一位（竖排是 Alt + 上下键），到首末就不动。库不拥有标签序，只报一次重排好的新顺序连同读屏播报，照它写回数组归使用者

```vue
<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsList,
  XhTabsLiveRegion,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

/** 库报的换位：把 value 从第 from 位挪到第 to 位，values 是重排好的整份标签序。 */
interface TabMove {
  value: string;
  from: number;
  to: number;
  values: string[];
}

// 标签序的主人是这份数组，库按它算位置，也按它取标签文字
const tabs = ref([
  { value: "outline", label: "大纲" },
  { value: "draft", label: "草稿" },
  { value: "review", label: "评审" },
  { value: "publish", label: "发布" },
]);

const active = ref<string | null>("outline");
const log = ref("按住标签拖到别处，或聚焦标签带后按 Alt + 左右键");

// values 已经重排好，照它取一遍就是新数组；选中的是哪一页不受换位影响
function onTabMove(move: TabMove): void {
  const byValue = new Map(tabs.value.map(tab => [tab.value, tab]));
  tabs.value = move.values.flatMap(value => byValue.get(value) ?? []);
  log.value = `${byValue.get(move.value)?.label ?? move.value} 挪到了第 ${move.to + 1} 位`;
}
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhTabsRoot
      v-model:value="active"
      :collection="tabs"
      variant="card"
      reorderable
      @tab-move="onTabMove"
    >
      <XhTabsList>
        <XhTabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
          {{ tab.label }}
        </XhTabsTrigger>
      </XhTabsList>

      <XhTabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value">
        {{ tab.label }} 的内容
      </XhTabsContent>

      <!-- 播报区视觉隐藏，必须在拖动开始之前就在 DOM 上 -->
      <XhTabsLiveRegion />
    </XhTabsRoot>
    <span>{{ log }}</span>
  </div>
</template>
```

```html
<div id="tabs-reorder" style="width: 100%; display: grid; gap: 12px">
  <xh-tabs data-host variant="card" default-value="outline" reorderable>
    <div data-xh-part="root" style="inline-size: 100%">
      <div data-xh-part="list" data-list>
        <button data-xh-part="trigger" value="outline">大纲</button>
        <button data-xh-part="trigger" value="draft">草稿</button>
        <button data-xh-part="trigger" value="review">评审</button>
        <button data-xh-part="trigger" value="publish">发布</button>
      </div>

      <div data-xh-part="content" value="outline">大纲 的内容</div>
      <div data-xh-part="content" value="draft">草稿 的内容</div>
      <div data-xh-part="content" value="review">评审 的内容</div>
      <div data-xh-part="content" value="publish">发布 的内容</div>

      <!-- 播报区视觉隐藏，必须在拖动开始之前就在 DOM 上 -->
      <div data-xh-part="live-region"></div>
    </div>
  </xh-tabs>
  <span data-log>按住标签拖到别处，或聚焦标签带后按 Alt + 左右键</span>
</div>

<script type="module">
  const scope = document.getElementById("tabs-reorder");
  const host = scope.querySelector("[data-host]");
  const list = scope.querySelector("[data-list]");
  const log = scope.querySelector("[data-log]");

  // 标签序的主人是这份数组，库按它算位置，也按它取标签文字。数组只走属性
  let tabs = [
    { value: "outline", label: "大纲" },
    { value: "draft", label: "草稿" },
    { value: "review", label: "评审" },
    { value: "publish", label: "发布" },
  ];
  host.collection = tabs;

  // values 已经重排好，照它取一遍就是新数组，标签节点也照它重排一遍；
  // 选中的是哪一页不受换位影响
  host.addEventListener("tab-move", (event) => {
    const move = event.detail;
    const byValue = new Map(tabs.map((tab) => [tab.value, tab]));
    tabs = move.values.flatMap((value) => byValue.get(value) ?? []);
    host.collection = tabs;
    list.append(
      ...move.values.map((value) =>
        list.querySelector(`[data-xh-part="trigger"][value="${value}"]`),
      ),
    );
    log.textContent = `${byValue.get(move.value)?.label ?? move.value} 挪到了第 ${
      move.to + 1
    } 位`;
  });
</script>
```

## 设计指引

### 何时使用

- 内容属于同一个对象的不同侧面（详情 / 权限 / 日志），用户会来回看。
- 各组内容量相当，且不需要同时对照。

### 何时不用

- 各组需要同时看见或互相对照：并排摆，别切换。
- 有先后顺序、必须走完：用[步骤条](./steps)。
- 只是切换一个显示开关：用[切换按钮组](./toggle-group)。

### 特性

- `activationMode` 决定方向键移动焦点时是否顺带切换：内容加载昂贵时改 `manual`，方向键只搬焦点、按 Enter 才切。
- `variant` 三档（`line` / `card` / `segment`）只改选中态怎么画，切换行为与键盘操作三档一致。
- 面板常挂，靠 `hidden` 显隐。
- `root` 按书写顺序渲染子节点：把面板写在标签栏前面，标签栏就落到内容之后。
- `reorderable` 打开后标签可以拖着换位，键盘走 Alt + 主轴方向键。**只给 `collection` 时代铺的那套标记里没有播报区与拖动把手**：要读屏播报与触屏拖动，得写默认插槽并自己渲 `live-region` 与 `tab-drag-trigger`。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tabs>` |
| Vue 组件 | `XhTabsContent` `XhTabsIndicator` `XhTabsList` `XhTabsLiveRegion` `XhTabsRoot` `XhTabsSeparator` `XhTabsTabDragTrigger` `XhTabsTrigger` |
| 组合式函数 | `useTabs` |
| 状态机 | `tabsMachine` |
| 皮肤 | `@xihan-ui/styles/tabs.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="tabs"`：`root` · **`list`** · **`trigger`** · `indicator` · `separator` · **`content`** · `tab-drag-trigger` · `live-region`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `TabsNode[]` |  | 条目数据，标签文本与禁用的事实源。给了它，trigger 部件只需报 value。 缺省即回到「文本与禁用都写在 trigger 上」的老路。 |
| `value` | `string \| null` |  | 选中值。给定即受控：内部不再自改，只发 onValueChange。 |
| `defaultValue` | `string \| null` |  |  |
| `orientation` | `Orientation` |  | 方向键轴向，默认 horizontal；不同轴的方向键放行给页面滚动与读屏。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只影响水平轴上 ArrowLeft/ArrowRight 的前后语义。 |
| `activationMode` | `TabsActivationMode` |  | 方向键移动焦点时是否顺带切换选中，默认 automatic。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `variant` | `TabsVariant` |  | 形态：line / card / segment，决定选中态怎么画。缺省是 line。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `reorderable` | `boolean` |  | 标签可以拖着换位。整个标签都是拖动源，不另出把手。 顺序不进机器：collection 是 prop，库没有一份自己的标签序可写，只发 onTabMove。 |
| `onTabMove` | `(details: TabsMoveDetails) => void` |  |  |
| `closable` | `boolean` |  | 标签可关闭：trigger 上按 Delete / Backspace 即发 onTabClose。 库不持有标签序，只发意图，删不删由数据源那边决定。 |
| `onTabClose` | `(details: TabsCloseDetails) => void` |  | 标签被关闭。 |
| `translations` | `Partial<TabsTranslations>` |  |  |
| `onValueChange` | `(details: TabsValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TabsValueChangeDetails` | 选中值变化；detail 为 `{ value: string \| null }` |
| `tab-move` | `TabsMoveDetails` | 标签换了位；detail 为 `{ value, from, to, values }`，values 是重排好的整份标签序 |
| `tab-close` | `TabsCloseDetails` | 标签被关闭；detail 为 `{ value, values }`，values 是关掉这一条之后余下的标签序 |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'active' \| 'inactive' |
| `content` | 'active' \| 'inactive' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `TRIGGER.SELECT` · `TRIGGER.FOCUS` · `TRIGGER.NAVIGATE` · `LIST.BLUR` · `TAB_DRAG.START` · `TAB_DRAG.MOVE` · `TAB_DRAG.END` · `TAB_DRAG.CANCEL` · `TAB.MOVE_BY` · `TAB.CLOSE`

**判据**：`isAutomatic`

## connect API

`useTabs` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` |  |
| `collection` | `readonly TabsNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `focusedValue` | `string \| null` | 焦点在组外时为 null。 |
| `dropTarget` | `DropTarget \| null` | 此刻的落点；松手就落在这儿。没落在任何标签上时是 null。 |
| `announcement` | `string` | 读屏播报文本。渲进 live-region，不进视觉版面。 |
| `setValue` | `(next: string \| null) => void` | 传 null 清空选中：context.value 与受控 value 都能表达"无选中"，写入侧同样收得下。 |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getTriggerProps` | `(props: TabsTriggerProps) => T['button']` |  |
| `getIndicatorProps` | `() => T['element']` | 选中标签下的滑条；位置由机器量好写成内联样式，没有选中项时 hidden。 |
| `getSeparatorProps` | `() => T['element']` | 标签之间的细分隔线，纯装饰。 |
| `getContentProps` | `(props: TabsContentProps) => T['element']` |  |
| `getTabDragTriggerProps` | `(props: TabsTriggerProps) => T['element']` | 标签拖动把手。触屏那一路唯一的入口，不占 Tab 位。 常挂即可：reorderable 关着或这个标签禁用时它自报 data-disabled、也不再让出滚动， 渲了不会错。按拖不拖得动来决定渲不渲，会让 DOM 结构随状态变。 |
| `getLiveRegionProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in list, 按键与 orientation 同轴 | 焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；automatic 模式顺带切换选中 |
| `ArrowLeft` / `ArrowUp` | focus in list, 按键与 orientation 同轴 | 焦点移到上一个 trigger；automatic 模式顺带切换选中 |
| `Home` | focus in list | 焦点移到首个可停留 trigger |
| `End` | focus in list | 焦点移到末个可停留 trigger |
| `Enter` / `Space` | focus in trigger, not disabled | 把选中切到焦点所在 trigger（manual 模式的确认键） |
| `Tab` / `Shift+Tab` | focus in list | 整组只有锚点 trigger 留在 Tab 序列内，一次 Tab 进出；无锚点时由 list 兜底，焦点进来后转投锚点 trigger（即选中项），锚点缺席或被禁用才落首个可停留项 |
| `Alt+ArrowLeft` / `Alt+ArrowRight` / `Alt+ArrowUp` / `Alt+ArrowDown` | focus in list, reorderable 开着, 按键与 orientation 同轴 | 把焦点标签在标签带里往前 / 往后挪一位，按一下就是一次完整提交，不进拖动态；横轴跟着文字方向翻、rtl 下左右两键对调，竖排的上下两键不对调；已是首位 / 末位就不动，也不回绕；标签序不进库，只报一次重排好的新顺序。裸方向键仍是导航、Enter/Space 仍是确认 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `list` | `aria-orientation` | props.orientation |
| `list` | `role` | 'tablist' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-selected` | 'true' \| 'false' |
| `trigger` | `role` | 'tab' |
| `indicator` | `aria-hidden` | 'true' |
| `separator` | `aria-hidden` | 'true' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'tabpanel' |
| `tab-drag-trigger` | `aria-hidden` | 'true' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

## 样式

默认皮肤 `@xihan-ui/styles/tabs.css` 按部件选择：`[data-scope="tabs"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `trigger` | `data-closable` | ''（条件成立时才出现） |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-draggable` | ''（条件成立时才出现） |
| `trigger` | `data-dragging` | ''（条件成立时才出现） |
| `trigger` | `data-drop` | 'before' \| 'after' |
| `trigger` | `data-state` | 'active' \| 'inactive' |
| `indicator` | `data-orientation` | props.orientation |
| `indicator` | `data-value` | item.value |
| `separator` | `data-orientation` | props.orientation |
| `content` | `data-state` | 'active' \| 'inactive' |
| `tab-drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `tab-drag-trigger` | `data-dragging` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-tabs-content-fg` | `content` | `color` | `default` | `--xh-fg-default` | tabs 的 content 部件 color 覆盖槽。 |
| `--xh-tabs-content-py` | `content` | `padding-block` | `default` | `--xh-stack-gap-md` | tabs 的 content 部件 padding-block 覆盖槽。 |
| `--xh-tabs-drag-fg` | `tab-drag-trigger` | `color` | `default` | `--xh-fg-subtle` | tabs 的 tab-drag-trigger 部件 color 覆盖槽。 |
| `--xh-tabs-drag-fg-active` | `tab-drag-trigger` | `color` | `disabled`<br>`dragging`<br>`hover`<br>`not([data-disabled])` | `--xh-fg-default` | tabs 的 tab-drag-trigger 部件 color 覆盖槽。 |
| `--xh-tabs-drag-fg-disabled` | `tab-drag-trigger` | `color` | `disabled` | `--xh-fg-disabled` | tabs 的 tab-drag-trigger 部件 color 覆盖槽。 |
| `--xh-tabs-drag-grip-long` | `root`<br>`tab-drag-trigger` | `block-size`<br>`inline-size` | `empty`<br>`orientation=vertical` | `--xh-space-2` | tabs 的 root、tab-drag-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-drag-grip-short` | `root`<br>`tab-drag-trigger` | `block-size`<br>`inline-size` | `empty`<br>`orientation=vertical` | `--xh-space-1` | tabs 的 root、tab-drag-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-drag-radius` | `tab-drag-trigger` | `border-radius` | `default` | `--xh-shape-control` | tabs 的 tab-drag-trigger 部件 border-radius 覆盖槽。 |
| `--xh-tabs-drag-size` | `tab-drag-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | tabs 的 tab-drag-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-dragging-opacity` | `trigger` | `opacity` | `dragging` | `--xh-state-dragging-opacity` | tabs 的 trigger 部件 opacity 覆盖槽。 |
| `--xh-tabs-drop-fg` | `trigger` | `background` | `drop=after`<br>`drop=before`<br>`is([data-drop='before'], [data-drop='after'])` | `--xh-bg-brand` | tabs 的 trigger 部件 background 覆盖槽。 |
| `--xh-tabs-drop-line` | `root`<br>`trigger` | `block-size`<br>`inline-size` | `drop=after`<br>`drop=before`<br>`is([data-drop='before'], [data-drop='after'])`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thick` | tabs 的 root、trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-gap` | `root` | `gap` | `default` | `--xh-stack-gap-md` | tabs 的 root 部件 gap 覆盖槽。 |
| `--xh-tabs-indicator-color` | `indicator` | `background` | `default` | `--xh-_tabs-accent` | tabs 的 indicator 部件 background 覆盖槽。 |
| `--xh-tabs-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-pill` | tabs 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-tabs-indicator-thickness` | `indicator` | `block-size`<br>`inline-size`<br>`inset-block-end`<br>`inset-inline-end` | `default`<br>`orientation=vertical` | `--xh-stroke-thick` | tabs 的 indicator 部件 block-size、inline-size、inset-block-end、inset-inline-end 覆盖槽。 |
| `--xh-tabs-list-bg` | `list` | `background` | `default` | `--xh-_tabs-list-bg` | tabs 的 list 部件 background 覆盖槽。 |
| `--xh-tabs-list-border` | `list` | `border-block-end`<br>`border-inline-end` | `default` | `--xh-border-default` | tabs 的 list 部件 border-block-end、border-inline-end 覆盖槽。 |
| `--xh-tabs-list-gap` | `list` | `gap` | `default` | `--xh-_tabs-list-gap` | tabs 的 list 部件 gap 覆盖槽。 |
| `--xh-tabs-list-p` | `list` | `padding` | `default` | `--xh-_tabs-list-p` | tabs 的 list 部件 padding 覆盖槽。 |
| `--xh-tabs-list-radius` | `list` | `border-radius` | `default` | `--xh-_tabs-list-radius` | tabs 的 list 部件 border-radius 覆盖槽。 |
| `--xh-tabs-separator-color` | `separator` | `background` | `default` | `--xh-border-default` | tabs 的 separator 部件 background 覆盖槽。 |
| `--xh-tabs-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` | tabs 的 separator 部件 border-radius 覆盖槽。 |
| `--xh-tabs-separator-size` | `separator` | `block-size` | `default` | `--xh-space-4` | tabs 的 separator 部件 block-size 覆盖槽。 |
| `--xh-tabs-separator-thickness` | `separator` | `block-size`<br>`inline-size` | `default`<br>`orientation=vertical` | `--xh-stroke-thin` | tabs 的 separator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-trigger-bg` | `trigger` | `background` | `default` | `transparent` | tabs 的 trigger 部件 background 覆盖槽。 |
| `--xh-tabs-trigger-bg-active` | `trigger` | `background` | `state=active` | `--xh-_tabs-trigger-bg-active` | tabs 的 trigger 部件 background 覆盖槽。 |
| `--xh-tabs-trigger-bg-active-hover` | `trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])`<br>`state=active` | `--xh-_tabs-trigger-bg-active-hover` | tabs 的 trigger 部件 background 覆盖槽。 |
| `--xh-tabs-trigger-bg-hover` | `trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])` | `--xh-bg-subtle-hover` | tabs 的 trigger 部件 background 覆盖槽。 |
| `--xh-tabs-trigger-border` | `trigger` | `border` | `default` | `--xh-_tabs-trigger-border` | tabs 的 trigger 部件 border 覆盖槽。 |
| `--xh-tabs-trigger-border-active` | `trigger` | `border-color` | `state=active` | `--xh-_tabs-trigger-border-active` | tabs 的 trigger 部件 border-color 覆盖槽。 |
| `--xh-tabs-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-muted` | tabs 的 trigger 部件 color 覆盖槽。 |
| `--xh-tabs-trigger-fg-active` | `trigger` | `color` | `state=active` | `--xh-_tabs-accent-text` | tabs 的 trigger 部件 color 覆盖槽。 |
| `--xh-tabs-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_tabs-trigger-font-size` | tabs 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-tabs-trigger-font-weight` | `trigger` | `font-weight` | `default` | `--xh-text-label-weight` | tabs 的 trigger 部件 font-weight 覆盖槽。 |
| `--xh-tabs-trigger-gap` | `trigger` | `gap` | `default` | `--xh-control-gap-md` | tabs 的 trigger 部件 gap 覆盖槽。 |
| `--xh-tabs-trigger-h` | `trigger` | `block-size` | `default` | `--xh-_tabs-trigger-h` | tabs 的 trigger 部件 block-size 覆盖槽。 |
| `--xh-tabs-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_tabs-trigger-px` | tabs 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-tabs-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | tabs 的 trigger 部件 border-radius 覆盖槽。 |
| `--xh-tabs-trigger-shadow-active` | `trigger` | `box-shadow` | `state=active` | `--xh-_tabs-trigger-shadow-active` | tabs 的 trigger 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`block-size` · `box-shadow` · `color` · `inline-size` · `inset-block-start` · `inset-inline-start` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[卡片](./card)配合；标签多到一行放不下时把标签栏装进自建的横滚容器。

## 最佳实践

- 标签数控制在七个以内，超过就该换成[侧栏导航](./side-nav)。
- 把当前标签写进地址，刷新后才回得到原处。

## 反模式

- 标签页里再套标签页：用户分不清哪一层在切。
- 面板高度随内容剧烈变化，切换时整页跳动。

来源：https://ui.docs.xihanfun.com/components/alert

# Alert 警告提示

页面里常驻的一条提示：说明一件与当前上下文有关的事。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/alert" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/alert.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/alert" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/alert" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/alert.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

在中性抬升表面中说明当前状态与影响

```vue
<script setup lang="ts">
import { XhAlertContent, XhAlertDescription, XhAlertRoot, XhAlertTitle } from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhAlertRoot>
      <XhAlertContent>
        <XhAlertTitle>部署已排队</XhAlertTitle>
        <XhAlertDescription>构建完成后会自动发布。</XhAlertDescription>
      </XhAlertContent>
    </XhAlertRoot>
  </div>
</template>
```

```html
<div style="width: 100%; display: grid; gap: 12px">
  <xh-alert>
    <div data-xh-part="root">
      <div data-xh-part="content">
        <div data-xh-part="title">部署已排队</div>
        <div data-xh-part="description">构建完成后会自动发布。</div>
      </div>
    </div>
  </xh-alert>
</div>
```

## 组件结构

加粗的是必需部件。

`data-scope="alert"`：**`root`** · `indicator` · **`content`** · `title` · `description` · `action` · `close-trigger`

## 示例

### 颜色

tone 只改配色，语义仍由内容与 role 决定

```vue
<script setup lang="ts">
import { XhAlertContent, XhAlertRoot, XhAlertTitle } from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhAlertRoot tone="success"><XhAlertContent><XhAlertTitle>保存成功</XhAlertTitle></XhAlertContent></XhAlertRoot>
    <XhAlertRoot tone="warning"><XhAlertContent><XhAlertTitle>配额即将用尽</XhAlertTitle></XhAlertContent></XhAlertRoot>
    <XhAlertRoot tone="danger"><XhAlertContent><XhAlertTitle>发布失败</XhAlertTitle></XhAlertContent></XhAlertRoot>
  </div>
</template>
```

```html
<div style="width: 100%; display: grid; gap: 12px">
  <xh-alert tone="success">
    <div data-xh-part="root">
      <div data-xh-part="content"><div data-xh-part="title">保存成功</div></div>
    </div>
  </xh-alert>
  <xh-alert tone="warning">
    <div data-xh-part="root">
      <div data-xh-part="content"><div data-xh-part="title">配额即将用尽</div></div>
    </div>
  </xh-alert>
  <xh-alert tone="danger">
    <div data-xh-part="root">
      <div data-xh-part="content"><div data-xh-part="title">发布失败</div></div>
    </div>
  </xh-alert>
</div>
```

### 可关闭

closable 开启后才渲染关闭按钮；open 受控时由宿主决定去留

```vue
<script setup lang="ts">
import {
  XhAlertCloseTrigger,
  XhAlertContent,
  XhAlertRoot,
  XhAlertTitle,
  XhButton,
} from "@xihan-ui/vue";
import { ref } from "vue";

const open = ref(true);
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhAlertRoot v-model:open="open" closable>
      <XhAlertContent><XhAlertTitle>点右侧关闭</XhAlertTitle></XhAlertContent>
      <XhAlertCloseTrigger />
    </XhAlertRoot>
    <XhButton v-if="!open" size="sm" @click="open = true">再显示一次</XhButton>
  </div>
</template>
```

```html
<div style="width: 100%; display: grid; gap: 12px">
  <xh-alert id="alert-closable" open closable>
    <div data-xh-part="root">
      <div data-xh-part="content"><div data-xh-part="title">点右侧关闭</div></div>
      <button data-xh-part="close-trigger"></button>
    </div>
  </xh-alert>
  <xh-button id="alert-closable-reopen" size="sm" style="display: none">
    <button data-xh-part="root">再显示一次</button>
  </xh-button>
</div>

<script type="module">
  // 收起意图写回 open，重开按钮跟着显隐
  const host = document.getElementById("alert-closable");
  const reopen = document.getElementById("alert-closable-reopen");
  host.addEventListener("open-change", (event) => {
    host.open = event.detail.open;
    reopen.style.display = event.detail.open ? "none" : "";
  });
  reopen.addEventListener("click", () => {
    host.open = true;
    reopen.style.display = "none";
  });
</script>
```

### 图标

icon 部件排在标题前面，颜色取当前语气的强调色；内容由作者塞，字形与内联 svg 都行

```vue
<script setup lang="ts">
import { CheckIcon } from "@xihan-ui/icons";
import {
  XhAlertContent,
  XhAlertDescription,
  XhAlertIndicator,
  XhAlertRoot,
  XhAlertTitle,
  XhIcon,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <!-- 一个字形就够：图标是纯装饰，读屏不会念它 -->
    <XhAlertRoot tone="success">
      <XhAlertIndicator><XhIcon :icon="CheckIcon" /></XhAlertIndicator>
      <XhAlertContent>
        <XhAlertTitle>发布完成</XhAlertTitle>
        <XhAlertDescription>三个节点都已切到新版本。</XhAlertDescription>
      </XhAlertContent>
    </XhAlertRoot>

    <!-- 内联 svg 同样能塞进来，描边取 currentColor 就跟着语气走 -->
    <XhAlertRoot tone="danger">
      <XhAlertIndicator>
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 3.5L21.5 20H2.5Z" />
          <path d="M12 9.5v4" />
          <path d="M12 16.5v.5" />
        </svg>
      </XhAlertIndicator>
      <XhAlertContent>
        <XhAlertTitle>发布失败</XhAlertTitle>
        <XhAlertDescription>第 2 个节点健康检查未通过。</XhAlertDescription>
      </XhAlertContent>
    </XhAlertRoot>
  </div>
</template>
```

```html
<div style="width: 100%; display: grid; gap: 12px">
  <!-- 一个字形就够：图标是纯装饰，读屏不会念它 -->
  <xh-alert tone="success">
    <div data-xh-part="root">
      <span data-xh-part="indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg></span>
      <div data-xh-part="content">
        <div data-xh-part="title">发布完成</div>
        <div data-xh-part="description">三个节点都已切到新版本。</div>
      </div>
    </div>
  </xh-alert>

  <!-- 内联 svg 同样能塞进来，描边取 currentColor 就跟着语气走 -->
  <xh-alert tone="danger">
    <div data-xh-part="root">
      <span data-xh-part="indicator">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 3.5L21.5 20H2.5Z" />
          <path d="M12 9.5v4" />
          <path d="M12 16.5v.5" />
        </svg>
      </span>
      <div data-xh-part="content">
        <div data-xh-part="title">发布失败</div>
        <div data-xh-part="description">第 2 个节点健康检查未通过。</div>
      </div>
    </div>
  </xh-alert>
</div>
```

### 操作

将与提示直接相关的短操作放在尾端

```vue
<script setup lang="ts">
import {
  XhAlertAction,
  XhAlertContent,
  XhAlertDescription,
  XhAlertRoot,
  XhAlertTitle,
  XhButton,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%">
    <XhAlertRoot tone="warning">
      <XhAlertContent>
        <XhAlertTitle>配额即将用尽</XhAlertTitle>
        <XhAlertDescription>本月还可处理 120 次请求。</XhAlertDescription>
      </XhAlertContent>
      <XhAlertAction><XhButton size="sm" variant="outline">查看用量</XhButton></XhAlertAction>
    </XhAlertRoot>
  </div>
</template>
```

```html
<div style="width: 100%">
  <xh-alert tone="warning">
    <div data-xh-part="root">
      <div data-xh-part="content">
        <div data-xh-part="title">配额即将用尽</div>
        <div data-xh-part="description">本月还可处理 120 次请求。</div>
      </div>
      <div data-xh-part="action">
        <xh-button size="sm" variant="outline"><button data-xh-part="root">查看用量</button></xh-button>
      </div>
    </div>
  </xh-alert>
</div>
```

## 设计指引

### 何时使用

- 表单顶部的整体错误、页面级的状态说明、功能公告。
- 信息需要一直在，直到用户处理或关闭。

### 何时不用

- 只是一次操作的结果反馈：用[轻提示](./toast)——它会自己消失。
- 需要用户当场做决定并阻断流程：用[对话框](./dialog)。
- 是一个字段的错误：用[表单字段](./field)的错误文本。

### 特性

- 默认使用中性抬升表面，语气只强调标题与图标；说明保持次级前景。
- `content` 是标题与说明共用的必需文本列，操作和关闭入口排在尾端。
- `closable` 给出关闭按钮，关闭态可受控。

### 组合

- 图标用[图标](./icon)；里面的行动入口用[按钮](./button)。

### 最佳实践

- 说清楚发生了什么、影响是什么、用户能做什么，三样缺一不可。
- 语气别只靠颜色，标题文字本身就要说明严重程度。

### 反模式

- 一屏堆好几条提示：用户会全部略过。
- 用它做营销位。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-alert>` |
| Vue 组件 | `XhAlertAction` `XhAlertCloseTrigger` `XhAlertContent` `XhAlertDescription` `XhAlertIndicator` `XhAlertRoot` `XhAlertTitle` |
| 状态机 | `alertMachine` |
| 皮肤 | `@xihan-ui/styles/alert.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色，默认 info。 danger / warning 走 role="alert"，其余走 role="status"。 |
| `closable` | `boolean` |  | 关闭按钮是否可用，默认 true。false 时该按钮同时被禁用与收起。 |
| `open` | `boolean` |  | 受控显隐；缺省该 prop 即非受控。 |
| `defaultOpen` | `boolean` |  | 非受控初始显隐，默认显示。 |
| `onOpenChange` | `(details: AlertOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |
| `translations` | `Partial<AlertTranslations>` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `AlertOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `tone` | `string` |  |
| `closable` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` | 文本列容器：把标题与说明摞成一列。 |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getActionProps` | `() => T['element']` | 操作槽：圈出按钮区，按钮本身归作者。 |
| `getCloseTriggerProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus 在 close-trigger 上且 closable | 收起提示并通知 open=false |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-atomic` | 'true' |
| `root` | `aria-describedby` | `description` 部件的 id |
| `root` | `aria-labelledby` | `title` 部件的 id |
| `root` | `aria-live` | live |
| `root` | `role` | role |
| `indicator` | `aria-hidden` | 'true' |
| `close-trigger` | `aria-label` | props.translations.close |

## 样式参考

### 皮肤

`@xihan-ui/styles/alert.css` 使用 `[data-scope="alert"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `close-trigger` | `data-disabled` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-alert-action-gap` | `action` | `gap` | `default` | `--xh-space-2` | alert 的 action 部件 gap 覆盖槽。 |
| `--xh-alert-bg` | `root` | `background` | `default` | `--xh-_alert-surface` | alert 的 root 部件 background 覆盖槽。 |
| `--xh-alert-border` | `root` | `border` | `default` | `--xh-_alert-edge` | alert 的 root 部件 border 覆盖槽。 |
| `--xh-alert-close-bg-active` | `close-trigger` | `background` | `active` | `--xh-_tone-subtle-active` | alert 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-alert-close-bg-hover` | `close-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-_tone-subtle-hover` | alert 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-alert-close-fg` | `close-trigger` | `color` | `default` | `--xh-fg-muted` | alert 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-alert-close-fg-hover` | `close-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-default` | alert 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-alert-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | alert 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-alert-close-size` | `close-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-h-sm` | alert 的 close-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-alert-content-gap` | `content` | `gap` | `default` | `--xh-space-1` | alert 的 content 部件 gap 覆盖槽。 |
| `--xh-alert-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | alert 的 description 部件 color 覆盖槽。 |
| `--xh-alert-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | alert 的 description 部件 font-size 覆盖槽。 |
| `--xh-alert-fg` | `root` | `color` | `default` | `--xh-fg-default` | alert 的 root 部件 color 覆盖槽。 |
| `--xh-alert-font-size` | `root` | `font-size` | `default` | `--xh-text-body-size` | alert 的 root 部件 font-size 覆盖槽。 |
| `--xh-alert-gap` | `root` | `gap` | `default` | `--xh-space-4` | alert 的 root 部件 gap 覆盖槽。 |
| `--xh-alert-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-sm` | alert 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-alert-indicator-fg` | `indicator` | `color` | `default` | `--xh-_tone-fg` | alert 的 indicator 部件 color 覆盖槽。 |
| `--xh-alert-indicator-p` | `indicator` | `padding` | `default` | `--xh-space-1` | alert 的 indicator 部件 padding 覆盖槽。 |
| `--xh-alert-leading` | `root` | `line-height` | `default` | `--xh-leading-normal` | alert 的 root 部件 line-height 覆盖槽。 |
| `--xh-alert-px` | `root` | `padding-inline` | `default` | `--xh-surface-px-sm` | alert 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-alert-py` | `root` | `padding-block` | `default` | `--xh-surface-py-sm` | alert 的 root 部件 padding-block 覆盖槽。 |
| `--xh-alert-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | alert 的 root 部件 border-radius 覆盖槽。 |
| `--xh-alert-shadow` | `root` | `box-shadow` | `default` | `--xh-elevation-raised` | alert 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-alert-title-fg` | `title` | `color` | `default` | `--xh-_tone-fg` | alert 的 title 部件 color 覆盖槽。 |
| `--xh-alert-title-font-size` | `title` | `font-size` | `default` | `--xh-text-label-size` | alert 的 title 部件 font-size 覆盖槽。 |
| `--xh-alert-title-font-weight` | `title` | `font-weight` | `default` | `--xh-font-weight-semibold` | alert 的 title 部件 font-weight 覆盖槽。 |
| `--xh-alert-title-leading` | `title` | `line-height` | `default` | `--xh-leading-tight` | alert 的 title 部件 line-height 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

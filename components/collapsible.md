来源：https://ui.docs.xihanfun.com/components/collapsible

# Collapsible `折叠区域`

一块可以展开收起的内容，只有一块。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/collapsible" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/collapsible.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/collapsible" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/collapsible" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/collapsible.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

不传 open 即为非受控，defaultOpen 只给初始值，之后由组件自己维护开合

```vue
<script setup lang="ts">
import {
  XhCollapsibleContent,
  XhCollapsibleIndicator,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
    <XhCollapsibleRoot>
      <XhCollapsibleTrigger>
        展开详情
        <!-- 指示符空着就由皮肤画一枚箭头，展开时转向 -->
        <XhCollapsibleIndicator />
      </XhCollapsibleTrigger>
      <XhCollapsibleContent>
        收起时内容只加 hidden，节点不卸载，里面的输入框与滚动位置都留着。
      </XhCollapsibleContent>
    </XhCollapsibleRoot>

    <XhCollapsibleRoot default-open>
      <XhCollapsibleTrigger>
        一上来就开着
        <XhCollapsibleIndicator />
      </XhCollapsibleTrigger>
      <XhCollapsibleContent>defaultOpen 只影响初始状态。</XhCollapsibleContent>
    </XhCollapsibleRoot>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
  <xh-collapsible>
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        展开详情
        <!-- 指示符空着就由皮肤画一枚箭头，展开时转向 -->
        <span data-xh-part="indicator"></span>
      </button>
      <div data-xh-part="content">
        收起时节点不卸载，里面的输入框与滚动位置都留着。
      </div>
    </div>
  </xh-collapsible>

  <xh-collapsible default-open>
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        一上来就开着
        <span data-xh-part="indicator"></span>
      </button>
      <div data-xh-part="content">defaultOpen 只影响初始状态。</div>
    </div>
  </xh-collapsible>
</div>
```

## 示例

### 受控

传了 open 就由宿主说了算，组件自己不再改状态，只发 open-change 报告意图

```vue
<script setup lang="ts">
import {
  XhButton,
  XhCollapsibleContent,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const open = ref(false);
</script>

<template>
  <div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
    <XhButton size="sm" @click="open = !open">
      从外面{{ open ? "收起" : "展开" }}
    </XhButton>

    <XhCollapsibleRoot v-model:open="open">
      <XhCollapsibleTrigger>面板标题</XhCollapsibleTrigger>
      <XhCollapsibleContent>
        当前状态：{{ open ? "展开" : "收起" }}。触发器与上面的按钮改的是同一份状态。
      </XhCollapsibleContent>
    </XhCollapsibleRoot>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
  <xh-button size="sm">
    <button data-xh-part="root" id="collapsible-controlled-toggle">
      从外面展开
    </button>
  </xh-button>

  <xh-collapsible id="collapsible-controlled" open="false">
    <div data-xh-part="root">
      <button data-xh-part="trigger">面板标题</button>
      <div data-xh-part="content">
        当前状态：<span id="collapsible-controlled-state">收起</span
        >。触发器与上面的按钮改的是同一份状态。
      </div>
    </div>
  </xh-collapsible>
</div>

<script type="module">
  // 开合状态存在宿主这一侧，两处入口都改它，组件只按 open 显示
  const collapsible = document.getElementById("collapsible-controlled");
  const toggle = document.getElementById("collapsible-controlled-toggle");
  const state = document.getElementById("collapsible-controlled-state");

  function render(open) {
    collapsible.open = open;
    toggle.textContent = open ? "从外面收起" : "从外面展开";
    state.textContent = open ? "展开" : "收起";
  }

  toggle.addEventListener("click", () => render(!collapsible.open));
  collapsible.addEventListener("open-change", (event) =>
    render(event.detail.open),
  );
</script>
```

### 禁用

disabled 把触发器整个关停，点击与键盘都不再改开合，已展开的内容维持原样

```vue
<script setup lang="ts">
import {
  XhCollapsibleContent,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
    <XhCollapsibleRoot disabled>
      <XhCollapsibleTrigger>收起且禁用</XhCollapsibleTrigger>
      <XhCollapsibleContent>点不开。</XhCollapsibleContent>
    </XhCollapsibleRoot>

    <XhCollapsibleRoot default-open disabled>
      <XhCollapsibleTrigger>展开且禁用</XhCollapsibleTrigger>
      <XhCollapsibleContent>内容停在展开态，收不上。</XhCollapsibleContent>
    </XhCollapsibleRoot>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
  <xh-collapsible disabled>
    <div data-xh-part="root">
      <button data-xh-part="trigger">收起且禁用</button>
      <div data-xh-part="content">点不开。</div>
    </div>
  </xh-collapsible>

  <xh-collapsible default-open disabled>
    <div data-xh-part="root">
      <button data-xh-part="trigger">展开且禁用</button>
      <div data-xh-part="content">内容停在展开态，收不上。</div>
    </div>
  </xh-collapsible>
</div>
```

### 尺寸

size 换的是触发按钮的高度、内边距与字号，三档并排对照

```vue
<script setup lang="ts">
import {
  XhCollapsibleContent,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div
    style="
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      align-items: start;
    "
  >
    <XhCollapsibleRoot size="sm" default-open>
      <XhCollapsibleTrigger>小号 sm</XhCollapsibleTrigger>
      <XhCollapsibleContent>按钮最矮，字号也最小。</XhCollapsibleContent>
    </XhCollapsibleRoot>

    <XhCollapsibleRoot default-open>
      <XhCollapsibleTrigger>缺省档</XhCollapsibleTrigger>
      <XhCollapsibleContent>不写 size 就是这一档。</XhCollapsibleContent>
    </XhCollapsibleRoot>

    <XhCollapsibleRoot size="lg" default-open>
      <XhCollapsibleTrigger>大号 lg</XhCollapsibleTrigger>
      <XhCollapsibleContent>按钮最高，字号也最大。</XhCollapsibleContent>
    </XhCollapsibleRoot>
  </div>
</template>
```

```html
<div
  style="
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    align-items: start;
  "
>
  <xh-collapsible size="sm" default-open>
    <div data-xh-part="root">
      <button data-xh-part="trigger">小号 sm</button>
      <div data-xh-part="content">按钮最矮，字号也最小。</div>
    </div>
  </xh-collapsible>

  <xh-collapsible default-open>
    <div data-xh-part="root">
      <button data-xh-part="trigger">缺省档</button>
      <div data-xh-part="content">不写 size 就是这一档。</div>
    </div>
  </xh-collapsible>

  <xh-collapsible size="lg" default-open>
    <div data-xh-part="root">
      <button data-xh-part="trigger">大号 lg</button>
      <div data-xh-part="content">按钮最高，字号也最大。</div>
    </div>
  </xh-collapsible>
</div>
```

### 自定义展开标记

往指示符部件里塞自己的图形，转向仍由皮肤按 open 接管

```vue
<script setup lang="ts">
import { ChevronDownIcon } from "@xihan-ui/icons";
import {
  XhCollapsibleContent,
  XhCollapsibleIndicator,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
  XhIcon,
} from "@xihan-ui/vue";
import { ref } from "vue";

const open = ref(false);
</script>

<template>
  <div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
    <XhCollapsibleRoot v-model:open="open">
      <XhCollapsibleTrigger>
        <span>高级筛选</span>
        <span style="font-size: 12px; display: inline-flex; align-items: center; gap: 2px">
          {{ open ? "收起" : "展开" }}
          <!-- 部件里放什么归作者；transform 由皮肤跟着 data-state 打 -->
          <XhCollapsibleIndicator>
            <XhIcon :icon="ChevronDownIcon" />
          </XhCollapsibleIndicator>
        </span>
      </XhCollapsibleTrigger>
      <XhCollapsibleContent>
        创建时间、负责人、标签这些不常用的条件收在这里。
      </XhCollapsibleContent>
    </XhCollapsibleRoot>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
  <xh-collapsible id="collapsible-marker">
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span>高级筛选</span>
        <span style="font-size: 12px; display: inline-flex; align-items: center; gap: 2px">
          <span id="collapsible-marker-text">展开</span>
          <!-- 部件里放什么归作者；transform 由皮肤跟着 data-state 打 -->
          <span data-xh-part="indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9L12 15L18 9"/></svg></span>
        </span>
      </button>
      <div data-xh-part="content">
        创建时间、负责人、标签这些不常用的条件收在这里。
      </div>
    </div>
  </xh-collapsible>
</div>

<script type="module">
  // 只有这行文案要跟着开合换；箭头的转向归皮肤
  const collapsible = document.getElementById("collapsible-marker");
  const text = document.getElementById("collapsible-marker-text");
  collapsible.addEventListener("open-change", (event) => {
    text.textContent = event.detail.open ? "收起" : "展开";
  });
</script>
```

### 展开动画

收起时节点不卸载，作者接管内容区的 display，用一条行高过渡就能平滑展开

```vue
<script setup lang="ts">
import {
  XhCollapsibleContent,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const open = ref(false);
</script>

<template>
  <div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
    <XhCollapsibleRoot v-model:open="open">
      <XhCollapsibleTrigger>{{ open ? "收起详情" : "展开详情" }}</XhCollapsibleTrigger>
      <!-- 行高在 0fr 与 1fr 之间过渡，不必测量内容高度；
           内边距挪到内层，收起时外层才不留白；display 被接管后，收起态改用 inert 隔离 -->
      <XhCollapsibleContent
        :inert="!open || undefined"
        :style="{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          paddingBlock: '0',
          transition:
            'grid-template-rows var(--xh-motion-duration-enter) var(--xh-motion-ease-enter)',
        }"
      >
        <div style="overflow: hidden">
          <p style="margin: 0; padding-block: 12px">
            展开与收起都走同一条过渡，中途再点一次会从当前高度掉头。
          </p>
        </div>
      </XhCollapsibleContent>
    </XhCollapsibleRoot>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
  <xh-collapsible id="collapsible-transition">
    <div data-xh-part="root">
      <button data-xh-part="trigger" data-label>展开详情</button>
      <!-- 行高在 0fr 与 1fr 之间过渡，不必测量内容高度；
           内边距挪到内层，收起时外层才不留白 -->
      <div
        data-xh-part="content"
        data-panel
        style="
          display: grid;
          grid-template-rows: 0fr;
          padding-block: 0;
          transition: grid-template-rows var(--xh-motion-duration-enter)
            var(--xh-motion-ease-enter);
        "
      >
        <div style="overflow: hidden">
          <p style="margin: 0; padding-block: 12px">
            展开与收起都走同一条过渡，中途再点一次会从当前高度掉头。
          </p>
        </div>
      </div>
    </div>
  </xh-collapsible>
</div>

<script type="module">
  // 开合只改两处：触发器上那行字，与内容区的行高
  const collapsible = document.getElementById("collapsible-transition");
  const label = collapsible.querySelector("[data-label]");
  const panel = collapsible.querySelector("[data-panel]");

  collapsible.addEventListener("open-change", (event) => {
    label.textContent = event.detail.open ? "收起详情" : "展开详情";
    panel.style.gridTemplateRows = event.detail.open ? "1fr" : "0fr";
  });
</script>
```

### 语气

tone 落在触发按钮的展开态上，六种语气各展开一份做对照

```vue
<script setup lang="ts">
import { XhCollapsibleContent, XhCollapsibleRoot, XhCollapsibleTrigger } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"];
</script>

<template>
  <div
    style="
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      align-items: start;
    "
  >
    <XhCollapsibleRoot v-for="tone in tones" :key="tone" :tone="tone" default-open>
      <XhCollapsibleTrigger>{{ tone }}</XhCollapsibleTrigger>
      <XhCollapsibleContent>收起后触发按钮不吃语气色。</XhCollapsibleContent>
    </XhCollapsibleRoot>
  </div>
</template>
```

```html
<div
  style="
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    align-items: start;
  "
>
  <xh-collapsible tone="brand" default-open>
    <div data-xh-part="root">
      <button data-xh-part="trigger">brand</button>
      <div data-xh-part="content">收起后触发按钮不吃语气色。</div>
    </div>
  </xh-collapsible>

  <xh-collapsible tone="neutral" default-open>
    <div data-xh-part="root">
      <button data-xh-part="trigger">neutral</button>
      <div data-xh-part="content">收起后触发按钮不吃语气色。</div>
    </div>
  </xh-collapsible>

  <xh-collapsible tone="success" default-open>
    <div data-xh-part="root">
      <button data-xh-part="trigger">success</button>
      <div data-xh-part="content">收起后触发按钮不吃语气色。</div>
    </div>
  </xh-collapsible>

  <xh-collapsible tone="warning" default-open>
    <div data-xh-part="root">
      <button data-xh-part="trigger">warning</button>
      <div data-xh-part="content">收起后触发按钮不吃语气色。</div>
    </div>
  </xh-collapsible>

  <xh-collapsible tone="danger" default-open>
    <div data-xh-part="root">
      <button data-xh-part="trigger">danger</button>
      <div data-xh-part="content">收起后触发按钮不吃语气色。</div>
    </div>
  </xh-collapsible>

  <xh-collapsible tone="info" default-open>
    <div data-xh-part="root">
      <button data-xh-part="trigger">info</button>
      <div data-xh-part="content">收起后触发按钮不吃语气色。</div>
    </div>
  </xh-collapsible>
</div>
```

## 设计指引

### 何时使用

- 高级选项、补充说明这类默认不需要看见的单块内容。

### 何时不用

- 有好几块并列的可折叠内容：用[手风琴](./accordion)，它管互斥与整组语义。
- 内容需要浮在页面之上：用[气泡卡片](./popover)。

### 特性

- 触发器与内容通过 `aria-controls` 与 `aria-expanded` 关联。
- 展开动画由皮肤给，内容高度由组件量出来。
- 指示符部件空着由皮肤画一枚箭头，塞进图形即以作者的为准，转向两种情形都由皮肤打。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-collapsible>` |
| Vue 组件 | `XhCollapsibleContent` `XhCollapsibleHeader` `XhCollapsibleIndicator` `XhCollapsibleRoot` `XhCollapsibleTrigger` |
| 组合式函数 | `useCollapsible` |
| 状态机 | `collapsibleMachine` |
| 皮肤 | `@xihan-ui/styles/collapsible.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="collapsible"`：`root` · `header` · `trigger` · **`content`** · `indicator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `disabled` | `boolean` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `dir` | `Direction` |  | 文字方向，只作用于排版；作者没给就不写。 |
| `onOpenChange` | `(details: CollapsibleOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `CollapsibleOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `header` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `TOGGLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

## connect API

`useCollapsible` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in trigger, not disabled | 展开/收起 content |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `indicator` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/collapsible.css` 按部件选择：`[data-scope="collapsible"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `header` | `data-disabled` | ''（条件成立时才出现） |
| `header` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `content` | `data-state` | 'open' \| 'closed' |
| `indicator` | `data-disabled` | ''（条件成立时才出现） |
| `indicator` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-collapsible-content-fg` | `content` | `color` | `default` | `--xh-fg-default` | collapsible 的 content 部件 color 覆盖槽。 |
| `--xh-collapsible-content-py` | `*`<br>`content` | `padding-block` | `@keyframes xh-collapsible-collapse`<br>`@keyframes xh-collapsible-expand`<br>`default` | `--xh-stack-gap-md` | collapsible 的 *、content 部件 padding-block 覆盖槽。 |
| `--xh-collapsible-header-gap` | `header` | `gap` | `default` | `--xh-_collapsible-trigger-gap` | collapsible 的 header 部件 gap 覆盖槽。 |
| `--xh-collapsible-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | collapsible 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-collapsible-trigger-bg` | `trigger` | `background` | `default` | `transparent` | collapsible 的 trigger 部件 background 覆盖槽。 |
| `--xh-collapsible-trigger-bg-hover` | `trigger` | `background` | `hover` | `--xh-bg-subtle` | collapsible 的 trigger 部件 background 覆盖槽。 |
| `--xh-collapsible-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | collapsible 的 trigger 部件 color 覆盖槽。 |
| `--xh-collapsible-trigger-fg-open` | `trigger` | `color` | `state=open` | `--xh-_collapsible-open-fg` | collapsible 的 trigger 部件 color 覆盖槽。 |
| `--xh-collapsible-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_collapsible-trigger-font-size` | collapsible 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-collapsible-trigger-font-weight` | `trigger` | `font-weight` | `default` | `--xh-text-label-weight` | collapsible 的 trigger 部件 font-weight 覆盖槽。 |
| `--xh-collapsible-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_collapsible-trigger-gap` | collapsible 的 trigger 部件 gap 覆盖槽。 |
| `--xh-collapsible-trigger-h` | `trigger` | `block-size` | `default` | `--xh-_collapsible-trigger-h` | collapsible 的 trigger 部件 block-size 覆盖槽。 |
| `--xh-collapsible-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_collapsible-trigger-px` | collapsible 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-collapsible-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | collapsible 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-collapsible-collapse` · `xh-collapsible-expand` 随皮肤自带，不引用别处文件里的名字；`rotate` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 放进[卡片](./card)、[表单](./form)的高级选项区。

## 最佳实践

- 触发器文字说明里面是什么，别只写"展开"。
- 收起时内容退出 Tab 序列，别让焦点落到看不见的地方。

## 反模式

- 把必填字段藏进折叠区：用户提交失败也不知道错在哪。

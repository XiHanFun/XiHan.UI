来源：https://ui.docs.xihanfun.com/components/collapsible

# Collapsible 折叠区域

一块可以展开与收起的单块内容。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/collapsible" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/collapsible.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/collapsible" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/collapsible" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/collapsible.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

不传 open 即为非受控，defaultOpen 只提供初始值，之后由组件自行维护开合

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

## 组件结构

加粗的是必需部件。

`data-scope="collapsible"`：`root` · `header` · `trigger` · **`content`** · `indicator`

## 示例

### 受控

传入 open 后由宿主决定，组件自身不再修改状态，只发 open-change 报告意图

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

disabled 把触发器整个关停，点击与键盘都不再改变开合，已展开的内容维持原样

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

size 改变触发按钮的高度、内边距与字号，三档并排对照

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

在指示符部件中放置自己的图形，转向仍由皮肤按 open 接管

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

收起时节点不卸载，作者接管内容区的 display，用一条行高过渡即可平滑展开

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

### 颜色

tone 落在触发按钮的展开态上，六种颜色各展开一份做对照

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
      <XhCollapsibleContent>收起后触发按钮保持默认颜色。</XhCollapsibleContent>
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
      <div data-xh-part="content">收起后触发按钮保持默认颜色。</div>
    </div>
  </xh-collapsible>

  <xh-collapsible tone="neutral" default-open>
    <div data-xh-part="root">
      <button data-xh-part="trigger">neutral</button>
      <div data-xh-part="content">收起后触发按钮保持默认颜色。</div>
    </div>
  </xh-collapsible>

  <xh-collapsible tone="success" default-open>
    <div data-xh-part="root">
      <button data-xh-part="trigger">success</button>
      <div data-xh-part="content">收起后触发按钮保持默认颜色。</div>
    </div>
  </xh-collapsible>

  <xh-collapsible tone="warning" default-open>
    <div data-xh-part="root">
      <button data-xh-part="trigger">warning</button>
      <div data-xh-part="content">收起后触发按钮保持默认颜色。</div>
    </div>
  </xh-collapsible>

  <xh-collapsible tone="danger" default-open>
    <div data-xh-part="root">
      <button data-xh-part="trigger">danger</button>
      <div data-xh-part="content">收起后触发按钮保持默认颜色。</div>
    </div>
  </xh-collapsible>

  <xh-collapsible tone="info" default-open>
    <div data-xh-part="root">
      <button data-xh-part="trigger">info</button>
      <div data-xh-part="content">收起后触发按钮保持默认颜色。</div>
    </div>
  </xh-collapsible>
</div>
```

## 设计指引

### 何时使用

- 高级选项、补充说明等默认不需要显示的单块内容。

### 何时不用

- 有多块并列的可折叠内容时，使用[手风琴](./accordion)，它负责互斥与整组语义。
- 内容需要浮在页面之上时，使用[气泡卡片](./popover)。

### 特性

- 触发器与内容通过 `aria-controls` 与 `aria-expanded` 关联。
- 展开动画由皮肤提供，内容高度由组件测量。
- 指示符部件留空时由皮肤绘制箭头，放入图形时以作者提供的为准，两种情形的转向都由皮肤处理。

### 组合

- 放入[卡片](./card)、[表单](./form)的高级选项区。

### 最佳实践

- 触发器文字说明内容是什么，不只写“展开”。
- 收起时内容退出 Tab 序列，焦点不落到不可见的位置。

### 反模式

- 把必填字段放进折叠区，用户提交失败时无法定位错误。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-collapsible>` |
| Vue 组件 | `XhCollapsibleContent` `XhCollapsibleHeader` `XhCollapsibleIndicator` `XhCollapsibleRoot` `XhCollapsibleTrigger` |
| 组合式函数 | `useCollapsible` |
| 状态机 | `collapsibleMachine` |
| 皮肤 | `@xihan-ui/styles/collapsible.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `disabled` | `boolean` |  |  |
| `tone` | `Tone` |  | 颜色：brand / neutral / success / warning / danger / info，决定使用哪组状态色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `dir` | `Direction` |  | 文字方向，只作用于排版；作者未提供时不写入。 |
| `onOpenChange` | `(details: CollapsibleOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `CollapsibleOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhCollapsibleRoot` | `children` | `ReactNode` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `header` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `TOGGLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `PRESS.START` · `PRESS.END`

**判据**：`isOpenControlled` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in trigger, not disabled | 展开/收起 content |
| `Enter` / `Space` | held in trigger, not disabled | 按住期间 trigger 投影 data-pressed，与指针 :active 同一副按压面（disclosure trigger 只换面不缩放）；抬起、失焦或转禁用撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `indicator` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/collapsible.css` 使用 `[data-scope="collapsible"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `header` | `data-disabled` | ''（条件成立时才出现） |
| `header` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-pressed` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'disclosure-trigger' |
| `trigger` | `data-xh-action-size` | props.size |
| `trigger` | `data-xh-action-variant` | 'ghost' |
| `content` | `data-instant` | ''（条件成立时才出现） |
| `content` | `data-state` | 'open' \| 'closed' |
| `indicator` | `data-disabled` | ''（条件成立时才出现） |
| `indicator` | `data-instant` | ''（条件成立时才出现） |
| `indicator` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-collapsible-content-fg` | `content` | `color` | `default` | `--xh-fg-muted` | collapsible 的 content 部件 color 覆盖槽。 |
| `--xh-collapsible-content-font-size` | `content` | `font-size` | `default` | `--xh-text-secondary-size` | collapsible 的 content 部件 font-size 覆盖槽。 |
| `--xh-collapsible-content-pb` | `content` | `padding-block-end` | `@keyframes xh-disclosure-collapse`<br>`@keyframes xh-disclosure-expand`<br>`default` | `--xh-_collapsible-content-pb` | collapsible 的 content 部件 padding-block-end 覆盖槽。 |
| `--xh-collapsible-content-px` | `content` | `padding-inline` | `default` | `--xh-_collapsible-content-px` | collapsible 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-collapsible-header-gap` | `header` | `gap` | `default` | `--xh-_collapsible-trigger-gap` | collapsible 的 header 部件 gap 覆盖槽。 |
| `--xh-collapsible-icon-size` | `root`<br>`trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` | collapsible 的 root、trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-collapsible-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-muted` | collapsible 的 indicator 部件 color 覆盖槽。 |
| `--xh-collapsible-trigger-bg` | `trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` | collapsible 的 trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-collapsible-trigger-bg-hover` | `trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | collapsible 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-collapsible-trigger-fg` | `trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | collapsible 的 trigger 部件 color 覆盖槽。 |
| `--xh-collapsible-trigger-fg-disabled` | `trigger` | `color` | `disabled` | `--xh-_action-variant-fg-disabled` | collapsible 的 trigger 部件 color 覆盖槽。 |
| `--xh-collapsible-trigger-fg-open` | `trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=open` | `--xh-_collapsible-open-fg` | collapsible 的 trigger 部件 color 覆盖槽。 |
| `--xh-collapsible-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_action-profile-font-size` | collapsible 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-collapsible-trigger-font-weight` | `trigger` | `font-weight` | `default` | `--xh-text-label-weight` | collapsible 的 trigger 部件 font-weight 覆盖槽。 |
| `--xh-collapsible-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_action-profile-gap` | collapsible 的 trigger 部件 gap 覆盖槽。 |
| `--xh-collapsible-trigger-h` | `trigger` | `block-size`<br>`min-block-size` | `default`<br>`xh-action-profile=disclosure-trigger` | `--xh-_action-profile-visual-size` | collapsible 的 trigger 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-collapsible-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | collapsible 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-collapsible-trigger-py` | `trigger` | `padding-block` | `xh-action-profile=disclosure-trigger` | `--xh-_action-profile-padding-block` | collapsible 的 trigger 部件 padding-block 覆盖槽。 |
| `--xh-collapsible-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-_action-profile-radius` | collapsible 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 披露（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-disclosure-collapse` · `xh-disclosure-expand` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`rotate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

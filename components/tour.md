来源：https://ui.docs.xihanfun.com/components/tour

# Tour 引导

用于逐步介绍界面中的关键功能。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tour" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tour.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tour" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tour" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tour.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

逐步介绍页面中的关键操作

```vue
<script setup lang="ts">
import {
  XhButton,
  XhTourArrow,
  XhTourBackdrop,
  XhTourCloseTrigger,
  XhTourContent,
  XhTourDescription,
  XhTourNextTrigger,
  XhTourPositioner,
  XhTourPrevTrigger,
  XhTourProgressIndicator,
  XhTourProgressText,
  XhTourRoot,
  XhTourSkipTrigger,
  XhTourSpotlight,
  XhTourTitle,
} from "@xihan-ui/vue";

const steps = [
  {
    id: "search",
    target: "#tour-basic-search",
    title: "全站搜索",
    description: "按名称或编号找记录，支持拼音首字母。",
    placement: "bottom" as const,
  },
  {
    id: "filter",
    target: "#tour-basic-filter",
    title: "筛选",
    description: "按状态与时间区间收窄结果，条件会记在本地。",
    placement: "bottom" as const,
  },
  {
    id: "export",
    target: "#tour-basic-export",
    title: "导出",
    description: "导出当前筛选后的全部数据，走后台队列。",
    placement: "bottom-end" as const,
  },
];

const translations = {
  close: "关闭",
  progress: (step: number, count: number) => `第 ${step} 步，共 ${count} 步`,
};
</script>

<template>
  <XhTourRoot
    v-slot="{ setOpen, lastStep }"
    :steps="steps"
    :translations="translations"
  >
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <XhButton id="tour-basic-search" variant="outline">搜索</XhButton>
      <XhButton id="tour-basic-filter" variant="outline">筛选</XhButton>
      <XhButton id="tour-basic-export" variant="outline">导出</XhButton>
      <XhButton variant="solid" @click="setOpen(true)">开始引导</XhButton>
    </div>

    <XhTourBackdrop />
    <XhTourSpotlight />
    <XhTourPositioner>
      <XhTourContent>
        <XhTourTitle />
        <XhTourDescription />
        <XhTourProgressText />
        <XhTourProgressIndicator />
        <div style="display: flex; align-items: center; gap: 8px">
          <XhTourPrevTrigger>上一步</XhTourPrevTrigger>
          <XhTourNextTrigger>
            {{
              lastStep ? "完成" : "下一步"
            }}
          </XhTourNextTrigger>
          <XhTourSkipTrigger>跳过</XhTourSkipTrigger>
        </div>
        <XhTourCloseTrigger />
        <XhTourArrow />
      </XhTourContent>
    </XhTourPositioner>
  </XhTourRoot>
</template>
```

```html
<xh-tour id="tour-basic">
  <div data-xh-part="root">
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <xh-button variant="outline"><button id="tour-basic-search" data-xh-part="root">搜索</button></xh-button>
      <xh-button variant="outline"><button id="tour-basic-filter" data-xh-part="root">筛选</button></xh-button>
      <xh-button variant="outline"><button id="tour-basic-export" data-xh-part="root">导出</button></xh-button>
      <xh-button variant="solid">
        <button data-xh-part="root" id="tour-basic-start">开始引导</button>
      </xh-button>
    </div>

    <div data-xh-part="backdrop"></div>
    <div data-xh-part="spotlight"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title"></h3>
        <p data-xh-part="description"></p>
        <p data-xh-part="progress-text"></p>
        <div data-xh-part="progress-indicator">
          <div data-xh-part="progress-dot" index="0"></div>
          <div data-xh-part="progress-dot" index="1"></div>
          <div data-xh-part="progress-dot" index="2"></div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px">
          <button data-xh-part="prev-trigger">上一步</button>
          <button data-xh-part="next-trigger" id="tour-basic-next">
            下一步
          </button>
          <button data-xh-part="skip-trigger">跳过</button>
        </div>
        <button data-xh-part="close-trigger"></button>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </div>
</xh-tour>

<script type="module">
  const tour = document.getElementById("tour-basic");

  tour.steps = [
    {
      id: "search",
      target: "#tour-basic-search",
      title: "全站搜索",
      description: "按名称或编号找记录，支持拼音首字母。",
      placement: "bottom",
    },
    {
      id: "filter",
      target: "#tour-basic-filter",
      title: "筛选",
      description: "按状态与时间区间收窄结果，条件会记在本地。",
      placement: "bottom",
    },
    {
      id: "export",
      target: "#tour-basic-export",
      title: "导出",
      description: "导出当前筛选后的全部数据，走后台队列。",
      placement: "bottom-end",
    },
  ];
  tour.translations = {
    close: "关闭",
    progress: (step, count) => `第 ${step} 步，共 ${count} 步`,
  };

  document.getElementById("tour-basic-start").addEventListener("click", () => {
    tour.open = true;
  });
  tour.addEventListener("open-change", (event) => {
    tour.open = event.detail.open;
  });

  const next = document.getElementById("tour-basic-next");
  tour.addEventListener("value-change", (event) => {
    next.textContent =
      event.detail.value === tour.steps.length - 1 ? "完成" : "下一步";
  });
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="tour"`：**`root`** · `backdrop` · `spotlight` · `positioner` · **`content`** · `title` · `description` · `progress-text` · `progress-indicator` · `progress-dot` · `prev-trigger` · `next-trigger` · `skip-trigger` · `close-trigger` · `arrow`

## 示例

### 居中步骤

用于引导的开场与结束

```vue
<script setup lang="ts">
import {
  XhButton,
  XhTourArrow,
  XhTourBackdrop,
  XhTourCloseTrigger,
  XhTourContent,
  XhTourDescription,
  XhTourNextTrigger,
  XhTourPositioner,
  XhTourPrevTrigger,
  XhTourProgressText,
  XhTourRoot,
  XhTourSkipTrigger,
  XhTourSpotlight,
  XhTourTitle,
} from "@xihan-ui/vue";

const steps = [
  {
    id: "welcome",
    title: "欢迎",
    description: "这一步没有 target，浮层落在屏幕正中。",
  },
  {
    id: "inbox",
    target: "#tour-centered-inbox",
    title: "收件箱",
    description: "锚定到元素上，箭头与高亮框一并出现。",
  },
  {
    id: "done",
    title: "就这些",
    description: "最后一步同样不锚定，收个尾。",
  },
];

const translations = {
  close: "关闭",
  progress: (step: number, count: number) => `第 ${step} 步，共 ${count} 步`,
};
</script>

<template>
  <XhTourRoot
    v-slot="{ setOpen, lastStep }"
    :steps="steps"
    :spotlight-padding="12"
    :translations="translations"
  >
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <XhButton id="tour-centered-inbox" variant="outline">收件箱</XhButton>
      <XhButton variant="solid" @click="setOpen(true)">开始引导</XhButton>
    </div>

    <XhTourBackdrop />
    <XhTourSpotlight />
    <XhTourPositioner>
      <XhTourContent>
        <XhTourTitle />
        <XhTourDescription />
        <XhTourProgressText />
        <div style="display: flex; align-items: center; gap: 8px">
          <XhTourPrevTrigger>上一步</XhTourPrevTrigger>
          <XhTourNextTrigger>{{ lastStep ? "完成" : "下一步" }}</XhTourNextTrigger>
          <XhTourSkipTrigger>跳过</XhTourSkipTrigger>
        </div>
        <XhTourCloseTrigger />
        <XhTourArrow />
      </XhTourContent>
    </XhTourPositioner>
  </XhTourRoot>
</template>
```

```html
<xh-tour id="tour-centered" spotlight-padding="12">
  <div data-xh-part="root">
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <xh-button variant="outline"><button id="tour-centered-inbox" data-xh-part="root">收件箱</button></xh-button>
      <xh-button variant="solid">
        <button data-xh-part="root" id="tour-centered-start">开始引导</button>
      </xh-button>
    </div>

    <div data-xh-part="backdrop"></div>
    <div data-xh-part="spotlight"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title"></h3>
        <p data-xh-part="description"></p>
        <p data-xh-part="progress-text"></p>
        <div style="display: flex; align-items: center; gap: 8px">
          <button data-xh-part="prev-trigger">上一步</button>
          <button data-xh-part="next-trigger" id="tour-centered-next">下一步</button>
          <button data-xh-part="skip-trigger">跳过</button>
        </div>
        <button data-xh-part="close-trigger"></button>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </div>
</xh-tour>

<script type="module">
  const tour = document.getElementById("tour-centered");

  tour.steps = [
    {
      id: "welcome",
      title: "欢迎",
      description: "这一步没有 target，浮层落在屏幕正中。",
    },
    {
      id: "inbox",
      target: "#tour-centered-inbox",
      title: "收件箱",
      description: "锚定到元素上，箭头与高亮框一并出现。",
    },
    {
      id: "done",
      title: "就这些",
      description: "最后一步同样不锚定，收个尾。",
    },
  ];
  tour.translations = {
    close: "关闭",
    progress: (step, count) => `第 ${step} 步，共 ${count} 步`,
  };

  document.getElementById("tour-centered-start").addEventListener("click", () => {
    tour.open = true;
  });
  tour.addEventListener("open-change", (event) => {
    tour.open = event.detail.open;
  });

  const next = document.getElementById("tour-centered-next");
  tour.addEventListener("value-change", (event) => {
    next.textContent =
      event.detail.value === tour.steps.length - 1 ? "完成" : "下一步";
  });
</script>
```

### 定位

为每一步选择合适的浮层方向

```vue
<script setup lang="ts">
import {
  XhButton,
  XhTourArrow,
  XhTourBackdrop,
  XhTourCloseTrigger,
  XhTourContent,
  XhTourDescription,
  XhTourNextTrigger,
  XhTourPositioner,
  XhTourPrevTrigger,
  XhTourProgressText,
  XhTourRoot,
  XhTourSpotlight,
  XhTourTitle,
} from "@xihan-ui/vue";

const steps = [
  { id: "left", target: "#tour-placement-left", title: "左侧入口", description: "浮层显示在目标下方。", placement: "bottom-start" as const },
  { id: "center", target: "#tour-placement-center", title: "中间入口", description: "浮层显示在目标上方。", placement: "top" as const },
  { id: "right", target: "#tour-placement-right", title: "右侧入口", description: "浮层显示在目标左侧。", placement: "left" as const },
];

const translations = {
  close: "关闭",
  progress: (step: number, count: number) => `第 ${step} 步，共 ${count} 步`,
};
</script>

<template>
  <XhTourRoot v-slot="{ setOpen, lastStep }" :steps="steps" :translations="translations">
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <XhButton id="tour-placement-left" variant="outline">左侧</XhButton>
      <XhButton id="tour-placement-center" variant="outline">中间</XhButton>
      <XhButton id="tour-placement-right" variant="outline">右侧</XhButton>
      <XhButton variant="solid" @click="setOpen(true)">查看定位</XhButton>
    </div>

    <XhTourBackdrop />
    <XhTourSpotlight />
    <XhTourPositioner>
      <XhTourContent>
        <XhTourTitle />
        <XhTourDescription />
        <XhTourProgressText />
        <div style="display: flex; align-items: center; gap: 8px">
          <XhTourPrevTrigger>上一步</XhTourPrevTrigger>
          <XhTourNextTrigger>{{ lastStep ? "完成" : "下一步" }}</XhTourNextTrigger>
        </div>
        <XhTourCloseTrigger />
        <XhTourArrow />
      </XhTourContent>
    </XhTourPositioner>
  </XhTourRoot>
</template>
```

```html
<xh-tour id="tour-placement">
  <div data-xh-part="root">
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <xh-button variant="outline"><button id="tour-placement-left" data-xh-part="root">左侧</button></xh-button>
      <xh-button variant="outline"><button id="tour-placement-center" data-xh-part="root">中间</button></xh-button>
      <xh-button variant="outline"><button id="tour-placement-right" data-xh-part="root">右侧</button></xh-button>
      <xh-button variant="solid"><button id="tour-placement-start" data-xh-part="root">查看定位</button></xh-button>
    </div>

    <div data-xh-part="backdrop"></div>
    <div data-xh-part="spotlight"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title"></h3>
        <p data-xh-part="description"></p>
        <p data-xh-part="progress-text"></p>
        <div style="display: flex; align-items: center; gap: 8px">
          <button data-xh-part="prev-trigger">上一步</button>
          <button id="tour-placement-next" data-xh-part="next-trigger">下一步</button>
        </div>
        <button data-xh-part="close-trigger"></button>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </div>
</xh-tour>

<script type="module">
  const tour = document.getElementById("tour-placement");
  const next = document.getElementById("tour-placement-next");

  tour.steps = [
    { id: "left", target: "#tour-placement-left", title: "左侧入口", description: "浮层显示在目标下方。", placement: "bottom-start" },
    { id: "center", target: "#tour-placement-center", title: "中间入口", description: "浮层显示在目标上方。", placement: "top" },
    { id: "right", target: "#tour-placement-right", title: "右侧入口", description: "浮层显示在目标左侧。", placement: "left" },
  ];
  tour.translations = {
    close: "关闭",
    progress: (step, count) => `第 ${step} 步，共 ${count} 步`,
  };

  document.getElementById("tour-placement-start").addEventListener("click", () => {
    tour.open = true;
  });
  tour.addEventListener("open-change", (event) => {
    tour.open = event.detail.open;
  });
  tour.addEventListener("value-change", (event) => {
    next.textContent = event.detail.value === tour.steps.length - 1 ? "完成" : "下一步";
  });
</script>
```

### 无遮罩

保留页面环境并突出目标

```vue
<script setup lang="ts">
import {
  XhButton,
  XhTourArrow,
  XhTourCloseTrigger,
  XhTourContent,
  XhTourDescription,
  XhTourNextTrigger,
  XhTourPositioner,
  XhTourPrevTrigger,
  XhTourProgressText,
  XhTourRoot,
  XhTourSpotlight,
  XhTourTitle,
} from "@xihan-ui/vue";

const steps = [
  { id: "search", target: "#tour-clear-search", title: "搜索", description: "输入关键词查找记录。" },
  { id: "filter", target: "#tour-clear-filter", title: "筛选", description: "按状态收窄结果。" },
];

const translations = {
  close: "关闭",
  progress: (step: number, count: number) => `第 ${step} 步，共 ${count} 步`,
};
</script>

<template>
  <XhTourRoot v-slot="{ setOpen, lastStep }" :steps="steps" :show-backdrop="false" :translations="translations">
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <XhButton id="tour-clear-search" variant="outline">搜索</XhButton>
      <XhButton id="tour-clear-filter" variant="outline">筛选</XhButton>
      <XhButton variant="solid" @click="setOpen(true)">开始引导</XhButton>
    </div>

    <XhTourSpotlight />
    <XhTourPositioner>
      <XhTourContent>
        <XhTourTitle />
        <XhTourDescription />
        <XhTourProgressText />
        <div style="display: flex; align-items: center; gap: 8px">
          <XhTourPrevTrigger>上一步</XhTourPrevTrigger>
          <XhTourNextTrigger>{{ lastStep ? "完成" : "下一步" }}</XhTourNextTrigger>
        </div>
        <XhTourCloseTrigger />
        <XhTourArrow />
      </XhTourContent>
    </XhTourPositioner>
  </XhTourRoot>
</template>
```

```html
<xh-tour id="tour-clear" show-backdrop="false">
  <div data-xh-part="root">
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <xh-button variant="outline"><button id="tour-clear-search" data-xh-part="root">搜索</button></xh-button>
      <xh-button variant="outline"><button id="tour-clear-filter" data-xh-part="root">筛选</button></xh-button>
      <xh-button variant="solid"><button id="tour-clear-start" data-xh-part="root">开始引导</button></xh-button>
    </div>

    <div data-xh-part="spotlight"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title"></h3>
        <p data-xh-part="description"></p>
        <p data-xh-part="progress-text"></p>
        <div style="display: flex; align-items: center; gap: 8px">
          <button data-xh-part="prev-trigger">上一步</button>
          <button id="tour-clear-next" data-xh-part="next-trigger">下一步</button>
        </div>
        <button data-xh-part="close-trigger"></button>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </div>
</xh-tour>

<script type="module">
  const tour = document.getElementById("tour-clear");
  const next = document.getElementById("tour-clear-next");

  tour.steps = [
    { id: "search", target: "#tour-clear-search", title: "搜索", description: "输入关键词查找记录。" },
    { id: "filter", target: "#tour-clear-filter", title: "筛选", description: "按状态收窄结果。" },
  ];
  tour.translations = {
    close: "关闭",
    progress: (step, count) => `第 ${step} 步，共 ${count} 步`,
  };

  document.getElementById("tour-clear-start").addEventListener("click", () => {
    tour.open = true;
  });
  tour.addEventListener("open-change", (event) => {
    tour.open = event.detail.open;
  });
  tour.addEventListener("value-change", (event) => {
    next.textContent = event.detail.value === tour.steps.length - 1 ? "完成" : "下一步";
  });
</script>
```

## 设计指引

### 何时使用

- 首次进入复杂页面时介绍关键操作。
- 新功能上线后提供一次性引导。

### 何时不用

- 界面结构本身不清晰时应先改进界面。
- 需要随时查看的说明使用帮助内容或[文字提示](./tooltip)。

### 特性

- 聚光灯突出目标，`spotlightPadding` 控制留白。
- 高亮框同步目标节点的实际圆角，直角与圆角目标保持各自轮廓。
- `autoScroll` 自动将目标滚动到可见区域。
- 无目标步骤在视口中居中，适合开场与结束。
- `showBackdrop=false` 关闭背景暗幕，但保留目标高亮环。
- 支持受控步序、完成和跳过回调。
- 气泡走 M4 sheet 三件套（1px 描边、不透明底、投影），与对话框同源；边界由描边承担，不只靠影分层。锚定步从贴着目标的那条边涨开入场，退场按 exit 档收拢。
- 末行三颗按钮与角落的关闭按钮走 Action Control 家族配方：下一步是整条引导的主线动作，显式 solid 品牌实心；上一步为中性描边，跳过为无壳 ghost；关闭按钮为 icon 档 ghost 面。悬停与按下沿画布承载阶梯换底并 0.97 缩放，Space / Enter 与触屏按住期间投影 `data-pressed`。
- 标题为 heading-3，说明文字为 13px 说明档；说明区是气泡里唯一让步的滚动面，滚到头不带动页面。进度圆点是 8px 正圆，当前那颗拉成 20px 胶囊。

### 组合

- 使用 `progress-text` 或 `progress-indicator` 展示进度。
- 使用 `prev-trigger`、`next-trigger` 与 `skip-trigger` 提供导航。

### 最佳实践

- 步数控制在三到五步。
- 从第一步开始提供跳过入口。
- 记录完成状态，避免重复展示。

### 反模式

- 不要强制用户完成引导。
- 不要指向尚未渲染的目标。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tour>` |
| Vue 组件 | `XhTourArrow` `XhTourBackdrop` `XhTourCloseTrigger` `XhTourContent` `XhTourDescription` `XhTourNextTrigger` `XhTourPositioner` `XhTourPrevTrigger` `XhTourProgressDot` `XhTourProgressIndicator` `XhTourProgressText` `XhTourRoot` `XhTourSkipTrigger` `XhTourSpotlight` `XhTourTitle` |
| 组合式函数 | `useTour` |
| 状态机 | `tourMachine` |
| 皮肤 | `@xihan-ui/styles/tour.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `steps` | `TourStep[]` |  | 步骤清单。它同时是步序的上界与读屏「第 m 步，共 n 步」的分母。 |
| `value` | `number` |  | 当前步序（0 起）。提供即受控：内部不再自行修改，只发 onValueChange。 |
| `defaultValue` | `number` |  | 非受控初值，默认 0。 |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  | 整份引导的首选放置位，默认 bottom；单步可用自己的 placement 覆盖。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  | 浮层与目标的间距（px）。 |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  | 层外交互关闭，默认 false：引导需经 skip 或 close 两个明确出口退出。 |
| `showBackdrop` | `boolean` |  | 绘制遮罩，默认 true。 |
| `spotlightPadding` | `number` |  | 高亮框在目标四周留出的空白（px），默认 8。 |
| `autoScroll` | `boolean` |  | 展开与换步时自动把目标滚进视口（nearest，已可见时不动），默认 true。 |
| `translations` | `Partial<TourTranslations>` |  |  |
| `onValueChange` | `(details: TourValueChangeDetails) => void` |  | 步序变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |
| `onOpenChange` | `(details: TourOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onComplete` | `(details: TourCompleteDetails) => void` |  | 末步再按下一步：先发它，再经 onOpenChange 关闭。 |
| `onSkip` | `(details: TourSkipDetails) => void` |  | 用户主动放弃（skip-trigger 或 Escape）：先发它，再经 onOpenChange 关闭。 |

### TourStep

`steps` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 稳定标识，写入 data-step-id；作者据此对应（埋点、按步定制渲染）。 |
| `target` | `string \| null` |  | 高亮目标的 CSS 选择器。null / 省略 / 查询不到节点都视为该步不锚定任何元素： 浮层居中、不绘制高亮框、不显示箭头。 |
| `title` | `string` |  |  |
| `description` | `string` |  |  |
| `placement` | `Placement` |  | 该步的首选放置位；未提供时沿用整份引导的 placement。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `TourOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `value-change` | `TourValueChangeDetails` | 步序变化；detail 为 `{ value: number }` |
| `complete` | `TourCompleteDetails` | 末步再按下一步；detail 为 `{ step: number }` |
| `skip` | `TourSkipDetails` | 用户放弃（跳过按钮或 Escape）；detail 为 `{ step: number }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTourRoot` | `default` | `TourRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhTourProgressDot` | `index` | `number \| string` | 是 | 圆点对应的步序，0 基；兼收字符串。 |
| `XhTourRoot` | `container` | `() => Element \| null` |  | 本实例三张 Tour 浮层的 Portal 容器；优先于应用级配置。 |
| `XhTourRoot` | `children` | `SlotChildren<TourRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `backdrop` | 'open' \| 'closed' |
| `spotlight` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `prev-trigger` | 'open' \| 'closed' |
| `next-trigger` | 'open' \| 'closed' |
| `skip-trigger` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `VALUE.SET` · `STEP.PREV` · `STEP.NEXT` · `SKIP` · `GEOMETRY.SYNC` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `PRESS.START` · `PRESS.END`

**判据**：`isOpenControlled` · `isLastStep` · `isLastStepOpenControlled` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `value` | `number` | 当前步序，恒在 [0, count - 1] 内；清单为空时为 0。 |
| `count` | `number` |  |
| `currentStep` | `TourStep \| null` | 当前步的声明；清单为空时为 null。 |
| `firstStep` | `boolean` | 停在首步：上一步按钮据此禁用。 |
| `lastStep` | `boolean` | 停在末步：下一步按钮据此更换文案（完成）。 |
| `anchored` | `boolean` | 该步锚定了页面元素：居中步为 false，此时不绘制高亮框也不显示箭头。 |
| `progressText` | `string` | 「第 m 步，共 n 步」。作者未编写 progress-text 的内容时由适配器填入。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: number) => void` | 直接跳到某一步；越界会被夹回 [0, count - 1]。 |
| `goToNextStep` | `() => void` | 末步再前进一步 = 完成：先发 onComplete，再关闭。 |
| `goToPrevStep` | `() => void` |  |
| `skip` | `() => void` | 放弃引导：先发 onSkip，再关闭。 |
| `remeasure` | `() => void` | 重新测量高亮框与浮层位置：目标节点被外部改动（换位、变尺寸）后调用它校准。 |
| `getRootProps` | `() => T['element']` |  |
| `getBackdropProps` | `() => T['element']` |  |
| `getSpotlightProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getProgressTextProps` | `() => T['element']` |  |
| `getProgressIndicatorProps` | `() => T['element']` |  |
| `getProgressDotProps` | `(props: TourProgressDotProps) => T['element']` |  |
| `getPrevTriggerProps` | `() => T['button']` |  |
| `getNextTriggerProps` | `() => T['button']` |  |
| `getSkipTriggerProps` | `() => T['button']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | open 且焦点在 content 上（不在按钮等控件上） | 走到下一步；停在末步时完成引导并关闭 |
| `Escape` | open 且 closeOnEscape | 放弃引导（发 onSkip）并关闭 |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | open | 一概不接管：既不换步也不阻止默认行为，留给页面滚动与读屏浏览 |
| `Tab` / `Shift+Tab` | open | 焦点陷在 content 内循环，跑出去会被拉回来 |
| `Enter` / `Space` | held in prev-trigger / next-trigger / skip-trigger / close-trigger | 按住期间该按钮投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或气泡收起撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `backdrop` | `aria-hidden` | 'true' |
| `spotlight` | `aria-hidden` | 'true' |
| `content` | `aria-describedby` | `description` 部件的 id |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-labelledby` | `title` 部件的 id |
| `content` | `aria-modal` | 'true' |
| `content` | `role` | 'dialog' |
| `progress-text` | `aria-live` | 'polite' |
| `progress-indicator` | `aria-hidden` | 'true' |
| `next-trigger` | `aria-label` | translations?.finish \| translations?.next |
| `close-trigger` | `aria-label` | translations?.close |
| `arrow` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/tour.css` 使用 `[data-scope="tour"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-step` | String(value) |
| `backdrop` | `data-position` | 'anchored' \| 'center' |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `spotlight` | `data-dimmed` | ''（条件成立时才出现） |
| `spotlight` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-position` | 'anchored' \| 'center' |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-step` | String(value) |
| `progress-text` | `data-step` | String(value) |
| `progress-indicator` | `data-count` | String(count) |
| `progress-indicator` | `data-step` | String(value) |
| `progress-dot` | `data-complete` | ''（条件成立时才出现） |
| `progress-dot` | `data-current` | ''（条件成立时才出现） |
| `progress-dot` | `data-index` | String(index) |
| `prev-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `prev-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `prev-trigger` | `data-state` | 'open' \| 'closed' |
| `prev-trigger` | `data-xh-action-control` | '' |
| `prev-trigger` | `data-xh-action-display` | 'always' |
| `prev-trigger` | `data-xh-action-profile` | 'text' |
| `prev-trigger` | `data-xh-action-size` | 'sm' |
| `prev-trigger` | `data-xh-action-variant` | 'outline' |
| `next-trigger` | `data-last` | ''（条件成立时才出现） |
| `next-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `next-trigger` | `data-state` | 'open' \| 'closed' |
| `next-trigger` | `data-xh-action-control` | '' |
| `next-trigger` | `data-xh-action-display` | 'always' |
| `next-trigger` | `data-xh-action-profile` | 'text' |
| `next-trigger` | `data-xh-action-size` | 'sm' |
| `next-trigger` | `data-xh-action-variant` | 'solid' |
| `skip-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `skip-trigger` | `data-state` | 'open' \| 'closed' |
| `skip-trigger` | `data-xh-action-control` | '' |
| `skip-trigger` | `data-xh-action-display` | 'always' |
| `skip-trigger` | `data-xh-action-profile` | 'text' |
| `skip-trigger` | `data-xh-action-size` | 'sm' |
| `skip-trigger` | `data-xh-action-variant` | 'ghost' |
| `close-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `close-trigger` | `data-xh-action-control` | '' |
| `close-trigger` | `data-xh-action-display` | 'always' |
| `close-trigger` | `data-xh-action-profile` | 'icon' |
| `close-trigger` | `data-xh-action-size` | 'sm' |
| `close-trigger` | `data-xh-action-variant` | 'ghost' |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-tour-action-radius` | `next-trigger`<br>`prev-trigger`<br>`skip-trigger` | `border-radius` | `default` | `--xh-shape-control` | tour 的 next-trigger、prev-trigger、skip-trigger 部件 border-radius 覆盖槽。 |
| `--xh-tour-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` | tour 的 arrow 部件 --xh-_overlay-arrow-size 覆盖槽。 |
| `--xh-tour-backdrop-bg` | `backdrop` | `background` | `default` | `--xh-bg-overlay` | tour 的 backdrop 部件 background 覆盖槽。 |
| `--xh-tour-backdrop-layer` | `backdrop` | `z-index` | `default` | `--xh-_layer` | tour 的 backdrop 部件 z-index 覆盖槽。 |
| `--xh-tour-bg` | `arrow`<br>`content` | `background` | `default` | `--xh-material-elevated-bg` | tour 的 arrow、content 部件 background 覆盖槽。 |
| `--xh-tour-border` | `arrow`<br>`content` | `border` | `default` | `--xh-material-elevated-border` | tour 的 arrow、content 部件 border 覆盖槽。 |
| `--xh-tour-close-bg-active` | `close-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | tour 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-tour-close-bg-hover` | `close-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | tour 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-tour-close-fg` | `close-trigger` | `color` | `default` | `--xh-fg-muted` | tour 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-tour-close-fg-hover` | `close-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed` | tour 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-tour-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | tour 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-tour-close-size` | `close-trigger`<br>`content`<br>`title` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default`<br>`has([data-scope='tour'][data-part='close-trigger'])`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size`<br>`--xh-control-h-sm` | tour 的 close-trigger、content、title 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-tour-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | tour 的 description 部件 color 覆盖槽。 |
| `--xh-tour-fg` | `content`<br>`root` | `color` | `default` | `--xh-fg-default`<br>`--xh-material-elevated-fg` | tour 的 content、root 部件 color 覆盖槽。 |
| `--xh-tour-gap` | `content` | `gap` | `default` | `--xh-space-2` | tour 的 content 部件 gap 覆盖槽。 |
| `--xh-tour-icon-size` | `close-trigger`<br>`content`<br>`next-trigger`<br>`prev-trigger`<br>`root`<br>`skip-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` | tour 的 close-trigger、content、next-trigger、prev-trigger、root、skip-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-tour-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` | tour 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-tour-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w-lg` | tour 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-tour-next-bg` | `next-trigger` | `background-color` | `default`<br>`focus-visible` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-rest` | tour 的 next-trigger 部件 background-color 覆盖槽。 |
| `--xh-tour-next-bg-hover` | `next-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | tour 的 next-trigger 部件 background-color 覆盖槽。 |
| `--xh-tour-next-fg` | `next-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | tour 的 next-trigger 部件 color 覆盖槽。 |
| `--xh-tour-next-shadow` | `next-trigger` | `box-shadow` | `default` | `none` | tour 的 next-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-tour-positioner-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | tour 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-tour-positioner-padding` | `positioner` | `padding` | `position=center` | `--xh-space-4` | tour 的 positioner 部件 padding 覆盖槽。 |
| `--xh-tour-progress-dot-bg` | `progress-dot` | `background` | `default` | `--xh-border-default` | tour 的 progress-dot 部件 background 覆盖槽。 |
| `--xh-tour-progress-dot-bg-complete` | `progress-dot` | `background` | `complete` | `--xh-border-strong` | tour 的 progress-dot 部件 background 覆盖槽。 |
| `--xh-tour-progress-dot-bg-current` | `progress-dot` | `background` | `current` | `--xh-bg-brand` | tour 的 progress-dot 部件 background 覆盖槽。 |
| `--xh-tour-progress-fg` | `progress-text` | `color` | `default` | `--xh-fg-subtle` | tour 的 progress-text 部件 color 覆盖槽。 |
| `--xh-tour-progress-font-size` | `progress-text` | `font-size` | `default` | `--xh-text-caption-size` | tour 的 progress-text 部件 font-size 覆盖槽。 |
| `--xh-tour-progress-indicator-gap` | `progress-indicator` | `gap` | `default` | `--xh-space-1` | tour 的 progress-indicator 部件 gap 覆盖槽。 |
| `--xh-tour-px` | `content` | `padding-inline` | `default` | `--xh-surface-px-md` | tour 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-tour-py` | `content` | `padding-block` | `default` | `--xh-surface-py-md` | tour 的 content 部件 padding-block 覆盖槽。 |
| `--xh-tour-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | tour 的 content 部件 border-radius 覆盖槽。 |
| `--xh-tour-shadow` | `content` | `box-shadow` | `default` | `--xh-material-elevated-shadow` | tour 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-tour-skip-trigger-px` | `next-trigger`<br>`prev-trigger`<br>`skip-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | tour 的 next-trigger、prev-trigger、skip-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-tour-spotlight-layer` | `spotlight` | `z-index` | `default` | `--xh-_layer` | tour 的 spotlight 部件 z-index 覆盖槽。 |
| `--xh-tour-spotlight-radius` | `spotlight` | `border-radius` | `default` | `--xh-_tour-spotlight-radius` | tour 的 spotlight 部件 border-radius 覆盖槽。 |
| `--xh-tour-spotlight-ring` | `spotlight` | `box-shadow` | `default` | `--xh-ring-focus` | tour 的 spotlight 部件 box-shadow 覆盖槽。 |
| `--xh-tour-spotlight-shroud` | `spotlight` | `box-shadow` | `dimmed` | `--xh-bg-overlay` | tour 的 spotlight 部件 box-shadow 覆盖槽。 |
| `--xh-tour-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | tour 的 title 部件 color 覆盖槽。 |
| `--xh-tour-title-font-size` | `title` | `font-size` | `default` | `--xh-text-heading-3-size` | tour 的 title 部件 font-size 覆盖槽。 |
| `--xh-tour-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-heading-3-weight` | tour 的 title 部件 font-weight 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-tour-spotlight-in` · `xh-tour-spotlight-out` 随皮肤自带，不引用别处文件里的名字；共享关键帧 `xh-fade-in` · `xh-fade-out` · `xh-overlay-pop-in` · `xh-pop-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`background-color` · `block-size` · `border-radius` · `inline-size` · `inset-block-start` · `inset-inline-start` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

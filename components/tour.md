来源：https://ui.docs.xihanfun.com/components/tour

# 引导 `tour`

一串聚光灯步骤，逐个指向界面上的元素并解释它。

## 何时使用

- 新功能上线、首次进入复杂界面时的一次性介绍。

## 何时不用

- 界面本身不好懂：改界面，别用引导补丁。
- 用户需要随时查阅的说明：写进帮助或[文字提示](./tooltip)。

## 特性

- 聚光灯把目标从遮罩里挖出来，`spotlightPadding` 决定挖多大。
- `autoScroll` 把目标滚进视野。
- 可以有居中的无目标步（开场与结束）。
- 步序与展开都可受控，另有完成与跳过两个回调。

## 示例

### 基础用法

steps 是唯一事实源，组件只按下标取用；每步的 target 是一个 CSS 选择器，高亮框与浮层都锚在它上面

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

const panel
  = "padding: 8px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px";
</script>

<template>
  <XhTourRoot
    v-slot="{ setOpen, lastStep }"
    :steps="steps"
    :translations="translations"
  >
    <div style="display: grid; gap: 16px; justify-items: start">
      <div style="display: flex; flex-wrap: wrap; gap: 12px">
        <div id="tour-basic-search" :style="panel">搜索</div>
        <div id="tour-basic-filter" :style="panel">筛选</div>
        <div id="tour-basic-export" :style="panel">导出</div>
      </div>
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
    <div style="display: grid; gap: 16px; justify-items: start">
      <div style="display: flex; flex-wrap: wrap; gap: 12px">
        <div
          id="tour-basic-search"
          style="
            padding: 8px 14px;
            border: 1px solid var(--vp-c-divider);
            border-radius: 8px;
          "
        >
          搜索
        </div>
        <div
          id="tour-basic-filter"
          style="
            padding: 8px 14px;
            border: 1px solid var(--vp-c-divider);
            border-radius: 8px;
          "
        >
          筛选
        </div>
        <div
          id="tour-basic-export"
          style="
            padding: 8px 14px;
            border: 1px solid var(--vp-c-divider);
            border-radius: 8px;
          "
        >
          导出
        </div>
      </div>
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

  // 步骤清单与文案是对象，只走 property
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

  // 开合由宿主保管：按钮打开，组件要关时写回
  document.getElementById("tour-basic-start").addEventListener("click", () => {
    tour.open = true;
  });
  tour.addEventListener("open-change", (event) => {
    tour.open = event.detail.open;
  });

  // 末步那颗按钮改念「完成」
  const next = document.getElementById("tour-basic-next");
  tour.addEventListener("value-change", (event) => {
    next.textContent =
      event.detail.value === tour.steps.length - 1 ? "完成" : "下一步";
  });
</script>
```

### 居中步

不写 target 的那一步不锚定任何元素：浮层居中、不画高亮框、也不出箭头，适合当开场白与收尾

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
    v-slot="{ setOpen, lastStep, currentStep }"
    :steps="steps"
    :spotlight-padding="12"
    :translations="translations"
  >
    <div style="display: grid; gap: 16px; justify-items: start">
      <div
        id="tour-centered-inbox"
        style="
          padding: 8px 14px;
          border: 1px solid var(--vp-c-divider);
          border-radius: 8px;
        "
      >
        收件箱
      </div>
      <XhButton variant="solid" @click="setOpen(true)">开始引导</XhButton>
      <span style="font-size: 13px; opacity: 0.75">
        当前步：{{ currentStep ? currentStep.id : "（未开始）" }}
      </span>
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
    <div style="display: grid; gap: 16px; justify-items: start">
      <div
        id="tour-centered-inbox"
        style="padding: 8px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px"
      >
        收件箱
      </div>
      <xh-button variant="solid">
        <button data-xh-part="root" id="tour-centered-start">开始引导</button>
      </xh-button>
      <span id="tour-centered-current" style="font-size: 13px; opacity: 0.75">
        当前步：welcome
      </span>
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

  // 头尾两步没有 target，浮层落在屏幕正中
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

  // 开合由宿主保管：按钮打开，组件要关时写回
  document.getElementById("tour-centered-start").addEventListener("click", () => {
    tour.open = true;
  });
  tour.addEventListener("open-change", (event) => {
    tour.open = event.detail.open;
  });

  // 外面这行文字跟着步序走
  const current = document.getElementById("tour-centered-current");
  const next = document.getElementById("tour-centered-next");
  tour.addEventListener("value-change", (event) => {
    current.textContent = `当前步：${tour.steps[event.detail.value].id}`;
    next.textContent =
      event.detail.value === tour.steps.length - 1 ? "完成" : "下一步";
  });
</script>
```

### 受控

传了 open 与 value 就由宿主说了算：内部不再自改，只发意图，浮层里的按钮与外面的进度读的是同一份状态

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
  XhTourRoot,
  XhTourSpotlight,
  XhTourTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

const steps = [
  {
    id: "list",
    target: "#tour-controlled-list",
    title: "列表",
    description: "记录都在这里。",
  },
  {
    id: "detail",
    target: "#tour-controlled-detail",
    title: "详情",
    description: "选中一条后在这块看明细。",
  },
  {
    id: "actions",
    target: "#tour-controlled-actions",
    title: "操作",
    description: "批量动作收在这一栏。",
  },
];

const open = ref(false);
const step = ref(0);
const log = ref("（未开始）");

const panel
  = "padding: 8px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px";

function start(from: number): void {
  step.value = from;
  open.value = true;
}

function onComplete(details: { step: number }): void {
  log.value = `走完了第 ${details.step + 1} 步`;
}

function onSkip(details: { step: number }): void {
  log.value = `在第 ${details.step + 1} 步放弃`;
}
</script>

<template>
  <XhTourRoot
    v-model:open="open"
    v-model:value="step"
    :steps="steps"
    @complete="onComplete"
    @skip="onSkip"
  >
    <div style="display: grid; gap: 16px; justify-items: start">
      <div style="display: flex; flex-wrap: wrap; gap: 12px">
        <div id="tour-controlled-list" :style="panel">列表</div>
        <div id="tour-controlled-detail" :style="panel">详情</div>
        <div id="tour-controlled-actions" :style="panel">操作</div>
      </div>
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px">
        <XhButton variant="solid" @click="start(0)">从头开始</XhButton>
        <XhButton variant="outline" @click="start(2)">直接跳到第 3 步</XhButton>
        <span style="font-size: 13px; opacity: 0.75">
          open={{ open }} · value={{ step }} · {{ log }}
        </span>
      </div>
    </div>

    <XhTourBackdrop />
    <XhTourSpotlight />
    <XhTourPositioner>
      <XhTourContent>
        <XhTourTitle />
        <XhTourDescription />
        <div style="display: flex; align-items: center; gap: 8px">
          <XhTourPrevTrigger>上一步</XhTourPrevTrigger>
          <XhTourNextTrigger>下一步</XhTourNextTrigger>
        </div>
        <XhTourCloseTrigger />
        <XhTourArrow />
      </XhTourContent>
    </XhTourPositioner>
  </XhTourRoot>
</template>
```

```html
<xh-tour id="tour-controlled" open="false" value="0">
  <div data-xh-part="root">
    <div style="display: grid; gap: 16px; justify-items: start">
      <div style="display: flex; flex-wrap: wrap; gap: 12px">
        <div
          id="tour-controlled-list"
          style="padding: 8px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px"
        >
          列表
        </div>
        <div
          id="tour-controlled-detail"
          style="padding: 8px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px"
        >
          详情
        </div>
        <div
          id="tour-controlled-actions"
          style="padding: 8px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px"
        >
          操作
        </div>
      </div>
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px">
        <xh-button variant="solid">
          <button data-xh-part="root" id="tour-controlled-from-start">从头开始</button>
        </xh-button>
        <xh-button variant="outline">
          <button data-xh-part="root" id="tour-controlled-from-third">
            直接跳到第 3 步
          </button>
        </xh-button>
        <span id="tour-controlled-readout" style="font-size: 13px; opacity: 0.75">
          open=false · value=0 · （未开始）
        </span>
      </div>
    </div>

    <div data-xh-part="backdrop"></div>
    <div data-xh-part="spotlight"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title"></h3>
        <p data-xh-part="description"></p>
        <div style="display: flex; align-items: center; gap: 8px">
          <button data-xh-part="prev-trigger">上一步</button>
          <button data-xh-part="next-trigger">下一步</button>
        </div>
        <button data-xh-part="close-trigger"></button>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </div>
</xh-tour>

<script type="module">
  const tour = document.getElementById("tour-controlled");
  const readout = document.getElementById("tour-controlled-readout");
  let log = "（未开始）";

  tour.steps = [
    {
      id: "list",
      target: "#tour-controlled-list",
      title: "列表",
      description: "记录都在这里。",
    },
    {
      id: "detail",
      target: "#tour-controlled-detail",
      title: "详情",
      description: "选中一条后在这块看明细。",
    },
    {
      id: "actions",
      target: "#tour-controlled-actions",
      title: "操作",
      description: "批量动作收在这一栏。",
    },
  ];

  function render() {
    readout.textContent = `open=${tour.open} · value=${tour.value} · ${log}`;
  }

  // 从第几步起都由宿主先落值，再打开
  function start(from) {
    tour.value = from;
    tour.open = true;
    render();
  }

  document
    .getElementById("tour-controlled-from-start")
    .addEventListener("click", () => start(0));
  document
    .getElementById("tour-controlled-from-third")
    .addEventListener("click", () => start(2));

  // 内部只发意图，落值全在这几个处理器里
  tour.addEventListener("open-change", (event) => {
    tour.open = event.detail.open;
    render();
  });
  tour.addEventListener("value-change", (event) => {
    tour.value = event.detail.value;
    render();
  });
  tour.addEventListener("complete", (event) => {
    log = `走完了第 ${event.detail.value + 1} 步`;
    render();
  });
  tour.addEventListener("skip", (event) => {
    log = `在第 ${event.detail.value + 1} 步放弃`;
    render();
  });
</script>
```

### 按步定制正文

标题与说明之外，正文按当前步的 id 换成自己的一块内容；showBackdrop 关掉那层压暗，引导与页面一起看

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
  XhTourSkipTrigger,
  XhTourSpotlight,
  XhTourTitle,
} from "@xihan-ui/vue";

const steps = [
  {
    id: "search",
    target: "#tour-per-step-search",
    title: "全站搜索",
    description: "按名称或编号找记录。",
  },
  {
    id: "filter",
    target: "#tour-per-step-filter",
    title: "筛选",
    description: "条件会记在本地，下次进来还在。",
  },
  {
    id: "export",
    target: "#tour-per-step-export",
    title: "导出",
    description: "导出当前筛选后的全部数据。",
  },
];

// 各步自己的那块正文：键就是 steps 里的 id
const tips: Record<string, string[]> = {
  search: ["支持拼音首字母", "编号可以只输后六位"],
  filter: ["状态与时间区间可以叠加", "清空条件用一次「重置」"],
  export: ["走后台队列，导完站内信通知", "单次上限十万行"],
};

const translations = {
  close: "关闭",
  progress: (step: number, count: number) => `第 ${step} 步，共 ${count} 步`,
};

const panel = "padding: 8px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px";
</script>

<template>
  <XhTourRoot
    v-slot="{ setOpen, lastStep, currentStep }"
    :steps="steps"
    :show-backdrop="false"
    :translations="translations"
  >
    <div style="display: grid; gap: 16px; justify-items: start">
      <div style="display: flex; flex-wrap: wrap; gap: 12px">
        <div id="tour-per-step-search" :style="panel">搜索</div>
        <div id="tour-per-step-filter" :style="panel">筛选</div>
        <div id="tour-per-step-export" :style="panel">导出</div>
      </div>
      <XhButton variant="solid" @click="setOpen(true)">开始引导</XhButton>
    </div>

    <XhTourSpotlight />
    <XhTourPositioner>
      <XhTourContent>
        <XhTourTitle />
        <XhTourDescription />
        <!-- 按当前步换的那一块：标题与说明照旧由组件按 steps 填 -->
        <ul v-if="currentStep" style="margin: 0; padding-inline-start: 18px">
          <li v-for="tip in tips[currentStep.id] ?? []" :key="tip">{{ tip }}</li>
        </ul>
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
<xh-tour id="tour-per-step" show-backdrop="false">
  <div data-xh-part="root">
    <div style="display: grid; gap: 16px; justify-items: start">
      <div style="display: flex; flex-wrap: wrap; gap: 12px">
        <div
          id="tour-per-step-search"
          style="padding: 8px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px"
        >
          搜索
        </div>
        <div
          id="tour-per-step-filter"
          style="padding: 8px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px"
        >
          筛选
        </div>
        <div
          id="tour-per-step-export"
          style="padding: 8px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px"
        >
          导出
        </div>
      </div>
      <xh-button variant="solid">
        <button data-xh-part="root" id="tour-per-step-start">开始引导</button>
      </xh-button>
    </div>

    <div data-xh-part="spotlight"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title"></h3>
        <p data-xh-part="description"></p>
        <!-- 按当前步换的那一块：标题与说明照旧由元素按 steps 填 -->
        <ul id="tour-per-step-tips" style="margin: 0; padding-inline-start: 18px"></ul>
        <p data-xh-part="progress-text"></p>
        <div style="display: flex; align-items: center; gap: 8px">
          <button data-xh-part="prev-trigger">上一步</button>
          <button data-xh-part="next-trigger">下一步</button>
          <button data-xh-part="skip-trigger">跳过</button>
        </div>
        <button data-xh-part="close-trigger"></button>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </div>
</xh-tour>

<script type="module">
  const tour = document.getElementById("tour-per-step");
  const tipList = document.getElementById("tour-per-step-tips");

  tour.steps = [
    {
      id: "search",
      target: "#tour-per-step-search",
      title: "全站搜索",
      description: "按名称或编号找记录。",
    },
    {
      id: "filter",
      target: "#tour-per-step-filter",
      title: "筛选",
      description: "条件会记在本地，下次进来还在。",
    },
    {
      id: "export",
      target: "#tour-per-step-export",
      title: "导出",
      description: "导出当前筛选后的全部数据。",
    },
  ];

  tour.translations = {
    close: "关闭",
    progress: (step, count) => `第 ${step} 步，共 ${count} 步`,
  };

  // 各步自己的那块正文：键就是 steps 里的 id
  const tips = {
    search: ["支持拼音首字母", "编号可以只输后六位"],
    filter: ["状态与时间区间可以叠加", "清空条件用一次「重置」"],
    export: ["走后台队列，导完站内信通知", "单次上限十万行"],
  };

  function paint(index) {
    const step = tour.steps[index];
    tipList.replaceChildren(
      ...(tips[step?.id] ?? []).map((tip) => {
        const li = document.createElement("li");
        li.textContent = tip;
        return li;
      }),
    );
  }

  paint(0);

  // 开合由宿主保管：按钮打开，元素要关时写回
  document.getElementById("tour-per-step-start").addEventListener("click", () => {
    tour.open = true;
  });
  tour.addEventListener("open-change", (event) => {
    tour.open = event.detail.open;
  });

  tour.addEventListener("value-change", (event) => paint(event.detail.value));
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tour>` |
| Vue 组件 | `XhTourArrow` `XhTourBackdrop` `XhTourCloseTrigger` `XhTourContent` `XhTourDescription` `XhTourNextTrigger` `XhTourPositioner` `XhTourPrevTrigger` `XhTourProgressDot` `XhTourProgressIndicator` `XhTourProgressText` `XhTourRoot` `XhTourSkipTrigger` `XhTourSpotlight` `XhTourTitle` |
| 组合式函数 | `useTour` |
| 状态机 | `tourMachine` |
| 皮肤 | `@xihan-ui/styles/tour.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="tour"`：**`root`** · `backdrop` · `spotlight` · `positioner` · **`content`** · `title` · `description` · `progress-text` · `progress-indicator` · `progress-dot` · `prev-trigger` · `next-trigger` · `skip-trigger` · `close-trigger` · `arrow`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `steps` | `TourStep[]` |  | 步骤清单。它同时是步序的上界与读屏"第 m 步，共 n 步"的分母。 |
| `value` | `number` |  | 当前步序（0 起）。给定即受控：内部不再自改，只发 onValueChange。 |
| `defaultValue` | `number` |  | 非受控初值，默认 0。 |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  | 整份引导的首选放置位，默认 bottom；单步可用自己的 placement 覆盖。 |
| `dir` | `Direction` |  | 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  | 浮层与目标的间距（px）。 |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  | 层外交互关闭，默认 false：引导要退出得走 skip 或 close 这两个明确出口。 |
| `showBackdrop` | `boolean` |  | 画遮罩，默认 true。 |
| `spotlightPadding` | `number` |  | 高亮框在目标四周留出的空白（px），默认 8。 |
| `autoScroll` | `boolean` |  | 展开与换步时自动把目标滚进视口（nearest，已可见时不动），默认 true。 |
| `translations` | `Partial<TourTranslations>` |  |  |
| `onValueChange` | `(details: TourValueChangeDetails) => void` |  | 步序变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onOpenChange` | `(details: TourOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onComplete` | `(details: TourCompleteDetails) => void` |  | 末步再按"下一步"：先发它，再按 onOpenChange 关闭。 |
| `onSkip` | `(details: TourSkipDetails) => void` |  | 用户主动放弃（skip-trigger 或 Escape）：先发它，再按 onOpenChange 关闭。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `TourOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `value-change` | `TourValueChangeDetails` | 步序变化；detail 为 `{ value: number }` |
| `complete` | `TourCompleteDetails` | 末步再按下一步；detail 为 `{ step: number }` |
| `skip` | `TourSkipDetails` | 用户放弃（跳过按钮或 Escape）；detail 为 `{ step: number }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTourRoot` | `default` | `TourRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

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

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `VALUE.SET` · `STEP.PREV` · `STEP.NEXT` · `SKIP` · `GEOMETRY.SYNC` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled` · `isLastStep` · `isLastStepOpenControlled`

## connect API

`useTour` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `value` | `number` | 当前步序，恒在 [0, count - 1] 内；清单为空时为 0。 |
| `count` | `number` |  |
| `currentStep` | `TourStep \| null` | 当前步的声明；清单为空时为 null。 |
| `firstStep` | `boolean` | 停在首步：上一步按钮据此禁用。 |
| `lastStep` | `boolean` | 停在末步：下一步按钮据此改文案（"完成"）。 |
| `anchored` | `boolean` | 这一步锚定了页面元素：居中步为 false，此时不画高亮框也不出箭头。 |
| `progressText` | `string` | "第 m 步，共 n 步"。作者没写 progress-text 的内容时由适配器填上。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: number) => void` | 直接跳到某一步；越界会被夹回 [0, count - 1]。 |
| `goToNextStep` | `() => void` | 末步再走一步 = 完成：先发 onComplete，再关闭。 |
| `goToPrevStep` | `() => void` |  |
| `skip` | `() => void` | 放弃引导：先发 onSkip，再关闭。 |
| `remeasure` | `() => void` | 重量高亮框与浮层位置：目标节点被外部改动（换位、变尺寸）后调它校准。 |
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

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | open 且焦点在 content 上（不在按钮等控件上） | 走到下一步；停在末步时完成引导并关闭 |
| `Escape` | open 且 closeOnEscape | 放弃引导（发 onSkip）并关闭 |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | open | 一概不接管：既不换步也不阻止默认行为，留给页面滚动与读屏浏览 |
| `Tab` / `Shift+Tab` | open | 焦点陷在 content 内循环，跑出去会被拉回来 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `backdrop` | `aria-hidden` | 'true' |
| `spotlight` | `aria-hidden` | 'true' |
| `content` | `aria-describedby` | `description` 部件的 id |
| `content` | `aria-labelledby` | `title` 部件的 id |
| `content` | `aria-modal` | 'true' |
| `content` | `role` | 'dialog' |
| `progress-text` | `aria-live` | 'polite' |
| `progress-indicator` | `aria-hidden` | 'true' |
| `next-trigger` | `aria-label` | translations?.finish \| translations?.next |
| `close-trigger` | `aria-label` | translations?.close |
| `arrow` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/tour.css` 按部件选择：`[data-scope="tour"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-step` | String(value) |
| `backdrop` | `data-state` | 'open' \| 'closed' |
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
| `prev-trigger` | `data-state` | 'open' \| 'closed' |
| `next-trigger` | `data-last` | ''（条件成立时才出现） |
| `next-trigger` | `data-state` | 'open' \| 'closed' |
| `skip-trigger` | `data-state` | 'open' \| 'closed' |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-tour-action-radius` · `--xh-tour-arrow-size` · `--xh-tour-backdrop-bg` · `--xh-tour-backdrop-layer` · `--xh-tour-bg` · `--xh-tour-border` · `--xh-tour-close-bg-active` · `--xh-tour-close-bg-hover` · `--xh-tour-close-fg` · `--xh-tour-close-fg-hover` · `--xh-tour-close-radius` · `--xh-tour-close-size` · `--xh-tour-description-fg` · `--xh-tour-fg` · `--xh-tour-gap` · `--xh-tour-icon-size` · `--xh-tour-max-h` · `--xh-tour-max-w` · `--xh-tour-next-bg` · `--xh-tour-next-bg-hover` · `--xh-tour-next-fg` · `--xh-tour-next-shadow` · `--xh-tour-positioner-layer` · `--xh-tour-positioner-padding` · `--xh-tour-progress-dot-bg` · `--xh-tour-progress-dot-bg-complete` · `--xh-tour-progress-dot-bg-current` · `--xh-tour-progress-fg` · `--xh-tour-progress-font-size` · `--xh-tour-progress-indicator-gap` · `--xh-tour-px` · `--xh-tour-py` · `--xh-tour-radius` · `--xh-tour-shadow` · `--xh-tour-skip-trigger-px` · `--xh-tour-spotlight-layer` · `--xh-tour-spotlight-radius` · `--xh-tour-spotlight-ring` · `--xh-tour-spotlight-shroud` · `--xh-tour-title-fg` · `--xh-tour-title-font-size` · `--xh-tour-title-font-weight`

## 动效

关键帧 `xh-fade-in` · `xh-fade-out` · `xh-overlay-pop-in` · `xh-pop-out` · `xh-tour-spotlight-in` · `xh-tour-spotlight-out` 随皮肤自带，不引用别处文件里的名字；`background` · `background-color` · `block-size` · `color` · `inline-size` · `inset-block-start` · `inset-inline-start` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[对话框](./dialog)配合做开场；结束后引导用户去[空状态](./empty-state)那一页或具体功能。

## 最佳实践

- 步数压到三到五步，多了没人走完。
- 跳过入口从第一步就要有，且要显眼。
- 只讲一次，记住用户已经看过。

## 反模式

- 强制走完不许跳过。
- 引导目标在当前视口里不存在（还没渲染出来），聚光灯挖了个空。

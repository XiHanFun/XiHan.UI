来源：https://ui.docs.xihanfun.com/components/tool-call

# ToolCall `工具调用`

一次工具调用的卡片：阶段、参数与结果，跑起来自动展开、结束自动收起，用户动手过一次就不再自动。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tool-call" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tool-call.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tool-call" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tool-call" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tool-call.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

等人批准不是在跑：闸门常驻在开关与详情之间，不会被折叠藏起来

```vue
<script setup lang="ts">
import type { ToolCallPhase } from "@xihan-ui/headless";
import {
  XhToolCallApproval,
  XhToolCallContent,
  XhToolCallIndicator,
  XhToolCallLabel,
  XhToolCallOutput,
  XhToolCallRoot,
  XhToolCallStatus,
  XhToolCallTrigger,
} from "@xihan-ui/vue";

const phases: ToolCallPhase[] = [
  "input-streaming",
  "input-available",
  "awaiting-approval",
  "output-available",
  "output-error",
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <XhToolCallRoot v-for="phase in phases" :key="phase" :phase="phase">
      <XhToolCallTrigger>
        <XhToolCallIndicator />
        <XhToolCallLabel>search</XhToolCallLabel>
        <XhToolCallStatus />
      </XhToolCallTrigger>
      <XhToolCallApproval>这一步要先经你批准。</XhToolCallApproval>
      <XhToolCallContent>
        <XhToolCallOutput>找到 3 条结果。</XhToolCallOutput>
      </XhToolCallContent>
    </XhToolCallRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 8px">
  <xh-tool-call phase="input-streaming">
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">search</span>
        <span data-xh-part="status"></span>
      </button>
      <div data-xh-part="approval">这一步要先经你批准。</div>
      <div data-xh-part="content">
        <div data-xh-part="output">找到 3 条结果。</div>
      </div>
    </div>
  </xh-tool-call>
  <xh-tool-call phase="input-available">
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">search</span>
        <span data-xh-part="status"></span>
      </button>
      <div data-xh-part="approval">这一步要先经你批准。</div>
      <div data-xh-part="content">
        <div data-xh-part="output">找到 3 条结果。</div>
      </div>
    </div>
  </xh-tool-call>
  <xh-tool-call phase="awaiting-approval">
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">search</span>
        <span data-xh-part="status"></span>
      </button>
      <div data-xh-part="approval">这一步要先经你批准。</div>
      <div data-xh-part="content">
        <div data-xh-part="output">找到 3 条结果。</div>
      </div>
    </div>
  </xh-tool-call>
  <xh-tool-call phase="output-available">
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">search</span>
        <span data-xh-part="status"></span>
      </button>
      <div data-xh-part="approval">这一步要先经你批准。</div>
      <div data-xh-part="content">
        <div data-xh-part="output">找到 3 条结果。</div>
      </div>
    </div>
  </xh-tool-call>
  <xh-tool-call phase="output-error">
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">search</span>
        <span data-xh-part="status"></span>
      </button>
      <div data-xh-part="approval">这一步要先经你批准。</div>
      <div data-xh-part="content">
        <div data-xh-part="output">找到 3 条结果。</div>
      </div>
    </div>
  </xh-tool-call>
</div>
```

## 示例

### 自动开合与锁存

跑起来自动展开、结束自动收起；你手动开合过一次之后，阶段怎么变都不再自动

```vue
<script setup lang="ts">
import type { ToolCallPhase } from "@xihan-ui/headless";
import {
  XhCodeViewCode,
  XhCodeViewPre,
  XhCodeViewRoot,
  XhToolCallContent,
  XhToolCallIndicator,
  XhToolCallInput,
  XhToolCallLabel,
  XhToolCallRoot,
  XhToolCallStatus,
  XhToolCallTrigger,
} from "@xihan-ui/vue";
import { onBeforeUnmount, onMounted, ref } from "vue";

const phase = ref<ToolCallPhase>("input-streaming");
const lastSource = ref("");

// 三秒一轮：在跑 → 完成 → 在跑
let timer = 0;
function tick() {
  phase.value = phase.value === "input-streaming" ? "output-available" : "input-streaming";
  timer = window.setTimeout(tick, 3000);
}
// 挂载后才起：<script setup> 顶层在服务端渲染时也执行，那里没有 window
onMounted(() => {
  timer = window.setTimeout(tick, 3000);
});

onBeforeUnmount(() => window.clearTimeout(timer));
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <XhToolCallRoot :phase="phase" @open-change="lastSource = $event.source">
      <XhToolCallTrigger>
        <XhToolCallIndicator />
        <XhToolCallLabel>read_file</XhToolCallLabel>
        <XhToolCallStatus />
      </XhToolCallTrigger>
      <XhToolCallContent>
        <XhToolCallInput>
          <!-- 参数在流式期是半截 JSON，complete 接成「阶段不是参数在传」 -->
          <XhCodeViewRoot
            code="{ &quot;path&quot;: &quot;src/index.ts&quot; }"
            lang="json"
            :complete="phase !== 'input-streaming'"
          >
            <XhCodeViewPre>
              <XhCodeViewCode />
            </XhCodeViewPre>
          </XhCodeViewRoot>
        </XhToolCallInput>
      </XhToolCallContent>
    </XhToolCallRoot>
    <p style="margin: 0;">上一次开合来自：{{ lastSource || "还没动过" }}</p>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 8px">
  <xh-tool-call id="tool-call-auto" phase="input-streaming">
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">read_file</span>
        <span data-xh-part="status"></span>
      </button>
      <div data-xh-part="content">
        <div data-xh-part="input">
          <!-- 参数在流式期是半截 JSON，complete 接成「阶段不是参数在传」 -->
          <xh-code-view id="tool-call-auto-args" code='{ "path": "src/index.ts" }' code-lang="json">
            <div data-xh-part="root">
              <pre data-xh-part="pre"><code data-xh-part="code">{ "path": "src/index.ts" }</code></pre>
            </div>
          </xh-code-view>
        </div>
      </div>
    </div>
  </xh-tool-call>
  <p id="tool-call-auto-source" style="margin: 0">上一次开合来自：还没动过</p>
</div>

<script type="module">
  const card = document.getElementById("tool-call-auto");
  const args = document.getElementById("tool-call-auto-args");
  const line = document.getElementById("tool-call-auto-source");

  card.addEventListener("open-change", (event) => {
    line.textContent = `上一次开合来自：${event.detail.source}`;
  });

  // 三秒一轮：在跑 → 完成 → 在跑
  const tick = () => {
    if (!card.isConnected) return;
    const running = card.getAttribute("phase") === "input-streaming";
    card.setAttribute("phase", running ? "output-available" : "input-streaming");
    args.toggleAttribute("complete", running);
    setTimeout(tick, 3000);
  };
  setTimeout(tick, 3000);
</script>
```

### 摘要与耗时

详情收起时也看得见查了什么、跑了多久；两个时刻由宿主给，组件自己不读时钟

```vue
<script setup lang="ts">
import {
  XhToolCallContent,
  XhToolCallDuration,
  XhToolCallIndicator,
  XhToolCallLabel,
  XhToolCallOutput,
  XhToolCallRoot,
  XhToolCallStatus,
  XhToolCallSummary,
  XhToolCallTrigger,
} from "@xihan-ui/vue";

// 减号是 U+2212 而不是连字符：它与数字同宽，配等宽数位才不会左右挪
const calls = [
  {
    name: "search",
    summary: "{ \"query\": \"xihan ui 组件\" }",
    startTime: 0,
    endTime: 1240,
    output: "找到 3 条结果。",
  },
  {
    name: "apply_patch",
    summary: "+12 −3 src/index.ts",
    startTime: 0,
    endTime: 420,
    output: "已写入 1 个文件。",
  },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <XhToolCallRoot
      v-for="call in calls"
      :key="call.name"
      phase="output-available"
      :start-time="call.startTime"
      :end-time="call.endTime"
    >
      <template #default="{ durationMs }">
        <XhToolCallTrigger>
          <XhToolCallIndicator />
          <XhToolCallLabel>{{ call.name }}</XhToolCallLabel>
          <XhToolCallSummary>{{ call.summary }}</XhToolCallSummary>
          <XhToolCallStatus />
          <!-- 秒数由宿主现场代入，连接层只交出毫秒数 -->
          <XhToolCallDuration v-if="durationMs !== undefined">
            {{ (durationMs / 1000).toFixed(1) }}s
          </XhToolCallDuration>
        </XhToolCallTrigger>
        <XhToolCallContent>
          <XhToolCallOutput>{{ call.output }}</XhToolCallOutput>
        </XhToolCallContent>
      </template>
    </XhToolCallRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 8px">
  <xh-tool-call phase="output-available" start-time="0" end-time="1240">
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">search</span>
        <span data-xh-part="summary">{ "query": "xihan ui 组件" }</span>
        <span data-xh-part="status"></span>
        <!-- 秒数由宿主现场代入，连接层只交出毫秒数 -->
        <span data-xh-part="duration">1.2s</span>
      </button>
      <div data-xh-part="content">
        <div data-xh-part="output">找到 3 条结果。</div>
      </div>
    </div>
  </xh-tool-call>
  <xh-tool-call phase="output-available" start-time="0" end-time="420">
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">apply_patch</span>
        <!-- 减号是 U+2212 而不是连字符：它与数字同宽，配等宽数位才不会左右挪 -->
        <span data-xh-part="summary">+12 −3 src/index.ts</span>
        <span data-xh-part="status"></span>
        <span data-xh-part="duration">0.4s</span>
      </button>
      <div data-xh-part="content">
        <div data-xh-part="output">已写入 1 个文件。</div>
      </div>
    </div>
  </xh-tool-call>
</div>
```

### 多次调用分组

外面套一层手风琴当分组头：计数用等宽数位，整组开合归手风琴，卡片各管各的

```vue
<script setup lang="ts">
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
  XhToolCallContent,
  XhToolCallIndicator,
  XhToolCallLabel,
  XhToolCallOutput,
  XhToolCallRoot,
  XhToolCallStatus,
  XhToolCallSummary,
  XhToolCallTrigger,
} from "@xihan-ui/vue";

const calls = [
  { name: "search", summary: "\"折叠动画\"", output: "找到 3 条结果。" },
  { name: "read_file", summary: "src/tool-call.css", output: "读了 214 行。" },
  { name: "apply_patch", summary: "+12 −3 src/tool-call.css", output: "已写入 1 个文件。" },
];
</script>

<template>
  <div style="width: 100%; max-width: 480px">
    <XhAccordionRoot :default-value="['run']">
      <XhAccordionItem value="run">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>这一轮跑了的工具</span>
            <span style="display: flex; align-items: center; gap: 8px; font-size: 12px">
              <!-- 计数用等宽数位：数字变了也不会把指示器推着走 -->
              <span style="font-variant-numeric: tabular-nums">{{ calls.length }} 个</span>
              <XhAccordionIndicator />
            </span>
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>
          <div style="display: flex; flex-direction: column; gap: 8px">
            <XhToolCallRoot v-for="call in calls" :key="call.name" phase="output-available">
              <XhToolCallTrigger>
                <XhToolCallIndicator />
                <XhToolCallLabel>{{ call.name }}</XhToolCallLabel>
                <XhToolCallSummary>{{ call.summary }}</XhToolCallSummary>
                <XhToolCallStatus />
              </XhToolCallTrigger>
              <XhToolCallContent>
                <XhToolCallOutput>{{ call.output }}</XhToolCallOutput>
              </XhToolCallContent>
            </XhToolCallRoot>
          </div>
        </XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 480px">
  <xh-accordion id="tool-call-grouped">
    <div data-xh-part="root">
      <div data-xh-part="item" value="run">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>这一轮跑了的工具</span>
            <span
              style="display: flex; align-items: center; gap: 8px; font-size: 12px"
            >
              <!-- 计数用等宽数位：数字变了也不会把指示器推着走 -->
              <span style="font-variant-numeric: tabular-nums">3 个</span>
              <span data-xh-part="indicator"></span>
            </span>
          </button>
        </h3>
        <div data-xh-part="content">
          <div style="display: flex; flex-direction: column; gap: 8px">
            <xh-tool-call phase="output-available">
              <div data-xh-part="root">
                <button data-xh-part="trigger">
                  <span data-xh-part="indicator"></span>
                  <span data-xh-part="label">search</span>
                  <span data-xh-part="summary">"折叠动画"</span>
                  <span data-xh-part="status"></span>
                </button>
                <div data-xh-part="content">
                  <div data-xh-part="output">找到 3 条结果。</div>
                </div>
              </div>
            </xh-tool-call>
            <xh-tool-call phase="output-available">
              <div data-xh-part="root">
                <button data-xh-part="trigger">
                  <span data-xh-part="indicator"></span>
                  <span data-xh-part="label">read_file</span>
                  <span data-xh-part="summary">src/tool-call.css</span>
                  <span data-xh-part="status"></span>
                </button>
                <div data-xh-part="content">
                  <div data-xh-part="output">读了 214 行。</div>
                </div>
              </div>
            </xh-tool-call>
            <xh-tool-call phase="output-available">
              <div data-xh-part="root">
                <button data-xh-part="trigger">
                  <span data-xh-part="indicator"></span>
                  <span data-xh-part="label">apply_patch</span>
                  <span data-xh-part="summary">+12 −3 src/tool-call.css</span>
                  <span data-xh-part="status"></span>
                </button>
                <div data-xh-part="content">
                  <div data-xh-part="output">已写入 1 个文件。</div>
                </div>
              </div>
            </xh-tool-call>
          </div>
        </div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 展开集合是数组，只走 property：设初值、每次变更写回
  const accordion = document.getElementById("tool-call-grouped");
  accordion.value = ["run"];
  accordion.addEventListener("value-change", (event) => {
    accordion.value = event.detail.value;
  });
</script>
```

### 形态、语气与尺寸

三轴只改这块壳怎么与正文分开，阶段与展开逻辑不受影响

```vue
<script setup lang="ts">
import {
  XhToolCallContent,
  XhToolCallIndicator,
  XhToolCallLabel,
  XhToolCallOutput,
  XhToolCallRoot,
  XhToolCallStatus,
  XhToolCallTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <XhToolCallRoot phase="output-available" variant="outline">
      <XhToolCallTrigger>
        <XhToolCallIndicator />
        <XhToolCallLabel>描边</XhToolCallLabel>
        <XhToolCallStatus />
      </XhToolCallTrigger>
      <XhToolCallContent>
        <XhToolCallOutput>找到 3 条结果。</XhToolCallOutput>
      </XhToolCallContent>
    </XhToolCallRoot>

    <XhToolCallRoot phase="output-available" variant="ghost">
      <XhToolCallTrigger>
        <XhToolCallIndicator />
        <XhToolCallLabel>无壳内联</XhToolCallLabel>
        <XhToolCallStatus />
      </XhToolCallTrigger>
      <XhToolCallContent>
        <XhToolCallOutput>找到 3 条结果。</XhToolCallOutput>
      </XhToolCallContent>
    </XhToolCallRoot>

    <XhToolCallRoot phase="output-available" tone="success">
      <XhToolCallTrigger>
        <XhToolCallIndicator />
        <XhToolCallLabel>成功语气</XhToolCallLabel>
        <XhToolCallStatus />
      </XhToolCallTrigger>
      <XhToolCallContent>
        <XhToolCallOutput>找到 3 条结果。</XhToolCallOutput>
      </XhToolCallContent>
    </XhToolCallRoot>

    <XhToolCallRoot phase="output-available" size="sm">
      <XhToolCallTrigger>
        <XhToolCallIndicator />
        <XhToolCallLabel>小档</XhToolCallLabel>
        <XhToolCallStatus />
      </XhToolCallTrigger>
      <XhToolCallContent>
        <XhToolCallOutput>找到 3 条结果。</XhToolCallOutput>
      </XhToolCallContent>
    </XhToolCallRoot>

    <XhToolCallRoot phase="output-available" size="lg">
      <XhToolCallTrigger>
        <XhToolCallIndicator />
        <XhToolCallLabel>大档</XhToolCallLabel>
        <XhToolCallStatus />
      </XhToolCallTrigger>
      <XhToolCallContent>
        <XhToolCallOutput>找到 3 条结果。</XhToolCallOutput>
      </XhToolCallContent>
    </XhToolCallRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 8px">
  <xh-tool-call phase="output-available" variant="outline">
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">描边</span>
        <span data-xh-part="status"></span>
      </button>
      <div data-xh-part="content">
        <div data-xh-part="output">找到 3 条结果。</div>
      </div>
    </div>
  </xh-tool-call>
  <xh-tool-call phase="output-available" variant="ghost">
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">无壳内联</span>
        <span data-xh-part="status"></span>
      </button>
      <div data-xh-part="content">
        <div data-xh-part="output">找到 3 条结果。</div>
      </div>
    </div>
  </xh-tool-call>
  <xh-tool-call phase="output-available" tone="success">
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">成功语气</span>
        <span data-xh-part="status"></span>
      </button>
      <div data-xh-part="content">
        <div data-xh-part="output">找到 3 条结果。</div>
      </div>
    </div>
  </xh-tool-call>
  <xh-tool-call phase="output-available" size="sm">
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">小档</span>
        <span data-xh-part="status"></span>
      </button>
      <div data-xh-part="content">
        <div data-xh-part="output">找到 3 条结果。</div>
      </div>
    </div>
  </xh-tool-call>
  <xh-tool-call phase="output-available" size="lg">
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span data-xh-part="indicator"></span>
        <span data-xh-part="label">大档</span>
        <span data-xh-part="status"></span>
      </button>
      <div data-xh-part="content">
        <div data-xh-part="output">找到 3 条结果。</div>
      </div>
    </div>
  </xh-tool-call>
</div>
```

## 设计指引

### 何时使用

- Agent 界面里展示「它正在做什么」：查了什么、传了什么参数、拿回了什么。
- 一次调用要先经人批准才能执行。

### 何时不用

- 展示的是「思考过程」而不是一次调用：用[思考过程](./reasoning)，两者共用同一台机器但正文形态不同。
- 只想要一个状态色块：用[徽章](./badge)，配 `toneOfToolCallPhase(phase)` 取语气。
- 多次调用要一次只展开一张：外面套[手风琴](./accordion)，每格里装一张。

### 特性

- 五档阶段：参数在传、参数齐了、等人批准、已完成、出错了。
  **「等人批准」不是「在跑」**——协议层的审批只改审批状态、不改工具状态，
  没有这一档的话等人的调用会被当成在跑。
- **自动开合的锁存靠转移的放置位置，不靠一个布尔位**：用户点过一次之后，
  阶段变化在结构上就够不着任何转移，自动开合永久停用。
- 审批闸门常驻在开关与详情之间，不会被折叠藏起来。
- 收起走 `hidden` + `inert`：退场动画播完之前内容还在渲染，`inert` 把这段窗口挡在读屏与 Tab 序之外。
- 开关那一行留了摘要位与耗时位：详情收起时也看得见「查了什么」与「跑了多久」。
- 耗时由宿主给两个时刻，`toolCallDuration(startTime, endTime)` 折出毫秒数；
  **组件自己不读时钟也不起定时器**，秒数要跳就由宿主驱动。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tool-call>` |
| Vue 组件 | `XhToolCallApproval` `XhToolCallContent` `XhToolCallDuration` `XhToolCallError` `XhToolCallIndicator` `XhToolCallInput` `XhToolCallLabel` `XhToolCallOutput` `XhToolCallRoot` `XhToolCallStatus` `XhToolCallSummary` `XhToolCallTrigger` |
| 组合式函数 | `useToolCall` |
| 状态机 | `toolCallMachine` |
| 皮肤 | `@xihan-ui/styles/tool-call.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="tool-call"`：**`root`** · **`trigger`** · `indicator` · `label` · `summary` · `status` · `duration` · `approval` · **`content`** · `input` · `output` · `error`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `running` | `boolean` |  | 这次调用正在跑。适配器用 isToolCallRunning(phase) 折出来，作者只写 phase。 |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `autoDisclosure` | `boolean` |  | 跑起来自动展开、结束自动收起，默认开；用户手动开合过一次即永久停用。 |
| `disabled` | `boolean` |  |  |
| `onOpenChange` | `(details: ToolCallOpenChangeDetails) => void` |  |  |
| `endTime` | `number` |  | 这次调用结束的时刻。**可能缺席**：还在跑，或者流被中止时兜底收尾不写这一个。 |
| `phase` | `ToolCallPhase` |  | 这次调用走到哪一步，默认 input-available。 |
| `size` | `Size` |  |  |
| `startTime` | `number` |  | 这次调用开始的时刻，毫秒时间戳。 |
| `tone` | `Tone` |  |  |
| `translations` | `Partial<ToolCallTranslations>` |  |  |
| `variant` | `ControlVariant` |  | 形态：outline 描边（缺省档）、subtle 底色分区、ghost 无壳内联。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `ToolCallOpenChangeDetails` | 开合变化；detail 为 `{ open: boolean, source: 'user' \| 'auto' \| 'api' }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhToolCallRoot` | `default` | `ToolCallRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `label` | props.phase |
| `summary` | props.phase |
| `status` | props.phase |
| `duration` | props.phase |
| `approval` | props.phase |
| `content` | 'open' \| 'closed' |
| `input` | props.phase |
| `output` | props.phase |
| `error` | props.phase |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`auto.collapsed` · `auto.expanded` · `held.collapsed` · `held.expanded`

**事件**：`TOGGLE` · `OPEN` · `CLOSE` · `PHASE.ACTIVE` · `PHASE.SETTLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled` · `isAutoAllowed` · `isAutoEnabled`

## connect API

`useToolCall` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `phase` | `ToolCallPhase` |  |
| `running` | `boolean` | 这一档算不算在跑。 |
| `settled` | `boolean` | 这一档算不算已经落定：跑完了，或者跑砸了。 |
| `errored` | `boolean` | 这一档算不算跑砸了。 |
| `disabled` | `boolean` |  |
| `statusText` | `string` | 读屏用的一句话，由宿主写进会话级的那一个播报区。 |
| `durationMs` | `number \| undefined` | 跑了多久，毫秒；两个时刻任一缺席即 undefined。 |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getSummaryProps` | `() => T['element']` |  |
| `getStatusProps` | `() => T['element']` |  |
| `getDurationProps` | `() => T['element']` |  |
| `getApprovalProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['element']` |  |
| `getOutputProps` | `() => T['element']` |  |
| `getErrorProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | 焦点在折叠开关上且未禁用 | 展开或收起详情，并把自动开合永久停用 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-describedby` | `error` 部件的 id \| undefined |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `indicator` | `aria-hidden` | 'true' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'region' |

- 开关带 `aria-expanded` 与 `aria-controls`，详情区是 `role=region` 且由开关命名。
- 出错时开关才补 `aria-describedby` 指向错误区——无条件挂会指向一个作者根本没渲的节点。
- 卡片自己不开活区：一屏若干张卡各开一个会互相打断。播报文本由 `statusText` 交出去，
  由宿主写进会话级的那一个播报区。

## 样式

默认皮肤 `@xihan-ui/styles/tool-call.css` 按部件选择：`[data-scope="tool-call"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-errored` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-settled` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `indicator` | `data-state` | 'open' \| 'closed' |
| `label` | `data-state` | props.phase |
| `summary` | `data-state` | props.phase |
| `status` | `data-state` | props.phase |
| `duration` | `data-loading` | ''（条件成立时才出现） |
| `duration` | `data-state` | props.phase |
| `approval` | `data-state` | props.phase |
| `content` | `data-state` | 'open' \| 'closed' |
| `input` | `data-state` | props.phase |
| `output` | `data-state` | props.phase |
| `error` | `data-state` | props.phase |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-tool-call-bg` | `root` | `background` | `default`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` | tool-call 的 root 部件 background 覆盖槽。 |
| `--xh-tool-call-border` | `approval`<br>`content`<br>`root` | `border`<br>`border-block-start` | `default` | `--xh-border-subtle` | tool-call 的 approval、content、root 部件 border、border-block-start 覆盖槽。 |
| `--xh-tool-call-border-error` | `root` | `border-color` | `errored`<br>`has([data-scope='tool-call'][data-state='output-error'])`<br>`state=output-error` | `--xh-border-invalid` | tool-call 的 root 部件 border-color 覆盖槽。 |
| `--xh-tool-call-content-gap` | `content` | `gap` | `default` | `--xh-space-2` | tool-call 的 content 部件 gap 覆盖槽。 |
| `--xh-tool-call-duration-fg` | `duration` | `color` | `default` | `--xh-fg-subtle` | tool-call 的 duration 部件 color 覆盖槽。 |
| `--xh-tool-call-error-fg` | `error` | `color` | `default` | `--xh-fg-danger` | tool-call 的 error 部件 color 覆盖槽。 |
| `--xh-tool-call-font-size` | `trigger` | `font-size` | `default` | `--xh-_tool-call-font-size` | tool-call 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-tool-call-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | tool-call 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-tool-call-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-subtle` | tool-call 的 indicator 部件 color 覆盖槽。 |
| `--xh-tool-call-label-font` | `label`<br>`summary` | `font-family` | `default` | `--xh-font-family-mono` | tool-call 的 label、summary 部件 font-family 覆盖槽。 |
| `--xh-tool-call-px` | `approval`<br>`content`<br>`trigger` | `padding-inline` | `default` | `--xh-_tool-call-px` | tool-call 的 approval、content、trigger 部件 padding-inline 覆盖槽。 |
| `--xh-tool-call-py` | `*`<br>`approval`<br>`content`<br>`trigger` | `padding-block` | `@keyframes xh-tool-call-collapse`<br>`@keyframes xh-tool-call-expand`<br>`default` | `--xh-_tool-call-py` | tool-call 的 *、approval、content、trigger 部件 padding-block 覆盖槽。 |
| `--xh-tool-call-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | tool-call 的 root 部件 border-radius 覆盖槽。 |
| `--xh-tool-call-shadow` | `root` | `box-shadow` | `default`<br>`tone` | `--xh-elevation-raised` | tool-call 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-tool-call-shimmer-duration` | `root`<br>`status` | `animation` | `loading` | `--xh-shimmer-duration` | tool-call 的 root、status 部件 animation 覆盖槽。 |
| `--xh-tool-call-status-bg-approval` | `status` | `background` | `state=awaiting-approval` | `--xh-fg-warning` | tool-call 的 status 部件 background 覆盖槽。 |
| `--xh-tool-call-status-bg-done` | `status` | `background` | `state=output-available` | `--xh-fg-success` | tool-call 的 status 部件 background 覆盖槽。 |
| `--xh-tool-call-status-bg-error` | `status` | `background` | `state=output-error` | `--xh-fg-danger` | tool-call 的 status 部件 background 覆盖槽。 |
| `--xh-tool-call-status-fg` | `root`<br>`status` | `color` | `@media (prefers-reduced-motion: reduce)`<br>`@media print`<br>`default`<br>`loading`<br>`motion=reduce`<br>`where([data-motion='reduce'])` | `--xh-fg-muted` | tool-call 的 root、status 部件 color 覆盖槽。 |
| `--xh-tool-call-status-fg-approval` | `status` | `color` | `state=awaiting-approval` | `--xh-fg-warning` | tool-call 的 status 部件 color 覆盖槽。 |
| `--xh-tool-call-status-fg-done` | `status` | `color` | `state=output-available` | `--xh-fg-success` | tool-call 的 status 部件 color 覆盖槽。 |
| `--xh-tool-call-status-fg-error` | `status` | `color` | `state=output-error` | `--xh-fg-danger` | tool-call 的 status 部件 color 覆盖槽。 |
| `--xh-tool-call-status-font-size` | `duration`<br>`error`<br>`status` | `font-size` | `default` | `--xh-text-caption-size` | tool-call 的 duration、error、status 部件 font-size 覆盖槽。 |
| `--xh-tool-call-status-px` | `status` | `padding-inline` | `state=awaiting-approval`<br>`state=output-available`<br>`state=output-error` | `--xh-space-2` | tool-call 的 status 部件 padding-inline 覆盖槽。 |
| `--xh-tool-call-status-py` | `status` | `padding-block` | `state=awaiting-approval`<br>`state=output-available`<br>`state=output-error` | `--xh-space-0_5` | tool-call 的 status 部件 padding-block 覆盖槽。 |
| `--xh-tool-call-status-radius` | `status` | `border-radius` | `state=awaiting-approval`<br>`state=output-available`<br>`state=output-error` | `--xh-shape-pill` | tool-call 的 status 部件 border-radius 覆盖槽。 |
| `--xh-tool-call-status-shimmer-base` | `root`<br>`status` | `background-image` | `loading` | `--xh-fg-subtle` | tool-call 的 root、status 部件 background-image 覆盖槽。 |
| `--xh-tool-call-status-shimmer-sheen` | `root`<br>`status` | `background-image` | `loading` | `--xh-fg-default` | tool-call 的 root、status 部件 background-image 覆盖槽。 |
| `--xh-tool-call-summary-bg` | `summary` | `background` | `default` | `--xh-bg-subtle` | tool-call 的 summary 部件 background 覆盖槽。 |
| `--xh-tool-call-summary-fg` | `summary` | `color` | `default` | `--xh-fg-muted` | tool-call 的 summary 部件 color 覆盖槽。 |
| `--xh-tool-call-summary-font-size` | `summary` | `font-size` | `default` | `--xh-text-caption-size` | tool-call 的 summary 部件 font-size 覆盖槽。 |
| `--xh-tool-call-summary-px` | `summary` | `padding-inline` | `default` | `--xh-space-1_5` | tool-call 的 summary 部件 padding-inline 覆盖槽。 |
| `--xh-tool-call-summary-radius` | `summary` | `border-radius` | `default` | `--xh-shape-control` | tool-call 的 summary 部件 border-radius 覆盖槽。 |
| `--xh-tool-call-tone-bar` | `root` | `box-shadow` | `tone` | `--xh-stroke-thick` | tool-call 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-tool-call-tone-fg` | `root` | `box-shadow` | `tone` | `--xh-_tone-soft` | tool-call 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-tool-call-trigger-bg-hover` | `trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | tool-call 的 trigger 部件 background 覆盖槽。 |
| `--xh-tool-call-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | tool-call 的 trigger 部件 color 覆盖槽。 |
| `--xh-tool-call-trigger-gap` | `trigger` | `gap` | `default` | `--xh-space-2` | tool-call 的 trigger 部件 gap 覆盖槽。 |
| `--xh-tool-call-trigger-radius` | `root`<br>`trigger` | `border-radius` | `variant=ghost` | `--xh-shape-control` | tool-call 的 root、trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-tool-call-collapse` · `xh-tool-call-enter` · `xh-tool-call-expand` · `xh-tool-call-shimmer` 随皮肤自带，不引用别处文件里的名字；`background` · `rotate` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 参数与结果用[代码视图](./code-view)：参数在流式期是半截 JSON，把 `complete` 接成
  「阶段不是参数在传」即可。富文本结果走[流式正文](./markdown-stream)。
- 结果是代码改动时，详情那一格装[差异视图](./diff-view)；收起态的摘要取它的 `stats`
  折成 `+{added} −{removed} 文件名` 写进摘要位，减号用 U+2212 而不是连字符。
  摘要要能悬停看全文就套[悬浮卡](./hover-card)，别自己往 body 上挂节点。
- 审批那一格装[审批](./approval)。
- 复制不内建，与[剪贴板](./clipboard)组合；多张并排要方向键跳卡片就套[工具条](./toolbar)。
- 一轮里跑了好几次工具时，外面套一层[手风琴](./accordion)当分组：
  手风琴的开关里写「跑了 N 个工具」，计数那一段加 `font-variant-numeric: tabular-nums`
  免得数字跳动时左右挪；整组的开合由手风琴的 `aria-expanded` 承担，卡片各自只管自己那一张。

## 最佳实践

- 工具名与状态都写在开关里：它们会自然构成开关的可访问名（「搜索，已完成」）。
- 出错态要容忍没有错误文本：流被中止时未拿到结果的调用会被收尾成出错，但拿不到原因。
- 摘要位只放一句能一眼读完的参数（查询词、文件路径），整个 JSON 留给详情里的代码视图。
- 耗时文案走 `translations.ranFor` 模板串，秒数由宿主现场代入；`endTime` 缺席时别渲染这一格。

## 反模式

- 每张卡各开一个 `aria-live`：一屏五张卡就是五个活区互相打断。
- 用禁用表达「还不能展开」：读屏用户连它存在都听不到。

来源：https://ui.docs.xihanfun.com/components/question-flow

# QuestionFlow `澄清问卷`

动手之前先问几句：一次一题，人逐题作答，答完一起提交。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/question-flow" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/question-flow.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/question-flow" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/question-flow" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/question-flow.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一次一题：单选选中后自动翻到下一题，多选等人点继续，末题上那颗按钮变成发送

```vue
<script setup lang="ts">
import type { QuestionFlowQuestion } from "@xihan-ui/headless";
import {
  XhQuestionFlowCounter,
  XhQuestionFlowFooter,
  XhQuestionFlowGroup,
  XhQuestionFlowItem,
  XhQuestionFlowItemIndicator,
  XhQuestionFlowItemText,
  XhQuestionFlowLiveRegion,
  XhQuestionFlowNextTrigger,
  XhQuestionFlowPrevTrigger,
  XhQuestionFlowPrompt,
  XhQuestionFlowQuestion,
  XhQuestionFlowResult,
  XhQuestionFlowRoot,
  XhQuestionFlowSkipTrigger,
  XhQuestionFlowSubmitTrigger,
  XhQuestionFlowTrack,
  XhQuestionFlowViewport,
} from "@xihan-ui/vue";
import { ref } from "vue";

const questions: QuestionFlowQuestion[] = [
  {
    id: "scope",
    prompt: "这次改动动到哪一层？",
    type: "single",
    options: [
      { value: "ui", label: "只改界面" },
      { value: "api", label: "改到接口" },
      { value: "db", label: "连数据结构一起改" },
    ],
  },
  {
    id: "checks",
    prompt: "要顺带补哪些检查？",
    type: "multiple",
    options: [
      { value: "unit", label: "单元测试" },
      { value: "e2e", label: "端到端" },
    ],
  },
  {
    id: "branch",
    prompt: "落到哪条分支？",
    type: "single",
    options: [
      { value: "main", label: "直接进主干" },
      { value: "feature", label: "先开一条特性分支" },
    ],
  },
];

const sent = ref("");
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; max-width: 340px;">
    <XhQuestionFlowRoot
      v-slot="{ isLast }"
      :questions="questions"
      @submit="sent = Object.entries($event.answers).map(([id, values]) => `${id}=${values.join('、') || '未答'}`).join('；')"
    >
      <XhQuestionFlowViewport>
        <XhQuestionFlowTrack>
          <XhQuestionFlowQuestion v-for="question in questions" :key="question.id" :question-id="question.id">
            <XhQuestionFlowPrompt :question-id="question.id">{{ question.prompt }}</XhQuestionFlowPrompt>
            <XhQuestionFlowGroup :question-id="question.id">
              <XhQuestionFlowItem
                v-for="option in question.options"
                :key="option.value"
                :question-id="question.id"
                :option-value="option.value"
              >
                <!-- 记号由皮肤画：指示符留空即可，不必手打 -->
                <XhQuestionFlowItemIndicator :question-id="question.id" :option-value="option.value" />
                <XhQuestionFlowItemText :question-id="question.id" :option-value="option.value">
                  {{ option.label }}
                </XhQuestionFlowItemText>
              </XhQuestionFlowItem>
            </XhQuestionFlowGroup>
          </XhQuestionFlowQuestion>
        </XhQuestionFlowTrack>
      </XhQuestionFlowViewport>
      <XhQuestionFlowResult>答案已送出</XhQuestionFlowResult>
      <XhQuestionFlowFooter>
        <div style="display: flex; align-items: center; gap: 4px;">
          <XhQuestionFlowPrevTrigger />
          <XhQuestionFlowCounter />
          <XhQuestionFlowNextTrigger />
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <XhQuestionFlowSkipTrigger>跳过</XhQuestionFlowSkipTrigger>
          <XhQuestionFlowSubmitTrigger>{{ isLast ? "发送" : "继续" }}</XhQuestionFlowSubmitTrigger>
        </div>
      </XhQuestionFlowFooter>
      <XhQuestionFlowLiveRegion />
    </XhQuestionFlowRoot>
    <p v-if="sent" style="margin: 0;">收到：{{ sent }}</p>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; max-width: 340px">
  <xh-question-flow id="question-flow-basic">
    <div data-xh-part="root">
      <div data-xh-part="viewport">
        <div data-xh-part="track">
          <div data-xh-part="question" question-id="scope">
            <p data-xh-part="prompt" question-id="scope">这次改动动到哪一层？</p>
            <div data-xh-part="group" question-id="scope">
              <button data-xh-part="item" question-id="scope" option-value="ui">
                <!-- 记号由皮肤画：指示符留空即可，不必手打 -->
                <span data-xh-part="item-indicator" question-id="scope" option-value="ui"></span>
                <span data-xh-part="item-text" question-id="scope" option-value="ui">只改界面</span>
              </button>
              <button data-xh-part="item" question-id="scope" option-value="api">
                <span data-xh-part="item-indicator" question-id="scope" option-value="api"></span>
                <span data-xh-part="item-text" question-id="scope" option-value="api">改到接口</span>
              </button>
              <button data-xh-part="item" question-id="scope" option-value="db">
                <span data-xh-part="item-indicator" question-id="scope" option-value="db"></span>
                <span data-xh-part="item-text" question-id="scope" option-value="db">连数据结构一起改</span>
              </button>
            </div>
          </div>
          <div data-xh-part="question" question-id="checks">
            <p data-xh-part="prompt" question-id="checks">要顺带补哪些检查？</p>
            <div data-xh-part="group" question-id="checks">
              <button data-xh-part="item" question-id="checks" option-value="unit">
                <span data-xh-part="item-indicator" question-id="checks" option-value="unit"></span>
                <span data-xh-part="item-text" question-id="checks" option-value="unit">单元测试</span>
              </button>
              <button data-xh-part="item" question-id="checks" option-value="e2e">
                <span data-xh-part="item-indicator" question-id="checks" option-value="e2e"></span>
                <span data-xh-part="item-text" question-id="checks" option-value="e2e">端到端</span>
              </button>
            </div>
          </div>
          <div data-xh-part="question" question-id="branch">
            <p data-xh-part="prompt" question-id="branch">落到哪条分支？</p>
            <div data-xh-part="group" question-id="branch">
              <button data-xh-part="item" question-id="branch" option-value="main">
                <span data-xh-part="item-indicator" question-id="branch" option-value="main"></span>
                <span data-xh-part="item-text" question-id="branch" option-value="main">直接进主干</span>
              </button>
              <button data-xh-part="item" question-id="branch" option-value="feature">
                <span data-xh-part="item-indicator" question-id="branch" option-value="feature"></span>
                <span data-xh-part="item-text" question-id="branch" option-value="feature">先开一条特性分支</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- 升级前先自己收起：属性由连接层接管，交卷后自动撤掉 -->
      <div data-xh-part="result" hidden>答案已送出</div>
      <div data-xh-part="footer">
        <div style="display: flex; align-items: center; gap: 4px">
          <button data-xh-part="prev-trigger"></button>
          <span data-xh-part="counter"></span>
          <button data-xh-part="next-trigger"></button>
        </div>
        <div style="display: flex; align-items: center; gap: 6px">
          <button data-xh-part="skip-trigger">跳过</button>
          <button data-xh-part="submit-trigger">继续</button>
        </div>
      </div>
      <div data-xh-part="live-region"></div>
    </div>
  </xh-question-flow>
  <p id="question-flow-basic-sent" style="margin: 0"></p>
</div>

<script type="module">
  // 题目是数组，只走 property
  const flow = document.getElementById("question-flow-basic");
  const line = document.getElementById("question-flow-basic-sent");
  const submit = flow.querySelector('[data-xh-part="submit-trigger"]');
  const questions = [
    {
      id: "scope",
      prompt: "这次改动动到哪一层？",
      type: "single",
      options: [
        { value: "ui", label: "只改界面" },
        { value: "api", label: "改到接口" },
        { value: "db", label: "连数据结构一起改" },
      ],
    },
    {
      id: "checks",
      prompt: "要顺带补哪些检查？",
      type: "multiple",
      options: [
        { value: "unit", label: "单元测试" },
        { value: "e2e", label: "端到端" },
      ],
    },
    {
      id: "branch",
      prompt: "落到哪条分支？",
      type: "single",
      options: [
        { value: "main", label: "直接进主干" },
        { value: "feature", label: "先开一条特性分支" },
      ],
    },
  ];
  flow.questions = questions;
  // 按钮的两个身份由连接层切，可见文案归作者：按当前题算，末题写发送
  const label = (index) => {
    submit.textContent = index === questions.length - 1 ? "发送" : "继续";
  };
  label(0);
  flow.addEventListener("index-change", (event) => label(event.detail.index));
  // submit 与原生表单提交同名，故不冒泡，直接在元素上监听
  flow.addEventListener("submit", (event) => {
    const parts = Object.entries(event.detail.answers).map(
      ([id, values]) => `${id}=${values.join("、") || "未答"}`,
    );
    line.textContent = `收到：${parts.join("；")}`;
  });
</script>
```

## 示例

### 自由文本与跳过

选项之外还能自己写一句，写了就算答过；关掉自动前进，每题都等人点继续

```vue
<script setup lang="ts">
import type { QuestionFlowQuestion } from "@xihan-ui/headless";
import {
  XhQuestionFlowCounter,
  XhQuestionFlowFooter,
  XhQuestionFlowGroup,
  XhQuestionFlowItem,
  XhQuestionFlowItemIndicator,
  XhQuestionFlowItemText,
  XhQuestionFlowLiveRegion,
  XhQuestionFlowNote,
  XhQuestionFlowPrompt,
  XhQuestionFlowQuestion,
  XhQuestionFlowRoot,
  XhQuestionFlowSkipTrigger,
  XhQuestionFlowSubmitTrigger,
  XhQuestionFlowTrack,
  XhQuestionFlowViewport,
} from "@xihan-ui/vue";
import { ref } from "vue";

const questions: QuestionFlowQuestion[] = [
  {
    id: "tone",
    prompt: "文案用什么口吻？",
    type: "single",
    options: [
      { value: "plain", label: "平铺直叙" },
      { value: "warm", label: "亲切一点" },
    ],
  },
  {
    id: "length",
    prompt: "篇幅控制在多长？",
    type: "single",
    optional: true,
    options: [
      { value: "short", label: "一句话" },
      { value: "long", label: "一段话" },
    ],
  },
];

const log = ref("");
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; max-width: 340px;">
    <XhQuestionFlowRoot
      v-slot="{ isLast }"
      :questions="questions"
      :auto-advance="false"
      tone="neutral"
      variant="subtle"
      :translations="{ note: '自己写一句', notePlaceholder: '都不是，我想要…' }"
      @skip="log = `跳过了第 ${$event.index + 1} 题`"
      @submit="log = `自己写的：${Object.values($event.notes).filter(Boolean).join(' / ') || '（没写）'}`"
    >
      <XhQuestionFlowViewport>
        <XhQuestionFlowTrack>
          <XhQuestionFlowQuestion v-for="question in questions" :key="question.id" :question-id="question.id">
            <XhQuestionFlowPrompt :question-id="question.id">{{ question.prompt }}</XhQuestionFlowPrompt>
            <XhQuestionFlowGroup :question-id="question.id">
              <XhQuestionFlowItem
                v-for="option in question.options"
                :key="option.value"
                :question-id="question.id"
                :option-value="option.value"
              >
                <XhQuestionFlowItemIndicator :question-id="question.id" :option-value="option.value" />
                <XhQuestionFlowItemText :question-id="question.id" :option-value="option.value">
                  {{ option.label }}
                </XhQuestionFlowItemText>
              </XhQuestionFlowItem>
            </XhQuestionFlowGroup>
            <!-- 写了一句就算答过这一题，继续键随之亮起 -->
            <XhQuestionFlowNote :question-id="question.id" />
          </XhQuestionFlowQuestion>
        </XhQuestionFlowTrack>
      </XhQuestionFlowViewport>
      <XhQuestionFlowFooter>
        <XhQuestionFlowCounter />
        <div style="display: flex; align-items: center; gap: 6px;">
          <XhQuestionFlowSkipTrigger>跳过</XhQuestionFlowSkipTrigger>
          <XhQuestionFlowSubmitTrigger>{{ isLast ? "发送" : "继续" }}</XhQuestionFlowSubmitTrigger>
        </div>
      </XhQuestionFlowFooter>
      <XhQuestionFlowLiveRegion />
    </XhQuestionFlowRoot>
    <p v-if="log" style="margin: 0;">{{ log }}</p>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; max-width: 340px">
  <xh-question-flow id="question-flow-note" auto-advance="false" tone="neutral" variant="subtle">
    <div data-xh-part="root">
      <div data-xh-part="viewport">
        <div data-xh-part="track">
          <div data-xh-part="question" question-id="tone">
            <p data-xh-part="prompt" question-id="tone">文案用什么口吻？</p>
            <div data-xh-part="group" question-id="tone">
              <button data-xh-part="item" question-id="tone" option-value="plain">
                <span data-xh-part="item-indicator" question-id="tone" option-value="plain"></span>
                <span data-xh-part="item-text" question-id="tone" option-value="plain">平铺直叙</span>
              </button>
              <button data-xh-part="item" question-id="tone" option-value="warm">
                <span data-xh-part="item-indicator" question-id="tone" option-value="warm"></span>
                <span data-xh-part="item-text" question-id="tone" option-value="warm">亲切一点</span>
              </button>
            </div>
            <!-- 写了一句就算答过这一题，继续键随之亮起 -->
            <input data-xh-part="note" question-id="tone" />
          </div>
          <div data-xh-part="question" question-id="length">
            <p data-xh-part="prompt" question-id="length">篇幅控制在多长？</p>
            <div data-xh-part="group" question-id="length">
              <button data-xh-part="item" question-id="length" option-value="short">
                <span data-xh-part="item-indicator" question-id="length" option-value="short"></span>
                <span data-xh-part="item-text" question-id="length" option-value="short">一句话</span>
              </button>
              <button data-xh-part="item" question-id="length" option-value="long">
                <span data-xh-part="item-indicator" question-id="length" option-value="long"></span>
                <span data-xh-part="item-text" question-id="length" option-value="long">一段话</span>
              </button>
            </div>
            <input data-xh-part="note" question-id="length" />
          </div>
        </div>
      </div>
      <div data-xh-part="footer">
        <span data-xh-part="counter"></span>
        <div style="display: flex; align-items: center; gap: 6px">
          <button data-xh-part="skip-trigger">跳过</button>
          <button data-xh-part="submit-trigger">继续</button>
        </div>
      </div>
      <div data-xh-part="live-region"></div>
    </div>
  </xh-question-flow>
  <p id="question-flow-note-log" style="margin: 0"></p>
</div>

<script type="module">
  // 题目与文案都是对象，只走 property
  const flow = document.getElementById("question-flow-note");
  const line = document.getElementById("question-flow-note-log");
  const submit = flow.querySelector('[data-xh-part="submit-trigger"]');
  const questions = [
    {
      id: "tone",
      prompt: "文案用什么口吻？",
      type: "single",
      options: [
        { value: "plain", label: "平铺直叙" },
        { value: "warm", label: "亲切一点" },
      ],
    },
    {
      id: "length",
      prompt: "篇幅控制在多长？",
      type: "single",
      optional: true,
      options: [
        { value: "short", label: "一句话" },
        { value: "long", label: "一段话" },
      ],
    },
  ];
  flow.questions = questions;
  flow.translations = { note: "自己写一句", notePlaceholder: "都不是，我想要…" };
  const label = (index) => {
    submit.textContent = index === questions.length - 1 ? "发送" : "继续";
  };
  label(0);
  flow.addEventListener("index-change", (event) => label(event.detail.index));
  flow.addEventListener("skip", (event) => {
    line.textContent = `跳过了第 ${event.detail.index + 1} 题`;
  });
  // submit 与原生表单提交同名，故不冒泡，直接在元素上监听
  flow.addEventListener("submit", (event) => {
    const written = Object.values(event.detail.notes).filter(Boolean).join(" / ");
    line.textContent = `自己写的：${written || "（没写）"}`;
  });
</script>
```

### 受控当前题

进度归宿主管：外面的按钮直接跳题，答案也一并受控，组件只发意图

```vue
<script setup lang="ts">
import type { QuestionFlowAnswers, QuestionFlowQuestion } from "@xihan-ui/headless";
import {
  XhQuestionFlowCounter,
  XhQuestionFlowFooter,
  XhQuestionFlowGroup,
  XhQuestionFlowItem,
  XhQuestionFlowItemIndicator,
  XhQuestionFlowItemText,
  XhQuestionFlowLiveRegion,
  XhQuestionFlowNextTrigger,
  XhQuestionFlowPrevTrigger,
  XhQuestionFlowPrompt,
  XhQuestionFlowQuestion,
  XhQuestionFlowRoot,
  XhQuestionFlowSubmitTrigger,
  XhQuestionFlowTrack,
  XhQuestionFlowViewport,
} from "@xihan-ui/vue";
import { ref } from "vue";

const questions: QuestionFlowQuestion[] = [
  {
    id: "target",
    prompt: "先修哪一处？",
    type: "single",
    options: [
      { value: "crash", label: "崩溃" },
      { value: "slow", label: "卡顿" },
    ],
  },
  {
    id: "when",
    prompt: "什么时候上线？",
    type: "single",
    options: [
      { value: "now", label: "今天" },
      { value: "week", label: "本周内" },
    ],
  },
];

const index = ref(0);
const answers = ref<QuestionFlowAnswers>({});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; max-width: 340px;">
    <div style="display: flex; gap: 6px;">
      <button v-for="(question, i) in questions" :key="question.id" type="button" @click="index = i">
        跳到第 {{ i + 1 }} 题
      </button>
    </div>
    <XhQuestionFlowRoot
      v-slot="{ isLast }"
      v-model:index="index"
      v-model:answers="answers"
      :questions="questions"
      :allow-skip="false"
    >
      <XhQuestionFlowViewport>
        <XhQuestionFlowTrack>
          <XhQuestionFlowQuestion v-for="question in questions" :key="question.id" :question-id="question.id">
            <XhQuestionFlowPrompt :question-id="question.id">{{ question.prompt }}</XhQuestionFlowPrompt>
            <XhQuestionFlowGroup :question-id="question.id">
              <XhQuestionFlowItem
                v-for="option in question.options"
                :key="option.value"
                :question-id="question.id"
                :option-value="option.value"
              >
                <XhQuestionFlowItemIndicator :question-id="question.id" :option-value="option.value" />
                <XhQuestionFlowItemText :question-id="question.id" :option-value="option.value">
                  {{ option.label }}
                </XhQuestionFlowItemText>
              </XhQuestionFlowItem>
            </XhQuestionFlowGroup>
          </XhQuestionFlowQuestion>
        </XhQuestionFlowTrack>
      </XhQuestionFlowViewport>
      <XhQuestionFlowFooter>
        <div style="display: flex; align-items: center; gap: 4px;">
          <XhQuestionFlowPrevTrigger />
          <XhQuestionFlowCounter />
          <XhQuestionFlowNextTrigger />
        </div>
        <XhQuestionFlowSubmitTrigger>{{ isLast ? "发送" : "继续" }}</XhQuestionFlowSubmitTrigger>
      </XhQuestionFlowFooter>
      <XhQuestionFlowLiveRegion />
    </XhQuestionFlowRoot>
    <p style="margin: 0;">宿主手上的进度：第 {{ index + 1 }} 题；已答 {{ Object.keys(answers).length }} 题</p>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; max-width: 340px">
  <div style="display: flex; gap: 6px">
    <button type="button" id="question-flow-controlled-to-1">跳到第 1 题</button>
    <button type="button" id="question-flow-controlled-to-2">跳到第 2 题</button>
  </div>
  <xh-question-flow id="question-flow-controlled" index="0" allow-skip="false">
    <div data-xh-part="root">
      <div data-xh-part="viewport">
        <div data-xh-part="track">
          <div data-xh-part="question" question-id="target">
            <p data-xh-part="prompt" question-id="target">先修哪一处？</p>
            <div data-xh-part="group" question-id="target">
              <button data-xh-part="item" question-id="target" option-value="crash">
                <span data-xh-part="item-indicator" question-id="target" option-value="crash"></span>
                <span data-xh-part="item-text" question-id="target" option-value="crash">崩溃</span>
              </button>
              <button data-xh-part="item" question-id="target" option-value="slow">
                <span data-xh-part="item-indicator" question-id="target" option-value="slow"></span>
                <span data-xh-part="item-text" question-id="target" option-value="slow">卡顿</span>
              </button>
            </div>
          </div>
          <div data-xh-part="question" question-id="when">
            <p data-xh-part="prompt" question-id="when">什么时候上线？</p>
            <div data-xh-part="group" question-id="when">
              <button data-xh-part="item" question-id="when" option-value="now">
                <span data-xh-part="item-indicator" question-id="when" option-value="now"></span>
                <span data-xh-part="item-text" question-id="when" option-value="now">今天</span>
              </button>
              <button data-xh-part="item" question-id="when" option-value="week">
                <span data-xh-part="item-indicator" question-id="when" option-value="week"></span>
                <span data-xh-part="item-text" question-id="when" option-value="week">本周内</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div data-xh-part="footer">
        <div style="display: flex; align-items: center; gap: 4px">
          <button data-xh-part="prev-trigger"></button>
          <span data-xh-part="counter"></span>
          <button data-xh-part="next-trigger"></button>
        </div>
        <button data-xh-part="submit-trigger">继续</button>
      </div>
      <div data-xh-part="live-region"></div>
    </div>
  </xh-question-flow>
  <p id="question-flow-controlled-log" style="margin: 0"></p>
</div>

<script type="module">
  // 受控：组件只发意图，进度与答案都由宿主写回去
  const flow = document.getElementById("question-flow-controlled");
  const line = document.getElementById("question-flow-controlled-log");
  const submit = flow.querySelector('[data-xh-part="submit-trigger"]');
  const questions = [
    {
      id: "target",
      prompt: "先修哪一处？",
      type: "single",
      options: [
        { value: "crash", label: "崩溃" },
        { value: "slow", label: "卡顿" },
      ],
    },
    {
      id: "when",
      prompt: "什么时候上线？",
      type: "single",
      options: [
        { value: "now", label: "今天" },
        { value: "week", label: "本周内" },
      ],
    },
  ];
  flow.questions = questions;
  flow.answers = {};
  const render = () => {
    submit.textContent = flow.index === questions.length - 1 ? "发送" : "继续";
    line.textContent = `宿主手上的进度：第 ${flow.index + 1} 题；已答 ${Object.keys(flow.answers).length} 题`;
  };
  render();
  flow.addEventListener("index-change", (event) => {
    flow.index = event.detail.index;
    render();
  });
  flow.addEventListener("answers-change", (event) => {
    flow.answers = event.detail.answers;
    render();
  });
  document.getElementById("question-flow-controlled-to-1").addEventListener("click", () => {
    flow.index = 0;
    render();
  });
  document.getElementById("question-flow-controlled-to-2").addEventListener("click", () => {
    flow.index = 1;
    render();
  });
</script>
```

### 尺寸

size 换问句、选项行与页脚按钮的几何档，三档共用同一份问题

```vue
<script setup lang="ts">
import type { QuestionFlowQuestion } from "@xihan-ui/headless";
import {
  XhQuestionFlowFooter,
  XhQuestionFlowGroup,
  XhQuestionFlowItem,
  XhQuestionFlowItemIndicator,
  XhQuestionFlowItemText,
  XhQuestionFlowPrompt,
  XhQuestionFlowQuestion,
  XhQuestionFlowRoot,
  XhQuestionFlowSubmitTrigger,
  XhQuestionFlowTrack,
  XhQuestionFlowViewport,
} from "@xihan-ui/vue";

const questions: QuestionFlowQuestion[] = [
  {
    id: "scope",
    prompt: "这次改动动到哪一层？",
    type: "single",
    options: [
      { value: "ui", label: "只改界面" },
      { value: "api", label: "改到接口" },
    ],
  },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 340px">
    <XhQuestionFlowRoot
      v-for="size in ['sm', 'md', 'lg']"
      :key="size"
      :questions="questions"
      :size="size"
    >
      <XhQuestionFlowViewport>
        <XhQuestionFlowTrack>
          <XhQuestionFlowQuestion question-id="scope">
            <XhQuestionFlowPrompt question-id="scope">
              这次改动动到哪一层？（{{ size }}）
            </XhQuestionFlowPrompt>
            <XhQuestionFlowGroup question-id="scope">
              <XhQuestionFlowItem
                v-for="option in questions[0].options"
                :key="option.value"
                question-id="scope"
                :option-value="option.value"
              >
                <XhQuestionFlowItemIndicator question-id="scope" :option-value="option.value" />
                <XhQuestionFlowItemText question-id="scope" :option-value="option.value">
                  {{ option.label }}
                </XhQuestionFlowItemText>
              </XhQuestionFlowItem>
            </XhQuestionFlowGroup>
          </XhQuestionFlowQuestion>
        </XhQuestionFlowTrack>
      </XhQuestionFlowViewport>
      <XhQuestionFlowFooter>
        <XhQuestionFlowSubmitTrigger>发送</XhQuestionFlowSubmitTrigger>
      </XhQuestionFlowFooter>
    </XhQuestionFlowRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 16px; max-width: 340px">
  <xh-question-flow class="question-flow-size" size="sm">
    <div data-xh-part="root">
      <div data-xh-part="viewport">
        <div data-xh-part="track">
          <div data-xh-part="question" question-id="scope">
            <p data-xh-part="prompt" question-id="scope">这次改动动到哪一层？（sm）</p>
            <div data-xh-part="group" question-id="scope">
              <button data-xh-part="item" question-id="scope" option-value="ui">
                <span data-xh-part="item-indicator" question-id="scope" option-value="ui"></span>
                <span data-xh-part="item-text" question-id="scope" option-value="ui">只改界面</span>
              </button>
              <button data-xh-part="item" question-id="scope" option-value="api">
                <span data-xh-part="item-indicator" question-id="scope" option-value="api"></span>
                <span data-xh-part="item-text" question-id="scope" option-value="api">改到接口</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div data-xh-part="footer">
        <button data-xh-part="submit-trigger">发送</button>
      </div>
    </div>
  </xh-question-flow>

  <xh-question-flow class="question-flow-size">
    <div data-xh-part="root">
      <div data-xh-part="viewport">
        <div data-xh-part="track">
          <div data-xh-part="question" question-id="scope">
            <p data-xh-part="prompt" question-id="scope">这次改动动到哪一层？（md）</p>
            <div data-xh-part="group" question-id="scope">
              <button data-xh-part="item" question-id="scope" option-value="ui">
                <span data-xh-part="item-indicator" question-id="scope" option-value="ui"></span>
                <span data-xh-part="item-text" question-id="scope" option-value="ui">只改界面</span>
              </button>
              <button data-xh-part="item" question-id="scope" option-value="api">
                <span data-xh-part="item-indicator" question-id="scope" option-value="api"></span>
                <span data-xh-part="item-text" question-id="scope" option-value="api">改到接口</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div data-xh-part="footer">
        <button data-xh-part="submit-trigger">发送</button>
      </div>
    </div>
  </xh-question-flow>

  <xh-question-flow class="question-flow-size" size="lg">
    <div data-xh-part="root">
      <div data-xh-part="viewport">
        <div data-xh-part="track">
          <div data-xh-part="question" question-id="scope">
            <p data-xh-part="prompt" question-id="scope">这次改动动到哪一层？（lg）</p>
            <div data-xh-part="group" question-id="scope">
              <button data-xh-part="item" question-id="scope" option-value="ui">
                <span data-xh-part="item-indicator" question-id="scope" option-value="ui"></span>
                <span data-xh-part="item-text" question-id="scope" option-value="ui">只改界面</span>
              </button>
              <button data-xh-part="item" question-id="scope" option-value="api">
                <span data-xh-part="item-indicator" question-id="scope" option-value="api"></span>
                <span data-xh-part="item-text" question-id="scope" option-value="api">改到接口</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div data-xh-part="footer">
        <button data-xh-part="submit-trigger">发送</button>
      </div>
    </div>
  </xh-question-flow>
</div>

<script type="module">
  // 问题清单是数组，只走 property：三档共用同一份
  const questions = [
    {
      id: "scope",
      prompt: "这次改动动到哪一层？",
      type: "single",
      options: [
        { value: "ui", label: "只改界面" },
        { value: "api", label: "改到接口" },
      ],
    },
  ];
  for (const flow of document.querySelectorAll(".question-flow-size")) flow.questions = questions;
</script>
```

## 设计指引

### 何时使用

- 需求还差几处没说清，把含糊的地方拆成几道选择题问回去。
- 一次要问的不止一件事，而每件都只要一两秒就能答完。

### 何时不用

- 只问一件事：那是一个[单选组](./radio-group)或[复选框组](./checkbox-group)，不必套一层问卷。
- 要人批准一次危险动作：那是闸门，用[审批](./approval)——它的出口只有批准与拒绝两条，
  没有「跳过」，也没有「答完再说」。
- 要收一份长表单：字段之间有校验与联动，用[表单](./form)。

### 特性

- **一次只暴露一题**：非当前题对读屏 `aria-hidden`、对键盘 `inert`，里面的可聚焦物另发 `tabindex="-1"`。
  它们仍留在轨道上，只是走不到——这样卡片高度才有得可量，来回翻页也不必重建 DOM。
- **高度与位移是量出来的，不是猜的**：机器在活 DOM 上量当前题的盒，把结果写进 context，
  连接层只把它格式化成两个私有槽（视口高度与轨道位移）。连接层是渲染期纯函数，
  不查 DOM、不起定时器、不读时钟。
- **单选自动前进，多选等人点继续**：选中一项后隔一小段自动翻到下一题；连着改主意时，
  每改一次都从整段延时重新计。**自动前进只走下一题**——末题上它停住，不替人按发送。
- **一颗按钮两个身份**：不是末题时是「继续」，末题时是「发送」。它原位换 `data-mode` 与可访问名，
  正在按它的人不会按空。
- **自由文本与选项同等算数**：写了一句「都不是，我想要……」就算答过了这一题，继续键随之亮起。
- 进度只播报一次：`counter` 那格 `aria-hidden`，逐题跳动的数字不进活区；
  换题与交卷由 `announcement` 念一句。
- 跳过是明路：`allowSkip` 关掉时整颗跳过键收起，而不是留一颗按不动的按钮。
  末题上跳过即交卷——否则最后一题没有出口，人会被困在那里。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-question-flow>` |
| Vue 组件 | `XhQuestionFlowCounter` `XhQuestionFlowFooter` `XhQuestionFlowGroup` `XhQuestionFlowItem` `XhQuestionFlowItemIndicator` `XhQuestionFlowItemText` `XhQuestionFlowLiveRegion` `XhQuestionFlowNextTrigger` `XhQuestionFlowNote` `XhQuestionFlowPrevTrigger` `XhQuestionFlowPrompt` `XhQuestionFlowQuestion` `XhQuestionFlowResult` `XhQuestionFlowRoot` `XhQuestionFlowSkipTrigger` `XhQuestionFlowSubmitTrigger` `XhQuestionFlowTrack` `XhQuestionFlowViewport` |
| 组合式函数 | `useQuestionFlow` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/question-flow.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="question-flow"`：**`root`** · `viewport` · **`track`** · **`question`** · `prompt` · `group` · `item` · `item-indicator` · `item-text` · `note` · `footer` · `prev-trigger` · `counter` · `next-trigger` · `skip-trigger` · **`submit-trigger`** · `result` · `live-region`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `questions` | `readonly QuestionFlowQuestion[]` |  |  |
| `index` | `number` |  | 当前题下标。给定即受控：内部不再自改，只发 onIndexChange。 |
| `defaultIndex` | `number` |  |  |
| `answers` | `QuestionFlowAnswers` |  | 答案表。给定即受控。 |
| `defaultAnswers` | `QuestionFlowAnswers` |  |  |
| `notes` | `QuestionFlowNotes` |  | 自由文本表。给定即受控。 |
| `defaultNotes` | `QuestionFlowNotes` |  |  |
| `status` | `QuestionFlowStatus` |  | 答题状态。给定即受控。 |
| `defaultStatus` | `QuestionFlowStatus` |  |  |
| `autoAdvance` | `boolean` |  | 单选选中后自动走下一题，默认开。 **它只走下一题，末题上不会替人按发送。** |
| `autoAdvanceDelay` | `number` |  | 自动前进前等多久（毫秒），默认 480。非有限值或负数不起计时器。 |
| `allowSkip` | `boolean` |  | 允许跳过，默认开。关掉后跳过按钮收起，SKIP 事件也不再生效。 |
| `loop` | `boolean` |  | 选项组内漫游走到尽头是否回绕，默认 true。 |
| `variant` | `ControlVariant` |  |  |
| `tone` | `Tone` |  |  |
| `size` | `Size` |  |  |
| `translations` | `Partial<QuestionFlowTranslations>` |  |  |
| `onIndexChange` | `(details: QuestionFlowIndexChangeDetails) => void` |  |  |
| `onAnswersChange` | `(details: QuestionFlowAnswersChangeDetails) => void` |  |  |
| `onNotesChange` | `(details: QuestionFlowNotesChangeDetails) => void` |  |  |
| `onSkip` | `(details: QuestionFlowSkipDetails) => void` |  |  |
| `onSubmit` | `(details: QuestionFlowSubmitDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `index-change` | `QuestionFlowIndexChangeDetails` | 当前题变化；detail 为 `{ index }` |
| `answers-change` | `QuestionFlowAnswersChangeDetails` | 答案变化；detail 为 `{ answers }` |
| `notes-change` | `QuestionFlowNotesChangeDetails` | 自由文本变化；detail 为 `{ notes }` |
| `skip` | `QuestionFlowSkipDetails` | 跳过一题；detail 为 `{ index, questionId }` |
| `submit` | `QuestionFlowSubmitDetails` | 交卷；detail 为 `{ answers, notes }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhQuestionFlowItem` | `default` | `QuestionFlowOptionSlotProps` |  |
| `XhQuestionFlowRoot` | `default` | `QuestionFlowRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | state.get() |
| `item` | 'checked' \| 'unchecked' |
| `item-indicator` | 'checked' \| 'unchecked' |
| `item-text` | 'checked' \| 'unchecked' |
| `result` | state.get() |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**事件**：`OPTION.TOGGLE` · `NOTE.SET` · `GOTO` · `NEXT` · `PREV` · `SKIP` · `SUBMIT` · `VIEWPORT.MEASURE` · `after.autoAdvance` · `CONTROLLED.ANSWERING` · `CONTROLLED.SUBMITTED`

**判据**：`isStatusControlled` · `canToggle` · `canSkip` · `isFirstQuestion` · `isLastQuestion`

## connect API

`useQuestionFlow` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `QuestionFlowStatus` |  |
| `submitted` | `boolean` | 已经交卷了。 |
| `index` | `number` | 夹到题数范围内的当前题下标。 |
| `count` | `number` | 题数。 |
| `current` | `QuestionFlowQuestion \| undefined` | 当前题；一道题都没有时为 undefined。 |
| `isFirst` | `boolean` |  |
| `isLast` | `boolean` |  |
| `canAdvance` | `boolean` | 当前题答得能往下走了吗：选了选项、写了自由文本，或这题本就可跳过。 |
| `allowSkip` | `boolean` |  |
| `counter` | `string` | 给眼睛看的 N / M。它对读屏隐藏，进度由播报区念。 |
| `announcement` | `string` | 念给读屏的那一句：答题中念进度，交卷后念结果。 |
| `answers` | `QuestionFlowAnswers` |  |
| `notes` | `QuestionFlowNotes` |  |
| `answersOf` | `(questionId: string) => readonly string[]` |  |
| `noteOf` | `(questionId: string) => string` |  |
| `isOptionSelected` | `(questionId: string, value: string) => boolean` |  |
| `isCurrent` | `(questionId: string) => boolean` |  |
| `goTo` | `(index: number) => void` |  |
| `next` | `() => void` |  |
| `prev` | `() => void` |  |
| `skip` | `() => void` |  |
| `submit` | `() => void` |  |
| `toggleOption` | `(questionId: string, value: string) => void` |  |
| `setNote` | `(questionId: string, value: string) => void` |  |
| `measure` | `() => void` | 重量一遍当前题的几何。换题与题目增删都会自动重量，容器尺寸变化由尺寸观察器接住。 |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getTrackProps` | `() => T['element']` |  |
| `getQuestionProps` | `(props: QuestionFlowQuestionProps) => T['element']` |  |
| `getPromptProps` | `(props: QuestionFlowQuestionProps) => T['element']` |  |
| `getGroupProps` | `(props: QuestionFlowQuestionProps) => T['element']` |  |
| `getItemProps` | `(props: QuestionFlowItemProps) => T['button']` |  |
| `getItemIndicatorProps` | `(props: QuestionFlowItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: QuestionFlowItemProps) => T['element']` |  |
| `getNoteProps` | `(props: QuestionFlowQuestionProps) => T['input']` |  |
| `getFooterProps` | `() => T['element']` |  |
| `getPrevTriggerProps` | `() => T['button']` |  |
| `getCounterProps` | `() => T['element']` |  |
| `getNextTriggerProps` | `() => T['button']` |  |
| `getSkipTriggerProps` | `() => T['button']` |  |
| `getSubmitTriggerProps` | `() => T['button']` |  |
| `getResultProps` | `() => T['element']` |  |
| `getLiveRegionProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowDown` / `ArrowRight` | 焦点在当前题的选项上 | 焦点移到下一个可停留选项（禁用项跳过、尽头按 loop 回绕）；单选时同时选中它 |
| `ArrowUp` / `ArrowLeft` | 焦点在当前题的选项上 | 焦点移到上一个可停留选项；单选时同时选中它 |
| `Home` | 焦点在当前题的选项上 | 焦点移到首个可停留选项；单选时同时选中它 |
| `End` | 焦点在当前题的选项上 | 焦点移到末个可停留选项；单选时同时选中它 |
| `Space` | 焦点在当前题的选项上 | 切换该项。单选点已选中的那一项不取消 |
| `Enter` | 焦点在当前题的选项或自由文本上，且这一题答得能往下走 | 前进一题；已经在末题就交卷 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `question` | `aria-hidden` | undefined \| 'true' |
| `question` | `aria-label` | undefined \| translations?.prompt |
| `question` | `aria-labelledby` | `prompt` 部件的 id \| undefined |
| `question` | `role` | 'group' |
| `group` | `aria-label` | undefined \| translations?.options |
| `group` | `aria-labelledby` | `prompt` 部件的 id \| undefined |
| `group` | `role` | 'radiogroup' \| 'group' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `role` | 'radio' \| 'checkbox' |
| `item-indicator` | `aria-hidden` | 'true' |
| `note` | `aria-label` | translations?.note |
| `prev-trigger` | `aria-label` | translations?.prev |
| `counter` | `aria-hidden` | 'true' |
| `next-trigger` | `aria-label` | translations?.next |
| `skip-trigger` | `aria-label` | translations?.skip |
| `submit-trigger` | `aria-label` | translations?.send \| translations?.continue |
| `result` | `aria-hidden` | 'true' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |

- 每题是 `role=group`，题干是它的可访问名；题干缺席时退到 `translations.prompt`。
- 选项组按题型取 `role=radiogroup`（单选）或 `role=group`（多选），同样由题干命名；
  选项各自是 `role=radio` 或 `role=checkbox` 并显式报 `aria-checked`。
- 选项组内是漫游焦点：整组只占一个 Tab 位，落在选中项上，一个都没选时落首个可停留项。
- 上一题 / 下一题只给按钮入口，不吃全局按键——那会和选项漫游抢同一批方向键。
  这两颗通常只画一枚箭头，所以它们的可访问名**总会发出去**（`translations.prev` / `translations.next`，
  缺省 `Previous question` / `Next question`）；跳过键一般带可见文字，`translations.skip` 不给就不产出 `aria-label`。
- 自由文本那一格取 `translations.note` 作可及名（缺省 `Other answer`），
  占位文字另走 `translations.notePlaceholder`。
- 备注框与选项组都挡输入法组合态：组合期间的 Enter 是在确认候选词，不前进。

## 样式

默认皮肤 `@xihan-ui/styles/question-flow.css` 按部件选择：`[data-scope="question-flow"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | state.get() |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `question` | `data-current` | ''（条件成立时才出现） |
| `group` | `data-select-mode` | 'single' \| 'multiple' |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-select-mode` | 'single' \| 'multiple' |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item-indicator` | `data-select-mode` | 'single' \| 'multiple' |
| `item-indicator` | `data-state` | 'checked' \| 'unchecked' |
| `item-text` | `data-state` | 'checked' \| 'unchecked' |
| `item-text` | `data-value` | item.value |
| `submit-trigger` | `data-mode` | 'send' \| 'continue' |
| `result` | `data-state` | state.get() |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-question-flow-action-font-size` | `skip-trigger`<br>`submit-trigger` | `font-size` | `default` | `--xh-text-label-size` | question-flow 的 skip-trigger、submit-trigger 部件 font-size 覆盖槽。 |
| `--xh-question-flow-action-font-weight` | `skip-trigger`<br>`submit-trigger` | `font-weight` | `default` | `--xh-text-label-weight` | question-flow 的 skip-trigger、submit-trigger 部件 font-weight 覆盖槽。 |
| `--xh-question-flow-action-gap` | `skip-trigger`<br>`submit-trigger` | `gap` | `default` | `--xh-space-1` | question-flow 的 skip-trigger、submit-trigger 部件 gap 覆盖槽。 |
| `--xh-question-flow-action-h` | `skip-trigger`<br>`submit-trigger` | `block-size` | `default` | `--xh-_question-flow-h` | question-flow 的 skip-trigger、submit-trigger 部件 block-size 覆盖槽。 |
| `--xh-question-flow-action-px` | `skip-trigger`<br>`submit-trigger` | `padding-inline` | `default` | `--xh-_question-flow-px` | question-flow 的 skip-trigger、submit-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-question-flow-action-radius` | `skip-trigger`<br>`submit-trigger` | `border-radius` | `default` | `--xh-shape-control` | question-flow 的 skip-trigger、submit-trigger 部件 border-radius 覆盖槽。 |
| `--xh-question-flow-bg` | `root` | `background` | `default` | `--xh-_question-flow-bg` | question-flow 的 root 部件 background 覆盖槽。 |
| `--xh-question-flow-border` | `root` | `border` | `default` | `--xh-_question-flow-border` | question-flow 的 root 部件 border 覆盖槽。 |
| `--xh-question-flow-counter-fg` | `counter` | `color` | `default` | `--xh-fg-subtle` | question-flow 的 counter 部件 color 覆盖槽。 |
| `--xh-question-flow-counter-font-size` | `counter` | `font-size` | `default` | `--xh-text-caption-size` | question-flow 的 counter 部件 font-size 覆盖槽。 |
| `--xh-question-flow-dot-radius` | `item-indicator` | `border-radius` | `empty`<br>`select-mode=single` | `--xh-shape-pill` | question-flow 的 item-indicator 部件 border-radius 覆盖槽。 |
| `--xh-question-flow-dot-size` | `item-indicator` | `block-size`<br>`inline-size` | `empty`<br>`select-mode=single` | `--xh-question-flow-indicator-size` | question-flow 的 item-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-question-flow-footer-gap` | `footer` | `gap` | `default` | `--xh-space-3` | question-flow 的 footer 部件 gap 覆盖槽。 |
| `--xh-question-flow-gap` | `root` | `gap` | `default` | `--xh-_question-flow-gap` | question-flow 的 root 部件 gap 覆盖槽。 |
| `--xh-question-flow-group-gap` | `group` | `gap` | `default` | `--xh-space-1` | question-flow 的 group 部件 gap 覆盖槽。 |
| `--xh-question-flow-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=md`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | question-flow 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-question-flow-indicator-bg` | `item-indicator` | `background` | `default` | `--xh-bg-canvas` | question-flow 的 item-indicator 部件 background 覆盖槽。 |
| `--xh-question-flow-indicator-bg-checked` | `item-indicator` | `background` | `state=checked` | `--xh-_tone` | question-flow 的 item-indicator 部件 background 覆盖槽。 |
| `--xh-question-flow-indicator-border` | `item-indicator` | `border` | `default` | `--xh-border-control` | question-flow 的 item-indicator 部件 border 覆盖槽。 |
| `--xh-question-flow-indicator-border-checked` | `item-indicator` | `border-color` | `state=checked` | `--xh-_tone` | question-flow 的 item-indicator 部件 border-color 覆盖槽。 |
| `--xh-question-flow-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-_tone-on` | question-flow 的 item-indicator 部件 color 覆盖槽。 |
| `--xh-question-flow-indicator-icon-size` | `item-indicator` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | question-flow 的 item-indicator 部件 --xh-icon-size 覆盖槽。 |
| `--xh-question-flow-indicator-radius` | `item-indicator` | `border-radius` | `default` | `--xh-shape-inset` | question-flow 的 item-indicator 部件 border-radius 覆盖槽。 |
| `--xh-question-flow-indicator-radius-single` | `item-indicator` | `border-radius` | `select-mode=single` | `--xh-shape-pill` | question-flow 的 item-indicator 部件 border-radius 覆盖槽。 |
| `--xh-question-flow-indicator-size` | `item-indicator` | `block-size`<br>`inline-size` | `default`<br>`empty`<br>`select-mode=single` | `--xh-_question-flow-indicator` | question-flow 的 item-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-question-flow-item-bg` | `item` | `background` | `default` | `transparent` | question-flow 的 item 部件 background 覆盖槽。 |
| `--xh-question-flow-item-bg-hover` | `item` | `background` | `hover` | `--xh-bg-subtle-hover` | question-flow 的 item 部件 background 覆盖槽。 |
| `--xh-question-flow-item-fg` | `item` | `color` | `default` | `--xh-fg-muted` | question-flow 的 item 部件 color 覆盖槽。 |
| `--xh-question-flow-item-fg-checked` | `item` | `color` | `state=checked` | `--xh-fg-default` | question-flow 的 item 部件 color 覆盖槽。 |
| `--xh-question-flow-item-font-size` | `item` | `font-size` | `default` | `--xh-_question-flow-font-size` | question-flow 的 item 部件 font-size 覆盖槽。 |
| `--xh-question-flow-item-gap` | `item` | `gap` | `default` | `--xh-space-1_5` | question-flow 的 item 部件 gap 覆盖槽。 |
| `--xh-question-flow-item-px` | `item` | `padding-inline` | `default` | `--xh-space-2` | question-flow 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-question-flow-item-py` | `item` | `padding-block` | `default` | `--xh-space-1` | question-flow 的 item 部件 padding-block 覆盖槽。 |
| `--xh-question-flow-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | question-flow 的 item 部件 border-radius 覆盖槽。 |
| `--xh-question-flow-note-bg` | `note` | `background` | `default` | `--xh-bg-surface` | question-flow 的 note 部件 background 覆盖槽。 |
| `--xh-question-flow-note-border` | `note` | `border` | `default` | `--xh-border-control` | question-flow 的 note 部件 border 覆盖槽。 |
| `--xh-question-flow-note-fg` | `note` | `color` | `default` | `--xh-fg-default` | question-flow 的 note 部件 color 覆盖槽。 |
| `--xh-question-flow-note-font-size` | `note` | `font-size` | `default` | `--xh-_question-flow-font-size` | question-flow 的 note 部件 font-size 覆盖槽。 |
| `--xh-question-flow-note-px` | `note` | `padding-inline` | `default` | `--xh-space-2` | question-flow 的 note 部件 padding-inline 覆盖槽。 |
| `--xh-question-flow-note-py` | `note` | `padding-block` | `default` | `--xh-space-1_5` | question-flow 的 note 部件 padding-block 覆盖槽。 |
| `--xh-question-flow-note-radius` | `note` | `border-radius` | `default` | `--xh-shape-control` | question-flow 的 note 部件 border-radius 覆盖槽。 |
| `--xh-question-flow-padding` | `root` | `padding` | `default` | `--xh-_question-flow-p` | question-flow 的 root 部件 padding 覆盖槽。 |
| `--xh-question-flow-placeholder-fg` | `note` | `color` | `placeholder` | `--xh-fg-subtle` | question-flow 的 note 部件 color 覆盖槽。 |
| `--xh-question-flow-prompt-fg` | `prompt` | `color` | `default` | `--xh-fg-default` | question-flow 的 prompt 部件 color 覆盖槽。 |
| `--xh-question-flow-prompt-font-size` | `prompt` | `font-size` | `default` | `--xh-text-label-size` | question-flow 的 prompt 部件 font-size 覆盖槽。 |
| `--xh-question-flow-prompt-font-weight` | `prompt` | `font-weight` | `default` | `--xh-text-label-weight` | question-flow 的 prompt 部件 font-weight 覆盖槽。 |
| `--xh-question-flow-question-gap` | `question` | `gap` | `default` | `--xh-space-2` | question-flow 的 question 部件 gap 覆盖槽。 |
| `--xh-question-flow-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | question-flow 的 root 部件 border-radius 覆盖槽。 |
| `--xh-question-flow-result-bg` | `result` | `background` | `default` | `--xh-bg-subtle` | question-flow 的 result 部件 background 覆盖槽。 |
| `--xh-question-flow-result-fg` | `result` | `color` | `default` | `--xh-fg-success` | question-flow 的 result 部件 color 覆盖槽。 |
| `--xh-question-flow-result-font-size` | `result` | `font-size` | `default` | `--xh-text-caption-size` | question-flow 的 result 部件 font-size 覆盖槽。 |
| `--xh-question-flow-result-font-weight` | `result` | `font-weight` | `default` | `--xh-text-label-weight` | question-flow 的 result 部件 font-weight 覆盖槽。 |
| `--xh-question-flow-result-gap` | `result` | `gap` | `default` | `--xh-space-1_5` | question-flow 的 result 部件 gap 覆盖槽。 |
| `--xh-question-flow-result-px` | `result` | `padding-inline` | `default` | `--xh-space-2` | question-flow 的 result 部件 padding-inline 覆盖槽。 |
| `--xh-question-flow-result-py` | `result` | `padding-block` | `default` | `--xh-space-1` | question-flow 的 result 部件 padding-block 覆盖槽。 |
| `--xh-question-flow-result-radius` | `result` | `border-radius` | `default` | `--xh-shape-pill` | question-flow 的 result 部件 border-radius 覆盖槽。 |
| `--xh-question-flow-shadow` | `root` | `box-shadow` | `default` | `--xh-elevation-raised` | question-flow 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-question-flow-skip-bg` | `skip-trigger` | `background` | `default` | `transparent` | question-flow 的 skip-trigger 部件 background 覆盖槽。 |
| `--xh-question-flow-skip-bg-hover` | `skip-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | question-flow 的 skip-trigger 部件 background 覆盖槽。 |
| `--xh-question-flow-skip-fg` | `skip-trigger` | `color` | `default` | `--xh-fg-muted` | question-flow 的 skip-trigger 部件 color 覆盖槽。 |
| `--xh-question-flow-skip-fg-hover` | `skip-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-default` | question-flow 的 skip-trigger 部件 color 覆盖槽。 |
| `--xh-question-flow-step-bg` | `next-trigger`<br>`prev-trigger` | `background` | `default` | `transparent` | question-flow 的 next-trigger、prev-trigger 部件 background 覆盖槽。 |
| `--xh-question-flow-step-bg-hover` | `next-trigger`<br>`prev-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | question-flow 的 next-trigger、prev-trigger 部件 background 覆盖槽。 |
| `--xh-question-flow-step-fg` | `next-trigger`<br>`prev-trigger` | `color` | `default` | `--xh-fg-subtle` | question-flow 的 next-trigger、prev-trigger 部件 color 覆盖槽。 |
| `--xh-question-flow-step-fg-hover` | `next-trigger`<br>`prev-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-default` | question-flow 的 next-trigger、prev-trigger 部件 color 覆盖槽。 |
| `--xh-question-flow-step-padding` | `next-trigger`<br>`prev-trigger` | `padding` | `default` | `--xh-space-0` | question-flow 的 next-trigger、prev-trigger 部件 padding 覆盖槽。 |
| `--xh-question-flow-step-radius` | `next-trigger`<br>`prev-trigger` | `border-radius` | `default` | `--xh-shape-inset` | question-flow 的 next-trigger、prev-trigger 部件 border-radius 覆盖槽。 |
| `--xh-question-flow-step-size` | `next-trigger`<br>`prev-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | question-flow 的 next-trigger、prev-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-question-flow-submit-bg` | `submit-trigger` | `background` | `default` | `--xh-_tone` | question-flow 的 submit-trigger 部件 background 覆盖槽。 |
| `--xh-question-flow-submit-bg-active` | `submit-trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-_tone-active` | question-flow 的 submit-trigger 部件 background 覆盖槽。 |
| `--xh-question-flow-submit-bg-hover` | `submit-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-_tone-hover` | question-flow 的 submit-trigger 部件 background 覆盖槽。 |
| `--xh-question-flow-submit-bg-off` | `submit-trigger` | `background` | `disabled` | `--xh-bg-muted` | question-flow 的 submit-trigger 部件 background 覆盖槽。 |
| `--xh-question-flow-submit-fg` | `submit-trigger` | `color` | `default` | `--xh-_tone-on` | question-flow 的 submit-trigger 部件 color 覆盖槽。 |
| `--xh-question-flow-submit-shadow` | `submit-trigger` | `box-shadow` | `default` | `--xh-_question-flow-submit-highlight` | question-flow 的 submit-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-question-flow-track-gap` | `track` | `gap` | `default` | `--xh-_question-flow-gap` | question-flow 的 track 部件 gap 覆盖槽。 |
| `--xh-question-flow-track-y` | `track` | `translate` | `default` | `--xh-_question-flow-track-y` | question-flow 的 track 部件 translate 覆盖槽。 |
| `--xh-question-flow-viewport-h` | `viewport` | `block-size` | `default` | `--xh-_question-flow-viewport-h` | question-flow 的 viewport 部件 block-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-question-flow-in` · `xh-question-flow-result-in` · `xh-rise-in` 随皮肤自带，不引用别处文件里的名字；`background` · `block-size` · `border-color` · `box-shadow` · `color` · `opacity` · `scale` · `translate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 步进计数器想做成里程表那样逐位滚动：把 `counter` 当容器，
  数字交给[数值动画](./number-animation)，判定权仍在本组件手里。
- 问卷收上来之后要接着执行危险动作：把[审批](./approval)排在它后面，两件事分开——
  问卷收的是「怎么做」，闸门收的是「做不做」。
- 装进[对话框](./dialog)时把 `initialFocus` 指到当前题的第一个选项上，
  打开即可直接用方向键作答。

## 最佳实践

- 题目控制在三到五道：这是「动手前问一句」，不是问卷调查。
- 单选题的选项写成互斥的完整答案，别让人靠自由文本补充关键信息。
- 提交之后卡片不会自己消失：**宿主要在 `onSubmit` 里决定接下来做什么**，
  想让它留在原地就渲 `result` 那一格。

## 反模式

- 用它承载不可逆的动作确认：问卷没有「拒绝」这条路，跳过与不答都会让流程继续往下走。
- 把 `counter` 的文字当播报：那一格对读屏隐藏，改它不会让任何人听见。
- 关掉自动前进的同时把继续键也藏了：那样单选题就再没有出口。

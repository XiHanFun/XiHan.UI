var e=`<!-- 竖排布局与兜底字形 | 写一层输入行，root 即切换为竖排：输入行在上、动作行在下；按钮留空时皮肤按身份绘制箭头或停止方块 -->
<script setup lang="ts">
import type { PromptInputSubmitKey } from "@xihan-ui/headless";
import {
  XhCheckbox,
  XhPromptInputControl,
  XhPromptInputInput,
  XhPromptInputRoot,
  XhPromptInputSubmitTrigger,
  XhSelectRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const submitKeys = [
  { value: "enter", label: "Enter 提交" },
  { value: "mod-enter", label: "Ctrl/Cmd+Enter 提交" },
  { value: "none", label: "只用按钮提交" },
];

// 选择器的值恒为数组，单选即长度 1
const submitKey = ref<string[]>(["enter"]);
const loading = ref(false);
const sent = ref<string[]>([]);
<\/script>

<template>
  <XhPromptInputRoot
    v-slot="{ value }"
    :loading="loading"
    :submit-key="submitKey[0] as PromptInputSubmitKey"
    :translations="{ input: '给助手写点什么' }"
    @submit="sent.push($event.value)"
    @stop="loading = false"
  >
    <XhPromptInputControl>
      <XhPromptInputInput rows="1" placeholder="给助手写点什么…" />
      <XhPromptInputSubmitTrigger />
    </XhPromptInputControl>
    <div style="display: flex; align-items: center; gap: 12px; font-size: 12px;">
      <XhCheckbox v-model:checked="loading" size="sm">生成中</XhCheckbox>
      <XhSelectRoot v-model:value="submitKey" :collection="submitKeys" size="sm" />
      <span style="margin-inline-start: auto;">{{ value.length }} 字</span>
    </div>
  </XhPromptInputRoot>
  <p data-demo-output>已发出：{{ sent.join(" / ") || "（无）" }}</p>
</template>
`;export{e as default};
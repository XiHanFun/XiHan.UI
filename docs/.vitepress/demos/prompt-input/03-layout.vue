<!-- 竖排布局与兜底字形 | 写一层输入行，root 就翻成竖排：输入行在上、动作行在下；按钮留空时皮肤按身份画上箭头或停止方块 -->
<script setup lang="ts">
import { XhPromptInputInput, XhPromptInputInputRow, XhPromptInputRoot, XhPromptInputSubmitTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const submitKey = ref<"enter" | "mod-enter" | "none">("enter");
const busy = ref(false);
const sent = ref<string[]>([]);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <XhPromptInputRoot
      v-slot="{ value }"
      :busy="busy"
      :submit-key="submitKey"
      :translations="{ input: '给助手写点什么' }"
      @submit="sent.push($event.value)"
      @stop="busy = false"
    >
      <XhPromptInputInputRow>
        <XhPromptInputInput rows="1" placeholder="给助手写点什么…" />
        <XhPromptInputSubmitTrigger />
      </XhPromptInputInputRow>
      <div style="display: flex; align-items: center; gap: 12px; font-size: 12px;">
        <label style="display: inline-flex; align-items: center; gap: 4px;">
          <input v-model="busy" type="checkbox" />
          生成中
        </label>
        <select v-model="submitKey" aria-label="按哪一档提交">
          <option value="enter">Enter 提交</option>
          <option value="mod-enter">Ctrl/Cmd+Enter 提交</option>
          <option value="none">只用按钮提交</option>
        </select>
        <span style="margin-inline-start: auto;">{{ value.length }} 字</span>
      </div>
    </XhPromptInputRoot>
    <p v-if="sent.length" style="margin: 0;">已发出：{{ sent.join(" / ") }}</p>
  </div>
</template>

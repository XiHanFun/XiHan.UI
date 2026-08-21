const n=`<!-- 过滤输入 | 写回这一步由宿主说了算：把不要的字符滤掉再落回去，框里留下的始终是滤过的那一份 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhComposerInput, XhComposerRoot, XhComposerSubmitTrigger } from "@xihan-ui/vue";

const log = ref("（还没发过）");

// 只留数字与空格
function digits(text: string): string {
  return text.replace(/[^\\d ]/g, "");
}

function onSubmit(details: { value: string }): void {
  log.value = \`提交：\${details.value}\`;
}
<\/script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhComposerRoot v-slot="{ value, setValue }" @submit="onSubmit">
      <!-- 输入框自己的写回先跑，这一手紧随其后把值改成滤过的 -->
      <XhComposerInput
        placeholder="敲几个字母试试，只有数字留得下"
        rows="1"
        @input="setValue(digits(($event.target as HTMLTextAreaElement).value))"
      />
      <span style="font-size: 13px; white-space: nowrap">{{ value.length }} 位</span>
      <XhComposerSubmitTrigger>发送</XhComposerSubmitTrigger>
    </XhComposerRoot>
    <span>{{ log }}</span>
  </div>
</template>
`;export{n as default};

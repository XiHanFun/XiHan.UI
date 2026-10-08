var e=`<!-- 附件 | 选中的文件以可关闭的标签排在输入行下方，发送时与正文一起交给宿主；文件选择器是宿主自己的原生 input，框里只放触发它的按钮 -->
<script setup lang="ts">
import {
  XhButton,
  XhPromptInputControl,
  XhPromptInputInput,
  XhPromptInputRoot,
  XhPromptInputSubmitTrigger,
  XhTagCloseTrigger,
  XhTagLabel,
  XhTagRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

interface Attachment {
  id: number;
  name: string;
}

const attachments = ref<Attachment[]>([]);
const picker = ref<HTMLInputElement | null>(null);
const log = ref("（还没发过）");
let seq = 0;

function pick(event: Event) {
  const input = event.target as HTMLInputElement;
  for (const file of input.files ?? [])
    attachments.value.push({ id: ++seq, name: file.name });
  // 清掉选择器的值：删掉的文件还能再选一次
  input.value = "";
}

function send(value: string) {
  const names = attachments.value.map(item => item.name);
  log.value = names.length ? \`提交：\${value}（附件：\${names.join("、")}）\` : \`提交：\${value}\`;
  attachments.value = [];
}
<\/script>

<template>
  <div style="display: grid; gap: 12px">
    <XhPromptInputRoot :translations="{ input: '给助手写点什么' }" @submit="send($event.value)">
      <XhPromptInputControl>
        <XhPromptInputInput rows="1" placeholder="写点什么，可以附上文件…" />
        <XhPromptInputSubmitTrigger />
      </XhPromptInputControl>
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
        <input ref="picker" type="file" multiple hidden @change="pick">
        <XhButton variant="ghost" size="sm" @click="picker?.click()">
          添加附件
        </XhButton>
        <XhTagRoot
          v-for="item in attachments"
          :key="item.id"
          variant="subtle"
          closable
          :open="true"
          :translations="{ close: \`移除 \${item.name}\` }"
          @open-change="attachments = attachments.filter(other => other.id !== item.id)"
        >
          <XhTagLabel>{{ item.name }}</XhTagLabel>
          <XhTagCloseTrigger />
        </XhTagRoot>
      </div>
    </XhPromptInputRoot>
    <span>{{ log }}</span>
  </div>
</template>
`;export{e as default};
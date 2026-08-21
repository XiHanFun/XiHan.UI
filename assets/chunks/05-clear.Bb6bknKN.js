const n=`<!-- 框里的附加按钮 | root 里除输入与发送外还能放自己的节点；值的读写归宿主，清空这类操作就在框内完成 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhComposerInput,
  XhComposerRoot,
  XhComposerSubmitTrigger,
} from "@xihan-ui/vue";

const log = ref("（还没发过）");

function onSubmit(details: { value: string }): void {
  log.value = \`提交：\${details.value}\`;
}
<\/script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhComposerRoot
      v-slot="{ value, setValue }"
      default-value="这一台在输入框两侧各放了一颗自己的按钮"
      @submit="onSubmit"
    >
      <XhButton variant="ghost" size="sm">附件</XhButton>
      <XhComposerInput placeholder="说点什么…" rows="1" />
      <!-- 有内容才给清空，清空后按钮自己转灰 -->
      <XhButton variant="ghost" size="sm" :disabled="value === ''" @click="setValue('')">
        清空
      </XhButton>
      <XhComposerSubmitTrigger>发送</XhComposerSubmitTrigger>
    </XhComposerRoot>
    <span>{{ log }}</span>
  </div>
</template>
`;export{n as default};

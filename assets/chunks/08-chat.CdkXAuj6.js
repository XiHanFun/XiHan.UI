const e=`<!-- 聊天流 | anchor 设为 end：从最新一条看起，贴底时新消息继续贴底；往前翻出历史时，给了 getItemKey 视口不跳 -->
<script setup lang="ts">
import {
  XhButton,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";
import { ref } from "vue";

interface Message {
  id: number;
  text: string;
}

let oldest = 0;
let newest = 0;
const messages = ref<Message[]>(Array.from({ length: 30 }, () => ({ id: newest, text: \`消息 \${newest++}\` })));

// 历史往前插：身份是消息 id，原来视口里第一条留在原处
function loadOlder(): void {
  const older = Array.from({ length: 20 }, () => {
    oldest -= 1;
    return { id: oldest, text: \`历史 \${-oldest}\` };
  }).reverse();
  messages.value = [...older, ...messages.value];
}

function send(): void {
  messages.value = [...messages.value, { id: newest, text: \`消息 \${newest++}\` }];
}
<\/script>

<template>
  <div style="display: grid; gap: 8px; inline-size: 100%; max-inline-size: 420px">
    <div style="display: flex; gap: 8px">
      <XhButton size="sm" variant="outline" @click="loadOlder">加载更早</XhButton>
      <XhButton size="sm" @click="send">发送一条</XhButton>
    </div>
    <XhVirtualizerRoot
      v-slot="{ virtualItems }"
      :count="messages.length"
      :estimate-size="36"
      :get-item-key="(index: number) => messages[index]!.id"
      anchor="end"
      style="block-size: 240px"
    >
      <XhVirtualizerViewport>
        <XhVirtualizerContent>
          <XhVirtualizerItem
            v-for="item in virtualItems"
            :key="item.key"
            :value="item.index"
            style="display: flex; align-items: center; height: 36px; padding-inline: 12px; border-block-end: 1px solid var(--xh-border-subtle)"
          >
            {{ messages[item.index]!.text }}
          </XhVirtualizerItem>
        </XhVirtualizerContent>
      </XhVirtualizerViewport>
    </XhVirtualizerRoot>
  </div>
</template>
`;export{e as default};

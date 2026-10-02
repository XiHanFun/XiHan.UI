const t=`<!-- 拖动与贴边 | 按住页面右侧的触发器拖到别处，松手贴到近的那条边；位置按比例记，宿主存下来下次照样落在原处 -->
<script setup lang="ts">
import type { FloatButtonPosition } from "@xihan-ui/headless";
import { MessageCircleIcon, ShareIcon } from "@xihan-ui/icons";
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger, XhIcon } from "@xihan-ui/vue";
import { ref } from "vue";

const position = ref<FloatButtonPosition>({ edge: "inline-end", ratio: 0.75 });
<\/script>

<template>
  <p>当前位置：{{ JSON.stringify(position) }}</p>
  <XhFloatButtonRoot v-model:position="position" draggable>
    <XhFloatButtonTrigger />
    <XhFloatButtonList>
      <button type="button" aria-label="消息"><XhIcon :icon="MessageCircleIcon" /></button>
      <button type="button" aria-label="分享"><XhIcon :icon="ShareIcon" /></button>
    </XhFloatButtonList>
  </XhFloatButtonRoot>
</template>
`;export{t as default};

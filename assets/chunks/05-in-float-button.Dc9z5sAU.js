var e=`<!-- 放进浮动按钮 | 作为浮动按钮展开列表里的一项，根按列表排布 -->
<script setup lang="ts">
import { MessageCircleIcon } from "@xihan-ui/icons";
import {
  XhBackTopRoot,
  XhBackTopTrigger,
  XhFloatButtonList,
  XhFloatButtonRoot,
  XhFloatButtonTrigger,
  XhIcon,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhFloatButtonRoot style="position: static" default-open>
    <XhFloatButtonTrigger />
    <XhFloatButtonList>
      <XhBackTopRoot style="position: static">
        <XhBackTopTrigger />
      </XhBackTopRoot>
      <button type="button" aria-label="消息"><XhIcon :icon="MessageCircleIcon" /></button>
    </XhFloatButtonList>
  </XhFloatButtonRoot>
</template>
`;export{e as default};
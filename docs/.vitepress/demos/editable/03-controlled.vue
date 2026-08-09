<!-- 受控 | value 与 edit 都能受控，传了就由宿主说了算，用户交互只发出意图；外部按钮同样进得了编辑态 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhEditableArea,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
} from "@xihan-ui/vue";

const signature = ref("这个人很懒");
const editing = ref(false);
</script>

<template>
  <XhEditableRoot v-model:value="signature" v-model:edit="editing" placeholder="未填写">
    <XhEditableLabel>签名</XhEditableLabel>
    <XhEditableArea>
      <XhEditablePreview />
      <XhEditableInput />
    </XhEditableArea>
  </XhEditableRoot>
  <span>当前：{{ signature || "（空）" }} · {{ editing ? "编辑中" : "预览中" }}</span>
  <button type="button" @click="editing = true">从外部进编辑态</button>
</template>

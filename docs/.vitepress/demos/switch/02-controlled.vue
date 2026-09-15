<!-- 受控 | 传入 checked 后由宿主决定，组件自身不再修改状态；变化意图经 checked-change 发出，写回后才落位 -->
<script setup lang="ts">
import { XhSwitch } from "@xihan-ui/vue";
import { ref } from "vue";

const checked = ref(true);
</script>

<template>
  <XhSwitch v-model:checked="checked" />
  <span>当前：{{ checked ? "开" : "关" }}</span>
</template>

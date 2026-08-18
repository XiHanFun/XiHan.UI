<!-- 受控 | 传了 checked 就由宿主说了算，组件自己不再改状态；变化意图从 checked-change 出来，写回才落位 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhSwitch } from "@xihan-ui/vue";

const checked = ref(true);
</script>

<template>
  <XhSwitch v-model:checked="checked" />
  <span>当前：{{ checked ? "开" : "关" }}</span>
</template>

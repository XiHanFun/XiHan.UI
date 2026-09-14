<!-- 不确定状态 | 表示部分选中 -->
<script setup lang="ts">
import { XhCheckbox } from "@xihan-ui/vue";
import { ref } from "vue";

const checked = ref<boolean | "indeterminate">("indeterminate");
</script>

<template>
  <XhCheckbox v-model:checked="checked">选择全部</XhCheckbox>
</template>

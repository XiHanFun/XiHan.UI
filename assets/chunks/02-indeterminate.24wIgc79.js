const e=`<!-- 三态 | checked 传 "indeterminate" 表示部分选中，它不是第三个稳定态：点一下就落到 true -->
<script setup lang="ts">
import { ref } from "vue";
import { XhCheckbox } from "@xihan-ui/vue";

const checked = ref<boolean | "indeterminate">("indeterminate");
<\/script>

<template>
  <XhCheckbox v-model:checked="checked" />
  <span>当前：{{ checked }}</span>
</template>
`;export{e as default};

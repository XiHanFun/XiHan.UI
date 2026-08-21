const n=`<!-- 填满才可提交 | 每格都有字才算填满，作者据此点亮提交按钮；重填一次清空整组 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/vue";

const submitted = ref("");

function reset(clear: () => void) {
  clear();
  submitted.value = "";
}
<\/script>

<template>
  <XhPinInputRoot v-slot="{ complete, valueAsString, clear }" :length="4" placeholder="·">
    <XhPinInputLabel>兑换码</XhPinInputLabel>
    <div style="display: flex">
      <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
    </div>
    <div style="display: flex; gap: 8px">
      <button type="button" :disabled="!complete" @click="submitted = valueAsString">
        提交
      </button>
      <button type="button" @click="reset(clear)">重填</button>
    </div>
    <span>{{ submitted ? "已提交：" + submitted : "四格都填满才能提交" }}</span>
  </XhPinInputRoot>
</template>
`;export{n as default};

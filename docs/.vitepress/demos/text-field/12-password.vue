<!-- 密码与明暗切换 | 写在 input 部件上的 type 盖过默认的 text，明暗由宿主的一个布尔翻转 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhTextFieldInput, XhTextFieldLabel, XhTextFieldRoot } from "@xihan-ui/vue";

const visible = ref(false);
</script>

<template>
  <XhTextFieldRoot placeholder="请输入密码" :max-length="20">
    <XhTextFieldLabel>密码</XhTextFieldLabel>
    <div style="display: flex; gap: 4px">
      <XhTextFieldInput
        style="inline-size: 200px"
        :type="visible ? 'text' : 'password'"
        autocomplete="current-password"
      />
      <button type="button" :aria-pressed="visible" @click="visible = !visible">
        {{ visible ? "隐藏" : "显示" }}
      </button>
    </div>
  </XhTextFieldRoot>
</template>

<!-- 开关监听 | enabled 只控制行为，KbdGroup 的 disabled 由业务显式同步 -->
<script setup lang="ts">
import { XhHotkeys, XhKbdGroup } from "@xihan-ui/vue";
import { ref } from "vue";

const enabled = ref(true);
const hits = ref(0);
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <label style="display: flex; align-items: center; gap: 4px">
      <input v-model="enabled" type="checkbox">
      监听生效
    </label>
    <XhKbdGroup :keys="['Mod', 'B']" :disabled="!enabled" />
    <XhHotkeys :keys="['Mod', 'B']" :enabled="enabled" @hot-key="hits += 1" />
    <span>已触发 {{ hits }} 次</span>
  </div>
</template>

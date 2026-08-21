const e=`<!-- 开关监听 | enabled 关掉后组合不再触发，键帽也转成不可用的样子 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhHotkeys } from "@xihan-ui/vue";

const enabled = ref(true);
const hits = ref(0);
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <label style="display: flex; align-items: center; gap: 4px">
      <input v-model="enabled" type="checkbox" />
      监听生效
    </label>
    <XhHotkeys :keys="['Mod', 'B']" :enabled="enabled" @hot-key="hits += 1" />
    <span>已触发 {{ hits }} 次</span>
  </div>
</template>
`;export{e as default};

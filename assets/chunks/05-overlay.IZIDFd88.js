const n=`<!-- 盖住等待中的内容 | 转圈浮在内容上方，容器同时报 aria-busy，看得见的与念得出的是同一件事 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhSpinner } from "@xihan-ui/vue";

const busy = ref(true);

// 遮罩铺满被等待的那块内容，底色兑透明，下面的内容还看得见轮廓
const overlayStyle = [
  "position: absolute",
  "inset: 0",
  "display: grid",
  "place-items: center",
  "border-radius: 8px",
  "background: color-mix(in oklab, var(--xh-bg-surface) 72%, transparent)",
].join("; ");
<\/script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <button type="button" @click="busy = !busy">
      {{ busy ? "数据回来了" : "重新加载" }}
    </button>

    <!-- 内容留在原位，转圈叠在上面，加载前后布局不跳 -->
    <div
      :aria-busy="busy"
      style="
        position: relative;
        inline-size: 260px;
        padding: 16px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <p style="margin: 0">本季新增客户 128 家，环比增长 12%。</p>
      <div v-if="busy" :style="overlayStyle">
        <XhSpinner label="正在刷新报表" />
      </div>
    </div>
  </div>
</template>
`;export{n as default};

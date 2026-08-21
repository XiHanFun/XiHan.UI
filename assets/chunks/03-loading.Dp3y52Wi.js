const n=`<!-- 加载结束 | loading 期间容器报 aria-busy，翻成 false 后整块收起，位置让给真内容 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhSkeletonBone, XhSkeletonRoot } from "@xihan-ui/vue";

const loading = ref(true);
<\/script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <button type="button" @click="loading = !loading">
      {{ loading ? "数据回来了" : "重新加载" }}
    </button>

    <XhSkeletonRoot :loading="loading" style="inline-size: 260px">
      <XhSkeletonBone />
      <XhSkeletonBone />
    </XhSkeletonRoot>

    <p v-if="!loading" style="margin: 0">这两行是接口回来之后的真内容。</p>
  </div>
</template>
`;export{n as default};

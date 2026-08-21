const t=`<!-- 命令式聚焦 | 节点由作者自己写，DOM 引用因此拿得到：聚焦、失焦与翻转都走命令式 -->
<script setup lang="ts">
import { ref } from "vue";
import { useCheckbox } from "@xihan-ui/vue";

const { api } = useCheckbox({});
const box = ref<HTMLButtonElement | null>(null);
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <!-- 两个节点与组件外壳渲染的是同一套：属性来自 getRootProps 与 getIndicatorProps -->
    <button ref="box" v-bind="api.getRootProps()">
      <span v-bind="api.getIndicatorProps()" />
    </button>
    <button type="button" @click="box?.focus()">聚焦</button>
    <button type="button" @click="box?.blur()">失焦</button>
    <button type="button" @click="api.setChecked(!api.checked)">翻转</button>
    <span>当前：{{ api.checked ? "已勾选" : "未勾选" }}</span>
  </div>
</template>
`;export{t as default};

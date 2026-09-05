<!-- 三种相位 | 空、在途、还有更多各有部件：给了 collection 时前两者的收放归组件，取下一页那颗钮点了做什么归你 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhListboxContent,
  XhListboxEmpty,
  XhListboxItem,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxLoadMoreTrigger,
  XhListboxLoading,
  XhListboxRoot,
} from "@xihan-ui/vue";

const pool = [
  { value: "liuyi", label: "刘一" },
  { value: "chener", label: "陈二" },
  { value: "zhangsan", label: "张三" },
  { value: "lisi", label: "李四" },
  { value: "wangwu", label: "王五" },
  { value: "zhaoliu", label: "赵六" },
];

const members = ref(pool.slice(0, 3));
const loading = ref(false);
const picked = ref<string[]>([]);

function loadMore() {
  loading.value = true;
  window.setTimeout(() => {
    members.value = pool.slice(0, members.value.length + 3);
    loading.value = false;
  }, 600);
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px; max-inline-size: 320px">
    <XhListboxRoot
      v-model:value="picked"
      :collection="members"
      :loading="loading"
    >
      <XhListboxLabel>成员</XhListboxLabel>
      <XhListboxContent>
        <XhListboxItem v-for="m in members" :key="m.value" :value="m.value">
          <XhListboxItemText>{{ m.label }}</XhListboxItemText>
          <XhListboxItemIndicator />
        </XhListboxItem>
      </XhListboxContent>
      <XhListboxEmpty>还没有成员，先取一页试试</XhListboxEmpty>
      <XhListboxLoading>正在取成员…</XhListboxLoading>
      <XhListboxLoadMoreTrigger
        v-if="members.length < pool.length"
        @click="loadMore"
      >
        取下一页
      </XhListboxLoadMoreTrigger>
    </XhListboxRoot>
    <button type="button" @click="members = []">清空</button>
  </div>
  <p>已选：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>

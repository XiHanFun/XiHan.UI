const n=`<!-- 远程检索 | filter 关掉：交进来的 collection 就是此刻该显示的那几条，筛选归服务端；取数期间 loading 让在途占位顶上来、列表压暗一档，空态让位 -->
<script setup lang="ts">
import type { CommandNode } from "@xihan-ui/headless";
import {
  XhCommandContent,
  XhCommandEmpty,
  XhCommandFooter,
  XhCommandInput,
  XhCommandItem,
  XhCommandItemText,
  XhCommandList,
  XhCommandLoading,
  XhCommandRoot,
  XhCommandTrigger,
} from "@xihan-ui/vue";
import { onBeforeUnmount, ref, watch } from "vue";

// 站在服务端那一头的整份名册，示例里用一次延迟冒充网络
const roster = [
  { value: "zhangsan", label: "张三 · 平台组" },
  { value: "lisi", label: "李四 · 平台组" },
  { value: "wangwu", label: "王五 · 交易组" },
  { value: "zhaoliu", label: "赵六 · 交易组" },
  { value: "sunqi", label: "孙七 · 风控组" },
];

const open = ref(false);
const query = ref("");
const loading = ref(false);
const results = ref<CommandNode[]>(roster.slice(0, 3));
const picked = ref("还没选过人");

let timer = 0;
// 回来的顺序不保证与发出的顺序一致，只认最后一次请求的结果
let latest = 0;

watch(query, (keyword) => {
  window.clearTimeout(timer);
  loading.value = true;
  const seq = ++latest;
  timer = window.setTimeout(() => {
    if (seq !== latest) {
      return;
    }
    const text = keyword.trim();
    results.value = text ? roster.filter(one => one.label.includes(text)) : roster.slice(0, 3);
    loading.value = false;
  }, 400);
});

onBeforeUnmount(() => window.clearTimeout(timer));

function onSelect(details: { label: string }) {
  picked.value = \`选了：\${details.label}\`;
}
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhCommandRoot
      v-model:open="open"
      v-model:input-value="query"
      :collection="results"
      :filter="false"
      :loading="loading"
      placeholder="搜同事…"
      @select="onSelect"
    >
      <template #default>
        <XhCommandTrigger>找一个人</XhCommandTrigger>
        <XhCommandContent>
          <XhCommandInput />
          <!-- 交进来的就是该显示的那几条，这里照单铺开 -->
          <XhCommandList>
            <XhCommandItem v-for="one in results" :key="one.value" :value="one.value">
              <XhCommandItemText>{{ one.label }}</XhCommandItemText>
            </XhCommandItem>
          </XhCommandList>
          <XhCommandEmpty>名册里没有这个人</XhCommandEmpty>
          <XhCommandLoading>正在从服务端取…</XhCommandLoading>
          <XhCommandFooter>不输字时给的是最近协作过的三位</XhCommandFooter>
        </XhCommandContent>
      </template>
    </XhCommandRoot>
    <span>{{ picked }}</span>
  </div>
</template>
`;export{n as default};

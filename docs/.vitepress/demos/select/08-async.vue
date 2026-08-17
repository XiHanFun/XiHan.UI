<!-- 异步加载选项 | 首次展开才去取数据：open-change 报出展开意图，数据到达前用一条禁用条目占位 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhSelectContent,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";

interface Song {
  value: string;
  label: string;
}

const value = ref<string[]>([]);
const songs = ref<Song[]>([]);
const loading = ref(false);
let requested = false;

// 展开一次即发起请求，拿到数据后不再重复取
function onOpenChange(details: { open: boolean }): void {
  if (!details.open || requested) return;
  requested = true;
  loading.value = true;
  window.setTimeout(() => {
    songs.value = [
      { value: "song1", label: "起风了" },
      { value: "song2", label: "夜空中最亮的星" },
      { value: "song3", label: "海阔天空" },
      { value: "song4", label: "晴天" },
    ];
    loading.value = false;
  }, 800);
}
</script>

<template>
  <XhSelectRoot v-model:value="value" placeholder="请选择" @open-change="onOpenChange">
    <XhSelectLabel>曲目</XhSelectLabel>
    <XhSelectTrigger>
      <XhSelectValueText />
      <XhSelectIndicator>▾</XhSelectIndicator>
    </XhSelectTrigger>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <XhSelectItem v-if="loading" value="loading" disabled>
            <XhSelectItemText>加载中…</XhSelectItemText>
          </XhSelectItem>
          <XhSelectItem v-for="s in songs" :key="s.value" :value="s.value">
            <XhSelectItemText>{{ s.label }}</XhSelectItemText>
            <XhSelectItemIndicator>✓</XhSelectItemIndicator>
          </XhSelectItem>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
  <p>当前值：{{ value[0] ?? "（未选）" }}</p>
</template>

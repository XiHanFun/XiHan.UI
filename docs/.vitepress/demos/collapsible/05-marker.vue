<!-- 自定义展开标记 | 往指示符部件里塞自己的图形，转向仍由皮肤按 open 接管 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhCollapsibleContent,
  XhCollapsibleIndicator,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
  XhIcon,
} from "@xihan-ui/vue";
import { ChevronDownIcon } from "@xihan-ui/icons";

const open = ref(false);
</script>

<template>
  <div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
    <XhCollapsibleRoot v-model:open="open">
      <XhCollapsibleTrigger>
        <span>高级筛选</span>
        <span style="font-size: 12px; display: inline-flex; align-items: center; gap: 2px">
          {{ open ? "收起" : "展开" }}
          <!-- 部件里放什么归作者；transform 由皮肤跟着 data-state 打 -->
          <XhCollapsibleIndicator>
            <XhIcon :icon="ChevronDownIcon" />
          </XhCollapsibleIndicator>
        </span>
      </XhCollapsibleTrigger>
      <XhCollapsibleContent>
        创建时间、负责人、标签这些不常用的条件收在这里。
      </XhCollapsibleContent>
    </XhCollapsibleRoot>
  </div>
</template>

<!-- 标题栏附加信息 | 标题栏里的节点全归作者，把计数与指示器包成一组排在末尾 -->
<script setup lang="ts">
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from "@xihan-ui/vue";

const groups = [
  { value: "todo", label: "待处理", extra: "3 项", body: "还没有人认领。" },
  { value: "doing", label: "进行中", extra: "1 项", body: "预计今天完成。" },
  { value: "done", label: "已完成", extra: "12 项", body: "本周已归档。" },
];
</script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhAccordionRoot :default-value="['todo']">
      <XhAccordionItem v-for="g in groups" :key="g.value" :value="g.value">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>{{ g.label }}</span>
            <!-- 附加信息与指示器同属末尾这一组，标题栏两端对齐照旧生效 -->
            <span style="display: flex; align-items: center; gap: 8px; font-size: 12px">
              <span>{{ g.extra }}</span>
              <XhAccordionIndicator />
            </span>
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>{{ g.body }}</XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>
  </div>
</template>

<!-- 级别 | 行上写 level，四档 debug / info / warn / error 由皮肤染色；时间戳与行内标记仍归作者 -->
<script setup lang="ts">
import type { LogLevel } from "@xihan-ui/headless";
import { XhLogContent, XhLogLine, XhLogRoot, XhLogViewport } from "@xihan-ui/vue";

const raw: { time: string; level: LogLevel; text: string }[] = [
  { time: "12:00:01", level: "debug", text: "读取配置 config/app.yaml" },
  { time: "12:00:02", level: "info", text: "数据库连接池就绪" },
  { time: "12:00:04", level: "info", text: "POST /api/orders  201  118ms" },
  { time: "12:00:05", level: "warn", text: "慢查询 1,240ms  select * from orders" },
  { time: "12:00:06", level: "error", text: "支付网关超时，第 1 次重试" },
  { time: "12:00:08", level: "info", text: "支付网关恢复，订单 8812 已确认" },
];

// 级别也写成定宽文字标签：颜色之外还有一层不靠色觉的通道。
// 段与段的间隔补进字符串，模板里不留会被折叠的空白
const entries = raw.map(entry => ({
  text: entry.text,
  time: `${entry.time}  `,
  level: entry.level,
  label: `[${entry.level.toUpperCase()}]`.padEnd(9, " "),
}));
</script>

<template>
  <XhLogRoot :rows="6" style="inline-size: 100%">
    <XhLogViewport>
      <XhLogContent>
        <XhLogLine v-for="(entry, i) in entries" :key="i" :level="entry.level">
          <span style="color: var(--xh-fg-subtle)">{{ entry.time }}</span>
          <span>{{ entry.label }}</span>
          <span>{{ entry.text }}</span>
        </XhLogLine>
      </XhLogContent>
    </XhLogViewport>
  </XhLogRoot>
</template>

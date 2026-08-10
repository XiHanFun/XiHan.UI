<!-- 行的样子归作者 | line 只发身份与等宽排版，级别配色、时间戳、行内标记这些都写在插槽里 -->
<script setup lang="ts">
import { XhLogContent, XhLogLine, XhLogRoot, XhLogViewport } from "@xihan-ui/vue";

const LEVEL_COLOR: Record<string, string> = {
  info: "var(--xh-fg-muted)",
  ok: "var(--xh-fg-success)",
  warn: "var(--xh-fg-brand)",
  error: "var(--xh-fg-danger)",
};

const raw = [
  { time: "12:00:01", level: "info", text: "读取配置 config/app.yaml" },
  { time: "12:00:02", level: "ok", text: "数据库连接池就绪" },
  { time: "12:00:04", level: "info", text: "POST /api/orders  201  118ms" },
  { time: "12:00:05", level: "warn", text: "慢查询 1,240ms  select * from orders" },
  { time: "12:00:06", level: "error", text: "支付网关超时，第 1 次重试" },
  { time: "12:00:08", level: "ok", text: "支付网关恢复，订单 8812 已确认" },
];

// 级别既写成定宽文字标签也上色；段与段的间隔补进字符串，模板里不留会被折叠的空白
const entries = raw.map(entry => ({
  text: entry.text,
  time: `${entry.time}  `,
  label: `[${entry.level.toUpperCase()}]`.padEnd(9, " "),
  color: LEVEL_COLOR[entry.level],
}));
</script>

<template>
  <XhLogRoot :rows="6" style="inline-size: 100%">
    <XhLogViewport>
      <XhLogContent>
        <XhLogLine v-for="(entry, i) in entries" :key="i">
          <span style="color: var(--xh-fg-subtle)">{{ entry.time }}</span>
          <span :style="{ color: entry.color }">{{ entry.label }}</span>
          <span>{{ entry.text }}</span>
        </XhLogLine>
      </XhLogContent>
    </XhLogViewport>
  </XhLogRoot>
</template>

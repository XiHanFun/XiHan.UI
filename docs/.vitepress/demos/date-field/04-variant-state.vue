<!-- 形态与状态 | variant 设置输入框外观；禁用、只读与校验失败各是一种状态 -->
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-6); justify-items: start">
    <div style="display: grid; gap: var(--xh-space-4); justify-items: start">
      <XhDateFieldRoot
        v-for="v in variants"
        :key="v"
        :variant="v"
        default-value="2026-07-28"
        locale="zh-CN"
      >
        <XhDateFieldLabel>{{ v }}</XhDateFieldLabel>
        <XhDateFieldControl>
          <XhDateFieldSegmentGroup>
            <XhDateFieldSegment :index="0" />
            <span>年</span>
            <XhDateFieldSegment :index="1" />
            <span>月</span>
            <XhDateFieldSegment :index="2" />
            <span>日</span>
          </XhDateFieldSegmentGroup>
        </XhDateFieldControl>
      </XhDateFieldRoot>
    </div>

    <div style="display: grid; gap: var(--xh-space-4); justify-items: start">
      <XhDateFieldRoot default-value="2026-07-28" locale="zh-CN" disabled>
        <XhDateFieldLabel>禁用</XhDateFieldLabel>
        <XhDateFieldControl>
          <XhDateFieldSegmentGroup>
            <XhDateFieldSegment :index="0" />
            <span>年</span>
            <XhDateFieldSegment :index="1" />
            <span>月</span>
            <XhDateFieldSegment :index="2" />
            <span>日</span>
          </XhDateFieldSegmentGroup>
        </XhDateFieldControl>
      </XhDateFieldRoot>

      <XhDateFieldRoot default-value="2026-07-28" locale="zh-CN" read-only>
        <XhDateFieldLabel>只读</XhDateFieldLabel>
        <XhDateFieldControl>
          <XhDateFieldSegmentGroup>
            <XhDateFieldSegment :index="0" />
            <span>年</span>
            <XhDateFieldSegment :index="1" />
            <span>月</span>
            <XhDateFieldSegment :index="2" />
            <span>日</span>
          </XhDateFieldSegmentGroup>
        </XhDateFieldControl>
      </XhDateFieldRoot>

      <XhDateFieldRoot default-value="2026-07-28" locale="zh-CN" invalid>
        <XhDateFieldLabel>校验失败</XhDateFieldLabel>
        <XhDateFieldControl>
          <XhDateFieldSegmentGroup>
            <XhDateFieldSegment :index="0" />
            <span>年</span>
            <XhDateFieldSegment :index="1" />
            <span>月</span>
            <XhDateFieldSegment :index="2" />
            <span>日</span>
          </XhDateFieldSegmentGroup>
        </XhDateFieldControl>
      </XhDateFieldRoot>
    </div>
  </div>
</template>

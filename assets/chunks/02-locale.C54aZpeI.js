const e=`<!-- 段序随 locale | 同一份标记，locale 换成 en-US 后段序自动排成月日年 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";

const zh = ref<string | null>("2026-07-28");
const us = ref<string | null>("2026-07-28");
<\/script>

<template>
  <div style="display: grid; gap: 16px">
    <XhDateFieldRoot v-model:value="zh" locale="zh-CN">
      <XhDateFieldLabel>zh-CN</XhDateFieldLabel>
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

    <XhDateFieldRoot v-model:value="us" locale="en-US">
      <XhDateFieldLabel>en-US</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>/</span>
          <XhDateFieldSegment :index="1" />
          <span>/</span>
          <XhDateFieldSegment :index="2" />
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>

    <p style="margin: 0; font-size: 13px">
      两份值都是 ISO 串：{{ zh ?? "（空）" }} · {{ us ?? "（空）" }}
    </p>
  </div>
</template>
`;export{e as default};

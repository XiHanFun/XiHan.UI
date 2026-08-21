const e=`<!-- 禁用与非法 | 禁用整组退出 Tab 序、隐藏输入不再提交；invalid 只改观感与 aria，不动值 -->
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
} from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: grid; gap: 16px">
    <XhDateFieldRoot default-value="2026-07-28" locale="zh-CN" disabled>
      <XhDateFieldLabel>禁用</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegment :index="0" />
        <span>年</span>
        <XhDateFieldSegment :index="1" />
        <span>月</span>
        <XhDateFieldSegment :index="2" />
        <span>日</span>
      </XhDateFieldControl>
    </XhDateFieldRoot>

    <XhDateFieldRoot default-value="2026-07-28" locale="zh-CN" read-only>
      <XhDateFieldLabel>只读</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegment :index="0" />
        <span>年</span>
        <XhDateFieldSegment :index="1" />
        <span>月</span>
        <XhDateFieldSegment :index="2" />
        <span>日</span>
      </XhDateFieldControl>
    </XhDateFieldRoot>

    <XhDateFieldRoot default-value="2026-07-28" locale="zh-CN" invalid>
      <XhDateFieldLabel>invalid</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegment :index="0" />
        <span>年</span>
        <XhDateFieldSegment :index="1" />
        <span>月</span>
        <XhDateFieldSegment :index="2" />
        <span>日</span>
      </XhDateFieldControl>
    </XhDateFieldRoot>
  </div>
</template>
`;export{e as default};

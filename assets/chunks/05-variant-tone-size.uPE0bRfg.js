const l=`<!-- 形态、语气与尺寸 | 三轴只改这块壳怎么与正文分开，阶段与展开逻辑不受影响 -->
<script setup lang="ts">
import {
  XhToolCallContent,
  XhToolCallIndicator,
  XhToolCallLabel,
  XhToolCallOutput,
  XhToolCallRoot,
  XhToolCallStatus,
  XhToolCallTrigger,
} from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <XhToolCallRoot phase="output-available" variant="outline">
      <XhToolCallTrigger>
        <XhToolCallIndicator />
        <XhToolCallLabel>描边</XhToolCallLabel>
        <XhToolCallStatus />
      </XhToolCallTrigger>
      <XhToolCallContent>
        <XhToolCallOutput>找到 3 条结果。</XhToolCallOutput>
      </XhToolCallContent>
    </XhToolCallRoot>

    <XhToolCallRoot phase="output-available" variant="ghost">
      <XhToolCallTrigger>
        <XhToolCallIndicator />
        <XhToolCallLabel>无壳内联</XhToolCallLabel>
        <XhToolCallStatus />
      </XhToolCallTrigger>
      <XhToolCallContent>
        <XhToolCallOutput>找到 3 条结果。</XhToolCallOutput>
      </XhToolCallContent>
    </XhToolCallRoot>

    <XhToolCallRoot phase="output-available" tone="success">
      <XhToolCallTrigger>
        <XhToolCallIndicator />
        <XhToolCallLabel>成功语气</XhToolCallLabel>
        <XhToolCallStatus />
      </XhToolCallTrigger>
      <XhToolCallContent>
        <XhToolCallOutput>找到 3 条结果。</XhToolCallOutput>
      </XhToolCallContent>
    </XhToolCallRoot>

    <XhToolCallRoot phase="output-available" size="sm">
      <XhToolCallTrigger>
        <XhToolCallIndicator />
        <XhToolCallLabel>小档</XhToolCallLabel>
        <XhToolCallStatus />
      </XhToolCallTrigger>
      <XhToolCallContent>
        <XhToolCallOutput>找到 3 条结果。</XhToolCallOutput>
      </XhToolCallContent>
    </XhToolCallRoot>

    <XhToolCallRoot phase="output-available" size="lg">
      <XhToolCallTrigger>
        <XhToolCallIndicator />
        <XhToolCallLabel>大档</XhToolCallLabel>
        <XhToolCallStatus />
      </XhToolCallTrigger>
      <XhToolCallContent>
        <XhToolCallOutput>找到 3 条结果。</XhToolCallOutput>
      </XhToolCallContent>
    </XhToolCallRoot>
  </div>
</template>
`;export{l as default};

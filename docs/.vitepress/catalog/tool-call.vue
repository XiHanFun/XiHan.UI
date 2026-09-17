<script setup lang="ts">
import { XhToolCallContent, XhToolCallIndicator, XhToolCallLabel, XhToolCallOutput, XhToolCallRoot, XhToolCallStatus, XhToolCallTrigger } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-2); inline-size: var(--xh-doc-catalog-w)">
    <XhToolCallRoot phase="input-streaming">
      <XhToolCallTrigger>
        <XhToolCallIndicator />
        <XhToolCallLabel>search</XhToolCallLabel>
        <XhToolCallStatus />
      </XhToolCallTrigger>
    </XhToolCallRoot>
    <XhToolCallRoot phase="output-available" default-open>
      <XhToolCallTrigger>
        <XhToolCallIndicator />
        <XhToolCallLabel>read_file</XhToolCallLabel>
        <XhToolCallStatus />
      </XhToolCallTrigger>
      <XhToolCallContent>
        <XhToolCallOutput>找到 3 条结果。</XhToolCallOutput>
      </XhToolCallContent>
    </XhToolCallRoot>
  </div>
</template>

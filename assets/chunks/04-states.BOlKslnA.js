const n=`<!-- 禁用与校验态 | disabled 连明暗一起停掉，read-only 只锁值、明暗照切，invalid 只标注不拦输入 -->
<script setup lang="ts">
import {
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhPasswordInputRoot default-value="hunter2" disabled>
    <XhPasswordInputLabel>禁用</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput style="inline-size: 160px" />
      <XhPasswordInputVisibilityTrigger>○</XhPasswordInputVisibilityTrigger>
    </XhPasswordInputControl>
  </XhPasswordInputRoot>

  <XhPasswordInputRoot default-value="hunter2" read-only>
    <XhPasswordInputLabel>只读</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput style="inline-size: 160px" />
      <XhPasswordInputVisibilityTrigger>○</XhPasswordInputVisibilityTrigger>
    </XhPasswordInputControl>
  </XhPasswordInputRoot>

  <XhPasswordInputRoot default-value="123" invalid>
    <XhPasswordInputLabel>校验失败</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput style="inline-size: 160px" />
      <XhPasswordInputVisibilityTrigger>○</XhPasswordInputVisibilityTrigger>
    </XhPasswordInputControl>
  </XhPasswordInputRoot>
</template>
`;export{n as default};

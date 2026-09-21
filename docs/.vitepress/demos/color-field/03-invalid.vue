<!-- 无法提交的草稿 | 无法解析的文字留在框中并标为无效，让用户看到自己输入的内容；Escape 放弃草稿回到规范文本 -->
<script setup lang="ts">
import {
  XhColorFieldControl,
  XhColorFieldInput,
  XhColorFieldLabel,
  XhColorFieldRoot,
  XhColorFieldSwatch,
} from "@xihan-ui/vue";
</script>

<template>
  <!-- 试着打 tomato 再按回车：颜色关键字不在支持的写法里 -->
  <XhColorFieldRoot v-slot="{ editing, invalid }" default-value="#e11d48" placeholder="#rrggbb">
    <XhColorFieldLabel>强调色</XhColorFieldLabel>
    <XhColorFieldControl>
      <XhColorFieldSwatch />
      <XhColorFieldInput />
    </XhColorFieldControl>
    <span style="font-size: 13px">
      {{ invalid ? "这串字不是颜色：改一改，或按 Escape 放弃" : editing ? "回车或失焦收下" : "已收下" }}
    </span>
  </XhColorFieldRoot>
</template>

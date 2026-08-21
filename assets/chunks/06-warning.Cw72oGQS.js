const n=`<!-- 提示、警告与错误 | 三档语气各归各的部件：提示与警告都写在描述里，控件的 aria-invalid 保持 false；只有真出错才翻 invalid、错误文案才接进描述链 -->
<script setup lang="ts">
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
} from "@xihan-ui/vue";

// 警告档只换配色：边框取语气层的强调色，描述取语气层的文字色
const warningStyle = {
  "--xh-field-control-border": "var(--xh-_tone-soft)",
  "--xh-field-description-fg": "var(--xh-_tone-fg)",
};
<\/script>

<template>
  <div style="display: grid; gap: 16px; inline-size: 280px;">
    <XhFieldRoot>
      <XhFieldLabel>项目名</XhFieldLabel>
      <XhFieldControl>
        <input value="xihan-ui" />
      </XhFieldControl>
      <XhFieldDescription>创建之后还能改</XhFieldDescription>
    </XhFieldRoot>

    <!-- 警告：值可疑但不算错，invalid 不翻，读屏经描述链念出这一句 -->
    <XhFieldRoot data-tone="warning" :style="warningStyle">
      <XhFieldLabel>实例规格</XhFieldLabel>
      <XhFieldControl>
        <input value="1 核 1G" />
      </XhFieldControl>
      <XhFieldDescription>这个规格跑构建会偏紧，仍然可以保存</XhFieldDescription>
    </XhFieldRoot>

    <XhFieldRoot invalid>
      <XhFieldLabel>端口</XhFieldLabel>
      <XhFieldControl>
        <input value="70000" />
      </XhFieldControl>
      <XhFieldDescription>可用范围 1 到 65535</XhFieldDescription>
      <XhFieldErrorText>端口超出可用范围</XhFieldErrorText>
    </XhFieldRoot>
  </div>
</template>
`;export{n as default};

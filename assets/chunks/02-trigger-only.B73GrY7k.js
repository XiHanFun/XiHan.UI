const i=`<!-- 只要一颗按钮 | 必备部件只有 root 与 trigger：文本已经在页面上时，展示框与标题都可以省掉 -->
<script setup lang="ts">
import { XhClipboardIndicator, XhClipboardRoot, XhClipboardTrigger } from "@xihan-ui/vue";

const install = "pnpm add @xihan-ui/vue @xihan-ui/styles";
<\/script>

<template>
  <code style="font-size: 13px;">{{ install }}</code>
  <XhClipboardRoot :value="install" :timeout="1500">
    <XhClipboardTrigger>
      <XhClipboardIndicator>复制安装命令</XhClipboardIndicator>
      <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
    </XhClipboardTrigger>
  </XhClipboardRoot>
</template>
`;export{i as default};

const n=`<!-- 子菜单 | 将相关操作收进下一层 -->
<script setup lang="ts">
import {
  XhButton,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuSub,
  XhMenuSubTrigger,
  XhMenuTrigger,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhMenuRoot>
    <XhMenuTrigger as-child><XhButton variant="subtle">文件操作</XhButton></XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <XhMenuItem value="open">打开</XhMenuItem>
        <XhMenuItem value="rename">重命名</XhMenuItem>
        <XhMenuSeparator />
        <XhMenuSub value="share">
          <XhMenuSubTrigger>发送到</XhMenuSubTrigger>
          <XhMenuPositioner>
            <XhMenuContent>
              <XhMenuItem value="email">邮件</XhMenuItem>
              <XhMenuItem value="message">消息</XhMenuItem>
            </XhMenuContent>
          </XhMenuPositioner>
        </XhMenuSub>
        <XhMenuSeparator />
        <XhMenuItem value="delete">移到回收站</XhMenuItem>
      </XhMenuContent>
    </XhMenuPositioner>
  </XhMenuRoot>
</template>
`;export{n as default};

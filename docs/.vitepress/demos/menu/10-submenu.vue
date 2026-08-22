<!-- 二级子菜单 | XhMenuSub 内嵌一台子菜单：触发条目双重身份（父层方向键照常走、右方向键进子层、子层左方向键退回），悬停经安全三角斜穿不误收，任意层级选中都发根的 select 并整链关闭 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuSub,
  XhMenuSubTrigger,
  XhMenuTrigger,
} from "@xihan-ui/vue";

const picked = ref("（还没选）");
</script>

<template>
  <XhMenuRoot @select="({ value }) => (picked = value)">
    <XhMenuTrigger>文件操作</XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <XhMenuItem value="open">打开</XhMenuItem>
        <XhMenuItem value="rename">重命名</XhMenuItem>
        <XhMenuSeparator />
        <XhMenuSub value="share">
          <XhMenuSubTrigger>发送到…</XhMenuSubTrigger>
          <XhMenuPositioner>
            <XhMenuContent>
              <XhMenuItem value="share-email">邮件</XhMenuItem>
              <XhMenuItem value="share-sms">短信</XhMenuItem>
              <XhMenuSub value="share-im">
                <XhMenuSubTrigger>即时通讯…</XhMenuSubTrigger>
                <XhMenuPositioner>
                  <XhMenuContent>
                    <XhMenuItem value="share-wecom">企业微信</XhMenuItem>
                    <XhMenuItem value="share-dingtalk">钉钉</XhMenuItem>
                  </XhMenuContent>
                </XhMenuPositioner>
              </XhMenuSub>
            </XhMenuContent>
          </XhMenuPositioner>
        </XhMenuSub>
        <XhMenuSeparator />
        <XhMenuItem value="delete">删除</XhMenuItem>
      </XhMenuContent>
    </XhMenuPositioner>
  </XhMenuRoot>
  <p>选中：{{ picked }}</p>
</template>

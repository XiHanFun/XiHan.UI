const n=`<!-- 二级子菜单 | XhContextMenuSub 在右键菜单里嵌一台子菜单：触发条目双重身份（父层方向键照常走、右方向键进子层），子层内用 XhMenu 系部件，任意层级选中都发根的 select 并整链关闭 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuSub,
  XhContextMenuSubTrigger,
  XhContextMenuTrigger,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
} from "@xihan-ui/vue";

const picked = ref("（还没选）");
<\/script>

<template>
  <XhContextMenuRoot @select="({ value }) => (picked = value)">
    <XhContextMenuTrigger>
      <div
        style="display: grid; place-items: center; block-size: 120px; border: 1px dashed var(--xh-border-strong); border-radius: 8px"
      >
        在这里点右键
      </div>
    </XhContextMenuTrigger>
    <XhContextMenuPositioner>
      <XhContextMenuContent>
        <XhContextMenuItem value="copy">复制</XhContextMenuItem>
        <XhContextMenuItem value="rename">重命名</XhContextMenuItem>
        <XhContextMenuSeparator />
        <XhContextMenuSub value="share">
          <XhContextMenuSubTrigger>
            发送到…
            <span aria-hidden="true" style="margin-inline-start: auto">›</span>
          </XhContextMenuSubTrigger>
          <XhMenuPositioner>
            <XhMenuContent>
              <XhMenuItem value="share-email">邮件</XhMenuItem>
              <XhMenuItem value="share-sms">短信</XhMenuItem>
            </XhMenuContent>
          </XhMenuPositioner>
        </XhContextMenuSub>
        <XhContextMenuSeparator />
        <XhContextMenuItem value="delete">删除</XhContextMenuItem>
      </XhContextMenuContent>
    </XhContextMenuPositioner>
  </XhContextMenuRoot>
  <p>选中：{{ picked }}</p>
</template>
`;export{n as default};

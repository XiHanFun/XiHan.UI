<!-- 二级子菜单 | XhMenubarSub 在菜单栏的一张菜单里再嵌一层：触发条目双重身份（菜单栏的方向键照常走、右方向键进子层），子层内用 XhMenu 系部件，选中带上所属菜单的身份汇到根并关掉整条菜单栏 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSeparator,
  XhMenubarSub,
  XhMenubarSubTrigger,
  XhMenubarTrigger,
} from "@xihan-ui/vue";

const picked = ref("（还没选）");

function onSelect(details: { menu: string; value: string }): void {
  picked.value = `${details.menu} / ${details.value}`;
}
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <XhMenubarRoot @select="onSelect">
      <XhMenubarTrigger value="file">文件</XhMenubarTrigger>
      <XhMenubarPositioner value="file">
        <XhMenubarContent>
          <XhMenubarItem value="open">打开</XhMenubarItem>
          <XhMenubarItem value="save">保存</XhMenubarItem>
          <XhMenubarSeparator />

          <XhMenubarSub value="share">
            <XhMenubarSubTrigger>
              发送到…
              <span aria-hidden="true" style="margin-inline-start: auto">›</span>
            </XhMenubarSubTrigger>
            <XhMenuPositioner>
              <XhMenuContent>
                <XhMenuItem value="email">邮件</XhMenuItem>
                <XhMenuItem value="sms">短信</XhMenuItem>
              </XhMenuContent>
            </XhMenuPositioner>
          </XhMenubarSub>

          <XhMenubarSeparator />
          <XhMenubarItem value="close">关闭</XhMenubarItem>
        </XhMenubarContent>
      </XhMenubarPositioner>

      <XhMenubarTrigger value="edit">编辑</XhMenubarTrigger>
      <XhMenubarPositioner value="edit">
        <XhMenubarContent>
          <XhMenubarItem value="undo">撤销</XhMenubarItem>
          <XhMenubarItem value="redo">重做</XhMenubarItem>
        </XhMenubarContent>
      </XhMenubarPositioner>
    </XhMenubarRoot>

    <p>选中：{{ picked }}</p>
  </div>
</template>

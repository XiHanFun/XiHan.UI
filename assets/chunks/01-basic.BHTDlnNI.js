const n=`<!-- 基础用法 | 点触发器就地问一句，确认与取消都收起浮层；展开时焦点先落在取消上 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhPopconfirmCancelTrigger,
  XhPopconfirmConfirmTrigger,
  XhPopconfirmContent,
  XhPopconfirmDescription,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopconfirmTitle,
  XhPopconfirmTrigger,
} from "@xihan-ui/vue";

const answer = ref("还没答复");
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhPopconfirmRoot @confirm="answer = '已删除'" @cancel="answer = '已取消'">
      <XhPopconfirmTrigger>删除这条记录</XhPopconfirmTrigger>
      <XhPopconfirmPositioner>
        <XhPopconfirmContent>
          <XhPopconfirmTitle>删除后不可恢复</XhPopconfirmTitle>
          <XhPopconfirmDescription>
            这条记录连同它的附件一起清掉。
          </XhPopconfirmDescription>
          <XhPopconfirmCancelTrigger>取消</XhPopconfirmCancelTrigger>
          <XhPopconfirmConfirmTrigger>删除</XhPopconfirmConfirmTrigger>
        </XhPopconfirmContent>
      </XhPopconfirmPositioner>
    </XhPopconfirmRoot>
    <span>{{ answer }}</span>
  </div>
</template>
`;export{n as default};

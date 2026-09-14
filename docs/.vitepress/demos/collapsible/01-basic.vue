<!-- 基础用法 | 不传 open 即为非受控，defaultOpen 只给初始值，之后由组件自己维护开合 -->
<script setup lang="ts">
import {
  XhCollapsibleContent,
  XhCollapsibleIndicator,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
    <XhCollapsibleRoot>
      <XhCollapsibleTrigger>
        展开详情
        <!-- 指示符空着就由皮肤画一枚箭头，展开时转向 -->
        <XhCollapsibleIndicator />
      </XhCollapsibleTrigger>
      <XhCollapsibleContent>
        收起时内容只加 hidden，节点不卸载，里面的输入框与滚动位置都留着。
      </XhCollapsibleContent>
    </XhCollapsibleRoot>

    <XhCollapsibleRoot default-open>
      <XhCollapsibleTrigger>
        一上来就开着
        <XhCollapsibleIndicator />
      </XhCollapsibleTrigger>
      <XhCollapsibleContent>defaultOpen 只影响初始状态。</XhCollapsibleContent>
    </XhCollapsibleRoot>
  </div>
</template>

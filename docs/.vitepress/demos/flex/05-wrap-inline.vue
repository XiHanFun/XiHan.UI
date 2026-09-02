<!-- 折行与行内 | wrap 让放不下的子项换行、行与行之间同样吃 gap；inline 让容器缩到内容宽度、能跟文字排一行 -->
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";

const trackStyle =
  "border: 1px solid var(--xh-border-default); border-radius: var(--xh-radius-md); padding: 8px; max-inline-size: 320px";
const tagStyle =
  "padding: 4px 10px; border-radius: var(--xh-radius-full); background: var(--xh-bg-subtle); color: var(--xh-fg-default); font-size: 13px";
const labelStyle = "font-size: 13px; color: var(--xh-fg-muted)";

const tags = ["前端", "组件库", "无障碍", "设计令牌", "自定义元素", "键盘导航"];
</script>

<template>
  <XhFlex orientation="vertical" gap="lg">
    <XhFlex orientation="vertical" gap="xs">
      <span :style="labelStyle">不折行（缺省）：全部挤在一行里，宽度不够就被压窄</span>
      <XhFlex gap="sm" :style="trackStyle">
        <span v-for="t in tags" :key="t" :style="tagStyle">{{ t }}</span>
      </XhFlex>
    </XhFlex>

    <XhFlex orientation="vertical" gap="xs">
      <span :style="labelStyle">wrap：换行摆，行间距同样是 gap</span>
      <XhFlex wrap gap="sm" :style="trackStyle">
        <span v-for="t in tags" :key="t" :style="tagStyle">{{ t }}</span>
      </XhFlex>
    </XhFlex>

    <XhFlex orientation="vertical" gap="xs">
      <span :style="labelStyle">inline：容器缩到内容宽度，跟前后文字排在同一行</span>
      <!-- 外层留成普通块级容器：行内盒要和文字处在同一个行内格式化上下文里才看得出效果 -->
      <div style="line-height: 2">
        当前筛选条件为
        <XhFlex inline align="center" gap="xs">
          <span :style="tagStyle">近 7 天</span>
          <span :style="tagStyle">已完成</span>
        </XhFlex>
        ，共 24 条。
      </div>
    </XhFlex>
  </XhFlex>
</template>

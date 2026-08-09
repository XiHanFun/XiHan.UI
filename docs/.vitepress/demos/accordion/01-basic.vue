<!-- 基础用法 | 默认单开：展开一项即收起其余，defaultValue 只给初始值，之后由组件自己维护 -->
<script setup lang="ts">
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhAccordionRoot :default-value="['install']">
      <XhAccordionItem value="install">
        <XhAccordionHeader>
          <XhAccordionTrigger>怎么安装</XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>
          装 @xihan-ui/vue 与 @xihan-ui/styled 两个包，皮肤单独引一次。
        </XhAccordionContent>
      </XhAccordionItem>
      <XhAccordionItem value="theme">
        <XhAccordionHeader>
          <XhAccordionTrigger>怎么换皮肤</XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>
          皮肤只认 data-part 与 data-state，覆写同名令牌即可。
        </XhAccordionContent>
      </XhAccordionItem>
      <XhAccordionItem value="a11y">
        <XhAccordionHeader>
          <XhAccordionTrigger>键盘怎么走</XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>
          方向键只在标题之间搬焦点，永不进内容区，首尾不回绕。
        </XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>
  </div>
</template>

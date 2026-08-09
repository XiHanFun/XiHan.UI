<!-- 尺寸 | size 换的是标题栏的高度、内边距与字号，三档并排对照 -->
<script setup lang="ts">
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div
    style="
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      align-items: start;
    "
  >
    <XhAccordionRoot size="sm" :default-value="['a']">
      <XhAccordionItem value="a">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>小号 sm</span>
            <XhAccordionIndicator />
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>标题栏最矮，字号也最小。</XhAccordionContent>
      </XhAccordionItem>
      <XhAccordionItem value="b">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>另一项</span>
            <XhAccordionIndicator />
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>同一档内所有标题一致。</XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>

    <XhAccordionRoot :default-value="['a']">
      <XhAccordionItem value="a">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>缺省档</span>
            <XhAccordionIndicator />
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>不写 size 就是这一档。</XhAccordionContent>
      </XhAccordionItem>
      <XhAccordionItem value="b">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>另一项</span>
            <XhAccordionIndicator />
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>同一档内所有标题一致。</XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>

    <XhAccordionRoot size="lg" :default-value="['a']">
      <XhAccordionItem value="a">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>大号 lg</span>
            <XhAccordionIndicator />
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>标题栏最高，字号也最大。</XhAccordionContent>
      </XhAccordionItem>
      <XhAccordionItem value="b">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>另一项</span>
            <XhAccordionIndicator />
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>同一档内所有标题一致。</XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>
  </div>
</template>

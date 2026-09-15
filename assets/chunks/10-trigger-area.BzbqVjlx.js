const n=`<!-- 缩小触发区域 | trigger 只包住指示器，标题文字留在 header 里，点标题不再展开 -->
<script setup lang="ts">
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from "@xihan-ui/vue";

const items = [
  { value: "profile", label: "账户资料", body: "只有右边那个按钮能展开这一段。" },
  { value: "billing", label: "账单信息", body: "标题文字不在按钮里，点它没有反应。" },
];
<\/script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhAccordionRoot :default-value="['profile']">
      <XhAccordionItem v-for="item in items" :key="item.value" :value="item.value">
        <!-- 标题栏自己排布：文字是普通节点，按钮只占末尾一小格 -->
        <XhAccordionHeader
          style="display: flex; align-items: center; gap: 8px; padding-inline-start: 12px"
        >
          <span style="flex: 1">{{ item.label }}</span>
          <XhAccordionTrigger
            style="inline-size: auto"
            :aria-label="\`展开\${item.label}\`"
          >
            <XhAccordionIndicator />
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>{{ item.body }}</XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>
  </div>
</template>
`;export{n as default};

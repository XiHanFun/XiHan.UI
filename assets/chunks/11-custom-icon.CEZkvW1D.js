const n=`<!-- 自定义展开图标 | indicator 是可选部件，不渲染它就没有默认字形；标记由作者按展开集合自己画 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from "@xihan-ui/vue";

const items = [
  { value: "shipping", label: "配送方式", body: "同城次日达，跨省三日达。" },
  { value: "invoice", label: "发票", body: "支持电子普票与专票。" },
  { value: "refund", label: "退换货", body: "签收七日内无理由退换。" },
];

const panels = ref<string[]>(["shipping"]);
<\/script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhAccordionRoot v-model:value="panels" multiple>
      <XhAccordionItem v-for="item in items" :key="item.value" :value="item.value">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>{{ item.label }}</span>
            <!-- 标记按这一项在不在展开集合里换字形 -->
            <span style="font-size: 12px; color: var(--xh-fg-muted)">
              {{ panels.includes(item.value) ? "－" : "＋" }}
            </span>
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>{{ item.body }}</XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>
  </div>
</template>
`;export{n as default};

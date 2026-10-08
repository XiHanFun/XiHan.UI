var e=`<!-- 候选虚拟化 | 过滤后的完整 collection 与 count 同步，高亮仍可跨窗口移动 -->
<script setup lang="ts">
import {
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxEmpty,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxLabel,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhComboboxTrigger,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const cities = Array.from({ length: 1000 }, (_, index) => ({ value: \`city-\${index + 1}\`, label: \`城市 \${index + 1}\` }));
const query = ref("");
const filtered = computed(() => cities.filter(city => city.label.includes(query.value.trim())));
<\/script>

<template>
  <XhVirtualizerRoot v-slot="{ virtualItems, collectionVirtualizer }" :count="filtered.length" :estimate-size="36" :viewport-tab-index="-1">
    <XhComboboxRoot v-model:input-value="query" :collection="filtered" :virtualizer="collectionVirtualizer" open-on-click placeholder="搜索城市">
      <XhComboboxLabel>城市</XhComboboxLabel>
      <XhComboboxControl><XhComboboxInput /><XhComboboxTrigger /></XhComboboxControl>
      <XhComboboxPositioner>
        <XhComboboxContent style="overflow: visible; max-block-size: none">
          <XhVirtualizerViewport style="block-size: 240px">
            <XhVirtualizerContent>
              <XhVirtualizerItem v-for="virtualItem in virtualItems" :key="virtualItem.key" :value="virtualItem.index" style="block-size: 36px">
                <XhComboboxItem :value="filtered[virtualItem.index].value">
                  <XhComboboxItemText>{{ filtered[virtualItem.index].label }}</XhComboboxItemText>
                  <XhComboboxItemIndicator />
                </XhComboboxItem>
              </XhVirtualizerItem>
            </XhVirtualizerContent>
          </XhVirtualizerViewport>
        </XhComboboxContent>
        <XhComboboxEmpty>无匹配城市</XhComboboxEmpty>
      </XhComboboxPositioner>
    </XhComboboxRoot>
  </XhVirtualizerRoot>
</template>
`;export{e as default};
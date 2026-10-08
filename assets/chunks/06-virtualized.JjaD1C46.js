var e=`<!-- 集合虚拟化 | collection 保留完整语义，Virtualizer 只决定当前挂载哪些 option -->
<script setup lang="ts">
import {
  XhListboxContent,
  XhListboxItem,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxRoot,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";

const items = Array.from({ length: 1000 }, (_, index) => ({
  value: \`member-\${index + 1}\`,
  label: \`成员 \${index + 1}\`,
}));
<\/script>

<template>
  <XhVirtualizerRoot
    v-slot="{ virtualItems, collectionVirtualizer }"
    :count="items.length"
    :estimate-size="36"
    :viewport-tab-index="-1"
    style="inline-size: min(100%, 320px)"
  >
    <XhListboxRoot :collection="items" :virtualizer="collectionVirtualizer">
      <XhListboxLabel>团队成员</XhListboxLabel>
      <XhListboxContent style="overflow: visible; max-block-size: none">
        <XhVirtualizerViewport style="block-size: 240px">
          <XhVirtualizerContent>
            <XhVirtualizerItem
              v-for="virtualItem in virtualItems"
              :key="virtualItem.key"
              :value="virtualItem.index"
              style="block-size: 36px"
            >
              <XhListboxItem :value="items[virtualItem.index].value">
                <XhListboxItemText>{{ items[virtualItem.index].label }}</XhListboxItemText>
                <XhListboxItemIndicator />
              </XhListboxItem>
            </XhVirtualizerItem>
          </XhVirtualizerContent>
        </XhVirtualizerViewport>
      </XhListboxContent>
    </XhListboxRoot>
  </XhVirtualizerRoot>
</template>
`;export{e as default};
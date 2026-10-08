var e=`<!-- 大树虚拟化 | 完整树数据负责层级与键盘语义，窗口只挂载当前可见行 -->
<script setup lang="ts">
import {
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";

const nodes = Array.from({ length: 1000 }, (_, index) => ({
  value: \`file-\${index + 1}\`,
  label: \`文件 \${index + 1}.ts\`,
}));
<\/script>

<template>
  <XhVirtualizerRoot v-slot="{ virtualItems, collectionVirtualizer }" :count="nodes.length" :estimate-size="36" :viewport-tab-index="-1" style="inline-size: min(100%, 320px)">
    <XhTreeRoot :collection="nodes" :virtualizer="collectionVirtualizer">
      <XhTreeLabel>项目文件</XhTreeLabel>
      <XhVirtualizerViewport style="block-size: 240px">
        <XhTreeTree style="overflow: visible; max-block-size: none">
          <XhVirtualizerContent>
            <XhVirtualizerItem v-for="virtualItem in virtualItems" :key="virtualItem.key" :value="virtualItem.index" style="block-size: 36px">
              <XhTreeItem :value="nodes[virtualItem.index].value">
                <XhTreeItemText>{{ nodes[virtualItem.index].label }}</XhTreeItemText>
                <XhTreeItemIndicator />
              </XhTreeItem>
            </XhVirtualizerItem>
          </XhVirtualizerContent>
        </XhTreeTree>
      </XhVirtualizerViewport>
    </XhTreeRoot>
  </XhVirtualizerRoot>
</template>
`;export{e as default};
var e=`<!-- 长选项虚拟化 | 完整 collection 负责选择语义，Virtualizer 负责浮层中的窗口 -->
<script setup lang="ts">
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";

const options = Array.from({ length: 1000 }, (_, index) => ({ value: \`option-\${index + 1}\`, label: \`选项 \${index + 1}\` }));
<\/script>

<template>
  <XhVirtualizerRoot v-slot="{ virtualItems, collectionVirtualizer }" :count="options.length" :estimate-size="36" :viewport-tab-index="-1">
    <XhSelectRoot :collection="options" :virtualizer="collectionVirtualizer" placeholder="请选择">
      <XhSelectLabel>长列表</XhSelectLabel>
      <XhSelectControl><XhSelectTrigger><XhSelectValueText /><XhSelectIndicator /></XhSelectTrigger></XhSelectControl>
      <XhSelectPositioner>
        <XhSelectContent>
          <XhVirtualizerViewport style="block-size: 240px">
            <XhSelectList style="overflow: visible; max-block-size: none">
              <XhVirtualizerContent>
                <XhVirtualizerItem v-for="virtualItem in virtualItems" :key="virtualItem.key" :value="virtualItem.index" style="block-size: 36px">
                  <XhSelectItem :value="options[virtualItem.index].value">
                    <XhSelectItemText>{{ options[virtualItem.index].label }}</XhSelectItemText>
                    <XhSelectItemIndicator />
                  </XhSelectItem>
                </XhVirtualizerItem>
              </XhVirtualizerContent>
            </XhSelectList>
          </XhVirtualizerViewport>
        </XhSelectContent>
      </XhSelectPositioner>
    </XhSelectRoot>
  </XhVirtualizerRoot>
</template>
`;export{e as default};
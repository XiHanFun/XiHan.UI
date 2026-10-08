var e=`<!-- 收进更多菜单 | 放不下的操作按次序收进行尾的更多按钮 -->
<script setup lang="ts">
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  QuoteIcon,
  UnderlineIcon,
} from "@xihan-ui/icons";
import {
  XhIcon,
  XhToolbarGroup,
  XhToolbarItem,
  XhToolbarOverflowTrigger,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";
import { ref } from "vue";

const formats = [
  { value: "bold", label: "加粗", icon: BoldIcon },
  { value: "italic", label: "斜体", icon: ItalicIcon },
  { value: "underline", label: "下划线", icon: UnderlineIcon },
];
const aligns = [
  { value: "left", label: "左对齐", icon: AlignLeftIcon },
  { value: "center", label: "居中", icon: AlignCenterIcon },
  { value: "right", label: "右对齐", icon: AlignRightIcon },
];
const inserts = [
  { value: "link", label: "插入链接", icon: LinkIcon },
  { value: "image", label: "插入图片", icon: ImageIcon },
  { value: "quote", label: "引用", icon: QuoteIcon },
];
const pressed = ref(new Set(["bold"]));
const align = ref("left");

function toggle(value: string) {
  const next = new Set(pressed.value);
  next.has(value) ? next.delete(value) : next.add(value);
  pressed.value = next;
}
<\/script>

<template>
  <div style="max-inline-size: 280px">
    <XhToolbarRoot aria-label="文本编辑">
      <XhToolbarGroup>
        <XhToolbarItem
          v-for="format in formats"
          :key="format.value"
          :value="format.value"
          type="button"
          :aria-label="format.label"
          :aria-pressed="pressed.has(format.value)"
          @click="toggle(format.value)"
        >
          <XhIcon :icon="format.icon" />
        </XhToolbarItem>
      </XhToolbarGroup>
      <XhToolbarSeparator />
      <XhToolbarGroup>
        <XhToolbarItem
          v-for="item in aligns"
          :key="item.value"
          :value="item.value"
          type="button"
          :aria-label="item.label"
          :aria-pressed="align === item.value"
          @click="align = item.value"
        >
          <XhIcon :icon="item.icon" />
        </XhToolbarItem>
      </XhToolbarGroup>
      <XhToolbarSeparator />
      <XhToolbarItem
        v-for="item in inserts"
        :key="item.value"
        :value="item.value"
        type="button"
        :aria-label="item.label"
      >
        <XhIcon :icon="item.icon" />
      </XhToolbarItem>
      <XhToolbarOverflowTrigger />
    </XhToolbarRoot>
  </div>
</template>
`;export{e as default};
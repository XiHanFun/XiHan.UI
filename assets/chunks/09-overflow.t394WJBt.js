const e=`<!-- 装不下就收进「更多」 | 宿主自己观测容器宽度，一次收起一个入口直到这排不再溢出；收起来的那几张菜单在「更多」里各占一组 -->
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import {
  XhButton,
  XhMenubarContent,
  XhMenubarGroup,
  XhMenubarGroupLabel,
  XhMenubarItem,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarTrigger,
} from "@xihan-ui/vue";

const menus = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
    ],
  },
  {
    value: "edit",
    label: "编辑",
    items: [
      { value: "undo", label: "撤销" },
      { value: "redo", label: "重做" },
    ],
  },
  {
    value: "view",
    label: "视图",
    items: [
      { value: "zoom-in", label: "放大" },
      { value: "zoom-out", label: "缩小" },
    ],
  },
  {
    value: "insert",
    label: "插入",
    items: [
      { value: "image", label: "图片" },
      { value: "table", label: "表格" },
    ],
  },
  {
    value: "format",
    label: "格式",
    items: [
      { value: "bold", label: "加粗" },
      { value: "italic", label: "倾斜" },
    ],
  },
  { value: "tools", label: "工具", items: [{ value: "spell", label: "拼写检查" }] },
  { value: "help", label: "帮助", items: [{ value: "about", label: "关于" }] },
];

const widths = [560, 380, 240];

const boxRef = ref<HTMLElement | null>(null);
const boxWidth = ref(560);
const visible = ref(menus.length);
const shown = computed(() => menus.slice(0, visible.value));
const folded = computed(() => menus.slice(visible.value));
const picked = ref("");

let observer: ResizeObserver | undefined;
let reflowing = false;

// 先全铺开，再一次收一个，直到这排不再溢出
async function reflow(): Promise<void> {
  const box = boxRef.value;
  if (!box || reflowing) return;
  reflowing = true;
  visible.value = menus.length;
  await nextTick();
  while (visible.value > 1 && box.scrollWidth > box.clientWidth + 1) {
    visible.value -= 1;
    await nextTick();
  }
  reflowing = false;
}

function onSelect(details: { menu: string; value: string }): void {
  picked.value = \`\${details.menu} / \${details.value}\`;
}

onMounted(() => {
  const box = boxRef.value;
  if (!box) return;
  observer = new ResizeObserver(() => void reflow());
  observer.observe(box);
});

onBeforeUnmount(() => observer?.disconnect());
<\/script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <XhButton
        v-for="w in widths"
        :key="w"
        size="sm"
        :variant="boxWidth === w ? 'solid' : 'outline'"
        @click="boxWidth = w"
      >
        {{ w }} 像素
      </XhButton>
    </div>

    <!-- 溢出裁在这一层，量的也是这一层 -->
    <div
      ref="boxRef"
      :style="{ inlineSize: boxWidth + 'px', maxInlineSize: '100%', overflow: 'hidden' }"
    >
      <XhMenubarRoot @select="onSelect">
        <XhMenubarTrigger v-for="m in shown" :key="m.value" :value="m.value">
          {{ m.label }}
        </XhMenubarTrigger>
        <XhMenubarTrigger v-if="folded.length" value="more">更多</XhMenubarTrigger>

        <XhMenubarPositioner v-for="m in shown" :key="m.value" :value="m.value">
          <XhMenubarContent>
            <XhMenubarItem v-for="item in m.items" :key="item.value" :value="item.value">
              <XhMenubarItemText>{{ item.label }}</XhMenubarItemText>
            </XhMenubarItem>
          </XhMenubarContent>
        </XhMenubarPositioner>

        <XhMenubarPositioner v-if="folded.length" value="more">
          <XhMenubarContent>
            <XhMenubarGroup v-for="m in folded" :key="m.value" :value="m.value">
              <XhMenubarGroupLabel>{{ m.label }}</XhMenubarGroupLabel>
              <XhMenubarItem
                v-for="item in m.items"
                :key="item.value"
                :value="\`\${m.value}:\${item.value}\`"
              >
                <XhMenubarItemText>{{ item.label }}</XhMenubarItemText>
              </XhMenubarItem>
            </XhMenubarGroup>
          </XhMenubarContent>
        </XhMenubarPositioner>
      </XhMenubarRoot>
    </div>

    <span>
      在场入口 {{ shown.length }} / {{ menus.length }}；最近选中：{{ picked || "（无）" }}
    </span>
  </div>
</template>
`;export{e as default};

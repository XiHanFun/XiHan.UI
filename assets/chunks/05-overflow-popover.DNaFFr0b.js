const t=`<!-- 「+N」展开其余成员 | 计数那一枚要能点开时换成按钮，作浮层的触发器：浮层里列出没摆出来的人，排成一行的只留前几位 -->
<script setup lang="ts">
import {
  XhAvatarFallback,
  XhAvatarGroupRoot,
  XhAvatarRoot,
  XhButton,
  XhListItem,
  XhListItemContent,
  XhListItemDescription,
  XhListItemMedia,
  XhListItemTitle,
  XhListRoot,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/vue";

const members = [
  { initial: "曦", name: "曦寒", role: "负责人" },
  { initial: "寒", name: "寒松", role: "前端" },
  { initial: "懿", name: "懿安", role: "设计" },
  { initial: "承", name: "承泽", role: "后端" },
  { initial: "临", name: "临川", role: "测试" },
  { initial: "旭", name: "旭东", role: "运维" },
  { initial: "言", name: "言蹊", role: "产品" },
  { initial: "知", name: "知远", role: "数据" },
];
const max = 4;

const shown = members.slice(0, max);
const rest = members.slice(max);
<\/script>

<template>
  <XhAvatarGroupRoot :max="max">
    <XhAvatarRoot v-for="m in shown" :key="m.name">
      <XhAvatarFallback>{{ m.initial }}</XhAvatarFallback>
    </XhAvatarRoot>

    <!-- 计数那一枚换成按钮：直径、圆形与字号跟着组走 -->
    <XhPopoverRoot placement="bottom-start">
      <XhPopoverTrigger as-child>
        <XhButton
          variant="subtle"
          icon-only
          :aria-label="\`还有 \${rest.length} 位成员\`"
          style="--xh-button-h: var(--xh-avatar-size); --xh-button-radius: var(--xh-shape-circle); --xh-button-font-size: var(--xh-avatar-font-size)"
        >
          +{{ rest.length }}
        </XhButton>
      </XhPopoverTrigger>
      <XhPopoverPositioner>
        <XhPopoverContent>
          <XhPopoverTitle>还有 {{ rest.length }} 位成员</XhPopoverTitle>
          <XhListRoot size="sm">
            <XhListItem v-for="m in rest" :key="m.name">
              <XhListItemMedia>
                <XhAvatarRoot size="sm">
                  <XhAvatarFallback>{{ m.initial }}</XhAvatarFallback>
                </XhAvatarRoot>
              </XhListItemMedia>
              <XhListItemContent>
                <XhListItemTitle>{{ m.name }}</XhListItemTitle>
                <XhListItemDescription>{{ m.role }}</XhListItemDescription>
              </XhListItemContent>
            </XhListItem>
          </XhListRoot>
        </XhPopoverContent>
      </XhPopoverPositioner>
    </XhPopoverRoot>
  </XhAvatarGroupRoot>
</template>
`;export{t as default};

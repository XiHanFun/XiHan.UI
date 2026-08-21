const e=`<!-- 层级下拉 | 某一层要换去处时，把菜单整套放进 item 里；面包屑只管这一层的排版 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhBreadcrumbSeparator,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
} from "@xihan-ui/vue";

const projects = [
  { value: "web", label: "官网" },
  { value: "admin", label: "后台" },
  { value: "mobile", label: "移动端" },
];
const current = ref("admin");

function onSelect(details: { value: string }): void {
  current.value = details.value;
}
<\/script>

<template>
  <XhBreadcrumbRoot>
    <XhBreadcrumbList>
      <XhBreadcrumbItem>
        <XhBreadcrumbLink href="#/">工作台</XhBreadcrumbLink>
      </XhBreadcrumbItem>
      <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
      <XhBreadcrumbItem>
        <!-- 这一层不是链接而是一组可切换的去处 -->
        <XhMenuRoot @select="onSelect">
          <XhMenuTrigger>
            {{ projects.find((p) => p.value === current)?.label }} ▾
          </XhMenuTrigger>
          <XhMenuPositioner>
            <XhMenuContent>
              <XhMenuItem v-for="p in projects" :key="p.value" :value="p.value">
                {{ p.label }}
              </XhMenuItem>
            </XhMenuContent>
          </XhMenuPositioner>
        </XhMenuRoot>
      </XhBreadcrumbItem>
      <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
      <XhBreadcrumbItem>
        <XhBreadcrumbLink href="#/settings" current>设置</XhBreadcrumbLink>
      </XhBreadcrumbItem>
    </XhBreadcrumbList>
  </XhBreadcrumbRoot>
</template>
`;export{e as default};

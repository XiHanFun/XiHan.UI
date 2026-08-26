const e=`<!-- 末端横排 | leaf-orientation 按结构判据横排「子节点全是叶子」的那层；要指定哪一层横排就在节点上标 childrenOrientation，它比树级值优先，标 vertical 也压得住 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTreeBranch,
  XhTreeBranchCheckbox,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemCheckbox,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";

const collection = [
  {
    value: "system",
    label: "系统管理",
    children: [
      {
        // 没标：跟着树级开关走
        value: "user",
        label: "用户管理",
        children: [
          { value: "user:add", label: "新增" },
          { value: "user:edit", label: "编辑" },
          { value: "user:del", label: "删除" },
          { value: "user:export", label: "导出" },
        ],
      },
      {
        // 标了横排：开关拨到竖排也照横
        value: "role",
        label: "角色管理",
        childrenOrientation: "horizontal" as const,
        children: [
          { value: "role:add", label: "新增" },
          { value: "role:grant", label: "授权" },
          { value: "role:del", label: "删除" },
        ],
      },
      {
        // 标了竖排：按住树级的横排
        value: "log",
        label: "日志管理",
        childrenOrientation: "vertical" as const,
        children: [
          { value: "log:view", label: "查看" },
          { value: "log:export", label: "导出" },
        ],
      },
    ],
  },
];

const wide = ref(true);
const selection = ref<string[]>(["user:add"]);
<\/script>

<template>
  <div style="width: 100%; display: grid; gap: 12px; justify-items: start">
    <label style="display: inline-flex; gap: 6px; align-items: center">
      <input v-model="wide" type="checkbox" />
      按钮那层横排
    </label>

    <XhTreeRoot
      v-model:selection="selection"
      :collection="collection"
      :leaf-orientation="wide ? 'horizontal' : 'vertical'"
      :default-expanded-value="['system', 'user', 'role', 'log']"
      selection-mode="multiple"
      cascade
    >
      <XhTreeLabel>菜单授权</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch v-for="dir in collection" :key="dir.value" :value="dir.value">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchCheckbox />
            <XhTreeBranchText>{{ dir.label }}</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeBranch v-for="menu in dir.children" :key="menu.value" :value="menu.value">
              <XhTreeBranchControl>
                <XhTreeBranchTrigger />
                <XhTreeBranchCheckbox />
                <XhTreeBranchText>{{ menu.label }}</XhTreeBranchText>
              </XhTreeBranchControl>
              <XhTreeBranchContent>
                <XhTreeItem v-for="btn in menu.children" :key="btn.value" :value="btn.value">
                  <XhTreeItemCheckbox />
                  <XhTreeItemText>{{ btn.label }}</XhTreeItemText>
                </XhTreeItem>
              </XhTreeBranchContent>
            </XhTreeBranch>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>
  </div>
</template>
`;export{e as default};

<!-- 逐层排布 | orientation 收函数即按层判定：收到的是分支节点，答的是它那层子节点怎么排；目录与菜单竖排、按钮横排，一行铺开就选完，省掉纵向翻找 -->
<script setup lang="ts">
import type { TreeNodeMeta } from "@xihan-ui/vue";
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
        value: "role",
        label: "角色管理",
        children: [
          { value: "role:add", label: "新增" },
          { value: "role:grant", label: "授权" },
          { value: "role:del", label: "删除" },
        ],
      },
    ],
  },
];

// 菜单那一层（level 2）的子节点横排，其余竖排
function byLevel(node: TreeNodeMeta | null) {
  return node?.level === 2 ? "horizontal" : "vertical";
}

const flat = ref(false);
const selection = ref<string[]>(["user:add"]);
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px; justify-items: start">
    <label style="display: inline-flex; gap: 6px; align-items: center">
      <input v-model="flat" type="checkbox" />
      整棵树横排（对照）
    </label>

    <XhTreeRoot
      v-model:selection="selection"
      :collection="collection"
      :orientation="flat ? 'horizontal' : byLevel"
      :default-expanded-value="['system', 'user', 'role']"
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

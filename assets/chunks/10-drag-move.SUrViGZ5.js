const e=`<!-- 拖拽搬家 | 整个节点都是拖动源：按住拖到别处松手，也可以 Tab 进树里用 Alt + 上下键在同层挪、Alt + 左右键改层级。三档落点（插在前 / 插在后 / 放进目录里）连同指示线、自我后代守卫与读屏播报都归库；树仍不拥有数据，宿主只管按库报的 value、parent、index 把数组搬一下，外加一条 allowDrop 说这次许不许 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeLiveRegion,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";

/** 库报的落点：把 value 搬到 parent 下面的第 index 位；parent 为 null 即根层。 */
interface Move {
  value: string;
  parent: string | null;
  index: number;
}

/** 文件：叶子，收不下东西。 */
interface Doc {
  value: string;
  label: string;
}

/** 目录：装文件的那一层。 */
interface Folder extends Doc {
  children: Doc[];
}

type Entry = Doc | Folder;

const collection = ref<Entry[]>([
  {
    value: "inbox",
    label: "收件箱",
    children: [
      { value: "f1", label: "报价单.pdf" },
      { value: "f2", label: "周报.md" },
      { value: "f3", label: "会议纪要.md" },
    ],
  },
  {
    value: "archive",
    label: "归档",
    children: [{ value: "f4", label: "去年总结.docx" }],
  },
  { value: "trash", label: "回收站", children: [] },
]);

const log = ref("按住任意一行拖走，或 Tab 进树里按 Alt + 方向键搬");

const isFolder = (entry: Entry): entry is Folder => "children" in entry;

// 目录只待在根层（下面那条 allowDrop 保证了这点），找目录就是在根层找
function folderOf(value: string): Folder | undefined {
  return collection.value.filter(isFolder).find((folder) => folder.value === value);
}

/** parent 指的那一层：根层是 collection 本身，目录是它的 children。 */
function levelOf(parent: string | null): Entry[] | undefined {
  return parent == null ? collection.value : folderOf(parent)?.children;
}

// 这一次搬家许不许。库自己兜住的是「落进自己的后代」与「落在禁用节点上」，
// 剩下的是这份数据的规矩：只有目录收得下东西，而且只收文件——
// 目录因此永远待在根层，回收站也收不到整个目录。
function allowDrop(move: Move): boolean {
  if (move.parent == null) return true;
  return folderOf(move.parent) != null && folderOf(move.value) == null;
}

// 树从不拥有数据：库只说搬到哪个父下面的第几位，改数组这一下归宿主。
// index 已经算过「先摘后插」，照着先摘再插即可。
function onNodeMove(move: Move): void {
  const levels: Entry[][] = [
    collection.value,
    ...collection.value.filter(isFolder).map((folder) => folder.children),
  ];
  const from = levels.find((level) => level.some((node) => node.value === move.value));
  const into = levelOf(move.parent);
  if (!from || !into) return;
  const [moved] = from.splice(
    from.findIndex((node) => node.value === move.value),
    1,
  );
  if (!moved) return;
  into.splice(move.index, 0, moved);
  const where = move.parent == null ? "根层" : (folderOf(move.parent)?.label ?? move.parent);
  log.value = \`\${moved.label} 搬到了\${where}第 \${move.index + 1} 位\`;
}
<\/script>

<template>
  <div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
    <XhTreeRoot
      :collection="collection"
      :default-expanded-value="['inbox', 'archive', 'trash']"
      :allow-drop="allowDrop"
      node-draggable
      @node-move="onNodeMove"
    >
      <XhTreeLabel>邮箱目录</XhTreeLabel>
      <XhTreeTree>
        <template v-for="entry in collection" :key="entry.value">
          <XhTreeBranch v-if="isFolder(entry)" :value="entry.value">
            <XhTreeBranchControl>
              <XhTreeBranchTrigger />
              <XhTreeBranchText>{{ entry.label }}</XhTreeBranchText>
              <span style="margin-inline-start: auto">{{ entry.children.length }}</span>
            </XhTreeBranchControl>
            <XhTreeBranchContent>
              <XhTreeItem v-for="file in entry.children" :key="file.value" :value="file.value">
                <span aria-hidden="true">📄</span>
                <XhTreeItemText>{{ file.label }}</XhTreeItemText>
              </XhTreeItem>
            </XhTreeBranchContent>
          </XhTreeBranch>
          <!-- 文件退到根层就不在任何目录里了，那一层直接是它自己 -->
          <XhTreeItem v-else :value="entry.value">
            <span aria-hidden="true">📄</span>
            <XhTreeItemText>{{ entry.label }}</XhTreeItemText>
          </XhTreeItem>
        </template>
      </XhTreeTree>
      <!-- 播报区视觉隐藏，必须在拖动开始之前就在 DOM 上 -->
      <XhTreeLiveRegion />
    </XhTreeRoot>
    <span>{{ log }}</span>
  </div>
</template>
`;export{e as default};

const e=`// 只挑文件不挑目录 | 选中值与展开态双受控：目录的值不写回，紧跟着那一次收起意图也一并吞掉，点目录就只剩展开收起
import type { ReactNode } from "react";
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/react";
import { useRef, useState } from "react";

interface Node {
  value: string;
  label: string;
  children?: Node[];
}

const files: Node[] = [
  {
    value: "docs",
    label: "docs",
    children: [
      { value: "guide", label: "guide.md" },
      {
        value: "i18n",
        label: "i18n",
        children: [
          { value: "zh", label: "zh-CN.md" },
          { value: "en", label: "en-US.md" },
        ],
      },
    ],
  },
  {
    value: "assets",
    label: "assets",
    children: [{ value: "logo", label: "logo.svg" }],
  },
  { value: "readme", label: "README.md" },
];

// 目录的值集合：判定这次选中该不该写回
const dirs = new Set<string>();
function collectDirs(nodes: Node[]): void {
  for (const node of nodes) {
    if (!node.children)
      continue;
    dirs.add(node.value);
    collectDirs(node.children);
  }
}
collectDirs(files);

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const swallowClose = useRef(false);

  function onValueChange(details: { value: string[] }): void {
    if (details.value.some(v => dirs.has(v))) {
      // 目录不进选中值；单选下紧跟着的那次收起随之作废
      swallowClose.current = true;
      return;
    }
    setValue(details.value);
  }

  function onOpenChange(details: { open: boolean }): void {
    if (!details.open && swallowClose.current) {
      swallowClose.current = false;
      return;
    }
    setOpen(details.open);
  }

  return (
    <>
      <XhTreeSelectRoot
        collection={files}
        value={value}
        open={open}
        defaultExpandedValue={["docs"]}
        placeholder="选一个文件"
        style={{ maxInlineSize: "320px" }}
        onValueChange={onValueChange}
        onOpenChange={onOpenChange}
      >
        <XhTreeSelectLabel>附件</XhTreeSelectLabel>
        <XhTreeSelectControl>
          <XhTreeSelectTrigger>
            <XhTreeSelectValueText />
            <XhTreeSelectIndicator />
          </XhTreeSelectTrigger>
        </XhTreeSelectControl>
        <XhTreeSelectPositioner>
          <XhTreeSelectContent>
            <XhTreeSelectTree>
              <XhTreeSelectBranch value="docs">
                <XhTreeSelectBranchControl>
                  <XhTreeSelectBranchTrigger />
                  <XhTreeSelectBranchText>docs</XhTreeSelectBranchText>
                  <XhTreeSelectItemIndicator />
                </XhTreeSelectBranchControl>
                <XhTreeSelectBranchContent>
                  <XhTreeSelectItem value="guide">
                    <XhTreeSelectItemIndicator />
                    <XhTreeSelectItemText>guide.md</XhTreeSelectItemText>
                  </XhTreeSelectItem>
                  <XhTreeSelectBranch value="i18n">
                    <XhTreeSelectBranchControl>
                      <XhTreeSelectBranchTrigger />
                      <XhTreeSelectBranchText>i18n</XhTreeSelectBranchText>
                      <XhTreeSelectItemIndicator />
                    </XhTreeSelectBranchControl>
                    <XhTreeSelectBranchContent>
                      <XhTreeSelectItem value="zh">
                        <XhTreeSelectItemIndicator />
                        <XhTreeSelectItemText>zh-CN.md</XhTreeSelectItemText>
                      </XhTreeSelectItem>
                      <XhTreeSelectItem value="en">
                        <XhTreeSelectItemIndicator />
                        <XhTreeSelectItemText>en-US.md</XhTreeSelectItemText>
                      </XhTreeSelectItem>
                    </XhTreeSelectBranchContent>
                  </XhTreeSelectBranch>
                </XhTreeSelectBranchContent>
              </XhTreeSelectBranch>

              <XhTreeSelectBranch value="assets">
                <XhTreeSelectBranchControl>
                  <XhTreeSelectBranchTrigger />
                  <XhTreeSelectBranchText>assets</XhTreeSelectBranchText>
                  <XhTreeSelectItemIndicator />
                </XhTreeSelectBranchControl>
                <XhTreeSelectBranchContent>
                  <XhTreeSelectItem value="logo">
                    <XhTreeSelectItemIndicator />
                    <XhTreeSelectItemText>logo.svg</XhTreeSelectItemText>
                  </XhTreeSelectItem>
                </XhTreeSelectBranchContent>
              </XhTreeSelectBranch>

              <XhTreeSelectItem value="readme">
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>README.md</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectTree>
          </XhTreeSelectContent>
        </XhTreeSelectPositioner>
      </XhTreeSelectRoot>
      <p>{\`已选：\${value.length ? value.join("、") : "（无）"}\`}</p>
    </>
  );
}
`;export{e as default};

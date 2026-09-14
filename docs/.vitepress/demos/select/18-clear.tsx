// 清空 | 有值时显示清空按钮
import type { ReactNode } from "react";
import { XhSelectRoot } from "@xihan-ui/react";

const teams = [
  { value: "design", label: "设计组" },
  { value: "frontend", label: "前端组" },
  { value: "server", label: "服务端组" },
];

export default function Demo(): ReactNode {
  return <XhSelectRoot
    collection={teams}
    defaultValue={["frontend"]}
    translations={{ clearTrigger: "清空所选" }}
    clearable
    label="所属小组"
    placeholder="选一个组"
    style={{ inlineSize: "240px" }}
  />;
}

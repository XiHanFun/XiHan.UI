// 大量选项 | 列表内部滚动并支持连打检索
import type { ReactNode } from "react";
import { XhSelectRoot } from "@xihan-ui/react";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const options = Array.from(letters, letter => ({ value: letter, label: `${letter} 区` }));

export default function Demo(): ReactNode {
  return <XhSelectRoot collection={options} label="仓位" placeholder="敲 M 试试" />;
}

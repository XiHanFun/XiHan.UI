// 长选项虚拟化 | 一万条选项只写 virtual：浮层里只铺滚到的那一屏，键盘仍跨完整 collection；虚拟化那一块按需加载，没开的不为它付体积
import type { ReactNode } from "react";
import { XhSelectRoot } from "@xihan-ui/react";

const options = Array.from({ length: 10000 }, (_, index) => ({ value: `option-${index + 1}`, label: `选项 ${index + 1}` }));

export default function Demo(): ReactNode {
  return <XhSelectRoot collection={options} virtual label="长列表" placeholder="请选择" />;
}

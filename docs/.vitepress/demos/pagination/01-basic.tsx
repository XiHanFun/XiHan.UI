// 基础用法 | 在页码之间导航
import type { ReactNode } from "react";
import { XhPaginationRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <XhPaginationRoot count={196} pageSize={10} />;
}

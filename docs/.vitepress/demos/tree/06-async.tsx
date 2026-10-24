// 异步加载子节点 | 节点写 hasChildren，首次展开时组件调 loadChildren 取子项：在途转圈并报告 aria-busy，取回后由组件暂存，收起再展开不重复请求；运维中心第一次会失败，点重试或在该行按 Enter 再取
import type { ReactNode } from "react";
import { XhTreeRoot } from "@xihan-ui/react";

interface Node {
  value: string;
  label?: string;
  hasChildren?: boolean;
}

// hasChildren 标出还没取回子项的部门；没写的是叶子，不用取
const collection: Node[] = [
  { value: "rd", label: "研发中心", hasChildren: true },
  { value: "ops", label: "运维中心", hasChildren: true },
  { value: "biz", label: "业务中心", hasChildren: true },
  { value: "board", label: "董事办" },
];

const staff: Record<string, string[]> = {
  rd: ["赵一", "钱二"],
  ops: ["孙三"],
  biz: ["李四", "周五", "吴六"],
};

const failedOnce = new Set<string>();

// 这里用定时器代替一次请求；收起分支或卸载时 signal 中止它
function loadChildren({ node, signal }: { node: Node; signal: AbortSignal }): Promise<Node[]> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      if (node.value === "ops" && !failedOnce.has(node.value)) {
        failedOnce.add(node.value);
        reject(new Error("网络错误"));
        return;
      }
      resolve((staff[node.value] ?? []).map((name, index) => ({ value: `${node.value}-${index}`, label: name })));
    }, 800);
    signal.addEventListener("abort", () => {
      window.clearTimeout(timer);
      reject(signal.reason);
    });
  });
}

export default function Demo(): ReactNode {
  return (
    <XhTreeRoot
      collection={collection}
      loadChildren={loadChildren}
      label="组织架构"
      style={{ inlineSize: "100%", maxInlineSize: 320 }}
    />
  );
}

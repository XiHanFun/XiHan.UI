const e=`// 选项副文本 | 一行放不下的解释写在第 2 行
import type { SelectNode } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhSelectRoot } from "@xihan-ui/react";

const plans: SelectNode[] = [
  { value: "free", label: "免费版", description: "单人使用，保留 30 天历史" },
  { value: "team", label: "团队版", description: "最多 20 人，共享工作区与审计日志" },
  { value: "enterprise", label: "企业版", description: "单点登录、私有部署与专属支持" },
];

export default function Demo(): ReactNode {
  return <XhSelectRoot collection={plans} defaultValue={["team"]} label="订阅方案" placeholder="请选择" />;
}
`;export{e as default};

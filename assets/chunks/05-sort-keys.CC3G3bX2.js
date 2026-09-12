const e=`// 键排序 | sortKeys 让对象键按字典序排，数组顺序不动；接口返回的字段顺序不稳定时用它
import type { ReactNode } from "react";
import { XhJsonViewerRoot } from "@xihan-ui/react";

const payload = {
  zone: "cn-east-1",
  action: "deploy",
  meta: { retries: 2, at: "2026-08-20", by: "ci" },
  steps: ["build", "test", "publish"],
};

export default function Demo(): ReactNode {
  return (
    <XhJsonViewerRoot
      value={payload}
      defaultExpandedDepth={2}
      sortKeys
      style={{ inlineSize: "100%", maxInlineSize: "420px" }}
    />
  );
}
`;export{e as default};

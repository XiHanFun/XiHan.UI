const e=`// 菜单栏设置 | checkbox 与 radio 的值独立于当前展开菜单
import type { MenubarNode } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhMenubarRoot } from "@xihan-ui/react";

const collection: MenubarNode[] = [{
  value: "view",
  label: "视图",
  items: [
    { value: "status", label: "状态栏", kind: "checkbox" },
    { value: "comfortable", label: "宽松", kind: "radio", group: "density", groupLabel: "密度" },
    { value: "compact", label: "紧凑", kind: "radio", group: "density" },
  ],
}];

export default function Demo(): ReactNode {
  return <XhMenubarRoot collection={collection} defaultCheckboxValue={["status"]} defaultRadioValue={{ density: "comfortable" }} />;
}
`;export{e as default};

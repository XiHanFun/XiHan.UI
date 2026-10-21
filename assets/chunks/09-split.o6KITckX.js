var e=`// 分体按钮 | 主操作旁接一个下拉菜单
import type { ReactNode } from "react";
import { ChevronDownIcon } from "@xihan-ui/icons";
import { XhButton, XhButtonGroup, XhIcon, XhMenuRoot } from "@xihan-ui/react";

const more = [
  { value: "save-as", label: "另存为" },
  { value: "save-template", label: "存为模板" },
  { value: "save-copy", label: "保存副本" },
];

export default function Demo(): ReactNode {
  return (
    <XhButtonGroup variant="solid">
      <XhButton>保存</XhButton>
      <XhMenuRoot
        collection={more}
        placement="bottom-end"
        triggerAsChild
        trigger={(
          <XhButton iconOnly aria-label="更多保存方式">
            <XhIcon icon={ChevronDownIcon} />
          </XhButton>
        )}
      />
    </XhButtonGroup>
  );
}
`;export{e as default};
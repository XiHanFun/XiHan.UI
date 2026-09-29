const e=`// 分页 | page-size 让每侧只渲染当前这一页，两侧各翻各的；翻页器用分页组件拼进面板，页码、页数与条数取自面板插槽。全选、计数与搬运仍按整侧算，搜索串一变回到第 1 页
import type { TransferPanelSlotProps } from "@xihan-ui/react";
import type { ReactNode } from "react";
import {
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSearch,
  XhTransferSelectAllTrigger,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const PAGE_SIZE = 6;

const items = Array.from({ length: 40 }, (_, i) => ({
  value: \`member-\${i + 1}\`,
  label: \`成员 \${String(i + 1).padStart(2, "0")}\`,
}));

// 两侧面板的内容只差标题，按面板插槽给的这一页铺条目、拼翻页器
function panelBody(title: string, slot: TransferPanelSlotProps): ReactNode {
  return (
    <>
      <XhTransferPanelHeader>
        <XhTransferPanelTitle>{title}</XhTransferPanelTitle>
        <XhTransferSelectAllTrigger>全选</XhTransferSelectAllTrigger>
        <XhTransferPanelCount />
      </XhTransferPanelHeader>
      <XhTransferSearch placeholder="搜索成员" />
      <XhTransferList>
        {slot.items.map(item => (
          <XhTransferItem key={item.value} value={item.value}>
            <XhTransferItemCheckbox />
            <XhTransferItemText>{item.label}</XhTransferItemText>
          </XhTransferItem>
        ))}
      </XhTransferList>
      <XhPaginationRoot page={slot.page} count={slot.total} pageSize={PAGE_SIZE} size="sm" onPageChange={details => slot.setPage(details.page)}>
        <XhPaginationPrevTrigger />
        <span>{\`\${slot.page} / \${slot.pageCount}\`}</span>
        <XhPaginationNextTrigger />
      </XhPaginationRoot>
    </>
  );
}

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);

  return (
    <div style={{ inlineSize: "100%", maxInlineSize: "560px" }}>
      <XhTransferRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        collection={items}
        pageSize={PAGE_SIZE}
        searchable
      >
        <XhTransferSourcePanel>{slot => panelBody("全部成员", slot)}</XhTransferSourcePanel>
        <XhTransferToTargetTrigger />
        <XhTransferToSourceTrigger />
        <XhTransferTargetPanel>{slot => panelBody("项目成员", slot)}</XhTransferTargetPanel>
      </XhTransferRoot>
    </div>
  );
}
`;export{e as default};

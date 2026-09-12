// Popover + Listbox | 不参与表单的选择
import type { ReactNode } from "react";
import {
  XhListboxRoot,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const orders = [
  { value: "latest", label: "最新发布" },
  { value: "hot", label: "最多讨论" },
  { value: "price", label: "价格从低到高" },
];

export default function Demo(): ReactNode {
  const [order, setOrder] = useState<string[]>(["latest"]);
  const [open, setOpen] = useState(false);
  const label = orders.find(o => o.value === order[0])?.label ?? "排序";

  // 单选：落值即收起浮层
  function onValueChange(details: { value: string[] }): void {
    setOrder(details.value);
    if (details.value.length > 0)
      setOpen(false);
  }

  return (
    <XhPopoverRoot
      open={open}
      onOpenChange={details => setOpen(details.open)}
      placement="bottom-start"
    >
      <XhPopoverTrigger>{`排序：${label}`}</XhPopoverTrigger>
      <XhPopoverPositioner>
        <XhPopoverContent>
          <XhListboxRoot
            value={order}
            collection={orders}
            style={{ minInlineSize: "180px" }}
            onValueChange={onValueChange}
          />
        </XhPopoverContent>
      </XhPopoverPositioner>
    </XhPopoverRoot>
  );
}

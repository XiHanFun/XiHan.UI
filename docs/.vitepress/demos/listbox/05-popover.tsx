// 弹出式选择 | 把列表装进浮层：触发器显示当前选中项，落值即收起，浮层底部还能放操作按钮
import type { ReactNode } from "react";
import {
  XhButton,
  XhListboxRoot,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const songs = [
  { value: "song1", label: "起风了" },
  { value: "song2", label: "夜空中最亮的星" },
  { value: "song3", label: "海阔天空（暂不可选）", disabled: true },
  { value: "song4", label: "晴天" },
];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>(["song1"]);
  const [open, setOpen] = useState(false);

  const label = songs.find(s => s.value === value[0])?.label ?? "弹出选择";

  return (
    <>
      <XhPopoverRoot
        open={open}
        onOpenChange={details => setOpen(details.open)}
        placement="bottom-start"
      >
        <XhPopoverTrigger>{label}</XhPopoverTrigger>
        <XhPopoverPositioner>
          <XhPopoverContent>
            <XhListboxRoot
              value={value}
              collection={songs}
              style={{ minInlineSize: "200px" }}
              onValueChange={(details) => {
                setValue(details.value);
                // 单选：落值即收起浮层
                if (details.value.length > 0)
                  setOpen(false);
              }}
            />
            <XhButton variant="ghost" size="sm" onClick={() => setValue([])}>清空</XhButton>
          </XhPopoverContent>
        </XhPopoverPositioner>
      </XhPopoverRoot>
      <p>{`已选：${value.length ? value.join("、") : "（无）"}`}</p>
    </>
  );
}

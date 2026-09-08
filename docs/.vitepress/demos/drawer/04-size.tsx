// 尺寸 | size 落成 content 的 data-size，只改面板贴边方向上的厚度；三档各自一个抽屉，点开才看得出厚薄
import type { ReactNode } from "react";
import {
  XhButton,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/react";

// 中间档不传 size，缺省即中档
const sizes = [
  { key: "sm", size: "sm", label: "sm 薄" },
  { key: "md", size: undefined, label: "缺省" },
  { key: "lg", size: "lg", label: "lg 厚" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
      {sizes.map(s => (
        <XhDrawerRoot key={s.key} size={s.size} translations={{ close: "关闭" }}>
          {({ setOpen }) => (
            <>
              <XhDrawerTrigger>{s.label}</XhDrawerTrigger>
              <XhDrawerContent>
                <XhDrawerTitle>{`${s.label}抽屉`}</XhDrawerTitle>
                <XhDrawerDescription>
                  面板贴住右边，三档只有厚度不同。
                </XhDrawerDescription>
                <XhButton variant="solid" onClick={() => setOpen(false)}>关闭</XhButton>
                <XhDrawerCloseTrigger />
              </XhDrawerContent>
            </>
          )}
        </XhDrawerRoot>
      ))}
    </div>
  );
}

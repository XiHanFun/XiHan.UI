// 形态 | 设置切换按钮外观
import type { ReactNode } from "react";
import { XhToggle } from "@xihan-ui/react";

const variants = ["solid", "subtle", "outline", "ghost"] as const;

export default function Demo(): ReactNode {
  return (
    <>
      {variants.map(variant => (
        <XhToggle key={variant} variant={variant} defaultPressed>{variant}</XhToggle>
      ))}
    </>
  );
}

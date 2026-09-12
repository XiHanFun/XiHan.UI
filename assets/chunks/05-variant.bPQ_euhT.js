const n=`// 形态 | variant 只改控件的颜色槽位，标签的形态按控件的面派：subtle 控件里是描边标签，其余是淡底标签；落标签与删标签的行为三档一致
import type { ReactNode } from "react";
import {
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/react";

const variants = ["outline", "subtle", "ghost"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxInlineSize: "420px" }}>
      {variants.map(v => (
        <XhTagsInputRoot
          key={v}
          variant={v}
          defaultValue={["Vue", "TypeScript"]}
          placeholder="回车落一个"
        >
          {({ value }) => (
            <>
              <XhTagsInputLabel>{v}</XhTagsInputLabel>
              <XhTagsInputControl>
                {value.map(t => (
                  <XhTagsInputItem key={t} value={t}>
                    <XhTagsInputItemPreview>
                      <XhTagsInputItemText>{t}</XhTagsInputItemText>
                      <XhTagsInputItemDeleteTrigger />
                    </XhTagsInputItemPreview>
                  </XhTagsInputItem>
                ))}
                <XhTagsInputInput />
              </XhTagsInputControl>
            </>
          )}
        </XhTagsInputRoot>
      ))}
    </div>
  );
}
`;export{n as default};

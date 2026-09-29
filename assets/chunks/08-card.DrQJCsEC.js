const o=`// 卡片 | variant="card" 把每个选项画成一张可点的卡，文案下方用说明行交代差别
import type { ReactNode } from "react";
import {
  XhRadioGroupItem,
  XhRadioGroupItemDescription,
  XhRadioGroupItemText,
  XhRadioGroupLabel,
  XhRadioGroupRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhRadioGroupRoot variant="card" defaultValue="team" style={{ maxInlineSize: "24rem" }}>
      <XhRadioGroupLabel>套餐</XhRadioGroupLabel>
      <XhRadioGroupItem value="personal">
        <XhRadioGroupItemText>个人版</XhRadioGroupItemText>
        <XhRadioGroupItemDescription>1 位成员，10 GB 存储</XhRadioGroupItemDescription>
      </XhRadioGroupItem>
      <XhRadioGroupItem value="team">
        <XhRadioGroupItemText>团队版</XhRadioGroupItemText>
        <XhRadioGroupItemDescription>最多 20 位成员，100 GB 存储</XhRadioGroupItemDescription>
      </XhRadioGroupItem>
      <XhRadioGroupItem value="enterprise">
        <XhRadioGroupItemText>企业版</XhRadioGroupItemText>
        <XhRadioGroupItemDescription>成员不限，按需扩容与专属支持</XhRadioGroupItemDescription>
      </XhRadioGroupItem>
    </XhRadioGroupRoot>
  );
}
`;export{o as default};

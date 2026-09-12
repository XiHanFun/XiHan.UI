// 分组 | group 把条目分段，group-label 是这一段的可及名字，不参与选中也不接方向键
import type { ReactNode } from "react";
import {
  XhListboxContent,
  XhListboxGroup,
  XhListboxGroupLabel,
  XhListboxItem,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const groups = [
  {
    value: "asia",
    label: "亚洲",
    items: [
      { value: "bangkok", label: "Bangkok 曼谷" },
      { value: "beijing", label: "Beijing 北京" },
      { value: "chengdu", label: "Chengdu 成都" },
    ],
  },
  {
    value: "europe",
    label: "欧洲",
    items: [
      { value: "berlin", label: "Berlin 柏林" },
      { value: "london", label: "London 伦敦" },
    ],
  },
];

export default function Demo(): ReactNode {
  const [city, setCity] = useState<string[]>([]);

  return (
    <>
      <XhListboxRoot
        value={city}
        onValueChange={details => setCity(details.value)}
        style={{ maxInlineSize: "320px" }}
      >
        <XhListboxLabel>城市</XhListboxLabel>
        <XhListboxContent>
          {groups.map(g => (
            <XhListboxGroup key={g.value} value={g.value}>
              <XhListboxGroupLabel>{g.label}</XhListboxGroupLabel>
              {g.items.map(c => (
                <XhListboxItem key={c.value} value={c.value}>
                  <XhListboxItemText>{c.label}</XhListboxItemText>
                  <XhListboxItemIndicator />
                </XhListboxItem>
              ))}
            </XhListboxGroup>
          ))}
        </XhListboxContent>
      </XhListboxRoot>
      <p>{`已选：${city.length ? city.join("、") : "（无）"}`}</p>
    </>
  );
}

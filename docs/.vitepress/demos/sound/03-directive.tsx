// 元素配声 | v-sound 默认放 click，给字符串即指名；键盘敲 Enter 一样响，禁用态不响
import type { ReactNode } from "react";
import { XhButton } from "@xihan-ui/react";
import { useSoundOnPress } from "@xihan-ui/react/sound";

export default function Demo(): ReactNode {
  // useSoundOnPress 返回一个 ref 回调，挂到元素上即配声；不传参就是 click
  const press = useSoundOnPress();
  const send = useSoundOnPress("send");
  const toggle = useSoundOnPress({ sound: "toggle-on", volume: 0.6 });
  const muted = useSoundOnPress();

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      <XhButton ref={press} variant="solid">默认 click</XhButton>
      <XhButton ref={send} variant="outline">发送</XhButton>
      <XhButton ref={toggle} variant="outline">指定音量</XhButton>
      <XhButton ref={muted} disabled variant="outline">禁用不响</XhButton>
    </div>
  );
}

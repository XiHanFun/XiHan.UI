const n=`// 面板里切换写法 | format 只管对外的序列化：换过之后把当前值原样写回一次，值串就改按新写法产出，工作色一点不动
import type { CSSProperties, ReactNode } from "react";
import {
  XhButton,
  XhColorPickerAreaThumb,
  XhColorPickerChannelSlider,
  XhColorPickerChannelSliderThumb,
  XhColorPickerChannelSliderTrack,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/react";
import { useEffect, useRef, useState } from "react";

type Format = "hex" | "rgba" | "hsla";

const formats: Format[] = ["hex", "rgba", "hsla"];

const modes: CSSProperties = {
  display: "flex",
  gap: "6px",
};

export default function Demo(): ReactNode {
  const [format, setFormat] = useState<Format>("hex");
  const [color, setColor] = useState("#3b82f6");

  // 写值的命令每次渲染都攥一份最新的，换过写法之后由效应调用
  const setValueRef = useRef<(value: string) => void>(() => {});
  const applied = useRef<Format>(format);

  useEffect(() => {
    if (applied.current === format)
      return;
    applied.current = format;
    // 新写法已经落到组件上，把当前值原样写回一次
    setValueRef.current(color);
  }, [format, color]);

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <XhColorPickerRoot
        value={color}
        format={format}
        onValueChange={details => setColor(details.value)}
      >
        {({ setValue }) => {
          setValueRef.current = setValue;
          return (
            <>
              <XhColorPickerLabel>强调色</XhColorPickerLabel>
              <XhColorPickerControl>
                <XhColorPickerTrigger>
                  <XhColorPickerSwatch />
                  <XhColorPickerValueText />
                </XhColorPickerTrigger>
              </XhColorPickerControl>
              <XhColorPickerPositioner>
                <XhColorPickerContent>
                  <XhColorPickerSaturationArea>
                    <XhColorPickerAreaThumb />
                  </XhColorPickerSaturationArea>
                  <XhColorPickerChannelSlider channel="hue">
                    <XhColorPickerChannelSliderTrack />
                    <XhColorPickerChannelSliderThumb />
                  </XhColorPickerChannelSlider>
                  <div style={modes}>
                    {formats.map(item => (
                      <XhButton
                        key={item}
                        size="sm"
                        variant={item === format ? "solid" : "ghost"}
                        onClick={() => setFormat(item)}
                      >
                        {item}
                      </XhButton>
                    ))}
                  </div>
                </XhColorPickerContent>
              </XhColorPickerPositioner>
            </>
          );
        }}
      </XhColorPickerRoot>

      <span>
        当前：
        {color}
      </span>
    </div>
  );
}
`;export{n as default};

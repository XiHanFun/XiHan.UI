var e=`// 试听 | 十四个语义名，切换主题可听到同一件事的三种表达；音量与开关直接落在播放器上
import type { SoundTheme } from "@xihan-ui/sound";
import type { ReactNode } from "react";
import {
  XhButton,
  XhRadioGroupRoot,
  XhSliderControl,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
  XhSwitch,
} from "@xihan-ui/react";
import {
  BUILTIN_SOUND_NAMES,
  createSoundPlayer,
  defaultSoundTheme,
  minimalSoundTheme,
  softSoundTheme,
} from "@xihan-ui/sound";
import { useEffect, useState } from "react";

const themes: Record<string, SoundTheme> = {
  default: defaultSoundTheme,
  minimal: minimalSoundTheme,
  soft: softSoundTheme,
};

const options = [
  { value: "default", label: "default 清亮" },
  { value: "minimal", label: "minimal 极简" },
  { value: "soft", label: "soft 柔和" },
];

export default function Demo(): ReactNode {
  // 建播放器不碰音频上下文，等第一次真的发声才建，放首帧里是安全的
  const [player] = useState(createSoundPlayer);
  const [theme, setTheme] = useState("default");
  // 滑块的值恒为数组，单滑块只有一项
  const [volume, setVolume] = useState<[number]>([0.5]);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    player.setTheme(themes[theme] ?? defaultSoundTheme);
  }, [player, theme]);
  useEffect(() => {
    player.setVolume(volume[0]);
  }, [player, volume]);
  useEffect(() => {
    player.setEnabled(enabled);
  }, [player, enabled]);

  useEffect(() => () => player.dispose(), [player]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "20px" }}>
        <XhRadioGroupRoot
          value={theme}
          onValueChange={details => setTheme(details.value ?? "default")}
          collection={options}
          label="主题"
          name="sound-theme"
        />
        <XhSliderRoot
          value={volume}
          onValueChange={details => setVolume(details.value as [number])}
          min={0}
          max={1}
          step={0.05}
          style={{ inlineSize: "var(--xh-control-w)" }}
        >
          <XhSliderLabel>音量</XhSliderLabel>
          <XhSliderControl>
            <XhSliderTrack>
              <XhSliderRange />
            </XhSliderTrack>
            <XhSliderThumb />
          </XhSliderControl>
        </XhSliderRoot>
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          出声
          <XhSwitch checked={enabled} onCheckedChange={details => setEnabled(details.checked)} />
        </label>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {BUILTIN_SOUND_NAMES.map(name => (
          <XhButton key={name} variant="outline" size="sm" onClick={() => player.play(name)}>
            {name}
          </XhButton>
        ))}
      </div>
    </div>
  );
}
`;export{e as default};
const e=`// 试听 | 十四个语义名，切主题听同一件事的三种说法；音量与开关直接落在播放器上
import type { SoundTheme } from "@xihan-ui/sound";
import type { ReactNode } from "react";
import { XhButton, XhRadioGroupRoot, XhSwitch } from "@xihan-ui/react";
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
  const [volume, setVolume] = useState(0.5);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    player.setTheme(themes[theme] ?? defaultSoundTheme);
  }, [player, theme]);
  useEffect(() => {
    player.setVolume(volume);
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
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          音量
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={event => setVolume(Number(event.target.value))}
          />
        </label>
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

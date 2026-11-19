var e=`// 循环 | loop 一直响到 stop：来电 ring 与回铃 ringback 各按配方的周期续上，按一下开始、再按一下停下
import type { SoundLoop } from "@xihan-ui/sound";
import type { ReactNode } from "react";
import { XhButton } from "@xihan-ui/react";
import { createSoundPlayer } from "@xihan-ui/sound";
import { useEffect, useRef, useState } from "react";

const names = ["ring", "ringback"] as const;

export default function Demo(): ReactNode {
  const [player] = useState(createSoundPlayer);
  const [playing, setPlaying] = useState<string | null>(null);
  const current = useRef<SoundLoop | null>(null);

  useEffect(() => () => player.dispose(), [player]);

  function toggle(name: string): void {
    current.current?.stop();
    current.current = null;
    if (playing === name) {
      setPlaying(null);
      return;
    }
    current.current = player.loop(name);
    setPlaying(name);
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {names.map(name => (
        <XhButton
          key={name}
          variant={playing === name ? "solid" : "outline"}
          aria-pressed={playing === name}
          onClick={() => toggle(name)}
        >
          {playing === name ? \`停下 \${name}\` : name}
        </XhButton>
      ))}
    </div>
  );
}
`;export{e as default};
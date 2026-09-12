const e=`// 调音台 | 配方是纯数据：调参、试听、把代码抄进项目，中间没有任何音频文件
import type { OscillatorLayer, SoundSpec } from "@xihan-ui/sound";
import type { ReactNode } from "react";
import { XhButton, XhRadioGroupRoot } from "@xihan-ui/react";
import { createSoundPlayer, glide, strike } from "@xihan-ui/sound";
import { useEffect, useState } from "react";

const waves = [
  { value: "sine", label: "sine" },
  { value: "triangle", label: "triangle" },
  { value: "square", label: "square" },
  { value: "sawtooth", label: "sawtooth" },
];

export default function Demo(): ReactNode {
  const [wave, setWave] = useState<OscillatorLayer["wave"]>("triangle");
  const [from, setFrom] = useState(880);
  const [to, setTo] = useState(1320);
  const [attack, setAttack] = useState(5);
  const [decay, setDecay] = useState(180);
  const [peak, setPeak] = useState(0.3);
  const [space, setSpace] = useState(0.15);

  const seconds = Math.max(0.01, decay / 1000);

  const spec: SoundSpec = {
    layers: [
      {
        kind: "oscillator",
        wave,
        frequency: glide(from, to, seconds),
        gain: strike(peak, attack / 1000, seconds),
      },
    ],
    space,
  };

  const code = \`sound.play({
  layers: [
    {
      kind: 'oscillator',
      wave: '\${wave}',
      frequency: glide(\${from}, \${to}, \${seconds.toFixed(3)}),
      gain: strike(\${peak}, \${(attack / 1000).toFixed(3)}, \${seconds.toFixed(3)}),
    },
  ],
  space: \${space},
})\`;

  const [player] = useState(createSoundPlayer);
  useEffect(() => () => player.dispose(), [player]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      <XhRadioGroupRoot
        value={wave}
        onValueChange={details => setWave((details.value ?? "triangle") as OscillatorLayer["wave"])}
        collection={waves}
        label="波形"
        name="sound-wave"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "10px 20px",
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "76px" }}>{\`起始 \${from}Hz\`}</span>
          <input
            type="range"
            min="80"
            max="2400"
            step="10"
            value={from}
            onChange={event => setFrom(Number(event.target.value))}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "76px" }}>{\`终止 \${to}Hz\`}</span>
          <input
            type="range"
            min="80"
            max="2400"
            step="10"
            value={to}
            onChange={event => setTo(Number(event.target.value))}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "76px" }}>{\`起音 \${attack}ms\`}</span>
          <input
            type="range"
            min="1"
            max="80"
            step="1"
            value={attack}
            onChange={event => setAttack(Number(event.target.value))}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "76px" }}>{\`衰减 \${decay}ms\`}</span>
          <input
            type="range"
            min="20"
            max="900"
            step="10"
            value={decay}
            onChange={event => setDecay(Number(event.target.value))}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "76px" }}>{\`峰值 \${peak}\`}</span>
          <input
            type="range"
            min="0.05"
            max="0.6"
            step="0.05"
            value={peak}
            onChange={event => setPeak(Number(event.target.value))}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "76px" }}>{\`空间 \${space}\`}</span>
          <input
            type="range"
            min="0"
            max="0.6"
            step="0.05"
            value={space}
            onChange={event => setSpace(Number(event.target.value))}
          />
        </label>
      </div>

      <div>
        <XhButton variant="solid" onClick={() => player.play(spec)}>试听</XhButton>
      </div>

      <pre
        style={{
          margin: 0,
          padding: "12px 14px",
          borderRadius: "8px",
          background: "var(--vp-c-bg-soft)",
          fontSize: "12px",
          lineHeight: 1.6,
          overflowX: "auto",
        }}
      >
        {code}
      </pre>
    </div>
  );
}
`;export{e as default};

var e=`// 调音台 | 配方是纯数据：调参、试听、把代码复制进项目，中间没有任何音频文件
import type { OscillatorLayer, SoundSpec } from "@xihan-ui/sound";
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
} from "@xihan-ui/react";
import { createSoundPlayer, glide, strike } from "@xihan-ui/sound";
import { useEffect, useState } from "react";

const waves = [
  { value: "sine", label: "sine" },
  { value: "triangle", label: "triangle" },
  { value: "square", label: "square" },
  { value: "sawtooth", label: "sawtooth" },
];

type Param = "from" | "to" | "attack" | "decay" | "peak" | "space";

// 六个参数各一条滑块：标签、单位与取值范围
const knobs: { key: Param; label: string; unit: string; min: number; max: number; step: number }[] = [
  { key: "from", label: "起始", unit: "Hz", min: 80, max: 2400, step: 10 },
  { key: "to", label: "终止", unit: "Hz", min: 80, max: 2400, step: 10 },
  { key: "attack", label: "起音", unit: "ms", min: 1, max: 80, step: 1 },
  { key: "decay", label: "衰减", unit: "ms", min: 20, max: 900, step: 10 },
  { key: "peak", label: "峰值", unit: "", min: 0.05, max: 0.6, step: 0.05 },
  { key: "space", label: "空间", unit: "", min: 0, max: 0.6, step: 0.05 },
];

export default function Demo(): ReactNode {
  const [wave, setWave] = useState<OscillatorLayer["wave"]>("triangle");
  // 滑块的值恒为数组，单滑块只有一项
  const [params, setParams] = useState<Record<Param, [number]>>({
    from: [880],
    to: [1320],
    attack: [5],
    decay: [180],
    peak: [0.3],
    space: [0.15],
  });
  const [from] = params.from;
  const [to] = params.to;
  const [attack] = params.attack;
  const [decay] = params.decay;
  const [peak] = params.peak;
  const [space] = params.space;

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
        {knobs.map(knob => (
          <XhSliderRoot
            key={knob.key}
            value={params[knob.key]}
            onValueChange={details => setParams(prev => ({ ...prev, [knob.key]: details.value as [number] }))}
            min={knob.min}
            max={knob.max}
            step={knob.step}
          >
            <XhSliderLabel>{\`\${knob.label} \${params[knob.key][0]}\${knob.unit}\`}</XhSliderLabel>
            <XhSliderControl>
              <XhSliderTrack>
                <XhSliderRange />
              </XhSliderTrack>
              <XhSliderThumb />
            </XhSliderControl>
          </XhSliderRoot>
        ))}
      </div>

      <div>
        <XhButton variant="solid" onClick={() => player.play(spec)}>试听</XhButton>
      </div>

      <pre
        data-xh-scroll=""
        style={{
          margin: 0,
          padding: "12px 14px",
          borderRadius: "var(--xh-shape-surface)",
          background: "var(--xh-bg-subtle)",
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
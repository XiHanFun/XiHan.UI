const n=`<!-- 试听 | 十四个语义名，切换主题可听到同一件事的三种表达；音量与开关直接落在播放器上 -->
<div style="display: flex; flex-direction: column; gap: 16px; width: 100%">
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 20px">
    <xh-radio-group id="sound-play-theme" default-value="default" name="sound-theme">
      <div data-xh-part="root">
        <span data-xh-part="label">主题</span>
        <div data-xh-part="item" value="default">
          <input data-xh-part="hidden-input" />
          <span data-xh-part="indicator"></span>
          <span data-xh-part="item-text">default 清亮</span>
        </div>
        <div data-xh-part="item" value="minimal">
          <input data-xh-part="hidden-input" />
          <span data-xh-part="indicator"></span>
          <span data-xh-part="item-text">minimal 极简</span>
        </div>
        <div data-xh-part="item" value="soft">
          <input data-xh-part="hidden-input" />
          <span data-xh-part="indicator"></span>
          <span data-xh-part="item-text">soft 柔和</span>
        </div>
      </div>
    </xh-radio-group>
    <label style="display: flex; align-items: center; gap: 8px">
      音量
      <input id="sound-play-volume" type="range" min="0" max="1" step="0.05" value="0.5" />
    </label>
    <label style="display: flex; align-items: center; gap: 8px">
      出声
      <xh-switch id="sound-play-enabled" default-checked>
        <button data-xh-part="root">
          <span data-xh-part="thumb"></span>
        </button>
      </xh-switch>
    </label>
  </div>

  <div id="sound-play-names" style="display: flex; flex-wrap: wrap; gap: 8px"></div>
</div>

<script type="module">
  import {
    BUILTIN_SOUND_NAMES,
    createSoundPlayer,
    defaultSoundTheme,
    minimalSoundTheme,
    softSoundTheme,
  } from "@xihan-ui/sound";

  const themes = {
    default: defaultSoundTheme,
    minimal: minimalSoundTheme,
    soft: softSoundTheme,
  };

  // 建播放器不碰音频上下文，等第一次真的发声才建；缺省音量就是 0.5，与滑块起点一致
  const player = createSoundPlayer();
  const volume = document.getElementById("sound-play-volume");

  document.getElementById("sound-play-theme").addEventListener("value-change", (event) => {
    player.setTheme(themes[event.detail.value] ?? defaultSoundTheme);
  });
  volume.addEventListener("input", () => player.setVolume(Number(volume.value)));
  document.getElementById("sound-play-enabled").addEventListener("checked-change", (event) => {
    player.setEnabled(event.detail.checked);
  });

  // 语义名单在包里，按钮照它铺，不另抄一份
  document.getElementById("sound-play-names").append(
    ...BUILTIN_SOUND_NAMES.map((name) => {
      const button = document.createElement("xh-button");
      button.setAttribute("variant", "outline");
      button.setAttribute("size", "sm");
      button.innerHTML = \`<button data-xh-part="root">\${name}</button>\`;
      button.addEventListener("click", () => player.play(name));
      return button;
    }),
  );
<\/script>
`;export{n as default};

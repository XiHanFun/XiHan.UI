var e=`<!-- 循环 | loop 一直响到 stop：来电 ring 与回铃 ringback 各按配方的周期续上，按一下开始、再按一下停下 -->
<div id="sound-loop-names" style="display: flex; flex-wrap: wrap; gap: 8px"></div>

<script type="module">
  import { createSoundPlayer } from "@xihan-ui/sound";

  const player = createSoundPlayer();
  const buttons = new Map();
  let playing = null;
  let current = null;

  function render() {
    for (const [name, element] of buttons) {
      const on = playing === name;
      element.setAttribute("variant", on ? "solid" : "outline");
      const root = element.querySelector("[data-xh-part='root']");
      root.textContent = on ? \`停下 \${name}\` : name;
      root.setAttribute("aria-pressed", String(on));
    }
  }

  function toggle(name) {
    current?.stop();
    current = null;
    playing = playing === name ? null : name;
    if (playing)
      current = player.loop(name);
    render();
  }

  document.getElementById("sound-loop-names").append(
    ...["ring", "ringback"].map((name) => {
      const button = document.createElement("xh-button");
      button.setAttribute("variant", "outline");
      button.innerHTML = \`<button data-xh-part="root" aria-pressed="false">\${name}</button>\`;
      button.addEventListener("click", () => toggle(name));
      buttons.set(name, button);
      return button;
    }),
  );
<\/script>
`;export{e as default};
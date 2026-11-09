"use strict";
(() => {
  // 1〜9は同確率。No.9の爆弾だけが当たり。
  const weapons = [
    { name: "剣", image: "weapon-sword.svg" },
    { name: "大鎌", image: "weapon-scythe.svg" },
    { name: "槍", image: "weapon-spear.svg" },
    { name: "銃", image: "weapon-gun.svg" },
    { name: "斧", image: "weapon-axe.svg" },
    { name: "弓", image: "weapon-bow.svg" },
    { name: "ハンマー", image: "weapon-hammer.svg" },
    { name: "双剣", image: "weapon-twin-blades.svg" },
    { name: "爆弾", image: "bomb-illustration.svg" }
  ];
  const $ = id => document.getElementById(id);
  const slot = $("slot"), slotNumber = $("slot-number"), slotLabel = $("slot-label");
  const button = $("draw-button"), resetButton = $("reset-button"), hint = $("draw-hint");
  const resultCard = document.querySelector(".result-card");
  const resultNumber = $("result-number"), weaponName = $("weapon-name");
  const weaponArt = $("weapon-art"), verdict = $("verdict");
  const winsEl = $("wins"), lossesEl = $("losses"), rateEl = $("win-rate");
  const storageKey = "crazy-clown-weapon-stats-v1";
  let wins = 0, losses = 0, lastNumber = null, spinning = false;

  function updateStats() {
    winsEl.textContent = String(wins);
    lossesEl.textContent = String(losses);
    const total = wins + losses;
    rateEl.textContent = total === 0 ? "0.0%" : `${((wins / total) * 100).toFixed(1)}%`;
  }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify({ wins, losses, lastNumber })); }
    catch (_) { /* file://などで保存できないブラウザでもゲームを続けられる */ }
  }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (saved && Number.isSafeInteger(saved.wins) && saved.wins >= 0 && Number.isSafeInteger(saved.losses) && saved.losses >= 0) {
        wins = saved.wins; losses = saved.losses;
        if (Number.isInteger(saved.lastNumber) && saved.lastNumber >= 1 && saved.lastNumber <= 9) lastNumber = saved.lastNumber;
      }
    } catch (_) { /* 保存が使えない環境なら初期値で開始 */ }
  }
  function clearResult() {
    resultNumber.textContent = "No. —";
    weaponName.textContent = "抽選待ち";
    weaponArt.classList.add("placeholder-art");
    weaponArt.replaceChildren(document.createTextNode("?"));
    verdict.classList.remove("is-win", "is-loss");
    verdict.textContent = "—";
    resultCard.classList.remove("is-win");
    slotNumber.textContent = "?";
    slotLabel.textContent = "No. —";
  }
  function showResult(number, count) {
    const weapon = weapons[number - 1];
    const win = number === 9;
    slotNumber.textContent = String(number);
    slotLabel.textContent = `No.${number}`;
    resultNumber.textContent = `No. ${number}`;
    weaponName.textContent = weapon.name;
    weaponArt.classList.remove("placeholder-art");
    const img = document.createElement("img");
    img.src = `img/${weapon.image}`;
    img.alt = `${weapon.name}のイラスト`;
    weaponArt.replaceChildren(img);
    verdict.textContent = win ? "勝ち！" : "負け！";
    verdict.classList.toggle("is-win", win);
    verdict.classList.toggle("is-loss", !win);
    hint.textContent = win ? "爆弾を引き当てました。勝ち！" : `${weapon.name}を引きました。負け！`;
    if (count) {
      if (win) wins++; else losses++;
      lastNumber = number;
      save();
      updateStats();
    }
  }
  function draw() {
    if (spinning) return;
    spinning = true;
    button.disabled = true;
    slot.classList.add("is-spinning");
    document.body.classList.add("is-spinning");
    resultNumber.textContent = "No. —";
    weaponName.textContent = "抽選中…";
    weaponArt.classList.add("placeholder-art");
    weaponArt.replaceChildren(document.createTextNode("…"));
    verdict.classList.remove("is-win", "is-loss");
    verdict.textContent = "抽選中";
    hint.textContent = "武器を抽選中です。";
    // 抽選結果は開始時に一度だけ決め、アニメーション途中の数値は演出のみ。
    const result = Math.floor(Math.random() * 9) + 1;
    let elapsed = 0, delay = 50;
    function tick() {
      elapsed += delay;
      if (elapsed >= 2100) {
        slot.classList.remove("is-spinning");
        document.body.classList.remove("is-spinning");
        showResult(result, true);
        button.disabled = false;
        spinning = false;
        return;
      }
      const visible = Math.floor(Math.random() * 9) + 1;
      slotNumber.textContent = String(visible);
      slotLabel.textContent = `No.${visible}`;
      delay = Math.min(Math.round(delay * 1.15), 290);
      window.setTimeout(tick, delay);
    }
    window.setTimeout(tick, delay);
  }
  resetButton.addEventListener("click", () => {
    if (spinning) return;
    wins = 0; losses = 0; lastNumber = null;
    updateStats(); clearResult(); save();
    hint.textContent = "戦績をリセットしました。";
  });
  button.addEventListener("click", draw);
  load(); updateStats();
  if (lastNumber !== null) showResult(lastNumber, false);
})();

/* ==========================================================
   POKOREANO — bootstrap
   ========================================================== */
(function(){
  Engine.initTTS();

  const $ = UI.$;

  // Menu buttons
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const a = btn.dataset.action;
    switch(a){
      case "new-game": {
        const name = prompt("¿Tu nombre de entrenador?", "Entrenador") || "Entrenador";
        const s = State.reset();
        s.playerName = name;
        State.save();
        UI.renderMap();
        UI.showScreen("screen-map");
        break;
      }
      case "continue": {
        if (!State.load()) { UI.toast("No hay partida guardada."); return; }
        UI.renderMap();
        UI.showScreen("screen-map");
        break;
      }
      case "import": {
        UI.showScreen("screen-import");
        break;
      }
      case "do-import": {
        UI.doImport();
        break;
      }
      case "dex": {
        UI.renderDex();
        UI.showScreen("screen-dex");
        break;
      }
      case "guardians": {
        UI.renderGuardians();
        UI.showScreen("screen-guardians");
        break;
      }
      case "bag": {
        UI.renderBag();
        UI.showScreen("screen-bag");
        break;
      }
      case "cheats": {
        UI.showScreen("screen-cheats");
        break;
      }
      case "mute": {
        const m = Sfx.toggleMute();
        btn.textContent = m ? "🔇" : "🔊";
        UI.toast(m ? "Sonido apagado." : "Sonido encendido.");
        break;
      }
      case "save": {
        State.save();
        UI.toast("Guardado.");
        break;
      }
      case "close-modal": {
        UI.showScreen("screen-map");
        UI.renderMap();
        break;
      }
      case "quit-gym": {
        UI.quitGym();
        break;
      }
    }
  });

  // Dex search
  $("#dex-search").addEventListener("input", (e) => UI.renderDex(e.target.value));
  // Crate buttons
  $("#crate-open-btn").addEventListener("click", () => UI.doOpenCrate());
  $("#crate-continue-btn").addEventListener("click", () => UI.closeCrate());

  // ---------- Guardado: auto, exportar, importar, nube ----------
  setInterval(() => State.save(), 30000);              // auto-guardado cada 30s
  window.addEventListener("beforeunload", () => State.save()); // y al cerrar

  const cloudStatus = (msg, ok) => {
    const el = document.getElementById("cloud-status");
    if (el){ el.textContent = msg; el.style.color = ok ? "var(--ok)" : "var(--bad)"; }
  };
  document.querySelectorAll("[data-save-action]").forEach(b => {
    b.addEventListener("click", async () => {
      const code = (document.getElementById("cloud-code")?.value || "").trim();
      try {
        switch (b.dataset.saveAction){
          case "export":
            State.save();
            Cloud.exportFile();
            cloudStatus("Partida exportada como archivo .json ✓", true);
            break;
          case "import": {
            const input = document.getElementById("save-file-input");
            input.onchange = async () => {
              if (!input.files.length) return;
              try {
                await Cloud.importFile(input.files[0]);
                cloudStatus("Partida importada ✓ recargando…", true);
                setTimeout(() => location.reload(), 900);
              } catch(e){ cloudStatus("Error al importar: " + e.message, false); }
            };
            input.click();
            break;
          }
          case "cloud-up":
            if (!Cloud.available()){ cloudStatus("Nube no configurada — mira el README (Supabase, 5 min).", false); break; }
            State.save();
            cloudStatus("Subiendo…", true);
            await Cloud.push(code);
            cloudStatus(`Partida subida a la nube con el código "${code}" ✓`, true);
            break;
          case "cloud-down":
            if (!Cloud.available()){ cloudStatus("Nube no configurada — mira el README (Supabase, 5 min).", false); break; }
            cloudStatus("Bajando…", true);
            await Cloud.pull(code);
            cloudStatus("Partida restaurada ✓ recargando…", true);
            setTimeout(() => location.reload(), 900);
            break;
        }
      } catch(e){ cloudStatus("Error: " + e.message, false); }
    });
  });

  // Trucos (modo prueba)
  document.querySelectorAll("[data-cheat]").forEach(b => {
    b.addEventListener("click", () => {
      const s = State.get();
      switch (b.dataset.cheat){
        case "coins": State.addCoins(1000); UI.toast("+1000 monedas 💰"); break;
        case "megacoins": s.coins = 99999; State.save(); UI.toast("¡99.999 monedas! 💎"); break;
        case "badges":
          Data.gyms.forEach(g => State.grantBadge(g.key));
          UI.toast("Todas las medallas 🏅"); break;
        case "guardians":
          Creatures.CREATURES.forEach(c => { if (!s.guardians[c.key]) s.guardians[c.key] = { xp: 0 }; });
          State.save(); UI.toast("Todos los guardianes 🐾"); break;
        case "skins":
          Object.keys(Sprites.skins).forEach(k => State.unlockSkin(k));
          UI.toast("Todas las skins 👕"); break;
        case "pets":
          Creatures.PETS.forEach(p => { if (!s.ownedPets.includes(p.key)) s.ownedPets.push(p.key); });
          if (!s.activePet) s.activePet = s.ownedPets[0];
          State.save(); UI.toast("Todas las mascotas 🐶"); break;
        case "reset":
          if (confirm("¿Borrar toda la partida?")){
            localStorage.removeItem("pokoreano.save.v1");
            location.reload();
          }
          return;
      }
      Sfx.play("coin");
      UI.refreshTopbar();
    });
  });

  // Load save + custom vocab silently if exists
  State.load();
  UI.loadCustomVocab();
  // reflect persisted mute state
  const mb = document.getElementById("mute-btn");
  if (mb && Sfx.isMuted()) mb.textContent = "🔇";
})();

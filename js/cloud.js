/* ==========================================================
   POKOREANO — Guardado en la nube (Supabase, opcional)

   Para activarlo:
   1. Crea un proyecto gratis en https://supabase.com
   2. En el SQL Editor ejecuta el SQL que está en el README
      (crea la tabla `saves`).
   3. Crea el archivo js/cloud-config.js con:
        const CLOUD_CONFIG = {
          url: "https://TU-PROYECTO.supabase.co",
          key: "TU_ANON_KEY",
        };
      (ese archivo está en .gitignore: tus claves no se suben)
   ========================================================== */
const Cloud = (() => {

  const SAVE_KEY = "pokoreano.save.v1";
  const VOCAB_KEY = "pokoreano.custom.v1";

  function config(){
    return (typeof CLOUD_CONFIG !== "undefined" && CLOUD_CONFIG.url && CLOUD_CONFIG.key)
      ? CLOUD_CONFIG : null;
  }
  function available(){ return !!config(); }

  function bundle(){
    return {
      save: JSON.parse(localStorage.getItem(SAVE_KEY) || "null"),
      vocab: JSON.parse(localStorage.getItem(VOCAB_KEY) || "null"),
      exportedAt: new Date().toISOString(),
      version: 1,
    };
  }
  function applyBundle(b){
    if (!b || typeof b !== "object" || !("save" in b)) throw new Error("formato inválido");
    if (b.save) localStorage.setItem(SAVE_KEY, JSON.stringify(b.save));
    if (b.vocab) localStorage.setItem(VOCAB_KEY, JSON.stringify(b.vocab));
  }

  // ---------- exportar / importar archivo (sin nube) ----------
  function exportFile(){
    const blob = new Blob([JSON.stringify(bundle(), null, 2)], { type:"application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pokoreano-partida-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function importFile(file){
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        try { applyBundle(JSON.parse(r.result)); resolve(true); }
        catch(e){ reject(e); }
      };
      r.onerror = () => reject(new Error("no se pudo leer el archivo"));
      r.readAsText(file);
    });
  }

  // ---------- nube (Supabase REST) ----------
  async function push(code){
    const c = config();
    if (!c) throw new Error("nube no configurada");
    if (!code || code.length < 4) throw new Error("el código debe tener al menos 4 caracteres");
    const res = await fetch(`${c.url}/rest/v1/saves`, {
      method: "POST",
      headers: {
        "apikey": c.key,
        "Authorization": `Bearer ${c.key}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
      },
      body: JSON.stringify({ code, data: bundle(), updated_at: new Date().toISOString() }),
    });
    if (!res.ok) throw new Error(`error ${res.status}: ${await res.text()}`);
    return true;
  }
  async function pull(code){
    const c = config();
    if (!c) throw new Error("nube no configurada");
    const res = await fetch(
      `${c.url}/rest/v1/saves?code=eq.${encodeURIComponent(code)}&select=data`,
      { headers: { "apikey": c.key, "Authorization": `Bearer ${c.key}` } }
    );
    if (!res.ok) throw new Error(`error ${res.status}`);
    const rows = await res.json();
    if (!rows.length) throw new Error("no existe una partida con ese código");
    applyBundle(rows[0].data);
    return true;
  }

  return { available, exportFile, importFile, push, pull };
})();

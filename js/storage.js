/* ============================================================
   PromptOS — Favourites store
   Persists favourited prompt ids to localStorage so they survive
   a refresh and are shared between library.html, favorites.html
   and the home page's featured strip. Falls back to an in-memory
   Set if localStorage is unavailable (private browsing, etc).
   ============================================================ */
const FAVORITES = (function(){
  const KEY = 'promptos:favorites';
  let mem = new Set();
  let storageOk = true;

  try{
    const raw = localStorage.getItem(KEY);
    if(raw) mem = new Set(JSON.parse(raw));
  }catch(err){
    storageOk = false;
  }

  function persist(){
    if(!storageOk) return;
    try{ localStorage.setItem(KEY, JSON.stringify([...mem])); }
    catch(err){ storageOk = false; }
  }

  const listeners = new Set();
  function notify(){ listeners.forEach(fn=>fn(mem)); }

  return {
    has(id){ return mem.has(id); },
    size(){ return mem.size; },
    all(){ return [...mem]; },
    toggle(id){
      mem.has(id) ? mem.delete(id) : mem.add(id);
      persist(); notify();
      return mem.has(id);
    },
    add(id){ mem.add(id); persist(); notify(); },
    remove(id){ mem.delete(id); persist(); notify(); },
    onChange(fn){ listeners.add(fn); return ()=>listeners.delete(fn); }
  };
})();

window.FAVORITES = FAVORITES;

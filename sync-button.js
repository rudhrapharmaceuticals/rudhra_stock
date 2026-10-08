document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("syncNow");
  const msg = document.getElementById("syncResult");
  if (!btn) return;
  btn.removeAttribute("onclick");
  btn.addEventListener("click", function () {
    if (msg) msg.textContent = "Sync button clicked — starting import…";
    if (typeof window.syncVyapar !== "function") {
      if (msg) msg.textContent = "Dashboard script did not start. Refresh the page; if this remains, the import script needs repair.";
      alert("The Sync button works, but the dashboard import script did not load. This is a dashboard script error, not your Excel file.");
      return;
    }
    try {
      window.syncVyapar();
    } catch (err) {
      if (msg) msg.textContent = "Sync could not start: " + (err && err.message ? err.message : String(err));
      alert("Sync could not start: " + (err && err.message ? err.message : String(err)));
    }
  });
});

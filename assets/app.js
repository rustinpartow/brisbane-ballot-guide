"use strict";
(async function startGuide() {
  const embeddedData = JSON.parse(
    document.getElementById("guide-data").textContent,
  );
  async function load(path, json = false) {
    const response = await fetch(path);
    if (!response.ok)
      throw new Error(`Could not load ${path} (${response.status})`);
    return json ? response.json() : response.text();
  }
  const DATA = embeddedData || (await load("content/ballot.json", true));
  const research = document.getElementById("research-content");
  if (!research.innerHTML.trim())
    research.innerHTML = await load("content/research.html");
  const KEY = "brisbane-ballot-2026-v1";
  const embedded = JSON.parse(
    document.getElementById("saved-state").textContent || "{}",
  );
  let state = {};
  try {
    state = JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {}
  if (Object.keys(embedded).length) state = embedded;
  let active = "All",
    query = "",
    view = "all";
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const groups = ["All", "Local", "State & federal", "Measures", "Judicial"];
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
    document.getElementById("chosenCount").textContent = Object.values(
      state,
    ).reduce((n, s) => n + (s.selected || []).length, 0);
  }
  function rs(r) {
    return (
      state[r.id] ||
      (state[r.id] = {
        order: r.options.map((_, i) => i),
        selected: [],
        note: "",
        custom: false,
      })
    );
  }
  function link(k) {
    const s = DATA.sources[k];
    return `<a href="${esc(s[1])}" target="_blank" rel="noopener">${esc(s[0])} ↗</a>`;
  }
  function matches(r) {
    if (active === "Local" && !["Local", "Local measures"].includes(r.group))
      return false;
    if (active === "State & federal" && !["State", "Federal"].includes(r.group))
      return false;
    if (active === "Measures" && r.kind !== "measure") return false;
    if (active === "Judicial" && r.group !== "Judicial") return false;
    if (query && !JSON.stringify(r).toLowerCase().includes(query)) return false;
    if (
      view === "close" &&
      (r.kind !== "race" ||
        r.group === "Judicial" ||
        Math.max(...r.options.map((o) => o.prob || 0)) > 90)
    )
      return false;
    if (view === "chosen" && !(rs(r).selected || []).length) return false;
    return true;
  }
  function render() {
    document.getElementById("filters").innerHTML = groups
      .map(
        (g) =>
          `<button class="filter ${active === g ? "active" : ""}" data-filter="${g}" aria-pressed="${active === g}">${g}</button>`,
      )
      .join("");
    let html = "",
      last = "",
      shown = 0;
    for (const r of DATA.rows) {
      if (!matches(r)) continue;
      shown++;
      if (last !== r.group) {
        last = r.group;
        html += `<div class="section-title"><h2>${esc(last)}</h2><span>${r.group === "Judicial" ? "Each justice is a separate Yes / No vote" : "One row per contest · scroll sideways for more options"}</span></div><div class="table-head"><span>Contest & context</span><span>Options · estimated win chance in each candidate heading</span></div>`;
      }
      const s = rs(r);
      html += `<section class="contest" id="${r.id}" aria-label="${esc(r.title)}"><div class="contest-heading"><div class="eyebrow">${r.kind === "measure" ? "Ballot measure" : r.group === "Judicial" ? "Retention vote" : "Candidate election"}</div><h3>${esc(r.title)}</h3><span class="badge">${r.kind === "measure" ? esc(r.threshold) + " approval" : "Choose up to " + r.seats}</span><span class="badge ${["Very low", "Prior only", "Low"].includes(r.confidence) ? "low" : ""}">${esc(r.confidence)}${r.kind === "race" ? " evidence / confidence" : ""}</span><span class="scope">${esc(r.scope)}</span><details><summary>${r.kind === "measure" ? "Terms & tradeoffs" : "Forecast method"}</summary><p>${esc(r.method)}</p></details><div class="source-links">${r.sources.map(link).join("")}</div></div><div class="option-scroll" aria-label="Options">`;
      s.order.forEach((oi, pos) => {
        const o = r.options[oi],
          sel = s.selected.includes(oi);
        html += `<article class="option-card ${sel ? "chosen" : ""}"><div class="slot"><span>${s.custom ? "Your order" : "Option"} ${pos + 1}</span><div class="move"><button data-action="move" data-row="${r.id}" data-index="${pos}" data-step="-1" ${pos === 0 ? "disabled" : ""} aria-label="Move ${esc(o.name)} earlier">←</button><button data-action="move" data-row="${r.id}" data-index="${pos}" data-step="1" ${pos === s.order.length - 1 ? "disabled" : ""} aria-label="Move ${esc(o.name)} later">→</button></div></div><div class="candidate"><div><h4>${esc(o.name)}</h4>${o.tag ? `<span class="badge">${esc(o.tag)}</span>` : ""}</div>${o.prob !== null ? `<div class="prob">${o.prob}%<small>EST. WIN CHANCE</small></div>` : ""}</div>${o.prob !== null ? `<div class="prob-bar" aria-hidden="true"><span style="width:${o.prob}%"></span></div>` : ""}<p class="description">${esc(o.description)}</p><div class="why"><strong>${r.kind === "measure" ? "What this means" : "Why these odds"}</strong>${esc(o.why)}</div>${o.range ? `<div class="range">Sensitivity: ${o.range[0]}–${o.range[1]}% · judgment range</div>` : ""}<button class="choose" data-action="choose" data-row="${r.id}" data-option="${oi}" aria-pressed="${sel}">${sel ? "✓ Recorded as my choice" : "＋ Record my choice"}</button></article>`;
      });
      html += `</div><div class="worksheet"><label class="sr-only" for="note-${r.id}">My reasoning for ${esc(r.title)}</label><textarea id="note-${r.id}" data-note="${r.id}" placeholder="My reasoning / what I still want to check…">${esc(s.note)}</textarea></div></section>`;
    }
    document.getElementById("guide").innerHTML =
      html || '<div class="empty">No contests match. Try another filter.</div>';
    document.getElementById("count").textContent = DATA.rows.length;
    save();
  }
  function toast(msg) {
    const e = document.getElementById("toast");
    e.textContent = msg;
    e.hidden = false;
    setTimeout(() => (e.hidden = true), 3500);
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.filter) {
      active = b.dataset.filter;
      render();
      return;
    }
    if (b.dataset.action) {
      const r = DATA.rows.find((r) => r.id === b.dataset.row),
        s = rs(r);
      if (b.dataset.action === "move") {
        const i = +b.dataset.index,
          j = i + +b.dataset.step;
        if (j >= 0 && j < s.order.length) {
          [s.order[i], s.order[j]] = [s.order[j], s.order[i]];
          s.custom = true;
        }
      } else {
        const i = +b.dataset.option;
        if (s.selected.includes(i))
          s.selected = s.selected.filter((x) => x !== i);
        else if (s.selected.length < r.seats) s.selected.push(i);
        else {
          toast(
            `This contest allows up to ${r.seats} choice${r.seats > 1 ? "s" : ""}. Clear one first.`,
          );
          return;
        }
      }
      save();
      render();
    }
  });
  document.addEventListener("input", (e) => {
    if (e.target.dataset.note) {
      rs(DATA.rows.find((r) => r.id === e.target.dataset.note)).note =
        e.target.value;
      save();
    }
  });
  document.getElementById("search").addEventListener("input", (e) => {
    query = e.target.value.trim().toLowerCase();
    render();
  });
  document.getElementById("view").addEventListener("change", (e) => {
    view = e.target.value;
    render();
  });
  document.getElementById("reset").onclick = () => {
    if (confirm("Clear the choices, order and notes saved in this browser?")) {
      state = {};
      save();
      render();
    }
  };
  document.getElementById("print").onclick = () => window.print();
  document.getElementById("download").onclick = async () => {
    const button = document.getElementById("download");
    button.disabled = true;
    try {
      save();
      const css = document.querySelector('link[rel="stylesheet"]');
      const script = document.querySelector("script[src]");
      const styles = css
        ? await load(css.getAttribute("href"))
        : document.getElementById("offline-styles").textContent;
      const app = script
        ? await load(script.getAttribute("src"))
        : document.getElementById("offline-app").textContent;
      const doc = document.documentElement.cloneNode(true);
      const safeJSON = (value) =>
        JSON.stringify(value).replace(/</g, "\\u003c");
      doc.querySelector("#guide-data").textContent = safeJSON(DATA);
      doc.querySelector("#saved-state").textContent = safeJSON(state);
      const style = document.createElement("style");
      style.id = "offline-styles";
      style.textContent = styles;
      doc
        .querySelector('link[rel="stylesheet"],#offline-styles')
        .replaceWith(style);
      const runtime = document.createElement("script");
      runtime.id = "offline-app";
      runtime.textContent = app;
      doc.querySelector("script[src],#offline-app").replaceWith(runtime);
      doc.querySelector("#download").disabled = false;
      doc.querySelector("#toast").hidden = true;
      const blob = new Blob(["<!doctype html>\n" + doc.outerHTML], {
        type: "text/html;charset=utf-8",
      });
      const url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = "Brisbane_Ballot_Guide_2026.html";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast("HTML copy downloaded with your current notes and choices.");
    } catch (error) {
      console.error(error);
      toast("Download failed. Please reconnect and try again.");
    } finally {
      button.disabled = false;
    }
  };
  render();
})().catch((error) => {
  console.error(error);
  document.getElementById("guide").innerHTML =
    '<p role="alert">The guide could not load. Please reload or check your connection.</p>';
});

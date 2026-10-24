"use strict";
const DEFAULT_BANDS = {
  qa_score: { low: 80, high: 100 },
  conversion_rate: { low: 15, high: 40 },
  aht_min: { low: 0, high: 12 },
  compliance_qa: { low: 90, high: 100 }
};
function defaultBands() { return JSON.parse(JSON.stringify(DEFAULT_BANDS)); }
function parseCSV(text) {
  const rows = []; let row = [], cur = "", q = false; const s = String(text || "");
  for (let i = 0; i < s.length; i++) { const c = s[i];
    if (q) { if (c === '"') { if (s[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true; else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; } else if (c !== "\r") cur += c; }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows.filter((r) => r.some((c) => String(c).trim() !== ""));
}
function csvEscape(v) { const s = String(v == null ? "" : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : null; }
function parseRows(text) {
  const rows = parseCSV(text); if (!rows.length) return [];
  const h = rows[0].map((x) => x.trim().toLowerCase());
  const idx = (name) => h.indexOf(name);
  return rows.slice(1).map((r) => ({
    agent_ref: (r[idx("agent_ref")] || "").trim(),
    cohort: (r[idx("cohort")] || "").trim(),
    week_on_floor: num(r[idx("week_on_floor")]),
    qa_score: num(r[idx("qa_score")]),
    conversion_rate: num(r[idx("conversion_rate")]),
    aht_min: num(r[idx("aht_min")]),
    compliance_qa: num(r[idx("compliance_qa")])
  })).filter((r) => r.cohort && r.week_on_floor != null);
}
function mean(vals) { const v = vals.filter((x) => x != null); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length * 100) / 100 : null; }
function bandStatus(value, band) {
  if (value == null || !band) return "unknown";
  if (value < band.low) return "below-band";
  if (value > band.high) return "above-band";
  return "in-band";
}
function aggregate(rows, options) {
  const opts = options || {}; const minSize = opts.minCohortSize != null ? opts.minCohortSize : 5;
  const bands = opts.bands || DEFAULT_BANDS;
  const cohortAgents = {};
  for (const r of rows || []) { if (!cohortAgents[r.cohort]) cohortAgents[r.cohort] = new Set(); if (r.agent_ref) cohortAgents[r.cohort].add(r.agent_ref); }
  const suppressed = [], allowed = new Set();
  for (const cohort of Object.keys(cohortAgents).sort()) {
    const size = cohortAgents[cohort].size;
    if (size < minSize) suppressed.push({ cohort, size, note: "suppressed: cohort too small" });
    else allowed.add(cohort);
  }
  const groups = {};
  for (const r of rows || []) {
    if (!allowed.has(r.cohort)) continue;
    const key = r.cohort + "|w" + r.week_on_floor;
    if (!groups[key]) groups[key] = { cohort: r.cohort, week_on_floor: r.week_on_floor, rows: [], agents: new Set() };
    groups[key].rows.push(r); if (r.agent_ref) groups[key].agents.add(r.agent_ref);
  }
  const summary = Object.values(groups).sort((a, b) => a.cohort.localeCompare(b.cohort) || a.week_on_floor - b.week_on_floor).map((g) => {
    const item = {
      cohort: g.cohort, week_on_floor: g.week_on_floor, agents: g.agents.size, rows: g.rows.length,
      meanQa: mean(g.rows.map((r) => r.qa_score)), meanConversion: mean(g.rows.map((r) => r.conversion_rate)),
      meanAht: mean(g.rows.map((r) => r.aht_min)), meanCompliance: mean(g.rows.map((r) => r.compliance_qa))
    };
    item.flags = {
      qa_score: bandStatus(item.meanQa, bands.qa_score), conversion_rate: bandStatus(item.meanConversion, bands.conversion_rate),
      aht_min: bandStatus(item.meanAht, bands.aht_min), compliance_qa: bandStatus(item.meanCompliance, bands.compliance_qa)
    };
    item.complianceFlag = item.flags.compliance_qa === "below-band";
    return item;
  });
  return { summary, suppressed };
}
function coachingTasks(summary) {
  return (summary || []).filter((s) => s.complianceFlag).map((s) =>
    "Coaching task: Cohort " + s.cohort + " week " + s.week_on_floor + " compliance QA is " + s.meanCompliance + ", below the target band. Schedule a supportive coaching session on the compliance item, pair with a buddy for live examples, and re-check next week. This is coaching, not discipline."
  );
}
function summaryToCSV(result) {
  const summary = Array.isArray(result) ? result : result.summary;
  const head = ["cohort", "week_on_floor", "agents", "mean_qa", "mean_conversion_rate", "mean_aht_min", "mean_compliance_qa", "qa_flag", "conversion_flag", "aht_flag", "compliance_flag", "coaching_task"];
  const tasks = {}; for (const t of coachingTasks(summary)) { /* keyed loosely below */ }
  const lines = [head.join(",")];
  for (const s of summary || []) {
    const task = s.complianceFlag ? coachingTasks([s])[0] : "";
    lines.push([s.cohort, s.week_on_floor, s.agents, s.meanQa, s.meanConversion, s.meanAht, s.meanCompliance, s.flags.qa_score, s.flags.conversion_rate, s.flags.aht_min, s.flags.compliance_qa, task].map(csvEscape).join(","));
  }
  if (result && result.suppressed) for (const sup of result.suppressed) lines.push([sup.cohort, "", sup.size, sup.note, "", "", "", "", "", "", "", ""].map(csvEscape).join(","));
  return lines.join("\n") + "\n";
}
const api = { DEFAULT_BANDS, defaultBands, parseCSV, parseRows, mean, bandStatus, aggregate, coachingTasks, summaryToCSV };
if (typeof module !== "undefined" && module.exports) { module.exports = api; }
if (typeof window !== "undefined") { window.AgentRampScoreboard = api; }

"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../src/logic.js");
function csvFor(cohort, n, week, qa, conv, aht, comp) {
  const lines = ["agent_ref,cohort,week_on_floor,qa_score,conversion_rate,aht_min,compliance_qa"];
  for (let i = 1; i <= n; i++) lines.push("Agent " + String(i).padStart(3, "0") + "," + cohort + "," + week + "," + qa + "," + conv + "," + aht + "," + comp);
  return lines.join("\n");
}
test("parses rows with numeric fields", () => {
  const rows = L.parseRows(csvFor("2026-W27", 2, 1, 85, 20, 9, 95));
  assert.equal(rows.length, 2); assert.equal(rows[0].qa_score, 85); assert.equal(rows[0].cohort, "2026-W27");
});
test("aggregates by cohort and week with means", () => {
  const rows = L.parseRows(csvFor("2026-W27", 5, 2, 80, 20, 10, 96) + "\n" + csvFor("2026-W27", 0, 2, 0, 0, 0, 0).split("\n").slice(1).join("\n"));
  const out = L.aggregate(rows, { minCohortSize: 5 });
  assert.equal(out.summary.length, 1); assert.equal(out.summary[0].meanQa, 80); assert.equal(out.summary[0].agents, 5);
});
test("suppresses cohorts below minimum size with explicit note", () => {
  const rows = L.parseRows(csvFor("2026-W28", 3, 1, 90, 20, 8, 99));
  const out = L.aggregate(rows, { minCohortSize: 5 });
  assert.equal(out.summary.length, 0); assert.equal(out.suppressed.length, 1);
  assert.equal(out.suppressed[0].note, "suppressed: cohort too small");
});
test("band flags mark in-band and below-band correctly", () => {
  assert.equal(L.bandStatus(85, { low: 80, high: 100 }), "in-band");
  assert.equal(L.bandStatus(70, { low: 80, high: 100 }), "below-band");
  assert.equal(L.bandStatus(110, { low: 80, high: 100 }), "above-band");
});
test("compliance below band creates a coaching task, never discipline wording", () => {
  const rows = L.parseRows(csvFor("2026-W27", 5, 1, 85, 20, 9, 70));
  const out = L.aggregate(rows, { minCohortSize: 5 });
  assert.equal(out.summary[0].complianceFlag, true);
  const tasks = L.coachingTasks(out.summary);
  assert.equal(tasks.length, 1); assert.match(tasks[0], /Coaching task/); assert.match(tasks[0], /coaching, not discipline/);
  assert.ok(!/disciplinary|punish/i.test(tasks[0].replace("not discipline", "")));
});
test("no individual ranking or agent refs in summary or CSV output", () => {
  const rows = L.parseRows(csvFor("2026-W27", 6, 1, 88, 22, 9, 97));
  const out = L.aggregate(rows, { minCohortSize: 5 });
  assert.ok(!JSON.stringify(out.summary).includes("Agent 001"));
  const csv = L.summaryToCSV(out);
  assert.ok(!csv.includes("Agent 001")); assert.match(csv, /2026-W27/);
});
test("default minimum cohort size is 5", () => {
  const rows = L.parseRows(csvFor("2026-W29", 4, 1, 90, 20, 8, 99));
  const out = L.aggregate(rows);
  assert.equal(out.suppressed.length, 1);
});

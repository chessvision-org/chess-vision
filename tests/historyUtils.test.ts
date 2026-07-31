import assert from "node:assert/strict";
import { test } from "node:test";

import { trimToSyncBudget } from "@utils/historyUtils";

test("trimToSyncBudget returns all entries when within budget", () => {
  const entries = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const result = trimToSyncBudget(entries);
  assert.deepStrictEqual(result.kept, entries);
  assert.equal(result.dropped, 0);
});

test("trimToSyncBudget drops entries that exceed budget", () => {
  const entry = { id: 1, data: "x".repeat(400) };
  const entries = Array.from({ length: 50 }, (_, i) => ({
    ...entry,
    id: i,
  }));
  const result = trimToSyncBudget(entries);
  assert.ok(result.kept.length < 50);
  assert.ok(result.dropped > 0);
  assert.equal(result.kept.length + result.dropped, 50);
});

test("trimToSyncBudget preserves entry order", () => {
  const entry = { id: 0, data: "x".repeat(400) };
  const entries = Array.from({ length: 30 }, (_, i) => ({
    ...entry,
    id: i,
  }));
  const result = trimToSyncBudget(entries);
  for (let i = 0; i < result.kept.length; i++) {
    assert.equal(result.kept[i].id, i);
  }
});

test("trimToSyncBudget handles empty array", () => {
  assert.deepStrictEqual(trimToSyncBudget([]), { kept: [], dropped: 0 });
});

test("trimToSyncBudget drops all when single entry exceeds budget", () => {
  const huge = [{ data: "x".repeat(10000) }];
  const result = trimToSyncBudget(huge);
  assert.equal(result.kept.length, 0);
  assert.equal(result.dropped, 1);
});

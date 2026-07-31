import assert from "node:assert/strict";
import { test } from "node:test";

import { AVAILABLE_PIECE_SETS, getPieceKey, sortPieceSets } from "@utils/pieceUtils";

test("sortPieceSets returns a copy (does not mutate source)", () => {
  const original = [...AVAILABLE_PIECE_SETS];
  const sorted = sortPieceSets("popular");
  assert.notStrictEqual(sorted, AVAILABLE_PIECE_SETS);
  assert.deepStrictEqual(
    AVAILABLE_PIECE_SETS,
    original,
    "AVAILABLE_PIECE_SETS should not be mutated",
  );
  assert.equal(sorted.length, original.length);
});

test("sortPieceSets popular is stable (same input = same output)", () => {
  assert.deepStrictEqual(sortPieceSets("popular"), sortPieceSets("popular"));
});

test("sortPieceSets by name is alphabetical", () => {
  const sorted = sortPieceSets("name");
  for (let i = 1; i < sorted.length; i++) {
    assert.ok(
      sorted[i - 1].name.localeCompare(sorted[i].name) <= 0,
      `${sorted[i - 1].name} should come before ${sorted[i].name}`,
    );
  }
});

test("sortPieceSets covers all available sets", () => {
  assert.equal(sortPieceSets("popular").length, AVAILABLE_PIECE_SETS.length);
  assert.equal(sortPieceSets("name").length, AVAILABLE_PIECE_SETS.length);
});

test("getPieceKey maps white pieces to w+uppercase", () => {
  assert.equal(getPieceKey("K"), "wK");
  assert.equal(getPieceKey("Q"), "wQ");
  assert.equal(getPieceKey("R"), "wR");
  assert.equal(getPieceKey("B"), "wB");
  assert.equal(getPieceKey("N"), "wN");
  assert.equal(getPieceKey("P"), "wP");
});

test("getPieceKey maps black pieces to b+uppercase", () => {
  assert.equal(getPieceKey("k"), "bK");
  assert.equal(getPieceKey("q"), "bQ");
  assert.equal(getPieceKey("r"), "bR");
  assert.equal(getPieceKey("b"), "bB");
  assert.equal(getPieceKey("n"), "bN");
  assert.equal(getPieceKey("p"), "bP");
});

test("getPieceKey returns null for empty / falsy input", () => {
  assert.equal(getPieceKey(""), null);
  assert.equal(getPieceKey(undefined as unknown as string), null);
  assert.equal(getPieceKey(null as unknown as string), null);
});

test("getPieceKey works with all FEN piece characters", () => {
  const fenChars = "p P n N b B r R q Q k K".split(" ");
  const results = fenChars.map(getPieceKey);
  assert.deepStrictEqual(results, [
    "bP",
    "wP",
    "bN",
    "wN",
    "bB",
    "wB",
    "bR",
    "wR",
    "bQ",
    "wQ",
    "bK",
    "wK",
  ]);
});

test("getPieceKey returns w prefix only for uppercase", () => {
  for (const ch of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    const key = getPieceKey(ch);
    assert.equal(key, `w${ch}`);
  }
});

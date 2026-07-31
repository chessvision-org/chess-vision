import assert from "node:assert/strict";
import { test } from "node:test";

import {
  chessdbSearchUrl,
  lichessSearchUrl,
  pdbSearchUrl,
  PROVIDER_LABEL,
  searchPositionDatabases,
  yacpdbSearchUrl,
} from "@utils/databaseSearch";

const STANDARD_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const MINIMAL_FEN = "KQ6/8/8/8/8/8/8/8 w - - 0 1";

test("PROVIDER_LABEL maps all providers to stable labels", () => {
  assert.equal(PROVIDER_LABEL.pdb, "PDB");
  assert.equal(PROVIDER_LABEL.yacpdb, "YACPDB");
  assert.equal(PROVIDER_LABEL.lichess, "Lichess");
  assert.equal(PROVIDER_LABEL.chessdb, "ChessDB");
});

test("pdbSearchUrl encodes pieces with German piece codes", () => {
  const url = pdbSearchUrl(MINIMAL_FEN);
  const query = decodeURIComponent(url.split("?expression=")[1] ?? "");
  assert.ok(url.startsWith("https://pdb.dieschwalbe.de/search.jsp?"));
  // German codes: K=K, Q=D, R=T, B=L, N=S, P=B; KQ6 => K a8, Q b8
  assert.ok(query.includes("POSITION='wKa8 wDb8'"), query);
});

test("pdbSearchUrl maps all piece types to German codes", () => {
  const url = pdbSearchUrl("8/8/8/8/8/8/8/RBNQKBNR w - - 0 1");
  const query = decodeURIComponent(url.split("?expression=")[1] ?? "");
  assert.ok(query.includes("wTa1"));
  assert.ok(query.includes("wLb1"));
  assert.ok(query.includes("wSc1"));
  assert.ok(query.includes("wDd1"));
  assert.ok(query.includes("wKe1"));
});

test("pdbSearchUrl uses black prefix s for black pieces", () => {
  const url = pdbSearchUrl("8/8/8/8/8/8/8/kq6 w - - 0 1");
  const query = decodeURIComponent(url.split("?expression=")[1] ?? "");
  assert.ok(query.includes("sKa1 sDb1"), query);
});
function decodeYacSearchPayload(url: string): string[] {
  const b64 = url.split("/#search/")[1]?.split("/")[0];
  assert.ok(b64, "url should embed a base64 payload");
  const decoded = decodeURIComponent(escape(atob(b64.replace(/\*/g, "/"))));
  return decoded
    .split(/(?<!\\)\//)
    .map((item) => item.replace(/\\\//g, "/").replace(/\\\\/g, "\\"));
}

test("yacpdbSearchUrl encodes exactly 14 text fields + 4 checkbox fields", () => {
  // YACPDB frontend expects window.org.yacpdb.sfTextFields (14 entries)
  // followed by sfCheckBoxes (4 entries). Any other layout makes the
  // frontend fall back to a 13-field layout and map checkbox values to
  // the wrong slots.
  const parts = decodeYacSearchPayload(yacpdbSearchUrl(STANDARD_FEN));
  assert.equal(parts.length, 18, `expected 14+4 fields, got ${parts.length}`);
  assert.equal(parts[0], "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
  assert.deepEqual(parts.slice(14), ["0", "0", "0", "0"]);
});

test("yacpdbSearchUrl round-trips a minimal position", () => {
  const parts = decodeYacSearchPayload(yacpdbSearchUrl(MINIMAL_FEN));
  assert.equal(parts[0], "KQ6/8/8/8/8/8/8/8");
  assert.equal(parts.length, 18);
});

test("lichessSearchUrl joins FEN segments with underscores", () => {
  const url = lichessSearchUrl(STANDARD_FEN);
  assert.ok(url.startsWith("https://lichess.org/analysis/standard/"), url);
  assert.ok(url.endsWith("_KQkq_-_0_1"), url);
  assert.ok(url.includes("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"), url);
});

test("chessdbSearchUrl uses the full FEN as query string", () => {
  const url = chessdbSearchUrl(STANDARD_FEN);
  assert.ok(url.startsWith("https://www.chessdb.cn/queryc_en/?"), url);
  assert.ok(url.endsWith(STANDARD_FEN.replace(/ /g, "_")), url);
});

test("searchPositionDatabases returns notFound URLs for invalid FEN", async () => {
  const res = await searchPositionDatabases("not a fen");
  assert.equal(res.lichess.found, false);
  assert.equal(res.chessdb.found, false);
  assert.equal(res.pdb.found, false);
  assert.equal(res.yacpdb.found, false);
  assert.ok(res.lichess.url.startsWith("https://lichess.org"));
  assert.ok(res.chessdb.url.startsWith("https://www.chessdb.cn"));
  assert.ok(res.pdb.url.startsWith("https://pdb.dieschwalbe.de"));
  assert.ok(res.yacpdb.url.startsWith("https://www.yacpdb.org"));
});

test("searchPositionDatabases throws AbortError when signal is aborted", async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    searchPositionDatabases(STANDARD_FEN, controller.signal),
    (err: unknown) => err instanceof DOMException && err.name === "AbortError",
  );
});

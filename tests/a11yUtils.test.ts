import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  CVD_MATRICES,
  isColorVisionPreference,
  isContrastPreference,
  isReducedMotionPreference,
  resolveReducedMotion
} from '@utils/a11yUtils';

test('isColorVisionPreference accepts all valid values', () => {
  assert.equal(isColorVisionPreference('none'), true);
  assert.equal(isColorVisionPreference('deuteranopia'), true);
  assert.equal(isColorVisionPreference('protanopia'), true);
  assert.equal(isColorVisionPreference('tritanopia'), true);
});

test('isColorVisionPreference rejects invalid values', () => {
  assert.equal(isColorVisionPreference('unknown'), false);
  assert.equal(isColorVisionPreference(''), false);
  assert.equal(isColorVisionPreference(null), false);
  assert.equal(isColorVisionPreference(undefined), false);
  assert.equal(isColorVisionPreference({}), false);
  assert.equal(isColorVisionPreference(42), false);
  assert.equal(isColorVisionPreference(true), false);
  assert.equal(isColorVisionPreference('Deuteranopia'), false);
});

test('isContrastPreference accepts valid values', () => {
  assert.equal(isContrastPreference('normal'), true);
  assert.equal(isContrastPreference('high'), true);
});

test('isContrastPreference rejects invalid values', () => {
  assert.equal(isContrastPreference('unknown'), false);
  assert.equal(isContrastPreference(''), false);
  assert.equal(isContrastPreference(null), false);
  assert.equal(isContrastPreference('HIGH'), false);
});

test('isReducedMotionPreference accepts valid values', () => {
  assert.equal(isReducedMotionPreference('system'), true);
  assert.equal(isReducedMotionPreference('reduce'), true);
  assert.equal(isReducedMotionPreference('full'), true);
});

test('isReducedMotionPreference rejects invalid values', () => {
  assert.equal(isReducedMotionPreference('unknown'), false);
  assert.equal(isReducedMotionPreference(''), false);
  assert.equal(isReducedMotionPreference(null), false);
  assert.equal(isReducedMotionPreference('Reduce'), false);
});

test('CVD_MATRICES are non-empty strings for all types', () => {
  assert.ok(CVD_MATRICES.deuteranopia.length > 0);
  assert.ok(CVD_MATRICES.protanopia.length > 0);
  assert.ok(CVD_MATRICES.tritanopia.length > 0);
  assert.ok(CVD_MATRICES.deuteranopia !== CVD_MATRICES.protanopia);
  assert.ok(CVD_MATRICES.protanopia !== CVD_MATRICES.tritanopia);
});

test('CVD_MATRICES have 17 space-separated values each (4×5 rows with implicit offset zeros)', () => {
  for (const type of ['deuteranopia', 'protanopia', 'tritanopia'] as const) {
    const values = CVD_MATRICES[type].split(/\s+/).filter(Boolean);
    assert.equal(values.length, 17, `${type} matrix should have 17 values`);
  }
});

test('resolveReducedMotion reduce returns true', () => {
  assert.equal(resolveReducedMotion('reduce'), true);
});

test('resolveReducedMotion full returns false', () => {
  assert.equal(resolveReducedMotion('full'), false);
});

test('resolveReducedMotion system falls back to false in Node', () => {
  assert.equal(resolveReducedMotion('system'), false);
});

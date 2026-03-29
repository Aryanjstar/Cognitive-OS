/**
 * End-to-end tests for the GitHub Activity Tracker
 *
 * Tests cover:
 * 1. Developer category classification
 * 2. Period metrics computation (edge cases)
 * 3. Time savings calculation
 * 4. Email generation
 * 5. Empty/null data handling
 * 6. Boundary conditions
 */

import {
  computeContextSwitchCost,
  computeBurnoutRisk,
  computeProductivityGain,
  computeCognitiveLoadIndex,
  detectAnomaly,
  computeHistoricalBlend,
} from "@/lib/research-metrics";

// ─── Test Helpers ────────────────────────────────────────────

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`  ✓ ${message}`);
}

function assertApprox(actual: number, expected: number, tolerance: number, message: string) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`FAIL: ${message} — expected ~${expected}, got ${actual}`);
  }
  console.log(`  ✓ ${message} (${actual} ≈ ${expected})`);
}

// ─── Test Suite ──────────────────────────────────────────────

export async function runAllTests() {
  let passed = 0;
  let failed = 0;

  const tests = [
    testCognitiveLoadIndex,
    testCognitiveLoadBoundaries,
    testAnomalyDetection,
    testAnomalyEdgeCases,
    testHistoricalBlend,
    testHistoricalBlendEdgeCases,
    testContextSwitchCost,
    testContextSwitchEdgeCases,
    testBurnoutRisk,
    testBurnoutRiskBoundaries,
    testProductivityGain,
    testProductivityGainEdgeCases,
    testZeroActivityHandling,
    testExtremeValues,
  ];

  for (const test of tests) {
    try {
      console.log(`\n▶ ${test.name}`);
      await test();
      passed++;
    } catch (err) {
      console.error(`  ✗ ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }
  }

  console.log(`\n${"─".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed, ${tests.length} total`);
  return { passed, failed, total: tests.length };
}

// ─── Individual Tests ────────────────────────────────────────

function testCognitiveLoadIndex() {
  const score = computeCognitiveLoadIndex({
    taskLoad: 40, switchPenalty: 30, reviewLoad: 20,
    urgencyStress: 25, fatigueIndex: 15, staleness: 10,
  });
  assert(score >= 0 && score <= 100, "CLI should be in [0, 100]");
  assertApprox(score, 25.5, 1, "CLI for moderate workload");

  const zero = computeCognitiveLoadIndex({
    taskLoad: 0, switchPenalty: 0, reviewLoad: 0,
    urgencyStress: 0, fatigueIndex: 0, staleness: 0,
  });
  assert(zero === 0, "CLI should be 0 for zero input");

  const max = computeCognitiveLoadIndex({
    taskLoad: 100, switchPenalty: 100, reviewLoad: 100,
    urgencyStress: 100, fatigueIndex: 100, staleness: 100,
  });
  assert(max === 100, "CLI should be 100 for max input");
}

function testCognitiveLoadBoundaries() {
  const negative = computeCognitiveLoadIndex({
    taskLoad: -10, switchPenalty: -5, reviewLoad: -3,
    urgencyStress: -2, fatigueIndex: -1, staleness: -1,
  });
  assert(negative === 0, "CLI should clamp negative inputs to 0");

  const huge = computeCognitiveLoadIndex({
    taskLoad: 500, switchPenalty: 500, reviewLoad: 500,
    urgencyStress: 500, fatigueIndex: 500, staleness: 500,
  });
  assert(huge === 100, "CLI should clamp to 100 for huge inputs");
}

function testAnomalyDetection() {
  const normal = detectAnomaly(50, [45, 48, 52, 47, 50, 49, 51]);
  assert(!normal.isAnomaly, "Normal score should not be anomaly");
  assert(normal.severity === "none", "Normal severity should be 'none'");

  const spike = detectAnomaly(95, [45, 48, 52, 47, 50, 49, 51]);
  assert(spike.isAnomaly, "Spike should be detected as anomaly");
  assert(spike.severity === "severe", "Large spike should be severe");
  assert(spike.zScore > 2.5, "Z-score should be > 2.5 for severe");
}

function testAnomalyEdgeCases() {
  const tooFew = detectAnomaly(90, [50, 55]);
  assert(!tooFew.isAnomaly, "Should not detect anomaly with < 5 data points");
  assert(tooFew.zScore === 0, "Z-score should be 0 with insufficient data");

  const identical = detectAnomaly(50, [50, 50, 50, 50, 50]);
  assert(!identical.isAnomaly, "Identical scores should not be anomaly");

  const empty = detectAnomaly(50, []);
  assert(!empty.isAnomaly, "Empty array should not be anomaly");
}

function testHistoricalBlend() {
  const now = new Date();
  const history = Array.from({ length: 10 }, (_, i) => ({
    score: 50 + i,
    timestamp: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
  }));

  const blended = computeHistoricalBlend(70, history);
  assert(blended > 50 && blended < 70, "Blended score should be between historical avg and current");
  assert(blended > 60, "Current score (70) should dominate (0.7 weight)");
}

function testHistoricalBlendEdgeCases() {
  const noHistory = computeHistoricalBlend(75, []);
  assert(noHistory === 75, "No history should return current score");

  const tooFew = computeHistoricalBlend(75, [
    { score: 50, timestamp: new Date() },
    { score: 55, timestamp: new Date() },
  ]);
  assert(tooFew === 75, "< 5 history items should return current score");
}

function testContextSwitchCost() {
  const cost = computeContextSwitchCost(5, 5);
  assert(cost.costMinutesPerSwitch === 18, "5 switches with complexity 5 = 18 min/switch");
  assert(cost.lostHoursPerMonth > 0, "Should have positive lost hours");
  assert(cost.monetaryCostPerMonth > 0, "Should have positive monetary cost");

  const zeroCost = computeContextSwitchCost(0, 0);
  assert(zeroCost.lostHoursPerMonth === 0, "Zero switches = zero lost hours");
}

function testContextSwitchEdgeCases() {
  const highSwitches = computeContextSwitchCost(20, 8);
  assert(highSwitches.lostHoursPerMonth > 100, "20 switches/day should lose > 100h/month");

  const defaultComplexity = computeContextSwitchCost(3);
  assert(defaultComplexity.costMinutesPerSwitch === 18, "Default complexity should be 5 → 18 min");
}

function testBurnoutRisk() {
  const low = computeBurnoutRisk(20, 2, 0.8);
  assert(low < 0.3, "Low load + low switches + high focus = low burnout risk");

  const high = computeBurnoutRisk(85, 8, 0.2);
  assert(high > 0.6, "High load + high switches + low focus = high burnout risk");

  const zero = computeBurnoutRisk(0, 0, 1);
  assert(zero === 0, "Zero load + zero switches + full focus = zero risk");
}

function testBurnoutRiskBoundaries() {
  const maxRisk = computeBurnoutRisk(100, 10, 0);
  assert(maxRisk <= 1, "Burnout risk should not exceed 1");
  assert(maxRisk >= 0.9, "Max inputs should produce near-max risk");

  const negativeInputs = computeBurnoutRisk(-10, -5, 1.5);
  assert(negativeInputs >= 0, "Negative inputs should be clamped to 0");
}

function testProductivityGain() {
  const gain = computeProductivityGain(8, 5, 240, 300);
  assert(gain.timeSavedHoursPerMonth > 0, "Should save time with reduced switches");
  assert(gain.productivityGainPercent > 0, "Should have positive productivity gain");
  assert(gain.monetarySavingsPerMonth > 0, "Should have positive monetary savings");
}

function testProductivityGainEdgeCases() {
  const noImprovement = computeProductivityGain(5, 5, 240, 240);
  assert(noImprovement.timeSavedHoursPerMonth === 0, "No improvement = no savings");
  assert(noImprovement.productivityGainPercent === 0, "No improvement = 0% gain");

  const zeroBaseline = computeProductivityGain(0, 0, 0, 0);
  assert(zeroBaseline.timeSavedHoursPerMonth === 0, "Zero baseline = zero savings");
}

function testZeroActivityHandling() {
  const zeroCLI = computeCognitiveLoadIndex({
    taskLoad: 0, switchPenalty: 0, reviewLoad: 0,
    urgencyStress: 0, fatigueIndex: 0, staleness: 0,
  });
  assert(zeroCLI === 0, "Zero activity = zero CLI");

  const zeroAnomaly = detectAnomaly(0, [0, 0, 0, 0, 0]);
  assert(!zeroAnomaly.isAnomaly, "All zeros should not be anomaly");
}

function testExtremeValues() {
  const extremeCLI = computeCognitiveLoadIndex({
    taskLoad: 999999, switchPenalty: 999999, reviewLoad: 999999,
    urgencyStress: 999999, fatigueIndex: 999999, staleness: 999999,
  });
  assert(extremeCLI === 100, "Extreme values should cap at 100");

  const extremeGain = computeProductivityGain(100, 0, 60, 480);
  assert(extremeGain.timeSavedHoursPerMonth > 0, "Extreme improvement should produce savings");
  assert(isFinite(extremeGain.monetarySavingsPerMonth), "Monetary savings should be finite");
}

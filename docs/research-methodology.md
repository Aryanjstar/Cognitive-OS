# Cognitive OS — Research Methodology & Mathematical Framework

> Complete documentation of all metrics, formulas, and their components used in the Cognitive OS system. Intended as a companion document for the research paper submission to international conferences (ICSE, CHI, FSE, ASE, ESEM, IEEE Software, ACM TOSEM, MSR).

---

## Table of Contents

1. [Formula 1: Cognitive Load Index (CLI)](#1-cognitive-load-index-cli)
2. [Formula 2: Adaptive Weight Learning](#2-adaptive-weight-learning)
3. [Formula 3: Historical Blending with Exponential Decay](#3-historical-blending-with-exponential-decay)
4. [Formula 4: Anomaly Detection via Z-Score](#4-anomaly-detection-via-z-score)
5. [Formula 5: Context Switch Cost Model](#5-context-switch-cost-model)
6. [Formula 6: Burnout Risk Prediction](#6-burnout-risk-prediction)
7. [Formula 7: Productivity Gain Measurement](#7-productivity-gain-measurement)
8. [Constants & Parameters](#constants--parameters)
9. [References](#references)

---

## 1. Cognitive Load Index (CLI)

### Formula

```
CLI(t) = α · TaskLoad + β · SwitchPenalty + γ · ReviewLoad + δ · UrgencyStress + ε · FatigueIndex + ζ · Staleness
```

### What It Measures

The CLI is the **primary composite metric** that quantifies a developer's real-time mental workload on a scale of **0 to 100**. It fuses six distinct cognitive load factors into a single actionable score. A score of 0 means the developer is in a completely relaxed state; 100 means they are at maximum cognitive capacity.

### Levels

| Range | Level | Meaning |
|-------|-------|---------|
| 0–30 | **Flow** | Developer is in a productive, low-stress state. Ideal for deep work. |
| 30–60 | **Moderate** | Normal working load. Some context switching or review burden present. |
| 60–100 | **Overloaded** | High cognitive strain. Risk of errors, burnout, and reduced output. |

### Symbol-by-Symbol Breakdown

| Symbol | Name | Type | Description |
|--------|------|------|-------------|
| `CLI(t)` | Cognitive Load Index at time t | Output (0–100) | The final composite score at a given point in time `t`. |
| `t` | Time | Variable | The current timestamp when the score is computed. |
| `α` (alpha) | TaskLoad weight | Constant = **0.25** | How much raw task volume contributes to the total score. This is the largest weight because task volume is the strongest predictor of cognitive load. |
| `β` (beta) | SwitchPenalty weight | Constant = **0.20** | How much context switching contributes. Each switch between tasks costs refocus time (see Formula 5). |
| `γ` (gamma) | ReviewLoad weight | Constant = **0.15** | How much code review burden contributes. Reviewing others' code requires holding multiple mental models simultaneously. |
| `δ` (delta) | UrgencyStress weight | Constant = **0.15** | How much urgency from deadlines, critical bugs, and high-priority issues contributes. |
| `ε` (epsilon) | FatigueIndex weight | Constant = **0.15** | How much accumulated fatigue (long hours, consecutive active days) contributes. |
| `ζ` (zeta) | Staleness weight | Constant = **0.10** | How much task staleness (old, unresolved issues) contributes. Lowest weight because it's a background stressor. |
| `TaskLoad` | Task volume factor | Input (0–100) | Computed from: number of open issues, open PRs, daily commit rate, and task complexity scores. Higher values mean more work items demanding attention. |
| `SwitchPenalty` | Context switch factor | Input (0–100) | Computed from: number of repositories contributed to, frequency of task-type changes (coding → review → meeting), and PR review interleaving. |
| `ReviewLoad` | Code review factor | Input (0–100) | Computed from: number of PRs awaiting review, review comment count, and complexity of PRs under review. |
| `UrgencyStress` | Urgency factor | Input (0–100) | Computed from: count of high-priority issues, issues with "critical" labels, and approaching deadlines. |
| `FatigueIndex` | Fatigue factor | Input (0–100) | Computed from: ratio of active days to total days (>85% triggers fatigue), consecutive working hours, and weekend work patterns. |
| `Staleness` | Task staleness factor | Input (0–100) | Computed from: age of open issues, time since last activity on assigned tasks, and longest streak of inactivity on any task. |

### Theoretical Basis

Adapted from **Sweller's Cognitive Load Theory** (1988), which distinguishes intrinsic, extraneous, and germane cognitive load, and the **NASA Task Load Index (NASA-TLX)** by Hart & Staveland (1988), which uses weighted multi-dimensional assessment of workload.

---

## 2. Adaptive Weight Learning

### Formula

```
w_adaptive(k) = w_base(k) × (1 + 0.25 × I(k = dominant_factor))
```

Where:
```
dominant_factor = argmax_k { avg(breakdown_k | level = "overloaded") }
```

### What It Measures

This formula **personalizes** the CLI weights for each individual developer. Instead of using the same fixed weights for everyone, it identifies which cognitive load factor most frequently causes overload for a specific developer and boosts that factor's weight by 25%.

### Symbol-by-Symbol Breakdown

| Symbol | Name | Type | Description |
|--------|------|------|-------------|
| `w_adaptive(k)` | Adapted weight for factor k | Output | The personalized weight for cognitive load factor `k` after adaptation. |
| `w_base(k)` | Base weight for factor k | Input | The default weight (α, β, γ, δ, ε, or ζ from Formula 1). |
| `k` | Factor index | Variable | One of the six factors: TaskLoad, SwitchPenalty, ReviewLoad, UrgencyStress, FatigueIndex, Staleness. |
| `I(condition)` | Indicator function | Function | Returns **1** if the condition is true, **0** otherwise. This is a standard mathematical notation for conditional selection. |
| `dominant_factor` | Most problematic factor | Computed | The factor `k` that has the highest average value when the developer is in an "overloaded" state (CLI > 60). |
| `argmax_k` | Argument of the maximum | Operator | Returns the value of `k` that maximizes the expression. In plain English: "which factor is highest on average during overload?" |
| `avg(...)` | Average | Function | Arithmetic mean of the breakdown values for factor `k` across all snapshots where the developer was overloaded. |
| `breakdown_k` | Factor k's raw value | Input | The raw score (0–100) for factor `k` from a cognitive snapshot. |
| `level = "overloaded"` | Filter condition | Condition | Only considers snapshots where CLI > 60 (overloaded state). |
| `0.25` | Boost factor | Constant | The dominant factor's weight is increased by 25%. This value was chosen to be significant enough to affect scoring but not so large as to dominate all other factors. |
| `1` | Base multiplier | Constant | Ensures non-dominant factors retain their original weight (1 × w_base = w_base). |

### Example

If a developer's overloaded snapshots show that `SwitchPenalty` is consistently the highest factor:
- `w_adaptive(SwitchPenalty) = 0.20 × (1 + 0.25 × 1) = 0.20 × 1.25 = 0.25`
- All other weights remain unchanged.

### Theoretical Basis

**Novel contribution** — personalized cognitive load modeling. No prior work applies adaptive weight learning to developer cognitive load metrics.

---

## 3. Historical Blending with Exponential Decay

### Formula

```
CLI_blended(t) = 0.7 × CLI_raw(t) + 0.3 × CLI_historical(t)
```

Where:
```
CLI_historical(t) = Σᵢ(CLI(tᵢ) × 0.5^((t - tᵢ) / T_half)) / Σᵢ(0.5^((t - tᵢ) / T_half))
```

### What It Measures

This formula **smooths out noise** in the cognitive load score by blending the current raw score with a weighted historical average. Recent history matters more than old history (exponential decay). This prevents a single unusual moment from drastically changing the score.

### Symbol-by-Symbol Breakdown

| Symbol | Name | Type | Description |
|--------|------|------|-------------|
| `CLI_blended(t)` | Blended score at time t | Output (0–100) | The final smoothed cognitive load score that the user sees. |
| `CLI_raw(t)` | Raw score at time t | Input (0–100) | The unsmoothed score computed directly from Formula 1 at the current moment. |
| `CLI_historical(t)` | Historical average at time t | Computed | The exponentially-weighted average of all past scores, where recent scores count more. |
| `0.7` | Current weight | Constant | 70% of the blended score comes from the current raw score. This ensures the score is responsive to real-time changes. |
| `0.3` | Historical weight | Constant | 30% comes from historical context. This provides stability and reduces noise. |
| `Σᵢ` | Summation over i | Operator | Sum across all historical snapshots indexed by `i`. |
| `CLI(tᵢ)` | Historical score at time tᵢ | Input | A past cognitive load score recorded at timestamp `tᵢ`. |
| `tᵢ` | Historical timestamp | Variable | The time when the i-th historical snapshot was recorded. |
| `t - tᵢ` | Age of snapshot | Computed | How long ago (in milliseconds) the historical snapshot was taken. |
| `T_half` | Half-life | Constant = **3 days** (259,200,000 ms) | The time it takes for a historical score's influence to decay to 50%. After 3 days, a score has half the weight it had when recorded. After 6 days, it has 25% weight. |
| `0.5^(...)` | Exponential decay function | Function | The weight assigned to each historical score. Produces values between 0 and 1, decreasing as the snapshot ages. |

### Why 3-Day Half-Life?

Developer work patterns typically operate on weekly cycles. A 3-day half-life means:
- Yesterday's data has ~79% weight
- 3 days ago has 50% weight
- 1 week ago has ~20% weight
- 2 weeks ago has ~4% weight

This captures the relevant recent pattern without being dominated by stale data.

### Theoretical Basis

**Exponential smoothing** (Brown, 1956) applied to cognitive load time series. Widely used in signal processing and financial time series analysis.

---

## 4. Anomaly Detection via Z-Score

### Formula

```
z = (CLI(t) - μ_recent) / σ_recent
```

### What It Measures

This formula detects **sudden spikes** in cognitive load by comparing the current score to the developer's recent baseline. If the current score is statistically unusual (far from the recent average), it triggers an anomaly alert.

### Severity Thresholds

| Z-Score | Severity | Meaning |
|---------|----------|---------|
| z ≤ 1.2 | **None** | Normal variation. No alert. |
| 1.2 < z ≤ 1.8 | **Mild** | Slightly elevated. Worth monitoring. |
| 1.8 < z ≤ 2.5 | **Moderate** | Significantly elevated. Consider intervention. |
| z > 2.5 | **Severe** | Extreme spike. Immediate action recommended (break, task deferral). |

### Symbol-by-Symbol Breakdown

| Symbol | Name | Type | Description |
|--------|------|------|-------------|
| `z` | Z-score | Output | The number of standard deviations the current score is above the recent mean. A z-score of 2.0 means the current score is 2 standard deviations above average. |
| `CLI(t)` | Current score | Input (0–100) | The cognitive load score at the current moment. |
| `μ_recent` | Recent mean | Computed | The arithmetic mean (average) of the most recent cognitive load scores. Computed from the last 10–20 snapshots. |
| `σ_recent` | Recent standard deviation | Computed | The standard deviation of recent scores. Measures how much the scores typically vary. A small σ means scores are stable; a large σ means they fluctuate a lot. |

### Why These Thresholds?

- **1.2**: In a normal distribution, ~11.5% of values exceed this. It catches the top ~12% of unusual readings.
- **1.8**: ~3.6% of values exceed this. Catches genuinely unusual spikes.
- **2.5**: ~0.6% of values exceed this. Only the most extreme spikes trigger severe alerts.

### Theoretical Basis

Adapted from **Shewhart control charts** (statistical process control) for cognitive load monitoring. Z-scores are a standard statistical measure used in quality control, medical diagnostics, and anomaly detection systems.

---

## 5. Context Switch Cost Model

### Formula

```
LostFocusHours = (Interruptions_per_day × 23.25 / 60) × Workdays
```

With per-switch cost:
```
CostPerSwitch = BaseCost + TaskComplexity × 2
```

### What It Measures

This formula quantifies the **hidden productivity cost** of context switching. Every time a developer switches from one task to another, they lose refocus time. This formula calculates how many hours per month are lost to this effect.

### Symbol-by-Symbol Breakdown

| Symbol | Name | Type | Description |
|--------|------|------|-------------|
| `LostFocusHours` | Total lost hours per month | Output (hours) | The total number of productive hours lost to context switching in a month. |
| `Interruptions_per_day` | Daily context switches | Input | The average number of times per day the developer switches between different tasks or task types (e.g., coding → review → meeting → coding). |
| `23.25` | Refocus time per switch | Constant (minutes) | The empirically measured average time it takes to fully refocus after an interruption. From Mark, Gudith & Klocke (2008). |
| `60` | Minutes-to-hours conversion | Constant | Converts minutes to hours. |
| `Workdays` | Working days per month | Constant = **22** | Standard number of working days in a month (excludes weekends). |
| `BaseCost` | Minimum switch cost | Constant = **8 minutes** | The minimum time lost even for a trivial context switch (e.g., checking Slack then returning to code). |
| `TaskComplexity` | Complexity of current task | Input (1–10) | How complex the task being interrupted is. More complex tasks require more time to rebuild mental context. |
| `2` | Complexity multiplier | Constant | Each unit of complexity adds 2 minutes to the switch cost. A complexity-5 task costs 8 + 5×2 = 18 minutes per switch. |

### Monetary Cost

```
MonthlyCost = LostFocusHours × $101/hour
```

The $101/hour figure represents the fully-loaded cost of a software developer (base salary + ~40% overhead for benefits, equipment, office space).

### Theoretical Basis

**Mark, Gudith & Klocke (2008)** — "The Cost of Interrupted Work: More Speed and Stress" published at CHI 2008. Their study found that it takes an average of 23 minutes and 15 seconds to return to the original task after an interruption.

---

## 6. Burnout Risk Prediction

### Formula

```
BurnoutRisk = 0.4 × norm(avgLoad_7d) + 0.3 × norm(switchTrend) + 0.3 × (1 - focusRatio)
```

### What It Measures

This formula predicts the **probability of developer burnout** on a scale of 0 to 1 (0% to 100%). It combines three factors that research has shown are the strongest predictors of burnout in knowledge workers.

### Symbol-by-Symbol Breakdown

| Symbol | Name | Type | Description |
|--------|------|------|-------------|
| `BurnoutRisk` | Burnout probability | Output (0–1) | The predicted burnout risk. 0 = no risk, 1 = maximum risk. Values above 0.6 are considered high risk. |
| `0.4` | Load weight | Constant | 40% of burnout risk comes from sustained high cognitive load. This is the largest factor because chronic overload is the strongest burnout predictor. |
| `0.3` | Switch trend weight | Constant | 30% comes from increasing context switch frequency. A rising trend in switches indicates growing fragmentation of attention. |
| `0.3` | Focus deficit weight | Constant | 30% comes from insufficient focus time. Developers who can't achieve deep work are at higher burnout risk. |
| `norm(x)` | Normalization function | Function | Scales the input to the range [0, 1]. For `avgLoad_7d`: divides by 100. For `switchTrend`: divides by 10 and clamps. |
| `avgLoad_7d` | 7-day average cognitive load | Input (0–100) | The mean CLI score over the past 7 days. Captures sustained (not momentary) cognitive strain. |
| `switchTrend` | Context switch trend | Input | The rate of change in daily context switches. Positive values mean switches are increasing (worsening). Measured as the slope of switches over the past 7 days. |
| `focusRatio` | Focus time ratio | Input (0–1) | The proportion of working time spent in focused, uninterrupted work. Computed as: `totalFocusMinutes / (8 hours × 60 minutes)`. A ratio of 0.5 means half the day was focused work. |
| `1 - focusRatio` | Focus deficit | Computed | The proportion of time NOT spent in focus. Higher deficit = higher burnout risk. |

### Risk Levels

| Risk Score | Level | Recommended Action |
|------------|-------|--------------------|
| 0.0–0.3 | **Low** | No intervention needed. |
| 0.3–0.6 | **Moderate** | Monitor closely. Suggest periodic breaks. |
| 0.6–0.8 | **High** | Active intervention: reduce task load, defer non-critical work. |
| 0.8–1.0 | **Critical** | Immediate action: mandatory break, workload redistribution. |

### Theoretical Basis

Adapted from the **Maslach Burnout Inventory — General Survey (MBI-GS)** dimensions: emotional exhaustion (mapped to cognitive load), depersonalization (mapped to context switch fragmentation), and reduced personal accomplishment (mapped to focus deficit).

---

## 7. Productivity Gain Measurement

### Formula

```
ΔProductivity = (DPS_with - DPS_baseline) / DPS_baseline × 100%
```

With time savings:
```
TimeSaved = InterruptionsAvoided × avgRefocusTime
FocusGain = (ImprovedFocusMinutes - BaselineFocusMinutes) × 0.5
TotalSavedPerDay = TimeSaved + FocusGain
```

### What It Measures

This formula quantifies the **concrete productivity improvement** a developer gains from using Cognitive OS. It measures both time saved from fewer interruptions and additional productive output from better focus.

### Symbol-by-Symbol Breakdown

| Symbol | Name | Type | Description |
|--------|------|------|-------------|
| `ΔProductivity` | Productivity gain percentage | Output (%) | The percentage improvement in productive output. A value of 30% means the developer produces 30% more effective work per day. |
| `DPS_with` | Developer Productivity Score with system | Computed | Productive hours per day when using Cognitive OS (interrupt guarding + focus protection active). |
| `DPS_baseline` | Developer Productivity Score baseline | Computed | Productive hours per day without Cognitive OS (normal working conditions). |
| `InterruptionsAvoided` | Switches prevented per day | Computed | `BaselineSwitches - ReducedSwitches`. The number of context switches prevented by the Interrupt Guard agent. |
| `avgRefocusTime` | Average refocus time | Constant = **23.25 minutes** | Time saved per avoided interruption (same as Formula 5). |
| `BaselineSwitchesPerDay` | Normal daily switches | Input | How many times the developer switches tasks per day without intervention. |
| `ReducedSwitchesPerDay` | Switches with system | Computed | `BaselineSwitches × 0.65` — Cognitive OS reduces switches by **35%** through the Interrupt Guard agent. |
| `BaselineFocusMinutes` | Normal daily focus time | Input (minutes) | Minutes of focused, uninterrupted work per day without intervention. |
| `ImprovedFocusMinutes` | Focus time with system | Computed | `BaselineFocusMinutes × 1.20` — Cognitive OS improves focus time by **20%** through the Focus Agent. |
| `0.5` | Focus efficiency factor | Constant | Additional focus minutes are weighted at 50% because not all additional focus time translates directly to output (diminishing returns). |
| `0.35` (35%) | Switch reduction rate | Constant | The projected reduction in context switches from Cognitive OS's Interrupt Guard. Based on the agent's ability to defer non-critical interruptions during flow states. |
| `0.20` (20%) | Focus improvement rate | Constant | The projected improvement in focus time from Cognitive OS's Focus Agent. Based on the agent's ability to detect and extend deep work sessions. |

### Monetary Savings

```
MonthlySavings = TimeSavedHoursPerMonth × $101/hour
```

### Theoretical Basis

ROI framework adapted from **DORA (DevOps Research and Assessment)** and the **SPACE framework** for developer productivity measurement (Forsgren et al., 2021).

---

## Constants & Parameters

| Constant | Value | Source | Used In |
|----------|-------|--------|---------|
| Refocus time per switch | 23.25 minutes | Mark et al. (2008) | Formulas 5, 7 |
| Hourly developer cost | $101/hour | Industry average (salary + 40% overhead) | Formulas 5, 7 |
| Working days per month | 22 | Standard | Formulas 5, 6, 7 |
| Working hours per day | 8 | Standard | Formula 6 |
| Historical half-life | 3 days | Calibrated | Formula 3 |
| Anomaly threshold (mild) | z > 1.2 | Statistical convention | Formula 4 |
| Anomaly threshold (moderate) | z > 1.8 | Statistical convention | Formula 4 |
| Anomaly threshold (severe) | z > 2.5 | Statistical convention | Formula 4 |
| Switch reduction rate | 35% | Projected from Interrupt Guard | Formula 7 |
| Focus improvement rate | 20% | Projected from Focus Agent | Formula 7 |
| Adaptive boost factor | 25% | Calibrated | Formula 2 |
| CLI blending ratio | 70/30 (current/historical) | Calibrated | Formula 3 |
| Burnout weights | 0.4 / 0.3 / 0.3 | Adapted from MBI-GS | Formula 6 |

---

## References

1. Sweller, J. (1988). "Cognitive Load During Problem Solving: Effects on Learning." *Cognitive Science*, 12(2), 257-285.
2. Hart, S.G. & Staveland, L.E. (1988). "Development of NASA-TLX (Task Load Index): Results of Empirical and Theoretical Research." *Advances in Psychology*, 52, 139-183.
3. Mark, G., Gudith, D. & Klocke, U. (2008). "The Cost of Interrupted Work: More Speed and Stress." *Proceedings of CHI 2008*, ACM.
4. Forsgren, N., Storey, M.-A., Maddila, C., Zimmermann, T., Houck, B. & Butler, J. (2021). "The SPACE of Developer Productivity." *ACM Queue*, 19(1).
5. Noda, A., Storey, M.-A., Forsgren, N. & Greiler, M. (2023). "DevEx: What Actually Drives Productivity." *ACM Queue*.
6. Campbell, G.A. (2018). "Cognitive Complexity: An Overview and Evaluation." *Proceedings of TechDebt '18*, ACM.
7. Maslach, C., Jackson, S.E. & Leiter, M.P. (1996). *Maslach Burnout Inventory Manual*. 3rd edition.
8. Leroy, S. (2009). "Why Is It So Hard to Do My Work? The Challenge of Attention Residue When Switching Between Work Tasks." *Organizational Behavior and Human Decision Processes*, 109(2).
9. Forsgren, N., Humble, J. & Kim, G. (2018). *Accelerate: The Science of Lean Software and DevOps*. IT Revolution Press.
10. McCabe, T.J. (1976). "A Complexity Measure." *IEEE Transactions on Software Engineering*, SE-2(4).
11. Brown, R.G. (1956). *Exponential Smoothing for Predicting Demand*. Arthur D. Little Inc.

---

*This document is part of the Cognitive OS research paper companion. For the live implementation, see `/src/lib/research-metrics.ts` and `/src/lib/cognitive-engine.ts`.*

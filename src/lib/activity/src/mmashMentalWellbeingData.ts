import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { CsvRow, mean, std, min, max, sum, readCsvRows, normalizeHeader, parseNumber } from "./csvUtils";

export interface DailyWearableFeatureRow {
  participantId: string;
  targetScore: number;
  features: number[];
  featureMap: Record<string, number>;
  targetComponents: {
    averagePanasPositive: number | null;
    averagePanasNegative: number | null;
    stai1: number | null;
    dailyStress: number | null;
  };
}

export const FEATURE_NAMES = [
  "observedHours",
  "totalSteps",
  "meanStepsPerSecond",
  "activeSecondsFraction",
  "standingFraction",
  "sittingFraction",
  "lyingFraction",
  "offFraction",
  "meanHr",
  "stdHr",
  "minHr",
  "maxHr",
  "meanVectorMagnitude",
  "stdVectorMagnitude",
  "axis1Std",
  "axis2Std",
  "axis3Std"
] as const;

export type FeatureName = (typeof FEATURE_NAMES)[number];

export interface DerivedTargetConfig {
  panasPositiveWeight: number;
  panasNegativeWeight: number;
  stai1Weight: number;
  dailyStressWeight: number;
}

export const DEFAULT_TARGET_CONFIG: DerivedTargetConfig = {
  panasPositiveWeight: 0.45,
  panasNegativeWeight: 0.25,
  stai1Weight: 0.20,
  dailyStressWeight: 0.10,
};

export async function loadMmashMentalWellbeingRows(
  mmashRoot: string,
  config: DerivedTargetConfig = DEFAULT_TARGET_CONFIG
): Promise<DailyWearableFeatureRow[]> {
  const dirents = await readdir(mmashRoot, { withFileTypes: true });
  const participantDirs = dirents
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(mmashRoot, entry.name));

  const rows: DailyWearableFeatureRow[] = [];

  for (const participantDir of participantDirs) {
    const participantId = participantDir.split(/[\\/]/).pop() ?? participantDir;
    const questionnairePath = join(participantDir, "questionnaire.csv");
    const actigraphPath = join(participantDir, "Actigraph.csv");

    try {
      const [questionnaireRows, actigraphRows] = await Promise.all([
        readCsvRows(questionnairePath),
        readCsvRows(actigraphPath),
      ]);

      if (questionnaireRows.length === 0 || actigraphRows.length === 0) {
        continue;
      }

      const derivedTarget = deriveMentalWellbeingTarget(questionnaireRows[0], config);
      if (derivedTarget == null) continue;

      const featureMap = aggregateActigraphFeatures(actigraphRows);
      rows.push({
        participantId,
        targetScore: derivedTarget.score,
        features: FEATURE_NAMES.map((name) => featureMap[name]),
        featureMap,
        targetComponents: derivedTarget.components,
      });
    } catch {
      continue;
    }
  }

  return rows;
}

export function aggregateActigraphFeatures(rows: CsvRow[]): Record<FeatureName, number> {
  const axis1Key = findColumn(rows[0], ["axis1"]);
  const axis2Key = findColumn(rows[0], ["axis2"]);
  const axis3Key = findColumn(rows[0], ["axis3"]);
  const stepsKey = findColumn(rows[0], ["steps"]);
  const hrKey = findColumn(rows[0], ["hr", "heartrate"]);
  const offKey = findColumn(rows[0], ["inclinometeroff"]);
  const standingKey = findColumn(rows[0], ["inclinometerstanding"]);
  const sittingKey = findColumn(rows[0], ["inclinometersitting"]);
  const lyingKey = findColumn(rows[0], ["inclinometerlying"]);
  const vectorKey = findColumn(rows[0], ["vectormagnitude"]);

  const axis1 = collectNumeric(rows, axis1Key);
  const axis2 = collectNumeric(rows, axis2Key);
  const axis3 = collectNumeric(rows, axis3Key);
  const steps = collectNumeric(rows, stepsKey);
  const hr = collectNumeric(rows, hrKey).filter((value) => value > 0);
  const off = collectNumeric(rows, offKey);
  const standing = collectNumeric(rows, standingKey);
  const sitting = collectNumeric(rows, sittingKey);
  const lying = collectNumeric(rows, lyingKey);
  const vector = collectNumeric(rows, vectorKey);

  const observedSeconds = rows.length;
  const observedHours = observedSeconds / 3600;
  const totalSteps = sum(steps);
  const activeSecondsFraction = observedSeconds === 0 ? 0 : steps.filter((value) => value > 0).length / observedSeconds;

  return {
    observedHours,
    totalSteps,
    meanStepsPerSecond: mean(steps),
    activeSecondsFraction,
    standingFraction: fractionOfOnes(standing, observedSeconds),
    sittingFraction: fractionOfOnes(sitting, observedSeconds),
    lyingFraction: fractionOfOnes(lying, observedSeconds),
    offFraction: fractionOfOnes(off, observedSeconds),
    meanHr: mean(hr),
    stdHr: std(hr),
    minHr: min(hr),
    maxHr: max(hr),
    meanVectorMagnitude: mean(vector),
    stdVectorMagnitude: std(vector),
    axis1Std: std(axis1),
    axis2Std: std(axis2),
    axis3Std: std(axis3),
  };
}

function fractionOfOnes(values: number[], totalRows: number): number {
  if (totalRows === 0) return 0;
  const ones = values.filter((value) => value >= 0.5).length;
  return ones / totalRows;
}

function collectNumeric(rows: CsvRow[], key: string | null): number[] {
  if (!key) return [];
  const values: number[] = [];
  for (const row of rows) {
    const value = parseNumber(row[key]);
    if (value != null) values.push(value);
  }
  return values;
}

function findColumn(row: CsvRow, aliases: string[]): string | null {
  const entries = Object.keys(row).map((key) => ({ key, normalized: normalizeHeader(key) }));
  for (const alias of aliases) {
    const found = entries.find((entry) => entry.normalized === alias);
    if (found) return found.key;
  }
  return null;
}

function deriveMentalWellbeingTarget(
  questionnaireRow: CsvRow,
  config: DerivedTargetConfig
): { score: number; components: DailyWearableFeatureRow["targetComponents"] } | null {
  const entries = Object.keys(questionnaireRow).map((key) => ({
    key,
    normalized: normalizeHeader(key),
    value: parseNumber(questionnaireRow[key]),
  }));

  const panasPositive = entries
    .filter((entry) => entry.value != null && entry.normalized.includes("panas") && entry.normalized.includes("pos"))
    .map((entry) => entry.value as number);
  const panasNegative = entries
    .filter((entry) => entry.value != null && entry.normalized.includes("panas") && entry.normalized.includes("neg"))
    .map((entry) => entry.value as number);

  const stai1 = findFirstValue(entries, ["stai1", "staiy1", "staiy01", "staiy_1"]);
  const dailyStress = findFirstValue(entries, ["dailystress", "dsi", "daily_stress"]);

  const avgPos = panasPositive.length > 0 ? mean(panasPositive) : null;
  const avgNeg = panasNegative.length > 0 ? mean(panasNegative) : null;

  const components = {
    averagePanasPositive: avgPos,
    averagePanasNegative: avgNeg,
    stai1,
    dailyStress,
  };

  const weightedParts: Array<{ value: number; weight: number }> = [];

  if (avgPos != null) {
    weightedParts.push({ value: clamp01((avgPos - 5) / 45), weight: config.panasPositiveWeight });
  }
  if (avgNeg != null) {
    weightedParts.push({ value: 1 - clamp01((avgNeg - 5) / 45), weight: config.panasNegativeWeight });
  }
  if (stai1 != null) {
    weightedParts.push({ value: 1 - clamp01((stai1 - 20) / 60), weight: config.stai1Weight });
  }
  if (dailyStress != null) {
    weightedParts.push({ value: 1 - clamp01(dailyStress / 406), weight: config.dailyStressWeight });
  }

  if (weightedParts.length < 2) return null;

  const totalWeight = weightedParts.reduce((sum, part) => sum + part.weight, 0);
  const weightedMean = weightedParts.reduce((sum, part) => sum + part.value * part.weight, 0) / totalWeight;
  const score = clamp(100 * weightedMean, 0, 100);

  return { score, components };
}

function findFirstValue(
  entries: Array<{ key: string; normalized: string; value: number | null }>,
  aliases: string[]
): number | null {
  for (const alias of aliases) {
    const found = entries.find((entry) => entry.normalized === alias);
    if (found && found.value != null) return found.value;
  }
  return null;
}

function clamp(value: number, minValue: number, maxValue: number): number {
  return Math.min(maxValue, Math.max(minValue, value));
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

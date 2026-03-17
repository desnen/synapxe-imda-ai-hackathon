import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { readCsvRows } from "./csvUtils";
import { FEATURE_NAMES, aggregateActigraphFeatures } from "./mmashMentalWellbeingData";

interface SavedModel {
  scoreRange: { min: number; max: number };
  featureNames: string[];
  featureStats: Array<{ mean: number; std: number }>;
  intercept: number;
  weights: number[];
}

async function main() {
  const modelPath = process.argv[2];
  const inputPath = process.argv[3];

  if (!modelPath || !inputPath) {
    throw new Error("Usage: node dist/predictMentalWellbeingScore.js <model.json> <Actigraph.csv|aggregated.json>");
  }

  const model = JSON.parse(await readFile(modelPath, "utf8")) as SavedModel;
  const rawFeatures = await loadInputFeatures(inputPath, model.featureNames);
  const featureVector = model.featureNames.map((name) => {
    const value = rawFeatures[name];
    if (!Number.isFinite(value)) {
      throw new Error(`Missing numeric feature: ${name}`);
    }
    return value;
  });

  const score = clamp(predict(model, featureVector), model.scoreRange.min, model.scoreRange.max);

  console.log(JSON.stringify({
    predictedMentalWellbeingScore: Number(score.toFixed(2)),
    band: bandForScore(score),
  }, null, 2));
}

async function loadInputFeatures(inputPath: string, featureNames: string[]): Promise<Record<string, number>> {
  const lower = basename(inputPath).toLowerCase();
  if (lower.endsWith(".csv") || lower.includes("actigraph")) {
    const rows = await readCsvRows(inputPath);
    return aggregateActigraphFeatures(rows);
  }

  const parsed = JSON.parse(await readFile(inputPath, "utf8")) as Record<string, unknown>;
  const features: Record<string, number> = {};
  for (const name of featureNames) {
    const value = parsed[name];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`Feature JSON must contain numeric field ${name}`);
    }
    features[name] = value;
  }
  return features;
}

function predict(model: SavedModel, rawRow: number[]): number {
  let value = model.intercept;
  for (let i = 0; i < rawRow.length; i += 1) {
    const normalized = (rawRow[i] - model.featureStats[i].mean) / model.featureStats[i].std;
    value += model.weights[i] * normalized;
  }
  return value;
}

function clamp(value: number, minValue: number, maxValue: number): number {
  return Math.min(maxValue, Math.max(minValue, value));
}

function bandForScore(score: number): string {
  if (score < 20) return "very_low";
  if (score < 40) return "low";
  if (score < 60) return "moderate";
  if (score < 80) return "good";
  return "excellent";
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

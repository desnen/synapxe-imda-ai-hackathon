import { mkdir, writeFile } from "node:fs/promises";
import { FEATURE_NAMES, DEFAULT_TARGET_CONFIG, loadMmashMentalWellbeingRows } from "./mmashMentalWellbeingData";
import { dirname } from "node:path";
import { evaluateModel, leaveOneOutMetrics, trainRidgeRegression } from "./linearRegression";

interface SavedModel {
  modelType: "linear_regression";
  scoreRange: { min: number; max: number };
  featureNames: string[];
  featureStats: Array<{ mean: number; std: number }>;
  intercept: number;
  weights: number[];
  targetDefinition: {
    name: "mental_wellbeing_score_0_100";
    type: "derived_proxy_from_mmash_questionnaires";
    components: Record<string, { range: [number, number]; direction: "higher_better" | "lower_better"; weight: number }>;
  };
  metrics: {
    trainRmse: number;
    trainMae: number;
    trainR2: number;
    looRmse: number;
    looMae: number;
    looR2: number;
  };
}

async function main() {
  const mmashRoot = process.argv[2] ?? "./MMASH";
  const modelOut = process.argv[3] ?? "./mentalWellbeingLinearModel.json";
  const summaryOut = process.argv[4] ?? "./mentalWellbeingTrainingSummary.json";
  const lambda = Number.parseFloat(process.argv[5] ?? "1.0");

  await mkdir(dirname(modelOut), { recursive: true });
  await mkdir(dirname(summaryOut), { recursive: true });

  const rows = await loadMmashMentalWellbeingRows(mmashRoot, DEFAULT_TARGET_CONFIG);
  if (rows.length < 5) {
    throw new Error(`Need at least 5 usable participant rows. Found ${rows.length}.`);
  }

  const x = rows.map((row) => row.features);
  const y = rows.map((row) => row.targetScore);

  const model = trainRidgeRegression(x, y, lambda);
  const trainMetrics = evaluateModel(model, x, y);
  const looMetrics = leaveOneOutMetrics(x, y, lambda);

  const savedModel: SavedModel = {
    modelType: "linear_regression",
    scoreRange: { min: 0, max: 100 },
    featureNames: [...FEATURE_NAMES],
    featureStats: model.featureStats,
    intercept: model.intercept,
    weights: model.weights,
    targetDefinition: {
      name: "mental_wellbeing_score_0_100",
      type: "derived_proxy_from_mmash_questionnaires",
      components: {
        averagePanasPositive: { range: [5, 50], direction: "higher_better", weight: DEFAULT_TARGET_CONFIG.panasPositiveWeight },
        averagePanasNegative: { range: [5, 50], direction: "lower_better", weight: DEFAULT_TARGET_CONFIG.panasNegativeWeight },
        stai1: { range: [20, 80], direction: "lower_better", weight: DEFAULT_TARGET_CONFIG.stai1Weight },
        dailyStress: { range: [0, 406], direction: "lower_better", weight: DEFAULT_TARGET_CONFIG.dailyStressWeight },
      },
    },
    metrics: {
      trainRmse: round(trainMetrics.rmse),
      trainMae: round(trainMetrics.mae),
      trainR2: round(trainMetrics.r2),
      looRmse: round(looMetrics.rmse),
      looMae: round(looMetrics.mae),
      looR2: round(looMetrics.r2),
    },
  };

  const summary = {
    dataset: "MMASH",
    modelType: "linear_regression",
    nParticipantsUsed: rows.length,
    nRows: rows.length,
    participants: rows.map((row) => row.participantId),
    featureNames: [...FEATURE_NAMES],
    targetDefinition: savedModel.targetDefinition,
    metrics: savedModel.metrics,
    targetStats: {
      min: round(Math.min(...y)),
      mean: round(y.reduce((sum, value) => sum + value, 0) / y.length),
      max: round(Math.max(...y)),
    },
    notes: [
      "MMASH has questionnaire markers but no single native mental well-being score.",
      "This target is a derived 0-100 proxy from PANAS positive/negative, STAI1, and Daily_stress.",
      "Predictors are aggregated wearable activity features from Actigraph.csv only.",
    ],
  };

  await writeFile(modelOut, JSON.stringify(savedModel, null, 2), "utf8");
  await writeFile(summaryOut, JSON.stringify(summary, null, 2), "utf8");

  console.log(`Saved model to ${modelOut}`);
  console.log(`Saved summary to ${summaryOut}`);
  console.log(JSON.stringify(savedModel.metrics, null, 2));
}

function round(value: number): number {
  return Number(value.toFixed(4));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

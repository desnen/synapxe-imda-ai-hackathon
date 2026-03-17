import { SleepReading, SleepTrainingRow, loadSleepTrainingRows } from "./sleepData";

export interface SleepPrediction {
  score: number;
  confidence: number;
  explanation: string;
}

interface FeatureStats {
  mean: number;
  std: number;
}

export interface SleepQualityModel {
  predict: (reading: SleepReading) => SleepPrediction;
  datasetSize: number;
}

let cachedModel: SleepQualityModel | null = null;
let modelPromise: Promise<SleepQualityModel> | null = null;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const buildStats = (values: number[]): FeatureStats => {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance) || 1;
  return { mean, std };
};

const normalize = (value: number, stats: FeatureStats) => (value - stats.mean) / stats.std;

const describeScore = (score: number) => {
  if (score >= 85) return "excellent recovery sleep";
  if (score >= 70) return "solid sleep quality";
  if (score >= 55) return "moderate sleep quality";
  return "restorative sleep needs improvement";
};

const trainLinearRegression = (rows: SleepTrainingRow[]) => {
  const hrStats = buildStats(rows.map((row) => row.heartRateBpm));
  const asleepStats = buildStats(rows.map((row) => row.timeAsleepHours));
  const moveStats = buildStats(rows.map((row) => row.movementsPerHour));

  const xs = rows.map((row) => [
    1,
    normalize(row.heartRateBpm, hrStats),
    normalize(row.timeAsleepHours, asleepStats),
    normalize(row.movementsPerHour, moveStats),
  ]);
  const ys = rows.map((row) => row.sleepQuality);

  let weights = [70, 0, 0, 0];
  const learningRate = 0.02;
  const regularization = 0.001;
  const epochs = 1800;

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    const gradients = [0, 0, 0, 0];

    for (let i = 0; i < xs.length; i += 1) {
      const features = xs[i];
      const predicted =
        weights[0] * features[0] +
        weights[1] * features[1] +
        weights[2] * features[2] +
        weights[3] * features[3];
      const error = predicted - ys[i];

      gradients[0] += error * features[0];
      gradients[1] += error * features[1];
      gradients[2] += error * features[2];
      gradients[3] += error * features[3];
    }

    for (let j = 0; j < weights.length; j += 1) {
      const regularized = j === 0 ? gradients[j] : gradients[j] + regularization * weights[j];
      weights[j] -= (learningRate * regularized) / xs.length;
    }
  }

  const predict = (reading: SleepReading): SleepPrediction => {
    const vector = [
      1,
      normalize(reading.heartRateBpm, hrStats),
      normalize(reading.timeAsleepHours, asleepStats),
      normalize(reading.movementsPerHour, moveStats),
    ];

    const rawScore =
      weights[0] * vector[0] +
      weights[1] * vector[1] +
      weights[2] * vector[2] +
      weights[3] * vector[3];

    const score = Math.round(clamp(rawScore, 0, 100));

    const normalizedDistance =
      (Math.abs(vector[1]) + Math.abs(vector[2]) + Math.abs(vector[3])) / 3;
    const confidence = Number(clamp(1 - normalizedDistance * 0.2, 0.58, 0.97).toFixed(2));

    const explanation = `Model predicts ${score}/100 (${describeScore(score)}) from HR ${reading.heartRateBpm} bpm, ${reading.timeAsleepHours.toFixed(
      1
    )}h asleep, and ${reading.movementsPerHour.toFixed(1)} movements/hr.`;

    return { score, confidence, explanation };
  };

  return {
    predict,
    datasetSize: rows.length,
  } as SleepQualityModel;
};

export async function getSleepQualityModel(): Promise<SleepQualityModel> {
  if (cachedModel) {
    return cachedModel;
  }

  if (!modelPromise) {
    modelPromise = (async () => {
      try {
        const rows = await loadSleepTrainingRows();
        const model = trainLinearRegression(rows);
        cachedModel = model;
        return model;
      } catch (error) {
        modelPromise = null;
        throw error;
      }
    })();
  }

  return modelPromise;
}

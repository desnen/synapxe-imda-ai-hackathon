export interface FeatureStat {
  mean: number;
  std: number;
}

export interface LinearRegressionModel {
  intercept: number;
  weights: number[];
  featureStats: FeatureStat[];
}

export interface RegressionMetrics {
  rmse: number;
  mae: number;
  r2: number;
}

export function trainRidgeRegression(
  rawX: number[][],
  y: number[],
  lambda = 1.0
): LinearRegressionModel {
  if (rawX.length === 0) {
    throw new Error("Cannot train on 0 rows.");
  }
  const featureStats = computeFeatureStats(rawX);
  const normalizedX = rawX.map((row) => normalizeRow(row, featureStats));
  const design = normalizedX.map((row) => [1, ...row]);

  const xt = transpose(design);
  const xtx = multiply(xt, design);
  const reg = identity(xtx.length);
  reg[0][0] = 0;

  for (let i = 0; i < xtx.length; i += 1) {
    for (let j = 0; j < xtx.length; j += 1) {
      xtx[i][j] += lambda * reg[i][j];
    }
  }

  const xty = multiplyMatrixVector(xt, y);
  const beta = solveLinearSystem(xtx, xty);

  return {
    intercept: beta[0],
    weights: beta.slice(1),
    featureStats,
  };
}

export function predict(model: LinearRegressionModel, rawRow: number[]): number {
  const normalized = normalizeRow(rawRow, model.featureStats);
  let value = model.intercept;
  for (let i = 0; i < model.weights.length; i += 1) {
    value += model.weights[i] * normalized[i];
  }
  return value;
}

export function evaluateModel(
  model: LinearRegressionModel,
  rawX: number[][],
  y: number[]
): RegressionMetrics {
  const preds = rawX.map((row) => predict(model, row));
  return computeMetrics(preds, y);
}

export function leaveOneOutMetrics(rawX: number[][], y: number[], lambda = 1.0): RegressionMetrics {
  if (rawX.length <= 1) {
    return { rmse: 0, mae: 0, r2: 0 };
  }

  const preds: number[] = [];
  const actuals: number[] = [];

  for (let i = 0; i < rawX.length; i += 1) {
    const trainX = rawX.filter((_, idx) => idx !== i);
    const trainY = y.filter((_, idx) => idx !== i);
    const model = trainRidgeRegression(trainX, trainY, lambda);
    preds.push(predict(model, rawX[i]));
    actuals.push(y[i]);
  }

  return computeMetrics(preds, actuals);
}

function computeFeatureStats(rawX: number[][]): FeatureStat[] {
  const dims = rawX[0].length;
  const stats: FeatureStat[] = [];
  for (let j = 0; j < dims; j += 1) {
    const values = rawX.map((row) => row[j]);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
    const std = Math.sqrt(variance) || 1;
    stats.push({ mean, std });
  }
  return stats;
}

function normalizeRow(row: number[], stats: FeatureStat[]): number[] {
  return row.map((value, i) => (value - stats[i].mean) / stats[i].std);
}

function transpose(matrix: number[][]): number[][] {
  return matrix[0].map((_, col) => matrix.map((row) => row[col]));
}

function multiply(a: number[][], b: number[][]): number[][] {
  const result = Array.from({ length: a.length }, () => Array.from({ length: b[0].length }, () => 0));
  for (let i = 0; i < a.length; i += 1) {
    for (let k = 0; k < b.length; k += 1) {
      for (let j = 0; j < b[0].length; j += 1) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}

function multiplyMatrixVector(matrix: number[][], vector: number[]): number[] {
  return matrix.map((row) => row.reduce((sum, value, i) => sum + value * vector[i], 0));
}

function identity(size: number): number[][] {
  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
  );
}

function solveLinearSystem(a: number[][], b: number[]): number[] {
  const n = a.length;
  const augmented = a.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col += 1) {
    let pivotRow = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(augmented[row][col]) > Math.abs(augmented[pivotRow][col])) {
        pivotRow = row;
      }
    }

    if (Math.abs(augmented[pivotRow][col]) < 1e-12) {
      throw new Error("Matrix is singular or ill-conditioned.");
    }

    if (pivotRow !== col) {
      const tmp = augmented[col];
      augmented[col] = augmented[pivotRow];
      augmented[pivotRow] = tmp;
    }

    const pivot = augmented[col][col];
    for (let j = col; j <= n; j += 1) {
      augmented[col][j] /= pivot;
    }

    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = augmented[row][col];
      for (let j = col; j <= n; j += 1) {
        augmented[row][j] -= factor * augmented[col][j];
      }
    }
  }

  return augmented.map((row) => row[n]);
}

function computeMetrics(preds: number[], actuals: number[]): RegressionMetrics {
  const n = preds.length;
  const meanY = actuals.reduce((sum, value) => sum + value, 0) / Math.max(n, 1);
  const mse = preds.reduce((sum, pred, i) => sum + (pred - actuals[i]) ** 2, 0) / Math.max(n, 1);
  const mae = preds.reduce((sum, pred, i) => sum + Math.abs(pred - actuals[i]), 0) / Math.max(n, 1);
  const ssRes = preds.reduce((sum, pred, i) => sum + (pred - actuals[i]) ** 2, 0);
  const ssTot = actuals.reduce((sum, actual) => sum + (actual - meanY) ** 2, 0);

  return {
    rmse: Math.sqrt(mse),
    mae,
    r2: ssTot === 0 ? 0 : 1 - ssRes / ssTot,
  };
}

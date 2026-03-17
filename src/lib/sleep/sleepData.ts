export interface SleepReading {
  heartRateBpm: number;
  timeAsleepHours: number;
  movementsPerHour: number;
}

export interface SleepTrainingRow extends SleepReading {
  sleepQuality: number;
}

const SLEEP_DATA_URL = new URL("../../mock_data/sleepdata_2.csv", import.meta.url).href;
let rowsPromise: Promise<SleepTrainingRow[]> | null = null;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const parsePercent = (input: string) => {
  const normalized = input.replace("%", "").trim();
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : Number.NaN;
};

const parseNumber = (input: string) => {
  const value = Number.parseFloat(input);
  return Number.isFinite(value) ? value : Number.NaN;
};

const seededNoise = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const deriveHeartRateBpm = (
  movementsPerHour: number,
  timeAsleepHours: number,
  rowIndex: number
) => {
  // The source CSV has zero heart-rate values; derive a plausible wearable HR proxy.
  const movementEffect = (movementsPerHour - 45) * 0.16;
  const durationEffect = (7.25 - timeAsleepHours) * 2.9;
  const jitter = (seededNoise(rowIndex + 1) - 0.5) * 7;
  return clamp(Math.round(56 + movementEffect + durationEffect + jitter), 44, 96);
};

export async function loadSleepTrainingRows(): Promise<SleepTrainingRow[]> {
  if (rowsPromise) {
    return rowsPromise;
  }

  rowsPromise = (async () => {
  const response = await fetch(SLEEP_DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to load sleep CSV (${response.status})`);
  }

  const rawCsv = await response.text();
  const lines = rawCsv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("Sleep CSV has no data rows");
  }

  const headers = lines[0].split(";").map((header) => header.trim());
  const qualityIndex = headers.indexOf("Sleep Quality");
  const heartRateIndex = headers.indexOf("Heart rate (bpm)");
  const movementsIndex = headers.indexOf("Movements per hour");
  const timeAsleepIndex = headers.indexOf("Time asleep (seconds)");

  if (
    qualityIndex === -1 ||
    heartRateIndex === -1 ||
    movementsIndex === -1 ||
    timeAsleepIndex === -1
  ) {
    throw new Error("Sleep CSV headers are missing required columns");
  }

  const rows: SleepTrainingRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const cells = lines[i].split(";");
    const quality = parsePercent(cells[qualityIndex] ?? "");
    const heartRateRaw = parseNumber(cells[heartRateIndex] ?? "");
    const movementsPerHour = parseNumber(cells[movementsIndex] ?? "");
    const timeAsleepSeconds = parseNumber(cells[timeAsleepIndex] ?? "");

    if (
      Number.isNaN(quality) ||
      Number.isNaN(movementsPerHour) ||
      Number.isNaN(timeAsleepSeconds)
    ) {
      continue;
    }

    const timeAsleepHours = timeAsleepSeconds / 3600;
    const heartRateBpm =
      heartRateRaw > 0
        ? heartRateRaw
        : deriveHeartRateBpm(movementsPerHour, timeAsleepHours, i);

    rows.push({
      sleepQuality: clamp(Math.round(quality), 0, 100),
      heartRateBpm,
      timeAsleepHours: clamp(timeAsleepHours, 3, 12),
      movementsPerHour: clamp(movementsPerHour, 10, 130),
    });
  }

  if (rows.length === 0) {
    throw new Error("No valid rows were parsed from sleep CSV");
  }

  return rows;
  })();

  try {
    return await rowsPromise;
  } catch (error) {
    rowsPromise = null;
    throw error;
  }
}

export function generateHybridMockReading(
  rows: SleepTrainingRow[],
  random = Math.random
): SleepReading {
  const source = rows[Math.floor(random() * rows.length)];
  if (!source) {
    return {
      heartRateBpm: 60,
      timeAsleepHours: 7,
      movementsPerHour: 45,
    };
  }

  const jitterHeartRate = (random() - 0.5) * 6;
  const jitterTimeAsleep = (random() - 0.5) * 0.9;
  const jitterMovements = (random() - 0.5) * 12;

  return {
    heartRateBpm: Math.round(clamp(source.heartRateBpm + jitterHeartRate, 44, 96)),
    timeAsleepHours: Number(
      clamp(source.timeAsleepHours + jitterTimeAsleep, 3.8, 10.5).toFixed(2)
    ),
    movementsPerHour: Number(
      clamp(source.movementsPerHour + jitterMovements, 14, 125).toFixed(1)
    ),
  };
}

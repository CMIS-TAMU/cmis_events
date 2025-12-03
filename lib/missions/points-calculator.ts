/**
 * Points Calculator for Technical Missions
 * 
 * Calculates points based on score, difficulty, and bonuses
 */

export interface PointsCalculationInput {
  score: number; // 0-100
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  maxPoints: number; // Maximum points for the mission (default 100)
  submittedBeforeDeadline?: boolean;
  submittedWithin24Hours?: boolean;
}

export interface PointsCalculationResult {
  basePoints: number;
  difficultyMultiplier: number;
  timeBonus: number;
  totalPoints: number;
  breakdown: {
    scoreComponent: number;
    difficultyComponent: number;
    timeBonusComponent: number;
  };
}

/**
 * Calculate points awarded for a mission submission
 */
export function calculatePoints(input: PointsCalculationInput): PointsCalculationResult {
  const { score, difficulty, maxPoints, submittedBeforeDeadline, submittedWithin24Hours } = input;

  // 1. Base points calculation based on score
  let basePoints: number;
  if (score <= 50) {
    basePoints = score * 0.5;
  } else if (score <= 75) {
    basePoints = score * 0.75;
  } else if (score < 100) {
    basePoints = score * 1.0;
  } else {
    // Perfect score bonus (150% of max points)
    basePoints = maxPoints * 1.5;
  }

  // 2. Difficulty multiplier
  const difficultyMultipliers = {
    beginner: 1.0,
    intermediate: 1.2,
    advanced: 1.5,
    expert: 2.0,
  };

  const difficultyMultiplier = difficultyMultipliers[difficulty] || 1.0;
  const scoreComponent = basePoints * difficultyMultiplier;

  // 3. Time bonuses
  let timeBonus = 0;
  let timeBonusComponent = 0;

  if (submittedBeforeDeadline) {
    timeBonus = scoreComponent * 0.1; // 10% bonus
    timeBonusComponent = timeBonus;
  } else if (submittedWithin24Hours) {
    timeBonus = scoreComponent * 0.05; // 5% bonus
    timeBonusComponent = timeBonus;
  }

  const totalPoints = Math.round(scoreComponent + timeBonus);

  return {
    basePoints,
    difficultyMultiplier,
    timeBonus,
    totalPoints,
    breakdown: {
      scoreComponent: Math.round(scoreComponent),
      difficultyComponent: Math.round(scoreComponent - basePoints),
      timeBonusComponent: Math.round(timeBonusComponent),
    },
  };
}

/**
 * Get points reason text for transaction record
 */
export function getPointsReason(
  score: number,
  difficulty: string,
  isPerfectScore: boolean
): string {
  if (isPerfectScore) {
    return `Perfect score on ${difficulty} mission`;
  }
  return `Mission completion (${score}/100) - ${difficulty}`;
}


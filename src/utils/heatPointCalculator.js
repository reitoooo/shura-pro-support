/**
 * Heat Point Calculator
 * Handles point calculation with hurdle multiplier
 * and threshold detection for celebration feedback.
 */

// Hurdle levels with multipliers and labels
export const HURDLE_LEVELS = [
  { level: 1, multiplier: 1.0, label: '楽勝', emoji: '😊', color: '#22c55e' },
  { level: 2, multiplier: 2.0, label: 'ちょいキツ', emoji: '💪', color: '#f59e0b' },
  { level: 3, multiplier: 3.0, label: 'キツい', emoji: '🔥', color: '#ef4444' },
  { level: 4, multiplier: 4.0, label: 'かなりキツい', emoji: '🔥🔥', color: '#dc2626' },
  { level: 5, multiplier: 5.0, label: '修羅の道', emoji: '👹🔥', color: '#b91c1c' },
];

// Celebration thresholds
export const CELEBRATION_THRESHOLDS = [
  { points: 10, message: 'いい調子！', subtext: '最初の一歩を踏み出した', level: 'mild' },
  { points: 30, message: 'On stage 🔥', subtext: '熱が高まってきた！', level: 'medium' },
  { points: 50, message: 'On stage!! 🔥🔥', subtext: '止まらない勢い！', level: 'hot' },
  { points: 100, message: '超On stage!!! 🔥🔥🔥', subtext: '今日のあなたは修羅そのもの', level: 'blazing' },
  { points: 200, message: '修羅覚醒 👹', subtext: '限界を超えた先に、新しい自分がいる', level: 'ascended' },
  { points: 500, message: '伝説の修羅 🌋', subtext: 'この熱量は誰にも止められない', level: 'legendary' },
];

/**
 * Calculate heat points from a time-based session
 * Base: 1 point per minute, with hurdle multiplier
 * @param {number} durationMs - Duration in milliseconds
 * @param {number} hurdleLevel - Hurdle level (1-5)
 * @returns {number} Calculated points
 */
export function calculateTimePoints(durationMs, hurdleLevel = 1) {
  const minutes = durationMs / (1000 * 60);
  const hurdle = HURDLE_LEVELS.find((h) => h.level === hurdleLevel) || HURDLE_LEVELS[0];
  const basePoints = Math.max(1, Math.round(minutes));
  return Math.round(basePoints * hurdle.multiplier);
}

/**
 * Calculate heat points from a count-based session
 * Base: 1 point per unit, with hurdle multiplier
 * @param {number} count - Number of units completed
 * @param {number} hurdleLevel - Hurdle level (1-5)
 * @returns {number} Calculated points
 */
export function calculateCountPoints(count, hurdleLevel = 1) {
  const hurdle = HURDLE_LEVELS.find((h) => h.level === hurdleLevel) || HURDLE_LEVELS[0];
  const basePoints = Math.max(1, Math.round(count));
  return Math.round(basePoints * hurdle.multiplier);
}

/**
 * Check if a new total crosses a celebration threshold
 * @param {number} previousTotal - Points before this session
 * @param {number} newTotal - Points after this session
 * @returns {object|null} Celebration data if threshold crossed, null otherwise
 */
export function checkCelebration(previousTotal, newTotal) {
  // Find the highest threshold crossed that wasn't already crossed
  let celebration = null;

  for (const threshold of CELEBRATION_THRESHOLDS) {
    if (previousTotal < threshold.points && newTotal >= threshold.points) {
      celebration = threshold;
    }
  }

  return celebration;
}

/**
 * Get the current heat level label based on today's points
 * @param {number} todayPoints
 * @returns {object} Current level info
 */
export function getCurrentHeatLevel(todayPoints) {
  let currentLevel = { label: 'スタンバイ', color: '#64748b', emoji: '⚡' };

  for (const threshold of CELEBRATION_THRESHOLDS) {
    if (todayPoints >= threshold.points) {
      currentLevel = {
        label: threshold.message,
        color: threshold.level === 'mild' ? '#22c55e'
          : threshold.level === 'medium' ? '#f59e0b'
          : threshold.level === 'hot' ? '#ef4444'
          : threshold.level === 'blazing' ? '#dc2626'
          : threshold.level === 'ascended' ? '#b91c1c'
          : '#7c2d12',
        emoji: '',
      };
    }
  }

  return currentLevel;
}

/**
 * Format duration milliseconds to human-readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted string (e.g., "1時間23分")
 */
export function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  }
  if (minutes > 0) {
    return `${minutes}分${seconds}秒`;
  }
  return `${seconds}秒`;
}

/**
 * Format stopwatch display (HH:MM:SS)
 * @param {number} ms - Elapsed milliseconds
 * @returns {string} Formatted time
 */
export function formatStopwatch(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((v) => v.toString().padStart(2, '0'))
    .join(':');
}

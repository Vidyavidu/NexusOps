const PRIORITY_MATRIX = {
  "1-1": 1, // High impact, high urgency -> Critical
  "1-2": 2,
  "1-3": 3,
  "2-1": 2,
  "2-2": 3,
  "2-3": 4,
  "3-1": 3,
  "3-2": 4,
  "3-3": 5, // Low impact, low urgency -> Planning
};

export function calculatePriority(impact, urgency) {
  const key = `${impact}-${urgency}`;
  return PRIORITY_MATRIX[key] || 5;
}
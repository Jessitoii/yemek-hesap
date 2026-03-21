import { Gender } from '../types/user';

/**
 * Calculates body fat percentage using the U.S. Navy formula.
 * @param gender User's gender.
 * @param height User's height in cm.
 * @param waist User's waist circumference in cm.
 * @param neck User's neck circumference in cm.
 * @param hip User's hip circumference in cm (only for female).
 * @returns Estimated body fat percentage.
 */
export function calcBodyFat(
  gender: Gender,
  height: number,
  waist: number,
  neck: number,
  hip?: number
): number {
  let bfp = 0;

  if (gender === Gender.MALE) {
    bfp =
      86.01 * Math.log10(waist - neck) -
      70.041 * Math.log10(height) +
      36.76;
  } else {
    bfp =
      163.205 * Math.log10(waist + (hip || 0) - neck) -
      97.684 * Math.log10(height) -
      78.387;
  }

  return Number(bfp.toFixed(1));
}

/**
 * Returns the body fat category based on the percentage and gender.
 */
export function getBodyFatCategory(
  gender: Gender,
  bfp: number
): 'Essential' | 'Athletes' | 'Fitness' | 'Average' | 'Obese' {
  if (gender === Gender.MALE) {
    if (bfp < 6) return 'Essential';
    if (bfp < 14) return 'Athletes';
    if (bfp < 18) return 'Fitness';
    if (bfp < 25) return 'Average';
    return 'Obese';
  } else {
    if (bfp < 14) return 'Essential';
    if (bfp < 21) return 'Athletes';
    if (bfp < 25) return 'Fitness';
    if (bfp < 32) return 'Average';
    return 'Obese';
  }
}

export enum ExerciseType {
  RUNNING = 'RUNNING',
  CYCLING = 'CYCLING',
  FITNESS = 'FITNESS',
  WALKING = 'WALKING',
  SWIMMING = 'SWIMMING',
  FOOTBALL = 'FOOTBALL',
  YOGA = 'YOGA',
  OTHER = 'OTHER',
}

export interface ExerciseEntry {
  id: string;
  name: string;
  type: ExerciseType;
  met: number;
  icon: string;
}

export const exercises: ExerciseEntry[] = [
  { id: '1', name: 'Koşu', type: ExerciseType.RUNNING, met: 8.3, icon: 'PersonSimpleRun' },
  { id: '2', name: 'Bisiklet', type: ExerciseType.CYCLING, met: 6.8, icon: 'Bicycle' },
  { id: '3', name: 'Fitness', type: ExerciseType.FITNESS, met: 5.5, icon: 'Barbell' },
  { id: '4', name: 'Yürüyüş', type: ExerciseType.WALKING, met: 3.5, icon: 'PersonSimpleWalk' },
  { id: '5', name: 'Yüzme', type: ExerciseType.SWIMMING, met: 5.8, icon: 'Waves' },
  { id: '6', name: 'Futbol', type: ExerciseType.FOOTBALL, met: 7.0, icon: 'SoccerBall' },
  { id: '7', name: 'Yoga', type: ExerciseType.YOGA, met: 2.5, icon: 'PersonSimple' },
  { id: '8', name: 'Diğer', type: ExerciseType.OTHER, met: 4.0, icon: 'Lightning' },
];

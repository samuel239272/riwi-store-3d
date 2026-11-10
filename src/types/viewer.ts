import type { Vector3Tuple } from './product';
export type CameraPreset = 'perspective' | 'front' | 'rear' | 'left' | 'right' | 'top' | 'interior';
export type InspectionMode = 'standard' | 'exterior' | 'components' | 'detail';
export interface CameraCommand {
  id: number;
  position?: Vector3Tuple;
  target?: Vector3Tuple;
  zoom?: number;
}
export const CAMERA_PRESETS: Record<CameraPreset, Vector3Tuple> = {
  perspective: [1.5, 0.7, 5.4],
  front: [0, 0.2, 5.6],
  rear: [0, 0.2, -5.6],
  left: [-5.4, 0.6, 0],
  right: [5.4, 0.6, 0],
  top: [0, 5.5, 0.01],
  interior: [0, -4.4, 2.3],
};
export const PRESET_LABELS: Record<CameraPreset, string> = {
  perspective: 'Perspectiva',
  front: 'Frontal',
  rear: 'Posterior',
  left: 'Izquierda',
  right: 'Derecha',
  top: 'Superior',
  interior: 'Interior',
};

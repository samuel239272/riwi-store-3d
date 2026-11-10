export const measurementFields = [
  { key: 'height', label: 'Estatura', unit: 'cm', min: 135, max: 210 },
  { key: 'weight', label: 'Peso', unit: 'kg', min: 35, max: 180 },
  { key: 'chest', label: 'Pecho', unit: 'cm', min: 65, max: 150 },
  { key: 'waist', label: 'Cintura', unit: 'cm', min: 50, max: 150 },
  { key: 'hips', label: 'Cadera', unit: 'cm', min: 65, max: 160 },
  { key: 'shoulders', label: 'Hombros', unit: 'cm', min: 32, max: 60 },
  { key: 'inseam', label: 'Entrepierna', unit: 'cm', min: 55, max: 105 },
] as const;
export type MeasurementKey = typeof measurementFields[number]['key'];
export type BodyProfile = Record<MeasurementKey, number>;
export const defaultBody: BodyProfile = { height: 175, weight: 72, chest: 96, waist: 82, hips: 98, shoulders: 44, inseam: 80 };
export const bodyStorageKey = 'riwi-body-profile-v1';
export function validateBody(profile: BodyProfile): string | null {
  for (const f of measurementFields) if (!Number.isFinite(profile[f.key]) || profile[f.key] < f.min || profile[f.key] > f.max) return `${f.label}: introduce un valor entre ${f.min} y ${f.max} ${f.unit}.`;
  if (profile.inseam > profile.height * .56 || profile.inseam < profile.height * .36) return 'Revisa la entrepierna: debe ser coherente con tu estatura (entre el 36 % y el 56 %).';
  return null;
}
export function readBody(): BodyProfile {
  try { const saved = JSON.parse(localStorage.getItem(bodyStorageKey) ?? 'null'); if (saved && !validateBody(saved)) return saved; } catch { /* Storage can be disabled. */ }
  return { ...defaultBody };
}
// Centimetres become scene units. Circumferences constrain elliptical rings;
// weight influences limb fullness only. This is a visual approximation, not anthropometry.
export function bodyDimensions(p: BodyProfile) {
  const h=p.height/50, leg=p.inseam/50, hipY=-h/2+leg, shoulderY=h/2-.62;
  const fullness=Math.max(.8,Math.min(1.5,Math.sqrt(p.weight/72)*175/p.height));
  return { h, leg, hipY, shoulderY, waistY:hipY+.28, chestY:shoulderY-.26, shoulder:p.shoulders/100,
    chest:p.chest/50/(Math.PI*1.68), waist:p.waist/50/(Math.PI*1.68), hips:p.hips/50/(Math.PI*1.68), fullness };
}

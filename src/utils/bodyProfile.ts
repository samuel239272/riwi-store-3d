export const measurementFields = [
  { key: 'height', label: 'Estatura', unit: 'cm', min: 135, max: 210 },
  { key: 'weight', label: 'Peso', unit: 'kg', min: 35, max: 180 },
  { key: 'chest', label: 'Pecho', unit: 'cm', min: 65, max: 150 },
  { key: 'waist', label: 'Cintura', unit: 'cm', min: 50, max: 150 },
  { key: 'hips', label: 'Cadera', unit: 'cm', min: 65, max: 160 },
  { key: 'shoulders', label: 'Hombros', unit: 'cm', min: 32, max: 60 },
  { key: 'inseam', label: 'Entrepierna', unit: 'cm', min: 55, max: 105 },
] as const;
export type MeasurementKey = (typeof measurementFields)[number]['key'];
export type BodyProfile = Record<MeasurementKey, number>;
export const defaultBody: BodyProfile = {
  height: 175,
  weight: 72,
  chest: 96,
  waist: 82,
  hips: 98,
  shoulders: 44,
  inseam: 80,
};
export const bodyStorageKey = 'riwi-body-profile-v1';
export type BodyModel = 'male' | 'female';
export const femaleBody: BodyProfile = {
  height: 168,
  weight: 62,
  chest: 90,
  waist: 72,
  hips: 98,
  shoulders: 38,
  inseam: 77,
};
export const avatarStorageKey = 'riwi-fitting-avatar-v2';
export const referenceBody = (model: BodyModel) => ({
  ...(model === 'female' ? femaleBody : defaultBody),
});
export function readAvatar(): { model: BodyModel; profile: BodyProfile } {
  try {
    const saved = JSON.parse(localStorage.getItem(avatarStorageKey) ?? 'null');
    if (
      saved?.version === 2 &&
      ['male', 'female'].includes(saved.model) &&
      saved.profile &&
      !validateBody(saved.profile)
    )
      return { model: saved.model, profile: saved.profile };
  } catch {
    /* A damaged or unavailable store must never block the fitting room. */
  }
  return { model: 'male', profile: readBody() };
}
export function buildValue(profile: BodyProfile, model: BodyModel) {
  return Math.max(
    -100,
    Math.min(100, Math.round((profile.waist / referenceBody(model).waist - 1) * 200)),
  );
}
/** Starting proportions for the build control; individual measurements remain editable. */
export function withBuild(profile: BodyProfile, model: BodyModel, value: number): BodyProfile {
  const base = referenceBody(model),
    t = value / 100;
  const next = {
    ...profile,
    weight: Math.round(base.weight * (profile.height / base.height) ** 2 * (1 + 0.7 * t)),
    chest: Math.round(base.chest * (1 + 0.24 * t)),
    waist: Math.round(base.waist * (1 + 0.5 * t)),
    hips: Math.round(base.hips * (1 + 0.28 * t)),
  };
  for (const field of measurementFields)
    next[field.key] = Math.max(field.min, Math.min(field.max, next[field.key]));
  return next;
}
export function validateBody(profile: BodyProfile): string | null {
  for (const f of measurementFields)
    if (!Number.isFinite(profile[f.key]) || profile[f.key] < f.min || profile[f.key] > f.max)
      return `${f.label}: introduce un valor entre ${f.min} y ${f.max} ${f.unit}.`;
  if (profile.inseam > profile.height * 0.56 || profile.inseam < profile.height * 0.36)
    return 'Revisa la entrepierna: debe ser coherente con tu estatura (entre el 36 % y el 56 %).';
  return null;
}
export function readBody(): BodyProfile {
  try {
    const saved = JSON.parse(localStorage.getItem(bodyStorageKey) ?? 'null');
    if (saved && !validateBody(saved)) return saved;
  } catch {
    /* Storage can be disabled. */
  }
  return { ...defaultBody };
}
// Centimetres become scene units. Circumferences constrain elliptical rings;
// weight influences limb fullness only. This is a visual approximation, not anthropometry.
export function bodyDimensions(p: BodyProfile) {
  const h = p.height / 50,
    leg = p.inseam / 50,
    hipY = -h / 2 + leg,
    shoulderY = h / 2 - 0.62;
  const fullness = Math.max(0.8, Math.min(1.5, (Math.sqrt(p.weight / 72) * 175) / p.height));
  return {
    h,
    leg,
    hipY,
    shoulderY,
    waistY: hipY + 0.28,
    chestY: shoulderY - 0.26,
    shoulder: p.shoulders / 100,
    chest: p.chest / 50 / (Math.PI * 1.68),
    waist: p.waist / 50 / (Math.PI * 1.68),
    hips: p.hips / 50 / (Math.PI * 1.68),
    fullness,
  };
}

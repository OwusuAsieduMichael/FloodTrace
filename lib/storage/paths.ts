export function buildIncidentEvidencePath(
  userId: string,
  incidentId: string,
  extension: string
): string {
  const timestamp = Date.now();
  return `${userId}/${incidentId}/${timestamp}.${extension}`;
}

export function buildResolutionEvidencePath(
  userId: string,
  incidentId: string,
  extension: string
): string {
  const timestamp = Date.now();
  return `${userId}/${incidentId}/${timestamp}.${extension}`;
}

export function buildAvatarPath(userId: string, extension: string): string {
  return `${userId}/avatar.${extension}`;
}

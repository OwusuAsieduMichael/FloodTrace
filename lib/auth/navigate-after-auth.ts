/** Full navigation after auth so session cookies are sent on the next document request. */
export function navigateAfterAuth(path: string) {
  window.location.assign(path);
}

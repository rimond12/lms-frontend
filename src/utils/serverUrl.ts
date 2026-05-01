// Re-export from the new unified imageUtils for backward compatibility
export { getImageUrl, getFullDocumentUrl, getFullImageUrl } from "./imageUtils";

// Deprecated: Use getImageUrl from imageUtils instead
export const getServerBaseUrl = (): string => {
  return process.env.NODE_ENV === "production"
    ? "https://api.caddcore.cloud"
    : "https://api.caddcore.cloud";
};

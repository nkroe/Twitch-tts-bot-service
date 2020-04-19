export const getQueryParam = (url?: string): string | undefined | null => {
  if (!url) return undefined;

  try {
    const params = url.match(/\?(.)+/gi);

    if (!params) return undefined;

    return params.length > 0 ? new URLSearchParams(params[0]).get('r') : undefined;
  } catch (e) {
    return undefined;
  }
};

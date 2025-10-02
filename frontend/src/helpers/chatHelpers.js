export function getYouTubeVideoId(urlOrId){
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  // If it already looks like an id (11 chars typical) return it
  const maybeId = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(maybeId)) return maybeId;

  try {
    if (maybeId.includes('youtube.com') || maybeId.includes('youtu.be')) {
      const parsed = new URL(maybeId);
      if (parsed.hostname.includes('youtu.be')) return parsed.pathname.slice(1);
      return parsed.searchParams.get('v');
    }
  } catch (e) {
    return null;
  }

  return null;
};


export function snakeKeysToCamel(obj) {
  if (Array.isArray(obj)) {
    return obj.map(snakeKeysToCamel);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
      acc[camelKey] = snakeKeysToCamel(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

export function getYouTubeEmbedUrl(urlOrId) {
  let videoId = urlOrId;

  // If the input looks like a full YouTube URL
  if (urlOrId.includes('youtube.com') || urlOrId.includes('youtu.be')) {
    const url = new URL(urlOrId);

    if (url.hostname === 'youtu.be') {
      // Short URL: https://youtu.be/VIDEO_ID
      videoId = url.pathname.slice(1);
    } else {
      // Standard URL: https://www.youtube.com/watch?v=VIDEO_ID
      videoId = url.searchParams.get('v');
    }
  }

  return `https://www.youtube.com/embed/${videoId}?controls=0&rel=0&modestbranding=1`;
}

export function isValidYouTubeUrlOrId(value) {
  if (!value || typeof value !== 'string') return false;
  if (/^[a-zA-Z0-9_-]{11}$/.test(value.trim())) return true;
  try {
    const u = new URL(value);
    return u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be');
  } catch (e) {
    return false;
  }
};
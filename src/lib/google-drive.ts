
export function getGoogleDriveEmbedUrl(url: string): string | null {
  if (!url || !url.includes('drive.google.com')) {
    return null;
  }

  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Find the part after /d/
    const fileIdIndex = pathParts.findIndex(part => part === 'd');
    if (fileIdIndex !== -1 && pathParts.length > fileIdIndex + 1) {
      const fileId = pathParts[fileIdIndex + 1];
      // Check if it's already an embed link
      if (url.includes('/preview')) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    // Fallback for URLs that might have the ID in query params (less common now)
    const idFromParams = urlObj.searchParams.get('id');
    if (idFromParams) {
        return `https://drive.google.com/file/d/${idFromParams}/preview`;
    }

  } catch (error) {
    console.error("Error parsing Google Drive URL:", error);
    return null;
  }

  // If no specific pattern matches, return null as we can't be sure
  return null;
}

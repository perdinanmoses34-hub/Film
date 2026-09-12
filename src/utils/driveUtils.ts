/**
 * Google Drive URL & ID Parser Utility
 * Robustly extracts Google Drive File/Folder IDs from any format
 */

export function extractGoogleDriveId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  // Pattern 1: /file/d/{FILE_ID}
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) return fileMatch[1];

  // Pattern 2: /folders/{FOLDER_ID}
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && folderMatch[1]) return folderMatch[1];

  // Pattern 3: /d/{ID}
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) return dMatch[1];

  // Pattern 4: ?id={ID} or &id={ID}
  const idQueryMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idQueryMatch && idQueryMatch[1]) return idQueryMatch[1];

  // Pattern 5: Plain ID (Google Drive IDs are typically 20-50 alphanumeric characters with dashes and underscores)
  const plainIdMatch = trimmed.match(/^[a-zA-Z0-9_-]{15,}$/);
  if (plainIdMatch) return plainIdMatch[0];

  return trimmed;
}

export function isDriveFolderInput(input: string): boolean {
  if (!input) return false;
  return input.includes('folders/') || input.toLowerCase().includes('folder');
}

export function buildDriveEmbedUrl(fileId: string): string {
  const cleanId = extractGoogleDriveId(fileId);
  return `https://drive.google.com/file/d/${cleanId}/preview`;
}

export function buildDriveShareUrl(fileId: string): string {
  const cleanId = extractGoogleDriveId(fileId);
  return `https://drive.google.com/file/d/${cleanId}/view?usp=sharing`;
}

import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import { auth } from './firebase';
import { WeekData } from '../types';

// Supported Workspace scopes
export const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
];

const provider = new GoogleAuthProvider();
for (const scope of SCOPES) {
  provider.addScope(scope);
}

let isSigningIn = false;
let cachedAccessToken: string | null = null;

/**
 * Initialize auth listener
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If logged in but token expired/cleared from memory, sign-in prompt can re-acquire
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Trigger Google Sign In popup with Drive scopes
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
}

/**
 * Search user's Google Drive for Pick'em files
 */
export async function listDrivePickemFiles(): Promise<DriveFileItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive');

  const query = encodeURIComponent("name contains 'Pick\'em' or name contains 'NFL' and trashed = false");
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,webViewLink)&pageSize=20`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to list Google Drive files');
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Save / Export season data to Google Drive as a JSON or formatted file
 */
export async function saveSeasonToDrive(
  seasonWeeks: WeekData[],
  fileName = '2026-27 NFL Pick\'em.json'
): Promise<{ fileId: string; fileName: string; webViewLink?: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive');

  const fileMetadata = {
    name: fileName,
    mimeType: 'application/json',
    description: 'NFL Pick\'em season picks, draft allocations, and scores',
  };

  const fileContent = JSON.stringify(
    {
      title: "2026-27 NFL Pick'em",
      exportedAt: new Date().toISOString(),
      weeks: seasonWeeks,
    },
    null,
    2
  );

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' })
  );
  form.append('file', new Blob([fileContent], { type: 'application/json' }));

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to save file to Google Drive');
  }

  const data = await res.json();
  return {
    fileId: data.id,
    fileName: data.name,
    webViewLink: data.webViewLink,
  };
}

/**
 * Import season data from a Google Drive file
 */
export async function loadSeasonFromDrive(fileId: string): Promise<WeekData[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive');

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to read file from Google Drive');
  }

  const data = await res.json();
  if (Array.isArray(data.weeks)) {
    return data.weeks;
  }
  if (Array.isArray(data)) {
    return data;
  }
  throw new Error('Invalid file format. Expected NFL Pick\'em season data.');
}

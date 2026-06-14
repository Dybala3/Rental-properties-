import { Property } from '../types';

// In-memory token storage (Do not persist actual token to localStorage for security)
let cachedAccessToken: string | null = null;
let googleUsername: string | null = null;
let googleAvatar: string | null = null;

export interface GoogleChatSpace {
  name: string;
  displayName: string;
  type: string;
}

export interface GoogleChatMessage {
  name: string;
  sender: {
    displayName: string;
    avatarUrl?: string;
  };
  text: string;
  createTime: string;
}

// Check URL hash for implicit grant token on load
export const checkUrlForAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash.substring(1));
  const token = params.get('access_token');
  if (token) {
    cachedAccessToken = token;
    // Clean up hash from URL bar
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    return token;
  }
  return null;
};

// Initiate Google OAuth 2.0 implicit configuration
export const initiateGoogleOAuth = (clientId?: string) => {
  // Use a default client id for the app, or allow user input
  const defaultClientId = '934828287623-gen-df.apps.googleusercontent.com'; // Fallback
  const targetClientId = clientId || defaultClientId;
  const redirectUri = window.location.origin;
  const scopes = [
    'https://www.googleapis.com/auth/chat.spaces.readonly',
    'https://www.googleapis.com/auth/chat.messages.create',
    'https://www.googleapis.com/auth/userinfo.profile'
  ].join(' ');

  const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${targetClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scopes)}`;
  
  // Open popup
  const width = 500;
  const height = 600;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  
  window.open(
    oauthUrl,
    'Google Sign In',
    `width=${width},height=${height},left=${left},top=${top}`
  );
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string) => {
  cachedAccessToken = token;
};

export const fetchGoogleUserInfo = async (token: string): Promise<{ name: string; picture: string } | null> => {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch userinfo');
    const data = await res.json();
    googleUsername = data.name;
    googleAvatar = data.picture;
    return { name: data.name, picture: data.picture };
  } catch (err) {
    console.error('Failed to fetch Google user info:', err);
    return null;
  }
};

export const listGoogleChatSpaces = async (token: string): Promise<GoogleChatSpace[]> => {
  try {
    const res = await fetch('https://chat.googleapis.com/v1/spaces', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      throw new Error(`Google Chat Spaces fetch returned status: ${res.status}`);
    }
    const data = await res.json();
    return data.spaces || [];
  } catch (err) {
    console.error('Error fetching Google Chat Spaces:', err);
    throw err;
  }
};

export const postMessageToGoogleChat = async (token: string, spaceName: string, text: string): Promise<GoogleChatMessage | null> => {
  try {
    const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
    if (!res.ok) {
      throw new Error(`Post to Google Chat returned status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('Error posting message to Google Chat:', err);
    return null;
  }
};

export const logoutGoogle = () => {
  cachedAccessToken = null;
  googleUsername = null;
  googleAvatar = null;
};

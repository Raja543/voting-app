import crypto from 'crypto';

export interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token: string;
  refresh_token?: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
  given_name?: string;
  family_name?: string;
}

export interface TwitterTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface TwitterUserInfo {
  id: string;
  name: string;
  username: string;
  email?: string;
  profile_image_url: string;
  verified?: boolean;
  description?: string;
  location?: string;
  url?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

export class OAuth {
  static generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  static generateCodeChallenge(verifier: string): string {
    return crypto.createHash('sha256').update(verifier).digest('base64url');
  }

  // Google OAuth
  static getGoogleAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true'
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  static async exchangeGoogleCode(code: string): Promise<GoogleTokenResponse> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
      })
    });

    if (!response.ok) {
      throw new Error(`Google token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }

  static async getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    if (!response.ok) {
      throw new Error(`Google user info failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Twitter OAuth v2
  static getTwitterAuthUrl(state: string, codeVerifier: string): string {
    const codeChallenge = this.generateCodeChallenge(codeVerifier);
    
    const params = new URLSearchParams({
      client_id: process.env.TWITTER_CLIENT_ID!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/twitter`,
      response_type: 'code',
      scope: 'tweet.read users.read offline.access',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });
    return `https://twitter.com/i/oauth2/authorize?${params}`;
  }

  static async exchangeTwitterCode(code: string, codeVerifier: string): Promise<TwitterTokenResponse> {
    const auth = Buffer.from(
      `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/twitter`,
        code_verifier: codeVerifier
      })
    });

    if (!response.ok) {
      throw new Error(`Twitter token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }

  static async getTwitterUserInfo(accessToken: string): Promise<TwitterUserInfo> {
    const response = await fetch(
      'https://api.twitter.com/2/users/me?user.fields=verified,description,location,url,public_metrics,profile_image_url&expansions=pinned_tweet_id',
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    if (!response.ok) {
      throw new Error(`Twitter user info failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }
}

// OAuth error handling
export class OAuthError extends Error {
  constructor(
    message: string,
    public provider: string,
    public code?: string
  ) {
    super(message);
    this.name = 'OAuthError';
  }
}

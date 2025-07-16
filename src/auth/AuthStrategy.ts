import { AxiosInstance } from 'axios';

/**
 * Base interface for authentication strategies
 */
export interface AuthStrategy {
  /**
   * Get a valid access token for API requests
   */
  getAccessToken(): Promise<string>;
  
  /**
   * Configure axios instance with authentication
   */
  configureAxios(axios: AxiosInstance): void;
  
  /**
   * Check if credentials are valid
   */
  validateCredentials(): Promise<boolean>;
  
  /**
   * Get the authentication type name
   */
  getType(): string;
}

/**
 * OAuth 2.0 token response
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

/**
 * Stored token with metadata
 */
export interface StoredToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  tokenType: string;
}
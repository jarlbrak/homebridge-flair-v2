import axios, { AxiosInstance } from 'axios';
import { AuthStrategy, TokenResponse, StoredToken } from './AuthStrategy';
import { Logger } from 'homebridge';

/**
 * OAuth 2.0 Resource Owner Password Credentials Grant
 * This is the current authentication method used by Flair
 * NOTE: This grant type is deprecated in OAuth 2.1
 */
export class PasswordGrantStrategy implements AuthStrategy {
  private token?: StoredToken;
  private readonly baseURL = 'https://api.flair.co';
  private readonly scopes = [
    'structures.edit',
    'structures.view', 
    'pucks.view',
    'pucks.edit',
    'vents.view',
    'vents.edit',
    'users.view',
  ].join(' ');

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly username: string,
    private readonly password: string,
    private readonly log: Logger,
  ) {
    this.log.warn('Using deprecated OAuth 2.0 Resource Owner Password Credentials flow.');
    this.log.warn('This authentication method will be removed in future OAuth 2.1 implementations.');
    this.log.warn('Please contact Flair support about modern authentication options.');
  }

  async getAccessToken(): Promise<string> {
    if (this.token && this.isTokenValid()) {
      return this.token.accessToken;
    }

    if (this.token?.refreshToken) {
      try {
        await this.refreshToken();
        return this.token!.accessToken;
      } catch (error) {
        this.log.debug('Token refresh failed, obtaining new token');
      }
    }

    await this.obtainToken();
    return this.token!.accessToken;
  }

  configureAxios(axiosInstance: AxiosInstance): void {
    axiosInstance.interceptors.request.use(async (config) => {
      const token = await this.getAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const token = await this.getAccessToken();
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            this.log.error('Failed to refresh token:', refreshError);
            throw refreshError;
          }
        }
        
        return Promise.reject(error);
      },
    );
  }

  async validateCredentials(): Promise<boolean> {
    try {
      await this.obtainToken();
      return true;
    } catch (error) {
      this.log.error('Invalid credentials:', error);
      return false;
    }
  }

  getType(): string {
    return 'password';
  }

  private async obtainToken(): Promise<void> {
    try {
      const response = await axios.post<TokenResponse>(
        `${this.baseURL}/oauth/token`,
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          username: this.username,
          password: this.password,
          grant_type: 'password',
          scope: this.scopes,
        },
      );

      this.storeToken(response.data);
    } catch (error) {
      this.log.error('Failed to obtain access token:', error);
      throw new Error('Authentication failed');
    }
  }

  private async refreshToken(): Promise<void> {
    if (!this.token?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post<TokenResponse>(
        `${this.baseURL}/oauth/token`,
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.token.refreshToken,
          grant_type: 'refresh_token',
        },
      );

      this.storeToken(response.data);
    } catch (error) {
      this.log.error('Failed to refresh token:', error);
      throw new Error('Token refresh failed');
    }
  }

  private storeToken(tokenResponse: TokenResponse): void {
    const expiresAt = Date.now() + (tokenResponse.expires_in * 1000) - 20000; // 20 second buffer
    
    this.token = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt,
      tokenType: tokenResponse.token_type,
    };
  }

  private isTokenValid(): boolean {
    return this.token !== undefined && Date.now() < this.token.expiresAt;
  }
}
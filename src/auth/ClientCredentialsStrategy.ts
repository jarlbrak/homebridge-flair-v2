import axios, { AxiosInstance } from 'axios';
import { AuthStrategy, TokenResponse, StoredToken } from './AuthStrategy';
import { Logger } from 'homebridge';

/**
 * OAuth 2.0 Client Credentials Grant
 * This is the supported authentication method for Flair API
 */
export class ClientCredentialsStrategy implements AuthStrategy {
  private token?: StoredToken;
  private readonly baseURL = 'https://api.flair.co';
  
  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly log: Logger,
  ) {
    this.log.info('Using OAuth 2.0 Client Credentials flow for authentication');
  }

  async getAccessToken(): Promise<string> {
    if (this.token && this.isTokenValid()) {
      return this.token.accessToken;
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
            // Client credentials flow doesn't have refresh tokens
            // We need to get a new token
            this.token = undefined;
            const token = await this.getAccessToken();
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            this.log.error('Failed to obtain new token:', refreshError);
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
      this.log.error('Invalid client credentials:', error);
      return false;
    }
  }

  getType(): string {
    return 'client_credentials';
  }

  private async obtainToken(): Promise<void> {
    try {
      const response = await axios.post<TokenResponse>(
        `${this.baseURL}/oauth2/token`,
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
        },
      );

      this.storeToken(response.data);
      this.log.debug('Successfully obtained access token');
    } catch (error: any) {
      if (error.response?.data?.error === 'unsupported_grant_type') {
        this.log.error('Client credentials grant type not supported by Flair API');
        this.log.error('Please contact Flair support to verify OAuth 2.0 configuration');
      }
      this.log.error('Failed to obtain access token:', error.response?.data || error);
      throw new Error('Authentication failed');
    }
  }

  private storeToken(tokenResponse: TokenResponse): void {
    // Client credentials tokens typically don't include refresh tokens
    const expiresAt = Date.now() + (tokenResponse.expires_in * 1000) - 60000; // 1 minute buffer
    
    this.token = {
      accessToken: tokenResponse.access_token,
      expiresAt,
      tokenType: tokenResponse.token_type || 'Bearer',
    };
  }

  private isTokenValid(): boolean {
    return this.token !== undefined && Date.now() < this.token.expiresAt;
  }
}
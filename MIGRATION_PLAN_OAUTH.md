# Migration Plan: Flair OAuth 2.0 Authentication

## Current Authentication Analysis

### Current Implementation
- **Method**: OAuth 2.0 Resource Owner Password Credentials (ROPC) Grant
- **Required Credentials**:
  - Client ID (from Flair support)
  - Client Secret (from Flair support)
  - Username (user's Flair account)
  - Password (user's Flair account)
- **Library**: flair-api-ts v1.0.28 (last updated Feb 2022)
- **Security Issue**: ROPC grant type is deprecated in OAuth 2.1

### Problems with Current Approach
1. **Security Risk**: User passwords are stored in Homebridge config
2. **No MFA Support**: ROPC doesn't support multi-factor authentication
3. **Deprecated Standard**: OAuth 2.1 has officially deprecated this flow
4. **Library Outdated**: flair-api-ts hasn't been updated in 3 years

## OAuth 2.0 Migration Options

### Option 1: Client Credentials Flow (Recommended if Available)
**Pros:**
- No user passwords needed
- More secure for server-to-server communication
- Simpler configuration

**Cons:**
- Requires Flair API to support this flow
- May need different API endpoints

**Implementation:**
- Only clientId and clientSecret in config
- Direct token exchange without user credentials
- Need to verify with Flair if this is supported

### Option 2: Authorization Code Flow with PKCE
**Pros:**
- Most secure OAuth 2.0 flow
- Supports MFA
- Industry standard for user authorization

**Cons:**
- Complex implementation for Homebridge plugin
- Requires web browser for initial setup
- Token storage and refresh complexity

**Implementation:**
- Custom UI in Homebridge for OAuth flow
- Secure token storage
- Automatic token refresh

### Option 3: Device Authorization Grant (Device Flow)
**Pros:**
- Designed for devices without browsers
- Good UX for IoT devices
- No password storage

**Cons:**
- Requires Flair API support
- User needs to authorize via separate device

**Implementation:**
- Plugin provides code to user
- User authorizes on my.flair.co
- Plugin polls for token

## Recommended Migration Path

### Phase 1: Research and Discovery
1. **Contact Flair Support**
   - Inquire about supported OAuth 2.0 flows
   - Ask about Client Credentials flow availability
   - Request updated API documentation
   - Discuss deprecation timeline for ROPC

2. **Analyze flair-api-ts alternatives**
   - Fork and update the library
   - Create new TypeScript client
   - Use direct API calls with axios

3. **Test API endpoints**
   - Verify current endpoints still work
   - Test different OAuth flows if documented
   - Check for undocumented authentication methods

### Phase 2: Implementation Strategy

#### If Client Credentials is Available:
```typescript
// Simplified authentication
class FlairClient {
  async authenticate() {
    const tokenResponse = await axios.post('https://api.flair.co/oauth/token', {
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: 'read write'
    });
    return tokenResponse.data.access_token;
  }
}
```

#### If Only Authorization Code is Available:
1. **Implement Homebridge Custom UI**
   - Create OAuth flow in config.schema.json
   - Use @homebridge/plugin-ui-utils
   - Store tokens securely

2. **Token Management**
   - Implement refresh token logic
   - Handle token expiration
   - Secure storage using Homebridge API

#### Fallback: Enhanced ROPC (Temporary)
If no better option is available:
1. Add security warnings in documentation
2. Implement token caching to minimize password use
3. Plan deprecation timeline
4. Encrypt stored credentials

### Phase 3: Library Decision

#### Option A: Fork flair-api-ts
```bash
# Fork the repository
# Update OAuth implementation
# Publish as @homebridge/flair-api-ts
```

#### Option B: New Implementation
```typescript
// Direct API implementation
class FlairAPI {
  private axios: AxiosInstance;
  
  constructor(private auth: AuthStrategy) {
    this.axios = axios.create({
      baseURL: 'https://api.flair.co',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  async getVents(): Promise<Vent[]> {
    const token = await this.auth.getToken();
    const response = await this.axios.get('/vents', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}
```

## Migration Steps

### Step 1: Immediate Actions
1. Add deprecation notice for username/password auth
2. Document security concerns
3. Contact Flair for OAuth guidance

### Step 2: Short-term (1-2 weeks)
1. Implement token caching to reduce auth calls
2. Add optional OAuth flow if available
3. Update documentation with security best practices

### Step 3: Medium-term (1-2 months)
1. Implement preferred OAuth flow
2. Create migration guide for users
3. Maintain backward compatibility temporarily

### Step 4: Long-term (3-6 months)
1. Deprecate ROPC support
2. Remove username/password from config
3. Full OAuth 2.0 compliance

## Configuration Migration

### Current Configuration:
```json
{
  "clientId": "xxx",
  "clientSecret": "xxx",
  "username": "user@email.com",
  "password": "password123"
}
```

### Target Configuration (Client Credentials):
```json
{
  "clientId": "xxx",
  "clientSecret": "xxx"
}
```

### Target Configuration (Authorization Code):
```json
{
  "clientId": "xxx",
  "authToken": "stored_securely_by_homebridge"
}
```

## Risk Mitigation

1. **Backward Compatibility**
   - Support both auth methods during transition
   - Clear migration documentation
   - Automated migration where possible

2. **Security Considerations**
   - Never log tokens or credentials
   - Use Homebridge's secure storage
   - Implement proper token refresh

3. **User Experience**
   - Make migration as seamless as possible
   - Provide clear error messages
   - Offer migration assistance

## Success Criteria

- [ ] No user passwords stored in configuration
- [ ] Compliance with OAuth 2.1 standards
- [ ] Automatic token refresh working
- [ ] Migration guide published
- [ ] Zero authentication-related issues
- [ ] Improved security posture
- [ ] Maintained feature parity

## Timeline

- Week 1-2: Research and Flair communication
- Week 3-4: Prototype implementation
- Week 5-6: Testing and refinement
- Week 7-8: User migration and documentation
- Week 9+: Monitor and support migration
# Homebridge Flair v2 Project

## Project Overview
This is a revival of the homebridge-flair plugin that integrates Flair Smart Vents with HomeKit through Homebridge. The original plugin hasn't been updated in years and needs modernization to work with current versions of Homebridge and Flair's OAuth 2.0 authentication.

## Main Goals

### 1. Revive and Modernize the Plugin
- Update the plugin to work with the latest Homebridge version
- Ensure compatibility with current Node.js LTS versions
- Update all dependencies to their latest versions
- Fix any breaking changes or deprecated features

### 2. Update to Latest Homebridge Version
- Current plugin uses Homebridge >0.4.53 and Node >=10.17.0 (very outdated)
- Target compatibility: Homebridge ^1.6.0 || ^2.0.0-beta.0
- Update Node.js requirement to ^18.17.0 || ^20.0.0 || ^22.0.0
- Ensure the plugin follows current Homebridge best practices

### 3. Migrate to Flair OAuth 2.0
- Current implementation uses deprecated Resource Owner Password Credentials (ROPC) flow
- This OAuth 2.0 grant type is deprecated in OAuth 2.1
- Need to investigate alternative authentication methods supported by Flair
- Update or replace the flair-api-ts package (last updated 3 years ago)

### 4. Explore Enhanced Flair Device Features
- Research additional capabilities of Flair devices
- Implement new features that weren't previously available
- Improve the HomeKit integration experience
- Consider adding support for new Flair device types if available

## Technical Details

### Current Architecture
- **Plugin Type**: Dynamic Platform
- **Main Dependencies**: 
  - flair-api-ts (v1.0.28) - needs update or replacement
  - class-transformer & reflect-metadata for TypeScript
- **TypeScript**: Yes, with build process
- **Configuration**: Uses config.schema.json for Homebridge UI

### Supported Devices
- Flair Smart Vents
- Flair Pucks (temperature sensors and room thermostats)
- Structure thermostats

### Configuration Options
- Client credentials (ID & Secret)
- User credentials (username & password) - needs OAuth 2.0 migration
- Poll interval for API updates
- Various device visibility toggles
- Vent accessory type customization

## Development Commands
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run build        # Compile TypeScript
npm run watch        # Build and watch for changes
```

## Migration Priorities
1. Update package.json with modern Homebridge/Node requirements
2. Update all development dependencies
3. Test existing functionality with updated dependencies
4. Research and implement modern OAuth 2.0 authentication
5. Add new features based on current Flair API capabilities
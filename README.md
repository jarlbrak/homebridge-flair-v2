# homebridge-flair
[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)

[Flair Smart Vent](https://flair.co/products/vent) plug-in for [Homebridge](https://github.com/nfarina/homebridge) using the Flair API.


# Installation

<!-- 2. Clone (or pull) this repository from github into the same path Homebridge lives (usually `/usr/local/lib/node_modules`). Note: the code currently on GitHub is in beta, and is newer than the latest published version of this package on `npm` -->
1. Install homebridge using: `npm install -g homebridge`
2. Install this plug-in using: `npm install -g homebridge-flair`
3. Update your configuration file. See example `config.json` snippet below.

# Configuration

This plugin supports three authentication methods:

## OAuth 2.0 Password Grant (Recommended)

This is the recommended authentication method for personal use. Configuration sample (edit `~/.homebridge/config.json`):

```json
{
    "platforms": [
        {
            "authType": "password",
            "clientId": "your_client_id",
            "clientSecret": "your_client_secret",
            "username": "your_email@example.com",
            "password": "your_password",
            "pollInterval": 60,
            "platform": "Flair",
            "ventAccessoryType": "windowCovering"
        }
    ]
}
```

## OAuth 2.0 Client Credentials

This method is suitable for applications that don't require user-specific access:

```json
{
    "platforms": [
        {
            "authType": "client_credentials",
            "clientId": "your_client_id",
            "clientSecret": "your_client_secret",
            "pollInterval": 60,
            "platform": "Flair",
            "ventAccessoryType": "windowCovering"
        }
    ]
}
```

## Legacy Authentication (Deprecated)

⚠️ This method is deprecated and may be removed in future versions. Please migrate to OAuth 2.0.

```json
{
    "platforms": [
        {
            "authType": "legacy",
            "clientId": "client_id",
            "clientSecret": "client_secret",
            "username": "user",
            "password": "pass",
            "pollInterval": 60,
            "platform": "Flair",
            "ventAccessoryType": "windowCovering"
        }
    ]
}
```

# Obtaining Credentials

To use this plugin with OAuth 2.0, you'll need to obtain a client ID and client secret from Flair:

1. Create a Flair account at [my.flair.co](https://my.flair.co/) if you haven't already
2. Contact Flair support at [partners@flair.co](mailto:partners@flair.co) with:
   - Your registered email address
   - A request for OAuth 2.0 API credentials
   - Mention you're using the homebridge-flair plugin

Flair will provide you with:
- A Client ID
- A Client Secret

These credentials are tied to your registered email address, so make sure to use the same email in your configuration.

More [API docs and details](https://flair.co/api)

# Auto Vs Manual Mode

When you use Pucks with your setup the pucks will appear in the app as a Thermostat. 

~~If you turn those thermostats off it will put the Flair system into Manual mode. If you turn the thermostat to any other setting it will set your system to Flair's Auto mode.~~ As of Version 1.3.0 homekit does not do any switching from Auto to Manual mode. This must be done through the flair app, the Puck thermostats now respect the "off" setting.

# Vent Accessory Type

You can specify how vent accessories are shown in HomeKit with the `ventAccessoryType` property.

`windowCovering` - Window Covering
`fan` - Fan
`airPurifier` - Air Purifier
`hidden` - Hidden, this is useful if you have a puck in each room and want to only expose the room "thermostats"


### Commit format

Commits should be formatted as `type(scope): message`

The following types are allowed:

| Type | Description |
|---|---|
| feat | A new feature |
| fix | A bug fix |
| docs | Documentation only changes |
| style | Changes that do not affect the meaning of the code (white-space, formatting,missing semi-colons, etc) |
| refactor | A code change that neither fixes a bug nor adds a feature |
| perf | A code change that improves performance |
| test | Adding missing or correcting existing tests |
| chore | Changes to the build process or auxiliary tools and libraries such as documentation generation |

### Releasing

A new version is released when a merge or push to `main` occurs.

We use the rules at [default-release-rules.js](https://github.com/semantic-release/commit-analyzer/blob/master/lib/default-release-rules.js) as our guide to when a series of commits should create a release.

# Deployment Control

Use `DEPLOYMENT_ENABLED` to turn automatic deployments on or off.

## Enable Deployment

Leave the variable unset, or set:

```text
DEPLOYMENT_ENABLED=true
```

## Disable Deployment

Set one of these values in Netlify or Vercel environment variables:

```text
DEPLOYMENT_ENABLED=false
DEPLOYMENT_ENABLED=0
DEPLOYMENT_ENABLED=off
DEPLOYMENT_ENABLED=no
DEPLOYMENT_ENABLED=disabled
```

Netlify and Vercel both run `node scripts/deploy-gate.cjs` before building. Exit code `0` skips the build. Exit code `1` continues the build.

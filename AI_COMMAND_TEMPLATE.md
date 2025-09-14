# 🤖 AI Command Template & Deployment Guide

## ✅ Deployment Checklist

### Pre-Deployment

- [ ] Code review completed
- [ ] Unit/integration tests passing
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Environment variables configured

### Deployment Steps

```bash
# 1) Sync and verify
git pull origin main

# 2) Build
cd Panel
npm ci
npm run build

# 3) Push (Coolify auto-deploys)
cd ..
git push origin main
```

## 🚀 AI Commands

### Development

```bash
ai: create-component \
  --name LawyerDashboard \
  --type functional \
  --styling tailwind \
  --location src/components/lawyer/

ai: optimize-component \
  --file src/components/Dashboard.tsx \
  --metrics render-time,bundle-size
```

### Testing

```bash
ai: generate-tests \
  --component Dashboard \
  --coverage 90 \
  --framework jest

ai: generate-e2e \
  --flow user-registration \
  --framework cypress
```

### Deployment

```bash
ai: deploy-production \
  --platform coolify \
  --branch main \
  --env production \
  --checks tests,security,performance

ai: setup-environment \
  --env production \
  --secrets VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY \
  --domain avukat-bilgi-sistemi.hidlightmedya.tr
```

## 🔍 Monitoring & Verification

```bash
# Health
curl -I https://avukat-bilgi-sistemi.hidlightmedya.tr

# Logs
# (Coolify UI üzerinden)

# Performance
# lighthouse https://avukat-bilgi-sistemi.hidlightmedya.tr
```

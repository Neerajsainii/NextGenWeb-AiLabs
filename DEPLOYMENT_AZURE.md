# Azure Deployment (Single GitHub Actions Workflow)

Workflow file:
- `.github/workflows/azure-fullstack-deploy.yml`

## 1) GitHub Secrets and Variables

Set these in GitHub repo settings:

Secrets:
- `AZURE_STATIC_WEB_APPS_API_TOKEN`  
  If Azure auto-created one with suffix, workflow also supports:  
  `AZURE_STATIC_WEB_APPS_API_TOKEN_JOLLY_FIELD_033052100`
- `AZURE_WEBAPP_PUBLISH_PROFILE`

Variables:
- `AZURE_WEBAPP_NAME` (example: `next-backend`)

## 2) Frontend (Azure Static Web Apps)

App source path in workflow:
- `nextgen-frontend`

Set this in Static Web App configuration:
- `NEXT_PUBLIC_API_URL=https://<your-backend-app>.azurewebsites.net/api`

## 3) Backend (Azure Web App)

App package path in workflow:
- `nextgen-backend`

Procfile used:
- `nextgen-backend/Procfile`

Set these Azure Web App environment variables:
- `SECRET_KEY`
- `DEBUG=False`
- `ALLOWED_HOSTS=<your-backend-app>.azurewebsites.net,localhost,127.0.0.1`
- `DATABASE_URL=<your-postgres-connection-string>`
- `CORS_ALLOWED_ORIGINS=https://<your-frontend-app>.azurestaticapps.net`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_HOST_USER`
- `EMAIL_HOST_PASSWORD`
- `DEFAULT_FROM_EMAIL`
- `CONTACT_RECEIVER_EMAIL`

Required for build on deploy (Azure Web App Configuration):
- `SCM_DO_BUILD_DURING_DEPLOYMENT=true`
- `ENABLE_ORYX_BUILD=true`

## 4) Post-Deploy Django Commands (Run Once)

```bash
python manage.py migrate
python manage.py createsuperuser
```

# Azure Deployment (GitHub Actions)

## 1) Required GitHub Secrets

Create these repo secrets:

- `AZURE_STATIC_WEB_APPS_API_TOKEN`
- `AZURE_WEBAPP_NAME`
- `AZURE_WEBAPP_PUBLISH_PROFILE`

## 2) Frontend (Azure Static Web Apps)

Workflow file:
- `.github/workflows/frontend-azure-static-web-apps.yml`

Expected app path:
- `nextgen-frontend`

Set frontend environment variable in Static Web App:
- `NEXT_PUBLIC_API_URL=https://<your-backend-app>.azurewebsites.net/api`

## 3) Backend (Azure Web App)

Workflow file:
- `.github/workflows/backend-azure-webapp.yml`

App package path:
- `nextgen-backend`

Procfile:
- `nextgen-backend/Procfile`

Set these App Service environment variables:

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

## 4) Django Post-Deploy

Run once in Azure Web App SSH/Console:

```bash
python manage.py migrate
python manage.py createsuperuser
```

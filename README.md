# DI Lab Arxiv

## GitHub Actions Deploy

Required repository secrets:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_PRIVATE_KEY`

Deploy flow:

1. SSH into the server
2. `cd /home/hun/Desktop/DI_Lab_arxiv`
3. `git pull origin main`
4. `npm ci`
5. `npm run build`
6. `pm2 restart dilab-arxiv --update-env`

Server requirement:

- `nvm` must be installed
- Node must be `>=20.9.0`
- This repo uses `.nvmrc` with `22.22.0`

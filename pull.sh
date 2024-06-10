#!/bin/bash
cd /home/geniuscvmaker/htdocs/www.geniuscvmaker.com
pm2 stop all
pm2 delete all
pm2 save --force
#rm -rf .git
#rm -rf node_modules
#rm -rf .next
#git init
#git branch -m main
#git remote add geniuscvmaker https://github.com/jroblesluna/geniuscvmaker
#git fetch geniuscvmaker
#git reset --hard geniuscvmaker/main
#git branch --set-upstream-to=geniuscvmaker/main main
git pull
npm install
sed -i 's/showDefaultOption?: string;/showDefaultOption?: boolean;/g' node_modules/react-country-region-selector/index.d.ts
npm run build
pm2 start npm --name geniuscvmaker.com -- start
#pm2 start npm --name "cronTask" --cron "* * * * *" --no-autorestart --instances 1 -- run cronTask
pm2 save
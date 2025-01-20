#!/bin/bash
rm -rf .git
rm -rf node_modules
rm -rf .next
git init
git remote add geniuscvmaker https://github.com/jroblesluna/geniuscvmaker
git add .
git commit -m 'NEW'
git push --force geniuscvmaker main
npm install
npm build

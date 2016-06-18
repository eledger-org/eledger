#!/bin/bash -e

echo "=============MOCHA==============="
./node_modules/mocha/bin/mocha
echo "==============END================"

echo "=============ESLINT=============="
node ./node_modules/eslint/bin/eslint.js \
  controllers \
  index.js \
  example \
  models \
  mysqlc.js \
  router.js \
  test \
  util \

echo "Eslint passed."
echo "==============END================"

echo "==============FIN================"


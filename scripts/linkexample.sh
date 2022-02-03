#!/bin/bash

# Is this a workaround? I live using workarounds since '93

EX=${1:-base}

# rm -rf ./node_modules/react
# rm -rf ./node_modules/react-dom
# ln -s ../examples/${EX}/node_modules/react node_modules/react
# ln -s ../examples/${EX}/node_modules/react-dom node_modules/react-dom
# cd ./examples/${EX} && yarn link snext && cd ../../

rm -rf ./examples/${EX}/node_modules/react
rm -rf ./examples/${EX}/node_modules/react-dom
ln -s ../../../node_modules/react examples/${EX}/node_modules/react
ln -s ../../../node_modules/react-dom examples/${EX}/node_modules/react-dom
cd ./examples/${EX} && yarn link snext && chmod +x ./node_modules/.bin/snext  && cd ../../
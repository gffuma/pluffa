#!/bin/bash

# Is this a workaround? I live using workarounds since '93

EX=${1:-base}

rm -rf ./node_modules/react
rm -rf ./node_modules/react-dom
ln -s ../examples/${EX}/node_modules/react node_modules/react
ln -s ../examples/${EX}/node_modules/react-dom node_modules/react-dom
cd ./examples/${EX} && yarn link snext && cd ../../
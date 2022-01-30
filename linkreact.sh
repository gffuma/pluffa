#!/bin/bash

EX=base

rm -rf ./node_modules/react
rm -rf ./node_modules/react-dom
ln -s ../examples/${EX}/node_modules/react node_modules/react
ln -s ../examples/${EX}/node_modules/react-dom node_modules/react-dom

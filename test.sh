#!/usr/bin/env bash

PWD=$(pwd)
NPM=`which npm`

# Relies on mongo!
#cd $PWD/service
#$NPM test

cd $PWD/www
$NPM install
$NPM test

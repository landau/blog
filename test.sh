#!/usr/bin/env bash

PWD=$(pwd)
NPM=`which npm`

cd $PWD/service
$NPM test

cd $PWD/www
$NPM test

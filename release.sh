#!/usr/bin/env bash
VER=$(cat version.json | tr -d '"')
git ci -m "Release $VER"
git tag $VER -m "Release $VER" && git pm --follow-tags

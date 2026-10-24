#!/bin/sh
# Builds both versions: the group (zabkit.toml's members) and its individual variant (2312200.pdf).
cd "$(dirname "$0")"
zabkit sheet build .

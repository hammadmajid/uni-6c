#!/bin/sh
# Builds both versions: group (members from zabkit.toml, reg. nos. joined) and individual (2312200.pdf).
cd "$(dirname "$0")"
zabkit sheet build .
zabkit compile proposal.typ 2312200.pdf

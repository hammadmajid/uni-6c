#!/bin/sh
# Builds both versions: individual (2312200.pdf) and group (reg. nos. joined).
cd "$(dirname "$0")"
T="typst compile --root ../../.. --font-path /home/bine/Developer/uni/zabdocs --no-pdf-tags"
$T proposal.typ 2312200.pdf
$T --input group=true proposal.typ 2312200-2312458-2312421-2312412.pdf

#!/bin/sh
cd "$(dirname "$0")"
typst compile --root ../../.. --font-path /home/bine/Developer/uni/zabdocs --no-pdf-tags proposal.typ 2312200.pdf

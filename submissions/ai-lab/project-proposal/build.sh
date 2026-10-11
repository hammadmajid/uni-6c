#!/bin/sh
cd "$(dirname "$0")"
typst compile --root ../../.. --font-path /home/bine/Developer/uni/zabdocs --no-pdf-tags proposal.typ 2312200-2312458-2312421-2312412.pdf

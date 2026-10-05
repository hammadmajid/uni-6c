#!/bin/sh
# Runs each task, renders its terminal output to taskN.png, builds 2312200.pdf
cd "$(dirname "$0")"
ver=$(python3 --version | cut -d' ' -f2)
br=$(printf '\356\202\240')  # nerd font branch glyph
for n in 1 2 3 4 5; do
    out=$(python3 task$n.py | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
    cat > out.pango <<END
<span font="JetBrainsMono Nerd Font 15" foreground="#d7dae0"><span foreground="#e5c07b">❯</span> python3 <span foreground="#56b6c2" underline="single">task$n.py</span>
$out

<span foreground="#56b6c2"><b>ai</b></span> on <span foreground="#c678dd"><b>$br main</b></span> via <span foreground="#e5c07b"><b>🐍 v$ver</b></span> <span foreground="#61afef">as 🧙</span>
<span foreground="#e5c07b">❯</span>
</span>
END
    magick -background '#282c34' -density 144 pango:@out.pango \
        -bordercolor '#282c34' -border 24 task$n.png
done
rm out.pango
typst compile --root ../.. class-task-2.typ 2312200.pdf

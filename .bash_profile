#export PERL5LIB="/Applications/Xcode.app/Contents/Developer/Library/Perl/5.12/darwin-thread-multi-2level"

alias showfiles='defaulexects write com.apple.finder AppleShowAllFiles True;killall Finder'
alias hidefiles='defaults write com.apple.finder AppleShowAllFiles false;killall Finder'

export EDITOR=vim

# {{{
# Node Completion - Auto-generated, do not touch.
shopt -s progcomp
for f in $(command ls ~/.node-completion); do
  f="$HOME/.node-completion/$f"
  test -f "$f" && . "$f"
done
# }}}

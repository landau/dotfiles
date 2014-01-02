export PERL5LIB="/Applications/Xcode.app/Contents/Developer/Library/Perl/5.12/darwin-thread-multi-2level"


export PATH="$PATH":`pwd`/depot_tools

export PS1="\[\e[1;34m\]\w$\[\e[m\]:"

# {{{
# Node Completion - Auto-generated, do not touch.
shopt -s progcomp
for f in $(command ls ~/.node-completion); do
  f="$HOME/.node-completion/$f"
  test -f "$f" && . "$f"
done
# }}}

if [ -f `brew --prefix`/etc/bash_completion.d/git-completion.bash ]; then
. `brew --prefix`/etc/bash_completion.d/git-completion.bash
fi

alias showfiles='defaulexects write com.apple.finder AppleShowAllFiles True;killall Finder'
alias hidefiles='defaults write com.apple.finder AppleShowAllFiles false;killall Finder'

export EDITOR=vim
source ~/.nvm/nvm.sh
. `brew --prefix`/etc/profile.d/z.sh

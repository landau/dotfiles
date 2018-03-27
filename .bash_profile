#export PERL5LIB="/Applications/Xcode.app/Contents/Developer/Library/Perl/5.12/darwin-thread-multi-2level"

alias showfiles='defaulexects write com.apple.finder AppleShowAllFiles True;killall Finder'
alias hidefiles='defaults write com.apple.finder AppleShowAllFiles false;killall Finder'

export EDITOR=vim

export NVM_DIR="/Users/tlandau/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm

[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm" # Load RVM into a shell session *as a function*


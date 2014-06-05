#export PERL5LIB="/Applications/Xcode.app/Contents/Developer/Library/Perl/5.12/darwin-thread-multi-2level"

alias showfiles='defaulexects write com.apple.finder AppleShowAllFiles True;killall Finder'
alias hidefiles='defaults write com.apple.finder AppleShowAllFiles false;killall Finder'

export EDITOR=vim

export MANTA_URL='https://us-east.manta.joyent.com'
export MANTA_USER='condenast'
export MANTA_KEY_ID=$(ssh-keygen -l -f $HOME/.ssh/id_rsa.pub | awk '{print $2}')

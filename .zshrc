# Path to your oh-my-zsh configuration.
ZSH=$HOME/.oh-my-zsh
export PATH=/usr/local/bin:$PATH

# Set name of the theme to load.
# Look in ~/.oh-my-zsh/themes/
# Optionally, if you set this to "random", it'll load a random theme each
# time that oh-my-zsh is loaded.
#ZSH_THEME="robbyrussell"
ZSH_THEME="minimal"
#ZSH_THEME="doubleend"

# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"s

# Set to this to use case-sensitive completion
# CASE_SENSITIVE="true"

# Uncomment this to disable bi-weekly auto-update checks
# DISABLE_AUTO_UPDATE="true"

# Uncomment to change how often before auto-updates occur? (in days)
# export UPDATE_ZSH_DAYS=13

# Uncomment following line if you want to disable colors in ls
# DISABLE_LS_COLORS="true"

# Uncomment following line if you want to disable autosetting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment following line if you want to disable command autocorrection
# DISABLE_CORRECTION="true"

# Uncomment following line if you want red dots to be displayed while waiting for completion
COMPLETION_WAITING_DOTS="true"

# Uncomment following line if you want to disable marking untracked files under
# VCS as dirty. This makes repository status check for large repositories much,
# much faster.
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Which plugins would you like to load? (plugins can be found in ~/.oh-my-zsh/plugins/*)
# Custom plugins may be added to ~/.oh-my-zsh/custom/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
plugins=(git node npm nvm github git-extras brew osx python z)


# Customize to your needs...
#export PATH=$PATH:/Users/tlandau/.nvm/v0.11.12/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/Users/tlandau/nvm/v0.10.26/bin:/Users/tlandau/depot_tools:/Users/tlandau/depot_tools

export PATH=$PATH:/Users/tlandau/.nvm/v0.10.26/bin:/Users/tlandau/.nvm/v0.11.12/bin
#export PATH=$PATH:/Users/tlandau/.nvm/v0.11.12/bin
[[ -s $HOME/.nvm/nvm.sh ]] && . $HOME/.nvm/nvm.sh # This loads NVM


cdpath=(~/web ~/work ~/oss)

alias solr="cd ~/Downloads/solr-4.6.0/example/ && java -jar start.jar"
#alias snow=clear;while :;do echo $LINES $COLUMNS $(($RANDOM%$COLUMNS));sleep 0.1;done|gawk '{a[$3]=0;for(x in a) {o=a[x];a[x]=a[x]+1;printf "\033[%s;%sH ",o,x;printf "\033[%s;%sH*\033[0;0H",a[x],x;}}'
alias cnpm="npm --reg https://condenast.npmjitsu.co --always-auth=true --strict-ssl=false"
alias npmr="npm run"

# JSON post curl function
function jsonpost {
  curl -X POST -H "Content-Type: application/json" -d $1 $2
}

# JSON put curl function
function jsonput {
  curl -X PUT -H "Content-Type: application/json" -d $1 $2
}

function httpcodes {
  node -p "require('http').STATUS_CODES"
}

export EDITOR=vim
alias showfiles='defaulexects write com.apple.finder AppleShowAllFiles True;killall Finder'
alias hidefiles='defaults write com.apple.finder AppleShowAllFiles false;killall Finder'
alias lt='open -a /Applications/LightTable/LightTable.app'
alias dash='open dash://'
alias cgit='ctags  -f ./.git/tags .'

alias npmre='rm -rf node_modules && npm i'
alias npm-pre='npm run pretest'
alias nodetst='nodemon --exec "npm tst --silent"'

alias yt='youtube-dl -t'
alias ytmp3='youtube-dl --audio-format=mp3 -x -t'

alias gitrb='git rebase -i head~'

alias pgres='postgres -D /usr/local/var/postgres'

export CI_MONGO="mongodb://copilot-ci-srv01.conde.io:10650/test"

source $ZSH/oh-my-zsh.sh


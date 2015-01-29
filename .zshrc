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

#[[ -s $HOME/.nvm/nvm.sh ]] && . $HOME/.nvm/nvm.sh # This loads NVM
source ~/.nvm/nvm.sh

export PATH=$PATH:/Users/tlandau/oss/clojurescript/bin

cdpath=(~/web ~/work ~/oss)

export PATH=$PATH:/usr/local/bin
alias solr="cd ~/work/solr-config && vagrant up solr --provision"
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

function tagrelease {
  v=$(cat package.json | python -c 'import sys, json; print json.load(sys.stdin)["version"]')
  git tag $v -m "Release $v"
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

alias grb='git rebase -i head~'

alias pgres='postgres -D /usr/local/var/postgres'

CLJS='/Users/tlandau/oss/clojurescript'
alias cljsrepl="$CLJS/script/repljs"

export CI_MONGO="mongodb://copilot-ci-srv01.conde.io:10650/test"

source $ZSH/oh-my-zsh.sh

# <--------- Cool Functions by Crouse-------->
# Cool Functions for your .bashrc file.

# Weather by us zip code - Can be called two ways # weather 50315 # weather "Des Moines"
weather ()
{
declare -a WEATHERARRAY
WEATHERARRAY=( `lynx -dump "http://www.google.com/search?hl=en&lr=&client=firefox-a&rls=org.mozilla%3Aen-US%3Aofficial&q=weather+${1}&btnG=Search" | grep -A 5 -m 1 "Weather for"`)
echo ${WEATHERARRAY[@]}
}

# Stock prices - can be called two ways. # stock novl  (this shows stock pricing)  #stock "novell"  (this way shows stock symbol for novell)
stock ()
{
stockname=`lynx -dump http://finance.yahoo.com/q?s=${1} | grep -i ":${1})" | sed -e 's/Delayed.*$//'`
stockadvise="${stockname} - delayed quote."
declare -a STOCKINFO
STOCKINFO=(` lynx -dump http://finance.yahoo.com/q?s=${1} | egrep -i "Last Trade:|Change:|52wk Range:"`)
stockdata=`echo ${STOCKINFO[@]}`
	if [[ ${#stockname} != 0 ]] ;then
		echo "${stockadvise}"
		echo "${stockdata}"
			else
			stockname2=${1}
			lookupsymbol=`lynx -dump -nolist http://finance.yahoo.com/lookup?s="${1}" | grep -A 1 -m 1 "Portfolio" | grep -v "Portfolio" | sed 's/\(.*\)Add/\1 /'`
				if [[ ${#lookupsymbol} != 0 ]] ;then
				echo "${lookupsymbol}"
					else
					echo "Sorry $USER, I can not find ${1}."
				fi
	fi
}

#Translate a Word  - USAGE: translate house spanish  # See dictionary.com for available languages (there are many).
translate ()
{
TRANSLATED=`lynx -dump "http://dictionary.reference.com/browse/${1}" | grep -i -m 1 -w "${2}:" | sed 's/^[ \t]*//;s/[ \t]*$//'`
if [[ ${#TRANSLATED} != 0 ]] ;then
	echo "\"${1}\" in ${TRANSLATED}"
	else
	echo "Sorry, I can not translate \"${1}\" to ${2}"
fi
}

# Define a word - USAGE: define dog
define ()
{
lynx -dump "http://www.google.com/search?hl=en&q=define%3A+${1}&btnG=Google+Search" | grep -m 3 -w "*"  | sed 's/;/ -/g' | cut -d- -f1 > /tmp/templookup.txt
			if [[ -s  /tmp/templookup.txt ]] ;then	
				until ! read response
					do
					echo "${response}"
					done < /tmp/templookup.txt
				else
					echo "Sorry $USER, I can't find the term \"${1} \""				
			fi	
rm -f /tmp/templookup.txt
}
alias aquamacs='open /Applications/Aquamacs.app/'
TERM=xterm-256color
source ~/.oh-my-zsh/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh 
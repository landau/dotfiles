# Path to your oh-my-zsh configuration.
ZSH=$HOME/.oh-my-zsh
export PATH=/usr/local/bin:$PATH
export PATH=$PATH:/Users/tlandau/oss/clojurescript/bin
export PATH=$PATH:/usr/local/bin
export PATH=/Users/tlandau/dev/mongo3.2.1/bin:$PATH
export EDITOR=vim
export LEIN_FAST_TRAMPOLINE=y
TERM=xterm-256color
ulimit -n 2560

# Set name of the theme to load. Look in ~/.oh-my-zsh/themes/
ZSH_THEME="minimal"

source ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh 
source ~/.nvm/nvm.sh
source ~/.work
source $ZSH/oh-my-zsh.sh

# Example aliases

# Set to this to use case-sensitive completion
# CASE_SENSITIVE="true"

# Uncomment this to disable bi-weekly auto-update checks
# DISABLE_AUTO_UPDATE="true"

# Uncomment to change how often before auto-updates occur? (in days)
export UPDATE_ZSH_DAYS=5

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
plugins=(git nyan node npm nvm github git-extras brew osx python z web-search)

cdpath=(~/web ~/work ~/oss)

alias brw="brew"
alias cljs='cd ~/clojurescript && ./script/noderepljs'
alias cljsbuild="lein trampoline cljsbuild $@"
alias grb='git rebase -i head~'
alias showfiles='defauls write com.apple.finder AppleShowAllFiles -boolean true;killall Finder'
alias hidefiles='defaults write com.apple.finder AppleShowAllFiles -boolean false;killall Finder'
alias trash='rm -rf ~/.Trash/*'
alias mongod='sudo mongod --fork --logpath /var/log/mongodb.log'
alias nodet='nodemon --exec "npm tst --silent"'
alias nodeyun="nodemon -x 'node . | ./node_modules/.bin/bunyan'"
alias npmr="npm run"
alias npmre='rm -rf node_modules && npm i'
alias pgres='postgres -D /usr/local/var/postgres'
alias pp='underscore print --color'
alias tree="tree -I 'node_modules'"
alias yt='youtube-dl -t'
alias ytmp3='youtube-dl --audio-format=mp3 -x -t'
alias zshconfig="vim ~/.zshrc"

# JSON post curl function
function jsonpost {
  curl -X POST -H "Content-Type: application/json" -d $1 $2
}

# JSON put curl function
function jsonput {
  curl -X PUT -H "Content-Type: application/json" -d $1 $2
}

function postphoto {
  curl -sX POST -F "file=@$1" $2/photos
}

function tagrelease {
  v=$(cat package.json | python -c 'import sys, json; print json.load(sys.stdin)["version"]')
  git ci -m "Release $v"
  git tag $v -a -m "Release $v"
}

function httpcodes {
  cmd="require('http').STATUS_CODES"
  if [ "$#" -eq "0" ]; then
    node -p $cmd
  else
    node -p $cmd | grep $1
  fi
}

function validateyaml {
  name=$1
  if [ "$#" -eq 0 ]; then
    name="*"
  fi

  find . -name $name".yaml" -print -exec ruby -e "require 'yaml'; YAML.parse(File.open('{}'))" \;
}

function tojson {
  python -m json.tool $1
}

function versions {
  npm view $1 versions
}

function setversion {
  json=$(node -p "var j = require('./package.json'); j.version = '$1'; JSON.stringify(j, null, '  ');")
  echo $json > package.json
}

function setdep {
  json=$(node -p "var j = require('./package.json'); j.dependencies['$1'] = '$2'; JSON.stringify(j, null, '  ');" )
  echo $json > package.json
}

function pkgupdate {
  VERSION=$1
  
  shift
  for i in "$@"; do
    module=`echo $i | cut -d \~ -f 1`
    ver=`echo $i | cut -d \~ -f 2`
    setdep $module $ver
  done
  
  git add package.json 
  git ci -m "use $(echo $@ | tr \~ \@)"

  # TODO exit if
  if [ $? -ne 0 ]; then
    echo "Failed to commit"
  else
    setversion $VERSION
    git add package.json
    tagrelease
  fi
}

function sc {
  osascript -e 'tell application id "com.apple.ScreenSaver.Engine" to launch'
}

function slp {
  osascript -e 'tell application "Finder" to sleep'
}

function breath {
  DELAY=600
  BREAK=15
  while true; do
    sleep $DELAY; # sleep 10 minutes
    osascript -e 'display notification "Where are you right now?" with title "Breath and Relax for 15 seconds"'
    sleep $BREAK; # Come back in N seconds
    osascript -e 'display notification "Back to life" with title "Next check-in in 10 minutes"'
  done
}

function killbreath {
  kill %$(jobs | grep breath | cut -c 2-2)
}

# <--------- Cool Functions by Crouse-------->
# Cool Functions for your .bashrc file.

# Weather by us zip code - Can be called two ways # weather 50315 # weather "Des Moines"
weather () {
  declare -a WEATHERARRAY
  WEATHERARRAY=( `lynx -dump "http://www.google.com/search?hl=en&lr=&client=firefox-a&rls=org.mozilla%3Aen-US%3Aofficial&q=weather+${1}&btnG=Search" | grep -A 5 -m 1 "Weather for"`)
  echo ${WEATHERARRAY[@]}
}

# Stock prices - can be called two ways. # stock novl  (this shows stock pricing)  #stock "novell"  (this way shows stock symbol for novell)
stock () {   
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
translate () {
  TRANSLATED=`lynx -dump "http://dictionary.reference.com/browse/${1}" | grep -i -m 1 -w "${2}:" | sed 's/^[ \t]*//;s/[ \t]*$//'`
  if [[ ${#TRANSLATED} != 0 ]] ;then
    echo "\"${1}\" in ${TRANSLATED}"
  else
    echo "Sorry, I can not translate \"${1}\" to ${2}"
  fi
}

# Define a word - USAGE: define dog
define () {
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


# --- Camera lazeeeeehhhh


function opencam {
  cd /Volumes/NO\ NAME/DCIM/100OLYMP
  open *.JPG
}

function copycam {
  DIR=~/Photography/$(date "+%b\ %e,\ %Y") 
  echo mkdir -p $DIR
  mkdir -p $DIR

  cd /Volumes/NO\ NAME/DCIM/100OLYMP

  for p in $(find . -name "*.JPG" | cut -c 3- | cut -c -8); do 
   #echo cp $p.ORF $DIR; 
   cp $p.ORF $DIR; 
  done

  cd $DIR
  open .
}

function purgecam {
  rm -v /Volumes/NO\ NAME/DCIM/100OLYMP/*
}


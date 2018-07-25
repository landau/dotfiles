#d Path to your oh-my-zsh configuration.
ZSH=$HOME/.oh-my-zsh
export PATH=/usr/local/bin:$PATH
#export PATH=$PATH:/Users/tlandau/oss/clojurescript/bin
export PATH=$PATH:/usr/local/bin
export PATH=/Users/tlandau/dev/mongo3.4.2/bin:$PATH
export EDITOR=vim
#export LEIN_FAST_TRAMPOLINE=y
export CLICOLOR=1
export TERM=xterm-256color
ulimit -n 2560

# Enable persistent REPL history for `node`.
export NODE_REPL_HISTORY=~/.node_history;
# Allow 32³ entries; the default is 1000.
export NODE_REPL_HISTORY_SIZE='32768';

# Increase Bash history size. Allow 32³ entries; the default is 500.
export HISTSIZE='32768';
export HISTFILESIZE="${HISTSIZE}";
export SAVEHIST="${HISTSIZE}";

# Set name of the theme to load. Look in ~/.oh-my-zsh/themes/
ZSH_THEME="minimal"

source ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh 
source ~/.work
source $ZSH/oh-my-zsh.sh

#source ~/.nvm/nvm.sh

lazynvm() {
  #unset -f nvm node npm
  export NVM_DIR=~/.nvm
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
}

set -a NODE_GLOBALS
NODE_GLOBALS=(`find ~/.nvm/versions/node -maxdepth 3 -type l -wholename '*/bin/*' | xargs -n1 basename | sort | uniq`)

NODE_GLOBALS+=("node")
NODE_GLOBALS+=("nvm")

for cmd in "${NODE_GLOBALS[@]}"; do
  eval "${cmd}(){ unset -f ${NODE_GLOBALS}; lazynvm; ${cmd} \$@ }"
done

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
plugins=(zsh-autosuggestions git nyan node npm nvm github git-extras brew osx python z web-search)

cdpath=(~/web ~/work ~/oss)

function weather {
  curl http://wttr.in/$1
}

alias brw="brew"
alias cljs='cd ~/clojurescript && ./script/noderepljs'
alias cljsbuild="lein trampoline cljsbuild $@"
alias grb='git rebase -i head~'
alias showfiles='defauls write com.apple.finder AppleShowAllFiles -boolean true;killall Finder'
alias hidefiles='defaults write com.apple.finder AppleShowAllFiles -boolean false;killall Finder'
alias trash='rm -rf ~/.Trash/*'
alias mongod='sudo mongod --fork --logpath /var/log/mongodb.log'
#alias mongod='sudo mongod --fork'
alias nodet='nodemon --exec "npm tst --silent"'
alias nodeyun="nodemon -x 'node . | ./node_modules/.bin/bunyan'"
alias npmr="npm run"
alias npmre='rm package-lock.json && rm -rf node_modules && npm i'
alias pgres='postgres -D /usr/local/var/postgres'
alias pp='underscore print --color'
alias tree="tree -I 'node_modules'"
alias yt='youtube-dl -o "%(title)s.%(ext)s"'
alias ytmp3='youtube-dl --audio-format=mp3 -x -o "%(title)s.%(ext)s"'
alias zshconfig="vim ~/.zshrc"
alias openchrome='open -a "Google Chrome"'
alias open-gh-socket='ssh -M git@github.com'
alias weatherct="weather 06825"
alias weathernyc="weather nyc"

function clone {
  git clone gitgithub.com:$1/$2.git
}

# JSON post curl function
function jsonpost {
  curl -sX POST -H "Content-Type: application/json" -d $1 $2
}

# JSON put curl function
function jsonput {
  curl -sX PUT -H "Content-Type: application/json" -d $1 $2
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
  #python -m json.tool $1
  jq -Mr $1
}

function npm_versions {
  npm view $1 versions
}

function dep_to_changelog {
  d=$(date +%F | tr '-' '.')
  ver=$(getversion $1)
  line=${2:=2}
  text=$(git --no-pager log -$line --oneline | tail -1 | cut -d ' ' -f 2-)
  echo -e "$d, $ver\n* $text\n\n$(cat CHANGELOG.md)" > CHANGELOG.md
}

function changelog_to_version {
  version=$1
  git ci -m 'Update CHANGELOG' -- CHANGELOG.md
  npm version $version 
  git pm --follow-tags
}

function getversion {
  semver=$1

  if [ "major" = "$semver" ]; then
    echo $(getversionmaj)
    return
  fi

  if [ "minor" = "$semver" ]; then
    echo $(getversionminor)
    return
  fi

  if [ "patch" = "$semver" ]; then
    echo $(getversionpatch)
    return
  fi

  echo "No such semver: $semver"
  exit 1
}

function inc {
  n1=$1
  n2="1"
  echo $(($n1+$n2))
}

function getversionmaj {
  ver=$(jq -r '.version' package.json)
  maj=$(echo $ver | cut -d '.' -f 1)
  maj=$(inc $maj)
  echo "$maj.0.0"
}

function getversionminor {
  ver=$(jq -r '.version' package.json)

  minor=$(echo $ver | cut -d '.' -f 2)
  minor=$(inc $minor)
  ver=$(echo $ver | cut -d '.' -f 1)
  echo "$ver.$minor.0"
}

function getversionpatch {
  ver=$(jq -r '.version' package.json)

  patch=$(echo $ver | cut -d '.' -f 3)
  patch=$(inc $patch)
  ver=$(echo $ver | cut -d '.' -f 1-2)
  echo "$ver.$patch"
}

function setdep {
  json=$(node -p "var j = require('./package.json'); j.dependencies['$1'] = '$2'; JSON.stringify(j, null, '  ');" )
  echo $json > package.json
}

function setdevdep {
  json=$(node -p "var j = require('./package.json'); j.devDependencies['$1'] = '$2'; JSON.stringify(j, null, '  ');" )
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


function setkeyrepeat {
  # normal is 15 (225 ms)
  defaults write -g InitialKeyRepeat -int 10 
  #normal is 2 (30 ms)
  defaults write -g KeyRepeat -int 1 
}


function ssh-multi() {
	#HOSTS=${HOSTS:=$*}
	setopt shwordsplit
	HOSTS=${HOSTS:=$*}

	if [ -z "$HOSTS" ]; then
		echo -n "You need to supply ips"
		return # read HOSTS
	fi

	hosts=(${=HOSTS})
	target="ssh-multi $hosts[1]"
	session_name=$(uuidgen)

	tmux new -d -s "$session_name"
	tmux new-window -n "$target" ssh $hosts[1]

	echo $hosts[2,-1]

	for i in $hosts[2,-1]; do
		tmux split-window -t :"$target" -h  "ssh -oStrictHostKeyChecking=no -o ConnectTimeout=2 -o ConnectionAttempts=2 $i"
		tmux select-layout -t :"$target" tiled > /dev/null
	done

	#tmux select-pane -t 0
	tmux set-window-option -t :"$target"  synchronize-panes on > /dev/null
	tmux attach-session -t "$session_name"
}

mssh() {
	tmux rename-window ${1};
	active_window=`tmux list-windows | grep active | cut -d: -f1`;
	pane=`tmux list-panes -t ${active_window} | grep active | cut -d: -f1`;
	tmux select-layout tiled;
	tmux setw synchronize-panes on;
	echo "Current window.pane is ${active_window}.${pane}";

	machines="";
	first_machine="";

	setopt shwordsplit
	HOSTS=$*
	hosts=(${=HOSTS})

	for connHost in $hosts; do
		echo "* Adding host '${connHost}'";
		if (test -z "$first_machine")
		then
			first_machine="$connHost";
		else
			machines="$machines $connHost";
		fi
	done

	echo $first_machine
	echo $machines
	for m in $machines
	do
		#tmux new-window -n "$m" "tmux join-pane -d -t ${active_window}.${pane} ; tmux select-layout -t ${active_window} tiled; ssh -oStrictHostKeyChecking=no $m";	
		tmux new-window -n "$m" "tmux join-pane -d -t ${active_window}.${pane} ; tmux select-layout -t ${active_window} tiled; ssh -oStrictHostKeyChecking=no $m";	
	done;

	ssh -oStrictHostKeyChecking=no $first_machine;
}

function speed {
  pv --line-mode --average-rate >/dev/null
}



# --- Camera lazeeeeehhhh


function opencam {
  cd /Volumes/Untitled/DCIM/100OLYMP
  open *.JPG
}

function copycam {
  DIR=~/Photography/$(date "+%b\ %e,\ %Y") 
  echo mkdir -p $DIR
  mkdir -p $DIR

  cd /Volumes/Untitled/DCIM/100OLYMP

  for p in $(find . -name "*.JPG" | cut -c 3- | cut -c -8); do 
   #echo cp $p.ORF $DIR; 
   cp $p.ORF $DIR; 
  done

  cd $DIR
  open .
}

function purgecam {
  rm -v /Volumes/Untitled/DCIM/100OLYMP/*
}

function togif {
	palette="/tmp/palette.png"
  scale=$3
  scale=${scale:=320}

	filters="fps=15,scale=$scale:-1:flags=lanczos"

	ffmpeg -v warning -i $1 -vf "$filters,palettegen" -y $palette
	ffmpeg -v warning -i $1 -i $palette -lavfi "$filters [x]; [x][1:v] paletteuse" -y $2
}



# -- Java
export JAVA_HOME=$(/usr/libexec/java_home)
TOMCAT_DIR=/Library/Tomcat/bin
alias tomstart=$TOMCAT_DIR/startup.sh
alias tomstop=$TOMCAT_DIR/shutdown.sh

export PATH="$PATH:$HOME/.rvm/bin" # Add RVM to PATH for scripting
export PATH="/usr/local/opt/elasticsearch@2.4/bin:$PATH"


OATH_KEY_HOME="$HOME/Documents"

function oauth {
  if [ -f $OATH_KEY_HOME/$1 ]
    then
      CODE=$(oathtool --totp -b -d 6 `cat $OATH_KEY_HOME/$1`)
      if [ `uname` = 'Darwin' ]
        then
          echo -n $CODE | pbcopy # Comment out if you don't want the
                                 # OTP to be automatically copied to
                                 # the clipboard on Mac OS X
      fi
      echo "$CODE"
  else
    echo "No key specified, or key not found."
    echo "Available keys:"
    ls $OATH_KEY_HOME
  fi
}

alias dynamo="cd /Users/tlandau/Downloads/dynamodb_local_latest && java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# added by travis gem
[ -f /Users/tlandau/.travis/travis.sh ] && source /Users/tlandau/.travis/travis.sh

### GITHUB
function unwatch_repo {
  echo "Unwatching repo $1..."
  curl -XDELETE -s  -HAuthorization:"bearer $GHUB_TOKEN" https://api.github.com/repos/$1/subscription
}


function deleteBranch {
  echo "Deleting branch $2 for $1"
  orgAndRepo=$1
  ref=$2
  curl -fsXDELETE -HAuthorization:"bearer $GHUB_TOKEN" https://api.github.com/repos/$orgAndRepo/git/refs/heads/$ref
}

function merge_pr {
  urlPath=$(echo $1 | cut -d "/" -f4- | sed "s/pull/pulls/")

  if [ -z "$2" ]; then
    echo "Approving PR @ $1"
    res=$(curl -sfXPOST -HAuthorization:"bearer $GHUB_TOKEN" https://api.github.com/repos/$urlPath/reviews -d '{"event":"APPROVE"}')

    if [ 0 -ne $? ]; then
      echo "Failed to approve pull request" 
      echo $res
      return 1
    fi
  fi

  echo "Merging PR @ $1"
  res=$(curl -sfXPUT -HAuthorization:"bearer $GHUB_TOKEN" https://api.github.com/repos/$urlPath/merge)

  if [ 0 -ne $? ]; then
    echo "Failed to merge pull request" 
    echo $res
    return 1
  fi

  orgAndRepo=$(echo $urlPath | cut -d "/" -f -2)
  ref=$(curl -sf -HAuthorization:"bearer $GHUB_TOKEN" https://api.github.com/repos/$urlPath | jq -Mr ".head.ref")
  deleteBranch $orgAndRepo $ref
}

function giphy {
  curl -s 'https://www.graphqlhub.com/graphql' -H 'origin: https://www.graphqlhub.com' -H'content-type: application/json' -H 'accept: */*' -H 'authority: www.graphqlhub.com' --data-binary '{"query":"{\n  giphy {\n\t\trandom(tag:\"$1\") {\n      images {\n        original {\n          url\n        }\n      }\n  \t}\n  }\n}","variables":"null","operationName":null}'  | jq -Mr '.data.giphy.random.images.original.url'
}

### IMGCAT
# tmux requires unrecognized OSC sequences to be wrapped with DCS tmux;
# <sequence> ST, and for all ESCs in <sequence> to be replaced with ESC ESC. It
# only accepts ESC backslash for ST. We use TERM instead of TMUX because TERM
# gets passed through ssh.
function print_osc() {
    if [[ $TERM == screen* ]] ; then
        printf "\033Ptmux;\033\033]"
    else
        printf "\033]"
    fi
}

# More of the tmux workaround described above.
function print_st() {
    if [[ $TERM == screen* ]] ; then
        printf "\a\033\\"
    else
        printf "\a"
    fi
}

# print_image filename inline base64contents print_filename
#   filename: Filename to convey to client
#   inline: 0 or 1
#   base64contents: Base64-encoded contents
#   print_filename: If non-empty, print the filename
#                   before outputting the image
function print_image() {
    print_osc
    printf '1337;File='
    if [[ -n "$1" ]]; then
      printf 'name='`printf "%s" "$1" | base64`";"
    fi

    VERSION=$(base64 --version 2>&1)
    if [[ "$VERSION" =~ fourmilab ]]; then
      BASE64ARG=-d
    elif [[ "$VERSION" =~ GNU ]]; then
      BASE64ARG=-di
    else
      BASE64ARG=-D
    fi

    printf "%s" "$3" | base64 $BASE64ARG | wc -c | awk '{printf "size=%d",$1}'
    printf ";inline=$2"
    printf ":"
    printf "%s" "$3"
    print_st
    printf '\n'
    if [[ -n "$4" ]]; then
      echo $1
    fi
}

function error() {
    echo "ERROR: $*" 1>&2
}

function show_help() {
    echo "Usage: imgcat [-p] filename ..." 1>& 2
    echo "   or: cat filename | imgcat" 1>& 2
}

function check_dependency() {
  if ! (builtin command -V "$1" > /dev/null 2>& 1); then
    echo "imgcat: missing dependency: can't find $1" 1>& 2
    exit 1
  fi
}


function imgcat {
  if [ -t 0 ]; then
      has_stdin=f
  else
      has_stdin=t
  fi
  
  # Show help if no arguments and no stdin.
  if [ $has_stdin = f -a $# -eq 0 ]; then
      show_help
      exit
  fi
  
  check_dependency awk
  check_dependency base64
  check_dependency wc
  
  # Look for command line flags.
  while [ $# -gt 0 ]; do
      case "$1" in
      -h|--h|--help)
          show_help
          exit
          ;;
      -p|--p|--print)
          print_filename=1
          ;;
      -u|--u|--url)
          check_dependency curl
          encoded_image=$(curl -s "$2" | base64) || (error "No such file or url $2"; exit 2)
          has_stdin=f
          print_image "$2" 1 "$encoded_image" "$print_filename"
          set -- ${@:1:1} "-u" ${@:3}
          if [ "$#" -eq 2 ]; then
              exit
          fi
          ;;
      -*)
          error "Unknown option flag: $1"
          show_help
          exit 1
        ;;
      *)
          if [ -r "$1" ] ; then
              has_stdin=f
              print_image "$1" 1 "$(base64 < "$1")" "$print_filename"
          else
              error "imgcat: $1: No such file or directory"
              exit 2
          fi
          ;;
      esac
      shift
  done
  
  # Read and print stdin
  if [ $has_stdin = t ]; then
      print_image "" 1 "$(cat | base64)" ""
  fi
  
  exit 0
}

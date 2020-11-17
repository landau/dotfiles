#export PERL5LIB="/Applications/Xcode.app/Contents/Developer/Library/Perl/5.12/darwin-thread-multi-2level"

export PATH="$HOME/bin:$PATH";
export PATH=/usr/local/bin:$PATH
export PATH="$HOME/dev/mongodb-4.2.5/bin:$PATH"

#export PATH=$PATH:$(go env GOPATH)/bin

# Some bits I don't use so much anymore
#export PATH=/Users/tlandau/dev/kafka/bin:$PATH
#export PATH=/Users/tlandau/dev/zookeeper/bin:$PATH

export CLICOLOR=1
export TERM=xterm-256color

# Add default node to path
export PATH=$HOME/.nvm/versions/node/v14.2.0/bin:$PATH

# Add RVM to PATH for scripting. Make sure this is the last PATH variable change.
export PATH="$PATH:$HOME/.rvm/bin"

ulimit -n 2560

# Load the shell dotfiles, and then some:
# * ~/.path can be used to extend `$PATH`.
# * ~/.extra can be used for other settings you don’t want to commit.
for file in ~/.{bash_prompt,exports,aliases,functions,github,work,extra}; do
	[ -r "$file" ] && [ -f "$file" ] && source "$file";
done
unset file;

# Load files from work dir
# This dir is uncommited as it may contain unsafe values ¯\_(ツ)_/¯
WORK_DIR=~/.work
if [[ -d "${WORK_DIR}" ]]; then
  for file in $(ls ${WORK_DIR}); do
    file="${WORK_DIR}/${file}"
    [ -r "$file" ] && [ -f "$file" ] && source "$file";
  done
fi

# Case-insensitive globbing (used in pathname expansion)
shopt -s nocaseglob;

# History
# Increase Bash history size. Allow 64^4 entries; the default is 500.
export HISTSIZE='16777216'
export HISTFILESIZE="${HISTSIZE}";

# Omit duplicates and commands that begin with a space from history.
export HISTCONTROL='ignoreboth:erasedups';

# Append to the Bash history file, rather than overwriting it
shopt -s histappend;

# Save and reload the history after each command finishes
export PROMPT_COMMAND="history -a; history -c; history -r; $PROMPT_COMMAND"

# Autocorrect typos in path names when using `cd`
shopt -s cdspell;

# Enable some Bash 4 features when possible:
# * `autocd`, e.g. `**/qux` will enter `./foo/bar/baz/qux`
# * Recursive globbing, e.g. `echo **/*.txt`
for option in autocd globstar; do
	shopt -s "$option" 2> /dev/null;
done;

# Add tab completion for many Bash commands
if which brew &> /dev/null && [ -r "$(brew --prefix)/etc/profile.d/bash_completion.sh" ]; then
	# Ensure existing Homebrew v1 completions continue to work
	export BASH_COMPLETION_COMPAT_DIR="$(brew --prefix)/etc/bash_completion.d";
	source "$(brew --prefix)/etc/profile.d/bash_completion.sh";
elif [ -f /etc/bash_completion ]; then
	source /etc/bash_completion;
fi;

# Add tab completion for SSH hostnames based on ~/.ssh/config, ignoring wildcards
[ -e "$HOME/.ssh/config" ] && complete -o "default" -o "nospace" -W "$(grep "^Host" ~/.ssh/config | grep -v "[?*]" | cut -d " " -f2- | tr ' ' '\n')" scp sftp ssh;

# Add tab completion for `defaults read|write NSGlobalDomain`
# You could just use `-g` instead, but I like being explicit
# What is this?
#complete -W "NSGlobalDomain" defaults;

# Add `killall` tab completion for common apps
complete -o "nospace" -W "Dock Finder iTunes SystemUIServer Terminal" killall;

# TODO: find a good home for the following items
[[ -r "/usr/local/etc/profile.d/bash_completion.sh" ]] && . "/usr/local/etc/profile.d/bash_completion.sh"

# This loads nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" --no-use 

# Load RVM into a shell session *as a function*
[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm" 

# fzf completion and key bindings
[ -f ~/.fzf.bash ] && source ~/.fzf.bash 

# Git completion
if [ -f ~/.git-completion ]; then
  source ~/.git-completion
fi

# rbenv
eval "$(rbenv init -)"

#export PERL5LIB="/Applications/Xcode.app/Contents/Developer/Library/Perl/5.12/darwin-thread-multi-2level"

# Homebrew has to come first. /opt/homebrew is not in /etc/paths, so nothing
# below here can find `brew` (or $HOMEBREW_PREFIX) until this has run.
#
# These are `brew shellenv`'s own exports, inlined. `eval "$(brew shellenv)"`
# cost ~20ms per shell because it spawns brew *and* path_helper (shellenv now
# delegates PATH to `path_helper -s` with PATH_HELPER_ROOT set). All that
# path_helper contributes here is /opt/homebrew/{bin,sbin} from
# /opt/homebrew/etc/paths, so prepending them directly is equivalent. MANPATH
# needs no entry: macOS `man` derives share/man from each PATH directory.
if [ -x /opt/homebrew/bin/brew ]; then
	export HOMEBREW_PREFIX="/opt/homebrew"
	export HOMEBREW_CELLAR="/opt/homebrew/Cellar"
	export HOMEBREW_REPOSITORY="/opt/homebrew"
	export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"
	export INFOPATH="/opt/homebrew/share/info:${INFOPATH:-}"
elif [ -x /usr/local/bin/brew ]; then
	# Intel prefix. Left as the eval, since it's the untested path here.
	eval "$(/usr/local/bin/brew shellenv)"
fi

# Every line below *prepends*, so the effective precedence is bottom-up: the
# last one to run ends up first in $PATH. Read this block in reverse.
export PATH="$HOME/bin:$PATH";
export PATH=/usr/local/bin:$PATH

# /usr/local is the *Intel* Homebrew prefix; Apple silicon uses /opt/homebrew
# and is handled by the shellenv eval above. Harmless to keep for a dual boot
# or an older machine.
export PATH="/usr/local/sbin:$PATH"
# Also re-added idempotently by ~/.local/bin/env on the last line of this file.
export PATH="$HOME/.local/bin:$PATH"

# Colourises BSD (macOS) `ls`, equivalent to passing `-G`. Only fires when
# stdout is a tty, so it can't corrupt `$(ls ...)`. Colours come from
# $LSCOLORS / $LS_COLORS, both set in ~/.aliases. Never set CLICOLOR_FORCE —
# that colourises into pipes too.
export CLICOLOR=1

# Load the shell dotfiles, and then some:
# * ~/.path can be used to extend `$PATH`.
# * ~/.extra can be used for other settings you don’t want to commit.
# Brace expansion builds the list, so order here is load order — .bash_prompt
# first because later files depend on things it defines (e.g. $colorflag).
# The `-f` test means a *directory* in this list is silently skipped, which is
# how ~/.work falls through to the block below.
for file in ~/.{bash_prompt,exports,aliases,functions,github,work,extra}; do
	[ -r "$file" ] && [ -f "$file" ] && source "$file";
done
# `file` is a plain loop variable, not local to anything — unset it so it
# doesn't leak into the interactive shell.
unset file;

# Load files from work dir. ~/.work is not symlinked on a personal machine, so
# this whole block is inert there; it only does anything on a work laptop.
WORK_DIR=~/.work
if [[ -d "${WORK_DIR}" ]]; then
  file="${WORK_DIR}/exports"
  [ -r "$file" ] && [ -f "$file" ] && source "$file";
  file="${WORK_DIR}/aliases.sh"
  [ -r "$file" ] && [ -f "$file" ] && source "$file";
  file="${WORK_DIR}/functions.sh"
  [ -r "$file" ] && [ -f "$file" ] && source "$file";
fi

# Case-insensitive globbing (used in pathname expansion)
shopt -s nocaseglob;

# History
# Increase Bash history size. Allow 128^4 entries; the default is 500.
# HISTSIZE is the in-memory list, HISTFILESIZE the on-disk one. Bash holds the
# whole in-memory list per shell, so absurd values here are not free.
export HISTSIZE='268435456'
export HISTFILESIZE="${HISTSIZE}";

# Omit duplicates and commands that begin with a space from history.
# `ignoreboth` = ignorespace + ignoredups (consecutive dupes only);
# `erasedups` additionally strips *older* matching entries anywhere in history.
export HISTCONTROL='ignoreboth:erasedups';

# Append to the Bash history file, rather than overwriting it
shopt -s histappend;

# Save and reload the history after each command finishes
#export PROMPT_COMMAND="history -a; history -c; history -r; $PROMPT_COMMAND"
# For some reason the history setup above began to compltely overwite history :(
# This happened after increasing histfilesize to 128^6
# Why: `history -c` wipes the in-memory list and `history -r` reloads it from
# disk on *every* prompt. Combined with erasedups and a huge HISTFILESIZE that
# rewrites the file constantly, and any truncation gets written back as truth.
# `history -a` alone just appends the new entry, which is the safe half.
export PROMPT_COMMAND="history -a; $PROMPT_COMMAND"

# Autocorrect typos in path names when using `cd`
shopt -s cdspell;

# Enable some Bash 4 features when possible:
# * `autocd` — a bare directory name acts as `cd` into it
# * `globstar` — recursive globbing, e.g. `echo **/*.txt`
# Both live since 2026-08-18, when the login shell became brew's bash 5.3.15.
# Under Apple's /bin/bash 3.2.57 (they won't ship GPLv3) these are "invalid
# shell option name" and the 2>/dev/null silently swallows the error -- which is
# why the redirect stays: this file still has to run under 3.2 on a fresh
# machine, before brew-install.sh has installed bash 5.
for option in autocd globstar; do
	shopt -s "$option" 2> /dev/null;
done;

# Add tab completion for many Bash commands
# $HOMEBREW_PREFIX is set by the shellenv eval at the top of this file.
if [ -r "${HOMEBREW_PREFIX}/etc/profile.d/bash_completion.sh" ]; then
	# Ensure existing Homebrew v1 completions continue to work
	# ($BASH_COMPLETION_COMPAT_DIR is where v1-style completion files live;
	# bash-completion v2 loads them from there for backwards compatibility.)
	export BASH_COMPLETION_COMPAT_DIR="${HOMEBREW_PREFIX}/etc/bash_completion.d";
	source "${HOMEBREW_PREFIX}/etc/profile.d/bash_completion.sh";
fi;

# Add tab completion for SSH hostnames based on ~/.ssh/config, ignoring wildcards
# Pipeline: pull `Host` lines -> drop any containing ? or * (patterns, not real
# hosts) -> strip the `Host ` keyword -> one name per line. Evaluated once at
# startup, so new hosts need a new shell. Does not follow `Include` directives.
[ -e "$HOME/.ssh/config" ] && complete -o "default" -o "nospace" -W "$(grep "^Host" ~/.ssh/config | grep -v "[?*]" | cut -d " " -f2- | tr ' ' '\n')" scp sftp ssh;

# Add tab completion for `defaults read|write NSGlobalDomain`
# You could just use `-g` instead, but I like being explicit
# What is this? -> it would make `defaults <TAB>` suggest the one domain name
# you type most; disabled because bash-completion already completes `defaults`.
#complete -W "NSGlobalDomain" defaults;

# Add `killall` tab completion for common apps
complete -o "nospace" -W "Dock Finder iTunes SystemUIServer Terminal" killall;

# This loads nvm. `--no-use` keeps startup fast; a full `nvm use default`
# costs ~500ms per shell.
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
	\. "$NVM_DIR/nvm.sh" --no-use
	[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

	# Put the default node on PATH ourselves, since `--no-use` activates nothing.
	# Honour the `default` alias when it names a concrete version; otherwise it
	# means "latest" (`node`, `lts/*`), so resolve that to the newest installed.
	nvm_default="$(cat "$NVM_DIR/alias/default" 2>/dev/null)"
	case "$nvm_default" in
		v[0-9]*|[0-9]*)
			# Written bare or with a leading v; normalise to the `vX.Y.Z` that
			# names the directory under versions/node.
			nvm_default="v${nvm_default#v}" ;;
		*)
			# Globbed rather than `ls`: the .aliases `ls` alias carries a colour
			# flag, and `printf` is a builtin so no alias can reach it.
			# `sort -V` not `sort` — plain sort ranks v24.9.0 above v24.16.0.
			nvm_default="$(printf '%s\n' "$NVM_DIR"/versions/node/v* | sort -V | tail -1)"
			nvm_default="${nvm_default##*/}" ;;
	esac
	# The -d test also covers the no-versions-installed case, where the glob
	# above stays unexpanded and leaves a literal `v*`.
	if [ -n "$nvm_default" ] && [ -d "$NVM_DIR/versions/node/$nvm_default/bin" ]; then
		export PATH="$NVM_DIR/versions/node/$nvm_default/bin:$PATH"
	fi
	unset nvm_default
fi

# Git completion
# Not from Homebrew — this is a vendored copy of git's contrib/completion
# script, committed to the dotfiles repo as ~/.git-completion.
if [ -f ~/.git-completion ]; then
  source ~/.git-completion
fi

# Installed by iTerm2 > Install Shell Integration. Provides the shell-aware
# features (marks, command status, `imgcat`) and emits OSC 1337 escapes at each
# prompt, which is why non-tty captures of a login shell look noisy.
test -e "${HOME}/.iterm2_shell_integration.bash" && source "${HOME}/.iterm2_shell_integration.bash"

if [ -f ~/.config/exercism/exercism_completion.bash ]; then
  source ~/.config/exercism/exercism_completion.bash
fi

# The next two blocks are boilerplate written by the gcloud installer, which
# was pointed at ~/Downloads/dev rather than a more usual prefix.
# The next line updates PATH for the Google Cloud SDK.
if [ -f "$HOME/Downloads/dev/google-cloud-sdk/path.bash.inc" ]; then . "$HOME/Downloads/dev/google-cloud-sdk/path.bash.inc"; fi

# The next line enables shell command completion for gcloud.
if [ -f "$HOME/Downloads/dev/google-cloud-sdk/completion.bash.inc" ]; then . "$HOME/Downloads/dev/google-cloud-sdk/completion.bash.inc"; fi

# Written by the `uv` installer (alongside uv/uvx/poetry in ~/.local/bin). All
# it does is add ~/.local/bin to $PATH if absent, so it's a no-op here given
# the export near the top — kept so removing that line can't break uv.
[ -f "$HOME/.local/bin/env" ] && . "$HOME/.local/bin/env"

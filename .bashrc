# On macOS every terminal tab is a login shell, so ~/.bash_profile is the
# canonical config and this file is only reached by non-login interactive
# shells (`bash` as a subshell, `docker exec -it ... bash`, some IDE
# terminals). Keep it a shim — a second copy of anything here will drift.
[ -n "$PS1" ] && [ -f ~/.bash_profile ] && . ~/.bash_profile

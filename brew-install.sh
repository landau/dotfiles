#!/usr/bin/env bash

set -e

if ! command -v brew &> /dev/null
then
    echo "Homebrew could not be found, installing now..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Apple silicon installs to /opt/homebrew, which isn't on PATH yet.
    [ -x /opt/homebrew/bin/brew ] && eval "$(/opt/homebrew/bin/brew shellenv)"
else
    echo "Homebrew is already installed."
fi

brew update

formulae=(
    # shell
    # macOS ships bash 3.2.57 (2007) because Apple won't ship GPLv3. That
    # version silently ignores bracketed paste (pasted multi-line text
    # self-executes), globstar/`**`, autocd, skip-completed-text and
    # colored-stats, and bash-completion@2 refuses to load on it at all.
    # bash 5 + @2 is the whole point; see the /etc/shells step below.
    bash
    bash-completion@2

    # search / files
    ripgrep
    rsync
    tree
    watch

    # git / github
    gh

    # dev
    golangci-lint
    jq
    k6
    terraform
    yarn

    # networking / security
    cloudflared
    gnupg
    openssh
    step

    # media
    ffmpeg
    imagemagick
    yt-dlp
)

casks=(
    1password-cli
    ngrok
    shortcat
)

brew install "${formulae[@]}"
brew install --cask "${casks[@]}"

# Register brew's bash as a legal login shell. chsh refuses any shell not
# listed in /etc/shells, and none of the bash 5 features above reach a login
# shell until it is the login shell. Left as a printed instruction rather than
# run automatically -- changing someone's login shell should be deliberate.
brew_bash="$(brew --prefix)/bin/bash"
if [ -x "${brew_bash}" ] && ! grep -qxF "${brew_bash}" /etc/shells; then
    echo "Adding ${brew_bash} to /etc/shells (sudo)..."
    echo "${brew_bash}" | sudo tee -a /etc/shells > /dev/null
fi
if [ "${SHELL}" != "${brew_bash}" ]; then
    echo
    echo "To finish, make it your login shell:  chsh -s ${brew_bash}"
    echo "Then open a new terminal tab."
fi

brew cleanup

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
    # v1, not @2: @2 needs bash >= 4.2 and pulls in brew's bash as a dependency,
    # while macOS ships bash 3.2.
    bash-completion

    # search / files
    ripgrep
    rsync
    tree
    watch

    # git / github
    gh
    hub

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

brew cleanup

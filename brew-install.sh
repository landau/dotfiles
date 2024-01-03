#!/usr/bin/env bash

set -e

if ! command -v brew &> /dev/null
then
    echo "Homebrew could not be found, installing now..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "Homebrew is already installed."
fi


brew install ffmpeg gnupg gobject-introspection grpcui grpcurl guile jpeg k6 ripgrep rsync tree watch yt-dlp ack jq


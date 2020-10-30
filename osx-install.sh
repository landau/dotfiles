#!/usr/bin/env bash

DEV_TOOLS_DIR=~/.dev-tools
mkdir -p $DEV_TOOLS_DIR
pushd $DEV_TOOLS_DIR

#git clone https://github.com/VundleVim/Vundle.vim.git ~/.vim/bundle/Vundle.vim
#vim +PluginInstall +qall

echo "Installing hub..."
HUB_FILENAME=hub-darwin-amd64-2.14.2
git clone \
  --config transfer.fsckobjects=false \
  --config receive.fsckobjects=false \
  --config fetch.fsckobjects=false \
  https://github.com/github/hub.git
pushd hub
sudo make install prefix=/usr/local
popd
rm -rf hub
echo "Finished installing hub"



popd

#!/usr/bin/env bash

DEV_TOOLS_DIR=~/.dev-tools
mkdir -p $DEV_TOOLS_DIR
pushd $DEV_TOOLS_DIR

############################################
# --- Allow keyrepeat
#defaults write NSGlobalDomain ApplePressAndHoldEnabled -bool false
############################################

############################################
# --- Install Vundle and vim plugins
#git clone https://github.com/VundleVim/Vundle.vim.git ~/.vim/bundle/Vundle.vim
#vim +PluginInstall +qall
############################################

############################################
# --- Install hub
#echo "Installing hub..."
#HUB_FILENAME=hub-darwin-amd64-2.14.2
#git clone \
#  --config transfer.fsckobjects=false \
#  --config receive.fsckobjects=false \
#  --config fetch.fsckobjects=false \
#  https://github.com/github/hub.git
#pushd hub
#sudo make install prefix=/usr/local
#popd
#rm -rf hub
#echo "Finished installing hub"
############################################

############################################
# --- Install nvm
#curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.36.0/install.sh | bash
############################################

############################################
# --- Install ack
#curl https://beyondgrep.com/ack-v3.4.0 > ~/bin/ack && chmod 0755 ~/bin/ack
############################################

###########################################
# --- Install tree
#mkdir tree
#curl -sL --retry 3 --insecure "http://mama.indstate.edu/users/ice/tree/src/tree-1.8.0.tgz" | tar xz --no-same-owner --strip-components=1 -C tree
#pushd tree
#
## To configure the source to be compiled for macOS run the following commands:
#sed -i '' -e 's/^CFLAGS/#CFLAGS/' Makefile
#sed -i '' -e '/SIP/,/HP/{//!s/#//;}' Makefile
#
#make
#sudo make install
#sudo chmod -x /usr/share/man/man1/tree.1
#
#popd
#rm -rf tree
###########################################

# TODO: install jq, aws-cli

popd

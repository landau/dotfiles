#!/usr/bin/env bash

set -e

DEV_TOOLS_DIR=~/.dev-tools
mkdir -p $DEV_TOOLS_DIR
pushd $DEV_TOOLS_DIR

############################################
# --- Allow keyrepeat
#defaults write NSGlobalDomain ApplePressAndHoldEnabled -bool false
# For VS Code
#defaults write com.microsoft.VSCode ApplePressAndHoldEnabled -bool false              
# For VS Code Insider
#defaults write com.microsoft.VSCodeInsiders ApplePressAndHoldEnabled -bool false      
# For VS Codium
#defaults write com.visualstudio.code.oss ApplePressAndHoldEnabled -bool false         
# For VS Codium Exploration users
#defaults write com.microsoft.VSCodeExploration ApplePressAndHoldEnabled -bool false   
#defaults delete -g ApplePressAndHoldEnabled
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
mkdir tree
curl -sL --retry 3 --insecure "http://mama.indstate.edu/users/ice/tree/src/tree-1.8.0.tgz" | tar xz --no-same-owner --strip-components=1 -C tree
pushd tree

# To configure the source to be compiled for macOS run the following commands:
sed -i '' -e 's/^CFLAGS/#CFLAGS/' Makefile
sed -i '' -e '/SIP/,/HP/{//!s/#//;}' Makefile

make
sudo make install
sudo chmod -x /usr/share/man/man1/tree.1

popd
rm -rf tree
###########################################


############################################
# --- Install jq
#curl -sL https://github.com/stedolan/jq/releases/download/jq-1.6/jq-osx-amd64 > ~/bin/jq \
#  && chmod 0755 ~/bin/jq
############################################

############################################
# --- Install ngix
# https://gist.github.com/landau/24ef753e78070d138cda0a27ddd690d7

# Get nginx
#curl -OL http://nginx.org/download/nginx-1.12.2.tar.gz
#tar -xvzf nginx-1.12.2.tar.gz && rm nginx-1.12.2.tar.gz
#
## Get PCRE for http_rewrite
#curl -OL https://ftp.pcre.org/pub/pcre/pcre-8.41.tar.gz
#tar xvzf pcre-8.41.tar.gz && rm pcre-8.41.tar.gz
#
## Compile WITHOUT SSL
#pushd nginx-1.12.2/
#./configure --with-pcre=../pcre-8.41/
#sudo make && sudo make install
#popd
#
##Remember to add to path export PATH="/usr/local/nginx/sbin:$PATH"
#
#popd
############################################

############################################
# --- Install siege
# https://jasonmccreary.me/articles/installing-siege-mac-os-x-lion/


#curl -C - -O http://download.joedog.org/siege/siege-latest.tar.gz
#tar -xvf siege-latest.tar.gz
#cd siege-*
## FIXME: one of these needs to run in sudo
#./configure
#make
#make install

############################################

############################################
# --- Install terraform
#
#curl -OL https://releases.hashicorp.com/terraform/0.11.15/terraform_0.11.15_darwin_amd64.zip
#unzip terraform_0.11.15_darwin_amd64.zip -d ~/bin
#rm -v terraform_0.11.15_darwin_amd64.zip

############################################

popd

set nocompatible              " be iMproved, required
filetype off                  " required

" set the runtime path to include Vundle and initialize
set rtp+=~/.vim/bundle/Vundle.vim

call vundle#begin()
" alternatively, pass a path where Vundle should install plugins
"call vundle#begin('~/some/path/here')

" let Vundle manage Vundle, required
Plugin 'gmarik/Vundle.vim'

" GHub plugins
Plugin 'tpope/vim-fugitive'
Plugin 'tpope/vim-surround'
Plugin 'tpope/vim-sensible'
"Plugin 'powerline/powerline'
Bundle 'powerline/powerline', {'rtp': 'powerline/bindings/vim/'}
Plugin 'kien/ctrlp.vim'

Plugin 'jnurmine/Zenburn'
Plugin 'altercation/vim-colors-solarized'
Plugin 'kien/rainbow_parentheses.vim'

Plugin 'scrooloose/syntastic'
Plugin 'walm/jshint.vim'

Plugin 'tpope/vim-markdown'
Plugin 'pangloss/vim-javascript'
Plugin 'mxw/vim-jsx'
Plugin 'elzr/vim-json'
Plugin 'tpope/vim-jdaddy' "json manip
Plugin 'myhere/vim-nodejs-complete'

" All of your Plugins must be added before the following line
call vundle#end()            " required

filetype plugin indent on    " required
" To ignore plugin indent changes, instead use:
"filetype plugin on
"
" Brief help
" :PluginList       - lists configured plugins
" :PluginInstall    - installs plugins; append `!` to update or just :PluginUpdate
" :PluginSearch foo - searches for foo; append `!` to refresh local cache
" :PluginClean      - confirms removal of unused plugins; append `!` to auto-approve removal
"
" see :h vundle for more details or wiki for FAQ
" Put your non-Plugin stuff after this line


set t_co=256
set background="dark"
let g:solarized_termcolors=256

" Navigation (Do you have mouse enabled in your term?)
set mouse=a

" powerline 
" python from powerline.vim import setup as powerline_setup
" python powerline_setup()
" python del powerline_setup

set guifont=Source\ Code\ Pro:h12
set paste
set number
set incsearch
set hlsearch
set showtabline=2
set history=1000
runtime macros/matchit.vim
set title
set scrolloff=3
set ruler
syntax enable

"let g:solarized_contrast="high"
"let g:solarized_visibility="high"
"colorscheme solarized
colorscheme zenburn

" showmatch: Show the matching bracket for the last ')'?
set showmatch

"filetype off " off for vundle
"filetype plugin on
"filetype indent on
"filetype plugin indent on

autocmd FileType php set omnifunc=phpcomplete#CompletePHP
autocmd FileType javascript set omnifunc=javascriptcomplete#CompleteJS
autocmd FileType html set omnifunc=htmlcomplete#CompleteTags

" Set backspace config
set backspace=eol,start,indent
set ignorecase
set visualbell t_vb=
set wildmenu

" Use Vim settings, rather then Vi settings (much better!).
set nocompatible

" highlight strings inside C comments
let c_comment_strings=1
let mapleader = "`"

let g:jsCommand='node'

" for the TOhtml command
"let html_use_css=1

" Backup
set nobackup
set nowb
set noswapfile

" Formating
set ai "Auto indent
set si "Smart indet
set ts=2  " Tab spacing
set sw=2
set smarttab
set expandtab
set colorcolumn=100

" Set 'comments' to format dashed lists in comments.
setlocal comments=sO:*\ -,mO:*\ \ ,exO:*/,s1:/*,mb:*,ex:*/,://

" Allow backspace to back over lines
set backspace=2

func! Cwd()
  let cwd = getcwd()
  return "e " . cwd
endfunc

"set list listchars=tab:»-,trail:·,extends:»,precedes:«

autocmd vimenter * if !argc() | NERDTree | endif
map <leader>n :NERDTreeToggle<CR>

augroup MYVIMRC
    au!
    au BufWritePost .vimrc so $MYVIMRC
augroup END

set wildignore+=*/tmp/*,*.so,*.swp,*.zip,*.json,*.log,*/node_modules/*,*/target/*     " MacOSX/Linux

"let g:ctrlp_custom_ignore = '\v[\/]\.(git|hg|svn)$'

let g:ctrlp_working_path_mode = 'ra'
let g:ctrlp_custom_ignore = {
  \ 'dir':  '\v[\/]\.(git|hg|svn|target)',
  \ 'file': '\v\.(exe|so|dll)$',
  \ 'link': 'some_bad_symbolic_links',
  \ }


" clojure-static
let g:paredit_electric_return = 0
autocmd FileType *.clj setlocal let g:clojure_fuzzy_indent = 1
autocmd FileType *.clj setlocal let g:clojure_fuzzy_indent_patterns = ['^with', '^def', '^let', '^defn']
autocmd FileType *.clj setlocal let g:clojure_fuzzy_indent_blacklist = ['-fn$', '\v^with-%(meta|out-str|loading-context)$']

"let g:rbpt_max = 16
"let g:rbpt_loadcmd_toggle = 0
let g:rbpt_max = 21

augroup rainbow_parentheses
  au!
  au VimEnter * RainbowParenthesesActivate
  au BufEnter * RainbowParenthesesLoadRound
  au BufEnter * RainbowParenthesesLoadSquare
  au BufEnter * RainbowParenthesesLoadBraces
augroup END

" rainbow_parentheses toggle
nnoremap <silent> <Leader>r :call rainbow_parentheses#toggle()<CR>

" paredit for all langs
"g:paredit_mode = 0
autocmd FileType *.js setlocal let g:paredit_mode = 1
autocmd FileType *.clj setlocal let g:paredit_mode = 1
au FileType *.clj call PareditInitBuffer()

" pressing < or > will let you indent/unident selected lines
vnoremap < <gv
vnoremap > >gv


" folding settings
" za zm zr
set foldmethod=indent   "fold based on indent
set foldnestmax=10      "deepest fold is 10 levels
set nofoldenable        "dont fold by default
set foldlevel=1         "this is just what i use

" Make p in Visual mode replace the selected text with the "" register.
vnoremap p <Esc>:let current_reg = @"<CR>gvs<C-R>=current_reg<CR><Esc>

map <leader>e :Eval<CR>

" Handle trailing whitespace, shamelessly taken from http://vimcasts.org/episodes/tidying-whitespace/
function! <SID>StripTrailingWhitespaces()
    " Preparation: save last search, and cursor position.
    let _s=@/
    let l = line(".")
    let c = col(".")
    " Do the business:
    %s/\s\+$//e
    " Clean up: restore previous search history, and cursor position
    let @/=_s
    call cursor(l, c)
endfunction

" clear whitespace
nnoremap <silent> <leader>w :let _s=@/<Bar>:%s/\s\+$//e<Bar>:let @/=_s<Bar>:nohl<CR>
"nnoremap <silent> <leader>w :call <SID>StripTrailingWhitespaces()
autocmd BufWritePre *.rb,*.coffee,*.yml,*.haml,*.erb,*.php,*.java,*.py,*.js,*.styl,*.clj,*.cljs :call <SID>StripTrailingWhitespaces() " Run this method on save

" Powerline
nmap <leader>t :TagbarToggle<CR>
set laststatus=2 " Always display the statusline in all windows

set t_co=256
set background="dark"
let g:solarized_termcolors=256

execute pathogen#infect()
execute pathogen#helptags()
execute pathogen#incubate()

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
colorscheme solarized

" showmatch: Show the matching bracket for the last ')'?
set showmatch
filetype on
filetype plugin on
filetype indent on
filetype plugin indent on
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
" Always  set auto indenting on
set autoindent

" Set 'comments' to format dashed lists in comments.
setlocal comments=sO:*\ -,mO:*\ \ ,exO:*/,s1:/*,mb:*,ex:*/,://

" Allow backspace to back over lines
set backspace=2

func! Cwd()
  let cwd = getcwd()
  return "e " . cwd
endfunc

"set list listchars=tab:»-,trail:·,extends:»,precedes:«
"autocmd vimenter * if !argc() | NERDTree | endif


autocmd vimenter * if !argc() | NERDTree | endif
map <C-n> :NERDTreeToggle<CR>

augroup MYVIMRC
    au!
    au BufWritePost .vimrc so $MYVIMRC
augroup END

set wildignore+=*/tmp/*,*.so,*.swp,*.zip,*.json,*.log,*/node_modules/*,*/bower_components/*     " MacOSX/Linux

"let g:ctrlp_custom_ignore = '\v[\/]\.(git|hg|svn)$'

let g:paredit_electric_return = 0

let g:ctrlp_working_path_mode = 'ra'
let g:ctrlp_custom_ignore = {
  \ 'dir':  '\v[\/]\.(git|hg|svn)',
  \ 'file': '\v\.(exe|so|dll)$',
  \ 'link': 'some_bad_symbolic_links',
  \ }


" clojure-static
let g:clojure_fuzzy_indent = 1
let g:clojure_fuzzy_indent_patterns = ['^with', '^def', '^let', '^defn']
let g:clojure_fuzzy_indent_blacklist = ['-fn$', '\v^with-%(meta|out-str|loading-context)$']

" rainbow
"  Parentheses colours using Solarized
"let g:rbpt_colorpairs = [
"  \ [ '13', '#6c71c4'],
"  \ [ '5',  '#d33682'],
"  \ [ '1',  '#dc322f'],
"  \ [ '9',  '#cb4b16'],
"  \ [ '3',  '#b58900'],
"  \ [ '2',  '#859900'],
"  \ [ '6',  '#2aa198'],
"  \ [ '4',  '#268bd2'],
"  \ ]

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
" disable? let g:paredit_mode = 0
au FileType * call PareditInitBuffer()

" pressing < or > will let you indent/unident selected lines
vnoremap < <gv
vnoremap > >gv

nmap <leader>t :TagbarToggle<CR>

"folding settings
set foldmethod=indent   "fold based on indent
set foldnestmax=10      "deepest fold is 10 levels
set nofoldenable        "dont fold by default
set foldlevel=1         "this is just what i use

" Make p in Visual mode replace the selected text with the "" register.
vnoremap p <Esc>:let current_reg = @"<CR>gvs<C-R>=current_reg<CR><Esc>

map <leader>e :Eval<CR>

" clear whitespace
nnoremap <silent> <leader>w :let _s=@/<Bar>:%s/\s\+$//e<Bar>:let @/=_s<Bar>:nohl<CR>

" Powerline
set laststatus=2 " Always display the statusline in all windows

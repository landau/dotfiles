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

" Rainbow parens
let g:rbpt_max = 16
let g:rbpt_loadcmd_toggle = 0
au VimEnter * RainbowParenthesesToggle
au Syntax * RainbowParenthesesLoadRound
au Syntax * RainbowParenthesesLoadSquare
au Syntax * RainbowParenthesesLoadBraces

autocmd vimenter * if !argc() | NERDTree | endif
map <C-n> :NERDTreeToggle<CR>

augroup MYVIMRC
    au!
    au BufWritePost .vimrc so $MYVIMRC
augroup END

set wildignore+=*/tmp/*,*.so,*.swp,*.zip,*.json,*.log,*/node_modules/*,*/bower_components/*     " MacOSX/Linux

"let g:ctrlp_custom_ignore = '\v[\/]\.(git|hg|svn)$'

let g:ctrlp_working_path_mode = 'ra'
let g:ctrlp_custom_ignore = {
  \ 'dir':  '\v[\/]\.(git|hg|svn)',
  \ 'file': '\v\.(exe|so|dll)$',
  \ 'link': 'some_bad_symbolic_links',
  \ }


" rainbow
"  Parentheses colours using Solarized
let g:rbpt_colorpairs = [
  \ [ '13', '#6c71c4'],
  \ [ '5',  '#d33682'],
  \ [ '1',  '#dc322f'],
  \ [ '9',  '#cb4b16'],
  \ [ '3',  '#b58900'],
  \ [ '2',  '#859900'],
  \ [ '6',  '#2aa198'],
  \ [ '4',  '#268bd2'],
  \ ]
"au VimEnter * RainbowParenthesesActivate
au VimEnter * RainbowParenthesesToggle
au Syntax * RainbowParenthesesLoadRound
au Syntax * RainbowParenthesesLoadSquare
au Syntax * RainbowParenthesesLoadBraces

" paredit for all langs
" disable? let g:paredit_mode = 0
au FileType * call PareditInitBuffer()

" pressing < or > will let you indent/unident selected lines
vnoremap < <gv
vnoremap > >gv

" Make p in Visual mode replace the selected text with the "" register.
vnoremap p <Esc>:let current_reg = @"<CR>gvs<C-R>=current_reg<CR><Esc>
nnoremap <silent> <F5> :let _s=@/<Bar>:%s/\s\+$//e<Bar>:let @/=_s<Bar>:nohl<CR>

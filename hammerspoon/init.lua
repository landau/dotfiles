-- Ported from .slate.js
-- Setup: ln -s ~/dotfiles/hammerspoon ~/.hammerspoon

-- ============================================================
-- Helpers
-- ============================================================

local function sortedScreens()
  local screens = hs.screen.allScreens()
  table.sort(screens, function(a, b)
    return a:frame().x < b:frame().x
  end)
  return screens
end

-- 0-based index, ordered left-to-right (matches Slate's screen numbering)
local function screenAt(idx)
  return sortedScreens()[idx + 1]
end

local function screenCount()
  return #hs.screen.allScreens()
end

local function lap()   return screenAt(0) end  -- laptop / leftmost
local function mid()   return screenAt(1) end  -- primary external
local function right() return screenAt(2) end  -- third monitor

-- Place `win` on `screen` using a unit rect (values 0..1 relative to usable area)
local function place(win, screen, unit)
  if not win or not screen then return end
  local f = screen:frame()
  win:setFrame({
    x = f.x + unit.x * f.w,
    y = f.y + unit.y * f.h,
    w = unit.w * f.w,
    h = unit.h * f.h,
  })
end

-- Move `win` to `screen`, keeping its current size and anchoring to the screen's origin
local function moveToScreen(win, screen)
  if not win or not screen then return end
  local wf = win:frame()
  local sf = screen:frame()
  win:setFrame({ x = sf.x, y = sf.y, w = wf.w, h = wf.h })
end

-- ============================================================
-- Position unit rects
-- ============================================================

local P = {
  full       = { x=0,    y=0,   w=1,      h=1   },
  halfLeft   = { x=0,    y=0,   w=0.5,    h=1   },
  halfRight  = { x=0.5,  y=0,   w=0.5,    h=1   },
  halfTop    = { x=0,    y=0,   w=1,      h=0.5 },
  halfBot    = { x=0,    y=0.5, w=1,      h=0.5 },
  centerHalf = { x=0.25, y=0,   w=0.5,    h=1   },  -- resizeMidHalf: x=screenSizeX/4
  browser    = { x=0,    y=0,   w=1/1.15, h=1   },  -- moveMidBrowser
  slackMid   = { x=0,    y=0,   w=0.55,   h=1   },  -- moveSlackOp: (screenW/2 + 100) / screenW
  slackLap   = { x=0,    y=0,   w=1/1.5,  h=1   },  -- moveLapSlackOp: screenSizeX/1.5; x=screenOriginX/2.15=0
}

-- Messages uses absolute pixel offsets from .slate.js (tuned for 16" MBP)
local function messagesFrame(screen)
  local f = screen:frame()
  return { x = f.x + 740, y = f.y + 540, w = f.w / 1.75, h = f.h / 2 }
end

-- ============================================================
-- Layouts
-- ============================================================

-- Each entry: { 'App Name', screenFn, unitRect [, frameFn] }
-- frameFn(screen) overrides unitRect for pixel-precise positioning

local twoMonLayout = {
  { 'Maschine 2',    mid,   P.full     },
  { 'GarageBand',    mid,   P.full     },
  { 'iTerm2',        lap,   P.full     },
  { 'Logseq',        mid,   P.full     },
  { 'Blender',       mid,   P.full     },
  { 'Code',          mid,   P.full     },  -- VS Code; rename to 'Visual Studio Code' if needed
  { 'Cursor',        mid,   P.full     },
  { 'Google Chrome', mid,   P.browser  },
  { 'Firefox',       mid,   P.browser  },
  { 'Postman',       mid,   P.browser  },
  { 'Messages',      lap,   nil,       messagesFrame },
  { 'Slack',         mid,   P.slackMid },
  { 'Spotify',       lap,   P.full     },
  { 'TIDAL',         lap,   P.full     },
  { 'Sonos',         lap,   P.full     },
  { 'iTunes',        lap,   P.full     },
  { 'Calendar',      mid,   P.full     },
  { 'Mail',          right, P.full     },
  { 'Google Meet',   lap,   P.full     },
}

local oneMonLayout = {
  { 'iTerm2',        lap,   P.full     },
  { 'Logseq',        lap,   P.full     },
  { 'MacVim',        lap,   P.full     },
  { 'Blender',       lap,   P.full     },
  { 'Code',          lap,   P.full     },
  { 'Cursor',        lap,   P.full     },
  { 'IntelliJ IDEA', lap,   P.full     },
  { 'Google Chrome', lap,   P.full     },
  { 'Firefox',       lap,   P.full     },
  { 'Postman',       lap,   P.full     },
  { 'Spotify',       lap,   P.full     },
  { 'TIDAL',         lap,   P.full     },
  { 'Sonos',         lap,   P.full     },
  { 'iTunes',        lap,   P.full     },
  { 'Messages',      lap,   nil,       messagesFrame },
  { 'Calendar',      lap,   P.full     },
  { 'Mail',          lap,   P.full     },
  { 'Slack',         lap,   P.slackLap },
  { 'Google Meet',   lap,   P.full     },
}

local function applyLayout(layout)
  for _, entry in ipairs(layout) do
    local appName, screenFn, unit, frameFn = entry[1], entry[2], entry[3], entry[4]
    local app = hs.application.get(appName)
    if app then
      local screen = screenFn()
      if screen then
        for _, win in ipairs(app:allWindows()) do
          if frameFn then
            win:setFrame(frameFn(screen))
          else
            place(win, screen, unit)
          end
        end
      end
    end
  end
end

local function universalLayout()
  if screenCount() >= 2 then
    applyLayout(twoMonLayout)
  else
    applyLayout(oneMonLayout)
  end
end

-- ============================================================
-- Key bindings
-- ============================================================

-- Apply layout (ctrl+esc)
hs.hotkey.bind({'ctrl'}, 'escape', universalLayout)

-- Move focused window to screen, preserve size (ctrl+cmd+1/2/3)
hs.hotkey.bind({'ctrl','cmd'}, '1', function()
  local w = hs.window.focusedWindow(); if w then moveToScreen(w, lap()) end
end)
hs.hotkey.bind({'ctrl','cmd'}, '2', function()
  local w = hs.window.focusedWindow(); if w then moveToScreen(w, mid()) end
end)
hs.hotkey.bind({'ctrl','cmd'}, '3', function()
  local w = hs.window.focusedWindow(); if w then moveToScreen(w, right()) end
end)

-- Resize focused window on its current screen (ctrl+alt+arrow / 0 / -)
hs.hotkey.bind({'ctrl','alt'}, 'left',  function()
  local w = hs.window.focusedWindow(); if w then place(w, w:screen(), P.halfLeft) end
end)
hs.hotkey.bind({'ctrl','alt'}, 'right', function()
  local w = hs.window.focusedWindow(); if w then place(w, w:screen(), P.halfRight) end
end)
hs.hotkey.bind({'ctrl','alt'}, 'up', function()
  local w = hs.window.focusedWindow(); if w then place(w, w:screen(), P.halfTop) end
end)
hs.hotkey.bind({'ctrl','alt'}, 'down', function()
  local w = hs.window.focusedWindow(); if w then place(w, w:screen(), P.halfBot) end
end)
hs.hotkey.bind({'ctrl','alt'}, '0', function()
  local w = hs.window.focusedWindow(); if w then place(w, w:screen(), P.centerHalf) end
end)
hs.hotkey.bind({'ctrl','alt'}, '-', function()
  local w = hs.window.focusedWindow(); if w then place(w, w:screen(), P.full) end
end)

-- Window hints: show lettered overlays on all windows (cmd+esc)
hs.hints.fontSize  = 25
hs.hints.showTitleThresh = 0  -- show icon only, no title text
hs.hotkey.bind({'cmd'}, 'escape', function() hs.hints.windowHints() end)

-- Grid sizer (alt+esc)
hs.grid.setGrid('6x4')
hs.grid.setMargins({0, 0})
hs.hotkey.bind({'alt'}, 'escape', function() hs.grid.show() end)

-- ============================================================
-- Auto-apply layout on screen connect/disconnect
-- ============================================================

local screenWatcher = hs.screen.watcher.new(function()
  hs.timer.doAfter(1, universalLayout)
end)
screenWatcher:start()

-- ============================================================
-- Caffeinate menubar item
-- ============================================================

local caffMenu = hs.menubar.new()

local function updateCaffMenu()
  local on = hs.caffeinate.get('displayIdle')
  caffMenu:setTitle(on and '☕' or '😴')
  caffMenu:setTooltip(on and 'Caffeinated (click to sleep normally)' or 'Click to prevent sleep')
end

caffMenu:setClickCallback(function()
  if hs.caffeinate.get('displayIdle') then
    hs.caffeinate.set('displayIdle', false)
  else
    hs.caffeinate.set('displayIdle', true)
  end
  updateCaffMenu()
end)

updateCaffMenu()

-- ============================================================
-- Auto-reload config when init.lua is saved
-- ============================================================

local configWatcher = hs.pathwatcher.new(os.getenv('HOME') .. '/.hammerspoon/', function(files)
  for _, f in ipairs(files) do
    if f:sub(-4) == '.lua' then
      hs.reload()
      return
    end
  end
end)
configWatcher:start()

hs.alert.show('Hammerspoon config loaded')

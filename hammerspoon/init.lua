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

-- Screen name constants used as keys in layout tables
local LAPTOP   = 'laptop'
local EXTERNAL = 'external'

-- Fetch and resolve all screens once; callers get a name→screen map
local function resolveScreens()
  local sorted = sortedScreens()
  return { [LAPTOP] = sorted[1], [EXTERNAL] = sorted[2] }
end

-- Convenience accessors for hotkey handlers (single screen needed, not a layout)
local function laptopScreen()   return sortedScreens()[1] end
local function externalScreen() return sortedScreens()[2] end

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

local Pos = {
  full        = { x=0,    y=0,   w=1,      h=1   },
  halfLeft    = { x=0,    y=0,   w=0.5,    h=1   },
  halfRight   = { x=0.5,  y=0,   w=0.5,    h=1   },
  halfTop     = { x=0,    y=0,   w=1,      h=0.5 },
  halfBot     = { x=0,    y=0.5, w=1,      h=0.5 },
  centerHalf  = { x=0.25, y=0,   w=0.5,    h=1   },
  browser     = { x=0,    y=0,   w=1/1.15, h=1   },
  slackExt    = { x=0,    y=0,   w=0.55,   h=1   },  -- (screenW/2 + 100) / screenW
  slackLaptop = { x=0,    y=0,   w=1/1.5,  h=1   },
}

-- Messages uses absolute pixel offsets from .slate.js (tuned for 16" MBP)
local function messagesFrame(screen)
  local f = screen:frame()
  return { x = f.x + 740, y = f.y + 540, w = f.w / 1.75, h = f.h / 2 }
end

-- ============================================================
-- Layouts
-- ============================================================

-- Each entry: { 'App Name', SCREEN_CONSTANT, unitRect [, frameFn] }
-- Screens are resolved once per layout run via resolveScreens().

local twoMonLayout = {
  { 'Maschine 2',    EXTERNAL, Pos.full        },
  { 'Logic Pro',     EXTERNAL, Pos.full        },
  { 'iTerm2',        LAPTOP,   Pos.full        },
  { 'Logseq',        EXTERNAL, Pos.full        },
  { 'Blender',       EXTERNAL, Pos.full        },
  { 'Code',          EXTERNAL, Pos.full        },
  { 'Cursor',        EXTERNAL, Pos.full        },
  { 'Google Chrome', EXTERNAL, Pos.browser     },
  { 'Firefox',       EXTERNAL, Pos.browser     },
  { 'Safari',        EXTERNAL, Pos.browser     },
  { 'Messages',      LAPTOP,   nil,            messagesFrame },
  { 'Slack',         EXTERNAL, Pos.slackExt    },
  { 'TIDAL',         LAPTOP,   Pos.full        },
  { 'Sonos',         LAPTOP,   Pos.full        },
  { 'Google Meet',   LAPTOP,   Pos.full        },
}

local oneMonLayout = {
  { 'iTerm2',        LAPTOP,   Pos.full        },
  { 'Logseq',        LAPTOP,   Pos.full        },
  { 'Logic Pro',     LAPTOP,   Pos.full        },
  { 'Code',          LAPTOP,   Pos.full        },
  { 'Cursor',        LAPTOP,   Pos.full        },
  { 'Google Chrome', LAPTOP,   Pos.full        },
  { 'Firefox',       LAPTOP,   Pos.full        },
  { 'TIDAL',         LAPTOP,   Pos.full        },
  { 'Sonos',         LAPTOP,   Pos.full        },
  { 'Messages',      LAPTOP,   nil,            messagesFrame },
  { 'Slack',         LAPTOP,   Pos.slackLaptop },
  { 'Google Meet',   LAPTOP,   Pos.full        },
}

local function applyLayout(layout)
  local screens = resolveScreens()  -- one fetch + sort for the whole layout
  for _, entry in ipairs(layout) do
    local appName, screenKey, unit, frameFn = entry[1], entry[2], entry[3], entry[4]
    local app = hs.application.get(appName)
    if app then
      local screen = screens[screenKey]
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
  if #hs.screen.allScreens() >= 2 then
    applyLayout(twoMonLayout)
  else
    applyLayout(oneMonLayout)
  end
end

hs.window.animationDuration = 0  -- disable animation so window moves are instant

-- ============================================================
-- Key bindings
-- ============================================================

-- Apply layout (ctrl+esc)
hs.hotkey.bind({'ctrl'}, 'escape', universalLayout)

-- Move focused window to screen (ctrl+cmd+1/2).
-- Applies the app's defined unit rect from the active layout on the target screen,
-- regardless of which screen the layout entry points to.
-- Falls back to preserving current size if the app has no layout entry.
local function moveWindowToScreen(win, screen)
  if not win or not screen then return end
  local app = win:application()
  local appName = app and app:name()
  local layout = #hs.screen.allScreens() >= 2 and twoMonLayout or oneMonLayout
  for _, entry in ipairs(layout) do
    if entry[1] == appName then
      local unit, frameFn = entry[3], entry[4]
      if frameFn then win:setFrame(frameFn(screen)) else place(win, screen, unit) end
      return
    end
  end
  moveToScreen(win, screen)  -- fallback: no layout entry, preserve current size
end

hs.hotkey.bind({'ctrl','cmd'}, '1', function()
  local w = hs.window.focusedWindow()
  if w then moveWindowToScreen(w, laptopScreen()) end
end)
hs.hotkey.bind({'ctrl','cmd'}, '2', function()
  local w = hs.window.focusedWindow()
  if w then moveWindowToScreen(w, externalScreen()) end
end)

-- Resize focused window on its current screen (ctrl+alt+arrow / 0 / -)
hs.hotkey.bind({'ctrl','alt'}, 'left',  function()
  local w = hs.window.focusedWindow(); if w then place(w, w:screen(), Pos.halfLeft) end
end)
hs.hotkey.bind({'ctrl','alt'}, 'right', function()
  local w = hs.window.focusedWindow(); if w then place(w, w:screen(), Pos.halfRight) end
end)
hs.hotkey.bind({'ctrl','alt'}, 'up', function()
  local w = hs.window.focusedWindow(); if w then place(w, w:screen(), Pos.halfTop) end
end)
hs.hotkey.bind({'ctrl','alt'}, 'down', function()
  local w = hs.window.focusedWindow(); if w then place(w, w:screen(), Pos.halfBot) end
end)
hs.hotkey.bind({'ctrl','alt'}, '0', function()
  local w = hs.window.focusedWindow(); if w then place(w, w:screen(), Pos.centerHalf) end
end)
hs.hotkey.bind({'ctrl','alt'}, '-', function()
  local w = hs.window.focusedWindow(); if w then place(w, w:screen(), Pos.full) end
end)

-- Window hints: show lettered overlays on all windows (cmd+esc)
hs.hints.fontSize        = 25
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
-- Logic Pro launching/quitting auto-toggles it; manual click overrides.
-- ============================================================

local caffMenu   = hs.menubar.new()
local manualCaff = false  -- true when the user explicitly enabled it

local function updateCaffMenu()
  local on = hs.caffeinate.get('displayIdle')
  caffMenu:setTitle(on and '☕' or '😴')
  caffMenu:setTooltip(on and 'Caffeinated — click to allow sleep' or 'Click to prevent sleep')
end

caffMenu:setClickCallback(function()
  manualCaff = not hs.caffeinate.get('displayIdle')
  hs.caffeinate.set('displayIdle', manualCaff)
  updateCaffMenu()
end)

-- Auto-caffeinate while Logic Pro is running
local logicWatcher = hs.application.watcher.new(function(name, event)
  if name ~= 'Logic Pro' then return end
  if event == hs.application.watcher.launched then
    hs.caffeinate.set('displayIdle', true)
  elseif event == hs.application.watcher.terminated then
    if not manualCaff then hs.caffeinate.set('displayIdle', false) end
  end
  updateCaffMenu()
end)
logicWatcher:start()

updateCaffMenu()

-- ============================================================
-- Mic mute menubar item
-- ============================================================

local micMenu = hs.menubar.new()

local function updateMicMenu()
  local mic = hs.audiodevice.defaultInputDevice()
  local muted = mic and mic:muted()
  micMenu:setTitle(muted and '🔇' or '🎙')
  micMenu:setTooltip(muted and 'Mic muted — click to unmute' or 'Mic active — click to mute')
end

micMenu:setClickCallback(function()
  local mic = hs.audiodevice.defaultInputDevice()
  if not mic then return end
  mic:setMuted(not mic:muted())
  updateMicMenu()
end)

-- Keep icon in sync when another app changes mute state
hs.audiodevice.watcher.setCallback(function(uid, event)
  if event == 'dIn ' then updateMicMenu() end
end)
hs.audiodevice.watcher.start()

updateMicMenu()

-- ============================================================
-- Pomodoro timer (menubar item; click to start / click again to reset)
-- ============================================================

local POM_WORK  = 25 * 60
local POM_BREAK =  5 * 60

local pomMenu     = hs.menubar.new()
local pomTimer    = nil
local pomState    = 'idle'   -- 'idle' | 'work' | 'break'
local pomSecsLeft = POM_WORK

local function pomTimeStr()
  return string.format('%d:%02d', math.floor(pomSecsLeft / 60), pomSecsLeft % 60)
end

local function pomStop()
  if pomTimer then pomTimer:stop(); pomTimer = nil end
end

local function updatePomMenu()
  if pomState == 'idle' then
    pomMenu:setTitle('🍅')
    pomMenu:setTooltip('Click to start 25-min Pomodoro')
  elseif pomState == 'work' then
    pomMenu:setTitle('🍅 ' .. pomTimeStr())
    pomMenu:setTooltip('Working — click to reset')
  else
    pomMenu:setTitle('☕ ' .. pomTimeStr())
    pomMenu:setTooltip('Break — click to reset')
  end
end

local function pomTick()
  pomSecsLeft = pomSecsLeft - 1
  if pomSecsLeft <= 0 then
    if pomState == 'work' then
      hs.notify.new({ title='Pomodoro', informativeText='Time for a 5-minute break.' }):send()
      hs.alert.show('Pomodoro done — take a break!', 4)
      pomState    = 'break'
      pomSecsLeft = POM_BREAK
    else
      hs.notify.new({ title='Pomodoro', informativeText='Break over — back to work.' }):send()
      hs.alert.show('Break over — back to work!', 4)
      pomStop()
      pomState    = 'idle'
      pomSecsLeft = POM_WORK
    end
  end
  updatePomMenu()
end

pomMenu:setClickCallback(function()
  if pomState == 'idle' then
    pomState    = 'work'
    pomSecsLeft = POM_WORK
    pomTimer    = hs.timer.doEvery(1, pomTick)
  else
    pomStop()
    pomState    = 'idle'
    pomSecsLeft = POM_WORK
  end
  updatePomMenu()
end)

updatePomMenu()

-- ============================================================
-- Auto-reload config when any .lua file in ~/.hammerspoon/ is saved
-- ============================================================

local configWatcher = hs.pathwatcher.new(hs.configdir, function(files)
  for _, f in ipairs(files) do
    if f:sub(-4) == '.lua' then
      hs.reload()
      return
    end
  end
end)
configWatcher:start()

hs.alert.show('Hammerspoon config loaded')

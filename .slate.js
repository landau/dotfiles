// Configs
S.cfga({
  'defaultToCurrentScreen' : true,
  'secondsBetweenRepeat' : 0.1,
  'checkDefaultsOnLoad' : true,
  'focusCheckWidthMax' : 3000,
  windowHintsIgnoreHiddenWindows: false,
  windowHintsSpread: true,
  windowHintsFontSize: 25,
  windowHintsWidth: 50,
  windowHintsHeight: 50,
  windowHintsShowIcons: true,
  orderScreensLeftToRight: true
});

var hyper = 'ctrl;shift;alt;cmd';

// ------- Monitor assignments
//var monLap = '1440x900';
//
//// Home Monitors
//var monSonic = '1920x1080';
//var monSam = '1680x1050';
//
//// Work Monitors
//var monDell = '1920x1200';
//var monHp = '1920x1080';
var monLap, monMid, monRight;
if (S.screenCount() === 2) {
  monLap = '0';
  monMid = '1';
  monRight = '-1';
} else {
  monLap = '0';
  monMid = '1';
  monRight = '2';
}

// ------- Move operation assignments
var moveScreenOp = S.op('move', {
  x: 'screenOriginX',
  y: 'screenOriginY',
  width: 'windowSizeX',
  height: 'windowSizeY'
});

var moveToLap = moveScreenOp.dup({
  screen: monLap
});

var moveToMid = moveScreenOp.dup({
  screen: monMid
});

var moveToRight = moveScreenOp.dup({
  screen: monRight
});

var moveOp = S.op('move', {
  x: 'screenOriginX',
  y: 'screenOriginY',
  width: 'screenSizeX',
  height: 'screenSizeY'
});

var moveLapOp = moveOp.dup({ screen: monLap });
var moveMidOp = moveOp.dup({ screen: monMid });
var moveRightOp = moveOp.dup({ screen: monRight });

// I don't really use these....but just in case
var moveMidOpTop = moveMidOp.dup({ height : 'screenSizeY/2' });
var moveMidOpTopLeft = moveMidOpTop.dup({ width : 'screenSizeX/2' });
var moveMidOpTopRight = moveMidOpTopLeft.dup({ x : 'screenOriginX+screenSizeX/2' });
var moveMidOpBottom = moveMidOpTop.dup({ y : 'screenOriginY+screenSizeY/2' });
var moveMidOpBottomLeft = moveMidOpBottom.dup({ width : 'screenSizeX/3' });
var moveMidOpBottomMid = moveMidOpBottomLeft.dup({ x : 'screenOriginX+screenSizeX/3' });
var moveMidOpBottomRight = moveMidOpBottomLeft.dup({ x : 'screenOriginX+2*screenSizeX/3' });
var moveMidOpLeft = moveMidOpTopLeft.dup({ height : 'screenSizeY' });
var moveMidOpRight = moveMidOpTopRight.dup({ height : 'screenSizeY' });
var moveMidOpTopLeft = moveMidOpTopLeft.dup({ screen : monMid });
var moveMidOpBottomLeft = moveMidOpTopLeft.dup({ y : 'screenOriginY+screenSizeY/2' });
var moveMidOpRight = moveMidOpRight.dup({ screen : monMid });

var moveMidiTerm = moveMidOp.dup({
  width: 'screenSizeX*0.3'
});

var moveMidMidOp = moveMidOp.dup({
  width: '(screenSizeX/1.35)',
  x: '(screenSizeX/6.75)'
});

var moveMidBrowser = moveMidOp.dup({
  width: '(screenSizeX/1.35)'
});

var moveMidCodeOp = moveMidOp.dup({
  width: '(screenSizeX/1.25)',
  x: '(screenSizeX*0.10)'
});

var moveMidLeftCodeOp = moveMidOp.dup({
  width: '(screenSizeX/1.15)',
  x: '(screenSizeX*.065)'
});

var moveTwitterNextToBrowser = S.op('corner', {
  screen: monMid,
  direction: 'top-right',
  width: 'screenSizeX/3.85',
  height: 'screenSizeY'
});

var moveWunderNextToBrowser = S.op('corner', {
  screen: monMid,
  direction: 'top-right',
  width: 'screenSizeX/3.85',
  height: 'screenSizeY/2'
});

var moveRightAdiumOp = S.op('corner', {
  screen: monRight,
  direction: 'top-left',
  width: 'screenSizeX/2.5',
  height: 'screenSizeY/2'
});

// Messages app op
var moveRightMessagesOp = moveLapOp.dup({
  width: 'screenSizeX/2.5',
  height: 'screenSizeY/2',
  x: 'screenOriginX/2.5',
  y: 'screenOriginY+512'
});


var moveLapAdiumOp = moveRightAdiumOp.dup({
  screen: monLap,
  width: 'screenSizeX/2',
  height: 'screenSizeY/1.25'
});

var moveLapMessagesOp = moveRightMessagesOp.dup({
  screen: monLap
});

var moveLapHipChatOp = moveLapAdiumOp.dup({
  screen: monLap,
  direction: 'top-right',
  width: 'screenSizeX/2',
  height: 'screenSizeY'
});

var moveLapSlackOp = moveLapAdiumOp.dup({
  screen: monLap,
  width: 'screenSizeX/1.5',
  height: 'screenSizeY',
  x: 'screenOriginX/2.15',
  y:'0'
});

// ------ Resize ops
var resizeHalfLeft = S.op('move', {
  height: 'screenSizeY',
  width: 'screenSizeX/2',
  x: '0',
  y: '0'
});

var resizeHalfRight = resizeHalfLeft.dup({
  x: 'screenSizeX/2'
});

var resizeHalfTop = resizeHalfLeft.dup({
  height: 'screenSizeY/2',
  width: 'screenSizeX'
});

var resizeHalfBot = resizeHalfTop.dup({
  y: 'screenSizeY/2'
});

var resizeMidHalf = resizeHalfLeft.dup({
  x: '(screenSizeX/4)'
});

var resizeFull = resizeHalfLeft.dup({
  height: 'screenSizeY',
  width: 'screenSizeX'
});

// ------ Layouts

var midLayoutFull = {
  'operations' : [moveMidOp],
  'ignore-fail' : true,
  'repeat' : true
};
var lapLayoutFull = {
  'operations' : [moveLapOp],
  'ignore-fail' : true,
  'repeat' : true
};

var rightLayoutFull = {
  'operations' : [moveRightOp],
  'ignore-fail' : true,
  'repeat' : true
};

var twoMonLayout = S.layout('twoMon', {
  '_before_': {},
  '_after_': {},
  LimeChat: {
    operations: [moveLapHipChatOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  iTerm2: {
    operations: [moveLapOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  MacVim: {
    operations: [moveMidCodeOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  Emacs: {
    operations: [moveMidCodeOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  'Code': {
    operations: [moveMidLeftCodeOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  'IntelliJ IDEA': {
    operations: [moveMidLeftCodeOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  'Google Chrome': {
    operations: [moveMidBrowser],
    'ignore-fail': true,
    'repeat-last': true
  },
  'Firefox': {
    operations: [moveMidBrowser],
    'ignore-fail': true,
    'repeat-last': true
  },
  'Postman': {
    operations: [moveMidBrowser],
    'ignore-fail': true,
    'repeat-last': true
  },
  Messages: {
    operations: [moveLapMessagesOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  Slack: {
    operations: [moveLapSlackOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  'Spotify': {
    operations: [moveLapOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  'Sonos': {
    operations: [moveLapOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  iTunes: {
    operations: [moveLapOp],
    'title-order': ['Equalizer'], // important for order of operations
    'ignore-fail': true,
    'repeat-last': true
  },
  Calendar: {
    operations: [moveMidOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  Mail: {
    operations: [moveRightOp],
    'ignore-fail': true,
    'repeat-last': true
  }
});

var oneMonLayout = S.layout('oneMon', {
  '_before_': {},
  '_after_': {},
  LimeChat: {
    operations: [moveLapHipChatOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  iTerm2: {
    operations: [moveMidOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  MacVim: {
    operations: [moveMidOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  Emacs: {
    operations: [moveMidOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  'Code': {
    operations: [moveMidOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  'IntelliJ IDEA': {
    operations: [moveMidOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  'Google Chrome': {
    operations: [moveLapOp],
    'ignore-fail': true,
    'title-order': [], // TODO move other google windows to monRight
    'repeat-last': true
  },
  'Firefox': {
    operations: [moveLapOp],
    'ignore-fail': true,
    'title-order': [], // TODO move other google windows to monRight
    'repeat-last': true
  },
  'Postman': {
    operations: [moveLapOp],
    'ignore-fail': true,
    'title-order': [], // TODO move other google windows to monRight
    'repeat-last': true
  },
  'Spotify': {
    operations: [moveLapOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  'Sonos': {
    operations: [moveLapOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  iTunes: {
    operations: [moveLapOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  Messages: {
    operations: [moveLapMessagesOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  Calendar: {
    operations: [moveLapOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  Mail: {
    operations: [moveLapOp],
    'ignore-fail': true,
    'repeat-last': true
  },
  Slack: {
    operations: [moveLapSlackOp],
    'ignore-fail': true,
    'repeat-last': true
  }
});

var twoMonOp = S.op('layout', { name: twoMonLayout });
var oneMonOp = S.op('layout', { name: oneMonLayout });

// ---- Default layouts
S.def([monMid, monRight], twoMonLayout);
S.def([monLap], oneMonLayout);

// --- Commands

var universalLayout = function() {
  if (S.screenCount() === 2) {
    twoMonOp.run();
  } else if (S.screenCount() === 1) {
    oneMonOp.run();
  }
};

// ------ Key Bindings
S.bnda({
  // Layout Bindings
  'esc:ctrl' : universalLayout,

  // Basic Location Bindings
  '1:ctrl;cmd': moveToLap,
  '2:ctrl;cmd': moveToMid,
  '3:ctrl;cmd': moveToRight,

  // Resize bindings
  '6:ctrl;alt': resizeMidHalf,
  '0:ctrl;alt': resizeHalfRight,
  '7:ctrl;alt': resizeHalfLeft,
  '8:ctrl;alt': resizeHalfBot,
  '9:ctrl;alt': resizeHalfTop,
  '-:ctrl;alt': resizeFull,

  // Resize Bindings
  // Sizing
  /*
  '0:ctrl;alt' : S.op('resize', { 'width' : '+10%', 'height' : '+0' }),
  '7:ctrl;alt' : S.op('resize', { 'width' : '-10%', 'height' : '+0' }),
  '8:ctrl;alt' : S.op('resize', { 'width' : '+0', 'height' : '-10%' }),
  '9:ctrl;alt' : S.op('resize', { 'width' : '+0', 'height' : '+10%' }),

  '7:ctrl;cmd' : S.op('resize', { 'width' : '-10%', 'height' : '+0', 'anchor' : 'bottom-right' }),
  '0:ctrl;cmd' : S.op('resize', { 'width' : '+10%', 'height' : '+0', 'anchor' : 'bottom-right' }),
  '8:ctrl;cmd' : S.op('resize', { 'width' : '+0', 'height' : '+10%', 'anchor' : 'top-left' }),
  '9:ctrl;cmd' : S.op('resize', { 'width' : '+0', 'height' : '-10%', 'anchor' : 'bottom-right' }),
  */

  // Window Hints
  'esc:cmd' : S.op('hint'),

  // Switch currently doesn't work well so I'm commenting it out until I fix it.
  //'tab:cmd' : S.op('switch'),

  // Grid
  'esc:alt' : S.op('grid')
});

// Log that we're done configuring
S.log('[SLATE] -------------- Finished Loading Config --------------');

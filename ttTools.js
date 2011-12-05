Array.prototype.shuffle = function() {
  var len = this.length;
  var i = len;
   while (i--) {
    var p = parseInt(Math.random()*len);
    var t = this[i];
    this[i] = this[p];
    this[p] = t;
  }
};

ttTools = {
  autoDJ      : false,
  autoDJDelay : 2000,
  
  autoAwesome      : false,
  autoAwesomeDelay : 30000,

  init : function() {
    $('<link/>', {
      type : 'text/css',
      rel  : 'stylesheet',
      href : 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.1/themes/sunny/jquery-ui.css'
    }).appendTo(document.head);
    
    $.getScript('https://raw.github.com/egeste/ttTools/master/ttTools.views.js', function() {
      if (window.openDatabase) {
        $.getScript('https://raw.github.com/egeste/ttTools/master/ttTools.database.js', function() {
          $.getScript('https://raw.github.com/egeste/ttTools/master/ttTools.tags.js', function() {
            ttTools.tags.init();
          });
        });
      }
      ttTools.views.toolbar.render();
      ttTools.views.download_button.render();
    });

    this.idleTimeOverride();
    this.fuckTheDMCA();

    //this.reloadPageOverride();
    this.removeDjOverride();
    this.setCurrentSongOverride();
  },

  getRoom : function() {
    for (var memberName in turntable) {
      var member = eval('turntable.'+memberName);
      if (member == null) { continue; }
      if (typeof member != 'object') { continue; }
      if ('setupRoom' in member) {
        return member;
      }
      return false;
    }
  },

  getCore : function(room) {
    for (var memberName in room) {
      var member = eval('room.'+memberName);
      if (member == null) { continue; }
      if (typeof member != 'object') { continue; }
      if ('blackswan' in member) {
        return member;
      }
    }
    return false;
  },

  idleTimeOverride : function () {
    turntable.idleTime = function () {
      return 0;
    };
  },

  fuckTheDMCA : function () {
    var room = this.getRoom();
    if (!room) { return false; }
    clearTimeout(room.timers.dmcaMute);
    room.timers.dmcaMute = null;
    room.dmcaMute = function(){
      this.showRoomTip("Fuck the DMCA");
    };
    turntablePlayer.setDmcaMute(false);
  },

  reloadPageOverride : function () {
    turntable.reloadPageFunc = turntable.reloadPage;
    turntable.reloadPage = function (a) {
      this.reloadPageFunc(a);
      $(document).ready(ttTools.init);
    }
  },

  removeDjOverride : function () {
    var room = this.getRoom();
    if (!room) { return false; }
    room.removeDjFunc = room.removeDj;
    room.removeDj = function (userId) {
      if (userId != this.selfId && !this.isDj() && ttTools.autoDJ) {
        setTimeout(function() {
          room.becomeDj();
          ttTools.autoDJ = false;
          $('#autoDJ').prop('checked', false).button('refresh');
        }, ttTools.autoDJDelay);
      }
      this.removeDjFunc(userId);
    };
  },

  setCurrentSongOverride : function () {
    var room = this.getRoom();
    if (!room) { return false; }
    room.setCurrentSongFunc = room.setCurrentSong;
    room.setCurrentSong = function (roomState) {
      this.setCurrentSongFunc(roomState);
      if (ttTools.autoAwesome) {
        setTimeout(function() {
          turntable.whenSocketConnected(function() {
            room.connectRoomSocket('up');
          });
        }, ttTools.autoAwesomeDelay);
      }
    };
  }
};
ttTools.init();
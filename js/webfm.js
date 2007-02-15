// Webfm.js

function Webfm() {}
function WebfmDrag() {}

/*
** Global variables
*/
Webfm.current = null;
Webfm.dropContainers = [];

Webfm.oldOnContextMenu = null;
Webfm.oldOnMouseDown = null;
Webfm.contextMenuDiv = null;
Webfm.cache = [];
Webfm.cache_history = [];

//Translation possible by changing the array values (DO NOT ALTER KEYS!)
Webfm.js_msg = [];
Webfm.js_msg["mkdir"] = "Create New Dir";
Webfm.js_msg["file"] = "file";
Webfm.js_msg["directory"] = "directory";
Webfm.js_msg["work"] = "Working...";
Webfm.js_msg["refresh"] = "refresh";
Webfm.js_msg["sort"] = "sort by this column";
Webfm.js_msg["column1"] = "Name";
Webfm.js_msg["column2"] = "Modified";
Webfm.js_msg["column3"] = "Size";
Webfm.js_msg["attach-title"] = "Attached Files";
Webfm.js_msg["meta-title"] = "File Meta Data";
Webfm.js_msg["search-title"] = "File Search";
Webfm.js_msg["debug-title"] = "Webfm Debug";
Webfm.js_msg["search-cur"] = "Search current directory";
Webfm.js_msg["no-match"] = "No match found";
Webfm.js_msg["search"] = "Search";
Webfm.js_msg["submit"] = "Submit";
Webfm.js_msg["clear"] = "Clear";
Webfm.js_msg["cache"] = "Cache Content";
Webfm.js_msg["curdir-undef"] = "current directory undefined";
Webfm.js_msg["ajax-err"] = "server is unreachable";
Webfm.js_msg["list-err"] = "dir listing fetch fail";
Webfm.js_msg["mkdir-err"] = "mkdir fail";
Webfm.js_msg["move-err"] = "move operation fail";
Webfm.js_msg["attach-err"] = "attach fail";
Webfm.js_msg["fetch-att-err"] = "fetch attachments fail";
Webfm.js_msg["getmeta-err"] = "get metadata fail";
Webfm.js_msg["sendmeta-err"] = "submit metadata fail";
Webfm.js_msg["len-err"] = "Too long";
Webfm.js_msg["confirm-del0"] = "Do you want to delete the ";
Webfm.js_msg["confirm-del1"] = " and all its contents";
Webfm.js_msg["confirm-det"] = "Do you want to detach ";

Webfm.menu_msg = [];
Webfm.menu_msg["mkdir"] = "Create Subdirectory";
Webfm.menu_msg["rmdir"] = "Delete Directory";
Webfm.menu_msg["rm"] = "Delete File";
Webfm.menu_msg["ren"] = "Rename";
Webfm.menu_msg["meta"] = "File meta data";
Webfm.menu_msg["att"] = "Attach to Node";
Webfm.menu_msg["det"] = "Detach from Node";
Webfm.menu_msg["dwnld"] = "Download as file";
//Do not translate any code below this line

Webfm.menu = [];
Webfm.menu['root'] = { 'mkdir': Webfm.menu_msg["mkdir"] };
Webfm.menu['dir'] = { 'mkdir': Webfm.menu_msg["mkdir"], 'rmdir': Webfm.menu_msg["rmdir"], 'ren': Webfm.menu_msg["ren"] };
Webfm.menu['file'] = { 'rm': Webfm.menu_msg["rm"], 'ren': Webfm.menu_msg["ren"], 'meta': Webfm.menu_msg["meta"], 'dwnld' : Webfm.menu_msg["dwnld"] };
Webfm.menu['attach'] = { 'det': Webfm.menu_msg["det"], 'meta': Webfm.menu_msg["meta"] };
Webfm.menu['node'] = { 'att': Webfm.menu_msg["att"], 'rm': Webfm.menu_msg["rm"], 'ren': Webfm.menu_msg["ren"], 'meta': Webfm.menu_msg["meta"], 'dwnld': Webfm.menu_msg["dwnld"] };

Webfm.dirTreeObj = null;
Webfm.ftpTreeObj = null;
Webfm.dirListObj = null;
Webfm.attachObj = null;
Webfm.alrtObj = null;
Webfm.contextMenuObj = null;
Webfm.progressObj = null;
Webfm.dbgObj = null;
Webfm.renameActive = null;

//Name of node edit form hidden field where attached node list is populated by js
Webfm.attachFormInput = 'edit-attachlist'

// This array determines which metadata fields are viewable/editable
// Webfm.db_table_keys must match the keys of the webfm_file table
// -1 = hidden, 0 = read only, 256 = text, all other values is max char length
Webfm.db_table_keys = {'fid':0, 'uid':-1, 'fpath':0, 'fname':255, 'fsize':0, 'fmime':0, 'ftitle':255, 'fdesc':256, 'fcreatedate':-1, 'flang':16, 'fpublisher':255, 'fformat':-1, 'fversion':-1 };

Webfm.mime_type = { image_jpeg:"i", application_pdf:"pdf" };
Webfm.icons = {
   epdf:"pdf", ephp:"php", ephps:"php", ephp4:"php", ephp5:"php", eswf:"swf", esfa:"swf", exls:"xls", edoc:"doc", ertf:"doc",
   ezip:"zip", erar:"zip", earj:"zip", e7z:"zip", etxt:"doc", echm:"hlp", ehlp:"hlp", enfo:"nfo", expi:"xpi", ec:"c", eh:"h",
   emp3:"mp3", ewav:"mp3", esnd:"mp3", einc:"cod", esql:"sql", edbf:"sql", ediz:"nfo", eion:"nfo", emod:"mp3", es3m:"mp3",
   eavi:"avi", empg:"avi", empeg:"avi", ewma:"mp3", ewmv:"avi"
};

WebfmDrag.dragCont = null;
WebfmDrag.dragStart = null;
WebfmDrag.dragging = false;
WebfmDrag.activeCont = null;
WebfmDrag.dropContainers = [];
WebfmDrag.attachContainer = [];

/*
** Functions
*/
if (Drupal.jsEnabled) {
  Webfm_addLoadEvent(webfmLayout);
  Webfm_addLoadEvent(webfmAttachmentLayout);
  Webfm_addLoadEvent(dragContainer);
  Webfm_addLoadEvent(contextContainer);
}

function webfmLayout() {
  var layoutDiv = '';
  layoutDiv = Webfm.$('webfm');

  if(layoutDiv) {
    var layout_cont = Webfm.ce('div');
    Webfm.alrtObj = new Webfm.alert(layout_cont, 'alertbox');
    var elTreeDiv = Webfm.ce('div');
    elTreeDiv.setAttribute('id', 'tree'); //css id
    layout_cont.appendChild(elTreeDiv);
    Webfm.dirTreeObj = new Webfm.tree(elTreeDiv, 'dirtree', 'Directory', 'readtree');
    Webfm.ftpTreeObj = new Webfm.tree(elTreeDiv, 'ftptree', 'FTP Directory', 'readftptree');
    Webfm.progressObj = new Webfm.progress(layout_cont, 'progress');
    Webfm.dirListObj = new Webfm.list(layout_cont, 'dirlist', 'file', true, 'narrow');
    var metaObj = new Webfm.meta(layout_cont);
    var searchObj = new Webfm.search(layout_cont, 'search');
    Webfm.contextMenuObj = new Webfm.context();
    //insert trees, listing, search, metadata, progress and alert divs before upload fset
    layoutDiv.insertBefore(layout_cont, layoutDiv.firstChild);
    //append debug div
    Webfm.dbgObj = new Webfm.debug(getDebugFlag() ? layoutDiv : '');

    Webfm.dirTreeObj.fetch(true);
    Webfm.ftpTreeObj.fetch();
  }
}

function webfmAttachmentLayout() {
  var layoutDiv = '';
  layoutDiv = Webfm.$('webfm-inline');

  if(layoutDiv) {
    var layout_cont = Webfm.ce('div');
    Webfm.alrtObj = new Webfm.alert(layout_cont, 'alertbox');
    var elTreeDiv = Webfm.ce('div');
    elTreeDiv.setAttribute('id', 'tree'); //css id
    layout_cont.appendChild(elTreeDiv);
    Webfm.dirTreeObj = new Webfm.tree(elTreeDiv, 'dirtree', 'Directory', 'readtree');
    Webfm.progressObj = new Webfm.progress(layout_cont, 'progress');
    Webfm.dirListObj = new Webfm.list(layout_cont, 'dirlist', 'node', true, 'narrow');
    var searchObj = new Webfm.search(layout_cont, 'search');
    Webfm.contextMenuObj = new Webfm.context();
    //insert tree, listing, search, progress and alert divs before upload fset
    layoutDiv.insertBefore(layout_cont, layoutDiv.firstChild);
    //append debug div
    Webfm.dbgObj = new Webfm.debug(getDebugFlag() ? layoutDiv : '');

    // attach list anchored to 'webfm-attach' div in webfm_attachment_form_alter()
    Webfm.attachObj = new Webfm.attach('webfm-attach');
    Webfm.attachObj.fetch();
    Webfm.dirTreeObj.fetch(true);
  }
}

function dragContainer() {
  // Create the drag container that will show the item while dragging
  WebfmDrag.dragCont = Webfm.ce('div');
  WebfmDrag.dragCont.setAttribute('id','dragCont'); //id for css
  WebfmDrag.dragCont.style.cssText = 'position:absolute;display:none;';
  document.body.appendChild(WebfmDrag.dragCont);
}

function contextContainer() {
  // Create the context menu container that will display the menu
  Webfm.oldOnContextMenu = document.body.oncontextmenu;
  Webfm.oldOnMouseDown = document.onmousedown;
  Webfm.contextMenuDiv = Webfm.ce('div');
  Webfm.contextMenuDiv.setAttribute('id', 'cxtCont');  //id for css
  Webfm.contextMenuDiv.style.cssText = 'position:absolute;display:none;';
  document.body.appendChild(Webfm.contextMenuDiv);
}

/**
 * Webfm.list constructor
 *
 * 2nd param is base id of listing (multiple listing objects must have unique ids)
 * 3rd param is base id of file rows of table
 * 4th param is flag to determine if table head has the 'Create New Dir' button
 * 5th param sets styling for listing
 */
Webfm.list = function(parent, id, type, mkdir_flag, class_name) {
  var wl = this;
  this.id = id;
  this.type = type;
  this.url = Webfm.ajaxUrl();
  this.sc_n = 0;
  this.sc_m = 0;
  this.sc_s = 0;
  this.content = '';
  this.iconDir = getIconDir();

  var node = Webfm.ce("div");
  node.setAttribute('id', this.id);
  node.className = class_name;

  var elTable = Webfm.ce('table');
  var elTableBody = Webfm.ce('tbody');
  elTableBody.setAttribute('id', this.id + 'body');

  // First Row
  var elTr = Webfm.ce('tr');

  // Refresh Icon
  var elTd = Webfm.ce('td');
    elTd.className = 'navi';
    var elA = Webfm.ce('a');
    elA.setAttribute('href', '#');
    elA.setAttribute('title', Webfm.js_msg["refresh"]);
    var elImg = Webfm.ce('img');
    elImg.setAttribute('src', this.iconDir+ '/r.gif');
    elImg.setAttribute('alt', Webfm.js_msg["refresh"]);
    elA.appendChild(elImg);
    elTd.appendChild(elA);
    elTr.appendChild(elTd);
    var listener = Webfm.addEventListener(elA, "click", function(e) { wl.refresh();Webfm.stopEvent(e); });

  // Breadcrumb trail
  var elTd = Webfm.ce('td');
  elTd.colSpan = (mkdir_flag === true) ? 2 : 3;
  elTd.setAttribute('class','navi');
  // Build breadcrumb trail inside span
  var elSpan = Webfm.ce('span');
  elSpan.setAttribute('id', this.id + 'bcrumb');
  elTd.appendChild(elSpan);
  elTr.appendChild(elTd);

  if(mkdir_flag === true) {
  // Create New Directory
    var elTd = Webfm.ce('td');
    var elInput = Webfm.ce('input');
    elInput.setAttribute('type', 'button');
    elInput.setAttribute('value', Webfm.js_msg["mkdir"]);
    var listener = Webfm.addEventListener(elInput, "click", function(e) { Webfm.stopEvent(e);wl.mkdir(); });

    elTd.appendChild(elInput);
    elTr.appendChild(elTd);
  }

  elTableBody.appendChild(elTr);

  // Second Row
  var elTr = Webfm.ce('tr');
  elTr.setAttribute('id', this.id + 'head');

  // icon column
  var elTd = Webfm.ce('td');
  elTd.className = 'head';
  elTr.appendChild(elTd);

  // Sort dir/files column
  var elTd = Webfm.ce('td');
  elTd.className = 'head';
  var elA = Webfm.ce('a');
  elA.setAttribute('href', '#');
  elA.setAttribute('title', Webfm.js_msg["sort"]);
  //conditional on firstChild needed to prevent faults on world's worst browser
  var listener = Webfm.addEventListener(elA, "click", function(e) { wl.sc_n^=1;wl.loadList("n");if(this.firstChild)this.firstChild.src = wl.iconDir + '/' + ((wl.sc_n)?"up":"down") + '.gif'; Webfm.stopEvent(e); });

  var elImg = Webfm.ce('img');
  elImg.setAttribute('alt', Webfm.js_msg["sort"]);
  elImg.setAttribute('src', this.iconDir + '/down.gif');
  elA.appendChild(elImg);
  elA.appendChild(Webfm.ctn(Webfm.js_msg["column1"]));
  elTd.appendChild(elA);
  elTr.appendChild(elTd);

  // date/time column
  var elTd = Webfm.ce('td');
  elTd.className = 'head';
  var elA = Webfm.ce('a');
  elA.setAttribute('href', '#');
  var listener = Webfm.addEventListener(elA, "click", function(e) { wl.sc_m^=1;wl.loadList("m");if(this.firstChild)this.firstChild.src = wl.iconDir + '/' + ((wl.sc_m)?"up":"down") + '.gif';Webfm.stopEvent(e); });

  var elImg = Webfm.ce('img');
  elImg.setAttribute('alt', Webfm.js_msg["sort"]);
  elImg.setAttribute('src', this.iconDir + '/down.gif');
  elA.appendChild(elImg);
  elA.appendChild(Webfm.ctn(Webfm.js_msg["column2"]));
  elTd.appendChild(elA);
  elTr.appendChild(elTd);

  // size column
  var elTd = Webfm.ce('td');
  elTd.className = 'head';
  var elA = Webfm.ce('a');
  elA.setAttribute('href', '#');
  //another IE hack
  var listener = Webfm.addEventListener(elA, "click", function(e) { if(this.firstChild) {wl.sc_s^=1;wl.loadList("s"); this.firstChild.src = wl.iconDir + '/' + ((wl.sc_s)?"up":"down") + '.gif';} Webfm.stopEvent(e); });

  var elImg = Webfm.ce('img');
  elImg.setAttribute('alt', Webfm.js_msg["sort"]);
  elImg.setAttribute('src', this.iconDir + '/down.gif');
  elA.appendChild(elImg);
  elA.appendChild(Webfm.ctn(Webfm.js_msg["column3"]));
  elTd.appendChild(elA);
  elTr.appendChild(elTd);

  elTableBody.appendChild(elTr);

  elTable.appendChild(elTableBody);
  node.appendChild(elTable);
  parent.appendChild(node);
}

Webfm.list.prototype.bcrumb = function() {
  Webfm.clearNodeById(this.id + 'bcrumb');
  elSpan = Webfm.$(this.id + 'bcrumb');
  var pth = [];
  for(var i = 0; i < this.content.bcrumb.length; i++) {
    pth.push(this.content.bcrumb[i][1]);
    // display 'visible' portion of breadcrumb only
    if(this.content.bcrumb[i][0] == 'v') {
      elSpan.appendChild(Webfm.ctn(" / "));
      // No breadcrumb link necessary for current directory
      if((i < this.content.bcrumb.length - 1)) {
        var elA = Webfm.ce('a');
        // join previous loop iterations
        elA.setAttribute('href', '#');
        //title is path
        elA.setAttribute('title', pth.join("/"));
        var listener = Webfm.addEventListener(elA, "click", function(e) { Webfm.selectDir(this.title);Webfm.stopEvent(e); });

        elA.appendChild(Webfm.ctn(this.content.bcrumb[i][1]));
        elSpan.appendChild(elA);
    } else {
        elSpan.appendChild(Webfm.ctn(this.content.bcrumb[i][1]));
      }
    }
  }
}

Webfm.list.prototype.refresh = function() {
  if(Webfm.cache_history.length) {
    for(var i = 0; i < Webfm.cache_history.length; i++) {
      if(Webfm.cache_history[i] == Webfm.current) {
        Webfm.cache_history[i] = '';
        Webfm.cache[i] = '';
        break;
      }
    }
  }
  this.fetch(Webfm.current);
}

Webfm.list.prototype.fetch = function(curr_dir) {
//  Webfm.alrtObj.msg();
  var fetch = 0;
  if(curr_dir || (curr_dir = Webfm.current)) {
    //update current dir if specific dir selected
    Webfm.current = curr_dir;
    Webfm.dbgObj.dbg('fetch: ', curr_dir);
    if(Webfm.cache_history.length) {
      for(var i = 0; i < Webfm.cache_history.length; i++) {
        if(Webfm.cache_history[i] == curr_dir) {
          Webfm.dbgObj.dbg('cache hit: ', i);
          this.content = Webfm.cache[i];
          this.bcrumb();
          this.loadList();
          fetch = 1;
          break;
        }
      }
    }
    if(!fetch) {
      Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
      var postObj = { action:"read", param0:encodeURIComponent(curr_dir) };
      Webfm.HTTPPost(this.url, this.callback, this, postObj);
    }
  } else {
    Webfm.dbgObj.dbg(Webfm.js_msg["curdir-undef"]);
  }
}

Webfm.list.prototype.callback = function(string, xmlhttp, cp) {
  Webfm.progressObj.hide();
  if (xmlhttp.status == 200) {
    cp.content = Drupal.parseJson(string);
    Webfm.dbgObj.dbg("list fetch:", Webfm.dump(cp.content));
    if(cp.content.status) {
      cp.cache();
      cp.bcrumb();
      cp.loadList("n");

      // Insert current directory path into upload form
      var uploadpath = Webfm.$('edit-webfmuploadpath');
      if(uploadpath)
        uploadpath.value = cp.content.current;
      Webfm.current = cp.content.current;
    } else
      Webfm.alrtObj.msg(Webfm.js_msg["list-err"]);
  } else {
    Webfm.alrtObj.msg(Webfm.js_msg["ajax-err"]);
  }
}

// Function to create a new directory
Webfm.list.prototype.mkdir = function() {
  Webfm.alrtObj.msg();
  Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
  var postObj = { action:"mkdir", param0:encodeURIComponent(this.content.current) };
  Webfm.HTTPPost(this.url, this.mkdir_callback, this, postObj);
}

Webfm.list.prototype.mkdir_callback = function(string, xmlhttp, cp) {
  Webfm.progressObj.hide();
  if (xmlhttp.status == 200) {
    var result = Drupal.parseJson(string);
    Webfm.dbgObj.dbg("mkdir=", result.status);
    if(result.status) {
      cp.flushCache()
      cp.fetch();
    } else {
      Webfm.alrtObj.msg(Webfm.js_msg["mkdir-err"]);
    }
  } else {
    Webfm.alrtObj.msg(Webfm.js_msg["ajax-err"]);
  }
}

Webfm.list.prototype.cache = function() {
  // If current fetch not in cache_history array, add new cache_history element
  // and cache server data
  var j = Webfm.cache_history.length;
  Webfm.cache_history[j] = this.content.current;
  Webfm.cache[j] = this.content;
  Webfm.dbgObj.dbg('cache_history: ', Webfm.dump(Webfm.cache_history));
  return true;
}

Webfm.list.prototype.flushCache = function() {
  //flush all
  Webfm.dbgObj.dbg('flush cache');
  Webfm.cache_history = new Array();
  Webfm.cache = new Array();
}

Webfm.list.prototype.loadList = function(sortcol) {
  this.c_dir = 0;
  this.c_fil = 0;

  var listHead = Webfm.$(this.id + 'head');
  var parent = listHead.parentNode;
  while(listHead.nextSibling)
    parent.removeChild(listHead.nextSibling);

  // Build directory rows and append to table
  this.sortTable(this.content.dirs, "dir", sortcol);
  // Build file rows and append to table
  // type determines file context menu
  this.sortTable(this.content.files, this.type, sortcol);
}

Webfm.list.prototype.sortTable = function(arr, type, key) {
  var parent = Webfm.$(this.id + 'body');
  if(arr && arr.length) {
    switch (key) {
      case "s":
        arr.sort(Webfm.sortBySize);
        if(this.sc_s)
          arr.reverse();
        break;
      case "m":
        arr.sort(Webfm.sortByModified);
        if(this.sc_m)
          arr.reverse();
        break;
      case "n":
        arr.sort(Webfm.sortByName);
        if(this.sc_n)
          arr.reverse();
        break;
    }
    for(var i = 0; i < arr.length; i++)
      if(type == 'dir') {
        var dirrow = new Webfm.dirrow(parent, arr[i], i);
      }
      else
        var filerow = new Webfm.filerow(parent, arr[i], type, i);
  }
}

/**
 * Table directory row object
 */
Webfm.dirrow = function(parent, dir, index) {
  var dr = this;
  this.iconDir = getIconDir();
  //id used for drop container
  var _id = 'dirlist' + index;
  var elTr = Webfm.ce('tr');
  this.element = elTr;
  elTr.className = 'dirrow';
  this.dd = new WebfmDD(elTr, elTr.className);
  elTr.setAttribute('id', _id);
  elTr.setAttribute('title', dir.p);

  var elTd = Webfm.ce('td');
  var elImg = Webfm.ce('img');
  elImg.setAttribute('src', this.iconDir + '/d.gif');
  elImg.setAttribute('id', _id + 'dd');
  elImg.setAttribute('alt', 'Dir');
  this.menu = 'dir';
  elTd.appendChild(elImg);
  elTr.appendChild(elTd);

  var elTd = Webfm.ce('td');
  // Title of link = path
  this.clickObj = Webfm.ce('a');
  this.clickObj.setAttribute('href', '#');
  //title is path
  this.clickObj.setAttribute('title', dir.p);
  this.clickObj.appendChild(Webfm.ctn(dir.n));
  elTd.appendChild(this.clickObj);
  elTr.appendChild(elTd);

  var elTd = Webfm.ce('td');
  elTd.className = 'txt';
  elTd.appendChild(Webfm.ctn(dir.m));
  elTr.appendChild(elTd);

  var elTd = Webfm.ce('td');
  elTd.className = 'txt';
  if(dir.s) {
    var size = Webfm.size(dir.s);
    elTd.appendChild(Webfm.ctn(size));
  }
  elTr.appendChild(elTd);

  //mouse event listeners
  var listener = Webfm.addEventListener(this.element, "mousedown", function(e) { Webfm.contextMenuObj.hideContextMenu(e); dr.select(e); });
  var listener = Webfm.addEventListener(this.element, "mouseover", function() { this.className = 'dirrow selected'; });
  var listener = Webfm.addEventListener(this.element, "mouseout", function() { this.className = 'dirrow'; });
  var listener = Webfm.addEventListener(this.element, "contextmenu", function(e) { if(Webfm.renameActive == false)Webfm.contextMenuObj.showContextMenu(e, dr);Webfm.stopEvent(e); });

  parent.appendChild(elTr);
  this.c_dir ++;
}

Webfm.dirrow.prototype.select = function(event) {
  var cp = this;
  if(Webfm.renameActive == true)
    return false;
  event = event||window.event;
  switch(event.target||event.srcElement) {
    case this.clickObj:
      // Determine mouse button
      var rightclick = Webfm.rclick(event);
      if(rightclick)
        break;
      setTimeout(function(){
        //if click then no dragging...
        if(WebfmDrag.dragging==false) {
          Webfm.selectDir(cp.element.title);
        }
      },200);
      //passthrough
    default:
      this.dd.mouseButton(event);
      break;
  }
  return false;
}

/**
 * Table file row object
 *
 * fileobject elements:
 * id -> fid
 * n -> file name
 * p -> path (includes name)
 * s -> file size
 * m -> modified date
 * e -> mimetype extension
 * i -> image file.
 * w -> image width
 * h -> image height
 */
Webfm.filerow = function(parent, fileObj, idtype, index) {
  var fr = this;
  this.iconDir = getIconDir();
  this.ext = fileObj.e;
  this.filepath = fileObj.p + '/' + fileObj.n;
  var elTr = Webfm.ce('tr');
  this.element = elTr;
  elTr.className = idtype + 'row';
  this.dd = new WebfmDD(elTr, elTr.className);
  //drag object id used for download type
  var row_id = fileObj.id ? idtype + '-' + fileObj.id : 'ftpfile' + index;
  elTr.setAttribute('id', row_id);

  //title of drag object is path for move
  elTr.setAttribute('title', this.filepath);

  var elTd = Webfm.ce('td');
  var elImg = Webfm.ce('img');
  if(fileObj.i)
    elImg.setAttribute('src', this.iconDir + '/i.gif');
  else
    elImg.setAttribute('src', fr.getIconByExt());
  elImg.setAttribute('alt', 'File');
  this.menu = idtype;
  elTd.appendChild(elImg);
  elTr.appendChild(elTd);

  var elTd = Webfm.ce('td');
  this.clickObj = Webfm.ce('a');
  this.clickObj.setAttribute('href', '#');
  //title is id for webfm_send
  if(fileObj.id)
    this.clickObj.setAttribute('title', fileObj.id);
  else
    this.clickObj.setAttribute('title', this.filepath);
  this.clickObj.appendChild(Webfm.ctn(fileObj.n));
  elTd.appendChild(this.clickObj);
  elTr.appendChild(elTd);

  var elTd = Webfm.ce('td');
  elTd.className = 'txt';
  elTd.appendChild(Webfm.ctn(fileObj.m));
  elTr.appendChild(elTd);

  var elTd = Webfm.ce('td');
  elTd.className = 'txt';
  var size = Webfm.size(fileObj.s);
  elTd.appendChild(Webfm.ctn(size));
  elTr.appendChild(elTd);

  //mouse event listeners
  var listener = Webfm.addEventListener(this.element, "mousedown", function(e) { Webfm.contextMenuObj.hideContextMenu(e); fr.select(e); });
  var listener = Webfm.addEventListener(this.element, "mouseover", function() { this.className = idtype + 'row selected'; });
  var listener = Webfm.addEventListener(this.element, "mouseout", function() { this.className = idtype + 'row'; });
  var listener = Webfm.addEventListener(this.element, "contextmenu", function(e) { if(Webfm.renameActive == false)Webfm.contextMenuObj.showContextMenu(e, fr);Webfm.stopEvent(e); });

  parent.appendChild(elTr);
  this.c_fil++;
}

Webfm.filerow.prototype.select = function(event) {
  var cp = this;
  if(Webfm.renameActive == true)
    return false;
  event = event||window.event;
  switch(event.target||event.srcElement) {
    case this.clickObj:
      // Determine mouse button
      var rightclick = Webfm.rclick(event);
      if(rightclick)
        break;
      setTimeout(function(){
        //if click then no dragging...
        if(WebfmDrag.dragging==false) {
          //element id used for download method (webfm_send||direct http access)
          Webfm.selectFile(cp.clickObj.title, cp.element.id);
        }
      },200);
      //passthrough
    default:
      this.dd.mouseButton(event);
      break;
  }
  return false;
}

Webfm.filerow.prototype.getIconByExt = function() {
  var icon = "";

  var ext = new String(this.ext);
  if(ext) {
    ext = ext.replace(/\//g, "_");
    if(Webfm.mime_type[ext]) {
      icon = this.iconDir + '/' + Webfm.mime_type[ext] + '.gif';
    } else if(Webfm.icons["e" + ext]) {
      icon = this.iconDir + '/' + Webfm.icons["e" + this.ext] + '.gif';
    }
  }

  // extension stored in file record of db fails - use pathname
  if(!(icon)) {
    ext = new String(this.filepath);
    var last = ext.lastIndexOf(".");
    if(last != -1)
      // "." found
      ext = ext.slice(last + 1);
    else
      ext = "";
    icon = this.iconDir + '/' + ((Webfm.icons["e" + ext]) ? Webfm.icons["e" + ext] : "f") + '.gif';
  }
  return icon;
}

/**
 * Webfm.tree constructor
 *
 * 2nd param is base id of listing (multiple tree objects must have unique ids)
 * 3rd param is name of tree
 * 4th param is ajax fetch operation
 */
Webfm.tree = function(parent, id, treeTitle, op) {
  var wt = this;
  this.id = id;
  this.action = op;
  this.icondir = getIconDir();
  this.content = '';
  this.rootId = id + 'root';
  this.expAllData = [['collapse', 'minus', 'block'], ['expand', 'plus', 'none']];
  // Set tree exp/collapse behaviour on load (0 = expanded, 1 = collapsed)
  this.expAllIndex = 1;

  var node = Webfm.ce("div");
  node.setAttribute('id', id);

  //build tree and display
  var elA = Webfm.ce('a');
  elA.setAttribute('href', '#');
  elA.setAttribute('title', Webfm.js_msg["refresh"]);
  var listener = Webfm.addEventListener(elA, "click", function(e) { wt.fetch();Webfm.stopEvent(e); });

  var elImg = Webfm.ce('img');
  elImg.setAttribute('src', this.icondir + '/r.gif');
  elImg.setAttribute('alt', Webfm.js_msg["refresh"]);
  elA.appendChild(elImg);
  node.appendChild(elA);
  node.appendChild(Webfm.ctn(' ' + treeTitle + ' Tree'));

  // Expand/Collapse all folders buttons
  var elSpan = Webfm.ce("span");
  elSpan.setAttribute('id', id + 'exp');
  for(var i = 0; i < 2; i++) {
    var elA = Webfm.ce('a');
    elA.setAttribute('href', '#');
    if (i) {
      var listener = Webfm.addEventListener(elA, "click", function(e) { wt.exp(0);Webfm.stopEvent(e); });
    } else {
      var listener = Webfm.addEventListener(elA, "click", function(e) { wt.exp(1);Webfm.stopEvent(e); });
    }
    var elImg = Webfm.ce('img');
    elImg.setAttribute('alt', this.expAllData[i][0]);
    elImg.setAttribute('src', this.icondir + '/' + this.expAllData[i][1] + '.gif');
    elA.appendChild(elImg);
    elSpan.appendChild(elA);
  }
  node.appendChild(elSpan);

  var rootDiv = Webfm.ce("div");
  rootDiv.setAttribute('id', this.rootId);

  node.appendChild(rootDiv);

  parent.appendChild(node);
}

Webfm.tree.prototype.fetch = function(list) {
  // Reset ul count (0=root)
  this.treeUlCounter = 0;
  this.treeNodeCounter = 0;
  this.list = list;

  var url = Webfm.ajaxUrl();
  Webfm.alrtObj.msg();
  Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
//Webfm.dbgObj.dbg("tree fetch url:", url);
  var postObj = { action:encodeURIComponent(this.action) };
  Webfm.HTTPPost(url, this.callback, this, postObj);
}

Webfm.tree.prototype.callback = function(string, xmlhttp, cp) {
  Webfm.progressObj.hide();
  if (xmlhttp.status == 200) {
    cp.content = Drupal.parseJson(string);
Webfm.dbgObj.dbg("tree fetch:", Webfm.dump(cp.content));
    //clear dir_tree div
    Webfm.clearNodeById(cp.rootId);
    Webfm.dropContainers = [];

    // Recursively build directory tree from php associative array
    var parent = Webfm.$(cp.rootId);
    cp.buildTreeRecur(cp.content.tree, parent, '');
    cp.init();
    if(cp.list)
      Webfm.dirListObj.fetch(cp.content.current);
  } else {
    Webfm.alrtObj.msg(Webfm.js_msg["ajax-err"]);
  }
}

Webfm.tree.prototype.getpath = function() {
  return this.content.current;
}

Webfm.tree.prototype.showHideNode = function (event) {
  event = event||window.event;
  var collapseIcon = event.target||event.srcElement;
  if(collapseIcon.style.visibility == 'hidden')
    return;
  var ul = collapseIcon.parentNode.parentNode.getElementsByTagName('ul')[0];
  if(collapseIcon.title == this.expAllData[0][0]) {
    collapseIcon.src = this.icondir + '/' + this.expAllData[1][1] + '.gif';
    collapseIcon.alt = this.expAllData[1][0];
    collapseIcon.title = this.expAllData[1][0];
    ul.style.display = this.expAllData[1][2];
  }else{
    collapseIcon.src = this.icondir + '/' + this.expAllData[0][1] + '.gif';
    collapseIcon.alt = this.expAllData[0][0];
    collapseIcon.title = this.expAllData[0][0];
    ul.style.display = this.expAllData[0][2];
  }
}

Webfm.tree.prototype.buildTreeRecur = function(content, parent, input_path) {
  var cp = this;
  //php associative array is always a single member array with nested objects
  if(Webfm.isArray(content)) {
    this.buildTreeRecur(content[0], parent, '');
  } else if (Webfm.isObject(content)) {
    if(input_path)
      input_path += "/";
    var elUl = Webfm.ce('ul');
    elUl.setAttribute('id', this.id + '_ul_' + this.treeUlCounter++);
    // sort object here since php does not have a case-sensitive ksort
    var sortDir = [];
    for (var i in content) {
      sortDir.push(i);
    }
    if(sortDir.length) {
      sortDir.sort(Webfm.sortByKey);
      for(var j = 0; j < sortDir.length; j++) {
        var newpath = input_path + sortDir[j];
        var elLi = Webfm.ce('li');
        var _id = this.id + 'node' + this.treeNodeCounter;
        elLi.setAttribute('id', _id);
        elLi.setAttribute('title', newpath);
        elLi.className = this.treeNodeCounter ? 'treerow':'treeroot';

        var elDiv = Webfm.ce('div');
        var elImg = Webfm.ce('img');
        elImg.setAttribute('src', this.icondir + '/' + this.expAllData[this.expAllIndex][1] + '.gif');
        elImg.setAttribute('alt', this.expAllData[this.expAllIndex][0]);
        elImg.setAttribute('title', this.expAllData[this.expAllIndex][0]);
        elDiv.appendChild(elImg);
        elLi.appendChild(elDiv);
        var listener = Webfm.addEventListener(elImg, "click", function(e) { cp.showHideNode(e);Webfm.stopEvent(e); });
        var treeNode = new Webfm.treeNode(elDiv, newpath, _id, this.treeNodeCounter, elImg);
        this.treeNodeCounter++;
        this.buildTreeRecur(content[sortDir[j]], elLi, newpath);
        elUl.appendChild(elLi);
      }
    }

    // Always show root
    if(elUl.id == this.id + '_ul_0')
      elUl.style.display='block';
    else
      elUl.style.display = this.expAllData[this.expAllIndex][2];

    parent.appendChild(elUl);
  }
}

Webfm.tree.prototype.init = function() {
  var rootDiv = Webfm.$(this.rootId);
  // Determine if expand/collapse icon is present
  // Create event objects for each element
  var dirItems = rootDiv.getElementsByTagName('li');
  if (dirItems.length) {
    for(var i = 0; i < dirItems.length; i++) {
      var subItems = dirItems[i].getElementsByTagName('ul');
      if(!subItems.length)
        // Hide collapse icon if no sub-directories
        dirItems[i].getElementsByTagName('img')[0].style.visibility='hidden';
    }
  }
}

Webfm.tree.prototype.exp = function(expcol) {
  Webfm.clearNodeById(this.rootId);
  var _tree = Webfm.$(this.rootId);

  // Rebuild dirtree ul/li objects from dirtree object
  this.expAllIndex = expcol;
  this.treeUlCounter = 0;
  this.treeNodeCounter = 0;

  this.buildTreeRecur(this.content.tree, _tree, '');
  this.init();
}

Webfm.treeNode = function(parent, path, id, count, expImg) {
  var tn = this;
  this.parent = parent
  this.element = parent.parentNode;
  this.dd = new WebfmDD(this.element, this.element.className);
  var icondir = getIconDir();
  this.expClickObj = expImg;
  var elImg = Webfm.ce('img');
  elImg.setAttribute('id', id + 'dd');
  elImg.setAttribute('src', icondir + '/d.gif');
  parent.appendChild(elImg);
  this.menu = null;
  this.clickObj = Webfm.ce('a');
  this.clickObj.href = '#';
  //anchor title is path
  this.clickObj.setAttribute('title', path);
  var root = [];
  root = path.split('/');
  //textNode is last directory name of path string
  this.clickObj.appendChild(Webfm.ctn(root[root.length - 1]));
  parent.appendChild(this.clickObj);

  //mouse event listeners
  if(count) {
    this.menu = 'dir';
    //prevent down event if in process of renaming element with aid of mouse
    var listener = Webfm.addEventListener(parent, "mousedown", function(e) { Webfm.contextMenuObj.hideContextMenu(e); tn.select(e); });
  } else {
    this.menu = 'root';
    var listener = Webfm.addEventListener(this.clickObj, "click", function(e) { if(Webfm.renameActive == false)Webfm.selectDir(this.title); Webfm.stopEvent(e); });
  }
  var listener = Webfm.addEventListener(parent, "mouseover", function() { this.className = 'selected'; });
  var listener = Webfm.addEventListener(parent, "mouseout", function() { this.className = ''; });
  var listener = Webfm.addEventListener(parent, "contextmenu", function(e) { if(Webfm.renameActive == false)Webfm.contextMenuObj.showContextMenu(e, tn);Webfm.stopEvent(e); });
}

Webfm.treeNode.prototype.select = function(event) {
  var cp = this;
  if(Webfm.renameActive == true)
    return false;
  event = event||window.event;
  switch(event.target||event.srcElement) {
    case this.expClickObj:
      break;
    case this.clickObj:
      // Determine mouse button
      var rightclick = Webfm.rclick(event);
      if(rightclick)
        break;
      setTimeout(function(){
        //if click then no dragging...
        if(WebfmDrag.dragging==false) {
          Webfm.selectDir(cp.clickObj.title);
        }
      },200);
      //passthrough
    default:
      this.dd.mouseButton(event);
      break;
  }
  return false;
}

Webfm.selectDir = function(path) {
  Webfm.dirListObj.fetch(path);
}

Webfm.selectFile = function(path, id, as_file) {
  //files in ftp listing have file path as title
  //files inside webfm have fid as title
  var ftp = false;
  if(id.substring(0,3) != 'ftp') {
    path = 'webfm_send/' + path;
    if(as_file == true)
      path += '/1';
  } else {
    ftp = true;
  }
  var cleanUrl = getCleanUrl();
  if(cleanUrl || ftp == true) {
    var url = getBaseUrl();
    window.location = url + '/' + path;
  } else {
    window.location = '?q=' + path;
  }
}

/**
 * Webfm.context constructor
 * Arg is handler func (contrib modules can substitute their own function)
 */
Webfm.context = function(callback) {
  this.callback = callback ? callback : this.event;
  Webfm.renameActive = false;
  this.renInput = Webfm.ce('input');
  this.renInput.setAttribute('type', 'textfield');
}

//This method allows contrib modules to add custom menuing
//2nd arg must be same as 3rd arg of Webfm.list constructor
Webfm.context.prototype.addContextMenu = function(menu, name) {
  Webfm.menu[name] = menu;
}

Webfm.context.prototype.hideContextMenu = function(event) {
  // Hide context menu and restore document oncontextmenu handler
  Webfm.contextMenuDiv.style.display = 'none';
  document.body.oncontextmenu = Webfm.oldOnContextMenu;
  document.onmousedown = Webfm.oldOnMouseDown;
}

Webfm.context.prototype.showContextMenu = function(event, obj) {
  var cp = this;
  this.element = obj.element;
  this.clickObj = obj.clickObj;
//Webfm.dbgObj.dbg('this.element.title:', this.element.title);
  document.body.oncontextmenu = new Function ("return false");
  event = event||window.event;
  var pos = WebfmDrag.mouseCoords(event);

  // We remove anything that is in our contextMenu.
  Webfm.clearNodeById('cxtCont');

  // Build menu ul and append to Webfm.contextMenuDiv
  var elUl = Webfm.ce('ul');
  var contextmenu = Webfm.menu[obj.menu];
  for(var j in contextmenu) {
    var elLi = Webfm.ce('li');
    //menu selection is title of event
    elLi.setAttribute('title', j);
    elLi.appendChild(Webfm.ctn(contextmenu[j]));
    //mouse event listeners
    //call callback func (contrib module func possible)
    var listener = Webfm.addEventListener(elLi, "mousedown", function(e) { cp.callback(e,cp); cp.hideContextMenu(e); Webfm.stopEvent(e); });
    var listener = Webfm.addEventListener(elLi, "mouseover", function(e) { this.className = 'cxtContHover'; });
    var listener = Webfm.addEventListener(elLi, "mouseout", function(e) { this.className = ''; });
    elUl.appendChild(elLi);
  }
  Webfm.contextMenuDiv.appendChild(elUl);

  if(pos.x + Webfm.contextMenuDiv.offsetWidth > (document.documentElement.offsetWidth-20)){
    pos.x = pos.x + (document.documentElement.offsetWidth - (pos.x + Webfm.contextMenuDiv.offsetWidth)) - 20;
  }

  if(pos.y + Webfm.contextMenuDiv.offsetHeight > (document.documentElement.offsetHeight-20)){
    pos.y = pos.y + (document.documentElement.offsetHeight - (pos.y + Webfm.contextMenuDiv.offsetHeight)) - 20;
  }

  Webfm.contextMenuDiv.style.left = pos.x + 'px';
  Webfm.contextMenuDiv.style.top = pos.y + 'px';

  Webfm.contextMenuDiv.style.display ='block';
  var listener = Webfm.addEventListener(document, "mousedown", function(e) { cp.hideContextMenu(e); });
  return false;
}

//Default menu selection handler (see Webfm.context constructor arg)
Webfm.context.prototype.event = function(event, obj) {
  event = event||window.event;
  var url = Webfm.ajaxUrl();
  // Determine if this.element is a file
  this.is_file = ((this.element.className != 'dirrow') && (this.element.className.substring(0,4) != 'tree'));
//Webfm.dbgObj.dbg("this.element.className:", this.element.className);
//Webfm.dbgObj.dbg("this.clickObj name:", this.clickObj.firstChild.nodeValue);
  //title of element is always full path (whether file or directory)
  var path = this.element.title;
  //event title is context menu operation
  Webfm.alrtObj.msg();
  switch((event.target||event.srcElement).title) {
    case 'rmdir':
    case 'rm':
      this.remove(url, path);
      break;

    case 'mkdir':
      this.mkdir(url, path);
      break;

    case 'meta':
      this.getmeta(url);
      break;

    case 'ren':
      this.rename(url);
      break;

    case 'att':
      this.attach(url);
      break;

    case 'det':
      this.detach(path);
      break;

    case 'dwnld':
      Webfm.selectFile(this.clickObj.title, this.element.id, true);
      break;
  }
  return false;
}

Webfm.context.prototype.remove = function(url, path) {
  if(this.confirm(Webfm.js_msg["confirm-del0"] + (this.is_file ? Webfm.js_msg["file"] : Webfm.js_msg["directory"]) + " " + path + (this.is_file ? "" : Webfm.js_msg["confirm-del1"]) + "?")) {
    Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
    var postObj = { action:"delete", param0:encodeURIComponent(path) };
    Webfm.HTTPPost(url, Webfm.ctx_callback, this, postObj);
    return false;
  }
}

Webfm.context.prototype.mkdir = function(url, path) {
  Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
  var postObj = { action:"mkdir", param0:encodeURIComponent(path) };
  Webfm.HTTPPost(url, Webfm.ctx_callback, this, postObj);
}

Webfm.context.prototype.rename = function(url) {
  cp = this;
  this.renInput.value = this.clickObj.firstChild.nodeValue;
  //clone input element since Webfm.contextMenuObj isn't destroyed on DOM
  this.tempInput = this.renInput.cloneNode(true);
  this.tempInput.setAttribute('autocomplete','off'); //FF focus bug
  this.clickparent = this.clickObj.parentNode;
  this.clickparent.replaceChild(this.tempInput, this.clickObj);
  //no change (blur) - restore original textNode
  var listener = Webfm.addEventListener(this.tempInput, "blur", function (e) { Webfm.renameActive = false; cp.clickparent.replaceChild(cp.clickObj, cp.tempInput);Webfm.stopEvent(e);  });
  //listen for enter key up - swap names (illegal names are ignored on server and next list
  //refresh will restore the proper filename)
  var listener = Webfm.addEventListener(this.tempInput, "keyup", function(e) { if(Webfm.enter(e) && Webfm.renameActive == true) cp.swapname(url, cp.tempInput); });
  setTimeout(function(){ cp.tempInput.focus();Webfm.renameActive = true; },10);
}

Webfm.context.prototype.getmeta = function(url) {
  Webfm.dbgObj.dbg("this.clickObj.title:", this.clickObj.title);
  Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
  var postObj = { action:"getmeta", param0:encodeURIComponent(this.clickObj.title) };
  Webfm.HTTPPost(url, Webfm.meta_callback, '', postObj);
}

Webfm.context.prototype.attach = function(url) {
  var fid = this.element.id.substring(this.element.id.indexOf('-') + 1);
  //check that this file is not already attached
  var attach_arr = [];
  attach_arr = Webfm.$(Webfm.attachFormInput).value.split(',');
  for(var i = 0; i < attach_arr.length; i++) {
     if(fid == attach_arr[i])
        break;
  }
  if(i == attach_arr.length) {
    Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
    var postObj = { action:"attachfile", param0:encodeURIComponent(fid) };
    Webfm.HTTPPost(url, Webfm.attach_callback, this, postObj);
  }
}

Webfm.context.prototype.detach = function(path) {
  if(this.confirm(Webfm.js_msg["confirm-det"] + path + "?")) {
    // update table
    this.element.parentNode.removeChild(this.element);
    // update form input
    var attach_arr = [];
    attach_arr = Webfm.$(Webfm.attachFormInput).value.split(',');
    var new_attach_arr = [];
    var j = 0;
    // tr elements use 'fid#' in 'title' field
    var fid = this.element.id.substring(this.element.id.indexOf('-') + 1);
    for(var i = 0; i < attach_arr.length; i++) {
      if(attach_arr[i] != fid) {
        new_attach_arr[j++] = attach_arr[i];
      }
    }
    Webfm.$(Webfm.attachFormInput).value = new_attach_arr.join(',');
  }
}

Webfm.context.prototype.confirm = function(text) {
  var agree = confirm(text);
  return agree ? true : false;
}

Webfm.context.prototype.swapname = function(url, input) {
  var newpath = [];
  var oldpath = this.element.title;
Webfm.dbgObj.dbg("oldpath:", oldpath);
  newpath = this.element.title.split('/');
  newpath.pop();
  this.droppath = newpath.join("/");
Webfm.dbgObj.dbg("droppath:", this.droppath);
  newpath.push(input.value);
  Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
  Webfm.renameActive = false;
Webfm.dbgObj.dbg("newpath:", newpath.join("/"));
  var postObj = { action:"rename", param0:encodeURIComponent(oldpath), param1:encodeURIComponent(newpath.join("/")) };
  Webfm.HTTPPost(url, Webfm.ctx_callback, this, postObj);
  return true;
}

Webfm.attach_callback = function(string, xmlhttp, cp) {
  Webfm.progressObj.hide();
  if (xmlhttp.status == 200) {
    var result = Drupal.parseJson(string);
    Webfm.dbgObj.dbg("result", Webfm.dump(result));
    if (result.status) {
      var filerow = new Webfm.filerow(Webfm.$('webfm-attachbody'), result.attach, 'attach');
      var elInput = Webfm.$(Webfm.attachFormInput);
      elInput.setAttribute('value', (elInput.getAttribute('value')?elInput.getAttribute('value')+',':'') + result.attach.id);
    } else
      Webfm.alrtObj.msg(Webfm.js_msg["attach-err"]);
  } else {
    Webfm.alrtObj.msg(Webfm.js_msg["ajax-err"]);
  }
}

Webfm.ctx_callback = function(string, xmlhttp, cp) {
  Webfm.progressObj.hide();
  if (xmlhttp.status == 200) {
    var result = Drupal.parseJson(string);
    if (result.status) {
      if(!cp.is_file) {
        if(cp.element.id.substring(0,3) == 'ftp')
          Webfm.ftpTreeObj.fetch();
        else if(Webfm.dirTreeObj)
          Webfm.dirTreeObj.fetch();
      }
      Webfm.dirListObj.flushCache();
      Webfm.dirListObj.fetch(cp.droppath);
    } else
      Webfm.alrtObj.msg("operation fail");
  } else {
    Webfm.alrtObj.msg(Webfm.js_msg["ajax-err"]);
  }
}

Webfm.meta_callback = function(string, xmlhttp, cp) {
  Webfm.progressObj.hide();
  if (xmlhttp.status == 200) {
    var node = Webfm.$('meta-form');
    Webfm.clearNodeById('meta-form');

    var result = Drupal.parseJson(string);
    Webfm.dbgObj.dbg("meta result:", Webfm.dump(result));
    if(result.meta) {
      var elForm = Webfm.ce('form');
      var elTable = Webfm.ce('table');
      var elTBody = Webfm.ce('tbody');
      for (var i in result.meta) {
        if(i == 'fid')
          var fid = result.meta[i];

        if(Webfm.db_table_keys[i] === -1)
          //hidden field
          continue;
        var elTr = Webfm.ce('tr');
        var elTd = Webfm.ce('td');
        elTd.appendChild(Webfm.ctn(i + ': '));
        elTr.appendChild(elTd);

        var elTd = Webfm.ce('td');
        if(Webfm.db_table_keys[i] === 0) {
          // read only field
          elTd.appendChild(Webfm.ctn(result.meta[i]));
        } else {
          // Modifiable field
          var elInput = Webfm.ce('input');
          elInput.setAttribute('type', 'textfield');
          elInput.setAttribute('name', i);
          elInput.setAttribute('size', '40');
          elInput.setAttribute('value', result.meta[i]);
          var listener = Webfm.addEventListener(elInput, "keyup", function(e) { if(Webfm.enter(e))Webfm.validateMetaInput(this); Webfm.stopEvent(e); });
          elTd.appendChild(elInput);
        }
        elTr.appendChild(elTd);
        // td for validation error msg
        var elTd = Webfm.ce('td');
        elTd.appendChild(Webfm.ctn(String.fromCharCode(160))); //&nbsp;
        elTr.appendChild(elTd);
        elTBody.appendChild(elTr);
      }
      var elTr = Webfm.ce('tr');
      var elTd = Webfm.ce('td');
      var button = Webfm.ce('input');
      button.setAttribute('type', 'button');
      button.setAttribute('value', Webfm.js_msg["submit"]);
      var listener = Webfm.addEventListener(button, "click", function(e) { Webfm.submitMeta(elForm, fid);Webfm.stopEvent(e);this.blur(); });

      elTd.appendChild(button);
      elTr.appendChild(elTd);

      var elTd = Webfm.ce('td');
      elTd.setAttribute('colspan', '2');
      var button = Webfm.ce('input');
      button.setAttribute('type', 'button');
      button.setAttribute('value', Webfm.js_msg["clear"]);
      var listener = Webfm.addEventListener(button, "click", function(e) { Webfm.clearNodeById('meta-form');Webfm.stopEvent(e); });

      elTd.appendChild(button);
      elTr.appendChild(elTd);

      elTBody.appendChild(elTr);
      elTable.appendChild(elTBody);
      elForm.appendChild(elTable);

      node.appendChild(elForm);
    } else
      Webfm.alrtObj.msg(Webfm.js_msg["getmeta-err"]);
  } else {
    Webfm.alrtObj.msg(Webfm.js_msg["ajax-err"]);
  }
}

// Validate the length of input
Webfm.validateMetaInput = function(field) {
  var len = Webfm.db_table_keys[field.name];
Webfm.dbgObj.dbg("validateMetaInput", field.name);
  if(len < 256) {
    var data = Webfm.trim(field.value);
    if(data.length > len) {
      var err_msg = Webfm.ctn(Webfm.js_msg["len-err"]);
      field.parentNode.nextSibling.setAttribute('style', 'color:red');
      field.parentNode.nextSibling.appendChild(err_msg);
      setTimeout(function(){field.focus();},10);
      return false;
    } else {
      while (field.parentNode.nextSibling.hasChildNodes())
        field.parentNode.nextSibling.removeChild(field.parentNode.nextSibling.firstChild);
    }
  }
  return true;
}

Webfm.submitMeta = function(form, fid) {
  var url = Webfm.ajaxUrl();
  var inputs = [];
  var metadata = [];
  inputs = form.getElementsByTagName('input');
  // Do not include submit + clear inputs
  var input_num = inputs.length - 2;
  for(var i = 0; i < input_num; i++) {
    if(!(Webfm.validateMetaInput(inputs[i])))
      break;
  }
  if(i == input_num) {
    for(var i = 0; i < input_num; i++) {
      metadata.push('#' + inputs[i].name + '=' + Webfm.trim(inputs[i].value));
    }
    Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
    var postObj = { action:"putmeta", param0:encodeURIComponent(fid), param1:encodeURIComponent(metadata.join(",")) };
    Webfm.HTTPPost(url, Webfm.submitMetacallback, '', postObj);
  } else {
    alert('Correct Input');
  }
}

Webfm.submitMetacallback = function(string, xmlhttp, cp) {
  Webfm.progressObj.hide();
  if (xmlhttp.status == 200) {
    var result = Drupal.parseJson(string);
    if (result.status) {
      Webfm.dbgObj.dbg('meta result:', result.status);
    } else
      Webfm.alrtObj.msg(Webfm.js_msg["sendmeta-err"]);
  } else {
    Webfm.alrtObj.msg(Webfm.js_msg["ajax-err"]);
  }
}

// Trim leading/trailing whitespace off string
Webfm.trim = function(str) {
  return str.replace(/^\s+|\s+$/g, '');
}

/*
 * Webfm.attach constructor
 * Load the attachments into node-edit
 * TO DO: retain contents of attachments until submit
 */
Webfm.attach = function(parentId) {
  var wa = this;
  this.id = parentId
  this.attached = '';

  var elTable = Webfm.ce('table');
  var elTableBody = Webfm.ce('tbody');
  //this div needed to append new attach rows
  elTableBody.setAttribute('id', this.id + 'body');

  //Header
  var elTr = Webfm.ce('tr');
  //this div is start of clearing nodes on fetch
  elTr.setAttribute('id', this.id + 'head');

  // icon column
  var elTd = Webfm.ce('td');
  elTd.className = 'head';
  elTr.appendChild(elTd);

  // Sort dir/files column
  var elTd = Webfm.ce('td');
  elTd.className = 'head';
  elTd.appendChild(Webfm.ctn(Webfm.js_msg["attach-title"]));
  elTr.appendChild(elTd);

  // date/time column
  var elTd = Webfm.ce('td');
  elTd.className = 'head';
  elTd.appendChild(Webfm.ctn(Webfm.js_msg["column2"]));
  elTr.appendChild(elTd);

  // file size column
  var elTd = Webfm.ce('td');
  elTd.className = 'head';
  elTd.appendChild(Webfm.ctn(Webfm.js_msg["column3"]));
  elTr.appendChild(elTd);

  elTableBody.appendChild(elTr);
  elTable.appendChild(elTableBody);
  Webfm.$(parentId).appendChild(elTable);

  // Nest metadata fieldset in attach fieldset
  var metaObj = new Webfm.meta(Webfm.$(parentId));
}

Webfm.attach.prototype.fetch = function() {
  var url = Webfm.ajaxUrl();
  // action attribute of node-edit form contains the node number
  var node_url = Webfm.$('node-form').action;
  Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
  var postObj = { action:"attach", param0:encodeURIComponent(node_url) };
  Webfm.HTTPPost(url, this.callback, this, postObj);
}

Webfm.attach.prototype.callback = function(string, xmlhttp, cp) {
  Webfm.progressObj.hide();
  if (xmlhttp.status == 200) {
    result = Drupal.parseJson(string);
    Webfm.dbgObj.dbg("attach.fetch:", Webfm.dump(result));
    if(result.status) {
      if(result.attach.length) {
        var elInput = Webfm.$(Webfm.attachFormInput);
        var elTableBody = Webfm.$(cp.id + 'body')
        for(var i = 0; i < result.attach.length; i++) {
          var filerow = new Webfm.filerow(elTableBody, result.attach[i], 'attach');
          elInput.setAttribute('value', (elInput.getAttribute('value')?elInput.getAttribute('value')+',':'') + result.attach[i].id);
        }
      }
    } else
      Webfm.alrtObj.msg(Webfm.js_msg["fetch-att-err"]);
  } else {
    Webfm.alrtObj.msg(Webfm.js_msg["ajax-err"]);
  }
}

/**
 * Webfm.meta constructor
 */
Webfm.meta = function(parent) {
  var elFset = Webfm.ce('fieldset');
  elFset.setAttribute('id', 'metadata');
  Webfm.collapseFSet(elFset, Webfm.js_msg["meta-title"]);
  var fsetWrapper = Webfm.ce('div');
  fsetWrapper.className = "fieldset-wrapper";
  var metadata_msg = Webfm.ce('div');
  metadata_msg.setAttribute('id', 'meta-form');
  fsetWrapper.appendChild(metadata_msg);
  elFset.appendChild(fsetWrapper);
  parent.appendChild(elFset);
}

/**
 * Webfm.search constructor
 */
Webfm.search = function(parent, op) {
  var cp = this;
  this.action = op;
  this.listId = 'searchresult';
  var elFset = Webfm.ce('fieldset');
  elFset.setAttribute('id', 'filesearch');
  Webfm.collapseFSet(elFset, Webfm.js_msg["search-title"]);
  var fsetWrapper = Webfm.ce('div');
  fsetWrapper.className = "fieldset-wrapper";
  var elDiv = Webfm.ce('div');
  elDiv.className = "description";
  elDiv.appendChild(Webfm.ctn(Webfm.js_msg["search-cur"]));
  fsetWrapper.appendChild(elDiv);
  var elInput = Webfm.ce('input');
  elInput.setAttribute('type', 'textfield');
  elInput.setAttribute('size', '40');
  fsetWrapper.appendChild(elInput);
  var searchButton = Webfm.ce('input');
  searchButton.setAttribute('type', 'button');
  searchButton.setAttribute('value', Webfm.js_msg["search"]);
  var listener = Webfm.addEventListener(searchButton, "click", function(e) { cp.submit(elInput.value);Webfm.stopEvent(e); });

  fsetWrapper.appendChild(searchButton);
  var elDiv = Webfm.ce('div');
  elDiv.setAttribute('id', this.listId);
  fsetWrapper.appendChild(elDiv);
  elFset.appendChild(fsetWrapper);
  parent.appendChild(elFset);
}

Webfm.search.prototype.submit = function(value) {
  var url = Webfm.ajaxUrl();
  Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
  var postObj = { action:encodeURIComponent(this.action), param0:encodeURIComponent(Webfm.current), param1:encodeURIComponent(value) };
  Webfm.HTTPPost(url, this.callback, this, postObj);
}

Webfm.search.prototype.callback = function(string, xmlhttp, cp) {
  Webfm.progressObj.hide();
  if (xmlhttp.status == 200) {
    var node = Webfm.$(cp.listId);
    // Empty directory listing node
    Webfm.clearNodeById(cp.listId);

    var result = Drupal.parseJson(string);

    if(result.files.length) {
      var searchList = Webfm.ce('ul');
      for(var i = (result.files.length - 1); i >= 0; i--) {
        var _id = 'searchrow' + i;
        var elLi = Webfm.ce('li');
        elLi.setAttribute('id', _id);
        elLi.className = cp.listId + 'row';

        var iconDir = getIconDir();
        var elImg = Webfm.ce('img');
        elImg.setAttribute('src', iconDir + '/d.gif');
        elImg.setAttribute('alt', 'Dir');
        //title is path
        elImg.setAttribute('title', result.files[i].p);
        var listener = Webfm.addEventListener(elImg, "click", function(e) { Webfm.selectDir(this.title); });
        elLi.appendChild(elImg);

        elLi.appendChild(Webfm.ctn('  '));

        var elA = Webfm.ce('a');
        elA.setAttribute('href', '#');
        elA.setAttribute('title', result.files[i].id);
        var listener = Webfm.addEventListener(elA, "click", function(e) { Webfm.selectFile(this.title, this.parentNode.id); Webfm.stopEvent(e); });
        elA.appendChild(Webfm.ctn(result.files[i].n));
        elLi.appendChild(elA);

        searchList.appendChild(elLi);
      }
      node.appendChild(searchList);
    } else {
      var no_match = Webfm.ctn(Webfm.js_msg["no-match"]);
      node.setAttribute('style', 'color:red');
      node.appendChild(no_match);
    }
  } else {
    Webfm.alrtObj.msg(Webfm.js_msg["ajax-err"]);
  }
}

// Webfm debug Collapsible Fieldset
Webfm.debug = function(parent) {
  if(parent) {
    var elFset = Webfm.ce('fieldset');
    elFset.setAttribute('id', 'debug');
    Webfm.collapseFSet(elFset, Webfm.js_msg["debug-title"]);
    var fsetWrapper = Webfm.ce('div');
    fsetWrapper.className = "fieldset-wrapper";
    var dbg_control = Webfm.ce('div');
    var elInput = Webfm.ce('input');
    elInput.setAttribute('type', 'button');
    elInput.setAttribute('value', Webfm.js_msg["clear"]);
    var listener = Webfm.addEventListener(elInput, "click", function(e) { Webfm.clearNodeById('dbg');Webfm.alrtObj.msg();Webfm.stopEvent(e); });
    dbg_control.appendChild(elInput);
    var elInput = Webfm.ce('input');
    elInput.setAttribute('type', 'button');
    elInput.setAttribute('value', Webfm.js_msg["cache"]);
    var listener = Webfm.addEventListener(elInput, "click", function(e) { Webfm.alrtObj.msg(Webfm.dump(Webfm.cache));Webfm.stopEvent(e); });
    dbg_control.appendChild(elInput);
    fsetWrapper.appendChild(dbg_control);
    this.msg = Webfm.ce('div');
    this.msg.setAttribute('id', 'dbg');
    fsetWrapper.appendChild(this.msg);
    elFset.appendChild(fsetWrapper);
    parent.appendChild(elFset);
  } else {
    this.msg = '';
  }
}

Webfm.debug.prototype.dbg = function(title, msg) {
  if(this.msg) {
    //put latest msg at top (less scrolling)
    elBr = Webfm.ce('br');
    this.msg.insertBefore(elBr, this.msg.firstChild);
    if(msg) {
      this.msg.insertBefore(Webfm.ctn(msg), this.msg.firstChild);
    }
    if(title) {
      var elSpan = Webfm.ce('span');
      elSpan.className = 'g';
      elSpan.appendChild(Webfm.ctn(title));
      this.msg.insertBefore(elSpan, this.msg.firstChild);
    }
  }
}

/**
 * Progress indicator
 */
Webfm.progress = function(parent, id) {
  this.id = id;
  this.flag = false;
  var elSpan = Webfm.ce('span');
  elSpan.setAttribute('id', this.id);
  elSpan.className = 'progress';
  parent.appendChild(elSpan);
}

Webfm.progress.prototype.hide = function() {
  if(this.flag) {
    this.flag = false;
    Webfm.clearNodeById(this.id);
  }
}

Webfm.progress.prototype.show = function(x, y) {
  if(!this.flag) {
    this.flag = true;
    var prog = Webfm.$(this.id);
    var elSpan = Webfm.ce('span');
    elSpan.setAttribute('style', 'background-color:' + y);
    elSpan.appendChild(Webfm.ctn(x));
    prog.appendChild(elSpan);
    prog.style.visibility = 'visible';
  }
}

/**
 * Alert indicator
 */
Webfm.alert = function(parent, id) {
  this.id = id;
  var elDiv = Webfm.ce('div');
  elDiv.setAttribute('id', id);
  parent.appendChild(elDiv);
}

Webfm.alert.prototype.msg = function(msg) {
  if(!msg) {
    Webfm.clearNodeById(this.id);
  } else {
    var node = Webfm.$(this.id);
    var elSpan = Webfm.ce('span');
    elSpan.className = 'alertspan';
    elSpan.appendChild(Webfm.ctn(msg));
    node.appendChild(elSpan);
  }
}

/**
 * WebfmDD constructor
 */
function WebfmDD(element, _class) {
  this.element = element;
  this.type = _class;
  this.is_file = ((this.type != 'dirrow') && (this.type.substring(0,4) != 'tree'));
  this.icondir = getIconDir();
}

WebfmDD.prototype.mouseButton = function(event) {
  event = event||window.event;

  // Determine mouse button
  var rightclick = Webfm.rclick(event);
  if(!rightclick)
    this.beginDrag(event);
}

WebfmDD.prototype.beginDrag = function (event) {
  if (WebfmDrag.dragging) {
    return;
  }
  WebfmDrag.dragging = true;
  var cp = this;
  this.oldMoveHandler = document.onmousemove;
  document.onmousemove = function(e) { cp.handleDrag(e); };
  this.oldUpHandler = document.onmouseup;
  document.onmouseup = function(e) { cp.endDrag(e); };

  this.offset = this.getMouseOffset(event);

  // Make transparent
  this.element.style.opacity = 0.5;

  // Process
  this.handleDrag(event);
}

WebfmDD.prototype.handleDrag = function (event) {
  if (!(WebfmDrag.dragging)) {
    return;
  }
  var cp = this;
  event = event||window.event;

  //Build WebfmDrag.dropContainers array
  //The dragStart flag ensures that the following executes once only at the
  //beginning of a drag-drop
  if (!(WebfmDrag.dragStart)) {
    WebfmDrag.dragStart = true;

    //copy dragged element into drag container and make visible
    WebfmDrag.dragCont.appendChild(this.element.cloneNode(true));
    WebfmDrag.dragCont.style.display = 'block'

    WebfmDrag.dropContainers = [];

    // Build list drop container array
    if(this.type != 'attachrow') {
      var dirListRows = Webfm.$('dirlist').getElementsByTagName('tr');
      var dirListCont = [];
      for(var k = 0; k < dirListRows.length; k++) {
        if (dirListRows[k].className == 'dirrow') {
          dirListCont.push(dirListRows[k]);
        }
      }
      if (dirListCont.length) {
        for(var i = 0; i < dirListCont.length; i++) {
          // DragDrop element is folder icon
          var droptarget = dirListCont[i];
          var cont_pos = Drupal.absolutePosition(droptarget);
          var skip = false;
          var droppath = dirListCont[i].title;
          var curpath = this.element.title;
          if(curpath == droppath)
            continue;
          if(this.type.substring(0,4) == 'tree') {
            var curtemp = [];
            curtemp = curpath.split('/');
            var droptemp = [];
            droptemp = droppath.split('/');
            // Test if drop path is beneath the drag path
            for(var j = 0; j < curtemp.length; j++) {
              if(curtemp[j] != droptemp[j])
                break;
            }
            if(j == curtemp.length) {
              skip = true;
            } else {
              // Test if drop path is directly above drag path (already a subdir)
              for(var j = 0; j < droptemp.length; j++) {
                if(curtemp[j] != droptemp[j])
                 break;
              }
              if((j == droptemp.length) && (curtemp.length == j + 1))
                skip = true;
            }
          }
          if(skip == false) {
            // Valid drop container
            var container = { id: dirListCont[i].id, x: cont_pos.x, y: cont_pos.y, w: droptarget.offsetWidth, h: droptarget.offsetHeight };
            WebfmDrag.dropContainers.push(container);
          }
        }
      }

      var dirTreeCont = '';
      dirTreeCont = Webfm.$("dirtree")
      if(dirTreeCont) {
          //reuse var for container list
          dirTreeCont = Webfm.$("dirtree").getElementsByTagName('li');
        if (dirTreeCont.length) {
          // Build tree drop container array
          for(var i = 0; i < dirTreeCont.length; i++) {
            // DragDrop element is folder icon
            var droptarget = dirTreeCont[i].getElementsByTagName('div')[0];
            var cont_pos = Drupal.absolutePosition(droptarget);
            var skip = false;

            if(this.type.substring(0,4) == 'tree') {
              // Prevent a directory drop onto itself or its direct parent li (already a sub-directory)
              if((dirTreeCont[i] != this.element) && (dirTreeCont[i] != this.element.parentNode.parentNode)) {
                var children = this.element.getElementsByTagName('li');
                // Prevent a directory drop into a sub-directory
                for(var j = 0; j < children.length; j++) {
                  if(children[j] == dirTreeCont[i])
                    skip = true;
                }
              } else {
                skip = true;
              }
            } else {
              //this.type=='list'
              var curpath = this.element.title;
              var droppath = dirTreeCont[i].title;
              // A regex would be preferable here
              if(curpath != droppath){
                var curtemp = [];
                curtemp = curpath.split('/');
                var droptemp = [];
                droptemp = droppath.split('/');
                // Test if drop path is beneath the drag path
                for(var j = 0; j < curtemp.length; j++) {
                  if(curtemp[j] != droptemp[j])
                    break;
                }
                if(j == curtemp.length) {
                  skip = true;
                } else {
                  // Test if drop path is directly above drag path (already a subdir)
                  for(var j = 0; j < droptemp.length; j++) {
                    if(curtemp[j] != droptemp[j])
                      break;
                  }
                  if((j == droptemp.length) && (curtemp.length == j + 1))
                    skip = true;
                }
              } else {
                skip = true;
              }
            }

            if(skip == false) {
              // Valid drop container - add to array of drop containers
              var container = { id: dirTreeCont[i].id, x: cont_pos.x, y: cont_pos.y, w: droptarget.offsetWidth, h: droptarget.offsetHeight };
              WebfmDrag.dropContainers.push(container);
            }
          }
        }
      }
    } else {
      // attachment container is attach table body
      var droptarget = Webfm.$('webfm-attachbody');
      var cont_pos = Drupal.absolutePosition(droptarget);
      WebfmDrag.attachContainer = { x: cont_pos.x, y: cont_pos.y, w: droptarget.offsetWidth, h: droptarget.offsetHeight };
    }
  }

  var pos = WebfmDrag.mouseCoords(event);
  var y = pos.y - this.offset.y;
  var x = pos.x - this.offset.x;

  //Scroll page if near top or bottom edge.  Hardcoded values
  var scroll = this.scroll();
  if(typeof(window.innerHeight) == 'number') {
    if(pos.y > (window.innerHeight + scroll - 35)) {
      window.scrollBy(0,20);
    } else if(pos.y  - scroll < (25)) {
      window.scrollBy(0,-20);
    }
  } else if(document.documentElement && document.documentElement.clientHeight) {
    if(pos.y > (document.documentElement.clientHeight + scroll - 35)) {
      window.scrollBy(0,20);
    } else if(pos.y  - scroll < (25)) {
      window.scrollBy(0,-20);
    }
  }

  // move our drag container to wherever the mouse is (adjusted by mouseOffset)
  WebfmDrag.dragCont.style.top  = y + 'px';
  WebfmDrag.dragCont.style.left = x + 'px';

  if(this.type != 'attachrow') {
    WebfmDrag.activeCont = null;
    if(WebfmDrag.dropContainers.length) {
      // Compare mouse position to every drop container
      for(var i = 0; i < WebfmDrag.dropContainers.length; i++) {
        if((WebfmDrag.dropContainers[i].x < pos.x) &&
           (WebfmDrag.dropContainers[i].y < pos.y) &&
           ((WebfmDrag.dropContainers[i].w + WebfmDrag.dropContainers[i].x) > pos.x) &&
           ((WebfmDrag.dropContainers[i].h + WebfmDrag.dropContainers[i].y) > pos.y)) {
          // Found a valid drop container - Highlight selection
          WebfmDrag.activeCont = Webfm.$(WebfmDrag.dropContainers[i].id);
          Webfm.$(WebfmDrag.dropContainers[i].id + 'dd').src = this.icondir + '/open.gif';
          Webfm.$(WebfmDrag.dropContainers[i].id).className += ' selected';
        } else {
          // De-highlight container
          Webfm.$(WebfmDrag.dropContainers[i].id + 'dd').src = this.icondir + '/d.gif';
          var class_names = [];
          class_names = Webfm.$(WebfmDrag.dropContainers[i].id).className.split(' ');
          Webfm.$(WebfmDrag.dropContainers[i].id).className = class_names[0];
        }
      }
    }
  } else {
    // Ignore all movement outside of the attach table
    if((WebfmDrag.attachContainer.x < pos.x) &&
       (WebfmDrag.attachContainer.y < pos.y) &&
       ((WebfmDrag.attachContainer.w + WebfmDrag.attachContainer.x) > pos.x) &&
       ((WebfmDrag.attachContainer.h + WebfmDrag.attachContainer.y) > pos.y)) {

      // In attach container
      var att_table_body = Webfm.$('webfm-attachbody');
      var attachRows = att_table_body.getElementsByTagName('TR');
      var prevNode = '';
      var nextNode = '';
      var curr = false;
      // Start at 1 since first row is header
      for(var i = 1; i < attachRows.length; i++) {
        if(this.element.id != attachRows[i].id) {
          var att_pos = Drupal.absolutePosition(attachRows[i]);
          if((att_pos.y + (attachRows[i].offsetHeight / 2)) < pos.y) {
            if(curr == true)
              prevNode = attachRows[i];
          }
          else if((att_pos.y + (attachRows[i].offsetHeight / 2)) > pos.y) {
            if(curr == false)
              nextNode = attachRows[i];
          }
        }
        else curr = true;
      }
      if(prevNode)
        att_table_body.insertBefore(prevNode, this.element);
      else if (nextNode)
        att_table_body.insertBefore(this.element, nextNode);
    }
  }

  //prevent selection of textnodes
  Webfm.stopEvent(event);
}

WebfmDD.prototype.endDrag = function (event) {
  if (!(WebfmDrag.dragging)) {
    return;
  }
  event = event||window.event;
  var curpath = this.element.title;

  // Uncapture mouse
  document.onmousemove = this.oldMoveHandler;
  document.onmouseup = this.oldUpHandler;

  // We remove anything that is in our drag container.
  Webfm.clearNodeById('dragCont');

  // Restore opacity
  this.element.style.opacity = 1.0;
  WebfmDrag.dragging = false;
  WebfmDrag.dragStart = false;
  WebfmDrag.dragCont.style.display = 'none';
  Webfm.stopEvent(event);

  if(this.type != 'attachrow') {
    // Move dragged object if a valid drop container
    if(WebfmDrag.activeCont) {
      this.droppath = WebfmDrag.activeCont.title;
      // De-highlight container
      Webfm.$(WebfmDrag.activeCont.id + 'dd').src = this.icondir + '/d.gif';
      var class_names = [];
      class_names = WebfmDrag.activeCont.className.split(' ');
      WebfmDrag.activeCont.className = class_names[0];
      var url = Webfm.ajaxUrl();
      Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
      var postObj = { action:"move", param0:encodeURIComponent(curpath), param1:encodeURIComponent(this.droppath) };
      Webfm.HTTPPost(url, this.callback, this, postObj);
      WebfmDrag.activeCont = null;
    }
  } else {
    // Put the current order of attachments into the form in preparation for submit
    var elInput = Webfm.$('edit-attachlist');
    var attachRows = Webfm.$('webfm-attachbody').getElementsByTagName('tr');
    elInput.setAttribute('value', '');
    // Ignore 1st row (header)
    for(var i = 1; i < attachRows.length; i++) {
      var fid = attachRows[i].id.substring(attachRows[i].id.indexOf('-') + 1);
      elInput.setAttribute('value', (elInput.getAttribute('value')?elInput.getAttribute('value')+',':'') + fid);
    }
  }
}

WebfmDD.prototype.callback = function(string, xmlhttp, cp) {
  Webfm.progressObj.hide();
  if (xmlhttp.status == 200) {
    var result = Drupal.parseJson(string);
    if (result.status) {
      //update tree if directory is moved
      if(!cp.is_file)
        Webfm.dirTreeObj.fetch();
      Webfm.dirListObj.flushCache();
      if (cp.element.className != 'treerow')
        //listing draggable - update current listing by removing dropped item
        cp.element.parentNode.removeChild(cp.element)
      else
        //tree draggable - update target directory
        Webfm.dirListObj.fetch(cp.droppath);
    } else
      Webfm.alrtObj.msg(Webfm.js_msg["move-err"]);
  } else {
    Webfm.alrtObj.msg(Webfm.js_msg["ajax-err"]);
  }
}

WebfmDD.prototype.scroll = function () {
  var scrY = 0;
  if(typeof(window.pageYOffset) == 'number') {
    scrY = window.pageYOffset;
  } else if(document.body && document.body.scrollTop) {
    scrY = document.body.scrollTop;
  } else if(document.documentElement && document.documentElement.scrollTop) {
    scrY = document.documentElement.scrollTop;
  }
  return scrY;
}

WebfmDD.prototype.getMouseOffset = function(event){
  var docPos = Drupal.absolutePosition(this.element);
  var mousePos = WebfmDrag.mouseCoords(event);
  return {x:mousePos.x - docPos.x, y:mousePos.y - docPos.y};
}

WebfmDrag.mouseCoords = function(event){
  if(typeof(event.pageX) == 'number') {
    return {x:event.pageX, y:event.pageY};
  } else if (typeof( event.clientX ) == 'number') {
    if(document.body && (document.body.scrollLeft || document.body.scrollTop)) {
      return {x:event.clientX + document.body.scrollLeft - document.body.clientLeft,
              y:event.clientY + document.body.scrollTop  - document.body.clientTop };
    } else if(document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
      return {x:event.clientX + document.documentElement.scrollLeft - document.documentElement.clientLeft,
              y:event.clientY + document.documentElement.scrollTop  - document.documentElement.clientTop};
  }
  }
  return {x:0, y:0};
}

/**
 * Event Handler from http://ajaxcookbook.org (Creative Commons Attribution 2.5)
 */
Webfm.addEventListener = function(instance, eventName, listener) {
    var listenerFn = listener;
    if (instance.addEventListener) {
        instance.addEventListener(eventName, listenerFn, false);
    } else if (instance.attachEvent) {
        listenerFn = function() {
            listener(window.event);
        }
        instance.attachEvent("on" + eventName, listenerFn);
    } else {
        throw new Error("Event registration not supported");
    }
    return {
        instance: instance,
        name: eventName,
        listener: listenerFn
    };
}

Webfm.removeEventListener = function(event) {
    var instance = event.instance;
    if (instance.removeEventListener) {
        instance.removeEventListener(event.name, event.listener, false);
    } else if (instance.detachEvent) {
        instance.detachEvent("on" + event.name, event.listener);
    }
}

/**
 * Helper Functions
 */
Webfm.$ = function(id) { return document.getElementById(id); }
Webfm.ctn = function(textNodeContents) { var textNode = document.createTextNode(textNodeContents); return textNode; }
Webfm.ce = function(elementName) { elementName = elementName.toLowerCase(); var element = document.createElement(elementName); return element; }

/**
 * Creates an HTTP POST request and sends the response to the callback function
 *
 * Note: passing null or undefined for 'object' makes the request fail in Opera 8.
 *       Pass an empty string instead.
 */
Webfm.HTTPPost = function(uri, callbackFunction, callbackParameter, object) {
  var xmlHttp = new XMLHttpRequest();
  var bAsync = true;
  if (!callbackFunction) {
    bAsync = false;
  }
  xmlHttp.open('POST', uri, bAsync);

  var toSend = '';
  if (typeof object == 'object') {
    xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    for (var i in object) {
      toSend += (toSend ? '&' : '') + i + '=' + encodeURIComponent(object[i]);
    }
  }
  else {
    toSend = object;
  }
  xmlHttp.send(toSend);

  if (bAsync) {
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4) {
        callbackFunction(xmlHttp.responseText, xmlHttp, callbackParameter);
      }
    }
    return xmlHttp;
  }
  else {
    return xmlHttp.responseText;
  }
}

/**
 * Prevents an event from propagating.
 */
Webfm.stopEvent = function(event) {
  if (event.preventDefault) {
    event.preventDefault();
    event.stopPropagation();
  }
  else {
    event.returnValue = false;
    event.cancelBubble = true;
  }
}

/**
 * Adds a function to the window onload event
 */
function Webfm_addLoadEvent(func) {
  var oldOnload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  }
  else {
    window.onload = function() {
      oldOnload();
      func();
    }
  }
}

/**
 * Maintain compatibility with collapse.js
 * Since webfm fieldsets are built directly on the DOM, collapse.js onload
 * event will not convert them automatically - we must invoke manually here
 */
Webfm.collapseFSet = function(parent, text) {
  parent.className = 'collapsible collapsed';
  var elLegend = Webfm.ce('legend');
  parent.appendChild(elLegend);
  var fieldset = parent;
  // Expand if there are errors inside
  if ($('input.error, textarea.error, select.error', fieldset).size() > 0) {
    parent.removeClass('collapsed');
  }

  // Turn the legend into a clickable link and wrap the contents of the fieldset
  // in a div for easier animation
  $(elLegend).empty().append($('<a href="#">'+ text +'</a>').click(function() {
    var fieldset = $(elLegend).parents('fieldset:first')[0];
    // Don't animate multiple times
    if (!fieldset.animating) {
      fieldset.animating = true;
      Drupal.toggleFieldset(fieldset);
    }
    return false;
  }));
}

//the getModUrl() is used by contrib modules for custom ajax
Webfm.ajaxUrl = function() {
  var path = getBaseUrl() + "/?q=";
  return path += (typeof getModUrl == "undefined") ? "webfm_js" : getModUrl();
}

// Empty all child nodes
Webfm.clearNodeById = function(elementId) {
  var node = Webfm.$(elementId);
  while (node.hasChildNodes())
    node.removeChild(node.firstChild);
}

Webfm.sortByName = function(a, b) {
  var x = a.n.toLowerCase();
  var y = b.n.toLowerCase();
  return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}
Webfm.sortBySize = function(a, b) {
  var x = parseInt(parseFloat(a.s));
  var y = parseInt(parseFloat(b.s));
  return x - y;
}
Webfm.sortByModified = function(a, b) {
  var x = a.m;
  var y = b.m;
  return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}
Webfm.sortByKey = function(a, b) {
  var x = a.toLowerCase();
  var y = b.toLowerCase();
  return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}

Webfm.size = function(sz) {
  var size = sz;
  var units;
  if(size < 1024) units = " B";
  else {
    size = parseInt(size >> 10);
    if(size < 1024) units = " KB";
    else {
      size = parseInt(size >> 10);
      if(size < 1024) units = " MB";
      else {
        size = parseInt(size >> 10);
        if(size < 1024) units = " GB";
        else {
          size = parseInt(size >> 10);
          suffix = " TB";
        }
      }
    }
  }
  return size + units;
}

Webfm.enter = function(event) {
  event = event||window.event;
  var code;
	if (event.keyCode)
	  code = event.keyCode;
	else if (e.which)
	  code = e.which;
	return(code == 13) ? true : false;
}

Webfm.rclick= function(event) {
  if (event.which) {
    var rightclick = (event.which == 3);
  } else {
    if (event.button)
      var rightclick = (event.button == 2);
  }
  return rightclick;
}

// Dump debug function
// return a string version of a thing, without name.
// calls recursive function to actually traverse content.
Webfm.dump = function(content) {
  return Webfm.dumpRecur(content,0,true) + "\n";
}

// recursive function traverses content, returns string version of thing
// content: what to dump.
// indent: how far to indent.
// neednl: true if need newline, false if not
Webfm.dumpRecur = function(content,indent,neednl) {
  var out = "";
  if (typeof(content) == 'function')
    return 'function';
  else if (Webfm.isArray(content)) { 	// handle real arrays in brackets
    if (neednl) out += "\n"+Webfm.dumpSpaces(indent);
    out+="[ ";
    var inside = false;
    for (var i=0; i<content.length; i++) {
      if (inside)
        out+=",\n"+Webfm.dumpSpaces(indent+1);
      else
        inside=true;
      out+=Webfm.dumpRecur(content[i],indent+1,false);
    }
    out+="\n"+Webfm.dumpSpaces(indent)+"]";
  } else if (Webfm.isObject(content)) { 	// handle objects by association
    if (neednl) out+="\n"+Webfm.dumpSpaces(indent);
    out+="{ ";
    var inside = false;
    for (var i in content) {
      if (inside)
        out+=",\n"+Webfm.dumpSpaces(indent+1);
      else
        inside = true;
      out+="'" + i + "':" + Webfm.dumpRecur(content[i],indent+1,true);
    }
    out+="\n"+Webfm.dumpSpaces(indent)+"}";
  } else if (typeof(content) == 'string') {
    out+="'" + content + "'";
  } else {
    out+=content;
  }
  return out;
}

// print n groups of two spaces for indent
Webfm.dumpSpaces = function(n) {
  var out = '';
  for (var i=0; i<n; i++) out += '  ';
  return out;
}

// Naive way to tell an array from an object:
// it is an array if it has a defined length
Webfm.isArray = function(thing) {
  if (typeof(thing) != 'object') return false;
  if (typeof(thing.length) == 'undefined') return false;
  return true;
}

// Naive way to tell an array from an object:
// it is an array if it has a defined length
Webfm.isObject = function(thing) {
  if (typeof(thing) != 'object') return false;
  if (typeof(thing.length) != 'undefined') return false;
  if (typeof(thing.length) != 'undefined') return false;
  return true;
}

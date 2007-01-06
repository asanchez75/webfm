// Webfm.js

function Webfm() {}
function WebfmDrag() {}

/*
** Global variables
*/
Webfm.layout = null;
Webfm.current = null;
Webfm.dropContainers = [];

Webfm.oldOnContextMenu = null;
Webfm.oldOnMouseDown = null;
Webfm.contextMenuDiv = null;

Webfm.js_msg = [];
Webfm.js_msg["unreachable"] = "Oops! Server is unreachable.";
Webfm.js_msg["unsupported"] = "This browser does not support AJAX!";
Webfm.js_msg["download"] = "download the file";
Webfm.js_msg["view"] = "view picture";
Webfm.js_msg["root"] = "root";
Webfm.js_msg["send"] = "Sending...";
Webfm.js_msg["work"] = "Working...";
Webfm.js_msg["load"] = "Loading...";
Webfm.js_msg["refresh"] = "refresh";
Webfm.js_msg["sort"] = "sort by this column";
Webfm.js_msg["column1"] = "Name";
Webfm.js_msg["column2"] = "Modified";
Webfm.js_msg["column3"] = "Size";

Webfm.menu_msg = [];
Webfm.menu_msg["mkdir"] = "Create Subdirectory";
Webfm.menu_msg["rmdir"] = "Delete Directory";
Webfm.menu_msg["rm"] = "Delete File";
Webfm.menu_msg["ren"] = "Rename";
Webfm.menu_msg["chdir"] = "Open this directory";
Webfm.menu_msg["meta"] = "File meta data";
Webfm.menu_msg["att"] = "Attach to Node";
Webfm.menu_msg["det"] = "Detach from Node";

// Do not modify keys since Webfm.context() switches on these names
Webfm.menu = [];
Webfm.menu['root'] = { 'mkdir': Webfm.menu_msg["mkdir"] };
Webfm.menu['dir'] = { 'mkdir': Webfm.menu_msg["mkdir"], 'rmdir': Webfm.menu_msg["rmdir"], 'ren': Webfm.menu_msg["ren"] };
Webfm.menu['file'] = { 'rm': Webfm.menu_msg["rm"], 'ren': Webfm.menu_msg["ren"], 'meta': Webfm.menu_msg["meta"] };
Webfm.menu['attach'] = { 'det': Webfm.menu_msg["det"], 'meta': Webfm.menu_msg["meta"] };
Webfm.menu['node'] = { 'att': Webfm.menu_msg["att"], 'rm': Webfm.menu_msg["rm"], 'ren': Webfm.menu_msg["ren"], 'meta': Webfm.menu_msg["meta"] };
Webfm.menu['search'] = { 'chdir': Webfm.menu_msg["chdir"] };

Webfm.dirTreeObj = null;
Webfm.ftpTreeObj = null;
Webfm.dirListObj = null;
Webfm.attachObj = null;
Webfm.alrtObj = null;
Webfm.contextMenuObj = null;
Webfm.progressObj = null;

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
if (isJsEnabled()) {
  addLoadEvent(webfmLayout);
  addLoadEvent(webfmAttachmentLayout);
  addLoadEvent(dragContainer);
  addLoadEvent(contextContainer);
}

function webfmLayout() {
  var layoutDiv = '';
  layoutDiv = $('webfm');

  if(layoutDiv) {
    Webfm.layout = 'webfm';
    var layout_cont = Webfm.ce('div');
    Webfm.alrtObj = new Webfm.alert(layout_cont, 'alertbox');
    var elTreeDiv = Webfm.ce('div');
    elTreeDiv.setAttribute('id', 'tree'); //css id
    layout_cont.appendChild(elTreeDiv);
    Webfm.dirTreeObj = new Webfm.tree(elTreeDiv, '', 'dirtree', 'Directory', 'readtree');
    Webfm.ftpTreeObj = new Webfm.tree(elTreeDiv, '', 'ftptree', 'FTP Directory', 'readftptree');
    Webfm.progressObj = new Webfm.progress(layout_cont, 'progress');
    Webfm.dirListObj = new Webfm.list(layout_cont, '', 'dirlist', 'file', true);
    var metaObj = new Webfm.meta(layout_cont);
    var searchObj = new Webfm.search(layout_cont, '', 'search');
    Webfm.contextMenuObj = new Webfm.context();

    var elDiv = Webfm.ce('div');
    elDiv.setAttribute('id', 'download'); //css id
    layout_cont.appendChild(elDiv);
    layoutDiv.insertBefore(layout_cont, layoutDiv.firstChild);

    if(getDebugFlag())
      var dbgObj = new Webfm.debugLayout(layoutDiv);

    Webfm.dirTreeObj.fetch(true);
    Webfm.ftpTreeObj.fetch();
  }
}

function webfmAttachmentLayout() {
  var layoutDiv = '';
  layoutDiv = $('webfm-inline');

  if(layoutDiv) {
    Webfm.layout = 'webfm-inline';
    var layout_cont = Webfm.ce('div');
    Webfm.alrtObj = new Webfm.alert(layout_cont, 'alertbox');
    var elTreeDiv = Webfm.ce('div');
    elTreeDiv.setAttribute('id', 'tree'); //css id
    layout_cont.appendChild(elTreeDiv);
    Webfm.dirTreeObj = new Webfm.tree(elTreeDiv, '', 'dirtree', 'Directory', 'readtree');
    Webfm.progressObj = new Webfm.progress(layout_cont, 'progress');
    Webfm.dirListObj = new Webfm.list(layout_cont, '', 'dirlist', 'node', true);
    var searchObj = new Webfm.search(layout_cont, '', 'search');
    Webfm.contextMenuObj = new Webfm.context();

    var elDiv = Webfm.ce('div');
    elDiv.setAttribute('id', 'download'); //css id
    layout_cont.appendChild(elDiv);
    layoutDiv.insertBefore(layout_cont, layoutDiv.firstChild);

    if(getDebugFlag())
      var dbgObj = new Webfm.debugLayout(layoutDiv);

    // attach list anchored to 'webfm-attach' div in webfm_attachment_form_alter()
    Webfm.attachObj = new Webfm.attach('webfm-attach', '');
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
  document.body.appendChild(Webfm.contextMenuDiv);
}

/**
 * Webfm.list constructor
 */
Webfm.list = function(parent, method, id, type, mkdir_flag) {
  var wl = this;
  this.id = id;
  this.type = type;
  this.method = method ? method : HTTPGet;
  this.url = getBrowserUrl();
  this.sc_n = 0;
  this.sc_m = 0;
  this.sc_s = 0;
  this.content = '';
  this.iconDir = getIconDir();

  var node = Webfm.ce("div");
  node.setAttribute('id', id);

  var elTable = Webfm.ce('table');
  var elTableBody = Webfm.ce('tbody');
  elTableBody.setAttribute('id', id + 'body');

  // First Row
  var elTr = Webfm.ce('tr');

  // Refresh Icon
  var elTd = Webfm.ce('td');
  if(mkdir_flag !== true) {
    elTd.colSpan = 3;
  } else {
    elTd.className = 'navi';
    var elA = Webfm.ce('a');
    elA.setAttribute('href', '#');
    elA.setAttribute('title', Webfm.js_msg["refresh"]);
    var listener = addEventListener(elA, "click", function(e) { wl.refresh();stopEvent(e); });

    var elImg = Webfm.ce('img');
    elImg.setAttribute('src', this.iconDir+ '/r.gif');
    elImg.setAttribute('alt', Webfm.js_msg["refresh"]);
    elA.appendChild(elImg);
    elTd.appendChild(elA);
    elTr.appendChild(elTd);
  }

  // Breadcrumb trail
  var elTd = Webfm.ce('td');
  elTd.colSpan = 2;
  elTd.setAttribute('class','navi');
  // Build breadcrumb trail inside span
  var elSpan = Webfm.ce('span');
  elSpan.setAttribute('id', id + 'bcrumb');
  elTd.appendChild(elSpan);
  elTr.appendChild(elTd);

  if(mkdir_flag === true) {
  // Create New Directory
    var elTd = Webfm.ce('td');
    var elInput = Webfm.ce('input');
    elInput.setAttribute('type', 'button');
    elInput.setAttribute('value', 'Create New Dir');
    var listener = addEventListener(elInput, "click", function(e) { wl.mkdir();stopEvent(e); });

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
  var listener = addEventListener(elA, "click", function(e) { wl.sc_n^=1;wl.loadList("n");stopEvent(e); });

  var elImg = Webfm.ce('img');
  elImg.setAttribute('alt', Webfm.js_msg["sort"]);
  elImg.setAttribute('src', this.iconDir + '/' + ((this.sc_n)?"up":"down") + '.gif');
  elA.appendChild(elImg);
  elA.appendChild(Webfm.ctn(Webfm.js_msg["column1"]));
  elTd.appendChild(elA);
  elTr.appendChild(elTd);

  // date/time column
  var elTd = Webfm.ce('td');
  elTd.className = 'head';
  var elA = Webfm.ce('a');
  elA.setAttribute('href', '#');
  var listener = addEventListener(elA, "click", function(e) { wl.sc_m^=1;wl.loadList("m");stopEvent(e); });

  var elImg = Webfm.ce('img');
  elImg.setAttribute('src', this.iconDir + '/' + ((this.sc_m)?"up":"down") + '.gif');
  elA.appendChild(elImg);
  elA.appendChild(Webfm.ctn(Webfm.js_msg["column2"]));
  elTd.appendChild(elA);
  elTr.appendChild(elTd);

  // size column
  var elTd = Webfm.ce('td');
  elTd.className = 'head';
  var elA = Webfm.ce('a');
  elA.setAttribute('href', '#');
  elA.setAttribute('title', Webfm.js_msg["sort"]);
  var listener = addEventListener(elA, "click", function(e) { wl.sc_s^=1;wl.loadList("s");stopEvent(e); });

  var elImg = Webfm.ce('img');
  elImg.setAttribute('alt', Webfm.js_msg["sort"]);
  elImg.setAttribute('src', this.iconDir + '/' + ((this.sc_s)?"up":"down") + '.gif');
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
  elSpan = $(this.id + 'bcrumb');
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
        var listener = addEventListener(elA, "click", function(e) { Webfm.selectDir(e);stopEvent(e); });

        elA.appendChild(Webfm.ctn(this.content.bcrumb[i][1]));
        elSpan.appendChild(elA);
    } else {
        elSpan.appendChild(Webfm.ctn(this.content.bcrumb[i][1]));
      }
    }
  }
}

Webfm.list.prototype.refresh = function() {
  this.fetch(Webfm.current);
}

Webfm.list.prototype.fetch = function(curr_dir) {
  Webfm.alrtObj.msg();
  if(curr_dir || (curr_dir = Webfm.current)) {
    Webfm.dbg('fetch: ', curr_dir);
    Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
    this.method(this.url + '?action=' + encodeURIComponent('read') + '&param=' + encodeURIComponent(curr_dir), this.callback, this);
  } else {
    Webfm.dbg("current undefined");
  }
}

Webfm.list.prototype.callback = function(string, xmlhttp, cp) {
  Webfm.progressObj.hide();
  if (xmlhttp.status == 200) {
    cp.content = parseJson(string);
    Webfm.dbg("fetchcallback:", Webfm.dump(cp.content));
    if(cp.content.status) {
      cp.bcrumb();
      cp.loadList("n");

      // Insert current directory path into upload form
      var uploadpath = $('edit-webfmuploadpath');
      if(uploadpath)
        uploadpath.value = cp.content.current;
      Webfm.current = cp.content.current;
    } else
      Webfm.alrtObj.msg("dir listing fetch fail");
  } else {
    Webfm.alrtObj.msg(js_msg["unreachable"]);
  }
}

// Function to create a new directory
Webfm.list.prototype.mkdir = function() {
  Webfm.alrtObj.msg();
  Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
  this.method(this.url + '?action=' + encodeURIComponent("mkdir") + '&param=' + encodeURIComponent(this.content.current), this.mkdir_callback, this);
}

Webfm.list.prototype.mkdir_callback = function(string, xmlhttp, cp) {
  Webfm.progressObj.hide();
  if (xmlhttp.status == 200) {
    var result = parseJson(string);
    Webfm.dbg("mkdir=", result.status);
    if(result.status)
      cp.fetch();
    else
      Webfm.alrtObj.msg("mkdir fail");
  } else {
    Webfm.alrtObj.msg(js_msg["unreachable"]);
  }
}

Webfm.list.prototype.loadList = function(sortcol) {
  this.c_dir = 0;
  this.c_fil = 0;

  var listHead = $(this.id + 'head');
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
  var parent = $(this.id + 'body');
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
//        Webfm.dropContainers.push(dirrow);
      }
      else
        var filerow = new Webfm.filerow(parent, arr[i], type);
  }
}

/**
 * Table directory row object
 */
Webfm.dirrow = function(parent, dir, index) {
  var dr = this;
  this.iconDir = getIconDir();
  this.dragListener = null;
  var _id = 'dirlist' + index;
  var elTr = Webfm.ce('tr');
  this.base = elTr;
  elTr.className = 'dirrow';
  this.dd = new WebfmDD(elTr, elTr.className, '');
  elTr.setAttribute('id', _id);
  elTr.setAttribute('title', dir.p);
  this.dragListener = addEventListener(this.base, "mousedown", function(e) { dr.select(e); });
  var listener = addEventListener(this.base, "mouseover", function() { this.className = 'dirrow selected'; });
  var listener = addEventListener(this.base, "mouseout", function() { this.className = 'dirrow'; });

  var elTd = Webfm.ce('td');
  var elImg = Webfm.ce('img');
  elImg.setAttribute('src', this.iconDir + '/d.gif');
  elImg.setAttribute('id', _id + 'dd');
  elImg.setAttribute('alt', 'Dir');
  this.menu = 'dir';
  var listener = addEventListener(this.base, "contextmenu", function(e) { Webfm.contextMenuObj.showContextMenu(e, dr);stopEvent(e); });
  elTd.appendChild(elImg);
  elTr.appendChild(elTd);

  var elTd = Webfm.ce('td');
  // Title of link = path
  this.clickObj = Webfm.ce('a');
  this.clickObj.setAttribute('href', '#');
  //title is path
  this.clickObj.setAttribute('title', dir.p);
  var listener = addEventListener(this.clickObj, "click", function(e) { Webfm.selectDir(e);stopEvent(e); });
  this.clickObj.appendChild(Webfm.ctn(dir.n));
  elTd.appendChild(this.clickObj);
  elTr.appendChild(elTd);

  var elTd = Webfm.ce('td');
  elTd.className = 'txt';
  elTd.appendChild(Webfm.ctn(dir.m));
  elTr.appendChild(elTd);

  var elTd = Webfm.ce('td');
  elTd.className = 'txt';
  if(dir.s)
    elTd.appendChild(Webfm.ctn(dir.s));
  elTr.appendChild(elTd);

  parent.appendChild(elTr);
  this.c_dir ++;
}

Webfm.dirrow.prototype.listen = function(event) {
  var cp = this;
  this.dragListener = addEventListener(this.base, "mousedown", function(e) { cp.select(e); });
}

Webfm.dirrow.prototype.select = function(event) {
  event = event||window.event;
  switch(event.target||event.srcElement) {
    case this.clickObj:
      break;
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
Webfm.filerow = function(parent, fileObj, idtype) {
  var fr = this;
  this.dragListener = null;
  this.iconDir = getIconDir();
  this.ext = fileObj.e;
  this.filepath = fileObj.p + '/' + fileObj.n;
  var elTr = Webfm.ce('tr');
  this.base = elTr;
  elTr.className = idtype + 'row';
  this.dd = new WebfmDD(elTr, elTr.className, '');
  elTr.setAttribute('id', idtype + '-' + fileObj.id);
  elTr.setAttribute('title', this.filepath);
  this.dragListener = addEventListener(this.base, "mousedown", function(e) { fr.select(e);return false; });
  var listener = addEventListener(this.base, "mouseover", function() { this.className = idtype + 'row selected'; });
  var listener = addEventListener(this.base, "mouseout", function() { this.className = idtype + 'row'; });

  var elTd = Webfm.ce('td');
  var elImg = Webfm.ce('img');
  if(fileObj.i)
    elImg.setAttribute('src', this.iconDir + '/i.gif');
  else
    elImg.setAttribute('src', fr.getIconByExt());
  elImg.setAttribute('alt', 'File');
  this.menu = idtype;
  var listener = addEventListener(this.base, "contextmenu", function(e) { Webfm.contextMenuObj.showContextMenu(e, fr);stopEvent(e); });
  elTd.appendChild(elImg);
  elTr.appendChild(elTd);

  var elTd = Webfm.ce('td');
  elTd.setAttribute('title', fileObj.id);
  this.clickObj = Webfm.ce('a');
  this.clickObj.setAttribute('href', '#');
  //title is path
  this.clickObj.setAttribute('title', fileObj.p);
  var listener = addEventListener(this.clickObj, "dblclick", function(e) { Webfm.selectFile(e);stopEvent(e); });
  var listener = addEventListener(this.clickObj, "click", function(e) { stopEvent(e); });
  this.clickObj.appendChild(Webfm.ctn(fileObj.n));
  elTd.appendChild(this.clickObj);
  elTr.appendChild(elTd);

  var elTd = Webfm.ce('td');
  elTd.className = 'txt';
  elTd.appendChild(Webfm.ctn(fileObj.m));
  elTr.appendChild(elTd);

  var elTd = Webfm.ce('td');
  elTd.className = 'txt';
  elTd.appendChild(Webfm.ctn(fileObj.s));
  elTr.appendChild(elTd);

  parent.appendChild(elTr);
  this.c_fil++;
}

Webfm.filerow.prototype.listen = function(event) {
  var cp = this;
  this.dragListener = addEventListener(this.base, "mousedown", function(e) { cp.select(e); });
}

Webfm.filerow.prototype.select = function(event) {
  event = event||window.event;
  switch(event.target||event.srcElement) {
    case this.clickObj:
      break;
    default:
      this.dd.mouseButton(event);
      break;
  }
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
 */
Webfm.tree = function(parent, method, id, treeTitle, op) {
  var wt = this;
  this.id = id;
  this.action = op;
  this.method = method ? method : HTTPGet;
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
  var listener = addEventListener(elA, "click", function(e) { wt.fetch();stopEvent(e); });

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
      var listener = addEventListener(elA, "click", function(e) { wt.exp(0);stopEvent(e); });
    } else {
      var listener = addEventListener(elA, "click", function(e) { wt.exp(1);stopEvent(e); });
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

  var url = getBrowserUrl();
  Webfm.alrtObj.msg();
  Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
  this.method(url + '?action=' + encodeURIComponent(this.action), this.callback, this);
}

Webfm.tree.prototype.callback = function(string, xmlhttp, cp) {
  Webfm.progressObj.hide();
  if (xmlhttp.status == 200) {
    cp.content = parseJson(string);

    //clear dir_tree div
    Webfm.clearNodeById(cp.rootId);
    Webfm.dropContainers = [];

    // Recursively build directory tree from php associative array
    var parent = $(cp.rootId);
    cp.buildTreeRecur(cp.content.tree, parent, '');
    cp.init();
    if(cp.list)
      Webfm.dirListObj.fetch(cp.content.current);
  } else {
    Webfm.alrtObj.msg(js_msg["unreachable"]);
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
        var listener = addEventListener(elImg, "click", function(e) { cp.showHideNode(e);stopEvent(e); });
        elDiv.appendChild(elImg);
        elLi.appendChild(elDiv);
        var listener = addEventListener(elDiv, "mouseover", function() { this.className = 'selected'; });
        var listener = addEventListener(elDiv, "mouseout", function() { this.className = ''; });

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
  var rootDiv = $(this.rootId);
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
  var _tree = $(this.rootId);

  // Rebuild dirtree ul/li objects from dirtree object
  this.expAllIndex = expcol;
  this.treeUlCounter = 0;
  this.treeNodeCounter = 0;

  this.buildTreeRecur(this.content.tree, _tree, '');
  this.init();
}

Webfm.treeNode = function(parent, path, id, count, expImg) {
  var tn = this;
  this.base = parent.parentNode;
  this.dd = new WebfmDD(this.base, this.base.className, '');
  this.dragListener = null;
  var icondir = getIconDir();
  this.expClickObj = expImg;
  var elImg = Webfm.ce('img');
  elImg.setAttribute('id', id + 'dd');
  elImg.setAttribute('src', icondir + '/d.gif');
  parent.appendChild(elImg);
  this.menu = null;
  //title is menu[] key
  if(count) {
    this.menu = 'dir';
    this.dragListener = addEventListener(parent, "mousedown", function(e) { tn.select(e);return false; });
  } else {
    this.menu = 'root';
  }
  var listener = addEventListener(parent, "contextmenu", function(e) { Webfm.contextMenuObj.showContextMenu(e, tn);stopEvent(e); });
  this.clickObj = Webfm.ce('a');
  this.clickObj.href = '#';
  //anchor title is path
  this.clickObj.setAttribute('title', path);
  var root = [];
  root = path.split('/');
  this.clickObj.appendChild(Webfm.ctn(root[root.length - 1]));
  var listener = addEventListener(this.clickObj, "click", function(e) { Webfm.selectDir(e);stopEvent(e); });
  parent.appendChild(this.clickObj);
}

Webfm.treeNode.prototype.listen = function(event) {
  var cp = this;
Webfm.dbg('menu', this.menu);
  if(this.menu == 'dir') {
    this.dragListener = addEventListener(this.base, "mousedown", function(e) { cp.select(e); });
  }
}

Webfm.treeNode.prototype.select = function(event) {
  event = event||window.event;
  switch(event.target||event.srcElement) {
    case this.clickObj:
    case this.expClickObj:
      break;
    default:
      this.dd.mouseButton(event);
      break;
  }
  return false;
}

Webfm.selectDir = function(event) {
  event = event||window.event;
  Webfm.dirListObj.fetch((event.target||event.srcElement).title);
}

Webfm.selectFile = function(event) {
  event = event||window.event;
  var prefix = '../';
  if($('webfm-inline'))
    prefix += '../';
  var node = (event.target||event.srcElement).parentNode;
  window.location = prefix + 'webfm_send/' + node.title;
}

/**
 * Webfm.context constructor
 */
Webfm.context = function(method, callback) {
  this.callback = callback ? callback : this.event;
  this.method = method ? method : HTTPGet;
}

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
  this.target = obj.base;
//Webfm.dbg('this.target.title:', this.target.title);
  this.dragListener = obj.dragListener ? obj.dragListener : null;
  this.restore = obj.listen ? function(e) { obj.listen(e); } : null;
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
    var elA = Webfm.ce('a');
    //menu selection is title of event
    elA.setAttribute('title', j);
    var listener = addEventListener(elA, "mousedown", function(e) { cp.callback(e, cp); });
    elA.setAttribute('href', '#');
    elA.appendChild(Webfm.ctn(contextmenu[j]));
    elLi.appendChild(elA);
    var listener = addEventListener(elLi, "mouseover", function(e) { this.className = 'contextMenuHighlighted'; });
    var listener = addEventListener(elLi, "mouseout", function(e) { this.className = ''; });
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
  var listener = addEventListener(document, "mousedown", function(e) { cp.hideContextMenu(e); });
  return false;
}

Webfm.context.prototype.event = function(event) {
  var wa = this;
  event = event||window.event;
  var url = getBrowserUrl();
  // Determine if this.target is a file
  this.is_file = ((this.target.className != 'dirrow') && (this.target.className.substring(0,4) != 'tree'));
  //title of target anchor is always a directory
  //- for a file it is the containing directory - the anchor value is the file name
  //- for a directory it is the full path - the anchor value is the last dir (redundant)
  this.link = this.target.getElementsByTagName('A')[0];
  //title of target is always full path (whether file or directory)
  var path = this.target.title;
  //event title is context menu operation
  Webfm.alrtObj.msg();
  switch((event.target||event.srcElement).title) {
    case 'rmdir':
    case 'rm':
      if(this.confirm("Do you want to delete the " + (this.is_file ? "file " : "directory ") + path + (this.is_file ? "" : " and all its contents") + "?")) {
        Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
        this.method(url + '?action=' + encodeURIComponent("delete") + '&param=' + encodeURIComponent(path), Webfm.ctx_callback, this);
        return false;
      }
      break;

    case 'mkdir':
        Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
        this.method(url + '?action=' + encodeURIComponent("mkdir") + '&param=' + encodeURIComponent(path), Webfm.ctx_callback, this);
      break;

    case 'chdir':
      Webfm.dbg("chdir", eventId);
      break;

    case 'meta':
      Webfm.dbg("meta path", path);
      Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
      this.method(url + '?action=' + encodeURIComponent("getmeta") + '&param=' + encodeURIComponent(path), Webfm.meta_callback, '');
      break;

    case 'ren':
      //kill drag listener
      if(this.dragListener)
        removeEventListener(this.dragListener);
      this.orig_name = this.link.firstChild.nodeValue;
      this.renInput = Webfm.ce('input');
      this.renInput.setAttribute('type', 'textfield');
      this.renInput.setAttribute('value', this.orig_name);
      //no change - replace original textNode and restore drag listener
      this.renBlurListener = addEventListener(this.renInput, "blur", function (e) { wa.renInput.parentNode.replaceChild(wa.link, wa.renInput);if(wa.restore)wa.restore(event);stopEvent(e); });
      //change - swap names
      var listener = addEventListener(this.renInput, "change", function(e) { removeEventListener(wa.renBlurListener);wa.swapname(url, wa.renInput); wa.renInput.parentNode.replaceChild(wa.link, wa.renInput);stopEvent(e); });
      this.link.parentNode.replaceChild(this.renInput, this.link);
      setTimeout(function(){wa.renInput.focus();},10);
      break;

    case 'att':
      var fid = this.target.id.substring(this.target.id.indexOf('-') + 1);
      //check that this file is not already attached
      var attach_arr = [];
      attach_arr = $(Webfm.attachFormInput).value.split(',');
      for(var i = 0; i < attach_arr.length; i++) {
         if(fid == attach_arr[i])
            break;
      }
      if(i == attach_arr.length) {
        var url = getAttachUrl();
        Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
        this.method(url + '?action=' + encodeURIComponent("attachfile") + '&param=' +  encodeURIComponent(fid), Webfm.attach_callback, this);
      }
      break;

    case 'det':
      if(this.confirm("Do you want to detach " + path + "?")) {
        // update table
        this.target.parentNode.removeChild(this.target);
        // update form input
        var attach_arr = [];
        attach_arr = $(Webfm.attachFormInput).value.split(',');
        var new_attach_arr = [];
        var j = 0;
        // tr elements use 'fid#' in 'title' field
        var fid = this.target.id.substring(this.target.id.indexOf('-') + 1);
        for(var i = 0; i < attach_arr.length; i++) {
          if(attach_arr[i] != fid) {
            new_attach_arr[j++] = attach_arr[i];
          }
        }
        $(Webfm.attachFormInput).value = new_attach_arr.join(',');
      }
      break;
  }
  return false;
}

Webfm.context.prototype.confirm = function(text) {
  var agree = confirm(text);
  return agree ? true : false;
}

Webfm.context.prototype.swapname = function(url, input) {
  var newpath = [];
  var oldpath = null;
  newpath = this.link.title.split('/');
  if(!this.is_file) {
    newpath.pop();
    this.droppath = newpath.join("/");
    this.orig_name = '';
    oldpath = this.link.title;
  } else {
    this.droppath = this.link.title;
    //title is path to directory - file name must be concatenated for full path
    oldpath = this.link.title + '/' + this.orig_name;
  }
  newpath.push(input.value);
//Webfm.dbg("newpath", newpath.join("/"));
  Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
  this.method(url + '?action=' + encodeURIComponent("rename") + '&param=' + encodeURIComponent(oldpath) + '&new=' + encodeURIComponent(newpath.join("/")), Webfm.ctx_callback, this);
  return true;
}

Webfm.attach_callback = function(string, xmlhttp, cp) {
  Webfm.progressObj.hide();
  if (xmlhttp.status == 200) {
    var result = parseJson(string);
    Webfm.dbg("result", Webfm.dump(result));
    if (result.status) {
      var filerow = new Webfm.filerow($('webfm-attachbody'), result.attach, 'attach');
      var elInput = $(Webfm.attachFormInput);
      elInput.setAttribute('value', (elInput.getAttribute('value')?elInput.getAttribute('value')+',':'') + result.attach.id);
    } else
      Webfm.alrtObj.msg("attach fail");
  } else {
    Webfm.alrtObj.msg(js_msg["unreachable"]);
  }
}

Webfm.ctx_callback = function(string, xmlhttp, cp) {
  Webfm.progressObj.hide();
  if (xmlhttp.status == 200) {
    var result = parseJson(string);
    if (result.status) {
      if(!cp.is_file && Webfm.dirTreeObj)
        Webfm.dirTreeObj.fetch();
      Webfm.dirListObj.fetch(cp.droppath);
    } else
      Webfm.alrtObj.msg("operation fail");
  } else {
    Webfm.alrtObj.msg(js_msg["unreachable"]);
  }
}

Webfm.meta_callback = function(string, xmlhttp, cp) {
  Webfm.progressObj.hide();
  if (xmlhttp.status == 200) {
    var node = $('meta-form');
    Webfm.clearNodeById('meta-form');

    var result = parseJson(string);
    Webfm.dbg("meta result:", Webfm.dump(result));
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
          var listener = addEventListener(elInput, "change", function(e) { Webfm.validateMetaInput(this);stopEvent(e); });
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
      button.setAttribute('value', 'Submit');
      var listener = addEventListener(button, "click", function(e) { Webfm.submitMeta(elForm, fid);stopEvent(e);this.blur(); });

      elTd.appendChild(button);
      elTr.appendChild(elTd);

      var elTd = Webfm.ce('td');
      elTd.setAttribute('colspan', '2');
      var button = Webfm.ce('input');
      button.setAttribute('type', 'button');
      button.setAttribute('value', 'Clear');
      var listener = addEventListener(button, "click", function(e) { Webfm.clearNodeById('meta-form');stopEvent(e); });

      elTd.appendChild(button);
      elTr.appendChild(elTd);

      elTBody.appendChild(elTr);
      elTable.appendChild(elTBody);
      elForm.appendChild(elTable);

      node.appendChild(elForm);
    } else
      Webfm.alrtObj.msg("get metadata fail");
  } else {
    Webfm.alrtObj.msg(js_msg["unreachable"]);
  }
}

// Validate the length of input
Webfm.validateMetaInput = function(field) {
  var len = Webfm.db_table_keys[field.name];
//Webfm.dbg("validateMetaInput", field.name);
  if(len < 256) {
    var data = Webfm.trim(field.value);
    if(data.length > len) {
      var err_msg = Webfm.ctn("Too Long!");
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
  var url = getBrowserUrl();
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
    HTTPGet(url + '?action=' + encodeURIComponent("putmeta") + '&param=' + encodeURIComponent(fid) + '&meta=' + encodeURIComponent(metadata.join(",")), Webfm.submitMetacallback);
  } else {
    alert('Correct Input');
  }
}

Webfm.submitMetacallback = function(string, xmlhttp, cp) {
  Webfm.progressObj.hide();
  if (xmlhttp.status == 200) {
    var result = parseJson(string);
    if (result.status) {
      Webfm.dbg('meta result:', result.status);
    } else
      Webfm.alrtObj.msg("submit metadata fail");
  } else {
    Webfm.alrtObj.msg(js_msg["unreachable"]);
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
Webfm.attach = function(parentId, method) {
  var wa = this;
  this.id = parentId
  this.attached = '';
  this.method = method ? method : HTTPGet;

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
  elTd.appendChild(Webfm.ctn('Attached Files'));
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
  $(parentId).appendChild(elTable);

  // Nest metadata fieldset in attach fieldset
  var metaObj = new Webfm.meta($(parentId));
}

Webfm.attach.prototype.fetch = function() {
  var url = getAttachUrl();
  // action attribute of node-edit form contains the node number
  var node_url = $('node-form').action;
  Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
  this.method(url + '?action=' + encodeURIComponent("attach") + '&param=' +  encodeURIComponent(node_url), this.callback, this);
}

Webfm.attach.prototype.callback = function(string, xmlhttp, cp) {
  Webfm.progressObj.hide();
  if (xmlhttp.status == 200) {
    result = parseJson(string);
    Webfm.dbg("attach.fetch:", Webfm.dump(result));
    if(result.status) {
      if(result.attach.length) {
        var elInput = $(Webfm.attachFormInput);
        var elTableBody = $(cp.id + 'body')
        for(var i = 0; i < result.attach.length; i++) {
          var filerow = new Webfm.filerow(elTableBody, result.attach[i], 'attach');
          elInput.setAttribute('value', (elInput.getAttribute('value')?elInput.getAttribute('value')+',':'') + result.attach[i].id);
        }
      }
    } else
      Webfm.alrtObj.msg("fetch attachments fail");
  } else {
    Webfm.alrtObj.msg(js_msg["unreachable"]);
  }
}

/**
 * Webfm.meta constructor
 */
Webfm.meta = function(parent) {
  var elFset = Webfm.ce('fieldset');
  elFset.setAttribute('id', 'metadata');
  elFset.className = 'collapsible collapsed';
  var elLegend = Webfm.ce('legend');
  elLegend.appendChild(Webfm.ctn('File Meta Data'));
  elFset.appendChild(elLegend);
  var metadata_msg = Webfm.ce('div');
  metadata_msg.setAttribute('id', 'meta-form');
  elFset.appendChild(metadata_msg);
  parent.appendChild(elFset);
}

/**
 * Webfm.search constructor
 */
Webfm.search = function(parent, method, op) {
  var cp = this;
  this.method = method ? method : HTTPGet;
  this.action = op;
  this.listId = 'searchresult';
  var elFset = Webfm.ce('fieldset');
  elFset.className = 'collapsible collapsed';
  var elLegend = Webfm.ce('legend');
  elLegend.appendChild(Webfm.ctn('File Search'));
  elFset.appendChild(elLegend);
  var elDiv = Webfm.ce('div');
  elDiv.className = "description";
  elDiv.appendChild(Webfm.ctn("Search current directory"));
  elFset.appendChild(elDiv);
  var elInput = Webfm.ce('input');
  elInput.setAttribute('type', 'textfield');
  elInput.setAttribute('size', '40');
  elFset.appendChild(elInput);
  var searchButton = Webfm.ce('input');
  searchButton.setAttribute('type', 'button');
  searchButton.setAttribute('value', 'Search');
  var listener = addEventListener(searchButton, "click", function(e) { cp.submit(elInput.value);stopEvent(e); });

  elFset.appendChild(searchButton);
  var elDiv = Webfm.ce('div');
  elDiv.setAttribute('id', this.listId);
  elFset.appendChild(elDiv);
  parent.appendChild(elFset);
}

Webfm.search.prototype.submit = function(value) {
  var url = getBrowserUrl();
  Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
  this.method(url + '?action=' + encodeURIComponent(this.action) + '&param=' + encodeURIComponent(Webfm.current)  + '&pattern=' + encodeURIComponent(value), this.callback, this);
}

Webfm.search.prototype.callback = function(string, xmlhttp, cp) {
  Webfm.progressObj.hide();
  if (xmlhttp.status == 200) {
    var node = $(cp.listId);
    // Empty directory listing node
    Webfm.clearNodeById(cp.listId);

    var result = parseJson(string);

    if(result.files.length) {
      var searchList = Webfm.ce('ul');
      for(var i = (result.files.length - 1); i >= 0; i--) {
        var _id = 'searchrow' + i;
        var elLi = Webfm.ce('li');

        elLi.className = cp.listId + 'row';
        elLi.setAttribute('title', result.files[i].id);

        var iconDir = getIconDir();
        var elImg = Webfm.ce('img');
        elImg.setAttribute('src', iconDir + '/d.gif');
        elImg.setAttribute('alt', 'Dir');
        //title is path
        elImg.setAttribute('title', result.files[i].p);
        var listener = addEventListener(elImg, "click", function(e) { Webfm.selectDir(e);stopEvent(e); });

        elLi.appendChild(elImg);
        elLi.appendChild(Webfm.ctn('  '));
        var elA = Webfm.ce('a');
        elA.setAttribute('href', '#');
        var listener = addEventListener(elA, "click", function(e) { Webfm.selectFile(e);stopEvent(e); });

        elA.appendChild(Webfm.ctn(result.files[i].n));
        elLi.appendChild(elA);
        searchList.appendChild(elLi);
      }
      node.appendChild(searchList);
    } else {
      var no_match = Webfm.ctn('No match found');
      node.setAttribute('style', 'color:red');
      node.appendChild(no_match);
    }
  } else {
    Webfm.alrtObj.msg(js_msg["unreachable"]);
  }
}

// Webfm debug Collapsible Fieldset
Webfm.debugLayout = function(parent) {
  var dbg_fieldset = Webfm.ce('fieldset');
  dbg_fieldset.className = 'collapsible collapsed';
  var elLegend = Webfm.ce('legend');
  elLegend.appendChild(Webfm.ctn('Webfm Debug'));
  dbg_fieldset.appendChild(elLegend);
  var dbg_control = Webfm.ce('div');
  var elInput = Webfm.ce('input');
  elInput.setAttribute('type', 'button');
  elInput.setAttribute('value', 'Clear');
  var listener = addEventListener(elInput, "click", function(e) { Webfm.clearNodeById('dbg');Webfm.alrtObj.msg();stopEvent(e); });

  dbg_control.appendChild(elInput);
  dbg_fieldset.appendChild(dbg_control);
  var dbg_msg = Webfm.ce('div');
  dbg_msg.setAttribute('id', 'dbg');
  dbg_fieldset.appendChild(dbg_msg);
  parent.appendChild(dbg_fieldset);
}

Webfm.debug = function(title, msg) {
  Webfm.dbg(title, msg);
}
Webfm.dbg = function(title, msg) {
  if(getDebugFlag()) {
    if($('dbg')) {
      var dbg = $('dbg');
      var elBr = Webfm.ce('br');
      //put latest msg at top (less scrolling)
      dbg.insertBefore(elBr, dbg.firstChild);
      if(msg) {
        dbg.insertBefore(Webfm.ctn(msg), dbg.firstChild);
      }
      if(title) {
        var elSpan = Webfm.ce('span');
        elSpan.className = 'g';
        elSpan.appendChild(Webfm.ctn(title));
        dbg.insertBefore(elSpan, dbg.firstChild);
      }
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
    var prog = $(this.id);
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
    var node = $(this.id);
    var elSpan = Webfm.ce('span');
    elSpan.className = 'alertspan';
    elSpan.appendChild(Webfm.ctn(msg));
    node.appendChild(elSpan);
  }
}

/**
 * WebfmDD constructor
 */
function WebfmDD(element, _class, method) {
  this.element = element;
  this.type = _class;
  this.method = method ? method : HTTPGet;
  this.is_file = ((this.type != 'dirrow') && (this.type.substring(0,4) != 'tree'));
  this.icondir = getIconDir();
}

WebfmDD.prototype.mouseButton = function(event) {
  event = event||window.event;
  var rightclick;

  // Determine mouse button
  if (event.which) {
    rightclick = (event.which == 3);
  } else {
    if (event.button)
      rightclick = (event.button == 2);
  }
  if(!rightclick)
    this.beginDrag(event);
}

WebfmDD.prototype.beginDrag = function (event) {
  if (WebfmDrag.dragging) {
    return;
  }
  WebfmDrag.dragging = true;
//Webfm.dbg('drop containers', Webfm.dump(Webfm.dropContainers));
  var cp = this;
  this.oldMoveHandler = document.onmousemove;
  document.onmousemove = function(e) { cp.handleDrag(e); };
  this.oldUpHandler = document.onmouseup;
  document.onmouseup = function(e) { cp.endDrag(e); };

  this.offset = WebfmDrag.getMouseOffset(this.element, event);

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

  var pos = WebfmDrag.mouseCoords(event);
  var y = pos.y - this.offset.y;
  var x = pos.x - this.offset.x;

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
      var dirListRows = $('dirlist').getElementsByTagName('tr');
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
          var cont_pos = absolutePosition(droptarget);
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
      dirTreeCont = $("dirtree")
      if(dirTreeCont) {
          //reuse var for container list
          dirTreeCont = $("dirtree").getElementsByTagName('li');
        if (dirTreeCont.length) {
          // Build tree drop container array
          for(var i = 0; i < dirTreeCont.length; i++) {
            // DragDrop element is folder icon
            var droptarget = dirTreeCont[i].getElementsByTagName('div')[0];
            var cont_pos = absolutePosition(droptarget);
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
      var droptarget = $('webfm-attachbody');
      var cont_pos = absolutePosition(droptarget);
      WebfmDrag.attachContainer = { x: cont_pos.x, y: cont_pos.y, w: droptarget.offsetWidth, h: droptarget.offsetHeight };
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
          WebfmDrag.activeCont = $(WebfmDrag.dropContainers[i].id);
          $(WebfmDrag.dropContainers[i].id + 'dd').src = this.icondir + '/open.gif';
          $(WebfmDrag.dropContainers[i].id).className += ' selected';
        } else {
          // De-highlight container
          $(WebfmDrag.dropContainers[i].id + 'dd').src = this.icondir + '/d.gif';
          var class_names = [];
          class_names = $(WebfmDrag.dropContainers[i].id).className.split(' ');
          $(WebfmDrag.dropContainers[i].id).className = class_names[0];
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
      var att_table_body = $('webfm-attachbody');
      var attachRows = att_table_body.getElementsByTagName('TR');
      var prevNode = '';
      var nextNode = '';
      var curr = false;
      // Start at 1 since first row is header
      for(var i = 1; i < attachRows.length; i++) {
        if(this.element.id != attachRows[i].id) {
          var att_pos = absolutePosition(attachRows[i]);
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
  stopEvent(event);
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
  stopEvent(event);

  if(this.type != 'attachrow') {
    // Move dragged object if a valid drop container
    if(WebfmDrag.activeCont) {
      this.droppath = WebfmDrag.activeCont.title;
      // De-highlight container
      $(WebfmDrag.activeCont.id + 'dd').src = this.icondir + '/d.gif';
      var class_names = [];
      class_names = WebfmDrag.activeCont.className.split(' ');
      WebfmDrag.activeCont.className = class_names[0];
      var url = getBrowserUrl();
      Webfm.progressObj.show(Webfm.js_msg["work"],  "blue");
      this.method(url + '?action=' + encodeURIComponent("move") + '&param=' + encodeURIComponent(curpath) + '&new=' + encodeURIComponent(this.droppath), this.callback, this);
      WebfmDrag.activeCont = null;
    }
  } else {
    // Put the current order of attachments into the form in preparation for submit
    var elInput = $('edit-attachlist');
    var attachRows = $('webfm-attachbody').getElementsByTagName('tr');
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
    var result = parseJson(string);
    if (result.status) {
      //update tree if directory is moved
      if(!cp.is_file)
        Webfm.dirTreeObj.fetch();
      //always update target directory
      Webfm.dirListObj.fetch(cp.droppath);
    } else
      Webfm.alrtObj.msg("move failed");
  } else {
    Webfm.alrtObj.msg(js_msg["unreachable"]);
  }
}

WebfmDrag.getMouseOffset = function(element, event){
  var docPos = absolutePosition(element);
  var mousePos = WebfmDrag.mouseCoords(event);
  return {x:mousePos.x - docPos.x, y:mousePos.y - docPos.y};
}

WebfmDrag.mouseCoords = function(event){
  if(event.pageX || event.pageY){
    return {x:event.pageX, y:event.pageY};
  }
  return {
    x:event.clientX + document.body.scrollLeft - document.body.clientLeft,
    y:event.clientY + document.body.scrollTop  - document.body.clientTop
  };
}

/**
 * Event Handler from http://ajaxcookbook.org (Creative Commons Attribution 2.5)
 */
function addEventListener(instance, eventName, listener) {
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

function removeEventListener(event) {
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
Webfm.ctn = function(textNodeContents) { var textNode = document.createTextNode(textNodeContents); return textNode; }
Webfm.ce = function(elementName) { elementName = elementName.toLowerCase(); var element = document.createElement(elementName); return element; }

// Empty all child nodes
Webfm.clearNodeById = function(elementId) {
  var node = $(elementId);
  while (node.hasChildNodes())
    node.removeChild(node.firstChild);
}

Webfm.sortByName = function(a, b) {
  var x = a.n.toLowerCase();
  var y = b.n.toLowerCase();
  return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}
Webfm.sortBySize = function(a, b) {
  return parseInt(parseFloat(a.s)) -  parseInt(parseFloat(b.s))
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

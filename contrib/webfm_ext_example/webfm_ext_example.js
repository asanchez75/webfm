/* $Id$ */

//Setup unique namespace
function webfmExtExample() {}

// define custom menu options (values are translatable - do not change keys)
webfmExtExample.menu_msg = [];
webfmExtExample.menu_msg["rm"] = "Delete File";
webfmExtExample.menu_msg["ren"] = "Rename File";
webfmExtExample.menu_msg["example_op"] = "Example File Op";

//Build page content layout if this javascript present 'onload'
if (Drupal.jsEnabled) {
  $(window).load(example_layout);
}

// define page content layout
// This example has no tree - just a listing of files in the example root dir
function example_layout() {
  var layoutDiv = '';
  //the following div id corresponds to line 168 of webfm_ext_example.module
  layoutDiv = Webfm.$('webfm-ext-example');

  if(layoutDiv) {
    var layout_cont = Webfm.ce('div');

    var menu = new Webfm.menuHashTable();
    menu.put('example', new Webfm.menuElement(Webfm.menu_msg["rm"], Webfm.menuRemove, ''));
    menu.put('example', new Webfm.menuElement(Webfm.menu_msg["ren"], Webfm.menuRename, ''));
    menu.put('example', new Webfm.menuElement(webfmExtExample.menu_msg["example_op"], webfmExtExample.menuExOp, webfmExtExample.validate));

    //append user feedback and file listing objects
    Webfm.alrtObj = new Webfm.alert(layout_cont, 'alertbox');
    Webfm.progressObj = new Webfm.progress(layout_cont, 'progress');
    //see Webfm.list construtor in webfm.js for meaning of parameters
    Webfm.dirListObj = new Webfm.list(layout_cont, 'dirlist', 'webfm-ext', false, 'wide', false, '', menu.get('example'));

    //put listing, progress and alert divs before upload fset built in module
    layoutDiv.insertBefore(layout_cont, layoutDiv.firstChild);

    //append debug object if debugging enabled
    Webfm.dbgObj = new Webfm.debug(getDebugFlag() ? layoutDiv : '');

    // init context menu
    Webfm.contextMenuObj = new Webfm.context();

    //fetch listing of webfmExtExample root directory
    Webfm.dirListObj.fetch(getExamplePath());
  }
}

webfmExtExample.validate = function(obj) {
  if((obj.element.className != 'dirrow') && (obj.element.className.substring(0,4) != 'tree')) {
    if(obj.ext.toLowerCase() == 'csv') {
      return true;
    }
  }
  return false;
}


webfmExtExample.menuExOp = function(obj) {
  if(Webfm.confirm("Do you wish to run the " + webfmExtExample.menu_msg["example_op"] + "?")) {
    // call user function defined in webfm_ext_example_menu()
    url = getBaseUrl();
    window.location = url + '/?q=webfm_ext_example_process&action=' + encodeURIComponent('ex-op') + '&file=' + encodeURIComponent(obj.element.title);
  }
}

//Setup unique namespace
function webfmExtExample() {}

// define custom menu options (values are translatable - do not change keys)
webfmExtExample.menu_msg = [];
webfmExtExample.menu_msg["rm"] = "Delete File";
webfmExtExample.menu_msg["ren"] = "Rename File";
webfmExtExample.menu_msg["example_op"] = "Example File Op";
// define custom menu
webfmExtExample.menu = { 'rm': webfmExtExample.menu_msg["rm"], 'ren': webfmExtExample.menu_msg["ren"], 'ex-op': webfmExtExample.menu_msg["example_op"] };

//Build page content layout if this javascript present 'onload'
if (Drupal.jsEnabled) { Webfm_addLoadEvent(example_layout); }

// define page content layout
// This example has no tree - just a listing of files in the example root dir
function example_layout() {
  var layoutDiv = '';
  //the following div id corresponds to line 168 of webfm_ext_example.module
  layoutDiv = Webfm.$('webfm-ext-example');

  if(layoutDiv) {
    var layout_cont = Webfm.ce('div');

    //append user feedback and file listing objects
    Webfm.alrtObj = new Webfm.alert(layout_cont, 'alertbox');
    Webfm.progressObj = new Webfm.progress(layout_cont, 'progress');
    //see Webfm.list construtor in webfm.js for meaning of parameters
    Webfm.dirListObj = new Webfm.list(layout_cont, 'dirlist', 'webfm-ext', false, 'wide', false);

    //put listing, progress and alert divs before upload fset built in module
    layoutDiv.insertBefore(layout_cont, layoutDiv.firstChild);

    //append debug object if debugging enabled
    Webfm.dbgObj = new Webfm.debug(getDebugFlag() ? layoutDiv : '');

    // init context menu - arg is menu callback
    Webfm.contextMenuObj = new Webfm.context(webfmExtExample.event);
    //2nd arg must be same as 3rd arg of Webfm.list constructor for remote menuing
    Webfm.contextMenuObj.addContextMenu(webfmExtExample.menu, 'webfm-ext');
//  Webfm.dbgObj.dbg("getExamplePath()", getExamplePath());
    //fetch listing of webfmExtExample root directory
    Webfm.dirListObj.fetch(getExamplePath());
  }
}

webfmExtExample.event = function(event, obj) {
  event = event||window.event;
  //'this' refers to Webfm.context object
  var url = Webfm.ajaxUrl();
  // Determine if this.element is a file (required for some ops inside switch)
  this.is_file = ((this.element.className != 'dirrow') && (this.element.className.substring(0,4) != 'tree'));
  var path = obj.element.title;
  switch((event.target||event.srcElement).title) {
    //cases correspond to keys in webfmExtExample.menu object
    case 'rm':
      this.remove(url, path);
      break;

    case 'ren':
      this.rename(url);
      break;

    case 'ex-op':
      if(this.confirm("Do you wish to run the " + webfmExtExample.menu['ex-op'] + "?")) {
        // call user function defined in webfm_ext_example_menu()
        url = getBaseUrl();
        window.location = url + '/?q=webfm_ext_example_process&action=' + encodeURIComponent('ex-op') + '&file=' + encodeURIComponent(this.clickObj.title);
      }
      break;

    default:
      Webfm.dbgObj.dbg("illegal operation");
      break;
  }
  return false;
}

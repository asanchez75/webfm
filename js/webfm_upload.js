/**
 * Attaches the upload behaviour to the upload form.
 * This file identical to upload.js except for namespace, base id and refresh
 */
Webfm.uploadAutoAttach = function() {
  $('input.webfmupload').each(function () {
    var uri = this.value;
    // Extract the base name from the id (edit-attach-url -> wfmatt).
    var base = this.id.substring(5, this.id.length - 4);
    var button = base + '-button';
    var wrapper = base + '-wrapper';
    var hide = base + '-hide';
    var upload = new Webfm.jsUpload(uri, button, wrapper, hide);
  });
}

/**
 * JS upload object.
 */
Webfm.jsUpload = function(uri, button, wrapper, hide) {
  // Note: these elements are replaced after an upload, so we re-select them
  // everytime they are needed.
  this.button = '#'+ button;
  this.wrapper = '#'+ wrapper;
  this.hide = '#'+ hide;
  Drupal.redirectFormButton(uri, $(this.button).get(0), this);
}

/**
 * Handler for the form redirection submission.
 */
Webfm.jsUpload.prototype.onsubmit = function () {
  // Insert progressbar and stretch to take the same space.
  this.progress = new Drupal.progressBar('uploadprogress');
  this.progress.setProgress(-1, 'Uploading file');

  var hide = this.hide;
  var el = this.progress.element;
  var offset = $(hide).get(0).offsetHeight;
  $(el).css({
    width: '28em',
    height: offset +'px',
    paddingTop: '10px',
    display: 'none'
  });
  $(hide).css('position', 'absolute');

  $(hide).after(el);
  $(el).fadeIn('slow');
  $(hide).fadeOut('slow');
}

/**
 * Handler for the form redirection completion.
 */
Webfm.jsUpload.prototype.oncomplete = function (data) {
  // Remove old form
  Drupal.freezeHeight(); // Avoid unnecessary scrolling
  $(this.wrapper).html('');

  // Place HTML into temporary div
  var div = document.createElement('div');
  $(div).html(data);

  // If uploading the first attachment fade in everything
  if ($('tr', div).size() == 2) {
    // Replace form and re-attach behaviour
    $(div).hide();
    $(this.wrapper).append(div);
    $(div).fadeIn('slow');
    Webfm.uploadAutoAttach();
  }
  // Else fade in only the last table row
  else {
    // Hide form and last table row
    $('table tr:last-of-type td', div).hide();

    // Note: workaround because jQuery's #id selector does not work outside of 'document'
    // Should be: $(this.hide, div).hide();
    var hide = this.hide;
    $('div', div).each(function() {
      if (('#'+ this.id) == hide) {
        this.style.display = 'none';
      }
    });

    // Replace form, fade in items and re-attach behaviour
    $(this.wrapper).append(div);
    $('table tr:last-of-type td', div).fadeIn('slow');
    $(this.hide, div).fadeIn('slow');
    Webfm.uploadAutoAttach();
  }
  Drupal.unfreezeHeight();
  Webfm.dirListObj.flushCache();
  Webfm.dirListObj.fetch();
}

/**
 * Handler for the form redirection error.
 */
Webfm.jsUpload.prototype.onerror = function (error) {
  alert('An error occurred:\n\n'+ error);
  // Remove progressbar
  $(this.progress.element).remove();
  this.progress = null;
  // Undo hide
  $(this.hide).css({
    position: 'static',
    left: '0px'
  });
}


// Global killswitch
if (Drupal.jsEnabled) {
  $(document).ready(Webfm.uploadAutoAttach);
}

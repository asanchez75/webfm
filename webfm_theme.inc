<?php

/**
 * @file
 * This file holds the themeing functions of webfm
 *
 * Currently there is only one function creating a table for the attachments.
 */

/**
 * Displays file attachments in table
 *
 * @return
 *        string HtMl of attachments-table themed via the theme('table'... function.
 */
function theme_webfm_attachments($files) {
  global $base_url;

  $header = array(t('Attachment'));
  if ($enable_date = variable_get('webfm_attach_date', '')) {
    array_push($header, t('Date'));
  }
  if ($enable_size = variable_get('webfm_attach_size', '')) {
    array_push($header, t('Size'));
  }

  $rows = array();
  foreach ($files as $file) {
    // 0 =inline : 1 = attach
    $icon_path = $base_url .'/'. variable_get('webfm_icon_dir', drupal_get_path('module', 'webfm') .'/image/icon')  .'/'. _webfm_get_icon($file->e);
    $description = '';
    if (variable_get('webfm_attach_desc', '') && !empty($file->fdesc)) {
      $description = '<div class="att-fdesc">'. $file->fdesc .'</div>';
    }
    $filename = $file->ftitle ? $file->ftitle : $file->n;
    switch (variable_get('webfm_attach_new_window', 0)) {
        case 2:
        case 1:
            $target = '_blank';
            break;
        default:
            $target = '_self';
            break;
    }

    $href = array(
      'data' => l('<img src="'. $icon_path .'" alt="'. t('File') .'" title="'. t('Download !filename', array('!filename' => $filename)) .'" /> ', 'webfm_send/'. $file->id .'/1', array('attributes' => array('title' => 'Download '. $filename, 'target' => $target), 'html' => TRUE)) . l($filename, 'webfm_send/'. $file->id, array('attributes' => array('title' => t('Open @filename', array('@filename' => $filename)), 'target' => $target))) . $description,
      'class' => 'att-title'
    );

    $row = array();
    array_push($row, $href);
    if ($enable_date) {
      $time = $file->fcreatedate ? date(webfm_get_date_format(), $file->fcreatedate) : date(webfm_get_date_format(),  @filemtime($file->p .'/'. $file->n));
      array_push($row, array('data' => $time, 'class' => 'att-time'));
    }
    if ($enable_size) {
      array_push($row, array('data' => format_size($file->s), 'class' => 'att-size'));
    }
    array_push($rows, $row);
  }
  if (count($rows)) {
    return theme('table', $header, $rows, array('class' => 'webfm-attach-list'));
  }
}


/**
 * Displays attachments as a list for use inline with hook_link
 * 
 * @param $files
 * 
 * @return
 */
function theme_webfm_attachments_link($files) {
    global $base_url;
    switch (variable_get('webfm_attach_new_window', 0)) {
        case 2:
        case 1:
            $target = '_blank';
            break;
        default:
            $target = '_self';
            break;
    }
    
    $list = array();
    foreach ($files as $file) {
        $item = array();
        $icon_path = $base_url .'/'. variable_get('webfm_icon_dir', drupal_get_path('module', 'webfm') .'/image/icon')  .'/'. _webfm_get_icon($file->e);
        $filename = $file->ftitle ? $file->ftitle : $file->n;
        $item['title'] = '<img src="'. $icon_path .'" alt="'. t('File') .'" title="'. t('Download !filename', array('!filename' => $filename)) .'" /> '. $filename;
        $item['href'] = 'webfm_send/'. $file->id;
        $item['html'] = TRUE;
        $item['attributes'] = array('target' => $target);
        $list[] = $item;
    }
    
    return theme('links', $list, array('class' => 'webfm_attachments_links'));
}
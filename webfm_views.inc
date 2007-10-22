<?php
/* $Id$ */

function webfm_views_tables(){
  $tables = array();

   /**
   * The webfm_attach table links directly to the node table,
   * via the nid field
   */

  $tables['webfm_attach'] = array('name' => 'webfm_attach',
                                  'join' => array(
                                    'type' => 'inner',
                                    'left' => array(
                                      'table' => 'node',
                                      'field' => 'nid'
                                     ),
                                     'right' => array(
                                       'field' => 'nid'
                                        ),
                                  ),
                                 );
  $tables['webfm_file'] = array('name' => 'webfm_file',
                                'join' => array(
                                  'type' => 'inner',
                                  'left' => array(
                                    'table' => 'webfm_attach',
                                    'field' => 'fid'
                                  ),
                                  'right' => array(
                                    'table' => 'webfm_file',
                                    'field' => 'fid'
                                  ),
                                 ),
                                 'fields' => array(
                                   'all_files' => array(
                                     'name' => t('WebFM: All files by name'),
                                     'notafield' => true,
                                     'handler' => 'webfm_views_handler_file_all_files',
                                     'option' => array(
                                       '#type' => 'select',
                                       '#options' => array(
                                         'link' => t('With links'),
                                         'nolink' => t('Without links'),
                                       )
                                     ),
                                     'sortable' => false,
                                     'help' => t('Display ALL the files that have been attached a node via WebFM (with or without links to the files themselves).  All files are displayed in a single field per node.'),
                                    ),
                                    'fname' => array(
                                      'name' => t('WebFM: File name'),
                                      'handler' => array (
                                        'webfm_views_handler_file_filename_download' => t('With links'),
                                        'webfm_views_handler_file_filename' => t('Without links'),
                                      ),
                                      'sortable' => true,
                                      // consider 'option' --> link inline - or link force download - extra arg for webfm send
                                      'addlfields' => array('fid'),
                                      'help' => t('Display the name of files that have been attached to a node via WebFM (with or without links to the files themselves)'),
                                    ),
                                    'fsize' => array(
                                      'name' => t('WebFM: File size'),
                                      'sortable' => true,
                                      'handler' => 'webfm_views_handler_file_size',
                                      'help' => t('Display the file size of files that have been attached to a node via WebFM')
                                    ),
                                    'fmime' => array(
                                      'name' => t('WebFM: File mime type'),
                                      'sortable' => true,
                                      'help' => t('Display the file mime type of files that have been attached to a node via WebFM'),
                                    ),
                                    'ftitle' => array(
                                      'name' => t('WebFM metadata:  file title'),
                                      'sortable' => true,
                                      'help' => t('Display the file title of files that have been attached to a node via WebFM')
                                    ),
                                    'fdesc' => array(
                                      'name' => t('WebFM metadata:  File description'),
                                      'sortable' => true,
                                      'help' => t('Display the description of files that have been attached to a node via WebFM')
                                    ),
                                    'flang' => array(
                                      'name' => t('WebFM metadata:  File language'),
                                      'sortable' => true,
                                      'help' => t('Display the language of files that have been attached to a node via WebFM')
                                    ),
                                    'fpublisher' => array(
                                      'name' => t('WebFM metadata:  File publisher'),
                                      'sortable' => true,
                                      'help' => t('Display the publisher of files that have been attached to a node via WebFM')
                                    )
                                  ),
                                  'filters' => array(
                                    'fname' => array(
                                      'name' => t('WebFM: File name'),
                                      'operator' => 'views_handler_operator_like',
                                      'handler' => 'views_handler_filter_like',
                                      'help' => t('This filter allows nodes to be filtered by the names of files that have been attached via WebFM.  e.g. show only nodes with a file called "foo.txt" attached to them'),
                                    ),
                                    'fsize' => array(
                                      'name' => t('WebFM: File size'),
                                      'operator' => 'views_handler_operator_gtlt',
                                      'help' => t('This filter allows nodes to be filtered by the size of files that have been attached via WebFM. e.g. show only nodes with files larger than 1M attached to them'),
                                    ),
                                    'fmime' => array(
                                      'name' => t('WebFM: File mime type'),
                                      'operator' => 'views_handler_operator_like',
                                      'handler' => 'views_handler_filter_like',
                                      'help' => t('This filter allows nodes to be filtered by the mime type of files that have been attached via WebFM.  e.g. show only nodes with a .pdf document attached to them'),
                                    ),
                                    'ftitle' => array(
                                      'name' => t('WebFM metadata: File title'),
                                      'operator' => 'views_handler_operator_like',
                                      'handler' => 'views_handler_filter_like',
                                      'help' => t('This filter allows nodes to be filtered by the title of files that have been attached via WebFM.  e.g. show only nodes with a file attached wich has a metadata title like "bar"'),
                                    ),
                                    'fdesc' => array(
                                      'name' => t('WebFM metadata: File description'),
                                      'operator' => 'views_handler_operator_like',
                                      'handler' => 'views_handler_filter_like',
                                      'help' => t('This filter allows nodes to be filtered by the description of files that have been attached via WebFM.  e.g. show only nodes with a file attached which have a metadata description which contains all the words "foo, bar and baz"'),
                                    ),
                                    'flang' => array(
                                      'name' => t('WebFM metadata: File language'),
                                      'operator' => 'views_handler_operator_like',
                                      'handler' => 'views_handler_filter_like',
                                      'help' => t('This filter allows nodes to be filtered by the language of files that have been attached via WebFM.  e.g. show only nodes with a file attached which have a metadata language equal to "fr"'),
                                    ),
                                  ),
                                  'sorts' => array(
                                    'fname' => array(
                                      'name' => t('WebFM: Sort by file name'),
                                      'help' => t('Sort by file name'),
                                    ),
                                    'fsize' => array(
                                      'name' => t('WebFM: Sort by file size'),
                                      'help' => t('Sort by file size.'),
                                    ),
                                    'fmime' => array(
                                      'name' => t('WebFM: Sort by mime type'),
                                      'help' => t('Sort by mime type.'),
                                    ),
                                    'ftitle' => array(
                                      'name' => t('WebFM metadata: Sort by file title'),
                                      'help' => t('Sort by file metadata title'),
                                    ),
                                    'flang' => array(
                                      'name' => t('WebFM metadata: Sort by file language'),
                                      'help' => t('Sort by mime type.'),
                                    ),
                                    'fpublisher' => array(
                                      'name' => t('WebFM metadata: Sort by file publisher'),
                                      'help' => t('Sort by mime type.'),
                                    ),
                                  )
                                 );

  return $tables;

}

function webfm_views_handler_file_all_files($fieldinfo, $fielddata, $value, $data){
  //global $base_url;
  $links = array();

  $query = "SELECT wf.* FROM {webfm_file} wf INNER JOIN {webfm_attach} wa ON wf.fid = wa.fid WHERE wa.nid = %d ORDER BY %s";
  $result = db_query($query, $data->nid, 'wa.weight');
    while ($file = db_fetch_object($result)) {
    if ($fielddata['options'] == 'nolink') {
      $links[] = check_plain($file->fname);
    }
    else {
      // could add the icon here - really this should be all a theme thing where the user decides...
      // but until then lets just provide the links with the file names
      //$icon_path = $base_url.'/'.variable_get('webfm_icon_dir', 'modules/webfm/image/icon').'/f.gif';
      //$links[] = l('<img src="'.$icon_path.'" alt="[file]" />&nbsp;', 'webfm_send/'.$file->fid.'/0', '', '' , '' , '', TRUE). l(check_plain($file->fname), 'webfm_send/'.$file->fid);
      $links[] = l(check_plain($file->fname), 'webfm_send/'.$file->fid);
    }
  }
  return implode(' | ', $links);
}

function webfm_views_handler_file_filename($fieldinfo, $fielddata, $value, $data){
  return $value;
}

function webfm_views_handler_file_filename_download($fieldinfo, $fielddata, $value, $data){
  return l(check_plain($value), 'webfm_send/'.$data->webfm_file_fid);
}

function webfm_views_handler_file_size($fieldinfo, $fielddata, $value, $data){
  return format_size($value);
}


function webfm_views_default_views(){


}

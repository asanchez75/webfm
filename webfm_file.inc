<?php
/* $Id$ */

/**
 * webfm_mkdir -called from the ajax action - switch case 'mkdir':
 *
 * @param string $source - the source directory path
 * @param string $dest - the destination directory name
 *
 * @ret   bool   -true if the directory is created with 775 permissions
 */
function webfm_mkdir($source, $dest){
  $mkdir_path = ($source.'/'.$dest);
  if (!is_dir($mkdir_path)) {
    if(@mkdir($mkdir_path)) {
      chmod($mkdir_path, 0775);
      if (!is_writable($mkdir_path))
        drupal_set_message(t('The directory %directory is not writable.', array('%directory' => $mkdir_path)));
      else
        return TRUE;
    }
  }
  return FALSE;
}

/**
 * webfm_rename -called from the ajax action - switch case 'rename':
 *
 * @param string $source - the source directory path
 * @param string $dest - the destination directory name
 * @param bool $db_check - true if db record update required
 *
 * @ret   bool   -true if the directory/file is renamed and file record(s)
 *                updated if dir/file under db control
 */
function webfm_rename($source, $dest, $db_check) {
  $dest_temp = $dest.'~'; //handle possible case problem
  if(is_file($source) && !is_file($dest)) {
    // Get file extension
    if ($ext = explode('.', $dest)) {
      //$dest != ""
      $extension = strtolower($ext[count($ext) - 1]);
      if((strcmp($extension, 'php') == 0) ||
         (strcmp($extension, 'cgi') == 0)) {
        //illegal file extension
        drupal_set_message(t('%ext is invalid extension for rename', array('%ext' => $extension)), error);
        return FALSE;
      } else {
        if(rename($source, $dest_temp)) {
          if(!(rename($dest_temp, $dest))) {
            rename($dest_temp, $source);
          } else if($db_check) {
            return webfm_rename_db_file($source, $dest);
          } else {
            return TRUE;
          }
        }
      }
    }
  } else if(is_dir($source) && !is_dir($dest) && rename($source, $dest_temp)) {
    if(!(rename($dest_temp, $dest))) {
      rename($dest_temp, $source);
      drupal_set_message(t('rename %source dir fail', array('%source' => $source)), error);
      return FALSE;
    } else if($db_check) {
      //directory rename is OK, back out, rename db files and rename dir again
      rename($dest, $dest_temp);
      rename($dest_temp, $source);
      if(webfm_rename_db_dir_recur($source, $dest, TRUE)) {
        rename($source, $dest_temp);
        rename($dest_temp, $dest);
      } else {
        drupal_set_message(t('webfm_rename_db_dir_recur error - db may be corrupted'), error);
        return FALSE;
      }
    }
    return TRUE;
  }
  drupal_set_message(t('rename %source to %dest fail', array('%source' => $source, '%dest' => $dest)), error);
  return FALSE;
}

function webfm_rename_db_file($source, $dest) {
  if($fid = webfm_get_fid($source)) {
    if(!webfm_dbupdate_file($fid, $dest)) {
      //db error - consult drupal_set_message feedback
      return FALSE;
    }
  } else {
    //delete unknown file
    unlink($source);
    return FALSE;
  }
  return TRUE;
}

function webfm_rename_db_dir_recur($source, $dest, $ret) {
  if($handle = opendir($source)) {
    while(($file = readdir($handle)) !== FALSE) {
      if($file != '.' && $file != '..') {
        $source_item  = $source.'/'.$file;
        $dest_item = $dest.'/'.$file;
        if(is_file($source_item)) {
          if(!(webfm_rename_db_file($source_item, $dest_item)))
            $ret = FALSE;
        } elseif(is_dir($source_item)) {
          $ret = webfm_rename_db_dir_recur($source_item, $dest_item, $ret);
        }
      }
    }
    closedir($handle);
  }
  return $ret;
}

/**
 * webfm_delete - called from the ajax action - switch case 'delete':
 *
 * @param string $source - the source directory path
 * @param bool   $db_check - flag for db file record check (ftp transfer = FALSE)
 *
 * @ret   bool   -true if the directory or file is deleted and all file records updated
 */
function webfm_delete($source, $db_check){
  if(is_dir($source)) {
    return webfm_delete_dir_recur($source, $db_check, TRUE);
  } else if(is_file($source)) {
    return webfm_delete_file($source, $db_check);
  }
  return FALSE;
}

function webfm_delete_file($source, $db_check){
  if(unlink($source)) {
    if($db_check) {
      if($fid = webfm_get_fid($source)) {
        if(webfm_dbdelete_file($fid)) {
          return TRUE;
        } else {
          return FALSE;
        }
      } else {
        return FALSE;
      }
    } else {
      return TRUE;
    }
  }
  return FALSE;
}

function webfm_delete_dir_recur($source, $db_check, $ret) {
  if($handle = opendir($source)) {
    while(($file = readdir($handle)) !== FALSE) {
      if($file != '.' && $file != '..') {
        $source_item  = $source.'/'.$file;
        if(is_file($source_item)) {
          if(!(webfm_delete_file($source_item, $db_check)))
            $ret = FALSE;
        } elseif (is_dir($source_item)) {
          webfm_delete_dir_recur($source_item, $db_check, $ret);
        }
      }
    }
    closedir($handle);
  } else {
    return FALSE;
  }
  $retn = rmdir($source);
  return ($retn == TRUE && $ret == TRUE);
}

/**
 * Move a directory or file and update database
 *
 * @param string $source - the source directory path
 * @param string $dest - the destination directory name
 * @param bool   $db_check - flag for db file record check (ftp transfer = FALSE)
 *
 * @ret   bool   -true if the file and the database entries are updated successfully
 *
 */
function webfm_move($source, $dest, $db_check){
  if(is_dir($source)) {
    return webfm_move_dir_recur($source, $dest, $db_check, TRUE);
  } elseif(is_file($source)) {
    $dest .= '/' . strrev(substr(strrev($source), 0, strpos(strrev($source), '/')));
    return webfm_move_file($source, $dest, $db_check);
  }
  return FALSE;
}

function webfm_move_file($source, $dest, $db_check) {
  if($db_check) {
    if($fid = webfm_get_fid($source)) {
      if($ret = file_move($source, $dest)) {
        if(!(webfm_dbupdate_file($fid, $dest))) {
          return FALSE;
        }
      } else {
          return FALSE;
      }
    } else {
      unlink($source);
      return FALSE;
    }
  } else {
    //For ftp - build a file record with current source path
    //update after successful copy
    $file = new stdClass();
    $file->filename = basename($source);
    $file->filepath = $source;
    $file->filesize = filesize($source);
    if(webfm_upload_validate($file) === TRUE) {
      if(!webfm_dbinsert_file($file, $dest, $metadata)){
        return FALSE;
      }
    }

    if($fid = webfm_get_fid($source)) {
      //move from ftp - no delete
      if($ret = file_copy($source, $dest, FILE_EXISTS_RENAME)) {
        if(!(webfm_dbupdate_file($fid, $dest))) {
          return FALSE;
        }
      } else {
        //remove ftp file record
        _webfm_dbdelete_file_fid($fid);
      }
    } else {
      return FALSE;
    }
  }
  return TRUE;
}

function webfm_move_dir_recur($source, $dest, $db_check, $ret) {
  $dest .= '/' . strrev(substr(strrev($source), 0, strpos(strrev($source), '/')));
  if(!is_dir($dest)) {
    if(!(@mkdir($dest))) {
      return FALSE;
    }
    chmod($dest, 0775);
    if (!is_writable($dest)) {
      drupal_set_message(t('The directory %directory is not writable.', array('%directory' => $dest)));
      return FALSE;
    }
  } else {
    //directory already exists (will only occur at topmost directory)
    return FALSE;
  }
  if($handle = opendir($source)) {
    while(false !== ($file = readdir($handle))) {
      if($file != '.' && $file != '..') {
        $source_item = $source.'/'.$file;
        if(is_file($source_item)) {
           // file
           if(!(webfm_move_file($source_item, $dest.'/'.$file, $db_check)))
             $ret = FALSE;
        } elseif(is_dir($source_item)) {
          // directory
          $ret = webfm_move_dir_recur($source_item, $dest, $db_check, $ret);
        }
      }
    }
    closedir($handle);
  } else {
    return FALSE;
  }
  if($db_check)
    //Do not delete ftp directories (permission err)
    @rmdir($source);
  return $ret;
}

?>

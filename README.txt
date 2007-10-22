/* $Id$ */

Drupal webfm.module README.txt
==============================================================================

The Drupal webfm.module presents a paradigm shift in file management for Drupal.
This file manager is based on heirarchical directory structure unlike the
traditional flat filesystem used to date.  Webfm uses AJAX to allow users to
arrange files on the server in the same way they do with file managers on their
personal systems. This ability to heirarchically arrange files greatly
enhances the  managability of large collections of data.

WebFM does not exclude the use of the upload.module or other modules that depend
on the flat filesystem schema.  WebFM uses the file_move and file_copy functions
from file.inc.

Bug reports can be sent to the email address in the credits area below.


Installation
------------------------------------------------------------------------------

  - Copy the 'webfm' directory to your Drupal modules directory
  - Enable the module on Drupal's admin/modules page.  An install file
  updates the database with the necessary table additions.
  - Configure the module at admin/settings/webfm and manually create the WebFM
  root sub-directory.  Optionally create a sub-directory for ftp use.
  - Update the menu cache by navigating to admin/menu


Configuration
------------------------------------------------------------------------------

The following assumes that the 'File system path' is set in the usual way at
Administer >> Site configuration >> File system
(browser address = your-base-url/admin/settings/file-system).

  - Create a directory in the 'File system path' directory.  This directory will
  become the webfm filesystem dir.  Set the directory permissions to 775 if the
  server is linux/bsd.

  - In your-base-url/admin/settings/webfm set the root path to this directory.

  - Set rights in your-base-url/admin/user/access per role.  These roles will
  receive specific configuration fields in your-base-url/admin/settings/webfm
  if 'access webfm' is checked.  Each role granted 'access webfm' rights must
  have a root directory that is a subdirectory of the webfm filesystem directory.
  This directory can be created by an administrator within the module via the
  normal 'create directory' methods.

  - Only users in a role with 'administer webfm' rights can manipulate directories.
  Such users have full access to all capabilities and settings of the module.

  - Users in a role with 'access webfm' rights can access the browser and view/
  download/attach/detach any file below the root directory set for that role.
  Users cannot navigate above this path.

  - Files without a record in the webfm_file table cannot be viewed in the
  browser by users with 'access webfm' rights. Only files with a db record are
  attachable, or can be associated with metadata.

  - File owners and admins are the only users capable of delete/rename/move or
  metadata editing.

  - If a user has the right to attach files, it is also necessary to enable
  attachments in your-base-url/admin/content/types/*type* for each content type
  that will accept attachments (default is disabled).

  - Optionally a .htaccess file can be placed in the WebFM root directory to
  secure file access (apache servers).


Features
------------------------------------------------------------------------------

  - Application-like look and feel via AJAX
  - Drag and drop moves of files and directories
  - Attachment of files to multiple nodes - location independence allows dir
    restructuring to have no affect on attachment functionality
  - Drag and drop attachment ordering
  - Single file upload with version options for file overwrite
  - File delete/rename/move/metadata for admins or file owners
  - File view/attach/detach menu options for users with role access
  - File store-in-db/remove-from-db admin menu options
  - Directory create/rename/delete admin menu options
  - Directory search for all users
  - Home directory per role with WebFM access (manually create and configure)
  - Secure file download if .htaccess file used
  - Metadata editor for admins or file owners(fixed fields at this time)
  - Debug window option for admin javascript development


To Do
------------------------------------------------------------------------------

  - Flexible metadata scheme and standards based access for data mining
  - API for content/metadata search/sort.
  - Menu option to place links to filesystem files inside node content (TinyMCE
    plugin?)
  - HTTPS?


Credits / Contact
------------------------------------------------------------------------------

(c) 2007 Web Community Resource Networks
401 Richmond St. W., Suite 384, Toronto, ON, Canada  M5V 3A8
http://web.net

Bug reports, feature requests, or other comments can be made on the project page
at http://drupal.org/project/webfm.

The author and maintainer of the module is Rob Milne.  Andre Molnar provided
most of the db work and a lot of the php. Paul Shales assisted in the early
development of attachment and context menuing.

Some of the php source is based on the Drupal upload module.  The upload
component is little changed.

Sources for the javascript are to be found all over the web.  I borrowed ideas
from open source forums and modified to my needs.  The starting point was the
drupalization of the mxfb project on SourceForge.  Little residue remains of
that GPL code but it gave me much inspiration.  The event handler is courtesy
of http://ajaxcookbook.org (Creative Commons Attribution 2.5 License).

I cannot remember where all the icon gifs originated but their provinence is
open source.

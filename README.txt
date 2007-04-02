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

  - Copy the webfm directory to your Drupal modules directory
  - Enable the module on Drupal's admin/modules page.  An install file
  updates the database with the necessary table additions.
  - Configure the module at admin/settings/webfm and create the root
  sub-directories.
  - Update the menu cache by navigating to admin/menu


Configuration
------------------------------------------------------------------------------

The following assumes that the 'File system path' is set in the usual way at
admin/settings.

  - Create two directories in the 'File system path' directory.  One will become
  the webfm filesystem dir and the other the ftp-staging dir.  Set the directory
  permissions to 775 if the server is linux/bsd.
  - In admin/settings/webfm set the root paths to these two directories (must be
  prefaced with a '/').
  - Set rights in admin/access per role.  These roles will receive specific
  configuration fields in admin/settings/webfm if 'access_webfm' is checked.

NOTE: 'access_webfm' can be selected for the anonymous user but is not
recommended since any WebFM user has the ability to make changes to the contents
of the filesystem on the server.

  - Optionally a .htaccess file can be placed in the webfm dir to secure file
  access (apache servers).


Features
------------------------------------------------------------------------------

  - Application-like look and feel via AJAX
  - Drag and drop moves of files and directories
  - Attachment of files to multiple nodes - location independence allows dir
    restructuring to have no affect on attachment functionality
  - Drag and drop attachment ordering
  - Single file upload
  - Staging area for mass upload/importation
  - File delete/rename/attach/detach/metadata menu options
  - Directory create/rename/delete menu options
  - Secure file download
  - Metadata editor (fixed fields at this time)
  - File search
  - Debug area for javascript development


To Do
------------------------------------------------------------------------------

  - Flexible metadata scheme and standards based access for data mining
  - API for content/metadata search/sort.
  - Fine grained permissions for directories/file access by role/uid
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

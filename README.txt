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

  - Unzip the archive and copy the 'webfm' directory to your modules directory
  (ie:/sites/all/modules). Alternatively copy the tarball to the module directory
  if you can unzip it on the server.

  - Enable the module on Drupal's admin/modules page.  An install file
  updates the database with the necessary table additions.


Configuration
------------------------------------------------------------------------------
Configure the module at admin/settings/webfm. Note: The configuration assumes
that the 'File system path:' is set in the usual way at admin/settings/file-system.
All WebFM directories are sub-directories of this 'File System' path. Set
'Download method:' radio to 'Public' since the module manages the download.

  - Create the 'WebFM root directory'. If this directory doesn't already exist,
  the system will create it in the 'File System' root. Multi directory root paths
  must already exist inside the 'File System' directory. Set the directory
  permissions to 775 if the server is linux/bsd.

  - The icon path allows the user to substitute their own gifs. File names are
  hardcoded in the javascript so the icons will have to have identical names.

  - The 'Maximum resolution for uploaded images' input functions in the same
  fashion as the root upload.module.

  - 'Default File Permissions' set the file level permissions for files inserted
  into the database.  The exception is file uploads that create a version
  overwrite whereby the new file inherits the permissions from the previous file.

  - Roles that are granted the 'access webfm' permission will receive additional
  configuration fields for root path, extension white list, max upload file size
  and max total upload size. Roles with the 'access webfm' right but without a
  root directory cannot access the filesystem.

  - Roles granted the 'attach WebFM files' permission will be able to see and
  download attached files. 'Attachment List Properties' sets the presentation of
  attached files.

  - The 'IE Drag-and-Drop Normalization' is a sub-optimal solution for
  compensating for relative positioning in theme css.

  - The 'Webfm javascript debug' checkbox is only useful for users interested
  in looking under the covers or who want to develop the module.

  - The WebFM cron is a 'stored procedure' used for database cleanup of file
  records that are deleted outside of the WebFM interface (ie: OS shell, ftp).
  This feature is only available to #1 user.

Set WebFM rights in admin/user/access per role.

  - 'administer webfm' confers full rights to a role. Admins can see and operate
  on all files, including files not in the database. Only admins can create
  directories and access admin/settings/webfm.

  - 'access webfm' allows a role to download/view files via the WebFM browser.
  Only files referenced by the webfm_file table in the database are accessible.
  Only owners of a file (and admins) can move a file or modify it's metadata.

  - 'view webfm attachments' allows a role to see files attached to nodes via
  WebFM.

  - 'webfm upload' allows a role with the 'access webfm' right to upload files
  via the WebFM browser. The user who uploads a file is the the owner of that
  file.

Admins and File owners can set the following file level permissions:
  - Public download: Allows the file to be downloaded anonymously even if
    .htaccess exists.

  - Role View/Download: Allows users of the same role to view/download the file.

  - Role Attach: Allows users of the same role to attach the file to nodes.

  - Role Full Access: Allows users of the same role to delete/rename/move the
    file.  File permission edits are not allowed by role.

Enable attachments in admin/settings/content-types/*type* for each content type
that will accept attachments (default is disabled).

A .htaccess file (apache servers) can be placed in the WebFM root (or sub-path)
to secure file access. Webfm streams downloads and thus your browser doesn't
require direct http access to the directories

Updating the menu cache by navigating to admin/build/menu may be necessary if
upgrading from an earlier version of the module with different internal paths.

Translations of the module require revising the string array at the top of
webfm.js.


Features
------------------------------------------------------------------------------

  - Application-like look and feel via AJAX
  - Drag and drop moves of files and directories
  - Attachment of files to multiple nodes - location independence allows dir
    restructuring to have no affect on attachment functionality
  - Drag and drop attachment ordering
  - Single file upload with version options for file overwrite
  - File delete/rename/move/attach/metadata/permissions menu options for admins
    or file owners
  - File menu options for users with role access set by file permission
  - File store-in-db/remove-from-db admin menu options
  - Directory create/rename/delete admin menu options
  - Directory search for files that respects view privileges
  - Home directory per role with WebFM access
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

The author and maintainer of the module is Rob Milne.  Andre Molnar contibuted
db queries and php. Paul Shales assisted in the early development of attachment
and context menuing.

A lot of the php source is based on the Drupal upload module.

Sources for the javascript are to be found all over the web.  I borrowed ideas
from open source forums and modified to my needs.  The starting point was the
drupalization of the mxfb project on SourceForge.  Little residue remains of
that GPL code but it gave me much inspiration.  The event handler is based on
http://ajaxcookbook.org (Creative Commons Attribution 2.5 License).

I cannot remember where all the icon gifs originated but their provinence is
open source.

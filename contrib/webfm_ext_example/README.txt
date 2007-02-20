This module is an example of a extension to WebFM that allows files to be
uploaded and operated on graphically through the use of context menuing.  This
is a very powerful tool that allows drupal to behave like an application server.

Developers need to provide a menu and an event handler function to the
Webfm.context() object inside the module .js file (see webfm_ext_example.js).
In the .module file, each menu option must have either an ajax destination or a
direct path via the window.location call.  One advantage to using the
window.location call over an ajax transaction is to prevent a timeout for
lengthy operations (a timer is included in the example).

The file 'data.CSV' has been included here to illustrate how data from a
standard file format exported from a spreadsheet application could be imported
into or compared with the drupal database.

This module uses core WebFM functionality and is not a standalone module.

Installation
------------------------------------------------------------------------------

  - Setup WebFM
  - remove the '.remove' from webfm_ext_example.module.remove to reveal the
    module to drupal.
  - Enable this module on Drupal's admin/modules page.
  - Configure the module and create the root sub-directory.
  - Update the menu cache by navigating to admin/menu.


Configuration
------------------------------------------------------------------------------

The following assumes that WebFM is functioning normally.

  - Create a directory in the 'File system path' directory.  This will become
  the 'WebFM Extension Example Root Directory'.  Set the directory
  permissions to 775 if the server is linux/bsd.
  - In admin/settings/webfm_extension_example set the root path to this
  directory (must be prefaced with a '/').
  - Set 'WebFM extension perm' rights in admin/access per role.  Only roles that
  are granted this right can use the module.


Test Usage
------------------------------------------------------------------------------

  - Navigate to /?q=webfm_ext_example
  - Upload the testdata.CSV file
  - Right mouse click for menu operations
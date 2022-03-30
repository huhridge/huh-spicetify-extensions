# skipStats

Filename : `skipStats.js`

![Preview](https://raw.githubusercontent.com/huhridge/huh-spicetify-extensions/main/skipStats/preview.jpg)

Extension to track your skips!

-   Tracks your skips when listening to playlists or albums!
-   Displays the data in a readable manner
-   Auto-skip songs over a certain value of skips

## To use:

-   To see the skips in current playlist/album: Click on the profile and select "See Skips for current playlist/album".

![profilemenu](https://raw.githubusercontent.com/huhridge/huh-spicetify-extensions/main/skipStats/skip_profilemenu.jpg)

-   Right Click on a playlist or album, and click "See Skip Stats".

![playlist](https://raw.githubusercontent.com/huhridge/huh-spicetify-extensions/main/skipStats/skip_playlist.jpg)

## Config

-   Set the auto skip limit: Go to profile menu and click on "Auto-Skip".

![autoskip](https://raw.githubusercontent.com/huhridge/huh-spicetify-extensions/main/skipStats/autoskip.jpg)

-   Reset Stats: Go to profile menu and click on the option accordingly.

## Install

Copy `skipStats.js` into your [Spicetify](https://github.com/khanhas/spicetify-cli) extensions directory:
| **Platform** | **Path** |
|------------|-----------------------------------------------------------------------------------|
| **Linux** | `~/.config/spicetify/Extensions` or `$XDG_CONFIG_HOME/.config/spicetify/Extensions/` |
| **MacOS** | `~/.config/spicetify/Extensions` or `$SPICETIFY_CONFIG/Extensions` |
| **Windows** | `%userprofile%\.spicetify\Extensions\` |

After putting the extension file into the correct folder, run the following command to install the extension:

```
spicetify config extensions skipStats.js
spicetify apply
```

Note: Using the `config` command to add the extension will always append the file name to the existing extensions list. It does not replace the whole key's value.

Or you can manually edit your `config-xpui.ini` file. Add your desired extension filenames in the extensions key, separated them by the | character.
Example:

```ini
[AdditionalOptions]
...
extensions = autoSkipExplicit.js|shuffle+.js|trashbin.js|skipStats.js
```

🌟 Like it? Gimme some love!  
[![Github Stars badge](https://img.shields.io/github/stars/huhridge/huh-spicetify-extensions?logo=github&style=social)](https://github.com/huhridge/huh-spicetify-extensions/)

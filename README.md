# Global Week Start

Global Week Start is a tiny Obsidian plugin that keeps Moment.js aligned with a user‑chosen **first day of the week**.  
This makes weekly behavior consistent across the vault for plugins that rely on Moment’s locale week settings, such as:

- Periodic Notes
- Calendar
- Any other plugin that uses `moment.localeData()._week` or `startOf("week")`

The plugin works entirely in-memory and does not modify any of your notes.


## Why this plugin? Why not use Calendar?

This plugin was created in response to an issue I experienced, that someone else described in the following community thread:

- [Calendar plugin settings dissapearing issue](https://forum.obsidian.md/t/calendar-plugin-settings-dissapearing-issue/93187)

The Calendar plugin’s settings panel intermittently loses its week‑start options after restarting Obsidian.  
When that happens, the Calendar plugin effectively stops enforcing the custom week start (for example, Monday for ISO weeks), and Periodic Notes weekly notes fall back to a Sunday–Saturday layout despite having been configured for Monday‑based weeks.

Global Week Start avoids this failure mode by enforcing the week start directly at the Moment.js level, even if Calendar is not loaded, is partially disabled, or its settings temporarily disappear.

Also, you simply may prefer not to run Calendar just to control the week start. Global Week Start gives you a simple, focused way to enforce that preference.

## Usage

1. **Install the plugin**
   - Place the `global-week-start` folder (containing `manifest.json`, `main.js`, and this `README.md`) inside your vault’s `.obsidian/plugins` directory.
   - Reload Obsidian so it detects the new plugin.

2. **Enable the plugin**
   - Open `Settings → Community plugins`.
   - Enable **Global Week Start**.

3. **Choose your first day of the week**
   - Go to `Settings → Global Week Start`.
   - Use the dropdown to select your preferred first day (Sunday–Saturday).
   - The plugin immediately updates Moment’s locale week settings to match your choice.

4. **Use your existing plugins as usual**
   - Periodic Notes weekly notes, Calendar views, and any other Moment‑based week calculations will now be anchored on the day you selected.
   - If another plugin changes the locale or week config, Global Week Start re‑enforces your choice.

## Interaction with other plugins

- **Periodic Notes**  
  Weekly note creation and any template helpers that rely on week start will use the day configured in Global Week Start.

- **Calendar**  
  Calendar still controls its own UI and settings, but whenever it calls `moment.updateLocale`, Global Week Start re‑applies the selected `weekStart`.  
  This ensures your preference wins, even if Calendar tries to reset the week spec or only loads intermittently.

## Disabling or uninstalling

- When you **disable** Global Week Start, it restores the original week start (`dow`) that was active when the plugin first ran and un‑patches `moment.updateLocale`.
- You can then rely on the system locale or Calendar (or any other plugin) to control the week start as before. 

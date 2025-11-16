'use strict';

const { Plugin, PluginSettingTab, Setting } = require('obsidian');

/**
 * Global Week Start keeps Moment.js aligned with the user-selected
 * first day of the week. Periodic Notes, Calendar, and any other
 * plugin that relies on `moment.localeData()._week` all benefit.
 *
 * The Calendar plugin also mutates `moment.updateLocale`, so this
 * plugin patches that method to ensure our preference always wins.
 */
const DEFAULT_SETTINGS = Object.freeze({
    weekStart: 1, // Monday
});
const DAYS_OF_WEEK = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

class GlobalWeekStartPlugin extends Plugin {
    constructor(app, manifest) {
        super(app, manifest);
        this.settings = Object.assign({}, DEFAULT_SETTINGS);
        this.originalDow = undefined;
        this.originalUpdateLocale = null;
    }
    async onload() {
        await this.loadSettings();
        this.initializeMomentIntegration();
        this.app.workspace.onLayoutReady(() => this.initializeMomentIntegration());
        this.addSettingTab(new GlobalWeekStartSettingTab(this.app, this));
    }
    onunload() {
        this.restoreWeekStart();
        this.unpatchMomentUpdateLocale();
    }
    async loadSettings() {
        const data = await this.loadData();
        this.settings = Object.assign(Object.assign({}, DEFAULT_SETTINGS), data || {});
    }
    async saveSettings() {
        await this.saveData(this.settings);
    }
    async updateWeekStart(weekStart) {
        if (weekStart === this.settings.weekStart) {
            return;
        }
        this.settings.weekStart = weekStart;
        await this.saveSettings();
        this.applyWeekStart();
    }
    initializeMomentIntegration() {
        const moment = window.moment;
        if (!moment) {
            return;
        }
        this.patchMomentUpdateLocale(moment);
        this.applyWeekStart();
    }
    patchMomentUpdateLocale(moment) {
        if (this.originalUpdateLocale) {
            return;
        }
        this.originalUpdateLocale = moment.updateLocale.bind(moment);
        const plugin = this;
        moment.updateLocale = function patchedUpdateLocale(localeName, config) {
            const result = plugin.originalUpdateLocale(localeName, config);
            const targetLocale = typeof localeName === "string" ? localeName : undefined;
            plugin.enforceWeekStart(targetLocale);
            return result;
        };
    }
    unpatchMomentUpdateLocale() {
        const moment = window.moment;
        if (moment && this.originalUpdateLocale) {
            moment.updateLocale = this.originalUpdateLocale;
            this.originalUpdateLocale = null;
        }
    }
    applyWeekStart() {
        const moment = window.moment;
        if (!moment) {
            return;
        }
        const locale = moment.locale();
        const localeData = moment.localeData(locale);
        const currentDow = (localeData === null || localeData === void 0 ? void 0 : localeData._week)?.dow ?? 0;
        if (this.originalDow === undefined) {
            this.originalDow = currentDow;
        }
        this.enforceWeekStart(locale);
    }
    enforceWeekStart(locale) {
        const moment = window.moment;
        if (!moment) {
            return;
        }
        const targetLocale = locale ?? moment.locale();
        const localeData = moment.localeData(targetLocale);
        if (!localeData) {
            return;
        }
        const desiredDow = this.settings.weekStart ?? DEFAULT_SETTINGS.weekStart;
        const currentDow = (localeData._week?.dow) ?? 0;
        if (currentDow === desiredDow) {
            return;
        }
        const weekConfig = Object.assign(Object.assign({}, localeData._week || {}), { dow: desiredDow });
        const updater = this.originalUpdateLocale ?? moment.updateLocale.bind(moment);
        updater(targetLocale, { week: weekConfig });
    }
    restoreWeekStart() {
        const moment = window.moment;
        if (!moment || this.originalDow === undefined) {
            return;
        }
        const locale = moment.locale();
        const localeData = moment.localeData(locale);
        const weekConfig = Object.assign(Object.assign({}, localeData === null || localeData === void 0 ? void 0 : localeData._week), { dow: this.originalDow });
        const updater = this.originalUpdateLocale ?? moment.updateLocale.bind(moment);
        updater(locale, { week: weekConfig });
    }
}

class GlobalWeekStartSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        this.containerEl.empty();
        new Setting(this.containerEl)
            .setName("First day of the week")
            .setDesc("Applies globally to Moment.js; affects Periodic Notes, Calendar, and any plugin that reads locale week data.")
            .addDropdown((dropdown) => {
            DAYS_OF_WEEK.forEach((day, index) => dropdown.addOption(index.toString(), day));
            dropdown.setValue((this.plugin.settings.weekStart ?? DEFAULT_SETTINGS.weekStart).toString());
            dropdown.onChange(async (value) => {
                await this.plugin.updateWeekStart(Number(value));
            });
        });
    }
}

module.exports = GlobalWeekStartPlugin;

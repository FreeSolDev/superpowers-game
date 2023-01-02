/// <reference path="../../../common/settings/settingsEditors/SettingsEditorPlugin.d.ts" />

import HelpersSettingsEditor from "./HelpersSettingsEditor";

SupClient.registerPlugin<SupClient.SettingsEditorPlugin>("settingsEditors", "Helpers", {
  namespace: "general",
  editor: HelpersSettingsEditor
});

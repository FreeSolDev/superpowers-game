import * as helpersUserSettings from "../data/HelpersUserSettings";

export default class HelpersSettingsEditor {

  projectClient: SupClient.ProjectClient;

  fields: { [name: string]: HTMLInputElement|HTMLSelectElement } = {};

  constructor(container: HTMLDivElement, projectClient: SupClient.ProjectClient) {
    this.projectClient = projectClient;

    const { tbody } = SupClient.table.createTable(container);

    const themeRow = SupClient.table.appendRow(tbody, SupClient.i18n.t("settingsEditors:Helpers.controlSchemes3D"), { class: "local" });
    const themeValues: { [value: string]: string } = { "superpowers": "Superpowers", "unity": "Unity" };
    this.fields["controls"] = SupClient.table.appendSelectBox(themeRow.valueCell, themeValues, helpersUserSettings.pub.controlSchemes3D);
    this.fields["controls"].addEventListener("change", (event: any) => {
      helpersUserSettings.edit("controlSchemes3D", event.target.value);
    });

    helpersUserSettings.emitter.addListener("controlSchemes3D", () => {
      this.fields["controls"].value = helpersUserSettings.pub.controlSchemes3D;
    });
  }

}

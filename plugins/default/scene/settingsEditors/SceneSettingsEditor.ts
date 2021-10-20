import SceneSettingsResource from "../data/SceneSettingsResource";
import * as sceneUserSettings from "../data/SceneUserSettings";

export default class SceneSettingsEditor {

  projectClient: SupClient.ProjectClient;
  resource: SceneSettingsResource;

  defaultCameraModeField: HTMLSelectElement;
  defaultVerticalAxisField: HTMLSelectElement;
  showGridByDefaultField: HTMLInputElement;
  defaultGridSizeField: HTMLInputElement;
  controlsField: HTMLSelectElement;

  constructor(container: HTMLDivElement, projectClient: SupClient.ProjectClient) {
    this.projectClient = projectClient;

    const { tbody } = SupClient.table.createTable(container);

    const defaultCameraModeRow = SupClient.table.appendRow(tbody, SupClient.i18n.t("settingsEditors:Scene.defaultCameraMode"));
    this.defaultCameraModeField = SupClient.table.appendSelectBox(defaultCameraModeRow.valueCell, { "3D": "3D", "2D": "2D" });

    this.defaultCameraModeField.addEventListener("change", (event: any) => {
      this.projectClient.editResource("sceneSettings", "setProperty", "defaultCameraMode", event.target.value);
    });

    const defaultVerticalAxisRow = SupClient.table.appendRow(tbody, SupClient.i18n.t("settingsEditors:Scene.defaultCameraVerticalAxis"));
    this.defaultVerticalAxisField = SupClient.table.appendSelectBox(defaultVerticalAxisRow.valueCell, { "Y": "Y", "Z": "Z" });

    this.defaultVerticalAxisField.addEventListener("change", (event: any) => {
      this.projectClient.editResource("sceneSettings", "setProperty", "defaultVerticalAxis", event.target.value);
    });

    // User settings
    const showGridRow = SupClient.table.appendRow(tbody, SupClient.i18n.t("settingsEditors:Scene.showGridByDefault"));
    this.showGridByDefaultField = SupClient.table.appendBooleanField(showGridRow.valueCell, sceneUserSettings.pub.showGridByDefault);
    this.showGridByDefaultField.addEventListener("change", (event: any) => {
      sceneUserSettings.edit("showGridByDefault", event.target.checked);
    });
    sceneUserSettings.emitter.addListener("showGridByDefault", () => {
      this.showGridByDefaultField.checked = sceneUserSettings.pub.showGridByDefault;
    });

    const defaultGridSizeRow = SupClient.table.appendRow(tbody, SupClient.i18n.t("settingsEditors:Scene.defaultGridSize"));
    this.defaultGridSizeField = SupClient.table.appendNumberField(defaultGridSizeRow.valueCell, sceneUserSettings.pub.defaultGridSize, { step: "any" });
    this.defaultGridSizeField.addEventListener("change", (event: any) => {
      sceneUserSettings.edit("defaultGridSize", event.target.value);
    });
    sceneUserSettings.emitter.addListener("defaultGridSize", () => {
      this.defaultGridSizeField.value = sceneUserSettings.pub.defaultGridSize.toString();
    });

    // A little ugly, need to be global across all systems
    const themeRow = SupClient.table.appendRow(tbody, SupClient.i18n.t("settingsEditors:Scene.controlSchemes"));
    const themeValues: { [value: string]: string } = { "superpowers": "Superpowers", "unity": "Unity" };
    this.controlsField = SupClient.table.appendSelectBox(themeRow.valueCell, themeValues, sceneUserSettings.pub.controlSchemes);
    this.controlsField.addEventListener("change", (event: any) => {
      sceneUserSettings.edit("controlSchemes", event.target.value);
    });

    sceneUserSettings.emitter.addListener("controlSchemes", () => {
      this.controlsField.value = sceneUserSettings.pub.theme;
    });

    this.projectClient.subResource("sceneSettings", this);
  }

  onResourceReceived = (resourceId: string, resource: SceneSettingsResource) => {
    this.resource = resource;

    this.defaultCameraModeField.value = resource.pub.defaultCameraMode;
    this.defaultVerticalAxisField.value = resource.pub.defaultVerticalAxis;
  }

  onResourceEdited = (resourceId: string, command: string, propertyName: string) => {
    switch (propertyName) {
      case "defaultVerticalAxis": this.defaultVerticalAxisField.value = this.resource.pub.defaultVerticalAxis; break;
      case "defaultCameraMode": this.defaultCameraModeField.value = this.resource.pub.defaultCameraMode; break;
    }
  }
}

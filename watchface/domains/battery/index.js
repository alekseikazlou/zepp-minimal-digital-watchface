import { ASSETS } from "../../config/assets.ts";
import { LAYOUT } from "../../config/layout.ts";
import * as hmUI from "@zos/ui";

const BATTERY_STATES = [
  'empty', '10', '20', '30', '40', '50', '60', '70', '80', '90', 'full',
]

function getBatteryAsset(charge) {
  const normalizedCharge = Number.isFinite(charge)
    ? Math.max(0, Math.min(100, charge))
    : 0
  return BATTERY_STATES[Math.floor(normalizedCharge / 10)]
}

export function createBatteryDomain({ ui, batterySensor }) {
  let widget = null;
  let shownAsset = null;
  let shownLevel = null;
  let isListening = false;

  function render(level) {
    const asset = getBatteryAsset(batterySensor.getCurrent());

    if (widget !== null && asset === shownAsset) {
      return;
    }

    shownAsset = asset;

    if (widget === null) {
      widget = ui.createImage({
        ...LAYOUT.battery.icon,
        src: ASSETS.battery[asset],
        level,
      });
      return;
    }

    widget.setProperty(hmUI.prop.MORE, { src: ASSETS.battery[asset] });
  }

  function onChange() {
    refresh();
  }

  function refresh() {
    if (shownLevel !== null) {
      render(shownLevel);
    }
  }

  function subscribe() {
    if (isListening) {
      return;
    }

    batterySensor.onChange(onChange);
    isListening = true;
  }

  function draw(level) {
    shownLevel = level;
    subscribe();
    refresh();
  }

  function destroy() {
    if (isListening) {
      batterySensor.offChange(onChange);
      isListening = false;
    }
  }

  return { draw, refresh, destroy };
}

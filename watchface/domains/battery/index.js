import { ASSETS } from "../../config/assets.ts";
import { LAYOUT } from "../../config/layout.ts";
import * as hmUI from "@zos/ui";

const BATTERY_STATES = [
  // 0–5%
  'empty',
  // 6–10%
  '10',
  // 11–20%
  '20',
  // 21–30%
  '30',
  // 31–40%
  '40',
  // 41–50%
  '50',
  // 51–60%
  '60',
  // 61–70%
  '70',
  // 71–80%
  '80',
  // 81–90%
  '90',
  // 91–100%
  'full',
]

function getBatteryAsset(charge) {
  const normalizedCharge = Number.isFinite(charge)
    ? Math.max(0, Math.min(100, charge))
    : 0
  if (normalizedCharge <= 5) {
    return BATTERY_STATES[0]
  }

  return BATTERY_STATES[Math.ceil(normalizedCharge / 10)]
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

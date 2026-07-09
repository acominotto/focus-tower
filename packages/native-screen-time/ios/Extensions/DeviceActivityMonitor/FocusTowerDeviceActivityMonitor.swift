import DeviceActivity
import ManagedSettings
import FamilyControls

private let appGroupId = "group.com.focustower.shared"

class FocusTowerDeviceActivityMonitor: DeviceActivityMonitor {
  private let store = ManagedSettingsStore()

  override func intervalDidEnd(for activity: DeviceActivityName) {
    guard let defaults = UserDefaults(suiteName: appGroupId) else { return }
    let enabled = defaults.bool(forKey: "shieldsEnabled")
    guard enabled,
          let data = defaults.data(forKey: "familyActivitySelection"),
          let selection = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data) else {
      return
    }
    store.shield.applications = selection.applicationTokens
  }
}

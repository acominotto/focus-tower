import ExpoModulesCore
import FamilyControls
import ManagedSettings
import DeviceActivity
import SwiftUI

private let appGroupId = "group.com.focustower.shared"
private let selectionKey = "familyActivitySelection"
private let allowancesKey = "allowances"
private let shieldsEnabledKey = "shieldsEnabled"

struct AppGroupStore {
  static var defaults: UserDefaults? {
    UserDefaults(suiteName: appGroupId)
  }

  static func saveSelection(_ selection: FamilyActivitySelection) {
    guard let data = try? JSONEncoder().encode(selection) else { return }
    defaults?.set(data, forKey: selectionKey)
  }

  static func loadSelection() -> FamilyActivitySelection? {
    guard let data = defaults?.data(forKey: selectionKey) else { return nil }
    return try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
  }

  static var shieldsEnabled: Bool {
    get { defaults?.bool(forKey: shieldsEnabledKey) ?? false }
    set { defaults?.set(newValue, forKey: shieldsEnabledKey) }
  }
}

enum ScreenTimeEnforcer {
  static let store = ManagedSettingsStore()

  static func syncShields() {
    guard AppGroupStore.shieldsEnabled, let selection = AppGroupStore.loadSelection() else {
      store.shield.applications = nil
      return
    }
    store.shield.applications = selection.applicationTokens
    store.shield.applicationCategories = selection.categoryTokens.isEmpty
      ? nil
      : ShieldSettings.ActivityCategoryPolicy.specific(selection.categoryTokens)
  }

  static func clearShieldsForRelock() {
    store.shield.applications = nil
    store.shield.applicationCategories = nil
  }

  static func scheduleRelock(at date: Date, activityName: String) {
    let schedule = DeviceActivitySchedule(
      intervalStart: DateComponents(hour: 0, minute: 0),
      intervalEnd: DateComponents(hour: 23, minute: 59),
      repeats: false
    )
    try? DeviceActivityCenter().startMonitoring(
      DeviceActivityName(activityName),
      during: schedule
    )
    defaultsSetRelock(at: date, activityName: activityName)
  }

  private static func defaultsSetRelock(at date: Date, activityName: String) {
    AppGroupStore.defaults?.set(date.timeIntervalSince1970, forKey: "relock-\(activityName)")
    AppGroupStore.defaults?.set(activityName, forKey: "pendingRelockActivity")
  }
}

public class FocusTowerScreenTimeModule: Module {
  private var selection = FamilyActivitySelection()

  public func definition() -> ModuleDefinition {
    Name("FocusTowerScreenTime")

    AsyncFunction("requestAuthorization") { () -> Bool in
      try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
      return AuthorizationCenter.shared.authorizationStatus == .approved
    }

    AsyncFunction("presentAppPicker") { () in
      await MainActor.run {
        guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let root = scene.windows.first?.rootViewController else { return }

        let picker = UIHostingController(
          rootView: FamilyActivityPicker(selection: Binding(
            get: { self.selection },
            set: { newValue in
              self.selection = newValue
              AppGroupStore.saveSelection(newValue)
              ScreenTimeEnforcer.syncShields()
            }
          ))
        )
        root.present(picker, animated: true)
      }
    }

    AsyncFunction("getSelectedApps") { () -> [[String: String]] in
      guard let selection = AppGroupStore.loadSelection() else { return [] }
      return selection.applicationTokens.enumerated().map { index, _ in
        [
          "id": "ios-app-\(index)",
          "kind": "ios-app",
          "label": "App \(index + 1)",
        ]
      }
    }

    AsyncFunction("setShieldsEnabled") { (enabled: Bool) in
      AppGroupStore.shieldsEnabled = enabled
      if enabled {
        ScreenTimeEnforcer.syncShields()
      } else {
        ScreenTimeEnforcer.clearShieldsForRelock()
      }
    }

    AsyncFunction("grantAllowance") { (targetId: String, durationMs: Double?) in
      ScreenTimeEnforcer.clearShieldsForRelock()
      if let durationMs, durationMs > 0 {
        let expiresAt = Date().addingTimeInterval(durationMs / 1000)
        ScreenTimeEnforcer.scheduleRelock(at: expiresAt, activityName: "allowance-\(targetId)")
      }
    }

    AsyncFunction("revokeAllowance") { (_: String) in
      ScreenTimeEnforcer.syncShields()
    }

    AsyncFunction("syncEnforcement") { () in
      ScreenTimeEnforcer.syncShields()
    }
  }
}

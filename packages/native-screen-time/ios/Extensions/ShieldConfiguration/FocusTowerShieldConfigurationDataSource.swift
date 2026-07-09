import ManagedSettings
import ManagedSettingsUI
import UIKit

class FocusTowerShieldConfigurationDataSource: ShieldConfigurationDataSource {
  override func configuration(shielding application: Application) -> ShieldConfiguration {
    let defaults = UserDefaults(suiteName: "group.com.focustower.shared")
    let quote = defaults?.string(forKey: "shieldQuote") ?? "Stay focused — the tower watches."

    return ShieldConfiguration(
      backgroundBlurStyle: .systemThickMaterialDark,
      title: ShieldConfiguration.Label(text: "Focus Tower", color: .white),
      subtitle: ShieldConfiguration.Label(text: quote, color: .lightGray),
      primaryButtonLabel: ShieldConfiguration.Label(text: "Turn away", color: .white),
      secondaryButtonLabel: ShieldConfiguration.Label(text: "5 min break", color: .white)
    )
  }
}

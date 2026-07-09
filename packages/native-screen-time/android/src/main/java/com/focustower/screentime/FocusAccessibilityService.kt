package com.focustower.screentime

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent

class FocusAccessibilityService : AccessibilityService() {
  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
    val packageName = event.packageName?.toString() ?: return
    val prefs = getSharedPreferences(FocusTowerScreenTimeModule.PREFS_NAME, MODE_PRIVATE)
    if (!prefs.getBoolean(FocusTowerScreenTimeModule.KEY_SHIELDS_ENABLED, false)) return

    val blocked = prefs.getStringSet(FocusTowerScreenTimeModule.KEY_BLOCKED_PACKAGES, emptySet()) ?: emptySet()
    if (!blocked.contains(packageName)) return

    val allowanceKey = "allowance-$packageName"
    val grantedAt = prefs.getLong(allowanceKey, 0L)
    if (grantedAt > 0L) return

    val shield = Intent(this, ShieldActivity::class.java).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
      putExtra("packageName", packageName)
    }
    startActivity(shield)
  }

  override fun onInterrupt() {}
}

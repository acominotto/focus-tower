package com.focustower.screentime

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class FocusTowerScreenTimeModule : Module() {
  private val prefs: SharedPreferences
    get() = appContext.reactContext!!.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  override fun definition() = ModuleDefinition {
    Name("FocusTowerScreenTime")

    AsyncFunction("requestAuthorization") {
      // Accessibility + overlay permissions are granted in system settings.
      prefs.getBoolean(KEY_A11Y_ENABLED, false)
    }

    AsyncFunction("presentAppPicker") {
      val intent = Intent(appContext.reactContext, AppPickerActivity::class.java)
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      appContext.reactContext!!.startActivity(intent)
    }

    AsyncFunction("getSelectedApps") {
      val packages = prefs.getStringSet(KEY_BLOCKED_PACKAGES, emptySet()) ?: emptySet()
      packages.map { pkg ->
        mapOf(
          "id" to pkg,
          "kind" to "android-app",
          "label" to pkg,
        )
      }
    }

    AsyncFunction("setShieldsEnabled") { enabled: Boolean ->
      prefs.edit().putBoolean(KEY_SHIELDS_ENABLED, enabled).apply()
      if (enabled) {
        startAccessibilityService()
      } else {
        stopAccessibilityService()
      }
    }

    AsyncFunction("grantAllowance") { targetId: String, durationMs: Double? ->
      prefs.edit().putLong("allowance-$targetId", System.currentTimeMillis()).apply()
      if (durationMs != null && durationMs > 0) {
        scheduleRelock(targetId, durationMs.toLong())
      }
    }

    AsyncFunction("revokeAllowance") { targetId: String ->
      prefs.edit().remove("allowance-$targetId").apply()
    }

    AsyncFunction("syncEnforcement") {
      if (prefs.getBoolean(KEY_SHIELDS_ENABLED, false)) {
        startAccessibilityService()
      }
    }
  }

  private fun startAccessibilityService() {
    val context = appContext.reactContext ?: return
    val intent = Intent(context, FocusAccessibilityService::class.java)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      context.startForegroundService(intent)
    } else {
      context.startService(intent)
    }
  }

  private fun stopAccessibilityService() {
    val context = appContext.reactContext ?: return
    context.stopService(Intent(context, FocusAccessibilityService::class.java))
  }

  private fun scheduleRelock(targetId: String, durationMs: Long) {
    val context = appContext.reactContext ?: return
    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val intent = Intent(context, RelockReceiver::class.java).apply {
      putExtra("targetId", targetId)
    }
    val pending = PendingIntent.getBroadcast(
      context,
      targetId.hashCode(),
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
    alarmManager.setExactAndAllowWhileIdle(
      AlarmManager.RTC_WAKEUP,
      System.currentTimeMillis() + durationMs,
      pending,
    )
  }

  companion object {
    const val PREFS_NAME = "focus_tower"
    const val KEY_BLOCKED_PACKAGES = "blockedPackages"
    const val KEY_SHIELDS_ENABLED = "shieldsEnabled"
    const val KEY_A11Y_ENABLED = "a11yEnabled"
  }
}

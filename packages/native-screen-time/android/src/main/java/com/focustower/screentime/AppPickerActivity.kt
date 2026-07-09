package com.focustower.screentime

import android.app.Activity
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.CheckBox
import android.widget.LinearLayout
import android.widget.ScrollView

class AppPickerActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val pm = packageManager
    val prefs = getSharedPreferences(FocusTowerScreenTimeModule.PREFS_NAME, MODE_PRIVATE)
    val selected = prefs.getStringSet(FocusTowerScreenTimeModule.KEY_BLOCKED_PACKAGES, mutableSetOf())!!.toMutableSet()

    val apps = pm.getInstalledApplications(PackageManager.GET_META_DATA)
      .filter { it.flags and ApplicationInfo.FLAG_SYSTEM == 0 }
      .sortedBy { pm.getApplicationLabel(it).toString() }

    val container = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
    for (app in apps) {
      val label = pm.getApplicationLabel(app).toString()
      val checkbox = CheckBox(this).apply {
        text = label
        isChecked = selected.contains(app.packageName)
        setOnCheckedChangeListener { _, checked ->
          if (checked) selected.add(app.packageName) else selected.remove(app.packageName)
          prefs.edit().putStringSet(FocusTowerScreenTimeModule.KEY_BLOCKED_PACKAGES, selected).apply()
        }
      }
      container.addView(checkbox)
    }

    setContentView(ScrollView(this).apply { addView(container) })
  }
}

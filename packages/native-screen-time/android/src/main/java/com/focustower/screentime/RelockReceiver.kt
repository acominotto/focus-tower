package com.focustower.screentime

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class RelockReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val targetId = intent.getStringExtra("targetId") ?: return
    val prefs = context.getSharedPreferences(FocusTowerScreenTimeModule.PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit().remove("allowance-$targetId").apply()
  }
}

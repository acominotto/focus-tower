package com.focustower.screentime

import android.app.Activity
import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class ShieldActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val packageName = intent.getStringExtra("packageName") ?: "app"
    val prefs = getSharedPreferences(FocusTowerScreenTimeModule.PREFS_NAME, MODE_PRIVATE)
    val quote = prefs.getString("shieldQuote", "Stay focused — the tower watches.") ?: ""

    val layout = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(48, 120, 48, 48)
    }

    layout.addView(TextView(this).apply {
      text = "Focus Tower"
      textSize = 28f
    })
    layout.addView(TextView(this).apply {
      text = quote
      textSize = 16f
      setPadding(0, 24, 0, 48)
    })
    layout.addView(Button(this).apply {
      text = "Turn away"
      setOnClickListener { finish() }
    })
    layout.addView(Button(this).apply {
      text = "5 min break"
      setOnClickListener {
        prefs.edit().putLong("allowance-$packageName", System.currentTimeMillis()).apply()
        finish()
      }
    })

    setContentView(layout)
  }
}

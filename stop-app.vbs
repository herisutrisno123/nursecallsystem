' ============================================================
'  stop-app.vbs - Menghentikan Aplikasi Lisensi Nursecall Monitor
'  Klik dua kali untuk menghentikan server (termasuk yang berjalan
'  tersembunyi hasil start-app.vbs).
'  Catatan: proses node.exe milik aplikasi lain juga ikut berhenti.
' ============================================================
Option Explicit
Dim shell
Set shell = CreateObject("WScript.Shell")
shell.Run "cmd /c taskkill /f /im node.exe >nul 2>&1", 0, True
MsgBox "Aplikasi Lisensi Nursecall Monitor dihentikan.", vbInformation, "Nursecall Lisensi"

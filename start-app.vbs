' ============================================================
'  start-app.vbs - Menjalankan "Aplikasi Lisensi Nursecall Monitor"
'  Klik dua kali file ini untuk menjalankan aplikasi TANPA jendela
'  terminal. Setelah berjalan, buka browser ke:
'        http://localhost:3001
'
'  Menghentikan: Task Manager -> hentikan proses node.exe
'  (atau jalankan: pm2 stop nursecall-lisensi jika memakai PM2)
' ============================================================
Option Explicit

Dim fso, shell, appDir, logFile, cmd

Set fso   = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

appDir  = fso.GetParentFolderName(WScript.ScriptFullName)
logFile = appDir & "\aplikasi.log"

shell.CurrentDirectory = appDir

' --- Pilih cara menjalankan ---------------------------------
' 1) Bila PM2 terinstall dan aplikasi sudah terdaftar -> restart via PM2
' 2) Selain itu -> jalankan node langsung (server + web jadi satu)
cmd = "cmd /c if exist """ & appDir & "\dist\index.html"" (node server\index.js >> """ & logFile & """" & " 2>&1) else (npm run build && node server\index.js >> """ & logFile & """" & " 2>&1)"

' 0 = window hidden, False = tidak menunggu selesai
shell.Run cmd, 0, False

WScript.Sleep 2500
MsgBox "Aplikasi Lisensi Nursecall Monitor sedang dijalankan." & vbCrLf & _
       "Buka browser pada alamat:  http://localhost:3001" & vbCrLf & vbCrLf & _
       "Log aktivitas: " & logFile, _
       vbInformation, "Nursecall Lisensi"

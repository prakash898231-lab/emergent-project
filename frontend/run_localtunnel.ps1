Set-Location "$PSScriptRoot"
if (Test-Path 'localtunnel3.out.log') { Remove-Item 'localtunnel3.out.log' -Force }
if (Test-Path 'localtunnel3.err.log') { Remove-Item 'localtunnel3.err.log' -Force }
$cmd = 'cmd.exe'
$args = '/c', 'npx localtunnel --port 3000 > localtunnel3.out.log 2> localtunnel3.err.log'
$proc = Start-Process -FilePath $cmd -ArgumentList $args -WorkingDirectory $PSScriptRoot -NoNewWindow -PassThru
Start-Sleep -Seconds 5
Write-Output "ProcId:$($proc.Id)"
Write-Output "HasExited:$($proc.HasExited)"
Write-Output "OutLogSize:$((Get-Item 'localtunnel3.out.log').Length)"
Write-Output "ErrLogSize:$((Get-Item 'localtunnel3.err.log').Length)"
Get-Content 'localtunnel3.out.log' -Tail 20
Get-Content 'localtunnel3.err.log' -Tail 20

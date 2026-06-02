# Wait for backend on port 8000
for ($i=0; $i -lt 15; $i++) {
  $s = Test-NetConnection -ComputerName localhost -Port 8000
  if ($s.TcpTestSucceeded) { Write-Output "backend ready"; break }
  Start-Sleep -Seconds 1
}
if (-not $s.TcpTestSucceeded) { Write-Output "backend not ready"; exit 1 }

# Register demo seller
$regBody = @{
  email = 'demo_seller@example.com'
  password = 'password123'
  name = 'Demo Seller'
  role = 'seller'
  phone = '9999999999'
  address = 'Demo Address'
} | ConvertTo-Json

try {
  $reg = Invoke-RestMethod -Uri 'http://localhost:8000/api/auth/register' -Method Post -ContentType 'application/json' -Body $regBody
} catch {
  Write-Output "Register failed: $_"
  exit 1
}

$token = $reg.access_token

# Create demo shop
$shopBody = @{
  name = 'Demo Shop'
  address = 'Demo Address'
  phone = '9999999999'
  image_url = ''
} | ConvertTo-Json

try {
  $shop = Invoke-RestMethod -Uri 'http://localhost:8000/api/seller/shops' -Method Post -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body $shopBody
  $shop | ConvertTo-Json -Depth 5
} catch {
  Write-Output "Create shop failed: $_"
  exit 1
}

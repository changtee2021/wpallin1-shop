# Bootstrap super_admin for wpallin1-shop
# Usage: .\scripts\bootstrap-super-admin.ps1 -Email passawut.a.plus@gmail.com [-Password 'YourPassword']
# Password is NEVER stored in this script — pass via parameter or secure prompt only.

param(
  [Parameter(Mandatory = $true)]
  [string]$Email,
  [string]$Password
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$envFile = Join-Path $root ".env"

if (-not (Test-Path $envFile)) {
  Write-Error ".env not found in $root — copy from .env.example and fill keys"
}

$envContent = Get-Content $envFile -Raw
$urlMatch = [regex]::Match($envContent, '(?m)^SUPABASE_URL=(.+)$')
$keyMatch = [regex]::Match($envContent, '(?m)^SUPABASE_SERVICE_ROLE_KEY=(.+)$')

if (-not $urlMatch.Success -or -not $keyMatch.Success) {
  Write-Error "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required in .env"
}

$baseUrl = $urlMatch.Groups[1].Value.Trim().Trim('"')
$serviceKey = $keyMatch.Groups[1].Value.Trim().Trim('"')

if (-not $Password) {
  $secure = Read-Host "Password for $Email (input hidden)" -AsSecureString
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)
}

$headers = @{
  "apikey"        = $serviceKey
  "Authorization" = "Bearer $serviceKey"
  "Content-Type"  = "application/json"
}

# Find or create auth user
$listUrl = "$baseUrl/auth/v1/admin/users?email=$([uri]::EscapeDataString($Email))"
$list = Invoke-RestMethod -Uri $listUrl -Headers $headers -Method Get
$userId = $null
if ($list.users -and $list.users.Count -gt 0) {
  $userId = $list.users[0].id
  Write-Host "Found existing user: $userId"
} else {
  $createBody = @{
    email = $Email
    password = $Password
    email_confirm = $true
    user_metadata = @{ full_name = ($Email -split '@')[0] }
  } | ConvertTo-Json
  $created = Invoke-RestMethod -Uri "$baseUrl/auth/v1/admin/users" -Headers $headers -Method Post -Body $createBody
  $userId = $created.id
  Write-Host "Created user: $userId"
}

# Grant super_admin via PostgREST (service role)
$roleBody = @{ user_id = $userId; role = "super_admin" } | ConvertTo-Json
$restHeaders = @{
  "apikey"        = $serviceKey
  "Authorization" = "Bearer $serviceKey"
  "Content-Type"  = "application/json"
  "Accept-Profile" = "wpall_retail"
  "Content-Profile" = "wpall_retail"
  "Prefer"        = "resolution=merge-duplicates"
}

try {
  Invoke-RestMethod `
    -Uri "$baseUrl/rest/v1/user_roles?on_conflict=user_id,role" `
    -Headers $restHeaders `
    -Method Post `
    -Body $roleBody
  Write-Host "Granted super_admin to $Email"
} catch {
  Write-Warning "PostgREST upsert failed: $_"
  Write-Host "Run manually: INSERT INTO wpall_retail.user_roles (user_id, role) VALUES ('$userId', 'super_admin');"
}

Write-Host "Done. Add auth redirect: http://localhost:8080/auth/callback in Supabase dashboard."

param(
  [Parameter(Mandatory = $true)]
  [string]$HostName,

  [Parameter(Mandatory = $true)]
  [string]$UserName,

  [string]$RemotePath = "/var/www/aptdesign",
  [string]$SshKey = ""
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$releaseDir = Join-Path $projectRoot "release"

if (Test-Path $releaseDir) {
  Remove-Item -LiteralPath $releaseDir -Recurse -Force
}

New-Item -ItemType Directory -Path $releaseDir | Out-Null

Copy-Item -LiteralPath (Join-Path $projectRoot "index.html") -Destination $releaseDir
Copy-Item -LiteralPath (Join-Path $projectRoot "styles.css") -Destination $releaseDir
Copy-Item -LiteralPath (Join-Path $projectRoot "script.js") -Destination $releaseDir
Copy-Item -LiteralPath (Join-Path $projectRoot "assets") -Destination $releaseDir -Recurse

$sshTarget = "$UserName@$HostName"
$sshArgs = @()

if ($SshKey -ne "") {
  $sshArgs += @("-i", $SshKey)
}

ssh @sshArgs $sshTarget "sudo mkdir -p $RemotePath && sudo chown -R ${UserName}:${UserName} $RemotePath"
scp @sshArgs -r "$releaseDir/*" "${sshTarget}:${RemotePath}/"
ssh @sshArgs $sshTarget "sudo nginx -t && sudo systemctl reload nginx"

Write-Host "Published to ${sshTarget}:${RemotePath}"

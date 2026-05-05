#requires -Version 5.1
# visual-refs after_tasks hook (PowerShell mirror).
# Mirrors .specify/extensions/visual-refs/scripts/bash/prepend-task.sh.
#
# Usage: prepend-task.ps1 -FeatureDir <absolute-path-to-feature-dir>

param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$FeatureDir
)

$ErrorActionPreference = 'Stop'

$WarnPrefix  = '[specify] Warning: visual-refs after_tasks failed:'
$FailTail    = 'tasks.md preserved'
$StartMarker = '<!-- visual-context-task:start -->'
$EndMarker   = '<!-- visual-context-task:end -->'

function Fail-Hook([string]$reason) {
    [Console]::Error.WriteLine("$WarnPrefix $reason; $FailTail")
    exit 1
}

if ([string]::IsNullOrWhiteSpace($FeatureDir)) { Fail-Hook 'missing feature directory argument' }
if (-not (Test-Path -LiteralPath $FeatureDir -PathType Container)) { Fail-Hook "feature directory not found at '$FeatureDir'" }
$specFile  = Join-Path $FeatureDir 'spec.md'
$tasksFile = Join-Path $FeatureDir 'tasks.md'
if (-not (Test-Path -LiteralPath $specFile -PathType Leaf))  { Fail-Hook "spec.md not found at '$specFile'" }
if (-not (Test-Path -LiteralPath $tasksFile -PathType Leaf)) { Fail-Hook "tasks.md not found at '$tasksFile'" }

# Locate **Input** line and capture quoted payload
try {
    $rawSpec = [System.IO.File]::ReadAllText($specFile)
} catch {
    Fail-Hook "spec file unreadable at '$specFile'"
}
$inputMatch = [regex]::Match($rawSpec, '(?m)^\*\*Input\*\*: User description: "(?<payload>.+)"\s*$')
if (-not $inputMatch.Success) { Fail-Hook "no '**Input**:' line found or malformed quoting" }
$payload = $inputMatch.Groups['payload'].Value

# Extract candidate tokens, dedupe preserving order
$candidates = [regex]::Matches($payload, '(?i)[^\s]+\.(png|svg)(\?[^\s]*)?')
$seen = New-Object 'System.Collections.Generic.HashSet[string]'
$refs = New-Object 'System.Collections.Generic.List[string]'
foreach ($m in $candidates) {
    $clean = $m.Value
    $clean = [regex]::Replace($clean, '^["''<\(]+', '')
    $clean = [regex]::Replace($clean, '["''>\)\.,;:]+$', '')
    if ([string]::IsNullOrWhiteSpace($clean)) { continue }
    if (-not [regex]::IsMatch($clean, '(?i)\.(png|svg)(\?.*)?$')) { continue }
    if ($seen.Add($clean)) { $refs.Add($clean) }
}

# Read tasks.md and strip any prior visual-context block
$tasksRaw = [System.IO.File]::ReadAllText($tasksFile)
$tasksLines = [System.IO.File]::ReadAllLines($tasksFile)
$noBlock = New-Object 'System.Collections.Generic.List[string]'
$inBlock = $false
$justClosed = $false
foreach ($line in $tasksLines) {
    if ($inBlock) {
        if ($line -eq $EndMarker) { $inBlock = $false; $justClosed = $true; continue }
        continue
    }
    if ($line -eq $StartMarker) { $inBlock = $true; continue }
    if ($justClosed) {
        $justClosed = $false
        if ($line -eq '') { continue }
    }
    $noBlock.Add($line)
}

if ($refs.Count -eq 0) {
    $rebuilt = ($noBlock -join "`n")
    if ($tasksRaw.EndsWith("`n") -or $tasksRaw.EndsWith("`r`n")) { $rebuilt += "`n" }
    if ($rebuilt -eq $tasksRaw) { exit 0 }
    try {
        [System.IO.File]::WriteAllText($tasksFile, $rebuilt)
    } catch {
        Fail-Hook 'failed to write tasks.md'
    }
    exit 0
}

# Build new visual-context block
$block = New-Object 'System.Collections.Generic.List[string]'
$block.Add($StartMarker)
$block.Add('- [ ] **T000** Load visual references from `spec.md`')
foreach ($r in $refs) {
    $base = $r -replace '.*[\\/]', ''
    $base = $base -replace '\?.*$', ''
    if ([string]::IsNullOrEmpty($base)) { $base = $r }
    $block.Add("  - ${base}: ${r}")
}
$block.Add($EndMarker)
$block.Add('')

# Prepend block
$final = (@($block) + @($noBlock)) -join "`n"
if ($tasksRaw.EndsWith("`n") -or $tasksRaw.EndsWith("`r`n")) { $final += "`n" }

try {
    [System.IO.File]::WriteAllText($tasksFile, $final)
} catch {
    Fail-Hook 'failed to write tasks.md'
}
exit 0

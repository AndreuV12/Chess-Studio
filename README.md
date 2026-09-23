## "{0:N2} MB" -f ((Get-ChildItem node_modules -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum / 1MB)

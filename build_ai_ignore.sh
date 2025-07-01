#!/bin/bash

# List of target ignore files
ignore_files=(
    ".aiexclude"
    ".clineignore"
    ".continueignore"
    ".cursorignore"
    ".junieignore"
    ".windsurfignore"
    ".aiignore"
)

# Content to be written to each file
content="
# you can ignore files
.DS_Store
*.log
*.tmp

# or folders
dist/
build/
out/

.env
kendo-ui-license.txt
telerik-license.txt
package-lock.json
.venv/
node_modules/"

# Create and populate each ignore file
for file in "${ignore_files[@]}"; do
    echo "$content" > "$file"
    echo "Created/Updated: $file"
done

echo "All ignore files have been created/updated successfully!"

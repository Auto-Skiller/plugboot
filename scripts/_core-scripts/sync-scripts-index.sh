#!/bin/bash

TARGET_DIR="scripts"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT" || return 1

OUTPUT_FILE="$TARGET_DIR/$TARGET_DIR-index.yaml"

echo "name: $TARGET_DIR index" > "$OUTPUT_FILE"
echo "description: Auto-generated index of the $TARGET_DIR directory" >> "$OUTPUT_FILE"
echo "folders:" >> "$OUTPUT_FILE"

find "$TARGET_DIR" -maxdepth 1 -mindepth 1 -type d | sort | while read -r folder; do
    folder_name=$(basename "$folder")
    echo "  - $folder_name" >> "$OUTPUT_FILE"
done

echo "files:" >> "$OUTPUT_FILE"

find "$TARGET_DIR" -type f -name "*.md" | sort | while read -r file; do
    filename=$(basename "$file")

    if [ "$filename" = "INDEX.md" ]; then
        continue
    fi

    name=""
    description=""
    in_frontmatter=0

    while IFS= read -r line || [ -n "$line" ]; do
        if [[ "$line" == "---" ]]; then
            if [ $in_frontmatter -eq 0 ]; then
                in_frontmatter=1
                continue
            else
                break
            fi
        fi

        if [ $in_frontmatter -eq 1 ]; then
            if [[ "$line" =~ ^name:\ (.*) ]]; then
                name="${BASH_REMATCH[1]}"
            elif [[ "$line" =~ ^description:\ (.*) ]]; then
                description="${BASH_REMATCH[1]}"
            fi
        fi
    done < "$file"

    name=$(echo "$name" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    description=$(echo "$description" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

    rel_path=${file#"$TARGET_DIR/"}

    echo "  - path: $rel_path" >> "$OUTPUT_FILE"
    if [ -n "$name" ]; then
        name="${name//\"/\\\"}" # Escape inner double quotes
        echo "    name: \"$name\"" >> "$OUTPUT_FILE"
    fi
    if [ -n "$description" ]; then
        description="${description//\"/\\\"}" # Escape inner double quotes
        echo "    description: \"$description\"" >> "$OUTPUT_FILE"
    fi

done

if [ -f "$TARGET_DIR/INDEX.md" ]; then
    rm "$TARGET_DIR/INDEX.md"
fi

echo "Updated $OUTPUT_FILE"

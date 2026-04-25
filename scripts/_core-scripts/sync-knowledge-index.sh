#!/bin/bash

TARGET_DIR="knowledge"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT" || return 1

OUTPUT_FILE="$TARGET_DIR/$TARGET_DIR-index.yaml"

echo "name: $TARGET_DIR index" > "$OUTPUT_FILE"
echo "description: Auto-generated index of the $TARGET_DIR directory" >> "$OUTPUT_FILE"
echo "folders:" >> "$OUTPUT_FILE"

# Process folders
find "$TARGET_DIR" -mindepth 1 -maxdepth 1 -type d | sort | while read -r folder; do
    folder_name=$(basename "$folder")
    echo "  $folder_name:" >> "$OUTPUT_FILE"

    # Process files inside this folder (and subfolders)
    find "$folder" -type f | sort | while read -r file; do
        filename=$(basename "$file")

        # Skip the index file itself just in case
        if [ "$filename" = "$TARGET_DIR-index.yaml" ] || [ "$filename" = "INDEX.md" ]; then
            continue
        fi

        name=""
        description=""

        if [[ "$filename" == *.md ]]; then
            in_frontmatter=0

            while IFS= read -r line || [ -n "$line" ]; do
                # Ignore \r (CR)
                line=$(echo "$line" | tr -d '\r')
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
        fi

        rel_path=${file#"$TARGET_DIR/"}

        echo "    - path: $rel_path" >> "$OUTPUT_FILE"
        if [ -n "$name" ]; then
            name="${name//\"/\\\"}" # Escape inner double quotes
            echo "      name: \"$name\"" >> "$OUTPUT_FILE"
        else
            echo "      name: \"$filename\"" >> "$OUTPUT_FILE"
        fi
        if [ -n "$description" ]; then
            description="${description//\"/\\\"}" # Escape inner double quotes
            echo "      description: \"$description\"" >> "$OUTPUT_FILE"
        fi
    done
done

echo "files:" >> "$OUTPUT_FILE"

# Process root files
find "$TARGET_DIR" -mindepth 1 -maxdepth 1 -type f | sort | while read -r file; do
    filename=$(basename "$file")

    # Skip the index file itself
    if [ "$filename" = "$TARGET_DIR-index.yaml" ] || [ "$filename" = "INDEX.md" ]; then
        continue
    fi

    name=""
    description=""

    if [[ "$filename" == *.md ]]; then
        in_frontmatter=0

        while IFS= read -r line || [ -n "$line" ]; do
            line=$(echo "$line" | tr -d '\r')
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
    fi

    rel_path=${file#"$TARGET_DIR/"}

    echo "  - path: $rel_path" >> "$OUTPUT_FILE"
    if [ -n "$name" ]; then
        name="${name//\"/\\\"}" # Escape inner double quotes
        echo "    name: \"$name\"" >> "$OUTPUT_FILE"
    else
        echo "    name: \"$filename\"" >> "$OUTPUT_FILE"
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

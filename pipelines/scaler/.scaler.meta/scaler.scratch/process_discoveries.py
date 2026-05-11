import os
import yaml
import shutil
import glob
from pathlib import Path
import re

def process_file(file_path):
    # Determine the aspect and level (this script is just a scratchpad concept)
    print(f"Processing {file_path}")

# Find all skills
discoveries_path = Path("pipelines/scaler/EXTERNAL/discoveries/auto/skills/")
for skill_file in discoveries_path.rglob("SKILL.md"):
    print(skill_file)

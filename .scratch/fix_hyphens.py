import os

MAPPING = {
    "aiandml": "ai-and-ml",
    "audioandvoice": "audio-and-voice",
    "customersuccessandsupport": "customer-success-and-support",
    "dataandanalytics": "data-and-analytics",
    "foodandcooking": "food-and-cooking",
    "homeandgarden": "home-and-garden",
    "hrandtalent": "hr-and-talent",
    "imageproduction": "image-production",
    "legalandcompliance": "legal-and-compliance",
    "lifeskills": "life-skills",
    "marketintelligence": "market-intelligence",
    "outreachandpartnerships": "outreach-and-partnerships",
    "personalgrowth": "personal-growth",
    "postproduction": "post-production",
    "productmanagement": "product-management",
    "uxlogic": "ux-logic",
    "videoproduction": "video-production"
}

def rename_to_hyphens(root_dir):
    for root, dirs, files in os.walk(root_dir, topdown=False):
        for d in dirs:
            if d in MAPPING:
                old_path = os.path.join(root, d)
                new_name = MAPPING[d]
                new_path = os.path.join(root, new_name)
                print(f"Renaming: {old_path} -> {new_path}")
                os.rename(old_path, new_path)
            elif '_' in d:
                # In case any underscores were missed or are new
                old_path = os.path.join(root, d)
                new_name = d.replace('_', '-')
                new_path = os.path.join(root, new_name)
                print(f"Renaming underscore to hyphen: {old_path} -> {new_path}")
                os.rename(old_path, new_path)

if __name__ == "__main__":
    skills_path = r'c:\Users\BAB AL SAFA\Desktop\open-workspace\skills'
    rename_to_hyphens(skills_path)

import os, io, zipfile, requests

repos = [
    ("stickman-video-director", "https://github.com/kaomei/stickman-video-director/archive/refs/heads/main.zip"),
    ("zack-d-director", "https://github.com/Anil-matcha/zack-d-films-ai-video-generator/archive/refs/heads/main.zip"),
    ("OnlyShot", "https://github.com/A-cat-with-carrots/OnlyShot/archive/refs/heads/main.zip"),
]

os.makedirs(".reference-repos", exist_ok=True)

for name, url in repos:
    dest_dir = os.path.join(".reference-repos", name)
    print(f"Downloading {name} from {url}...")
    try:
        r = requests.get(url, timeout=30)
        if r.status_code == 200:
            z = zipfile.ZipFile(io.BytesIO(r.content))
            # Extract
            top_dir = z.namelist()[0].split('/')[0]
            os.makedirs(dest_dir, exist_ok=True)
            for member in z.infolist():
                if not member.is_dir():
                    rel_path = member.filename[len(top_dir)+1:]
                    if rel_path:
                        target_path = os.path.join(dest_dir, rel_path)
                        os.makedirs(os.path.dirname(target_path), exist_ok=True)
                        with open(target_path, "wb") as f:
                            f.write(z.read(member.filename))
            print(f"✅ Extracted {name} successfully to {dest_dir}!")
        else:
            print(f"⚠️ {name} returned HTTP {r.status_code}, trying master.zip...")
            url_master = url.replace("main.zip", "master.zip")
            r2 = requests.get(url_master, timeout=30)
            if r2.status_code == 200:
                z = zipfile.ZipFile(io.BytesIO(r2.content))
                top_dir = z.namelist()[0].split('/')[0]
                os.makedirs(dest_dir, exist_ok=True)
                for member in z.infolist():
                    if not member.is_dir():
                        rel_path = member.filename[len(top_dir)+1:]
                        if rel_path:
                            target_path = os.path.join(dest_dir, rel_path)
                            os.makedirs(os.path.dirname(target_path), exist_ok=True)
                            with open(target_path, "wb") as f:
                                f.write(z.read(member.filename))
                print(f"✅ Extracted {name} (master) successfully to {dest_dir}!")
            else:
                print(f"❌ Failed to download {name}: HTTP {r2.status_code}")
    except Exception as e:
        print(f"❌ Error downloading {name}: {e}")

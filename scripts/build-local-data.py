# Regenerates public/data/*.json from the exported Supabase CSVs.
# Usage: python3 scripts/build-local-data.py <dir-with-csvs>
import csv, json, sys, os
csv.field_size_limit(10**9)
D = sys.argv[1] if len(sys.argv) > 1 else "."
from urllib.parse import urlsplit, parse_qsl

streams = {}
for r in csv.DictReader(open(os.path.join(D, "video_streams_rows.csv"))):
    if r["is_active"] != "true":
        continue
    if r["content_type"] == "episode":
        key = f"tv:{r['content_id']}:{int(float(r['season_number'] or 1))}:{int(float(r['episode_number'] or 1))}"
    else:
        key = f"movie:{r['content_id']}"
    res = int("".join(c for c in (r["quality"] or "") if c.isdigit()) or 0)
    streams.setdefault(key, []).append({"u": r["stream_url"], "r": res, "s": r["subtitle_url"] or None, "src": r["source_name"]})
for k in streams:
    seen, out = set(), []
    for d in sorted(streams[k], key=lambda x: -x["r"]):
        if d["r"] in seen:
            continue
        seen.add(d["r"]); out.append(d)
    streams[k] = out
json.dump(streams, open("public/data/streams.json", "w"), separators=(",", ":"))

cat = []
for r in csv.DictReader(open(os.path.join(D, "content_rows.csv"))):
    try:
        genres = [g["id"] for g in json.loads(r["genres"] or "[]")]
    except Exception:
        genres = []
    try:
        meta = json.loads(r["metadata"] or "{}")
    except Exception:
        meta = {}
    cat.append({
        "id": int(r["tmdb_id"]), "media_type": r["content_type"], "title": r["title"],
        "original_title": r["original_title"] or None, "overview": r["overview"] or "",
        "poster_path": (r["poster_url"] or "").replace("https://image.tmdb.org/t/p/w500", "") or None,
        "backdrop_path": (r["backdrop_url"] or "").replace("https://image.tmdb.org/t/p/original", "") or None,
        "vote_average": float(r["rating"] or 0),
        "release_date": r["release_date"] if r["content_type"] == "movie" else None,
        "first_air_date": r["release_date"] if r["content_type"] == "tv" else None,
        "genre_ids": genres, "runtime": int(float(r["runtime"])) if r["runtime"] else None,
        "original_language": meta.get("original_language"),
        "number_of_seasons": meta.get("number_of_seasons"),
        "number_of_episodes": meta.get("number_of_episodes"),
        "tagline": meta.get("tagline") or None,
    })
json.dump(cat, open("public/data/catalog.json", "w"), separators=(",", ":"))

def norm(k):
    p = urlsplit(k)
    params = sorted((a, b) for a, b in parse_qsl(p.query) if a not in ("language", "api_key"))
    qs = "&".join(f"{a}={b}" for a, b in params)
    path = p.path if p.path.startswith("/") else "/" + p.path
    return path + ("?" + qs if qs else "")

cache = {}
for f in ["tmdb_cache_rows_1.csv", "tmdb_cache_rows_2.csv"]:
    fp = os.path.join(D, f)
    if not os.path.exists(fp):
        continue
    for r in csv.DictReader(open(fp)):
        try:
            cache[norm(r["cache_key"])] = json.loads(r["data"])
        except Exception:
            pass
json.dump(cache, open("public/data/tmdb-cache.json", "w"), separators=(",", ":"))
print(len(streams), len(cat), len(cache))

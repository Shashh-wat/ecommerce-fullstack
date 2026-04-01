#!/usr/bin/env python3
"""
Product AI Image Service (FREE VERSION)
─────────────────────────────────────────
1. Gemini Vision   → identifies product from seller's photo
2. Pollinations.ai → generates 3 ad images (FREE, no key needed)

APIs needed:
  GEMINI_API_KEY  → aistudio.google.com/app/apikey  (free)
  Pollinations    → NOTHING. Zero signup, zero cost.
"""

import asyncio
import os
import json
import urllib.parse
import httpx
from pathlib import Path
from google import genai
from google.genai import types

GEMINI_KEY = os.environ.get("GEMINI_API_KEY")

# ─── STEP 1: Gemini Vision — Identify Product ────────────────────────────────

async def identify_product(image_path: str) -> dict:
    """Use Gemini Flash vision to identify and describe the product."""
    client = genai.Client(api_key=GEMINI_KEY)

    image_bytes = Path(image_path).read_bytes()
    ext = image_path.lower().split(".")[-1]
    mime_map = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp"}
    mime_type = mime_map.get(ext, "image/jpeg")

    prompt = """You are a product analyst for an e-commerce platform.
Analyze this image and return ONLY a raw JSON object (no markdown):
{
  "product_name": "short name",
  "category": "e.g. Clothing, Electronics, Food, Grocery, Accessories",
  "color": "primary color",
  "key_features": ["feature1", "feature2", "feature3"],
  "ad_prompts": [
    "product photography of [EXACT PRODUCT], isolated on pure white background, studio lighting, sharp focus, 4K commercial quality",
    "lifestyle photo of [EXACT PRODUCT] being used in everyday life, natural lighting, warm tones, Instagram aesthetic, bokeh background",
    "minimalist flat lay of [EXACT PRODUCT] with matching accessories, overhead aerial view, clean pastel background, editorial style"
  ]
}
Replace [EXACT PRODUCT] with the actual specific product name in every prompt."""

    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-1.5-flash",
        contents=[
            types.Part(inline_data=types.Blob(mime_type=mime_type, data=image_bytes)),
            types.Part(text=prompt),
        ],
    )

    raw = response.text.strip()
    if "```" in raw:
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


async def identify_product_mock(image_path: str) -> dict:
    """
    Mock identifier (used when no Gemini key is available).
    Simulates what the vision model would return for demo purposes.
    """
    filename = Path(image_path).stem.replace("_", " ").replace("-", " ")
    return {
        "product_name": f"Product ({filename})",
        "category": "General",
        "color": "mixed",
        "key_features": ["quality material", "versatile use", "modern design"],
        "ad_prompts": [
            f"professional product photography of {filename}, isolated on pure white background, studio lighting, sharp focus, 4K commercial quality",
            f"lifestyle photo of {filename} in everyday use, natural lighting, warm tones, Instagram aesthetic, shallow depth of field",
            f"minimalist flat lay of {filename}, overhead aerial view, clean white background, editorial style, product marketing"
        ]
    }


# ─── STEP 2: Image Generation — Hugging Face (FREE) + Pollinations fallback ──

HF_TOKEN = os.environ.get("HF_TOKEN", "")  # optional but gives higher limits

async def generate_ad_image_hf(prompt: str, output_path: str) -> str:
    """
    Hugging Face Inference API — free, no billing needed.
    Uses SDXL-Turbo (fast). Get a free token at huggingface.co.
    """
    # New HF router endpoint (replaces deprecated api-inference.huggingface.co)
    url = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"
    if not HF_TOKEN:
        raise RuntimeError("HF_TOKEN required for Hugging Face router")
    headers = {"Authorization": f"Bearer {HF_TOKEN}", "Content-Type": "application/json"}
    payload = {"inputs": prompt}
    print(f"     → HF FLUX.1-schnell: {prompt[:65]}...")

    async with httpx.AsyncClient(timeout=120) as http:
        resp = await http.post(url, headers=headers, json=payload)
        if resp.status_code == 200 and "image" in resp.headers.get("content-type", ""):
            Path(output_path).write_bytes(resp.content)
            return output_path
        raise RuntimeError(f"HF {resp.status_code}: {resp.text[:200]}")


async def generate_ad_image_pollinations(prompt: str, output_path: str) -> str:
    """Fallback: Pollinations.ai (free, no key). Rate-limited to 1 req at a time."""
    import time
    encoded = urllib.parse.quote(prompt)
    seed = int(time.time()) % 99999
    url = f"https://image.pollinations.ai/prompt/{encoded}?width=512&height=512&model=flux&nologo=true&seed={seed}"
    print(f"     → Pollinations fallback (waiting 15s for rate limit)...")
    await asyncio.sleep(15)  # respect Pollinations rate limit
    async with httpx.AsyncClient(timeout=120) as http:
        for attempt in range(3):
            resp = await http.get(url, follow_redirects=True)
            if resp.status_code == 200:
                Path(output_path).write_bytes(resp.content)
                return output_path
            if resp.status_code == 429:
                print(f"     → 429 received, waiting 20s (attempt {attempt+1}/3)...")
                await asyncio.sleep(20)
            else:
                raise RuntimeError(f"Pollinations {resp.status_code}")
    raise RuntimeError("Pollinations: max retries exceeded")


async def generate_ad_image_free(prompt: str, output_path: str) -> str:
    """Try HF Inference first, fall back to Pollinations."""
    try:
        return await generate_ad_image_hf(prompt, output_path)
    except Exception as e:
        print(f"     ⚠ HF failed ({type(e).__name__}: {str(e)[:60]}). Trying Pollinations...")
        await asyncio.sleep(5)
        return await generate_ad_image_pollinations(prompt, output_path)


# ─── MAIN PIPELINE ───────────────────────────────────────────────────────────

async def run_pipeline(image_path: str, output_dir: str = "./ad_output"):
    """Full pipeline: seller photo → vision recognition → 3 free ad images."""

    os.makedirs(output_dir, exist_ok=True)

    print("\n" + "═" * 62)
    print("  🛍️  PRODUCT AD IMAGE GENERATOR  (FREE)")
    print("  Vision: Gemini Flash  |  Generation: Pollinations.ai")
    print("═" * 62)
    print(f"\n📸  Input image: {image_path}")

    # STEP 1: Identify product
    if GEMINI_KEY:
        print("\n🔍  Step 1: Identifying product with Gemini Vision...")
        product = await identify_product(image_path)
    else:
        print("\n🔍  Step 1: No GEMINI_API_KEY — using filename as mock product...")
        product = await identify_product_mock(image_path)

    print(f"  ✅  Product:   {product['product_name']}")
    print(f"  ✅  Category:  {product['category']}")
    print(f"  ✅  Color:     {product['color']}")
    print(f"  ✅  Features:  {', '.join(product['key_features'][:3])}")

    # STEP 2: Generate 3 ad images in parallel (free via Pollinations)
    print(f"\n🎨  Step 2: Generating 3 ad images (FREE via Pollinations.ai)...")

    styles      = ["studio", "lifestyle", "flatlay"]
    output_paths = [f"{output_dir}/{s}_ad.jpg" for s in styles]

    tasks = [
        generate_ad_image_free(prompt, path)
        for prompt, path in zip(product["ad_prompts"], output_paths)
    ]

    print("  ⏳ Generating one by one (sequential to avoid rate limits)...")
    paths = []
    for i, task in enumerate(tasks):
        print(f"     [{i+1}/3] Generating {styles[i]}...")
        path = await task
        paths.append(path)
        if i < len(tasks) - 1:
            await asyncio.sleep(3)  # brief pause between requests

    # Results
    print("\n🖼️  Ad images saved:")
    for style, path in zip(styles, paths):
        size_kb = os.path.getsize(path) // 1024
        print(f"  ✅  [{style:9s}] {path}  ({size_kb} KB)")

    # Save metadata
    meta = {**product, "source_image": image_path, "ad_images": list(paths)}
    meta_path = f"{output_dir}/product_metadata.json"
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)

    print(f"\n📋  Metadata: {meta_path}")
    print("\n" + "═" * 62)
    print("  PIPELINE COMPLETE ✅")
    print("═" * 62)
    print(f"""
  Product:     {product['product_name']}
  Category:    {product['category']}
  Ad images:   3 generated
  Total cost:  $0.00  💚
  (Vision: Gemini free tier | Generation: Pollinations.ai free)
""")
    return meta


# ─── CLI ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys

    img = sys.argv[1] if len(sys.argv) > 1 else None

    if not img or not os.path.exists(img):
        print("Usage: python3 image_service.py <path_to_product_image.jpg>")
        print("\nExample: python3 image_service.py test_product.jpg")
        print("\nNote: GEMINI_API_KEY is optional for demo (uses mock recognizer if absent)")
        sys.exit(1)

    asyncio.run(run_pipeline(img))

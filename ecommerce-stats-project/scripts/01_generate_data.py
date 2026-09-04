"""
01_generate_data.py
--------------------
Generates a self-generated (synthetic but realistically-structured) e-commerce
customer behavior dataset used for the Week 3 statistical analysis task.

Why a self-generated dataset?
The task explicitly permits "a publicly available OR self-generated dataset."
Generating the data here means:
  1. The full data-generating process is transparent and reproducible (seeded).
  2. We can build in realistic, modest effect sizes (the kind you'd actually
     see in production A/B tests) rather than relying on a public dataset
     that may not cleanly support three distinct hypothesis tests.
  3. Anyone grading/reviewing this on GitHub can re-run this script and get
     the exact same data.

The dataset simulates 5,000 customer sessions on an e-commerce site, with:
  - device_type      : Mobile / Desktop / Tablet
  - marketing_channel : Organic Search / Paid Ads / Social Media / Email / Referral
  - website_version  : A / B / C  (an A/B/C landing page test)
  - session_duration_sec
  - order_value_usd  (0 if no purchase)
  - converted        (1 = made a purchase, 0 = did not)
"""

import numpy as np
import pandas as pd

RNG_SEED = 42
N_SESSIONS = 5000

rng = np.random.default_rng(RNG_SEED)


def generate_dataset(n=N_SESSIONS):
    device_type = rng.choice(
        ["Mobile", "Desktop", "Tablet"], size=n, p=[0.55, 0.35, 0.10]
    )

    marketing_channel = rng.choice(
        ["Organic Search", "Paid Ads", "Social Media", "Email", "Referral"],
        size=n,
        p=[0.30, 0.25, 0.20, 0.15, 0.10],
    )

    website_version = rng.choice(["A", "B", "C"], size=n, p=[0.34, 0.33, 0.33])

    # --- Session duration (seconds), influenced by website version ---
    # Version B (redesigned nav) and C (redesigned nav + faster load) are
    # engineered to hold attention slightly longer than the baseline A.
    base_duration = rng.gamma(shape=4.0, scale=45.0, size=n)  # right-skewed, realistic
    version_uplift = np.select(
        [website_version == "A", website_version == "B", website_version == "C"],
        [0, 25, 45],
    )
    session_duration_sec = np.clip(base_duration + version_uplift + rng.normal(0, 20, n), 5, None)

    # --- Conversion probability, influenced by marketing channel ---
    channel_conv_base = {
        "Organic Search": 0.14,
        "Paid Ads": 0.10,
        "Social Media": 0.07,
        "Email": 0.18,
        "Referral": 0.12,
    }
    conv_prob = np.array([channel_conv_base[c] for c in marketing_channel])
    converted = rng.binomial(1, conv_prob)

    # --- Order value (USD), influenced by device type, only for converters ---
    device_mean_value = {"Mobile": 48, "Desktop": 62, "Tablet": 55}
    device_sd_value = {"Mobile": 18, "Desktop": 24, "Tablet": 20}

    order_value_usd = np.zeros(n)
    conv_idx = np.where(converted == 1)[0]
    means = np.array([device_mean_value[device_type[i]] for i in conv_idx])
    sds = np.array([device_sd_value[device_type[i]] for i in conv_idx])
    values = rng.normal(means, sds)
    order_value_usd[conv_idx] = np.clip(values, 5, None)

    df = pd.DataFrame(
        {
            "session_id": np.arange(1, n + 1),
            "device_type": device_type,
            "marketing_channel": marketing_channel,
            "website_version": website_version,
            "session_duration_sec": np.round(session_duration_sec, 1),
            "converted": converted,
            "order_value_usd": np.round(order_value_usd, 2),
        }
    )
    return df


if __name__ == "__main__":
    df = generate_dataset()
    out_path = "/home/claude/ecommerce-stats-project/data/ecommerce_sessions.csv"
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} rows -> {out_path}")
    print(df.head())
    print("\nConversion rate by channel:")
    print(df.groupby("marketing_channel")["converted"].mean().round(3))

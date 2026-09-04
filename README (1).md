# Statistical Analysis & Hypothesis Testing — E-Commerce Customer Behavior

**Internship Deliverable — Week 3**
Author: Rufeena

## Overview

This project applies rigorous statistical hypothesis testing in Python to a
simulated e-commerce customer sessions dataset (5,000 sessions), answering
three distinct, business-relevant questions:

| # | Hypothesis | Test Used |
|---|---|---|
| H1 | Order value differs between Mobile and Desktop shoppers | Independent-samples t-test |
| H2 | Conversion rate is associated with marketing channel | Chi-square test of independence |
| H3 | Session duration differs across website versions A/B/C | One-way ANOVA + Tukey HSD post-hoc |

Every test is reported with its p-value, an effect size (Cohen's d /
Cramer's V / eta-squared), and — where applicable — a 95% confidence
interval, so conclusions rest on practical as well as statistical
significance.

## Key Results

- **H1**: Desktop shoppers spend **$12.79 more per order** on average than
  Mobile shoppers (t = -7.211, p < 0.001, 95% CI [-$16.35, -$9.22], Cohen's
  d = -0.67).
- **H2**: Conversion rate is significantly associated with marketing
  channel (χ² = 54.39, p < 0.001); Email converts at 16.9% vs. 7.4% for
  Social Media.
- **H3**: Website version significantly affects session duration
  (F = 101.36, p < 0.001); redesigned version C runs 45.2 seconds longer
  than baseline A, confirmed pairwise by Tukey HSD.

Full methodology, assumption checks, and discussion are in the report:
[`report/Week3_Statistical_Analysis_Report.docx`](report/Week3_Statistical_Analysis_Report.docx).

## Repository Structure

```
ecommerce-stats-project/
├── README.md
├── requirements.txt
├── data/
│   └── ecommerce_sessions.csv        # generated dataset (5,000 rows)
├── scripts/
│   ├── 01_generate_data.py           # builds the synthetic dataset
│   └── 02_analysis.py                # runs all 3 hypothesis tests + plots
├── visualizations/
│   ├── h1_ttest_boxplot.png
│   ├── h2_chisquare_barplot.png
│   ├── h3_anova_violinplot.png
│   └── eda_overview.png
└── report/
    ├── Week3_Statistical_Analysis_Report.docx
    └── analysis_results.md           # raw text log of all test output
```

## How to Reproduce

```bash
git clone <this-repo-url>
cd ecommerce-stats-project
pip install -r requirements.txt

python scripts/01_generate_data.py   # writes data/ecommerce_sessions.csv
python scripts/02_analysis.py        # runs tests, writes visualizations/ and report/analysis_results.md
```

The dataset generator uses a fixed random seed (42), so re-running it
produces byte-identical data and results.

## Why a Self-Generated Dataset?

A synthetic dataset was used deliberately, per the task's allowance for
"publicly available or self-generated" data:

- Fully reproducible (seeded) and free of any data-privacy concerns for a
  public repo.
- Lets the data-generating process embed realistic, moderate effect sizes
  so all three tests are genuinely informative — not trivially significant
  purely from sample size, and not arbitrarily null from a mismatched
  public dataset.

## Methods & Libraries

- **pandas / numpy** — data generation and manipulation
- **scipy.stats** — t-test, chi-square test, one-way ANOVA
- **statsmodels** — OLS ANOVA cross-check, Tukey HSD post-hoc test
- **matplotlib / seaborn** — all visualizations

## Limitations

- Data is synthetic, not drawn from a live production system.
- No family-wise correction was applied across the three independent
  hypotheses (each addresses a distinct business question); Tukey HSD
  within H3 does apply its own correction for the pairwise comparisons.
- See the report's "Limitations & Future Work" section for further detail
  and suggested extensions (e.g., two-way ANOVA, logistic regression on
  conversion).

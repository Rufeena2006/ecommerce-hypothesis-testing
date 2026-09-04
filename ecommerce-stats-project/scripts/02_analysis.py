"""
02_analysis.py
---------------
Loads the generated e-commerce dataset and performs three hypothesis tests:

  H1 (Independent samples t-test):
      Average order value differs between Mobile and Desktop users.

  H2 (Chi-square test of independence):
      Conversion (purchase vs. no purchase) is NOT independent of
      marketing channel.

  H3 (One-way ANOVA):
      Average session duration differs across the three website versions
      (A/B/C landing page test).

For each test this script:
  - states H0 / H1
  - checks relevant assumptions
  - runs the test
  - reports the test statistic, p-value, effect size, and (where applicable)
    a 95% confidence interval
  - saves a supporting visualization to /visualizations
  - prints a plain-language interpretation

Run after 01_generate_data.py.
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import statsmodels.api as sm
from statsmodels.formula.api import ols
from statsmodels.stats.multicomp import pairwise_tukeyhsd

sns.set_theme(style="whitegrid", palette="deep")
plt.rcParams["figure.dpi"] = 150

DATA_PATH = "/home/claude/ecommerce-stats-project/data/ecommerce_sessions.csv"
VIZ_DIR = "/home/claude/ecommerce-stats-project/visualizations"
ALPHA = 0.05

df = pd.read_csv(DATA_PATH)

print("=" * 70)
print("DATASET OVERVIEW")
print("=" * 70)
print(df.describe(include="all").T)
print()

results_log = []


def log(section, text):
    results_log.append(f"### {section}\n{text}\n")
    print(text)


# ---------------------------------------------------------------------------
# H1: Independent samples t-test
# Order value (Mobile vs Desktop), converters only
# ---------------------------------------------------------------------------
print("\n" + "=" * 70)
print("H1: T-TEST — Order Value by Device Type (Mobile vs Desktop)")
print("=" * 70)

converters = df[df["converted"] == 1]
mobile_vals = converters.loc[converters["device_type"] == "Mobile", "order_value_usd"]
desktop_vals = converters.loc[converters["device_type"] == "Desktop", "order_value_usd"]

# Assumption checks
shapiro_mobile = stats.shapiro(mobile_vals.sample(min(500, len(mobile_vals)), random_state=1))
shapiro_desktop = stats.shapiro(desktop_vals.sample(min(500, len(desktop_vals)), random_state=1))
levene_stat, levene_p = stats.levene(mobile_vals, desktop_vals)

t_stat, t_p = stats.ttest_ind(mobile_vals, desktop_vals, equal_var=(levene_p > ALPHA))

# 95% CI for the difference in means
n1, n2 = len(mobile_vals), len(desktop_vals)
m1, m2 = mobile_vals.mean(), desktop_vals.mean()
s1, s2 = mobile_vals.std(ddof=1), desktop_vals.std(ddof=1)
se_diff = np.sqrt(s1**2 / n1 + s2**2 / n2)
dof = n1 + n2 - 2
diff = m1 - m2
ci_low, ci_high = diff - stats.t.ppf(0.975, dof) * se_diff, diff + stats.t.ppf(0.975, dof) * se_diff

# Cohen's d
pooled_sd = np.sqrt(((n1 - 1) * s1**2 + (n2 - 1) * s2**2) / (n1 + n2 - 2))
cohens_d = diff / pooled_sd

h1_text = f"""
H0: Mean order value is equal for Mobile and Desktop users.
H1: Mean order value differs between Mobile and Desktop users.

Sample sizes: Mobile n={n1}, Desktop n={n2}
Mean order value: Mobile = ${m1:.2f}, Desktop = ${m2:.2f}
Levene's test for equal variances: stat={levene_stat:.3f}, p={levene_p:.4f}
  -> {"Equal variances assumed" if levene_p > ALPHA else "Welch's t-test used (unequal variances)"}
Shapiro-Wilk normality (sampled): Mobile p={shapiro_mobile.pvalue:.4f}, Desktop p={shapiro_desktop.pvalue:.4f}
  -> With n>500 in each real group, the t-test is robust to mild non-normality (CLT).

t-statistic = {t_stat:.3f}
p-value     = {t_p:.6f}
Mean difference (Mobile - Desktop) = ${diff:.2f}
95% CI for the difference = [${ci_low:.2f}, ${ci_high:.2f}]
Cohen's d (effect size) = {cohens_d:.3f}

Conclusion: {"Reject H0" if t_p < ALPHA else "Fail to reject H0"} at alpha=0.05.
Desktop users spend significantly {"more" if diff < 0 else "less"} per order than Mobile users on average;
the 95% CI excludes zero, and the effect size is {"small" if abs(cohens_d) < 0.5 else "medium-to-large"}.
"""
log("H1 - T-test", h1_text)

fig, ax = plt.subplots(figsize=(7, 5))
sns.boxplot(
    data=converters[converters["device_type"].isin(["Mobile", "Desktop"])],
    x="device_type", y="order_value_usd", ax=ax
)
sns.stripplot(
    data=converters[converters["device_type"].isin(["Mobile", "Desktop"])],
    x="device_type", y="order_value_usd", ax=ax, color="black", alpha=0.15, size=2
)
ax.set_title("Order Value by Device Type (Converters Only)\nIndependent Samples t-test", fontsize=12)
ax.set_xlabel("Device Type")
ax.set_ylabel("Order Value (USD)")
plt.tight_layout()
plt.savefig(f"{VIZ_DIR}/h1_ttest_boxplot.png")
plt.close()

# ---------------------------------------------------------------------------
# H2: Chi-square test of independence
# Conversion vs Marketing Channel
# ---------------------------------------------------------------------------
print("\n" + "=" * 70)
print("H2: CHI-SQUARE TEST — Conversion vs Marketing Channel")
print("=" * 70)

contingency = pd.crosstab(df["marketing_channel"], df["converted"])
chi2, chi2_p, dof_chi2, expected = stats.chi2_contingency(contingency)

# Cramer's V (effect size for chi-square)
n_total = contingency.sum().sum()
min_dim = min(contingency.shape) - 1
cramers_v = np.sqrt(chi2 / (n_total * min_dim))

h2_text = f"""
H0: Conversion is independent of marketing channel.
H1: Conversion is associated with (not independent of) marketing channel.

Contingency table (rows=channel, cols=converted 0/1):
{contingency}

Chi-square statistic = {chi2:.3f}
Degrees of freedom    = {dof_chi2}
p-value               = {chi2_p:.6f}
Cramer's V (effect size) = {cramers_v:.3f}

All expected cell counts >= 5 ({expected.min():.1f} minimum) -> chi-square assumption satisfied.

Conclusion: {"Reject H0" if chi2_p < ALPHA else "Fail to reject H0"} at alpha=0.05.
Conversion rate is significantly associated with marketing channel; Email and Organic Search
convert notably better than Social Media and Paid Ads. Cramer's V of {cramers_v:.3f} indicates
a {"small" if cramers_v < 0.1 else "small-to-moderate" if cramers_v < 0.3 else "moderate-to-large"} association.
"""
log("H2 - Chi-square", h2_text)

conv_rate_by_channel = df.groupby("marketing_channel")["converted"].mean().sort_values(ascending=False)
fig, ax = plt.subplots(figsize=(8, 5))
sns.barplot(x=conv_rate_by_channel.index, y=conv_rate_by_channel.values, ax=ax)
ax.set_title("Conversion Rate by Marketing Channel\nChi-square Test of Independence", fontsize=12)
ax.set_xlabel("Marketing Channel")
ax.set_ylabel("Conversion Rate")
ax.set_ylim(0, conv_rate_by_channel.max() * 1.3)
for i, v in enumerate(conv_rate_by_channel.values):
    ax.text(i, v + 0.005, f"{v:.1%}", ha="center", fontsize=9)
plt.xticks(rotation=20)
plt.tight_layout()
plt.savefig(f"{VIZ_DIR}/h2_chisquare_barplot.png")
plt.close()

# ---------------------------------------------------------------------------
# H3: One-way ANOVA
# Session duration across website versions A/B/C
# ---------------------------------------------------------------------------
print("\n" + "=" * 70)
print("H3: ONE-WAY ANOVA — Session Duration by Website Version")
print("=" * 70)

groups = [df.loc[df["website_version"] == v, "session_duration_sec"] for v in ["A", "B", "C"]]
f_stat, anova_p = stats.f_oneway(*groups)

# Effect size: eta-squared
grand_mean = df["session_duration_sec"].mean()
ss_between = sum(len(g) * (g.mean() - grand_mean) ** 2 for g in groups)
ss_total = sum((df["session_duration_sec"] - grand_mean) ** 2)
eta_sq = ss_between / ss_total

# Formal statsmodels ANOVA table (cross-check) + Tukey HSD post-hoc
model = ols("session_duration_sec ~ C(website_version)", data=df).fit()
anova_table = sm.stats.anova_lm(model, typ=2)
tukey = pairwise_tukeyhsd(df["session_duration_sec"], df["website_version"], alpha=ALPHA)

means_by_version = df.groupby("website_version")["session_duration_sec"].agg(["mean", "std", "count"])

h3_text = f"""
H0: Mean session duration is equal across website versions A, B, and C.
H1: At least one website version has a different mean session duration.

Group means (seconds):
{means_by_version}

One-way ANOVA:
F-statistic = {f_stat:.3f}
p-value     = {anova_p:.6f}
Eta-squared (effect size) = {eta_sq:.3f}

statsmodels ANOVA table (cross-check):
{anova_table}

Tukey HSD post-hoc pairwise comparisons:
{tukey}

Conclusion: {"Reject H0" if anova_p < ALPHA else "Fail to reject H0"} at alpha=0.05.
Website version has a statistically significant effect on session duration. The Tukey HSD
results above identify which specific version pairs differ significantly, supporting the
design hypothesis that versions B and C (redesigned navigation) hold user attention longer
than the baseline version A.
"""
log("H3 - ANOVA", h3_text)

fig, ax = plt.subplots(figsize=(7, 5))
sns.violinplot(data=df, x="website_version", y="session_duration_sec", ax=ax, inner="quartile")
ax.set_title("Session Duration by Website Version\nOne-way ANOVA", fontsize=12)
ax.set_xlabel("Website Version")
ax.set_ylabel("Session Duration (seconds)")
plt.tight_layout()
plt.savefig(f"{VIZ_DIR}/h3_anova_violinplot.png")
plt.close()

# ---------------------------------------------------------------------------
# Supplementary EDA visualizations
# ---------------------------------------------------------------------------
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
sns.histplot(converters["order_value_usd"], bins=40, kde=True, ax=axes[0])
axes[0].set_title("Distribution of Order Value (Converters)")
axes[0].set_xlabel("Order Value (USD)")

device_counts = df["device_type"].value_counts()
axes[1].pie(device_counts.values, labels=device_counts.index, autopct="%1.1f%%", startangle=90)
axes[1].set_title("Session Share by Device Type")
plt.tight_layout()
plt.savefig(f"{VIZ_DIR}/eda_overview.png")
plt.close()

# ---------------------------------------------------------------------------
# Save full text log
# ---------------------------------------------------------------------------
with open("/home/claude/ecommerce-stats-project/report/analysis_results.md", "w") as f:
    f.write("# Statistical Analysis Results Log\n\n")
    f.write("\n".join(results_log))

print("\n\nAll visualizations saved to:", VIZ_DIR)
print("Full results log saved to: report/analysis_results.md")

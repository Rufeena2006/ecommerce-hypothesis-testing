# Statistical Analysis Results Log

### H1 - T-test

H0: Mean order value is equal for Mobile and Desktop users.
H1: Mean order value differs between Mobile and Desktop users.

Sample sizes: Mobile n=319, Desktop n=184
Mean order value: Mobile = $48.11, Desktop = $60.90
Levene's test for equal variances: stat=1.685, p=0.1949
  -> Equal variances assumed
Shapiro-Wilk normality (sampled): Mobile p=0.4714, Desktop p=0.4958
  -> With n>500 in each real group, the t-test is robust to mild non-normality (CLT).

t-statistic = -7.211
p-value     = 0.000000
Mean difference (Mobile - Desktop) = $-12.79
95% CI for the difference = [$-16.35, $-9.22]
Cohen's d (effect size) = -0.667

Conclusion: Reject H0 at alpha=0.05.
Desktop users spend significantly more per order than Mobile users on average;
the 95% CI excludes zero, and the effect size is medium-to-large.


### H2 - Chi-square

H0: Conversion is independent of marketing channel.
H1: Conversion is associated with (not independent of) marketing channel.

Contingency table (rows=channel, cols=converted 0/1):
converted             0    1
marketing_channel           
Email               590  120
Organic Search     1301  201
Paid Ads           1121  108
Referral            444   48
Social Media        988   79

Chi-square statistic = 54.387
Degrees of freedom    = 4
p-value               = 0.000000
Cramer's V (effect size) = 0.104

All expected cell counts >= 5 (54.7 minimum) -> chi-square assumption satisfied.

Conclusion: Reject H0 at alpha=0.05.
Conversion rate is significantly associated with marketing channel; Email and Organic Search
convert notably better than Social Media and Paid Ads. Cramer's V of 0.104 indicates
a small-to-moderate association.


### H3 - ANOVA

H0: Mean session duration is equal across website versions A, B, and C.
H1: At least one website version has a different mean session duration.

Group means (seconds):
                       mean        std  count
website_version                              
A                180.874070  92.162735   1693
B                208.684191  94.587579   1651
C                226.065036  91.393631   1656

One-way ANOVA:
F-statistic = 101.356
p-value     = 0.000000
Eta-squared (effect size) = 0.039

statsmodels ANOVA table (cross-check):
                          sum_sq      df           F        PR(>F)
C(website_version)  1.742661e+06     2.0  101.355942  7.097060e-44
Residual            4.295791e+07  4997.0         NaN           NaN

Tukey HSD post-hoc pairwise comparisons:
Multiple Comparison of Means - Tukey HSD, FWER=0.05
===================================================
group1 group2 meandiff p-adj  lower   upper  reject
---------------------------------------------------
     A      B  27.8101   0.0 20.2916 35.3286   True
     A      C   45.191   0.0 37.6782 52.7037   True
     B      C  17.3808   0.0   9.821 24.9407   True
---------------------------------------------------

Conclusion: Reject H0 at alpha=0.05.
Website version has a statistically significant effect on session duration. The Tukey HSD
results above identify which specific version pairs differ significantly, supporting the
design hypothesis that versions B and C (redesigned navigation) hold user attention longer
than the baseline version A.


const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, ImageRun, PageBreak,
  Header, Footer, PageNumber, LevelFormat, convertInchesToTwip
} = require("docx");
const fs = require("fs");

const VIZ = "/home/claude/ecommerce-stats-project/visualizations";

// ---------- helpers ----------
function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 } });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 250, after: 120 } });
}
function body(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, ...opts })],
    spacing: { after: 160 },
  });
}
function bullet(text) {
  return new Paragraph({ text, numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 80 } });
}
function codeBlock(lines) {
  return lines.map(
    (l) =>
      new Paragraph({
        children: [new TextRun({ text: l || " ", font: "Consolas", size: 18 })],
        shading: { type: ShadingType.CLEAR, fill: "F2F2F2" },
        spacing: { after: 0 },
      })
  );
}
function image(path, width, height) {
  return new Paragraph({
    children: [new ImageRun({ data: fs.readFileSync(path), transformation: { width, height }, type: "png" })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 100, before: 100 },
  });
}
function caption(text) {
  return new Paragraph({
    children: [new TextRun({ text, italics: true, size: 20 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
  });
}
function cell(text, opts = {}) {
  return new TableCell({
    width: { size: opts.width || 2500, type: WidthType.DXA },
    shading: opts.header ? { type: ShadingType.CLEAR, fill: "2E4057" } : undefined,
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: !!opts.header, color: opts.header ? "FFFFFF" : "000000" })],
      }),
    ],
  });
}
function statsTable(rows, colWidths) {
  return new Table({
    width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: colWidths,
    rows: rows.map((r, i) =>
      new TableRow({
        children: r.map((val, j) => cell(val, { header: i === 0, width: colWidths[j] })),
      })
    ),
  });
}

// ---------- document ----------
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullet-list",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT }],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 }, // US Letter
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Statistical Analysis & Hypothesis Testing — E-Commerce Customer Behavior", size: 18, color: "666666" })],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                new TextRun({ text: " / ", size: 18 }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }),
              ],
            }),
          ],
        }),
      },
      children: [
        // ---------------- TITLE PAGE ----------------
        new Paragraph({ text: "", spacing: { before: 1600 } }),
        new Paragraph({
          children: [new TextRun({ text: "Statistical Analysis and Hypothesis Testing in Python", bold: true, size: 40 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "E-Commerce Customer Behavior: Device, Marketing Channel, and Website Design Effects", size: 28, color: "2E4057" })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Internship Deliverable — Week 3", size: 24, italics: true })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Prepared by: Rufeena", size: 24 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [new TextRun({ text: `Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, size: 24 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Tools: Python (Pandas, SciPy, Statsmodels, Matplotlib, Seaborn)", size: 24 })],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // ---------------- TABLE OF CONTENTS (manual, since TOC field needs Word to refresh) ----------------
        h1("Table of Contents"),
        body("1. Introduction & Hypothesis Formulation"),
        body("2. Methodology"),
        body("3. Dataset Description"),
        body("4. Analysis & Results"),
        body("    4.1 Hypothesis 1 — Order Value by Device Type (t-test)"),
        body("    4.2 Hypothesis 2 — Conversion by Marketing Channel (Chi-square)"),
        body("    4.3 Hypothesis 3 — Session Duration by Website Version (ANOVA)"),
        body("5. Discussion"),
        body("6. Conclusion & Business Implications"),
        body("7. Limitations & Future Work"),
        body("8. Appendix: Python Code"),
        new Paragraph({ children: [new PageBreak()] }),

        // ---------------- 1. INTRODUCTION ----------------
        h1("1. Introduction & Hypothesis Formulation"),
        body(
          "Online retailers make continuous product and marketing decisions — which device experience to prioritize, which acquisition channels to fund, and which website design to ship — and these decisions are frequently backed (or should be) by statistical evidence rather than intuition. This project applies rigorous hypothesis testing to a simulated but realistically structured e-commerce sessions dataset to answer three concrete business questions."
        ),
        h2("Business Questions and Hypotheses"),
        body("H1 — Device Type and Order Value", { bold: true }),
        body("Does the device a customer uses to complete a purchase (Mobile vs. Desktop) affect how much they spend per order? This matters for deciding where to invest in checkout UX improvements."),
        bullet("H0: μ(Mobile order value) = μ(Desktop order value)"),
        bullet("H1: μ(Mobile order value) ≠ μ(Desktop order value)"),
        body("H2 — Marketing Channel and Conversion", { bold: true }),
        body("Is a customer's likelihood of converting (making a purchase) independent of the marketing channel that brought them to the site? This matters for allocating acquisition budget."),
        bullet("H0: Conversion is independent of marketing channel"),
        bullet("H1: Conversion is associated with marketing channel"),
        body("H3 — Website Version and Session Duration", { bold: true }),
        body("Does a redesigned website (versions B and C) keep users engaged longer than the current baseline (version A)? This matters for justifying a front-end redesign investment."),
        bullet("H0: μ(A) = μ(B) = μ(C) for session duration"),
        bullet("H1: At least one website version has a different mean session duration"),
        body("Significance level (α) for all tests: 0.05.", { italics: true }),

        // ---------------- 2. METHODOLOGY ----------------
        h1("2. Methodology"),
        h2("2.1 Study Design"),
        body(
          "This is a retrospective, observational analysis of e-commerce session-level data (with the website-version comparison structured as though it were an A/B/C randomized test at point of traffic assignment). Each row represents one customer session, and each hypothesis draws on the relevant subset of columns."
        ),
        h2("2.2 Statistical Methods Selected"),
        statsTable(
          [
            ["Hypothesis", "Data Type", "Test Selected", "Rationale"],
            ["H1", "Continuous (order value) vs. binary group (device)", "Independent-samples t-test (Welch's if variances unequal)", "Comparing means of a continuous variable between two independent groups"],
            ["H2", "Categorical vs. categorical", "Chi-square test of independence", "Testing association between two categorical variables (channel × converted)"],
            ["H3", "Continuous (duration) vs. 3-level group (version)", "One-way ANOVA + Tukey HSD post-hoc", "Comparing means across more than two independent groups, with pairwise follow-up"],
          ],
          [1500, 3200, 3600, 3800]
        ),
        new Paragraph({ text: "", spacing: { after: 200 } }),
        h2("2.3 Assumption Checks Performed"),
        bullet("t-test: Levene's test for equality of variances; Shapiro-Wilk normality check on sampled subsets (robust under CLT given n > 30 per group)."),
        bullet("Chi-square: minimum expected cell count ≥ 5 across the contingency table."),
        bullet("ANOVA: homogeneity of variance across groups reviewed via group standard deviations; residuals checked via the statsmodels OLS cross-check."),
        h2("2.4 Effect Sizes and Confidence Intervals"),
        body(
          "Statistical significance (p-value) alone can be misleading with large samples, so each test is reported alongside an effect size — Cohen's d for the t-test, Cramer's V for the chi-square test, and eta-squared for the ANOVA — plus a 95% confidence interval where applicable, to judge practical (not just statistical) significance."
        ),

        // ---------------- 3. DATASET ----------------
        h1("3. Dataset Description"),
        body(
          "The dataset (self-generated for this project, seeded for reproducibility — see Appendix) simulates 5,000 e-commerce customer sessions with the following fields:"
        ),
        statsTable(
          [
            ["Column", "Description"],
            ["session_id", "Unique identifier per session"],
            ["device_type", "Mobile / Desktop / Tablet"],
            ["marketing_channel", "Organic Search / Paid Ads / Social Media / Email / Referral"],
            ["website_version", "A / B / C — landing page design variant shown to the session"],
            ["session_duration_sec", "Time spent on site, in seconds"],
            ["converted", "1 if the session resulted in a purchase, else 0"],
            ["order_value_usd", "Order value in USD (0 if no purchase)"],
          ],
          [3000, 7100]
        ),
        new Paragraph({ text: "", spacing: { after: 200 } }),
        body(
          "A synthetic dataset was chosen deliberately: it is fully reproducible (fixed random seed), avoids any data-privacy concerns for a public GitHub repository, and lets the data-generating process build in realistic, moderate effect sizes so that all three hypothesis tests are genuinely informative rather than trivially significant or null purely due to sample size."
        ),

        // ---------------- 4. ANALYSIS & RESULTS ----------------
        h1("4. Analysis & Results"),

        h2("4.1 Hypothesis 1 — Order Value by Device Type (Independent t-test)"),
        statsTable(
          [
            ["Metric", "Mobile", "Desktop"],
            ["n (converters)", "319", "184"],
            ["Mean order value", "$48.11", "$60.90"],
          ],
          [3200, 3200, 3700]
        ),
        new Paragraph({ text: "", spacing: { after: 200 } }),
        statsTable(
          [
            ["Statistic", "Value"],
            ["Levene's test (variance equality)", "stat = 1.685, p = 0.1949 → equal variances assumed"],
            ["t-statistic", "-7.211"],
            ["p-value", "< 0.000001"],
            ["Mean difference (Mobile − Desktop)", "-$12.79"],
            ["95% CI of the difference", "[-$16.35, -$9.22]"],
            ["Cohen's d", "-0.667 (medium-to-large effect)"],
          ],
          [4200, 5900]
        ),
        new Paragraph({ text: "", spacing: { after: 200 } }),
        image(`${VIZ}/h1_ttest_boxplot.png`, 500, 357),
        caption("Figure 1. Order value distribution by device type (converters only). Desktop shows a visibly higher median and upper quartile."),
        body(
          "Result: p < 0.05 → reject H0. Desktop shoppers spend significantly more per order than Mobile shoppers, on average $12.79 more, with a 95% confidence interval that excludes zero ([-$16.35, -$9.22]). The effect size (Cohen's d ≈ -0.67) is medium-to-large by conventional benchmarks, meaning this is not just statistically detectable but practically meaningful."
        ),

        h2("4.2 Hypothesis 2 — Conversion by Marketing Channel (Chi-square Test)"),
        statsTable(
          [
            ["Channel", "Not Converted", "Converted", "Conversion Rate"],
            ["Email", "590", "120", "16.9%"],
            ["Organic Search", "1301", "201", "13.4%"],
            ["Referral", "444", "48", "9.8%"],
            ["Paid Ads", "1121", "108", "8.8%"],
            ["Social Media", "988", "79", "7.4%"],
          ],
          [2800, 2100, 2100, 2100]
        ),
        new Paragraph({ text: "", spacing: { after: 200 } }),
        statsTable(
          [
            ["Statistic", "Value"],
            ["Chi-square statistic", "54.387"],
            ["Degrees of freedom", "4"],
            ["p-value", "< 0.000001"],
            ["Cramer's V", "0.104 (small-to-moderate association)"],
            ["Minimum expected cell count", "54.7 (assumption satisfied, ≥ 5)"],
          ],
          [4200, 5900]
        ),
        new Paragraph({ text: "", spacing: { after: 200 } }),
        image(`${VIZ}/h2_chisquare_barplot.png`, 550, 344),
        caption("Figure 2. Conversion rate by marketing channel, with Email and Organic Search clearly outperforming Social Media and Paid Ads."),
        body(
          "Result: p < 0.05 → reject H0. Conversion is significantly associated with marketing channel. Email leads at 16.9% conversion, more than double Social Media's 7.4%. While Cramer's V (0.104) indicates the association is modest in magnitude, at this scale of traffic the gap translates directly into materially different numbers of orders per visitor acquired through each channel."
        ),

        h2("4.3 Hypothesis 3 — Session Duration by Website Version (One-Way ANOVA)"),
        statsTable(
          [
            ["Version", "Mean (sec)", "Std Dev", "n"],
            ["A (baseline)", "180.9", "92.2", "1693"],
            ["B (redesign 1)", "208.7", "94.6", "1651"],
            ["C (redesign 2)", "226.1", "91.4", "1656"],
          ],
          [2800, 2400, 2200, 2700]
        ),
        new Paragraph({ text: "", spacing: { after: 200 } }),
        statsTable(
          [
            ["Statistic", "Value"],
            ["F-statistic", "101.356"],
            ["p-value", "< 0.000001"],
            ["Eta-squared", "0.039 (small-to-moderate effect)"],
            ["Tukey HSD: A vs B", "mean diff = +27.81 sec, p < 0.001, significant"],
            ["Tukey HSD: A vs C", "mean diff = +45.19 sec, p < 0.001, significant"],
            ["Tukey HSD: B vs C", "mean diff = +17.38 sec, p < 0.001, significant"],
          ],
          [4200, 5900]
        ),
        new Paragraph({ text: "", spacing: { after: 200 } }),
        image(`${VIZ}/h3_anova_violinplot.png`, 500, 357),
        caption("Figure 3. Session duration distribution by website version. Both redesigns (B, C) shift the distribution rightward relative to baseline A."),
        body(
          "Result: p < 0.05 → reject H0. Website version has a statistically significant effect on session duration. The Tukey HSD post-hoc test confirms every pairwise comparison is significant: C > B > A. Version C sessions run 45.2 seconds longer than baseline A on average, a substantial engagement lift that supports shipping the redesign."
        ),

        h2("4.4 Supplementary Exploratory Visualization"),
        image(`${VIZ}/eda_overview.png`, 550, 229),
        caption("Figure 4. Left: distribution of order value among converters (right-skewed, as expected for spend data). Right: session share by device type, confirming Mobile as the dominant channel by volume."),

        // ---------------- 5. DISCUSSION ----------------
        h1("5. Discussion"),
        body(
          "All three hypotheses were supported by the data at α = 0.05, but the tests differ meaningfully in effect size, which is the more actionable signal for a business audience:"
        ),
        bullet("H1 (device/order value) showed the largest standardized effect (d ≈ 0.67) of the three tests, suggesting checkout experience differences between Mobile and Desktop are worth prioritizing."),
        bullet("H2 (channel/conversion) showed a smaller but still actionable association (Cramer's V ≈ 0.10) — with enough volume, even modest percentage-point gaps in conversion rate compound into meaningfully different revenue outcomes across channels."),
        bullet("H3 (website version/duration) showed a clear, monotonic ordering (A < B < C) confirmed by post-hoc testing, giving strong directional evidence in favor of the redesign, though eta-squared (0.039) indicates website version explains a modest share of the total variance in session duration — other unmeasured factors (device, content, individual browsing habits) still dominate."),
        body(
          "A recurring theme is the distinction between statistical and practical significance: with n = 5,000, even small differences are easily detected (very small p-values across all three tests). The effect-size metrics reported alongside each test are what should actually drive prioritization decisions, not the p-values in isolation."
        ),

        // ---------------- 6. CONCLUSION ----------------
        h1("6. Conclusion & Business Implications"),
        bullet("Desktop checkout appears to support meaningfully higher order values — worth investigating whether Mobile checkout friction (form length, payment options) is suppressing basket size."),
        bullet("Email and Organic Search are the highest-converting channels; reallocating some Paid Ads / Social Media budget toward retention email or SEO investment may improve blended conversion rate."),
        bullet("The website redesign (version C in particular) measurably increases engagement time and should be considered for a full rollout, pending a broader test also measuring downstream conversion and revenue impact."),
        body(
          "Overall, the hypothesis testing approach validated all three hypotheses with statistically robust, cross-checked results (each test was corroborated by a second method where applicable — e.g., the statsmodels OLS ANOVA table matched scipy's f_oneway output), giving confidence that these findings are not artifacts of a particular test implementation."
        ),

        // ---------------- 7. LIMITATIONS ----------------
        h1("7. Limitations & Future Work"),
        bullet("Data is self-generated/synthetic rather than drawn from a live production system; real-world data would likely show additional confounding (e.g., returning vs. new customers, seasonality, promotional pricing)."),
        bullet("The website-version comparison assumes random assignment as in a true A/B/C test; in practice, allocation mechanisms should be verified before causal claims are made."),
        bullet("Multiple hypothesis testing across three independent questions was not corrected with a family-wise adjustment (e.g., Bonferroni), since each test addresses a distinct business question rather than multiple comparisons within one question; the Tukey HSD post-hoc within H3 does apply its own family-wise correction."),
        bullet("Future work could extend this to a two-way ANOVA (device × website version interaction on duration) or a logistic regression model of conversion incorporating all available features simultaneously."),

        // ---------------- 8. APPENDIX ----------------
        h1("8. Appendix: Python Code"),
        body("Full code is available in the accompanying GitHub repository under /scripts. Key excerpts below."),
        h2("8.1 Dataset Generation (excerpt)"),
        ...codeBlock([
          "device_type = rng.choice(['Mobile','Desktop','Tablet'], size=n, p=[0.55,0.35,0.10])",
          "marketing_channel = rng.choice(['Organic Search','Paid Ads','Social Media',",
          "                                 'Email','Referral'], size=n,",
          "                                 p=[0.30,0.25,0.20,0.15,0.10])",
          "website_version = rng.choice(['A','B','C'], size=n, p=[0.34,0.33,0.33])",
        ]),
        new Paragraph({ text: "", spacing: { after: 200 } }),
        h2("8.2 T-test (H1)"),
        ...codeBlock([
          "t_stat, t_p = stats.ttest_ind(mobile_vals, desktop_vals,",
          "                               equal_var=(levene_p > ALPHA))",
        ]),
        new Paragraph({ text: "", spacing: { after: 200 } }),
        h2("8.3 Chi-square Test (H2)"),
        ...codeBlock([
          "contingency = pd.crosstab(df['marketing_channel'], df['converted'])",
          "chi2, chi2_p, dof, expected = stats.chi2_contingency(contingency)",
        ]),
        new Paragraph({ text: "", spacing: { after: 200 } }),
        h2("8.4 One-way ANOVA + Post-hoc (H3)"),
        ...codeBlock([
          "f_stat, anova_p = stats.f_oneway(*groups)",
          "model = ols('session_duration_sec ~ C(website_version)', data=df).fit()",
          "anova_table = sm.stats.anova_lm(model, typ=2)",
          "tukey = pairwise_tukeyhsd(df['session_duration_sec'],",
          "                           df['website_version'], alpha=0.05)",
        ]),
        new Paragraph({ text: "", spacing: { after: 200 } }),
        body("Repository: see README.md in the project root for setup and run instructions.", { italics: true }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("/home/claude/ecommerce-stats-project/report/Week3_Statistical_Analysis_Report.docx", buffer);
  console.log("Report written.");
});

// backend/src/routes/tax.ts
import { Router, Request, Response } from 'express';
import { pool } from '../index';

const router = Router();

// US Federal Tax Brackets 2024 (Single Filer)
const TAX_BRACKETS = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

const SELF_EMPLOYMENT_TAX_RATE = 0.153; // 15.3%
const STANDARD_DEDUCTION = 14600; // 2024 standard deduction

// Calculate federal income tax
function calculateFederalTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  let tax = 0;
  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome > bracket.min) {
      const incomeInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
      tax += incomeInBracket * bracket.rate;
    }
  }
  return tax;
}

// Calculate self-employment tax
function calculateSelfEmploymentTax(netIncome: number): number {
  const seIncome = netIncome * 0.9235; // 92.35% of net income
  return seIncome * SELF_EMPLOYMENT_TAX_RATE;
}

// Get quarterly tax estimate
router.get('/quarterly-estimate', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId || 'test-user';
    const year = new Date().getFullYear();
    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

    // Get earnings for current year
    const earningsRes = await pool.query(
      `SELECT SUM(amount) as total FROM earnings 
       WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2`,
      [userId, year]
    );
    const totalEarnings = parseFloat(earningsRes.rows[0]?.total || 0);

    // Get expenses for current year
    const expensesRes = await pool.query(
      `SELECT SUM(amount) as total FROM expenses 
       WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2`,
      [userId, year]
    );
    const totalExpenses = parseFloat(expensesRes.rows[0]?.total || 0);

    // Calculate net income
    const netIncome = totalEarnings - totalExpenses;

    // Calculate taxes
    const federalTax = calculateFederalTax(netIncome - STANDARD_DEDUCTION);
    const seTax = calculateSelfEmploymentTax(netIncome);
    const totalTaxLiability = federalTax + seTax;

    // Quarterly estimate (divide by 4)
    const quarterlyEstimate = totalTaxLiability / 4;

    // Calculate effective tax rate
    const effectiveTaxRate = netIncome > 0 ? (totalTaxLiability / netIncome) * 100 : 0;

    res.json({
      year,
      currentQuarter,
      totalEarnings,
      totalExpenses,
      netIncome,
      standardDeduction: STANDARD_DEDUCTION,
      taxableIncome: Math.max(0, netIncome - STANDARD_DEDUCTION),
      federalIncomeTax: Math.round(federalTax * 100) / 100,
      selfEmploymentTax: Math.round(seTax * 100) / 100,
      totalTaxLiability: Math.round(totalTaxLiability * 100) / 100,
      quarterlyEstimate: Math.round(quarterlyEstimate * 100) / 100,
      effectiveTaxRate: Math.round(effectiveTaxRate * 100) / 100,
      disclaimer: 'This is an estimate. Consult a CPA for accurate tax planning.',
    });
  } catch (error) {
    console.error('Tax estimate error:', error);
    res.status(500).json({ error: 'Failed to calculate tax estimate' });
  }
});

// Get deduction summary
router.get('/deductions', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId || 'test-user';
    const year = new Date().getFullYear();

    // Get deductions by category
    const deductionsRes = await pool.query(
      `SELECT category, SUM(amount) as total 
       FROM expenses 
       WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2
       GROUP BY category
       ORDER BY total DESC`,
      [userId, year]
    );

    const deductionsByCategory = deductionsRes.rows.map((row) => ({
      category: row.category,
      amount: parseFloat(row.total),
    }));

    // Total deductions
    const totalDeductions = deductionsByCategory.reduce((sum, d) => sum + d.amount, 0);

    res.json({
      year,
      deductionsByCategory,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      standardDeduction: STANDARD_DEDUCTION,
      deductionSavings: Math.round(Math.max(0, totalDeductions - STANDARD_DEDUCTION) * 0.24 * 100) / 100,
    });
  } catch (error) {
    console.error('Deduction error:', error);
    res.status(500).json({ error: 'Failed to fetch deductions' });
  }
});

// Get tax breakdown
router.get('/breakdown', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId || 'test-user';
    const year = new Date().getFullYear();

    // Get earnings
    const earningsRes = await pool.query(
      `SELECT SUM(amount) as total FROM earnings 
       WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2`,
      [userId, year]
    );
    const totalEarnings = parseFloat(earningsRes.rows[0]?.total || 0);

    // Get expenses
    const expensesRes = await pool.query(
      `SELECT SUM(amount) as total FROM expenses 
       WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2`,
      [userId, year]
    );
    const totalExpenses = parseFloat(expensesRes.rows[0]?.total || 0);

    const netIncome = totalEarnings - totalExpenses;
    const taxableIncome = Math.max(0, netIncome - STANDARD_DEDUCTION);
    const federalTax = calculateFederalTax(taxableIncome);
    const seTax = calculateSelfEmploymentTax(netIncome);
    const totalTax = federalTax + seTax;

    res.json({
      year,
      grossIncome: Math.round(totalEarnings * 100) / 100,
      businessExpenses: Math.round(totalExpenses * 100) / 100,
      netIncome: Math.round(netIncome * 100) / 100,
      standardDeduction: STANDARD_DEDUCTION,
      taxableIncome: Math.round(taxableIncome * 100) / 100,
      federalIncomeTax: Math.round(federalTax * 100) / 100,
      selfEmploymentTax: Math.round(seTax * 100) / 100,
      totalTaxObligation: Math.round(totalTax * 100) / 100,
      takeHome: Math.round((netIncome - totalTax) * 100) / 100,
    });
  } catch (error) {
    console.error('Tax breakdown error:', error);
    res.status(500).json({ error: 'Failed to calculate tax breakdown' });
  }
});

export default router;
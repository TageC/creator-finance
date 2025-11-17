// frontend/src/pages/Tax.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import api from '../utils/api';

interface TaxData {
  year: number;
  currentQuarter: number;
  totalEarnings: number;
  totalExpenses: number;
  netIncome: number;
  standardDeduction: number;
  taxableIncome: number;
  federalIncomeTax: number;
  selfEmploymentTax: number;
  totalTaxLiability: number;
  quarterlyEstimate: number;
  effectiveTaxRate: number;
  disclaimer: string;
}

interface Deductions {
  category: string;
  amount: number;
}

interface DeductionData {
  year: number;
  deductionsByCategory: Deductions[];
  totalDeductions: number;
  standardDeduction: number;
  deductionSavings: number;
}

const Tax: React.FC = () => {
  const { getToken } = useAuth();
  const [taxData, setTaxData] = useState<TaxData | null>(null);
  const [deductionData, setDeductionData] = useState<DeductionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaxData();
  }, [getToken]);

  const fetchTaxData = async () => {
    try {
      const token = await getToken();
      
      const [taxRes, dedRes] = await Promise.all([
        api.get('/tax/quarterly-estimate', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get('/tax/deductions', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setTaxData(taxRes.data);
      setDeductionData(dedRes.data);
    } catch (error) {
      console.error('Failed to fetch tax data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ marginBottom: '30px', color: '#1a1a2e' }}>📊 Tax Planning</h1>

      {/* Quarterly Estimate Card */}
      {taxData && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: '30px',
          marginBottom: '30px',
          borderLeft: '4px solid #ffa500',
        }}>
          <h2 style={{ marginBottom: '20px', color: '#1a1a2e' }}>Q{taxData.currentQuarter} {taxData.year} Estimated Tax</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '20px',
          }}>
            {/* Quarterly Estimate */}
            <div style={{ padding: '15px', backgroundColor: '#fff9e6', borderRadius: '8px' }}>
              <div style={{ color: '#888', fontSize: '12px', marginBottom: '5px' }}>Quarterly Estimate</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff8c00' }}>
                ${taxData.quarterlyEstimate.toFixed(2)}
              </div>
              <div style={{ color: '#aaa', fontSize: '11px', marginTop: '5px' }}>Per quarter</div>
            </div>

            {/* Annual Total */}
            <div style={{ padding: '15px', backgroundColor: '#ffe6e6', borderRadius: '8px' }}>
              <div style={{ color: '#888', fontSize: '12px', marginBottom: '5px' }}>Annual Tax Liability</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff6b6b' }}>
                ${taxData.totalTaxLiability.toFixed(2)}
              </div>
              <div style={{ color: '#aaa', fontSize: '11px', marginTop: '5px' }}>Total for year</div>
            </div>

            {/* Effective Rate */}
            <div style={{ padding: '15px', backgroundColor: '#e6f3ff', borderRadius: '8px' }}>
              <div style={{ color: '#888', fontSize: '12px', marginBottom: '5px' }}>Effective Tax Rate</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00d4ff' }}>
                {taxData.effectiveTaxRate.toFixed(1)}%
              </div>
              <div style={{ color: '#aaa', fontSize: '11px', marginTop: '5px' }}>Of net income</div>
            </div>
          </div>

          <div style={{ color: '#888', fontSize: '13px', fontStyle: 'italic', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
            ⚠️ {taxData.disclaimer}
          </div>
        </div>
      )}

      {/* Tax Breakdown */}
      {taxData && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: '30px',
          marginBottom: '30px',
        }}>
          <h2 style={{ marginBottom: '20px', color: '#1a1a2e' }}>Tax Breakdown</h2>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ color: '#888' }}>Gross Income</div>
              <div style={{ fontWeight: 'bold', color: '#1a1a2e' }}>${taxData.totalEarnings.toFixed(2)}</div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ color: '#888' }}>Business Expenses</div>
              <div style={{ fontWeight: 'bold', color: '#1a1a2e' }}>-${taxData.totalExpenses.toFixed(2)}</div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ color: '#888' }}>Net Income</div>
              <div style={{ fontWeight: 'bold', color: '#00ff88', fontSize: '18px' }}>${taxData.netIncome.toFixed(2)}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ color: '#888' }}>Standard Deduction</div>
              <div style={{ fontWeight: 'bold', color: '#1a1a2e' }}>-${taxData.standardDeduction}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ color: '#888' }}>Taxable Income</div>
              <div style={{ fontWeight: 'bold', color: '#1a1a2e' }}>${taxData.taxableIncome.toFixed(2)}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ color: '#888' }}>Federal Income Tax</div>
              <div style={{ fontWeight: 'bold', color: '#ff6b6b' }}>${taxData.federalIncomeTax.toFixed(2)}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', borderBottom: '2px solid #ddd' }}>
              <div style={{ color: '#888' }}>Self-Employment Tax</div>
              <div style={{ fontWeight: 'bold', color: '#ff6b6b' }}>${taxData.selfEmploymentTax.toFixed(2)}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ color: '#1a1a2e', fontWeight: 'bold', fontSize: '16px' }}>Total Tax Obligation</div>
              <div style={{ fontWeight: 'bold', color: '#ff6b6b', fontSize: '20px' }}>${taxData.totalTaxLiability.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Deductions Summary */}
      {deductionData && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: '30px',
        }}>
          <h2 style={{ marginBottom: '20px', color: '#1a1a2e' }}>Deductions Summary</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <div style={{ padding: '15px', backgroundColor: '#e6f3ff', borderRadius: '8px' }}>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '5px' }}>Total Deductions</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00d4ff' }}>
                  ${deductionData.totalDeductions.toFixed(2)}
                </div>
              </div>

              <div style={{ padding: '15px', backgroundColor: '#e6ffe6', borderRadius: '8px' }}>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '5px' }}>Tax Savings</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff88' }}>
                  ${deductionData.deductionSavings.toFixed(2)}
                </div>
                <div style={{ color: '#aaa', fontSize: '11px', marginTop: '5px' }}>At 24% bracket</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
              <h3 style={{ color: '#1a1a2e', marginBottom: '15px', fontSize: '14px', fontWeight: 'bold' }}>By Category</h3>
              {deductionData.deductionsByCategory.length > 0 ? (
                deductionData.deductionsByCategory.map((ded, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ color: '#888' }}>{ded.category}</div>
                    <div style={{ fontWeight: 'bold', color: '#1a1a2e' }}>${ded.amount.toFixed(2)}</div>
                  </div>
                ))
              ) : (
                <div style={{ color: '#aaa', fontSize: '14px' }}>No deductions recorded yet</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tax;
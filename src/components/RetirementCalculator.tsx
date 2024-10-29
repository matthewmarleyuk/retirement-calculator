import React, { useState, useEffect } from 'react';
import { Info, PoundSterling, Calculator } from 'lucide-react';

interface CalculatorInputs {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentSavings: number;
  monthlyContributions: number;
  expectedReturn: number;
  inflationRate: number;
  desiredIncome: number;
  includeStatePension: boolean;
}

const DEFAULT_INPUTS: CalculatorInputs = {
  currentAge: 30,
  retirementAge: 65,
  lifeExpectancy: 85,
  currentSavings: 50000,
  monthlyContributions: 500,
  expectedReturn: 7,
  inflationRate: 2,
  desiredIncome: 40000,
  includeStatePension: true,
};

const STATE_PENSION_WEEKLY = 203.85;
const STATE_PENSION_ANNUAL = STATE_PENSION_WEEKLY * 52;

const RetirementCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<{
    totalSavings: number;
    annualIncome: number;
    shortfall: number;
    isShortfall: boolean;
  } | null>(null);

  const calculateRetirement = () => {
    const yearsToInvest = inputs.retirementAge - inputs.currentAge;
    const yearsInRetirement = inputs.lifeExpectancy - inputs.retirementAge;
    
    // Adjust return rate for inflation
    const realReturnRate = (1 + inputs.expectedReturn / 100) / (1 + inputs.inflationRate / 100) - 1;
    
    // Calculate future value of current savings
    const futureSavings = inputs.currentSavings * Math.pow(1 + realReturnRate, yearsToInvest);
    
    // Calculate future value of monthly contributions
    const monthlyRate = realReturnRate / 12;
    const months = yearsToInvest * 12;
    const futureContributions = inputs.monthlyContributions * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    
    const totalSavings = futureSavings + futureContributions;
    
    // Calculate annual withdrawal using 4% rule (simplified)
    const withdrawalRate = 0.04;
    const annualWithdrawal = totalSavings * withdrawalRate;
    
    const statePensionAmount = inputs.includeStatePension ? STATE_PENSION_ANNUAL : 0;
    const totalAnnualIncome = annualWithdrawal + statePensionAmount;
    
    const shortfall = inputs.desiredIncome - totalAnnualIncome;
    
    setResults({
      totalSavings: Math.round(totalSavings),
      annualIncome: Math.round(totalAnnualIncome),
      shortfall: Math.round(Math.abs(shortfall)),
      isShortfall: shortfall > 0,
    });
  };

  useEffect(() => {
    calculateRetirement();
  }, [inputs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value),
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <div className="flex items-center gap-3 mb-8">
        <Calculator className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900">Retirement Calculator</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Personal Details</h2>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                Current Age
                <Info className="w-4 h-4 text-gray-400" />
              </label>
              <input
                type="number"
                name="currentAge"
                value={inputs.currentAge}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min="18"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                Planned Retirement Age
                <Info className="w-4 h-4 text-gray-400" />
              </label>
              <input
                type="number"
                name="retirementAge"
                value={inputs.retirementAge}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min={inputs.currentAge}
                max="100"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                Life Expectancy
                <Info className="w-4 h-4 text-gray-400" />
              </label>
              <input
                type="number"
                name="lifeExpectancy"
                value={inputs.lifeExpectancy}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min={inputs.retirementAge}
                max="120"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Financial Details</h2>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                Current Retirement Savings (£)
                <Info className="w-4 h-4 text-gray-400" />
              </label>
              <div className="relative">
                <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  name="currentSavings"
                  value={inputs.currentSavings}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                Monthly Contributions (£)
                <Info className="w-4 h-4 text-gray-400" />
              </label>
              <div className="relative">
                <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  name="monthlyContributions"
                  value={inputs.monthlyContributions}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                Expected Annual Return (%)
                <Info className="w-4 h-4 text-gray-400" />
              </label>
              <input
                type="number"
                name="expectedReturn"
                value={inputs.expectedReturn}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min="0"
                max="20"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                Expected Inflation Rate (%)
                <Info className="w-4 h-4 text-gray-400" />
              </label>
              <input
                type="number"
                name="inflationRate"
                value={inputs.inflationRate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min="0"
                max="10"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                Desired Annual Retirement Income (£)
                <Info className="w-4 h-4 text-gray-400" />
              </label>
              <div className="relative">
                <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  name="desiredIncome"
                  value={inputs.desiredIncome}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="includeStatePension"
                checked={inputs.includeStatePension}
                onChange={handleInputChange}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Include State Pension ({formatCurrency(STATE_PENSION_ANNUAL)}/year)
              </label>
            </div>
          </div>
        </div>

        {results && (
          <div className="bg-gray-50 p-6 rounded-xl space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Your Retirement Projection</h2>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Total Savings at Retirement</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(results.totalSavings)}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Estimated Annual Income</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(results.annualIncome)}</p>
              </div>
              
              <div className={`bg-white p-4 rounded-lg border ${results.isShortfall ? 'border-red-200' : 'border-green-200'}`}>
                <p className="text-sm text-gray-600">
                  {results.isShortfall ? 'Annual Shortfall' : 'Annual Surplus'}
                </p>
                <p className={`text-2xl font-bold ${results.isShortfall ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(results.shortfall)}
                </p>
              </div>
            </div>

            {results.isShortfall && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-2">Suggestions to Close the Gap</h3>
                <ul className="text-sm text-amber-700 space-y-2">
                  <li>• Consider increasing your monthly contributions</li>
                  <li>• Look into delaying retirement by a few years</li>
                  <li>• Review your investment strategy for potentially higher returns</li>
                  <li>• Adjust your desired retirement income expectations</li>
                </ul>
              </div>
            )}

            <div className="text-xs text-gray-500">
              <p>* These calculations are estimates based on your inputs and assumptions.</p>
              <p>* The results should not be considered as financial advice.</p>
              <p>* Consult with a financial advisor for personalized retirement planning.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetirementCalculator;
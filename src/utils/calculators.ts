// Real Estate Calculators Math Utility functions

// 1. ROI Calculator
export interface RoiInput {
  purchasePrice: number;
  salePrice: number;
  holdingPeriodMonths: number;
  additionalCosts: number; // e.g. registry, taxes, agent commission
}

export interface RoiResult {
  totalProfit: number;
  totalPercentageReturn: number;
  annualizedRoi: number;
}

export function calculateROI(input: RoiInput): RoiResult {
  const { purchasePrice, salePrice, holdingPeriodMonths, additionalCosts } = input;
  const totalInvestment = purchasePrice + additionalCosts;
  const totalProfit = salePrice - totalInvestment;
  const totalPercentageReturn = (totalProfit / totalInvestment) * 100;
  
  // Annualized return formula: ((SalePrice / TotalInvestment) ^ (12 / HoldingPeriodMonths) - 1) * 100
  const holdingPeriodYears = holdingPeriodMonths / 12;
  let annualizedRoi = 0;
  if (holdingPeriodYears > 0 && totalInvestment > 0) {
    annualizedRoi = (Math.pow(salePrice / totalInvestment, 1 / holdingPeriodYears) - 1) * 100;
  }

  return {
    totalProfit: Math.round(totalProfit),
    totalPercentageReturn: Number(totalPercentageReturn.toFixed(2)),
    annualizedRoi: Number(annualizedRoi.toFixed(2))
  };
}

// 2. Rental Yield Calculator
export interface RentalYieldInput {
  propertyValue: number;
  monthlyRent: number;
  annualExpenses: number; // maintenance, taxes, management
}

export interface RentalYieldResult {
  grossYield: number;
  netYield: number;
  annualRentalIncome: number;
}

export function calculateRentalYield(input: RentalYieldInput): RentalYieldResult {
  const { propertyValue, monthlyRent, annualExpenses } = input;
  const annualRentalIncome = monthlyRent * 12;
  const grossYield = (annualRentalIncome / propertyValue) * 100;
  const netYield = ((annualRentalIncome - annualExpenses) / propertyValue) * 100;

  return {
    grossYield: Number(grossYield.toFixed(2)),
    netYield: Number(netYield.toFixed(2)),
    annualRentalIncome
  };
}

// 3. Home Loan Calculator
export interface HomeLoanInput {
  propertyValue: number;
  downPaymentPercentage: number;
  interestRateAnnual: number;
  loanTermYears: number;
}

export interface HomeLoanResult {
  loanAmount: number;
  monthlyPayment: number;
  totalInterestPaid: number;
  totalPayment: number;
  downPaymentAmount: number;
}

export function calculateHomeLoan(input: HomeLoanInput): HomeLoanResult {
  const { propertyValue, downPaymentPercentage, interestRateAnnual, loanTermYears } = input;
  const downPaymentAmount = (propertyValue * downPaymentPercentage) / 100;
  const loanAmount = propertyValue - downPaymentAmount;
  
  const monthlyInterestRate = (interestRateAnnual / 100) / 12;
  const numberOfPayments = loanTermYears * 12;

  let monthlyPayment = 0;
  if (monthlyInterestRate === 0) {
    monthlyPayment = loanAmount / numberOfPayments;
  } else {
    // Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    monthlyPayment = 
      (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  }

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterestPaid = totalPayment - loanAmount;

  return {
    loanAmount: Math.round(loanAmount),
    monthlyPayment: Math.round(monthlyPayment),
    totalInterestPaid: Math.round(totalInterestPaid),
    totalPayment: Math.round(totalPayment),
    downPaymentAmount: Math.round(downPaymentAmount)
  };
}

// 4. Construction Cost Calculator
export type ConstructionGrade = "A+" | "A" | "B";

export interface ConstructionCostInput {
  coveredAreaSft: number; // Total covered area in square feet
  grade: ConstructionGrade;
  structureType: "Gray Structure Only" | "Turnkey (Finished)";
}

export interface ConstructionCostResult {
  materialCost: number;
  laborCost: number;
  totalCost: number;
  costPerSft: number;
}

export function calculateConstructionCost(input: ConstructionCostInput): ConstructionCostResult {
  const { coveredAreaSft, grade, structureType } = input;
  
  // Rate matrix (PKR per square foot)
  // Grade definitions: A+ (Premium imported), A (High-quality local), B (Standard local)
  let baseRate = 0;
  if (structureType === "Gray Structure Only") {
    if (grade === "A+") baseRate = 2600;
    else if (grade === "A") baseRate = 2200;
    else baseRate = 1800;
  } else {
    // Turnkey (Finished)
    if (grade === "A+") baseRate = 5500;
    else if (grade === "A") baseRate = 4500;
    else baseRate = 3800;
  }

  const totalCost = baseRate * coveredAreaSft;
  // Standard split: 65% Material, 35% Labor
  const materialCost = totalCost * 0.65;
  const laborCost = totalCost * 0.35;

  return {
    materialCost: Math.round(materialCost),
    laborCost: Math.round(laborCost),
    totalCost: Math.round(totalCost),
    costPerSft: baseRate
  };
}

// 5. Area Converter
export type AreaUnit = "Marla" | "Kanal" | "Square Feet" | "Acre" | "Square Yard";

// Converters (using Pakistan standard: 1 Marla = 225 Sq Ft or 272 Sq Ft.
// DHA and mainstream societies use the 1 Marla = 225 Sq Ft standard.
// 1 Kanal = 20 Marla = 4500 Sq Ft.
// 1 Acre = 8 Kanal = 160 Marla = 36,000 Sq Ft.
const UNIT_TO_SQFT: Record<AreaUnit, number> = {
  "Marla": 225,
  "Kanal": 4500,
  "Square Feet": 1,
  "Acre": 36000,
  "Square Yard": 9
};

export function convertArea(amount: number, from: AreaUnit, to: AreaUnit): number {
  if (amount <= 0 || isNaN(amount)) return 0;
  const inSqFt = amount * UNIT_TO_SQFT[from];
  const converted = inSqFt / UNIT_TO_SQFT[to];
  return Number(converted.toFixed(4));
}

// 5b. Area Converter Pro
export type ProAreaUnit = "Marla" | "Kanal" | "Sq Ft" | "Sq Yard" | "Acre" | "Hectare" | "Square Meter";

export interface ConversionTableEntry {
  unit: ProAreaUnit;
  value: number;
  label: string;
  isPakistan: boolean;
}

export const PRO_UNIT_DETAILS: Record<ProAreaUnit, { label: string; toSqFt: number; isPakistan: boolean }> = {
  "Marla": { label: "Marla", toSqFt: 225, isPakistan: true },
  "Kanal": { label: "Kanal", toSqFt: 4500, isPakistan: true },
  "Sq Ft": { label: "Square Feet", toSqFt: 1, isPakistan: true },
  "Sq Yard": { label: "Square Yard", toSqFt: 9, isPakistan: true },
  "Acre": { label: "Acre (Int'l)", toSqFt: 43560, isPakistan: false },
  "Hectare": { label: "Hectare", toSqFt: 107639.104, isPakistan: false },
  "Square Meter": { label: "Square Meter", toSqFt: 10.7639104, isPakistan: false }
};

export function convertAreaPro(amount: number, from: ProAreaUnit): ConversionTableEntry[] {
  if (amount <= 0 || isNaN(amount)) {
    return (Object.keys(PRO_UNIT_DETAILS) as ProAreaUnit[]).map((unit) => ({
      unit,
      value: 0,
      label: PRO_UNIT_DETAILS[unit].label,
      isPakistan: PRO_UNIT_DETAILS[unit].isPakistan
    }));
  }
  const inSqFt = amount * PRO_UNIT_DETAILS[from].toSqFt;
  
  return (Object.keys(PRO_UNIT_DETAILS) as ProAreaUnit[]).map((unit) => {
    const details = PRO_UNIT_DETAILS[unit];
    const converted = inSqFt / details.toSqFt;
    // For small decimals, use up to 6 decimal places, but strip trailing zeros
    const rounded = Number(converted.toFixed(6));
    return {
      unit,
      value: rounded,
      label: details.label,
      isPakistan: details.isPakistan
    };
  });
}


// 6. Professional Construction Cost Calculator
export interface ProfessionalConstructionInput {
  plotSize: number;
  unit: "Marla" | "Kanal" | "Sq Ft" | "Sq Yard";
  constructionType: "Grey Structure" | "Complete House";
  houseType: "Single Story" | "Double Story" | "Triple Story";
  qualityLevel: "Economy" | "Standard" | "Premium" | "Luxury";
  hasBasement: boolean;
  hasPool: boolean;
  hasSolar: boolean;
  hasSmartHome: boolean;
}

export interface ProfessionalConstructionResult {
  coveredAreaSqFt: number;
  greyCost: number;
  finishingCost: number;
  totalCost: number;
  costPerSqFt: number;
  timelineMonths: number;
  materialBreakdown: {
    cement: number;
    steel: number;
    sand: number;
    crush: number;
    tiles: number;
    paint: number;
    plumbing: number;
    electrical: number;
    other: number;
  };
}

export function calculateProfessionalConstruction(input: ProfessionalConstructionInput): ProfessionalConstructionResult {
  const {
    plotSize,
    unit,
    constructionType,
    houseType,
    qualityLevel,
    hasBasement,
    hasPool,
    hasSolar,
    hasSmartHome
  } = input;

  // 1. Calculate Plot Size in Sq Ft
  let plotAreaSqFt = plotSize;
  if (unit === "Marla") {
    plotAreaSqFt = plotSize * 225;
  } else if (unit === "Kanal") {
    plotAreaSqFt = plotSize * 4500;
  } else if (unit === "Sq Yard") {
    plotAreaSqFt = plotSize * 9;
  }

  // 2. Calculate Covered Area in Sq Ft
  let storyFactor = 0.633333;
  if (houseType === "Double Story") storyFactor = 1.266667;
  else if (houseType === "Triple Story") storyFactor = 1.857778;

  let coveredAreaSqFt = plotAreaSqFt * storyFactor;
  if (hasBasement) {
    coveredAreaSqFt += plotAreaSqFt * 0.70; // Basement adds 70% plot size covered area
  }

  // 3. Cost Per Sq Ft Rates based on Quality Level
  let greyRate = 0;
  let finishingRate = 0;

  if (qualityLevel === "Economy") {
    greyRate = 2450;
    finishingRate = 1950;
  } else if (qualityLevel === "Standard") {
    greyRate = 3000;
    finishingRate = 2600;
  } else if (qualityLevel === "Premium") {
    greyRate = 3350;
    finishingRate = 3450;
  } else {
    // Luxury
    greyRate = 4100;
    finishingRate = 5000;
  }

  // 4. Base Costs
  let greyCost = coveredAreaSqFt * greyRate;
  let finishingCost = constructionType === "Complete House" ? coveredAreaSqFt * finishingRate : 0;

  // 5. Add Additional Features flat costs
  let additionalCost = 0;
  
  if (hasPool) {
    if (qualityLevel === "Economy") additionalCost += 1200000;
    else if (qualityLevel === "Standard") additionalCost += 1800000;
    else if (qualityLevel === "Premium") additionalCost += 2600000;
    else additionalCost += 3600000;
  }

  if (hasSolar) {
    if (qualityLevel === "Economy") additionalCost += 500000; // 5kW basic
    else if (qualityLevel === "Standard") additionalCost += 900000; // 10kW standard
    else if (qualityLevel === "Premium") additionalCost += 1400000; // 15kW premium
    else additionalCost += 2200000; // 20kW luxury hybrid
  }

  if (hasSmartHome) {
    if (qualityLevel === "Economy") additionalCost += 150000;
    else if (qualityLevel === "Standard") additionalCost += 450000;
    else if (qualityLevel === "Premium") additionalCost += 950000;
    else additionalCost += 1900000;
  }

  // Apply additional features costs proportionately
  if (constructionType === "Complete House") {
    // Split additional features: 40% structure/piping, 60% finishings/gear
    greyCost += additionalCost * 0.40;
    finishingCost += additionalCost * 0.60;
  } else {
    // Only structure parts of features count
    greyCost += additionalCost * 0.40;
  }

  const totalCost = greyCost + finishingCost;
  const costPerSqFt = totalCost / coveredAreaSqFt;

  // 6. Timeline Estimation (Months)
  let timelineMonths = 8;
  if (houseType === "Double Story") timelineMonths = 12;
  else if (houseType === "Triple Story") timelineMonths = 16;
  
  if (hasBasement) timelineMonths += 3;
  if (hasPool) timelineMonths += 1;
  if (qualityLevel === "Luxury") timelineMonths += 1; // luxury needs more time for custom finishing

  // 7. Material Breakdown
  // Percentages mapped from greyCost and finishingCost
  const materialBreakdown = {
    cement: greyCost * 0.16,
    steel: greyCost * 0.20,
    sand: greyCost * 0.06,
    crush: greyCost * 0.08,
    tiles: finishingCost * 0.24,
    paint: finishingCost * 0.18,
    plumbing: (greyCost * 0.10) + (finishingCost * 0.15),
    electrical: (greyCost * 0.08) + (finishingCost * 0.13),
    other: 0
  };

  const summedBreakdown = 
    materialBreakdown.cement + 
    materialBreakdown.steel + 
    materialBreakdown.sand + 
    materialBreakdown.crush + 
    materialBreakdown.tiles + 
    materialBreakdown.paint + 
    materialBreakdown.plumbing + 
    materialBreakdown.electrical;

  materialBreakdown.other = totalCost - summedBreakdown;

  return {
    coveredAreaSqFt: Math.round(coveredAreaSqFt),
    greyCost: Math.round(greyCost),
    finishingCost: Math.round(finishingCost),
    totalCost: Math.round(totalCost),
    costPerSqFt: Math.round(costPerSqFt),
    timelineMonths,
    materialBreakdown: {
      cement: Math.round(materialBreakdown.cement),
      steel: Math.round(materialBreakdown.steel),
      sand: Math.round(materialBreakdown.sand),
      crush: Math.round(materialBreakdown.crush),
      tiles: Math.round(materialBreakdown.tiles),
      paint: Math.round(materialBreakdown.paint),
      plumbing: Math.round(materialBreakdown.plumbing),
      electrical: Math.round(materialBreakdown.electrical),
      other: Math.round(materialBreakdown.other)
    }
  };
}

// 7. Property Value Calculator
export interface PropertyValueInput {
  area: number;
  unit: "Marla" | "Kanal" | "Sq Ft" | "Sq Yard";
  pricePerUnit: number;
}

export interface PropertyValueResult {
  baseValue: number;
  registryFee: number;
  transferTax: number;
  agentCommission: number;
  localTax: number;
  totalInvestment: number;
  marketValueMin: number;
  marketValueMax: number;
}

export function calculatePropertyValue(input: PropertyValueInput): PropertyValueResult {
  const { area, pricePerUnit } = input;
  const baseValue = area * pricePerUnit;
  
  const registryFee = baseValue * 0.015; // 1.5%
  const transferTax = baseValue * 0.02; // 2%
  const agentCommission = baseValue * 0.01; // 1%
  const localTax = baseValue * 0.01; // 1%
  
  const totalInvestment = baseValue + registryFee + transferTax + agentCommission + localTax;
  
  // Market Value Range (-3% to +5% fluctuation based on standard comps)
  const marketValueMin = baseValue * 0.97;
  const marketValueMax = baseValue * 1.05;

  return {
    baseValue: Math.round(baseValue),
    registryFee: Math.round(registryFee),
    transferTax: Math.round(transferTax),
    agentCommission: Math.round(agentCommission),
    localTax: Math.round(localTax),
    totalInvestment: Math.round(totalInvestment),
    marketValueMin: Math.round(marketValueMin),
    marketValueMax: Math.round(marketValueMax)
  };
}


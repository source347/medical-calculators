import { Calculator, CalculationResult } from '../types';

export const CALCULATORS: Calculator[] = [
  // --- GENERAL ---
  {
    id: 'bmi',
    name: 'Body Mass Index (BMI)',
    shortName: 'BMI',
    description: 'Screen for weight categories.',
    category: 'General',
    inputs: [
      { id: 'weight', label: 'Weight', type: 'number', unit: 'kg', min: 1, max: 500, defaultValue: 70 },
      { id: 'height', label: 'Height', type: 'number', unit: 'cm', min: 1, max: 300, defaultValue: 175 },
    ],
    calculate: (values) => {
      const hM = values.height / 100;
      const bmi = values.weight / (hM * hM);
      const rounded = parseFloat(bmi.toFixed(1));
      let severity: CalculationResult['severity'] = 'info';
      let interp = '';
      if (rounded < 18.5) { severity = 'warning'; interp = 'Underweight'; }
      else if (rounded < 25) { severity = 'normal'; interp = 'Normal weight'; }
      else if (rounded < 30) { severity = 'warning'; interp = 'Overweight'; }
      else { severity = 'critical'; interp = 'Obese'; }
      return { value: rounded, unit: 'kg/m²', severity, interpretation: interp };
    },
  },
  {
    id: 'bsa_mosteller',
    name: 'Body Surface Area (Mosteller)',
    shortName: 'BSA',
    description: 'Estimates total body surface area.',
    category: 'General',
    inputs: [
      { id: 'weight', label: 'Weight', type: 'number', unit: 'kg', defaultValue: 70 },
      { id: 'height', label: 'Height', type: 'number', unit: 'cm', defaultValue: 175 },
    ],
    calculate: (values) => {
      const bsa = Math.sqrt((values.weight * values.height) / 3600);
      return { value: parseFloat(bsa.toFixed(2)), unit: 'm²', severity: 'normal', interpretation: 'Total body surface area' };
    }
  },
  {
    id: 'ibw',
    name: 'Ideal Body Weight (Devine)',
    shortName: 'IBW',
    description: 'Calculates ideal body weight based on height.',
    category: 'General',
    inputs: [
      { id: 'height', label: 'Height', type: 'number', unit: 'cm', defaultValue: 175 },
      { id: 'sex', label: 'Sex', type: 'select', options: [{label:'Male', value:'m'}, {label:'Female', value:'f'}], defaultValue: 'm' },
    ],
    calculate: ({height, sex}) => {
      const inches = height / 2.54;
      const base = sex === 'm' ? 50 : 45.5;
      const ibw = base + 2.3 * (inches - 60);
      return { value: parseFloat(ibw.toFixed(1)), unit: 'kg', severity: 'normal', interpretation: 'Ideal Body Weight' };
    }
  },
  {
    id: 'adj_bw',
    name: 'Adjusted Body Weight',
    shortName: 'AdjBW',
    description: 'For dosing in obese patients.',
    category: 'General',
    inputs: [
      { id: 'weight', label: 'Actual Weight', type: 'number', unit: 'kg', defaultValue: 100 },
      { id: 'ibw', label: 'Ideal Body Weight', type: 'number', unit: 'kg', defaultValue: 70 },
    ],
    calculate: ({weight, ibw}) => {
      const abw = ibw + 0.4 * (weight - ibw);
      return { value: parseFloat(abw.toFixed(1)), unit: 'kg', severity: 'info', interpretation: 'Dosing Weight' };
    }
  },
  {
    id: 'harris_benedict',
    name: 'Basal Metabolic Rate (Harris-Benedict)',
    shortName: 'BMR',
    description: 'Daily calorie needs at rest.',
    category: 'General',
    inputs: [
      { id: 'weight', label: 'Weight', type: 'number', unit: 'kg', defaultValue: 70 },
      { id: 'height', label: 'Height', type: 'number', unit: 'cm', defaultValue: 175 },
      { id: 'age', label: 'Age', type: 'number', defaultValue: 30 },
      { id: 'sex', label: 'Sex', type: 'select', options: [{label:'Male', value:'m'}, {label:'Female', value:'f'}], defaultValue: 'm' },
    ],
    calculate: ({weight, height, age, sex}) => {
      let bmr = 0;
      if (sex === 'm') bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
      else bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
      return { value: Math.round(bmr), unit: 'kcal/day', severity: 'info', interpretation: 'Basal Metabolic Rate' };
    },
  },

  // --- CARDIOLOGY ---
  {
    id: 'map',
    name: 'Mean Arterial Pressure (MAP)',
    shortName: 'MAP',
    description: 'Average arterial pressure.',
    category: 'Cardiology',
    inputs: [
      { id: 'sbp', label: 'Systolic BP', type: 'number', unit: 'mmHg', defaultValue: 120 },
      { id: 'dbp', label: 'Diastolic BP', type: 'number', unit: 'mmHg', defaultValue: 80 },
    ],
    calculate: ({ sbp, dbp }) => {
      const map = (sbp + 2 * dbp) / 3;
      return { value: parseFloat(map.toFixed(1)), unit: 'mmHg', severity: map < 65 ? 'critical' : 'normal', interpretation: map < 65 ? 'Hypoperfusion Risk' : 'Adequate' };
    }
  },
  {
    id: 'cha2ds2_vasc',
    name: 'CHA₂DS₂-VASc Score',
    shortName: 'CHA₂DS₂-VASc',
    description: 'Atrial fibrillation stroke risk.',
    category: 'Cardiology',
    inputs: [
      { id: 'age', label: 'Age', type: 'select', options: [{ label: '< 65', value: 0 }, { label: '65-74', value: 1 }, { label: '≥ 75', value: 2 }], defaultValue: 0 },
      { id: 'sex', label: 'Sex', type: 'select', options: [{ label: 'Male', value: 0 }, { label: 'Female', value: 1 }], defaultValue: 0 },
      { id: 'chf', label: 'CHF History', type: 'boolean', defaultValue: false },
      { id: 'htn', label: 'Hypertension', type: 'boolean', defaultValue: false },
      { id: 'stroke', label: 'Stroke/TIA', type: 'boolean', defaultValue: false },
      { id: 'vasc', label: 'Vascular Disease', type: 'boolean', defaultValue: false },
      { id: 'dm', label: 'Diabetes', type: 'boolean', defaultValue: false },
    ],
    calculate: (values) => {
      let score = parseInt(values.age) + parseInt(values.sex);
      if (values.chf) score += 1;
      if (values.htn) score += 1;
      if (values.stroke) score += 2;
      if (values.vasc) score += 1;
      if (values.dm) score += 1;
      return { value: score, unit: 'points', severity: score >= 2 ? 'critical' : 'normal', interpretation: score >= 2 ? 'Anticoagulation recommended' : 'Low/Moderate Risk' };
    }
  },
  {
    id: 'timi_nstemi',
    name: 'TIMI Risk Score (UA/NSTEMI)',
    shortName: 'TIMI (NSTEMI)',
    description: 'Risk stratification for Unstable Angina/NSTEMI.',
    category: 'Cardiology',
    inputs: [
      { id: 'age', label: 'Age ≥ 65', type: 'boolean', defaultValue: false },
      { id: 'rf', label: '≥ 3 CAD Risk Factors', type: 'boolean', defaultValue: false },
      { id: 'cad', label: 'Known CAD (Stenosis ≥ 50%)', type: 'boolean', defaultValue: false },
      { id: 'asa', label: 'Aspirin use in last 7 days', type: 'boolean', defaultValue: false },
      { id: 'angina', label: 'Severe Angina (≥2 episodes/24h)', type: 'boolean', defaultValue: false },
      { id: 'st', label: 'ST deviation ≥ 0.5mm', type: 'boolean', defaultValue: false },
      { id: 'markers', label: '+ Cardiac Markers', type: 'boolean', defaultValue: false },
    ],
    calculate: (v) => {
      const score = Object.values(v).filter(x => x === true).length;
      let risk = '';
      if(score <= 2) risk = 'Low (4.7-8.3% Risk)';
      else if(score <= 4) risk = 'Intermediate (13.2-19.9% Risk)';
      else risk = 'High (26.2-40.9% Risk)';
      return { value: score, unit: 'points', severity: score > 4 ? 'critical' : (score > 2 ? 'warning' : 'normal'), interpretation: risk };
    }
  },
  {
    id: 'heart_score',
    name: 'HEART Score',
    shortName: 'HEART',
    description: 'Chest pain risk stratification.',
    category: 'Cardiology',
    inputs: [
      { id: 'h', label: 'History', type: 'select', options: [{label:'Slightly', value:0}, {label:'Moderately', value:1}, {label:'Highly', value:2}], defaultValue: 0 },
      { id: 'e', label: 'ECG', type: 'select', options: [{label:'Normal', value:0}, {label:'Non-specific', value:1}, {label:'ST depression', value:2}], defaultValue: 0 },
      { id: 'a', label: 'Age', type: 'select', options: [{label:'<45', value:0}, {label:'45-65', value:1}, {label:'>65', value:2}], defaultValue: 0 },
      { id: 'r', label: 'Risk Factors', type: 'select', options: [{label:'None', value:0}, {label:'1-2', value:1}, {label:'>=3', value:2}], defaultValue: 0 },
      { id: 't', label: 'Troponin', type: 'select', options: [{label:'Normal', value:0}, {label:'1-3x limit', value:1}, {label:'>3x limit', value:2}], defaultValue: 0 },
    ],
    calculate: (v) => {
      const score = Number(v.h) + Number(v.e) + Number(v.a) + Number(v.r) + Number(v.t);
      return { value: score, unit: 'points', severity: score > 3 ? 'critical' : 'normal', interpretation: score <= 3 ? 'Discharge Permissible' : 'Admission Indicated' };
    }
  },
  {
    id: 'qtc_bazett',
    name: 'QTc Interval (Bazett)',
    shortName: 'QTc',
    description: 'Corrected QT interval.',
    category: 'Cardiology',
    inputs: [
        { id: 'qt', label: 'QT Interval', type: 'number', unit: 'ms', defaultValue: 350 },
        { id: 'hr', label: 'Heart Rate', type: 'number', unit: 'bpm', defaultValue: 70 },
    ],
    calculate: ({qt, hr}) => {
        const qtc = qt / Math.sqrt(60/hr);
        return { value: Math.round(qtc), unit: 'ms', severity: qtc > 450 ? 'warning' : 'normal', interpretation: qtc > 500 ? 'High TdP risk' : 'Normal/Borderline' };
    }
  },
  {
    id: 'duke_criteria',
    name: 'Duke Criteria (Infective Endocarditis)',
    shortName: 'Duke Criteria',
    description: 'Diagnostic criteria for IE.',
    category: 'Cardiology',
    inputs: [
      { id: 'major', label: 'Major Criteria Count', type: 'number', min: 0, max: 2, defaultValue: 0 },
      { id: 'minor', label: 'Minor Criteria Count', type: 'number', min: 0, max: 5, defaultValue: 0 },
    ],
    calculate: ({major, minor}) => {
      let dx = 'Rejected';
      if (major === 2 || (major === 1 && minor >= 3) || minor === 5) dx = 'Definite IE';
      else if (major === 1 && minor >= 1 || minor >= 3) dx = 'Possible IE';
      return { value: dx, unit: '', severity: dx === 'Definite IE' ? 'critical' : 'normal', interpretation: 'Diagnostic Classification' };
    }
  },
  {
    id: 'ldl_calc',
    name: 'LDL Calculated',
    shortName: 'LDL',
    description: 'Friedewald equation.',
    category: 'Cardiology',
    inputs: [
        { id: 'total', label: 'Total Chol', type: 'number', unit: 'mg/dL', defaultValue: 200 },
        { id: 'hdl', label: 'HDL', type: 'number', unit: 'mg/dL', defaultValue: 50 },
        { id: 'trig', label: 'Triglycerides', type: 'number', unit: 'mg/dL', defaultValue: 100 },
    ],
    calculate: ({total, hdl, trig}) => {
        if(trig >= 400) return { value: 'N/A', severity: 'info', interpretation: 'Invalid if Trig > 400' };
        const ldl = total - hdl - (trig/5);
        return { value: Math.round(ldl), unit: 'mg/dL', severity: ldl > 130 ? 'warning' : 'normal', interpretation: ldl > 160 ? 'High' : 'Optimal/Borderline' };
    }
  },

  // --- NEPHROLOGY ---
  {
    id: 'egfr_ckd_epi',
    name: 'eGFR (CKD-EPI 2021)',
    shortName: 'eGFR',
    description: 'Kidney function estimate.',
    category: 'Nephrology',
    inputs: [
      { id: 'scr', label: 'Creatinine', type: 'number', unit: 'mg/dL', defaultValue: 1.0 },
      { id: 'age', label: 'Age', type: 'number', defaultValue: 50 },
      { id: 'sex', label: 'Sex', type: 'select', options: [{ label: 'Male', value: 'm' }, { label: 'Female', value: 'f' }], defaultValue: 'm' },
    ],
    calculate: ({scr, age, sex}) => {
      let k = 0.9, a = -0.302, f = 1;
      if (sex === 'f') { k = 0.7; a = -0.241; f = 1.012; }
      const ratio = scr / k;
      const egfr = 142 * Math.pow(Math.min(ratio, 1), a) * Math.pow(Math.max(ratio, 1), -1.2) * Math.pow(0.9938, age) * f;
      return { value: Math.round(egfr), unit: 'mL/min/1.73m²', severity: egfr < 60 ? 'warning' : 'normal', interpretation: egfr < 15 ? 'Kidney Failure' : (egfr < 60 ? 'CKD' : 'Normal') };
    }
  },
  {
    id: 'cockcroft_gault',
    name: 'Creatinine Clearance (Cockcroft-Gault)',
    shortName: 'CrCl',
    description: 'Drug dosing renal function.',
    category: 'Nephrology',
    inputs: [
        { id: 'age', label: 'Age', type: 'number', defaultValue: 50 },
        { id: 'weight', label: 'Weight', type: 'number', unit: 'kg', defaultValue: 70 },
        { id: 'scr', label: 'Creatinine', type: 'number', unit: 'mg/dL', defaultValue: 1.0 },
        { id: 'sex', label: 'Sex', type: 'select', options: [{label:'Male', value:'m'}, {label:'Female', value:'f'}], defaultValue: 'm' }
    ],
    calculate: ({age, weight, scr, sex}) => {
        let crcl = ((140 - age) * weight) / (72 * scr);
        if(sex === 'f') crcl *= 0.85;
        return { value: parseFloat(crcl.toFixed(1)), unit: 'mL/min', severity: crcl < 60 ? 'warning' : 'normal', interpretation: 'Estimated Clearance' };
    }
  },
  {
    id: 'anion_gap',
    name: 'Anion Gap',
    shortName: 'Anion Gap',
    description: 'Metabolic acidosis evaluation.',
    category: 'Nephrology',
    inputs: [
        { id: 'na', label: 'Na', type: 'number', defaultValue: 140 },
        { id: 'cl', label: 'Cl', type: 'number', defaultValue: 104 },
        { id: 'hco3', label: 'HCO3', type: 'number', defaultValue: 24 },
    ],
    calculate: ({na, cl, hco3}) => {
        const ag = na - (cl + hco3);
        return { value: Math.round(ag), unit: 'mEq/L', severity: ag > 12 ? 'warning' : 'normal', interpretation: ag > 12 ? 'HAGMA' : 'Normal' };
    }
  },
  {
    id: 'delta_gap',
    name: 'Delta Gap',
    shortName: 'Delta Gap',
    description: 'Checks for mixed acid-base disorders.',
    category: 'Nephrology',
    inputs: [
        { id: 'ag', label: 'Anion Gap', type: 'number', defaultValue: 20 },
        { id: 'hco3', label: 'HCO3', type: 'number', defaultValue: 14 },
    ],
    calculate: ({ag, hco3}) => {
        const delta = (ag - 12) + hco3;
        return { value: Math.round(delta), unit: 'mEq/L', severity: 'info', interpretation: delta > 30 ? 'Metabolic Alkalosis also present' : (delta < 18 ? 'Non-AG Acidosis also present' : 'Pure HAGMA') };
    }
  },
  {
    id: 'fena',
    name: 'FENa',
    shortName: 'FENa',
    description: 'Fractional Excretion of Sodium.',
    category: 'Nephrology',
    inputs: [
        { id: 'sna', label: 'Serum Na', type: 'number', defaultValue: 140 },
        { id: 'scr', label: 'Serum Cr', type: 'number', defaultValue: 1.5 },
        { id: 'una', label: 'Urine Na', type: 'number', defaultValue: 20 },
        { id: 'ucr', label: 'Urine Cr', type: 'number', defaultValue: 40 },
    ],
    calculate: ({sna, scr, una, ucr}) => {
        const fena = (una * scr) / (sna * ucr) * 100;
        return { value: parseFloat(fena.toFixed(2)), unit: '%', severity: fena < 1 ? 'warning' : 'normal', interpretation: fena < 1 ? 'Prerenal' : (fena > 2 ? 'Intrinsic (ATN)' : 'Indeterminate') };
    }
  },
  {
    id: 'urine_output',
    name: 'Urine Output Rate',
    shortName: 'UOP',
    description: 'Renal perfusion monitoring.',
    category: 'Nephrology',
    inputs: [
        { id: 'vol', label: 'Total Volume', type: 'number', unit: 'mL', defaultValue: 500 },
        { id: 'hours', label: 'Time Period', type: 'number', unit: 'hrs', defaultValue: 6 },
        { id: 'weight', label: 'Weight', type: 'number', unit: 'kg', defaultValue: 70 },
    ],
    calculate: ({vol, hours, weight}) => {
        const uop = vol / weight / hours;
        return { value: parseFloat(uop.toFixed(1)), unit: 'mL/kg/hr', severity: uop < 0.5 ? 'critical' : 'normal', interpretation: uop < 0.5 ? 'Oliguria' : 'Adequate' };
    }
  },
  {
    id: 'osmolality',
    name: 'Serum Osmolality',
    shortName: 'Osmolality',
    description: 'Calculated serum osmolality.',
    category: 'Nephrology',
    inputs: [
        { id: 'na', label: 'Na', type: 'number', defaultValue: 140 },
        { id: 'glc', label: 'Glucose', type: 'number', defaultValue: 90 },
        { id: 'bun', label: 'BUN', type: 'number', defaultValue: 15 },
        { id: 'etoh', label: 'Ethanol (opt)', type: 'number', defaultValue: 0 },
    ],
    calculate: ({na, glc, bun, etoh}) => {
        const osm = 2 * na + (glc / 18) + (bun / 2.8) + (etoh / 4.6);
        return { value: Math.round(osm), unit: 'mOsm/kg', severity: 'normal', interpretation: 'Normal range: 275-295' };
    }
  },
  {
    id: 'bun_cr_ratio',
    name: 'BUN/Creatinine Ratio',
    shortName: 'BUN:Cr',
    description: 'Differentiates prerenal/intrinsic AKI.',
    category: 'Nephrology',
    inputs: [
        { id: 'bun', label: 'BUN', type: 'number', defaultValue: 20 },
        { id: 'cr', label: 'Creatinine', type: 'number', defaultValue: 1.0 },
    ],
    calculate: ({bun, cr}) => {
        const ratio = bun / cr;
        return { value: Math.round(ratio), unit: '', severity: 'info', interpretation: ratio > 20 ? 'Suggests Prerenal' : 'Suggests Intrinsic' };
    }
  },
  {
    id: 'free_water_deficit',
    name: 'Free Water Deficit',
    shortName: 'H2O Deficit',
    description: 'Hypernatremia correction.',
    category: 'Nephrology',
    inputs: [
        { id: 'na', label: 'Na', type: 'number', defaultValue: 155 },
        { id: 'weight', label: 'Weight', type: 'number', unit: 'kg', defaultValue: 70 },
        { id: 'sex', label: 'Sex', type: 'select', options: [{label:'Male', value:0.6}, {label:'Female', value:0.5}], defaultValue: 0.6 }
    ],
    calculate: ({na, weight, sex}) => {
        const deficit = parseFloat(sex) * weight * ((na/140) - 1);
        return { value: parseFloat(deficit.toFixed(1)), unit: 'L', severity: 'warning', interpretation: 'Water Deficit' };
    }
  },
  {
    id: 'sodium_deficit',
    name: 'Sodium Deficit',
    shortName: 'Na Deficit',
    description: 'Hyponatremia correction.',
    category: 'Nephrology',
    inputs: [
        { id: 'target', label: 'Target Na', type: 'number', defaultValue: 130 },
        { id: 'current', label: 'Current Na', type: 'number', defaultValue: 120 },
        { id: 'weight', label: 'Weight', type: 'number', unit: 'kg', defaultValue: 70 },
        { id: 'sex', label: 'Sex', type: 'select', options: [{label:'Male', value:0.6}, {label:'Female', value:0.5}], defaultValue: 0.6 }
    ],
    calculate: ({target, current, weight, sex}) => {
        const deficit = parseFloat(sex) * weight * (target - current);
        return { value: Math.round(deficit), unit: 'mEq', severity: 'info', interpretation: 'Total Na required' };
    }
  },
  {
    id: 'winter_formula',
    name: 'Winter’s Formula',
    shortName: 'Winter’s',
    description: 'Expected PCO2 in metabolic acidosis.',
    category: 'Nephrology',
    inputs: [
        { id: 'hco3', label: 'HCO3', type: 'number', defaultValue: 15 },
    ],
    calculate: ({hco3}) => {
        const exp = 1.5 * hco3 + 8;
        return { value: parseFloat(exp.toFixed(1)), unit: 'mmHg', severity: 'info', interpretation: `Expected PaCO2 (+/- 2)` };
    }
  },

  // --- EMERGENCY / CRITICAL CARE ---
  {
    id: 'news2',
    name: 'NEWS2 Score',
    shortName: 'NEWS2',
    description: 'National Early Warning Score.',
    category: 'Critical Care',
    inputs: [
        { id: 'rr', label: 'Resp Rate', type: 'number', defaultValue: 18 },
        { id: 'sat', label: 'O2 Sat', type: 'number', defaultValue: 96 },
        { id: 'o2', label: 'Supp O2', type: 'boolean', defaultValue: false },
        { id: 'sbp', label: 'Systolic BP', type: 'number', defaultValue: 120 },
        { id: 'hr', label: 'Heart Rate', type: 'number', defaultValue: 80 },
        { id: 'temp', label: 'Temp', type: 'number', defaultValue: 37 },
        { id: 'cvpu', label: 'Alert (A) or Confusion (CVPU)', type: 'select', options: [{label:'Alert', value:0}, {label:'CVPU/Confusion', value:3}], defaultValue: 0 },
    ],
    calculate: (v) => {
        // Simplified Logic
        let score = parseInt(v.cvpu);
        if(v.rr <= 8 || v.rr >= 25) score+=3; else if(v.rr >= 21) score+=2; else if(v.rr <= 11) score+=1;
        if(v.sat <= 91) score+=3; else if(v.sat <= 93) score+=2; else if(v.sat <= 95) score+=1;
        if(v.o2) score+=2;
        if(v.sbp <= 90 || v.sbp >= 220) score+=3; else if(v.sbp <= 100) score+=2; else if(v.sbp <= 110) score+=1;
        if(v.hr <= 40 || v.hr >= 131) score+=3; else if(v.hr >= 111) score+=2; else if(v.hr <= 50 || v.hr >= 91) score+=1;
        if(v.temp <= 35) score+=3; else if(v.temp >= 39.1) score+=2; else if(v.temp <= 36 || v.temp >= 38.1) score+=1;
        return { value: score, unit: 'points', severity: score >= 5 ? 'critical' : (score >= 3 ? 'warning' : 'normal'), interpretation: score >= 7 ? 'High Clinical Risk' : 'Monitor closely' };
    }
  },
  {
    id: 'sirs',
    name: 'SIRS Criteria',
    shortName: 'SIRS',
    description: 'Systemic Inflammatory Response Syndrome.',
    category: 'Critical Care',
    inputs: [
        { id: 'temp', label: 'Temp >38 or <36', type: 'boolean', defaultValue: false },
        { id: 'hr', label: 'HR > 90', type: 'boolean', defaultValue: false },
        { id: 'rr', label: 'RR > 20 or PaCO2 < 32', type: 'boolean', defaultValue: false },
        { id: 'wbc', label: 'WBC >12k or <4k or >10% bands', type: 'boolean', defaultValue: false },
    ],
    calculate: (v) => {
        const score = Object.values(v).filter(x => x === true).length;
        return { value: score, unit: 'criteria', severity: score >= 2 ? 'warning' : 'normal', interpretation: score >= 2 ? 'SIRS Met' : 'Normal' };
    }
  },
  {
    id: 'shock_index',
    name: 'Shock Index',
    shortName: 'Shock Index',
    description: 'Early marker of shock.',
    category: 'Critical Care',
    inputs: [
        { id: 'hr', label: 'Heart Rate', type: 'number', defaultValue: 100 },
        { id: 'sbp', label: 'Systolic BP', type: 'number', defaultValue: 100 },
    ],
    calculate: ({hr, sbp}) => {
        const idx = hr / sbp;
        return { value: parseFloat(idx.toFixed(2)), unit: '', severity: idx > 0.9 ? 'critical' : 'normal', interpretation: idx > 0.9 ? 'High risk (Trauma/Sepsis)' : 'Normal (0.5-0.7)' };
    }
  },
  {
    id: 'qsofa',
    name: 'qSOFA',
    shortName: 'qSOFA',
    description: 'Sepsis bedside screening.',
    category: 'Critical Care',
    inputs: [
        { id: 'ams', label: 'Altered Mental Status', type: 'boolean', defaultValue: false },
        { id: 'rr', label: 'RR ≥ 22', type: 'boolean', defaultValue: false },
        { id: 'sbp', label: 'SBP ≤ 100', type: 'boolean', defaultValue: false },
    ],
    calculate: (v) => {
        let score = 0; if(v.ams) score++; if(v.rr) score++; if(v.sbp) score++;
        return { value: score, unit: 'points', severity: score >= 2 ? 'critical' : 'normal', interpretation: score >= 2 ? 'High Sepsis Risk' : 'Low Risk' };
    }
  },
  {
    id: 'wells_dvt',
    name: 'Wells’ DVT',
    shortName: 'Wells DVT',
    description: 'DVT probability.',
    category: 'Emergency',
    inputs: [
      { id: 'cancer', label: 'Active Cancer', type: 'boolean', defaultValue: false },
      { id: 'immob', label: 'Immobilization/Paralysis', type: 'boolean', defaultValue: false },
      { id: 'bed', label: 'Bedridden >3d', type: 'boolean', defaultValue: false },
      { id: 'local', label: 'Local tenderness', type: 'boolean', defaultValue: false },
      { id: 'swelling', label: 'Whole leg swelling', type: 'boolean', defaultValue: false },
      { id: 'calf', label: 'Calf >3cm larger', type: 'boolean', defaultValue: false },
      { id: 'edema', label: 'Pitting edema', type: 'boolean', defaultValue: false },
      { id: 'veins', label: 'Collateral veins', type: 'boolean', defaultValue: false },
      { id: 'hist', label: 'Previous DVT', type: 'boolean', defaultValue: false },
      { id: 'alt', label: 'Alt diagnosis likely (-2)', type: 'boolean', defaultValue: false },
    ],
    calculate: (v) => {
      let score = 0;
      // Simplistic summation (except alt)
      Object.keys(v).forEach(k => { if(v[k] && k !== 'alt') score++; });
      if(v.alt) score -= 2;
      return { value: score, unit: 'points', severity: score >= 2 ? 'warning' : 'normal', interpretation: score >= 2 ? 'DVT Likely' : 'Unlikely' };
    }
  },
  {
    id: 'wells_pe',
    name: 'Wells’ PE',
    shortName: 'Wells PE',
    description: 'PE probability.',
    category: 'Emergency',
    inputs: [
        { id: 'dvt', label: 'Signs of DVT', type: 'boolean', defaultValue: false },
        { id: 'alt', label: 'Alt diagnosis less likely', type: 'boolean', defaultValue: false },
        { id: 'hr', label: 'HR > 100', type: 'boolean', defaultValue: false },
        { id: 'im', label: 'Immob/Surgery', type: 'boolean', defaultValue: false },
        { id: 'hist', label: 'Prior DVT/PE', type: 'boolean', defaultValue: false },
        { id: 'hem', label: 'Hemoptysis', type: 'boolean', defaultValue: false },
        { id: 'ca', label: 'Cancer', type: 'boolean', defaultValue: false },
    ],
    calculate: (v) => {
        let score = 0;
        if(v.dvt) score+=3; if(v.alt) score+=3; if(v.hr) score+=1.5; if(v.im) score+=1.5;
        if(v.hist) score+=1.5; if(v.hem) score+=1; if(v.ca) score+=1;
        return { value: score, unit: 'points', severity: score > 4 ? 'critical' : 'normal', interpretation: score > 4 ? 'PE Likely' : 'Unlikely' };
    }
  },
  {
    id: 'perc',
    name: 'PERC Rule',
    shortName: 'PERC',
    description: 'PE Rule-out Criteria.',
    category: 'Emergency',
    inputs: [
        { id: 'age', label: 'Age ≥ 50', type: 'boolean', defaultValue: false },
        { id: 'hr', label: 'HR ≥ 100', type: 'boolean', defaultValue: false },
        { id: 'sat', label: 'O2 Sat < 95%', type: 'boolean', defaultValue: false },
        { id: 'swell', label: 'Unilateral Leg Swelling', type: 'boolean', defaultValue: false },
        { id: 'hem', label: 'Hemoptysis', type: 'boolean', defaultValue: false },
        { id: 'surg', label: 'Surgery/Trauma <4wks', type: 'boolean', defaultValue: false },
        { id: 'hist', label: 'Prior DVT/PE', type: 'boolean', defaultValue: false },
        { id: 'horm', label: 'Hormone use', type: 'boolean', defaultValue: false },
    ],
    calculate: (v) => {
        const score = Object.values(v).filter(x => x === true).length;
        return { value: score, unit: 'criteria', severity: score > 0 ? 'warning' : 'normal', interpretation: score === 0 ? 'PE Ruled Out (Low risk patients)' : 'Cannot rule out' };
    }
  },

  // --- TRAUMA / ORTHO ---
  {
    id: 'canadian_cspine',
    name: 'Canadian C-Spine Rule',
    shortName: 'C-Spine Rule',
    description: 'Clearance of cervical spine injury.',
    category: 'Trauma',
    inputs: [
      { id: 'high', label: 'High Risk (Age≥65, Dangerous Mech, Paresthesias)', type: 'boolean', defaultValue: false },
      { id: 'low', label: 'Low Risk Factor Present (Sitting, Ambulatory, etc)', type: 'boolean', defaultValue: true },
      { id: 'rom', label: 'Able to Rotate Neck 45°', type: 'boolean', defaultValue: true },
    ],
    calculate: (v) => {
      if(v.high) return { value: 'High Risk', severity: 'critical', interpretation: 'Imaging Required' };
      if(!v.low) return { value: 'No Low Risk Factors', severity: 'warning', interpretation: 'Imaging Required' };
      if(!v.rom) return { value: 'Unable to Rotate', severity: 'warning', interpretation: 'Imaging Required' };
      return { value: 'Cleared', severity: 'normal', interpretation: 'No Imaging Needed' };
    }
  },
  {
    id: 'ottawa_ankle',
    name: 'Ottawa Ankle Rules',
    shortName: 'Ottawa Ankle',
    description: 'X-Ray requirement for ankle injury.',
    category: 'Trauma',
    inputs: [
      { id: 'post', label: 'Bone tenderness posterior edge (6cm)', type: 'boolean', defaultValue: false },
      { id: 'bear', label: 'Inability to bear weight (4 steps)', type: 'boolean', defaultValue: false },
    ],
    calculate: (v) => {
      const xray = v.post || v.bear;
      return { value: xray ? 'X-Ray Indicated' : 'No X-Ray', severity: xray ? 'warning' : 'normal', interpretation: xray ? 'High sensitivity for fracture' : 'Fracture unlikely' };
    }
  },
  {
    id: 'ottawa_knee',
    name: 'Ottawa Knee Rules',
    shortName: 'Ottawa Knee',
    description: 'X-Ray requirement for knee injury.',
    category: 'Trauma',
    inputs: [
      { id: 'age', label: 'Age ≥ 55', type: 'boolean', defaultValue: false },
      { id: 'fib', label: 'Tenderness at fibular head', type: 'boolean', defaultValue: false },
      { id: 'pat', label: 'Isolated tenderness of patella', type: 'boolean', defaultValue: false },
      { id: 'flex', label: 'Inability to flex to 90°', type: 'boolean', defaultValue: false },
      { id: 'bear', label: 'Inability to bear weight (4 steps)', type: 'boolean', defaultValue: false },
    ],
    calculate: (v) => {
      const xray = Object.values(v).some(val => val === true);
      return { value: xray ? 'X-Ray Indicated' : 'No X-Ray', severity: xray ? 'warning' : 'normal', interpretation: 'Standard screening rule' };
    }
  },
  {
    id: 'parkland',
    name: 'Parkland Formula',
    shortName: 'Parkland',
    description: 'Fluid resuscitation for burns.',
    category: 'Trauma',
    inputs: [
      { id: 'weight', label: 'Weight', type: 'number', unit: 'kg', defaultValue: 70 },
      { id: 'tbsa', label: 'TBSA %', type: 'number', defaultValue: 20 },
    ],
    calculate: ({weight, tbsa}) => {
      const total = 4 * weight * tbsa;
      return { value: total, unit: 'mL', severity: 'info', interpretation: `Give ${total/2}mL in first 8h` };
    }
  },

  // --- NEUROLOGY ---
  {
    id: 'gcs',
    name: 'Glasgow Coma Scale',
    shortName: 'GCS',
    description: 'Neurological baseline.',
    category: 'Neurology',
    inputs: [
        { id: 'e', label: 'Eye', type: 'select', options: [{label:'4-Spontaneous',value:4},{label:'3-Sound',value:3},{label:'2-Pressure',value:2},{label:'1-None',value:1}], defaultValue: 4 },
        { id: 'v', label: 'Verbal', type: 'select', options: [{label:'5-Oriented',value:5},{label:'4-Confused',value:4},{label:'3-Words',value:3},{label:'2-Sounds',value:2},{label:'1-None',value:1}], defaultValue: 5 },
        { id: 'm', label: 'Motor', type: 'select', options: [{label:'6-Obey',value:6},{label:'5-Localize',value:5},{label:'4-Withdraw',value:4},{label:'3-Flexion',value:3},{label:'2-Extension',value:2},{label:'1-None',value:1}], defaultValue: 6 },
    ],
    calculate: (v) => {
        const score = parseInt(v.e)+parseInt(v.v)+parseInt(v.m);
        return { value: score, unit: 'points', severity: score <= 8 ? 'critical' : 'normal', interpretation: score <= 8 ? 'Coma (Intubate)' : 'Monitor' };
    }
  },
  {
    id: 'hunt_hess',
    name: 'Hunt & Hess Scale',
    shortName: 'Hunt & Hess',
    description: 'SAH mortality prediction.',
    category: 'Neurology',
    inputs: [
      { id: 'sxs', label: 'Symptoms', type: 'select', options: [
        {label: 'Asymptomatic/Mild HA', value: 1},
        {label: 'Mod/Severe HA, Nuchal Rigidity', value: 2},
        {label: 'Drowsy, Confusion, Mild Deficit', value: 3},
        {label: 'Stupor, Hemiparesis', value: 4},
        {label: 'Coma, Decerebrate', value: 5}
      ], defaultValue: 1}
    ],
    calculate: (v) => {
      const grade = parseInt(v.sxs);
      return { value: `Grade ${grade}`, severity: grade >= 3 ? 'critical' : 'warning', interpretation: 'Subarachnoid Hemorrhage Severity' };
    }
  },
  {
    id: 'abcd2',
    name: 'ABCD² Score',
    shortName: 'ABCD²',
    description: 'TIA stroke risk.',
    category: 'Neurology',
    inputs: [
        { id: 'age', label: 'Age ≥ 60', type: 'boolean', defaultValue: false },
        { id: 'bp', label: 'BP ≥ 140/90', type: 'boolean', defaultValue: false },
        { id: 'clin', label: 'Weakness (2) or Speech (1)', type: 'select', options: [{label:'Weakness',value:2}, {label:'Speech',value:1}, {label:'Other',value:0}], defaultValue: 0 },
        { id: 'dur', label: 'Duration ≥60m (2) or 10-59m (1)', type: 'select', options: [{label:'≥60m',value:2}, {label:'10-59m',value:1}, {label:'<10m',value:0}], defaultValue: 0 },
        { id: 'dm', label: 'Diabetes', type: 'boolean', defaultValue: false },
    ],
    calculate: (v) => {
        let score = parseInt(v.clin) + parseInt(v.dur);
        if(v.age) score++; if(v.bp) score++; if(v.dm) score++;
        return { value: score, unit: 'points', severity: score >= 4 ? 'warning' : 'normal', interpretation: score >= 6 ? 'High Risk' : 'Moderate/Low' };
    }
  },

  // --- PULMONOLOGY ---
  {
    id: 'curb65',
    name: 'CURB-65',
    shortName: 'CURB-65',
    description: 'Pneumonia severity.',
    category: 'Pulmonology',
    inputs: [
        { id: 'c', label: 'Confusion', type: 'boolean', defaultValue: false },
        { id: 'u', label: 'BUN > 19', type: 'boolean', defaultValue: false },
        { id: 'r', label: 'RR ≥ 30', type: 'boolean', defaultValue: false },
        { id: 'b', label: 'BP < 90/60', type: 'boolean', defaultValue: false },
        { id: 'a', label: 'Age ≥ 65', type: 'boolean', defaultValue: false },
    ],
    calculate: (v) => {
        const score = Object.values(v).filter(x => x === true).length;
        return { value: score, unit: 'points', severity: score >= 2 ? 'critical' : 'normal', interpretation: score >= 2 ? 'Admit' : 'Outpatient' };
    }
  },
  {
    id: 'rox_index',
    name: 'ROX Index',
    shortName: 'ROX',
    description: 'Predicts HFNC failure.',
    category: 'Pulmonology',
    inputs: [
        { id: 'spo2', label: 'SpO2', type: 'number', unit: '%', defaultValue: 95 },
        { id: 'fio2', label: 'FiO2 (0.21-1.0)', type: 'number', defaultValue: 0.5 },
        { id: 'rr', label: 'Resp Rate', type: 'number', defaultValue: 20 },
    ],
    calculate: ({spo2, fio2, rr}) => {
        const rox = (spo2 / fio2) / rr;
        return { value: parseFloat(rox.toFixed(2)), unit: '', severity: rox < 4.88 ? 'critical' : 'normal', interpretation: rox < 4.88 ? 'High Risk of Intubation' : 'Low Risk' };
    }
  },
  {
    id: 'aa_gradient',
    name: 'A-a Gradient',
    shortName: 'A-a Grad',
    description: 'Hypoxemia source.',
    category: 'Pulmonology',
    inputs: [
        { id: 'pa02', label: 'PaO2', type: 'number', defaultValue: 90 },
        { id: 'paco2', label: 'PaCO2', type: 'number', defaultValue: 40 },
        { id: 'fio2', label: 'FiO2', type: 'number', defaultValue: 0.21 },
        { id: 'age', label: 'Age', type: 'number', defaultValue: 50 },
    ],
    calculate: ({pa02, paco2, fio2, age}) => {
        const PAO2 = (fio2 * 713) - (paco2 / 0.8);
        const grad = PAO2 - pa02;
        return { value: Math.round(grad), unit: 'mmHg', severity: grad > (age/4 + 4) ? 'warning' : 'normal', interpretation: 'Gradient' };
    }
  },
  {
    id: 'bode_index',
    name: 'BODE Index',
    shortName: 'BODE',
    description: 'COPD survival prediction.',
    category: 'Pulmonology',
    inputs: [
        { id: 'fev1', label: 'FEV1 %', type: 'select', options:[{label:'>=65',value:0},{label:'50-64',value:1},{label:'36-49',value:2},{label:'<=35',value:3}], defaultValue:0 },
        { id: 'walk', label: '6MWD (m)', type: 'select', options:[{label:'>=350',value:0},{label:'250-349',value:1},{label:'150-249',value:2},{label:'<=149',value:3}], defaultValue:0 },
        { id: 'mmrc', label: 'mMRC Dyspnea', type: 'select', options:[{label:'0-1',value:0},{label:'2',value:1},{label:'3',value:2},{label:'4',value:3}], defaultValue:0 },
        { id: 'bmi', label: 'BMI <= 21', type: 'boolean', defaultValue: false },
    ],
    calculate: (v) => {
        let score = parseInt(v.fev1) + parseInt(v.walk) + parseInt(v.mmrc);
        if(v.bmi) score += 1;
        return { value: score, unit: 'points', severity: 'info', interpretation: 'Higher score = worse prognosis' };
    }
  },
  {
    id: 'pack_years',
    name: 'Pack Years',
    shortName: 'Pack Years',
    description: 'Smoking history.',
    category: 'Pulmonology',
    inputs: [
        { id: 'packs', label: 'Packs per day', type: 'number', defaultValue: 1 },
        { id: 'years', label: 'Years smoking', type: 'number', defaultValue: 10 },
    ],
    calculate: ({packs, years}) => {
        return { value: packs * years, unit: 'pack-years', severity: 'info', interpretation: 'Smoking burden' };
    }
  },

  // --- GASTRO / HEPATOLOGY ---
  {
    id: 'meld_na',
    name: 'MELD-Na',
    shortName: 'MELD-Na',
    description: 'Liver transplant priority.',
    category: 'Hepatology',
    inputs: [
        { id: 'bil', label: 'Bilirubin', type: 'number', defaultValue: 1.0 },
        { id: 'inr', label: 'INR', type: 'number', defaultValue: 1.0 },
        { id: 'cr', label: 'Creatinine', type: 'number', defaultValue: 1.0 },
        { id: 'na', label: 'Na', type: 'number', defaultValue: 135 },
    ],
    calculate: ({bil, inr, cr, na}) => {
        // Simplified MELD logic for demo
        let m = 3.78*Math.log(bil) + 11.2*Math.log(inr) + 9.57*Math.log(cr) + 6.43;
        return { value: Math.round(m), unit: 'points', severity: m > 20 ? 'critical' : 'normal', interpretation: '3-month mortality risk' };
    }
  },
  {
    id: 'child_pugh',
    name: 'Child-Pugh Score',
    shortName: 'Child-Pugh',
    description: 'Cirrhosis severity.',
    category: 'Hepatology',
    inputs: [
        { id: 'b', label: 'Bili', type: 'select', options:[{label:'<2',value:1},{label:'2-3',value:2},{label:'>3',value:3}], defaultValue:1 },
        { id: 'a', label: 'Alb', type: 'select', options:[{label:'>3.5',value:1},{label:'2.8-3.5',value:2},{label:'<2.8',value:3}], defaultValue:1 },
        { id: 'i', label: 'INR', type: 'select', options:[{label:'<1.7',value:1},{label:'1.7-2.3',value:2},{label:'>2.3',value:3}], defaultValue:1 },
        { id: 'as', label: 'Ascites', type: 'select', options:[{label:'None',value:1},{label:'Mild',value:2},{label:'Mod',value:3}], defaultValue:1 },
        { id: 'e', label: 'Enceph', type: 'select', options:[{label:'None',value:1},{label:'1-2',value:2},{label:'3-4',value:3}], defaultValue:1 },
    ],
    calculate: (v) => {
        const s = parseInt(v.b)+parseInt(v.a)+parseInt(v.i)+parseInt(v.as)+parseInt(v.e);
        let g = 'A'; if(s>=10) g='C'; else if(s>=7) g='B';
        return { value: `Class ${g} (${s})`, severity: g==='C'?'critical':'normal', interpretation: 'Prognosis' };
    }
  },
  {
    id: 'fib4',
    name: 'FIB-4 Index',
    shortName: 'FIB-4',
    description: 'Liver fibrosis estimation.',
    category: 'Hepatology',
    inputs: [
        { id: 'age', label: 'Age', type: 'number', defaultValue: 40 },
        { id: 'ast', label: 'AST', type: 'number', defaultValue: 30 },
        { id: 'alt', label: 'ALT', type: 'number', defaultValue: 30 },
        { id: 'plt', label: 'Platelets (x10^9/L)', type: 'number', defaultValue: 250 },
    ],
    calculate: ({age, ast, alt, plt}) => {
        const score = (age * ast) / (plt * Math.sqrt(alt));
        return { value: parseFloat(score.toFixed(2)), unit: '', severity: score > 3.25 ? 'critical' : 'normal', interpretation: score > 3.25 ? 'Advanced Fibrosis Likely' : (score < 1.45 ? 'Fibrosis Unlikely' : 'Indeterminate') };
    }
  },
  {
    id: 'apri',
    name: 'APRI Score',
    shortName: 'APRI',
    description: 'AST to Platelet Ratio Index.',
    category: 'Hepatology',
    inputs: [
        { id: 'ast', label: 'AST', type: 'number', defaultValue: 40 },
        { id: 'uln', label: 'AST Upper Limit', type: 'number', defaultValue: 40 },
        { id: 'plt', label: 'Platelets (x10^9/L)', type: 'number', defaultValue: 250 },
    ],
    calculate: ({ast, uln, plt}) => {
        const score = ((ast / uln) / plt) * 100;
        return { value: parseFloat(score.toFixed(2)), unit: '', severity: score > 1 ? 'warning' : 'normal', interpretation: score > 1.0 ? 'Cirrhosis Possible' : 'Cirrhosis Unlikely' };
    }
  },
  {
    id: 'glasgow_blatchford',
    name: 'Glasgow-Blatchford Score',
    shortName: 'GBS',
    description: 'Upper GI bleed risk.',
    category: 'Gastroenterology',
    inputs: [
        { id: 'bun', label: 'BUN', type: 'number', defaultValue: 15 },
        { id: 'hb', label: 'Hemoglobin', type: 'number', defaultValue: 13 },
        { id: 'sbp', label: 'Systolic BP', type: 'number', defaultValue: 120 },
        { id: 'pulse', label: 'Pulse', type: 'number', defaultValue: 80 },
        { id: 'melena', label: 'Melena', type: 'boolean', defaultValue: false },
        { id: 'syncope', label: 'Syncope', type: 'boolean', defaultValue: false },
    ],
    calculate: (v) => {
        let s = 0; // Simplified calculation
        if(v.melena) s++; if(v.syncope) s+=2; if(v.sbp < 100) s+=2; if(v.hb < 10) s+=3;
        return { value: s, unit: 'points', severity: s > 0 ? 'warning' : 'normal', interpretation: s === 0 ? 'Low Risk (Outpatient)' : 'Inpatient Management' };
    }
  },

  // --- ENDO / HEME / ONCO ---
  {
    id: 'homa_ir',
    name: 'HOMA-IR',
    shortName: 'HOMA-IR',
    description: 'Insulin resistance.',
    category: 'Endocrinology',
    inputs: [
        { id: 'ins', label: 'Insulin (uIU/mL)', type: 'number', defaultValue: 10 },
        { id: 'glc', label: 'Glucose (mg/dL)', type: 'number', defaultValue: 90 },
    ],
    calculate: ({ins, glc}) => {
        const score = (ins * glc) / 405;
        return { value: parseFloat(score.toFixed(1)), unit: '', severity: score > 2.9 ? 'warning' : 'normal', interpretation: score > 2.9 ? 'Significant Resistance' : 'Normal' };
    }
  },
  {
    id: 'calcium_corr',
    name: 'Calcium Correction',
    shortName: 'Ca Corr',
    description: 'Corrects Ca for Albumin.',
    category: 'Endocrinology',
    inputs: [
        { id: 'ca', label: 'Calcium', type: 'number', defaultValue: 8.5 },
        { id: 'alb', label: 'Albumin', type: 'number', defaultValue: 4.0 },
    ],
    calculate: ({ca, alb}) => {
        const corr = ca + 0.8 * (4.0 - alb);
        return { value: parseFloat(corr.toFixed(2)), unit: 'mg/dL', severity: 'info', interpretation: 'Corrected Calcium' };
    }
  },
  {
    id: 'anc',
    name: 'Absolute Neutrophil Count',
    shortName: 'ANC',
    description: 'Neutropenia assessment.',
    category: 'Hematology',
    inputs: [
        { id: 'wbc', label: 'WBC', type: 'number', defaultValue: 5000 },
        { id: 'p', label: 'Neutrophils %', type: 'number', defaultValue: 50 },
        { id: 'b', label: 'Bands %', type: 'number', defaultValue: 0 },
    ],
    calculate: ({wbc, p, b}) => {
        const anc = wbc * ((p + b)/100);
        return { value: Math.round(anc), unit: '/µL', severity: anc < 1500 ? 'warning' : 'normal', interpretation: anc < 500 ? 'Severe Neutropenia' : 'Normal' };
    }
  },
  {
    id: 'ganzoni',
    name: 'Ganzoni Equation',
    shortName: 'Iron Deficit',
    description: 'Total iron deficit.',
    category: 'Hematology',
    inputs: [
        { id: 'wt', label: 'Weight', type: 'number', defaultValue: 70 },
        { id: 't', label: 'Target Hb', type: 'number', defaultValue: 15 },
        { id: 'a', label: 'Actual Hb', type: 'number', defaultValue: 10 },
    ],
    calculate: ({wt, t, a}) => {
        const def = wt * (t - a) * 2.4 + 500;
        return { value: Math.round(def), unit: 'mg', severity: 'info', interpretation: 'Iron Dose Needed' };
    }
  },
  {
    id: 'khorana',
    name: 'Khorana Score',
    shortName: 'Khorana',
    description: 'VTE risk in cancer patients.',
    category: 'Oncology',
    inputs: [
        { id: 'site', label: 'Very High Risk Site (Stomach, Pancreas)', type: 'boolean', defaultValue: false },
        { id: 'high', label: 'High Risk Site (Lung, Gyn, Gu)', type: 'boolean', defaultValue: false },
        { id: 'plt', label: 'Platelets ≥ 350', type: 'boolean', defaultValue: false },
        { id: 'hb', label: 'Hb < 10 or ESA use', type: 'boolean', defaultValue: false },
        { id: 'wbc', label: 'WBC > 11', type: 'boolean', defaultValue: false },
        { id: 'bmi', label: 'BMI ≥ 35', type: 'boolean', defaultValue: false },
    ],
    calculate: (v) => {
        let s = 0; if(v.site) s+=2; if(v.high) s+=1; if(v.plt) s++; if(v.hb) s++; if(v.wbc) s++; if(v.bmi) s++;
        return { value: s, unit: 'points', severity: s >= 3 ? 'critical' : 'normal', interpretation: s >= 3 ? 'High Risk' : 'Low/Intermediate' };
    }
  },
  {
    id: 'ecog',
    name: 'ECOG Performance Status',
    shortName: 'ECOG',
    description: 'Oncology functional status.',
    category: 'Oncology',
    inputs: [
        { id: 'stat', label: 'Status', type: 'select', options:[
            {label:'0 - Fully Active', value:0},
            {label:'1 - Restricted, Ambulatory', value:1},
            {label:'2 - Ambulatory, <50% Bed', value:2},
            {label:'3 - Limited, >50% Bed', value:3},
            {label:'4 - Bedridden', value:4}
        ], defaultValue: 0}
    ],
    calculate: ({stat}) => {
        return { value: stat, unit: 'Grade', severity: 'info', interpretation: 'Performance Status' };
    }
  },

  // --- INFECTIOUS DISEASE ---
  {
    id: 'centor',
    name: 'Centor Score (Modified)',
    shortName: 'Centor',
    description: 'Strep pharyngitis probability.',
    category: 'Infectious Disease',
    inputs: [
        { id: 'age', label: 'Age 3-14 (+1) or >45 (-1)', type: 'select', options:[{label:'3-14',value:1},{label:'15-44',value:0},{label:'>45',value:-1}], defaultValue: 0 },
        { id: 'exudate', label: 'Tonsillar Exudate', type: 'boolean', defaultValue: false },
        { id: 'nodes', label: 'Tender Anterior Nodes', type: 'boolean', defaultValue: false },
        { id: 'temp', label: 'Fever History', type: 'boolean', defaultValue: false },
        { id: 'cough', label: 'Absence of Cough', type: 'boolean', defaultValue: false },
    ],
    calculate: (v) => {
        let s = parseInt(v.age); if(v.exudate) s++; if(v.nodes) s++; if(v.temp) s++; if(v.cough) s++;
        if(s < -1) s = -1;
        return { value: s, unit: 'points', severity: s >= 4 ? 'warning' : 'normal', interpretation: s >= 4 ? 'Treat Empirically' : (s >= 2 ? 'Rapid Test' : 'No Test') };
    }
  },

  // --- PEDIATRICS / OBGYN ---
  {
    id: 'apgar',
    name: 'APGAR Score',
    shortName: 'APGAR',
    description: 'Newborn assessment.',
    category: 'Pediatrics',
    inputs: [
        { id: 'a', label: 'Appearance', type: 'select', options:[{label:'Blue',value:0},{label:'Acrocyanosis',value:1},{label:'Pink',value:2}], defaultValue:2 },
        { id: 'p', label: 'Pulse', type: 'select', options:[{label:'0',value:0},{label:'<100',value:1},{label:'>100',value:2}], defaultValue:2 },
        { id: 'g', label: 'Grimace', type: 'select', options:[{label:'None',value:0},{label:'Grimace',value:1},{label:'Cry',value:2}], defaultValue:2 },
        { id: 'act', label: 'Activity', type: 'select', options:[{label:'Limp',value:0},{label:'Flexion',value:1},{label:'Active',value:2}], defaultValue:2 },
        { id: 'r', label: 'Respiration', type: 'select', options:[{label:'0',value:0},{label:'Weak',value:1},{label:'Strong',value:2}], defaultValue:2 },
    ],
    calculate: (v) => {
        const s = parseInt(v.a)+parseInt(v.p)+parseInt(v.g)+parseInt(v.act)+parseInt(v.r);
        return { value: s, unit: 'points', severity: s < 7 ? 'warning' : 'normal', interpretation: 'Newborn Status' };
    }
  },
  {
    id: 'peds_maintenance',
    name: 'Maintenance Fluids (4-2-1)',
    shortName: 'Peds Fluids',
    description: 'Hourly fluid rate.',
    category: 'Pediatrics',
    inputs: [
        { id: 'wt', label: 'Weight (kg)', type: 'number', defaultValue: 10 },
    ],
    calculate: ({wt}) => {
        let r = 0;
        if(wt <= 10) r = wt * 4;
        else if(wt <= 20) r = 40 + (wt-10)*2;
        else r = 60 + (wt-20);
        return { value: r, unit: 'mL/hr', severity: 'info', interpretation: 'Hourly Rate' };
    }
  },
  {
    id: 'ibuprofen_peds',
    name: 'Pediatric Ibuprofen Dose',
    shortName: 'Ibuprofen',
    description: 'Fever/Pain dosing (10mg/kg).',
    category: 'Pediatrics',
    inputs: [
        { id: 'wt', label: 'Weight (kg)', type: 'number', defaultValue: 10 },
    ],
    calculate: ({wt}) => {
        return { value: Math.round(wt * 10), unit: 'mg', severity: 'info', interpretation: 'Every 6-8 hours (Max 40mg/kg/day)' };
    }
  },
  {
    id: 'acetaminophen_peds',
    name: 'Pediatric Acetaminophen',
    shortName: 'Tylenol',
    description: 'Fever/Pain dosing (15mg/kg).',
    category: 'Pediatrics',
    inputs: [
        { id: 'wt', label: 'Weight (kg)', type: 'number', defaultValue: 10 },
    ],
    calculate: ({wt}) => {
        return { value: Math.round(wt * 15), unit: 'mg', severity: 'info', interpretation: 'Every 4-6 hours (Max 75mg/kg/day)' };
    }
  },
  {
    id: 'amox_peds',
    name: 'Pediatric Amoxicillin',
    shortName: 'Amox',
    description: 'Otitis Media dosing (90mg/kg).',
    category: 'Pediatrics',
    inputs: [
        { id: 'wt', label: 'Weight (kg)', type: 'number', defaultValue: 10 },
    ],
    calculate: ({wt}) => {
        return { value: Math.round(wt * 90), unit: 'mg/day', severity: 'info', interpretation: 'Total daily dose (Divide BID)' };
    }
  },
  {
    id: 'schwartz',
    name: 'Bedside Schwartz',
    shortName: 'Schwartz',
    description: 'Pediatric eGFR.',
    category: 'Pediatrics',
    inputs: [
        { id: 'ht', label: 'Height (cm)', type: 'number', defaultValue: 100 },
        { id: 'cr', label: 'Creatinine', type: 'number', defaultValue: 0.5 },
    ],
    calculate: ({ht, cr}) => {
        const gfr = (0.413 * ht) / cr;
        return { value: Math.round(gfr), unit: 'mL/min/1.73m²', severity: 'normal', interpretation: 'Estimated GFR' };
    }
  },
  {
    id: 'naegele',
    name: 'Due Date (Naegele)',
    shortName: 'EDD',
    description: 'Estimated delivery date.',
    category: 'Obstetrics',
    inputs: [
        { id: 'm', label: 'LMP Month', type: 'number', min: 1, max: 12, defaultValue: 1 },
        { id: 'd', label: 'LMP Day', type: 'number', min: 1, max: 31, defaultValue: 1 },
        { id: 'y', label: 'LMP Year', type: 'number', defaultValue: new Date().getFullYear() },
    ],
    calculate: ({m, d, y}) => {
        const date = new Date(y, m-1, d);
        date.setDate(date.getDate() + 280);
        return { value: date.toLocaleDateString(), unit: '', severity: 'info', interpretation: 'EDD' };
    }
  },
  {
    id: 'bishop',
    name: 'Bishop Score',
    shortName: 'Bishop',
    description: 'Likelihood of successful induction.',
    category: 'Obstetrics',
    inputs: [
        { id: 'dil', label: 'Dilation', type: 'select', options:[{label:'Closed',value:0},{label:'1-2cm',value:1},{label:'3-4cm',value:2},{label:'>5cm',value:3}], defaultValue:0 },
        { id: 'eff', label: 'Effacement', type: 'select', options:[{label:'0-30%',value:0},{label:'40-50%',value:1},{label:'60-70%',value:2},{label:'>80%',value:3}], defaultValue:0 },
        { id: 'sta', label: 'Station', type: 'select', options:[{label:'-3',value:0},{label:'-2',value:1},{label:'-1/0',value:2},{label:'+1/+2',value:3}], defaultValue:0 },
        { id: 'con', label: 'Consistency', type: 'select', options:[{label:'Firm',value:0},{label:'Medium',value:1},{label:'Soft',value:2}], defaultValue:0 },
        { id: 'pos', label: 'Position', type: 'select', options:[{label:'Posterior',value:0},{label:'Mid',value:1},{label:'Anterior',value:2}], defaultValue:0 },
    ],
    calculate: (v) => {
        const s = parseInt(v.dil)+parseInt(v.eff)+parseInt(v.sta)+parseInt(v.con)+parseInt(v.pos);
        return { value: s, unit: 'points', severity: s > 8 ? 'normal' : 'warning', interpretation: s > 8 ? 'Favorable for induction' : 'Unfavorable' };
    }
  },
  
  // --- SURGERY ---
  {
    id: 'alvarado',
    name: 'Alvarado Score',
    shortName: 'Alvarado',
    description: 'Appendicitis diagnosis.',
    category: 'Surgery',
    inputs: [
        { id: 'm', label: 'Migratory Pain', type: 'boolean', defaultValue: false },
        { id: 'a', label: 'Anorexia', type: 'boolean', defaultValue: false },
        { id: 'n', label: 'Nausea', type: 'boolean', defaultValue: false },
        { id: 't', label: 'Tenderness RIF (2)', type: 'boolean', defaultValue: false },
        { id: 'r', label: 'Rebound', type: 'boolean', defaultValue: false },
        { id: 'e', label: 'Elevated Temp', type: 'boolean', defaultValue: false },
        { id: 'l', label: 'Leukocytosis (2)', type: 'boolean', defaultValue: false },
        { id: 's', label: 'Shift Left', type: 'boolean', defaultValue: false },
    ],
    calculate: (v) => {
        let s = 0;
        if(v.m) s++; if(v.a) s++; if(v.n) s++; if(v.t) s+=2;
        if(v.r) s++; if(v.e) s++; if(v.l) s+=2; if(v.s) s++;
        return { value: s, unit: 'points', severity: s >= 7 ? 'critical' : 'normal', interpretation: s >= 7 ? 'Surgery Probable' : 'Observation' };
    }
  },
];
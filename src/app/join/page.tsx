'use client';

import React, { useState } from 'react';
import Step1Info from './components/Step1Info';
import Step2Terms from './components/Step2Terms';
import Step3Plan from './components/Step3Plan';
import Step4Complete from './components/Step4Complete';

export default function JoinPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  return (
    <main>
      {step === 1 && <Step1Info onNext={() => setStep(2)} />}
      {step === 2 && <Step2Terms onNext={() => setStep(3)} />}
      {step === 3 && <Step3Plan onNext={() => setStep(4)} />}
      {step === 4 && <Step4Complete />}
    </main>
  );
}
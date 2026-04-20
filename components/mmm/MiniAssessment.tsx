'use client';

import { useState } from 'react';
import { tierForScore } from './data';
import { ClinicalScoreCard } from './Clinical';

interface Option {
  label: string;
  score: number;
}

interface Question {
  id:      string;
  q:       string;
  sub:     string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: 'age', q: "What's your age range?",
    sub: 'Sarcopenia risk accelerates after 50 — we calibrate by decade.',
    options: [
      { label: '45–54', score: 20 },
      { label: '55–64', score: 15 },
      { label: '65–74', score: 10 },
      { label: '75+',   score: 5  },
    ],
  },
  {
    id: 'stairs', q: 'Climbing two flights of stairs leaves you…',
    sub: 'Chair-rise and stair-climb are validated lower-body strength proxies.',
    options: [
      { label: 'Completely unbothered',         score: 20 },
      { label: 'Slightly winded, recover fast', score: 15 },
      { label: 'Noticeably breathless',          score: 8  },
      { label: 'I avoid them when I can',        score: 3  },
    ],
  },
  {
    id: 'protein', q: 'On a typical day, how much protein do you eat?',
    sub: 'Adults 45+ need 1.2–1.6 g/kg/day to offset anabolic resistance.',
    options: [
      { label: 'Meaningful protein at every meal', score: 20 },
      { label: 'Usually at two meals',              score: 14 },
      { label: 'Mostly at dinner',                  score: 7  },
      { label: "Honestly, I'm not sure",            score: 3  },
    ],
  },
  {
    id: 'balance', q: 'Can you stand on one leg for 30 seconds with eyes closed?',
    sub: 'Single-leg balance is a strong predictor of fall risk and 10-year mortality.',
    options: [
      { label: 'Easily',                   score: 20 },
      { label: 'Wobbly but I can do it',   score: 13 },
      { label: 'Only with eyes open',       score: 7  },
      { label: "I'd rather not try",        score: 2  },
    ],
  },
  {
    id: 'recovery', q: 'How rested do you feel most mornings?',
    sub: 'Recovery dysregulation is the hidden driver of catabolic decline.',
    options: [
      { label: 'Consistently rested',                  score: 20 },
      { label: 'Rested about half the time',           score: 13 },
      { label: 'Tired more often than not',            score: 7  },
      { label: 'Exhausted — I\'m running on fumes',   score: 2  },
    ],
  },
];

function personalMessage(score: number): string {
  if (score >= 85) return 'Your profile is top-decile for active aging. We\'ll send the maintenance protocol tailored to sustain this trajectory.';
  if (score >= 70) return 'You\'re in the functional range with strong foundations. There are targeted optimization wins waiting for you.';
  if (score >= 55) return 'You\'re in the highest-leverage intervention window. Early signals of drift, fully reversible with the right protocol.';
  if (score >= 40) return 'Multiple systems are showing strain. Your report outlines the clinical sequence that reverses decline most efficiently.';
  return 'Your profile indicates compounding risk. We strongly recommend reviewing the PDF with a qualified practitioner.';
}

export function MiniAssessment() {
  const [step,      setStep]      = useState(0);
  const [answers,   setAnswers]   = useState<Record<string, Option>>({});
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);

  const total     = QUESTIONS.length;
  const isResult  = step === total;
  const finalScore = Object.values(answers).reduce((s, a) => s + a.score, 0);

  const select = (opt: Option) => {
    setAnswers({ ...answers, [QUESTIONS[step].id]: opt });
  };

  const next  = () => setStep(Math.min(step + 1, total));
  const back  = () => setStep(Math.max(step - 1, 0));
  const reset = () => { setStep(0); setAnswers({}); setEmail(''); setSubmitted(false); };

  const currentAnswer = !isResult ? answers[QUESTIONS[step]?.id] : undefined;

  return (
    <div style={{
      background: '#fff', borderRadius: 18, overflow: 'hidden',
      border: '1px solid #e8e6e1', boxShadow: '0 12px 40px rgba(26,35,50,0.08)',
    }}>
      <div style={{ height: 4, background: 'linear-gradient(90deg, #009090 0%, #D4AF37 100%)' }}/>

      <div style={{ padding: '36px 40px 40px' }}>
        {!isResult ? (
          <>
            {/* Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div style={{
                fontFamily: 'Outfit, sans-serif', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase', color: '#009090',
              }}>
                Step {step + 1} of {total} · Muscle-Loss Risk Screen
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {QUESTIONS.map((_, i) => (
                  <div key={i} style={{
                    width: 28, height: 3, borderRadius: 2,
                    background: i <= step ? '#009090' : '#e8e6e1',
                    transition: 'background 300ms ease',
                  }}/>
                ))}
              </div>
            </div>

            <h3 style={{
              fontFamily: 'Cormorant Garamond, serif', fontSize: 30, fontWeight: 700,
              color: '#1a2332', marginBottom: 8, lineHeight: 1.2,
            }}>
              {QUESTIONS[step].q}
            </h3>
            <p style={{
              fontFamily: 'Outfit, sans-serif', fontSize: 14, color: '#6b7b8f',
              marginBottom: 26, fontStyle: 'italic',
            }}>
              {QUESTIONS[step].sub}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {QUESTIONS[step].options.map((opt, i) => {
                const selected = currentAnswer?.label === opt.label;
                return (
                  <button key={i} onClick={() => select(opt)} style={{
                    textAlign: 'left', padding: '18px 22px',
                    background: selected ? '#faf6e8' : '#f7f6f3',
                    border: `1.5px solid ${selected ? '#D4AF37' : '#e8e6e1'}`,
                    borderRadius: 12, cursor: 'pointer',
                    fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 500,
                    color: selected ? '#1a2332' : '#344256',
                    display: 'flex', alignItems: 'center', gap: 14,
                    transition: 'all 200ms ease', width: '100%',
                  }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${selected ? '#D4AF37' : '#a8b3c2'}`,
                      background: selected ? '#D4AF37' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 200ms ease',
                    }}>
                      {selected && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }}/>}
                    </span>
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={back} disabled={step === 0} style={{
                background: 'transparent', border: 'none',
                fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600,
                color: step === 0 ? '#a8b3c2' : '#6b7b8f',
                cursor: step === 0 ? 'not-allowed' : 'pointer',
              }}>
                ← Back
              </button>
              <button onClick={next} disabled={!currentAnswer} className="mmm-btn mmm-btn-primary"
                style={{ opacity: currentAnswer ? 1 : 0.5, cursor: currentAnswer ? 'pointer' : 'not-allowed' }}>
                {step === total - 1 ? 'See My Result' : 'Continue'} →
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'Outfit, sans-serif', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase', color: '#009090', marginBottom: 8,
            }}>
              Your Muscle-Loss Risk Screen
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <ClinicalScoreCard score={finalScore} label="Risk Screen Score" size={180} animateOnMount={false}/>
            </div>
            <p style={{
              fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
              fontSize: 20, lineHeight: 1.45, color: '#1a2332',
              maxWidth: 520, margin: '0 auto 28px',
            }}>
              &ldquo;{personalMessage(finalScore)}&rdquo;
            </p>

            {!submitted ? (
              <>
                <div style={{
                  fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#6b7b8f',
                  marginBottom: 14, maxWidth: 480, marginInline: 'auto', lineHeight: 1.55,
                }}>
                  Your full personalized PDF report maps this score onto the 4-pillar framework
                  with the sequence of clinical protocols tailored to your profile.
                </div>
                <form
                  onSubmit={(e) => { e.preventDefault(); if (email.includes('@')) setSubmitted(true); }}
                  style={{ display: 'flex', gap: 8, maxWidth: 440, margin: '0 auto 14px' }}
                >
                  <input
                    type="email" required placeholder="clinical@yourdomain.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    style={{
                      flex: 1, padding: '14px 18px',
                      border: '1.5px solid #e8e6e1', borderRadius: 999,
                      fontFamily: 'Outfit, sans-serif', fontSize: 14, color: '#1a2332',
                      outline: 'none', background: '#f7f6f3',
                    }}
                  />
                  <button type="submit" className="mmm-btn mmm-btn-primary" style={{ flexShrink: 0 }}>
                    Send My Report
                  </button>
                </form>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 11, color: '#a8b3c2' }}>
                  No spam. Unsubscribe in one click. Your data stays in your report.
                </div>
              </>
            ) : (
              <div style={{
                background: '#e6f5f5', border: '1px solid #009090', borderRadius: 12,
                padding: '20px 24px', maxWidth: 480, margin: '0 auto 16px',
              }}>
                <div style={{
                  fontFamily: 'Outfit, sans-serif', fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.16em', textTransform: 'uppercase', color: '#006b6b', marginBottom: 6,
                }}>
                  ✓ Report on its way
                </div>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, color: '#1a2332', margin: 0 }}>
                  Check <strong>{email}</strong> within the next 5 minutes. It includes your full tier
                  breakdown and the first clinical protocol calibrated to your score.
                </p>
              </div>
            )}

            <button onClick={reset} style={{
              background: 'transparent', border: 'none', marginTop: 16,
              fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 500,
              color: '#6b7b8f', cursor: 'pointer', textDecoration: 'underline',
            }}>
              ← Retake the screen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

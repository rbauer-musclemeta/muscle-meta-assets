/* Plain-language layer for the glute handout.
   glute-data.js stays the single source of truth for ids, names, levels, equipment,
   steps, cues, easier/harder and joint notes. This file only supplies:
     core    one plain sentence per exercise (required for every exercise)
     steps / cues / easier / harder / joint   optional rewrites, used only where the
             source wording is jargon-heavy for a general reader.
   build-handout.js fails if an exercise has no `core`, and lints the final text. */
'use strict';

module.exports = {
  CATEGORY_INTRO: {
    bridge: 'Lying on your back and pressing your hips up. The floor or bench supports you, so balance and joints are barely challenged, and you recover quickly.',
    squat:  'Bending your knees and hips to sit down and stand up, or stepping up and back. This is the closest match to getting out of a chair and using stairs.',
    hinge:  'Folding forward at your hips with a long back, then standing tall. It is powerful for the glutes, and the most demanding on your lower back, so build up slowly.',
    abd:    'Moving your leg out to the side, or turning it outward. It trains the glutes at the side of your hip that keep you steady when you walk or stand on one leg, and it is gentle on recovery.'
  },

  EX: {
    'bridge-floor':   { core: 'Lie on your back and lift your hips, so your glutes do the work while the floor supports you.' },
    'bridge-banded':  { core: 'The same bridge with a small band above your knees, which also wakes up the muscles at the side of your hips.' },
    'bridge-bench':   { core: 'A bridge with your shoulders resting on a bench, so your hips travel through a longer range.' },
    'bridge-hipthrust': {
      core: 'A loaded version of the bench thrust, where you pause at the top to feel your glutes working.',
      cues: ['Ribs over hips at the top', 'Squeeze, then count "one-Mississippi, two-Mississippi"'],
      joint: 'Puts the work through your hips with little load on your spine. Breathe out as you lift, and avoid holding your breath on heavy sets.'
    },
    'bridge-single':  { core: 'A bridge on one leg, which trains your glutes to keep your hips level.', easier: 'Rest the toes of your free foot lightly on the floor.' },
    'bridge-barbell': { core: 'A short, heavier bridge from the floor, with a squeeze at the top.' },
    'bridge-bstance': {
      core: 'A hip thrust that works mostly one leg, with the other foot resting lightly for balance.',
      cues: ['Most of the push comes from the front foot', 'Keep your hips level throughout']
    },
    'bridge-single-thrust': { core: 'The most demanding thrust, where one leg does all the lifting.' },

    'sit-stand':        { core: 'Standing up from and sitting down on a chair, the movement you use many times a day, trained on purpose.' },
    'squat-box-goblet': { core: 'Hold a weight at your chest and sit back onto a box, which gives you the same depth every time.' },
    'squat-goblet':     { core: 'A squat holding a weight at your chest, going down only as far as feels comfortable.' },
    'squat-highbar': {
      core: 'A classic squat with a bar on your upper back, going down until your thighs are level and no further.',
      steps: ['Rest the bar on your upper back, feet shoulder-width apart.', 'Tighten your tummy, sit down until your thighs are level with the floor, then drive up.', 'Use a rack with safety bars set just below your lowest rep.'],
      cues: ['Tighten your tummy before you go down', 'Knees follow the toes'],
      joint: 'The bar puts load through your spine, so it is not the first choice if you have low bone density. A leg press is a good swap.'
    },
    'legpress-hip': {
      core: 'Press a platform away from you on a machine that supports your back, with your feet placed high and wide.',
      steps: ['Sit with your back flat on the pad and your feet high and slightly wide on the platform.', 'Lower until your knees are bent about 90 degrees, stopping before your hips lift off the seat.', 'Press back without locking your knees.']
    },
    'legpress-single':  { core: 'Press with one leg at a time on the machine, with no balance needed.' },
    'stepup': {
      core: 'Step up onto a low step with a rail beside you, direct practice for stairs.',
      joint: 'Pick a step height that gives no knee pain. Leaning your body forward a little moves the work to your hip.'
    },
    'split-static': {
      core: 'Stand with one foot forward and one back, holding a counter, and bend both knees.',
      cues: ['Stand tall, or lean slightly forward to feel your hip more', 'Front heel stays down'],
      joint: 'A longer step and a slight lean forward move the work toward your hip and away from your knee.'
    },
    'reverse-lunge':    { core: 'Step backward into a lunge with a rail or machine for steadiness. Stepping back is kinder to the knee than stepping forward.' },
    'walking-lunge':    { core: 'A series of lunging steps along a clear path, like walking with extra effort.' },
    'bulgarian': {
      core: 'A deep one-leg squat with your back foot resting on a bench and a hand on a support.',
      cues: ['Front foot far enough forward that your shin stays almost upright', 'Control the bottom'],
      joint: 'Deep knee and hip bending under load. Skip it if deep bending causes knee or hip pain.'
    },

    'hinge-wall':   { core: 'Learn to fold forward at your hips with a long back by tapping your bottom to a wall.' },
    'hinge-bw':     { core: 'Fold forward at your hips with your hands behind your head, practising the movement before adding weight.' },
    'rdl-db': {
      core: 'Slide light dumbbells down your thighs by pushing your hips back, then stand tall.',
      steps: ['Hold dumbbells in front of your thighs.', 'Push your hips back, sliding the weights down your legs, back straight.', 'When you feel a stretch behind your thighs, squeeze your glutes to stand.']
    },
    'rdl-bb': {
      core: 'The same hip-folding movement as the dumbbell version, using a barbell for more load.',
      cues: ['Bar stays close to your legs', 'Keep your back straight throughout'],
      joint: 'Some load goes through your spine. Always stop well before the set feels too hard.'
    },
    'pullthrough':  { core: 'Pull a cable rope through your legs by pushing your hips forward, which keeps your glutes busy and your back calm.' },
    'hyper45': {
      core: 'Fold forward over a padded bench and lift your body back up to a straight line.',
      joint: 'If you have osteoporosis or have had a spinal fracture, choose the cable pull-through instead and keep your back straight.'
    },
    'sl-rdl': {
      core: 'Fold forward on one leg with a hand on a support, while the other leg reaches behind you.',
      easier: 'Rest the toes of your back foot lightly on the floor.',
      joint: 'Balance is the hard part, so use your support freely.'
    },
    'reverse-hyper': {
      core: 'Lie face down on a pad and swing your legs up behind you to a straight line.',
      joint: 'Skip this one if you have low bone density or an acute back problem.'
    },
    'good-morning': {
      core: 'Fold forward at your hips with a light bar on your upper back, then stand tall.',
      steps: ['Place a light bar on your upper back.', 'Fold forward at the hips with a flat back until your body is nearly level with the floor.', 'Squeeze your glutes to stand.'],
      joint: 'The bar sits far from your hips, which puts extra load on your spine. Not for people with osteoporosis.'
    },
    'deadlift-conv': {
      core: 'Lift a bar from the floor by pushing the floor away and standing tall, always stopping well before it gets too hard.',
      steps: ['Set the bar over the middle of your feet. Fold forward at the hips, grip the bar and tighten your tummy.', 'Push the floor away and stand tall.', 'Lower along the same path and reset between reps.'],
      cues: ['Stop with 2 to 3 reps still left in you', 'Reset between every rep'],
      joint: 'This puts high demand on your spine. Always stop well before it feels too hard.'
    },

    'abd-sidelying': {
      core: 'Lie on your side and lift the top leg out to the side, which trains the glutes at the side of your hip.',
      cues: ['Keep one hip directly above the other', 'Lead with the heel'],
      joint: 'If the outside of your hip is tender, skip lying on that side. Keep the lifting leg from drifting across your body.'
    },
    'abd-clamshell':      { core: 'Lie on your side with your knees bent and open the top knee like a clamshell.' },
    'abd-band-standing': {
      core: 'Stand holding a support and move one leg out to the side against a band.',
      joint: 'Your standing leg works to keep you steady, so this doubles as balance practice.'
    },
    'abd-seated-band': {
      core: 'Sit tall and press your knees apart against a band, with no balance needed.',
      joint: 'Sitting bends your hips only a little, so this suits most hips.'
    },
    'abd-machine': {
      core: 'Sit on the machine and press the pads apart with your knees, an easy movement to repeat.',
      steps: ['Sit with the pads on the outside of your knees.', 'Lean slightly forward from the hips and press the pads apart.', 'Return slowly without letting the weights rest between reps.'],
      joint: 'Sitting bends your hips a fair amount. Make the movement smaller if you feel a pinch at the front of your hip.'
    },
    'abd-bridged': {
      core: 'A variation of the machine press where you lift your hips slightly off the seat while pressing apart.',
      joint: 'Notice the front of your hip, and make the movement smaller if it pinches.'
    },
    'abd-cable-30': {
      core: 'Move your leg out and slightly back against a cable while holding a support.',
      steps: ['Attach an ankle strap to a low cable and hold a support.', 'Move the working leg out and slightly behind you, on a gentle diagonal.', 'Lower under control. Do all reps, then switch.']
    },
    'abd-cable-er': {
      core: 'Sit and turn your thigh outward against a cable or band, keeping your thigh still.',
      steps: ['Sit tall with a cable or band attached at your ankle.', 'Keep your thigh still and swing your foot inward, which turns your hip outward.', 'Return slowly.']
    },
    'abd-med-thrust':     { core: 'A hip thrust with a band above your knees, pressing your knees gently outward as you lift.' },
    'abd-side-step': {
      core: 'Step sideways with your knees slightly bent and a band above your knees, keeping the band tight.',
      steps: ['Place a band just above your knees and bend your knees a little.', 'Step sideways, keeping tension on the band throughout.', 'Take 10 to 20 steps each direction.']
    },
    'abd-kickback':       { core: 'Move one leg straight behind you against a light band or cable, holding a support.' }
  }
};

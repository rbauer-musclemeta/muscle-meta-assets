/* =============================================================================
   MM™ Glute training module · shared data
   Source: NotebookLM "Glute Training: Anatomy, Exercises, and Program Design".
   src: 'notes' = named in the source notes · 'added' = clinical addition by MM™
   Flags are "friendly" flags: true = this exercise is typically easier on that
   region. They drive the comfort filters and the joint-friendly swap logic.
   ========================================================================== */
(function (root) {
  'use strict';

  var CATS = {
    bridge: { label: 'Thrust / bridge', short: 'Thrust', plane: 'Horizontal', cost: 'Lower', blurb: 'Hip extension with the load across the hips. Less muscle damage than vertical work, so it recovers quickly.' },
    squat:  { label: 'Squat / lunge',   short: 'Squat',  plane: 'Vertical',   cost: 'Higher', blurb: 'Knee and hip bending under load. Closest to the chair, stair and floor tasks of daily life.' },
    hinge:  { label: 'Hinge',           short: 'Hinge',  plane: 'Vertical',   cost: 'Higher', blurb: 'Straighter-leg hip extension. Powerful, but the most demanding on the lower back, so progress with care.' },
    abd:    { label: 'Abduction',       short: 'Abduct', plane: 'Lateral / rotary', cost: 'Lowest', blurb: 'Sideways and rotary hip work for the gluteus medius and minimus. The source calls this "penalty-free" volume.' }
  };

  var LEVELS = {
    1: { name: 'Foundation', blurb: 'Learn the patterns, build consistency, stay well short of failure.' },
    2: { name: 'Build',      blurb: 'Add external load and single-leg control while keeping good form.' },
    3: { name: 'Advance',    blurb: 'Heavier, more complex work with deliberate fatigue management.' }
  };

  var EVIDENCE = {
    est:  { label: 'Established',    cls: 'ev-est',  text: 'Consistent findings across multiple controlled studies or reviews.' },
    prom: { label: 'Promising',      cls: 'ev-prom', text: 'Supported by some studies, often small or short. Reasonable to apply, but not settled.' },
    unp:  { label: 'Unproven bridge', cls: 'ev-unp', text: 'Practitioner reasoning that is plausible but not directly tested. We label it so you can weigh it.' }
  };

  /* ---------------------------------------------------------------------------
     EXERCISES
     lvl = lowest level at which we would introduce it (1 Foundation, 2 Build, 3 Advance)
     emph: um = upper glute max · lm = lower glute max · mm = medius and minimus
     flags (true = friendly): knee, spine, balance (low demand), hip (limited hip bend / no adducted compression)
     ------------------------------------------------------------------------ */
  var EXERCISES = [
    /* ---------------- THRUST / BRIDGE ---------------- */
    { id:'bridge-floor', name:'Glute bridge', cat:'bridge', lvl:1, emph:['lm','um'], side:'Both legs', dom:'Hip', equip:'None',
      blurb:'The simplest way to learn hip extension. Lying down, so balance and joints are barely challenged.',
      steps:['Lie on your back, knees bent, feet flat and hip-width apart, heels under your knees.','Press through your whole foot and lift your hips until shoulders, hips and knees make one line.','Pause for a second at the top, then lower over three seconds.'],
      cues:['Ribs down, tailbone tucked slightly','Push the floor away through your heels'],
      errors:['Arching the low back to get extra height','Pushing through the toes, which shifts work to the thigh'],
      easier:'Shorten the range and use a pillow under your hips for a gentler start.', harder:'Hold a dumbbell on your hips, add a band above the knees, or move to the single-leg bridge.',
      joint:'Usually well tolerated by knees and hips. After a hip or knee replacement, follow your surgeon\'s precautions.',
      flags:{knee:1,spine:1,balance:1,hip:1}, src:'notes', light:false },

    { id:'bridge-banded', name:'Banded glute bridge', cat:'bridge', lvl:1, emph:['lm','mm'], side:'Both legs', dom:'Hip', equip:'Mini band',
      blurb:'The same bridge with a band above the knees, which adds sideways effort for the gluteus medius.',
      steps:['Place a mini band just above your knees and set up as for the glute bridge.','Keep gentle outward pressure into the band throughout.','Lift, pause one second, lower slowly.'],
      cues:['Knees track over the second toe','Spread the floor apart with your feet'],
      errors:['Letting the knees fall inward as you lift','Squeezing the band so hard the hips tilt'],
      easier:'Use a lighter band, or no band.', harder:'Add load across the hips, or pause for three seconds at the top.',
      joint:'Same joint profile as the floor bridge. Stop if the outer hip becomes tender.',
      flags:{knee:1,spine:1,balance:1,hip:1}, src:'added', light:true },

    { id:'bridge-bench', name:'Bench hip thrust (bodyweight)', cat:'bridge', lvl:1, emph:['lm','um'], side:'Both legs', dom:'Hip', equip:'Sturdy bench or sofa',
      blurb:'Shoulders supported on a surface so the hips travel through a longer range than a floor bridge.',
      steps:['Sit on the floor with your upper back against the edge of a stable bench.','Feet flat, knees bent. Drive your hips up until your torso is level.','Pause, then lower until your hips nearly touch the floor.'],
      cues:['Chin tucked, eyes forward','Shins close to vertical at the top'],
      errors:['Bench slides away (use a wall)','Overextending the low back at the top'],
      easier:'Use a lower surface or return to the floor bridge.', harder:'Hold a dumbbell across the hips and add a two-second pause.',
      joint:'Gentle on knees. Getting down to and up from the floor may be the real challenge; use a higher surface if needed.',
      flags:{knee:1,spine:1,balance:1,hip:1}, src:'added', light:false },

    { id:'bridge-hipthrust', name:'Barbell hip thrust with pause', cat:'bridge', lvl:2, emph:['lm','um'], side:'Both legs', dom:'Hip', equip:'Barbell, Smith machine or plate-loaded machine',
      blurb:'The loadable version of the bench thrust. The source suggests a pause at the top and varying the setup (barbell, Smith, plate-loaded).',
      steps:['Sit with your upper back on a bench and the bar padded across your hips.','Drive up through your feet until your torso is level. Hold two seconds.','Lower under control and keep tension on the glutes.'],
      cues:['Stack ribs over pelvis at the top','Squeeze, then count "one-Mississippi, two-Mississippi"'],
      errors:['Hyperextending the low back','Letting the bar roll toward the belly'],
      easier:'Drop to the dumbbell version.', harder:'Add pause time, add load slowly, or move to the B-stance or single-leg version.',
      joint:'Loads the hips with little spinal compression. Exhale on the effort; avoid holding your breath on heavy sets.',
      flags:{knee:1,spine:1,balance:1,hip:1}, src:'notes', light:false },

    { id:'bridge-single', name:'Single-leg glute bridge', cat:'bridge', lvl:2, emph:['lm','mm'], side:'One leg', dom:'Hip', equip:'None',
      blurb:'Halves the base of support, so the gluteus medius has to keep the pelvis level while the gluteus maximus lifts.',
      steps:['Set up for a glute bridge, then extend one leg so the thigh lines up with the other thigh.','Lift through the planted heel, keeping hips level.','Lower under control. Complete all reps, then switch.'],
      cues:['Level hips, as if balancing a tray','Push through the planted heel'],
      errors:['Hip on the free side drops','Rotating the trunk to lift higher'],
      easier:'Rest the free foot lightly on the floor (a "kickstand").', harder:'Add a weight on the hips or elevate the shoulders.',
      joint:'Gentle on the joints. A good check on side-to-side strength differences.',
      flags:{knee:1,spine:1,balance:1,hip:1}, src:'notes', light:false },

    { id:'bridge-barbell', name:'Barbell glute bridge (floor)', cat:'bridge', lvl:2, emph:['lm','um'], side:'Both legs', dom:'Hip', equip:'Barbell or heavy dumbbell',
      blurb:'A shorter-range loaded bridge from the floor. The source uses it for a heavy lockout squeeze.',
      steps:['Lie on the floor with the load padded across your hips.','Drive up to full hip extension. Squeeze at the top.','Lower until the weight lightly touches the floor.'],
      cues:['Finish tall, not arched','Keep tension between reps'],
      errors:['Bouncing the weight off the floor','Letting the knees cave in'],
      easier:'Use a lighter dumbbell.', harder:'Pause at the top or shift to the bench hip thrust for more range.',
      joint:'Floor start and short range keep knees and spine calm.',
      flags:{knee:1,spine:1,balance:1,hip:1}, src:'notes', light:false },

    { id:'bridge-bstance', name:'B-stance hip thrust', cat:'bridge', lvl:3, emph:['lm','um'], side:'One-leg bias', dom:'Hip', equip:'Bench, barbell or dumbbell',
      blurb:'A thrust with one foot forward and the other resting back for balance, a bridge between two-leg and one-leg work.',
      steps:['Set up for a hip thrust. Place the second foot a half-step back with only the toes touching down.','Drive mostly through the front foot.','Lower slowly. Complete reps on one side, then switch.'],
      cues:['80 percent front foot, 20 percent kickstand','Level hips throughout'],
      errors:['Pushing equally with both feet','Twisting the pelvis'],
      easier:'Use the two-leg version.', harder:'Progress to the single-leg thrust.',
      joint:'Similar to the standard hip thrust, with more balance demand.',
      flags:{knee:1,spine:1,balance:0,hip:1}, src:'notes', light:false },

    { id:'bridge-single-thrust', name:'Single-leg hip thrust', cat:'bridge', lvl:3, emph:['lm','mm'], side:'One leg', dom:'Hip', equip:'Bench',
      blurb:'The most demanding thrust variation. Lets you load one side heavily with modest weight.',
      steps:['Set up with your upper back on a bench and one foot planted.','Extend the free leg and drive the hips up.','Pause, lower, complete reps and switch.'],
      cues:['Pelvis level','Press through the whole foot'],
      errors:['Rolling the pelvis open','Overextending the low back'],
      easier:'B-stance version.', harder:'Hold a dumbbell on the working hip.',
      joint:'Balance and control demand are higher. Use a wall behind the bench.',
      flags:{knee:1,spine:1,balance:0,hip:1}, src:'notes', light:false },

    /* ---------------- SQUAT / LUNGE ---------------- */
    { id:'sit-stand', name:'Chair sit-to-stand', cat:'squat', lvl:1, emph:['lm','um'], side:'Both legs', dom:'Mixed', equip:'Sturdy chair',
      blurb:'The movement you use dozens of times a day, trained on purpose. If you can own this one, you own the pattern for independence.',
      steps:['Sit near the front edge of a sturdy chair, feet slightly behind your knees.','Lean forward from the hips until your nose is over your toes, then stand up.','Sit back slowly over three seconds. Lightly touch the seat and go again.'],
      cues:['Nose over toes','Drive the floor away, then stand tall'],
      errors:['Falling into the chair on the way down','Pushing off with the hands'],
      easier:'Use a higher seat or a cushion, or keep your hands on your thighs.', harder:'Use a lower seat, hold a weight at your chest, or pause halfway down.',
      joint:'If knees or hips complain, raise the seat. Rising and lowering slowly beats adding depth.',
      flags:{knee:1,spine:1,balance:1,hip:1}, src:'added', light:false },

    { id:'squat-box-goblet', name:'Goblet box squat', cat:'squat', lvl:2, emph:['lm','um'], side:'Both legs', dom:'Mixed', equip:'Dumbbell or kettlebell, box or bench',
      blurb:'A weight held at the chest keeps you upright, and the box gives you a repeatable depth.',
      steps:['Hold a weight at your chest and stand in front of a box set at about knee height or slightly lower.','Sit your hips back and down until you lightly touch the box.','Stand by driving your feet into the floor.'],
      cues:['Elbows pointing down','Sit between your hips, not behind them'],
      errors:['Collapsing onto the box','Knees falling inward'],
      easier:'Raise the box or return to the chair sit-to-stand.', harder:'Lower the box toward parallel or progress to the goblet squat.',
      joint:'The box limits depth so you can stay in a comfortable hip and knee range.',
      flags:{knee:1,spine:1,balance:1,hip:1}, src:'added', light:false },

    { id:'squat-goblet', name:'Goblet squat', cat:'squat', lvl:2, emph:['lm','um'], side:'Both legs', dom:'Mixed', equip:'Dumbbell or kettlebell',
      blurb:'A free squat to a comfortable depth. The source notes deeper squats may build more glute muscle than shallow ones, and going past parallel adds little.',
      steps:['Hold a weight at your chest, feet shoulder-width, toes slightly out.','Lower until your thighs are about parallel or as deep as is comfortable.','Stand up through your whole foot.'],
      cues:['Chest tall, knees track over toes','Take your time at the bottom'],
      errors:['Heels lifting','Rounding at the bottom of the squat'],
      easier:'Use a box to set depth.', harder:'Pause at the bottom or progress to the barbell squat.',
      joint:'Depth is yours to choose. Stay in a range that is pain-free.',
      flags:{knee:0,spine:1,balance:1,hip:0}, src:'notes', light:false },

    { id:'squat-highbar', name:'High-bar squat to parallel', cat:'squat', lvl:3, emph:['lm','um'], side:'Both legs', dom:'Quad bias', equip:'Barbell, rack',
      blurb:'The classic loaded squat. In the source program it stops at parallel, since going deeper adds little glute benefit and more joint wear.',
      steps:['Rest the bar on your upper back, feet shoulder-width.','Brace, sit down until thighs are parallel, then drive up.','Use a rack with safety bars set just below your lowest rep.'],
      cues:['Brace before you descend','Knees follow the toes'],
      errors:['Folding forward at the hips','Letting the knees drift inward'],
      easier:'Goblet squat or leg press.', harder:'Pause at the bottom for one second.',
      joint:'Axial load on the spine: not the first choice for low bone density. Swap to a leg press.',
      flags:{knee:0,spine:0,balance:1,hip:0}, src:'notes', light:false },

    { id:'legpress-hip', name:'Leg press, feet high and wide', cat:'squat', lvl:2, emph:['lm','um'], side:'Both legs', dom:'Hip bias', equip:'Leg press machine',
      blurb:'Machine support makes it a safe place to load the hips and thighs. Feet higher on the platform shift more work to the glutes.',
      steps:['Sit with your back flat on the pad and feet high and slightly wide on the platform.','Lower until your knees are about 90 degrees, or until your pelvis is about to lift.','Press back without locking your knees.'],
      cues:['Keep your hips glued to the seat','Press through the heels and mid-foot'],
      errors:['Letting the tailbone curl off the pad','Locking the knees at the top'],
      easier:'Lighter load, shorter range.', harder:'Single-leg leg press or a slow three-second lowering phase.',
      joint:'Supported and predictable. Usually friendlier than free squats for knees and balance.',
      flags:{knee:1,spine:1,balance:1,hip:1}, src:'notes', light:false },

    { id:'legpress-single', name:'Single-leg leg press', cat:'squat', lvl:2, emph:['lm','um'], side:'One leg', dom:'Hip bias', equip:'Leg press machine',
      blurb:'Trains each leg separately without any balance demand.',
      steps:['Set up as for the leg press with one foot high on the platform.','Lower to about 90 degrees at the knee, press back.','Complete reps on one side, then switch.'],
      cues:['Keep the knee in line with the second toe','Both hips stay on the seat'],
      errors:['Pelvis twisting','Rushing the lowering'],
      easier:'Use both legs.', harder:'Pause at the bottom.',
      joint:'Same profile as the two-leg press with a lighter weight.',
      flags:{knee:1,spine:1,balance:1,hip:1}, src:'notes', light:false },

    { id:'stepup', name:'Step-up with handrail', cat:'squat', lvl:1, emph:['lm','um','mm'], side:'One leg', dom:'Mixed', equip:'Low step, handrail',
      blurb:'A direct rehearsal for stairs. Use a rail to take the balance bottleneck out of the picture.',
      steps:['Stand facing a low step (4 to 6 inches to start) with a hand lightly on a rail.','Place your whole foot on the step and stand up through that leg.','Lower slowly with control. Do all reps, then switch.'],
      cues:['Whole foot on the step','Lower for three seconds'],
      errors:['Pushing off the back foot','Pulling up on the rail'],
      easier:'Lower step, use two hands.', harder:'Higher step, then dumbbells.',
      joint:'Pick a height that gives no knee pain. A leaning torso shifts load to the hip.',
      flags:{knee:1,spine:1,balance:0,hip:1}, src:'notes', light:false },

    { id:'split-static', name:'Supported split squat', cat:'squat', lvl:1, emph:['lm','um','mm'], side:'One leg', dom:'Mixed', equip:'Counter or rail for support',
      blurb:'A staggered stance that trains one leg at a time while a hand keeps you steady.',
      steps:['Hold a counter or rail. Step one foot back into a staggered stance.','Lower the back knee straight down toward the floor.','Press through the front foot to stand. Do all reps, then switch.'],
      cues:['Torso tall, or leaning slightly forward for more hip','Front heel stays down'],
      errors:['Stance too short, which loads the knee','Pushing off the back foot'],
      easier:'Reduce the depth.', harder:'Hold dumbbells or move to the Bulgarian split squat.',
      joint:'A longer stance and a slight forward lean shift work toward the hip and away from the knee.',
      flags:{knee:0,spine:1,balance:1,hip:1}, src:'notes', light:false },

    { id:'reverse-lunge', name:'Reverse lunge (Smith machine or rail)', cat:'squat', lvl:2, emph:['lm','um'], side:'One leg', dom:'Hip bias', equip:'Smith machine or support',
      blurb:'Stepping backwards is easier on the knee than stepping forwards. Sitting the hips back adds glute work.',
      steps:['Stand holding a rail, or with the bar of a Smith machine on your upper back.','Step one foot back and lower until the front thigh is near parallel.','Press through the front foot to return. Switch sides.'],
      cues:['Sit back into the front hip','Land softly on the ball of the back foot'],
      errors:['Front knee shoots forward','Leaning on the back foot'],
      easier:'Shorter step and depth.', harder:'Add dumbbells or slow the lowering.',
      joint:'Machine stability reduces balance demand. Check the depth against your knee comfort.',
      flags:{knee:0,spine:1,balance:1,hip:1}, src:'notes', light:false },

    { id:'walking-lunge', name:'Walking lunge', cat:'squat', lvl:2, emph:['lm','um'], side:'One leg', dom:'Mixed', equip:'Open space',
      blurb:'Repeated single-leg stepping that resembles walking under load.',
      steps:['Step forward into a lunge, lower under control.','Push through the front foot to bring the back leg through into the next step.','Walk along a clear path of 6 to 8 steps each leg.'],
      cues:['Short steady steps','Stand tall between steps'],
      errors:['Steps too narrow, wobbling sideways','Letting the knee drift inward'],
      easier:'Do stationary or supported split squats.', harder:'Hold dumbbells at your sides.',
      joint:'High balance and knee demand. Not the first choice for knee pain or fall risk.',
      flags:{knee:0,spine:1,balance:0,hip:1}, src:'notes', light:false },

    { id:'bulgarian', name:'Bulgarian split squat (hand support)', cat:'squat', lvl:3, emph:['lm','um'], side:'One leg', dom:'Mixed', equip:'Bench, rail for hand support',
      blurb:'A deep single-leg squat with the back foot elevated. The source keeps a hand on a support to drive the lower glute max into a deep stretch.',
      steps:['Rest the top of one foot on a bench behind you. Hold a support.','Lower straight down, torso leaning slightly forward.','Drive through the front heel to stand.'],
      cues:['Front foot far enough forward that your shin stays near vertical','Control the bottom'],
      errors:['Front foot too close','Pushing from the back foot'],
      easier:'Supported split squat with the back foot on the floor.', harder:'Add a dumbbell in the opposite hand.',
      joint:'Deep knee and hip bend under load. Skip it if you have knee or hip pain in deep flexion.',
      flags:{knee:0,spine:1,balance:0,hip:0}, src:'notes', light:false },

    /* ---------------- HINGE ---------------- */
    { id:'hinge-wall', name:'Wall-tap hip hinge', cat:'hinge', lvl:1, emph:['lm'], side:'Both legs', dom:'Hip', equip:'Wall',
      blurb:'Learn to fold at the hips with a long spine before adding any weight.',
      steps:['Stand one foot-length in front of a wall, soft knees.','Push your hips back to tap the wall, keeping your spine long.','Squeeze your glutes to stand tall.'],
      cues:['Hips back, not down','Back long, like a table top'],
      errors:['Squatting down instead of folding','Rounding the back'],
      easier:'Move closer to the wall.', harder:'Hold a light weight against your chest or move to the bodyweight good morning.',
      joint:'Good first lesson for the hips and spine.',
      flags:{knee:1,spine:1,balance:1,hip:1}, src:'added', light:false },

    { id:'hinge-bw', name:'Bodyweight good morning', cat:'hinge', lvl:1, emph:['lm'], side:'Both legs', dom:'Hip', equip:'None',
      blurb:'A hip hinge with hands behind your head. Practising the hinge pattern before loading it.',
      steps:['Place your hands behind your head or across your chest.','Push your hips back and tip your torso forward with a flat back.','Stand tall by squeezing your glutes.'],
      cues:['Soft knees','Move at the hip only'],
      errors:['Rounding the spine','Knees locking straight'],
      easier:'Wall-tap hinge.', harder:'Light dumbbell RDL.',
      joint:'Keep the range pain-free. A little hamstring stretch is normal.',
      flags:{knee:1,spine:1,balance:1,hip:1}, src:'notes', light:false },

    { id:'rdl-db', name:'Dumbbell Romanian deadlift (RDL)', cat:'hinge', lvl:1, emph:['lm'], side:'Both legs', dom:'Hip', equip:'Dumbbells',
      blurb:'A light dumbbell RDL is the gentlest loaded hinge. Slide the weights down your thighs to just below the knee.',
      steps:['Hold dumbbells in front of your thighs.','Push your hips back, sliding the weights down your legs, spine neutral.','When you feel a hamstring stretch, squeeze your glutes to stand.'],
      cues:['Dumbbells stay close to your legs','Long back, soft knees'],
      errors:['Reaching for the floor with a rounded back','Bending the knees into a squat'],
      easier:'Bodyweight good morning.', harder:'Barbell RDL or single-leg RDL.',
      joint:'Keep to a depth where your back stays flat. Do not chase range.',
      flags:{knee:1,spine:0,balance:1,hip:1}, src:'notes', light:false },

    { id:'rdl-bb', name:'Barbell RDL', cat:'hinge', lvl:2, emph:['lm'], side:'Both legs', dom:'Hip', equip:'Barbell',
      blurb:'The heavier cousin of the dumbbell RDL. Mixing deadlift and good-morning variants is suggested in the source.',
      steps:['Hold the bar at hip height, shoulder-width grip.','Hinge back and slide the bar down your thighs to below the knee.','Drive your hips forward to stand.'],
      cues:['Bar stays on the legs','Neutral spine throughout'],
      errors:['Bar drifting forward','Rounding the low back'],
      easier:'Dumbbell RDL.', harder:'Slow three-second lowering.',
      joint:'Moderate spinal load. Stay away from failure on this exercise.',
      flags:{knee:1,spine:0,balance:1,hip:1}, src:'notes', light:false },

    { id:'pullthrough', name:'Cable pull-through', cat:'hinge', lvl:2, emph:['lm'], side:'Both legs', dom:'Hip', equip:'Cable machine, rope',
      blurb:'A cable hinge that keeps tension on the glutes and asks very little of the spine.',
      steps:['Face away from a low cable, rope between your legs.','Hinge back, letting the rope travel behind you.','Drive your hips forward to stand tall.'],
      cues:['Arms like ropes: let the hips do the work','Finish tall, not leaning back'],
      errors:['Turning it into a squat','Leaning back at the top'],
      easier:'Lighter stack, shorter range.', harder:'Slow lowering and a pause at the top.',
      joint:'A kind choice when barbell hinges bother your back.',
      flags:{knee:1,spine:1,balance:1,hip:1}, src:'added', light:false },

    { id:'hyper45', name:'45-degree hyper', cat:'hinge', lvl:2, emph:['lm'], side:'Both legs', dom:'Hip', equip:'45-degree hyper bench',
      blurb:'A supported hinge. The source flares the feet and rounds the upper back to isolate the glutes; for most readers we recommend a neutral spine instead.',
      steps:['Set the pad just below your hips, feet secured.','Hinge forward from the hips with a long spine.','Raise to a straight line, not beyond.'],
      cues:['Stop when your body is in one line','Squeeze the glutes, not the low back'],
      errors:['Overextending at the top','Using momentum'],
      easier:'Cable pull-through.', harder:'Hold a plate at your chest.',
      joint:'If you have osteoporosis or a history of spinal fracture, avoid the rounded-back version entirely and choose the pull-through.',
      flags:{knee:1,spine:0,balance:1,hip:1}, src:'notes', light:false },

    { id:'sl-rdl', name:'Single-leg RDL (hand support)', cat:'hinge', lvl:2, emph:['lm','mm'], side:'One leg', dom:'Hip', equip:'Support, dumbbell optional',
      blurb:'One hand on a rail or rack keeps balance from limiting the glute work.',
      steps:['Hold a support with one hand. Shift weight to one leg.','Hinge forward while the free leg extends behind you.','Return to standing by squeezing the glute of the standing leg.'],
      cues:['Hips stay square to the floor','Free leg in line with the torso'],
      errors:['Opening the hips','Rounding the back'],
      easier:'Kickstand RDL (toe lightly down).', harder:'Hold a dumbbell in the opposite hand.',
      joint:'Balance demand is high without support. Use it generously.',
      flags:{knee:1,spine:0,balance:0,hip:1}, src:'notes', light:false },

    { id:'reverse-hyper', name:'Reverse hyper', cat:'hinge', lvl:3, emph:['lm'], side:'Both legs', dom:'Hip', equip:'Reverse hyper machine',
      blurb:'Swings the legs behind you while the torso is supported on a pad.',
      steps:['Lie face-down on the pad with hips at the edge.','Lift your legs to a straight line with the torso.','Lower slowly and keep the movement controlled.'],
      cues:['Lift to level, no higher','Slow descent'],
      errors:['Swinging the legs with momentum','Overarching the back'],
      easier:'Cable pull-through.', harder:'Pause at the top.',
      joint:'Spine-conscious option: skip if you have low bone density or acute back pain.',
      flags:{knee:1,spine:0,balance:1,hip:1}, src:'notes', light:false },

    { id:'good-morning', name:'Good morning (light, controlled)', cat:'hinge', lvl:3, emph:['lm'], side:'Both legs', dom:'Hip', equip:'Barbell or band',
      blurb:'A light, controlled hinge with the bar on your back. The source mixes this with deadlift variations.',
      steps:['Place a light bar on your upper back.','Hinge back with a flat spine until your torso nears parallel.','Squeeze your glutes to stand.'],
      cues:['Light loads only','Slow, deliberate reps'],
      errors:['Going too heavy','Rounding'],
      easier:'Dumbbell RDL.', harder:'Pause at the bottom.',
      joint:'The long lever arm loads the spine. Not for people with osteoporosis.',
      flags:{knee:1,spine:0,balance:1,hip:1}, src:'notes', light:false },

    { id:'deadlift-conv', name:'Conventional deadlift (not to failure)', cat:'hinge', lvl:3, emph:['lm','um'], side:'Both legs', dom:'Hip', equip:'Barbell',
      blurb:'The source cautions about deadlifts taken to failure because of the eccentric load on the back extensors.',
      steps:['Set the bar over mid-foot. Hinge, grip, brace.','Push the floor away and stand tall.','Lower with the same path and reset between reps.'],
      cues:['Stop with 2 to 3 reps still in reserve','Reset each rep'],
      errors:['Squatting the deadlift','Grinding through a rounded back'],
      easier:'Barbell RDL.', harder:'Pause below the knee.',
      joint:'High spinal demand. Keep a clear margin from failure.',
      flags:{knee:1,spine:0,balance:1,hip:1}, src:'notes', light:false },

    /* ---------------- ABDUCTION ---------------- */
    { id:'abd-sidelying', name:'Side-lying hip raise', cat:'abd', lvl:1, emph:['mm','um'], side:'One leg', dom:'Hip', equip:'Mat',
      blurb:'Frontal-plane abduction lying down. The source uses it first in the session when upper glutes are the goal.',
      steps:['Lie on your side, bottom knee bent for stability, top leg straight and slightly behind your body.','Raise the top leg about 30 to 45 degrees, toes forward.','Lower slowly. Do all reps, then roll over.'],
      cues:['Keep your hips stacked','Lead with the heel'],
      errors:['Rolling backwards to lift higher','Swinging the leg'],
      easier:'Use a smaller range or a standing version.', harder:'Add an ankle weight or a band above the knees.',
      joint:'If the outside of your hip is tender, skip lying on that side. Do not let the lifting leg cross the midline of the body.',
      flags:{knee:1,spine:1,balance:1,hip:0}, src:'notes', light:false },

    { id:'abd-clamshell', name:'Clamshell (hip rotation)', cat:'abd', lvl:1, emph:['mm'], side:'One leg', dom:'Hip', equip:'Mat, mini band optional',
      blurb:'A small hip external-rotation drill that teaches the deep side hip muscles to switch on.',
      steps:['Lie on your side with knees bent about 45 degrees and heels together.','Rotate the top knee up without rolling your pelvis back.','Lower slowly and repeat.'],
      cues:['Small, controlled motion','Pelvis stays still'],
      errors:['Rolling the pelvis back','Lifting the feet apart'],
      easier:'Without a band.', harder:'Band above the knees, slower tempo.',
      joint:'A gentle starter for hip and knee. Avoid it if side-lying on that hip is painful.',
      flags:{knee:1,spine:1,balance:1,hip:0}, src:'notes', light:true },

    { id:'abd-band-standing', name:'Banded standing hip abduction', cat:'abd', lvl:1, emph:['mm','um'], side:'One leg', dom:'Hip', equip:'Mini band, support',
      blurb:'Standing with a hand on support, you train the lifting hip and the standing hip at once.',
      steps:['Loop a band around both ankles or just above the knees; hold a support.','Move one leg out to the side at a slight diagonal.','Return slowly. Keep the trunk upright.'],
      cues:['Stand tall, do not lean','Slight diagonal, as if toward 2 o\'clock'],
      errors:['Leaning away to cheat','Letting the foot swing forward'],
      easier:'Lighter band, smaller range.', harder:'Stronger band or hold at the end for two seconds.',
      joint:'The standing leg does stabilising work: a useful balance drill too.',
      flags:{knee:1,spine:1,balance:0,hip:1}, src:'notes', light:true },

    { id:'abd-seated-band', name:'Banded seated hip abduction', cat:'abd', lvl:1, emph:['mm','um'], side:'Both legs', dom:'Hip', equip:'Mini band, chair',
      blurb:'Seated, so balance and joints are barely involved. A good starter for older exercisers.',
      steps:['Sit tall on a chair with a band just above the knees.','Press your knees apart as far as is comfortable.','Return slowly and keep the pressure on.'],
      cues:['Tall spine','Slow return'],
      errors:['Leaning back to make it easier','Using momentum'],
      easier:'Lighter band.', harder:'Lean slightly forward from the hips to bias the upper glutes.',
      joint:'Hip flexion is mild, so it suits most hips.',
      flags:{knee:1,spine:1,balance:1,hip:1}, src:'notes', light:true },

    { id:'abd-machine', name:'Seated hip abduction machine', cat:'abd', lvl:2, emph:['um','mm'], side:'Both legs', dom:'Hip', equip:'Abduction machine',
      blurb:'Easy to load and repeat. Leaning forward from the hips shifts work toward the upper glutes and glute max.',
      steps:['Sit with pads on the outside of your knees.','Lean slightly forward from the hips and press the pads apart.','Return slowly without letting the stack touch down.'],
      cues:['Lean forward from the hips','Smooth tempo'],
      errors:['Bouncing at the end range','Using too much weight'],
      easier:'Banded seated hip abduction.', harder:'Pause for one second at the widest point.',
      joint:'Moderate hip flexion in the seated position. Reduce range if you feel a pinch at the front of the hip.',
      flags:{knee:1,spine:1,balance:1,hip:1}, src:'notes', light:false },

    { id:'abd-bridged', name:'Bridged seated hip abduction', cat:'abd', lvl:2, emph:['mm','um'], side:'Both legs', dom:'Hip', equip:'Abduction machine',
      blurb:'Variation that adds a bridge to the seated movement. The source says it targets the posterior heads of the gluteus medius.',
      steps:['Set up on the abduction machine as usual.','Lift your hips slightly off the seat while pressing apart.','Lower and repeat.'],
      cues:['Hips lightly off the seat','Control throughout'],
      errors:['Rocking','Excessive load'],
      easier:'Standard seated abduction.', harder:'Extend the pause.',
      joint:'Pay attention to the hip front. Reduce range if it pinches.',
      flags:{knee:1,spine:1,balance:1,hip:1}, src:'notes', light:false },

    { id:'abd-cable-30', name:'Cable hip abduction at a 30-degree diagonal', cat:'abd', lvl:2, emph:['mm','um'], side:'One leg', dom:'Hip', equip:'Cable, ankle strap, support',
      blurb:'The source\'s preferred angle for the glute medius, because it follows the fibre direction. If you struggle with the form, straight out to the side is still effective.',
      steps:['Attach an ankle strap to a low cable; hold a support.','Move the working leg out and slightly behind, along a 30-degree diagonal.','Lower under control. Do all reps, then switch.'],
      cues:['Lead with the heel','Hips square'],
      errors:['Leaning the trunk','Swinging the leg'],
      easier:'Banded standing abduction.', harder:'Pause for two seconds at the top.',
      joint:'Use a support. A stable stance matters more than an exact angle.',
      flags:{knee:1,spine:1,balance:0,hip:1}, src:'notes', light:false },

    { id:'abd-cable-er', name:'Cable hip external rotation', cat:'abd', lvl:2, emph:['mm'], side:'One leg', dom:'Hip', equip:'Cable or band, bench',
      blurb:'Rotates the thigh outward from the hip. A rotary challenge for the deep hip muscles.',
      steps:['Sit tall with a cable or band at the ankle.','Keep the thigh still and rotate the thigh outward so the foot sweeps inward.','Return slowly.'],
      cues:['Thigh stays still','Small, controlled arc'],
      errors:['Moving the pelvis','Pulling the knee out of line'],
      easier:'Clamshell.', harder:'Slower tempo.',
      joint:'Gentle for the knee if the thigh stays still. Stay in a pain-free arc.',
      flags:{knee:0,spine:1,balance:1,hip:1}, src:'notes', light:false },

    { id:'abd-med-thrust', name:'Glute medius hip thrust (banded)', cat:'abd', lvl:3, emph:['mm','um'], side:'One-leg bias', dom:'Hip', equip:'Bench, mini band',
      blurb:'The source names this exercise without describing it. This is our standard interpretation: a hip thrust with a band above the knees and outward knee drive, to combine lateral and rotary demand.',
      steps:['Set up a hip thrust with a mini band above the knees.','Press the knees gently outward and drive up.','Hold, then lower slowly.'],
      cues:['Knees out','Level hips'],
      errors:['Knees collapsing as you tire','Overarching'],
      easier:'Banded glute bridge.', harder:'Single-leg version.',
      joint:'Same joint profile as the standard hip thrust.',
      flags:{knee:1,spine:1,balance:1,hip:1}, src:'notes', light:false },

    { id:'abd-side-step', name:'Banded side-stepping', cat:'abd', lvl:1, emph:['mm','um'], side:'Alternating', dom:'Hip', equip:'Mini band',
      blurb:'Constant gentle tension for the sideways muscles. A good finisher.',
      steps:['Place a band just above your knees; take a quarter-squat stance.','Step sideways, keeping tension on the band throughout.','Take 10 to 20 steps each direction.'],
      cues:['Feet hip-width apart','Do not let the band snap back'],
      errors:['Toes pointing out and rolling in','Trunk lean'],
      easier:'Do it holding a counter.', harder:'Stronger band.',
      joint:'Do it next to a counter if balance is uncertain.',
      flags:{knee:1,spine:1,balance:0,hip:1}, src:'notes', light:true },

    { id:'abd-kickback', name:'Banded or cable kickback', cat:'abd', lvl:1, emph:['lm','um'], side:'One leg', dom:'Hip', equip:'Cable or band, support',
      blurb:'A light option for tired days, as the source suggests. Done standing with a hand on support.',
      steps:['Attach the strap to your ankle; hold a support.','Move the leg straight behind you without arching your back.','Return slowly.'],
      cues:['Ribs down','Small range'],
      errors:['Arching to gain range','Swinging'],
      easier:'Without resistance.', harder:'Pause for two seconds.',
      joint:'Keep the range small so your lower back stays quiet.',
      flags:{knee:1,spine:1,balance:0,hip:1}, src:'notes', light:true }
  ];

  /* ---------------------------------------------------------------------------
     PROGRAM TEMPLATES (3 days per week · one exercise per category per session)
     The source gives the principles and an Advance-style sample. The Foundation and
     Build templates are MM™ clinical applications of those principles.
     slot: [category, exerciseId, sets, reps, note]
     ------------------------------------------------------------------------ */
  var PLANS = {
    1: {
      days: [
        { name:'Day 1', theme:'Learn the patterns', slots:[
          ['abd','abd-sidelying',2,'10–12','Slow lowering, hips stacked'],
          ['bridge','bridge-floor',2,'10–12','1-second pause at the top'],
          ['squat','sit-stand',2,'8–10','3-second lowering'],
          ['hinge','hinge-wall',2,'10','Long spine, soft knees']
        ]},
        { name:'Day 2', theme:'Add the band', slots:[
          ['abd','abd-band-standing',2,'10–12 each leg','Hand on support'],
          ['bridge','bridge-banded',2,'10–12','Press out into the band'],
          ['squat','stepup',2,'8 each leg','Low step, rail'],
          ['hinge','rdl-db',2,'10','Very light weights']
        ]},
        { name:'Day 3', theme:'Longer range', slots:[
          ['abd','abd-seated-band',2,'12–15','Chair, tall spine'],
          ['bridge','bridge-bench',2,'10–12','Bodyweight, 1-second pause'],
          ['squat','split-static',2,'8 each leg','Hold a counter'],
          ['hinge','hinge-bw',2,'10','Slow tempo']
        ]}
      ]
    },
    2: {
      days: [
        { name:'Day 1', theme:'Heavy horizontal and single-leg lunge', slots:[
          ['abd','abd-machine',2,'12–15','Lean forward from the hips'],
          ['bridge','bridge-hipthrust',3,'8–10','2-second pause at the top'],
          ['squat','reverse-lunge',2,'10 each leg','Rail or Smith machine'],
          ['hinge','rdl-db',2,'10–12','Back flat'],
          ['abd','abd-band-standing',2,'15 each leg','Finisher: light tension']
        ]},
        { name:'Day 2', theme:'30-degree path and leg press', slots:[
          ['abd','abd-cable-30',2,'12–15 each leg','Use a support'],
          ['bridge','bridge-single',2,'10 each leg','Hips level'],
          ['squat','legpress-hip',2,'10–12','Feet high and wide'],
          ['hinge','pullthrough',2,'12','Finish tall'],
          ['abd','abd-bridged',2,'15','Finisher']
        ]},
        { name:'Day 3', theme:'Rotary control and safe hinge', slots:[
          ['abd','abd-cable-er',2,'12 each side','Thigh stays still'],
          ['bridge','bridge-barbell',3,'10','Lockout squeeze'],
          ['squat','squat-goblet',2,'8–10','Comfortable depth'],
          ['hinge','hyper45',2,'12','Neutral spine'],
          ['abd','abd-side-step',2,'15 steps each way','Finisher']
        ]}
      ]
    },
    3: {
      days: [
        { name:'Day 1', theme:'Heavy horizontal and unilateral lunge', slots:[
          ['abd','abd-sidelying',3,'12–15','Opens the session for the upper glutes'],
          ['bridge','bridge-hipthrust',3,'8–10','2-second pause at the top'],
          ['squat','reverse-lunge',2,'10–12 each leg','Hip-dominant: sit back'],
          ['hinge','hyper45',2,'12–15','Neutral spine'],
          ['abd','abd-machine',2,'15–20','Finisher: lean forward']
        ]},
        { name:'Day 2', theme:'30-degree cable path and deep squat stretch', slots:[
          ['abd','abd-cable-30',3,'12–15 each leg','Aligns with medius fibre direction'],
          ['bridge','bridge-bstance',2,'10–12 each leg','Heavy unilateral stimulus'],
          ['squat','squat-highbar',2,'8–10','To parallel, no deeper'],
          ['hinge','sl-rdl',2,'10–12 each leg','Hand support'],
          ['abd','abd-bridged',2,'15–20','Finisher']
        ]},
        { name:'Day 3', theme:'Rotary control and bilateral hinge', slots:[
          ['abd','abd-med-thrust',3,'10–12 each leg','Lateral and rotary demand'],
          ['bridge','bridge-barbell',3,'10–12','Lockout squeeze'],
          ['squat','bulgarian',2,'8–10 each leg','Hand support'],
          ['hinge','good-morning',2,'10–12','Light, controlled'],
          ['abd','abd-side-step',2,'20 steps each way','Finisher']
        ]}
      ]
    }
  };

  /* The source notes cite a weekly average of 32 working sets for the Advance plan; the
     sets actually listed add up to 35. The tracker computes the real total. */

  root.MMGlute = { CATS: CATS, LEVELS: LEVELS, EVIDENCE: EVIDENCE, EXERCISES: EXERCISES, PLANS: PLANS,
    byId: function (id) { for (var i = 0; i < EXERCISES.length; i++) if (EXERCISES[i].id === id) return EXERCISES[i]; return null; }
  };
})(window);

// ============================================
// edward.js
// Edward Jenner Tribute · Privacy-first · No tracking
// Pure Vanilla JS · Chapters 1–10 · Listen & Save
// ============================================

// ========== 1. WAIT FOR DOM ==========
document.addEventListener('DOMContentLoaded', () => {
  init();
});

// ========== 2. GLOBAL ELEMENTS ==========
let chaptersContainer, galleryTop, galleryBottom, cardsRow;
let liveDateTime, liveClock, visitorSpan;

// ========== 3. CHAPTERS FULL TEXT (1–10) ==========
const chaptersData = [
  { // Chapter 1
    title: "The Plague That Walked the Earth",
    scene: "Imagine, dear reader, a cold morning in rural England. The year 1750.\nHaystacks release the scent of rain. A five-year-old boy, Thomas by name, plays like other children.\nBut suddenly his forehead grows hot. His mother touches him with a trembling hand.\n'Oh God, fever!'\nHours later, small blisters appear on his face. Then his arms. Then his chest. Then his feet.\nThe mother looks out the window. Neighbors close their doors. Church bells toll.\nWithin a week, Thomas will either die suffocated by blisters covering his throat — or survive with a face forever scarred.\nThis was smallpox. Its name was Variola, the 'little plague.' But it was never little.",
    scientific: "Smallpox is an acute viral disease caused by Variola major or Variola minor.\nSymptoms: incubation 7–17 days; sudden high fever (40°C), severe headache, vomiting, back pain; then rash → pustules → scabs after 3–4 weeks.\nStatistics: 30% die; 80–90% of children under 5 die. Survivors: 80% permanent scars, 20–30% lose vision.\nEarliest documentation: China (Ge Hong, c. 340 CE); Japan (Nara period, Tōdai-ji Temple).\nSources: WHO, CDC, Chinese Academy of Medical Sciences, NIID Tokyo.",
    geographical: "England · Berkeley (village) · Gloucestershire · Geneva · Atlanta · Beijing · Tokyo · Nara · Tōdai-ji Temple",
    wisdom: "Disease knows no borders. Neither does healing. — Adapted from WHO spirit, 1948",
    invention: "Lightning Rod (1752) — Benjamin Franklin, USA. Kite experiment proved lightning is electricity. Saved countless buildings from fires.",
    inventionStory: "Philadelphia, 1752. Franklin flew a kite in a thunderstorm, proving lightning is electricity. The lightning rod he invented reduced building fires by 90%."
  },
  { // Chapter 2
    title: "The Girls Who Do Not Get Sick — The Legend of Cowpox",
    scene: "The year 1768. Chipping Sodbury, southern Gloucestershire, England.\nA young man of nineteen, sharp-eyed, wearing a blood-stained surgeon's apron, enters a small cottage. The scent of warm milk and dry hay fills the air. A girl sits on a wooden chair, her sleeve rolled up. Her arm carries small pink blisters.\nThe young man leans in. The girl asks: 'Will I die, Mr. Ludlow?'\nThe old farmer replies: 'Die? These are milkmaids! They never catch smallpox. Smallpox kills people. Cowpox? Just blisters that come and go.'\nThe young man records this in his mind. His name is Edward Jenner.",
    scientific: "Jenner observed milkmaids with cowpox never got smallpox.\nCowpox (Vaccinia) vs Smallpox (Variola): cowpox → local blisters, mild fever, 0% death; smallpox → whole body, high fever, 30–80% death.\nCross-immunity: cowpox virus and smallpox virus are so similar that immunity to one grants immunity to the other.\nSources: Jenner 1798; Jenner Museum; The Lancet 1980.",
    geographical: "Chipping Sodbury · Gloucestershire · Berkeley",
    wisdom: "Observation costs nothing. Yet it may save millions of lives. — Inspired by William Harvey",
    invention: "Separate Condenser (1769) — James Watt, Scotland/Britain. Improved steam engine, reduced coal use by 75%, powered the Industrial Revolution.",
    inventionStory: "Glasgow, 1765. Watt realized a separate condenser would save massive heat. His 1769 patent tripled engine power and cut coal consumption by 75%."
  },
  { // Chapter 3
    title: "May 14, 1796 — The Day That Changed the World",
    scene: "Berkeley, Gloucestershire, morning of May 14, 1796.\nSunlight filters through old elm trees. Edward Jenner stands in his small cottage, fragrant with dried herbs. Before him stands a small boy, eight years old, fair-haired with wide blue eyes. His name is James Phipps.\nJenner takes a deep breath. In his hand is a small wooden needle — simple, forked like a tiny fish tail.\nSarah Nelmes, a milkmaid from a neighboring farm, sits on a chair. Her right hand bears a small pink blister — fresh cowpox.\nJenner dips the needle into Sarah's blister. Looks at James. Speaks quietly: 'It won't hurt much, James.'\nQuick scratches on the boy's arm. Small cuts. A drop of blood.\nJames cries a little. His mother wipes his tear.\nThen... silence.\nTwo days later, James develops a mild fever and a few blisters. After 10 days, he heals completely.\nBut the real test has not yet come.",
    scientific: "Date: May 14, 1796. Recipient: James Phipps, age 8. Source: Sarah Nelmes (cowpox pustule).\nProcedure: 5–10 scratches with wooden needle.\nResult: local blister, mild fever, full recovery after 10 days.\nImmunity test (July 1, 1796): injection with live smallpox matter → no illness.\nConclusion: cowpox provided complete immunity.\nSources: Jenner (1798); Jenner Museum; Journal of the Royal Society of Medicine 2015.",
    geographical: "Berkeley · Gloucestershire · Jenner's Cottage · James Phipps's Cottage",
    wisdom: "True courage is not in fighting a battle. It is in bearing the consequences of what you believe. — Jenner to Dr. Gardner, 1797",
    invention: "Electric Battery (1800) — Alessandro Volta, Italy. First continuous electric current. Basis of every battery today.",
    inventionStory: "Como, Italy, 1800. Volta stacked silver and zinc discs separated by saltwater-soaked cardboard. The Voltaic Pile produced steady current — no phone, radio, or computer without it."
  },
  { // Chapter 4
    title: "Publication and Resistance — Jenner's Book Faces the World",
    scene: "London, summer of 1798.\nA small print shop on a narrow street. The smell of ink and paper. Edward Jenner, forty-nine years old, reviews the last page of his book.\nThe long title: 'An Inquiry into the Causes and Effects of the Variolae Vaccinae, a Disease Discovered in Some of the Western Counties of England, Particularly Gloucestershire.'\nThe book is thin, only 75 pages. But every page carries a bombshell: proof that cowpox protects humans from deadly smallpox.\nJenner writes the dedication: 'To John Hunter, my teacher and friend. He taught me not to think, but to try.'\nThe book is distributed. The medical world falls silent. Then... it explodes.",
    scientific: "Contents: 5 sections covering natural origin, effects on humans, observations, Q&A, and 23 documented successful vaccinations.\nOpposition: 'animal disease unsafe', 'injecting animal virus', 'coincidence from remote village', caricatures of people with cow horns.\nFirst defenders: Dr. Caleb Hillier and Dr. George Pearson (after 500 experiments).\nSources: Jenner 1798; Wellcome Library; Harvard University.",
    geographical: "London · Gloucestershire · Wellcome Library · Harvard University",
    wisdom: "Truth does not need violent defense. It only needs more experiments. — Jenner to Dr. Baron, 1800",
    invention: "Electric Battery (1800) — Alessandro Volta, Italy. (Same as chapter 3 — the invention belongs to this era.)",
    inventionStory: "Same as Chapter 3: Volta's pile created continuous electric current, enabling all future electronics."
  },

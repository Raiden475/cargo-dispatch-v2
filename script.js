/* ================================================================
   Cargo Dispatch Engine
   Algorithm : Sliding Window — Maximum-Sum Contiguous Subarray <= threshold
   Time  Complexity : O(n)
   Space Complexity : O(1)
================================================================ */

/* ─── State ─────────────────────────────────────────────────────── */

/** @type {number[]} Ordered list of package weights on the conveyor belt */
let packageWeights = [];

/** @type {number} Maximum allowable payload for the forklift in kg */
let weightLimit = 0;

/** @type {{ startIndex: number, endIndex: number, totalWeight: number } | null} */
let optimalWindow = null;

/** @type {number} Total trips successfully dispatched this session */
let dispatchedTripCount = 0;

/* ─── DOM References ─────────────────────────────────────────────── */
const weightLimitInput   = document.getElementById('weight-limit-input');
const packageCountInput  = document.getElementById('package-count-input');
const minWeightInput     = document.getElementById('min-weight-input');
const maxWeightInput     = document.getElementById('max-weight-input');
const generateBeltBtn    = document.getElementById('generate-belt-btn');
const dispatchBtn        = document.getElementById('dispatch-btn');
const packageBelt        = document.getElementById('package-belt');
const emptyState         = document.getElementById('empty-state');
const resultBanner       = document.getElementById('result-banner');
const algorithmLog       = document.getElementById('algorithm-log');
const gaugePanel         = document.getElementById('gauge-panel');
const gaugeFill          = document.getElementById('gauge-fill');
const gaugeMaxLabel      = document.getElementById('gauge-max-label');
const utilisationLabel   = document.getElementById('utilisation-label');
const statCount          = document.getElementById('stat-count');
const statLoad           = document.getElementById('stat-load');
const statResidual       = document.getElementById('stat-residual');
const statEfficiency     = document.getElementById('stat-efficiency');
const statTrips          = document.getElementById('stat-trips');
const beltPackageCount   = document.getElementById('belt-package-count');

/* ─── Random Generator ───────────────────────────────────────────── */

/**
 * Returns a random integer between min and max (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Builds a fresh belt of randomly weighted packages
 * based on the operator's configuration inputs.
 */
function generateRandomBelt() {
  const packageCount = parseInt(packageCountInput.value) || 10;
  const minWeight    = parseInt(minWeightInput.value)    || 5;
  const maxWeight    = parseInt(maxWeightInput.value)    || 40;

  // Guard: min must be strictly less than max
  if (minWeight >= maxWeight) {
    [minWeightInput, maxWeightInput].forEach(input => {
      input.style.borderColor = 'var(--red)';
      setTimeout(() => { input.style.borderColor = ''; }, 800);
    });
    return;
  }

  // Generate a fresh array of random package weights
  packageWeights = Array.from(
    { length: packageCount },
    () => getRandomInt(minWeight, maxWeight)
  );

  updateSystem();
}

/* ─── Core Algorithm ─────────────────────────────────────────────── */

/**
 * Finds the contiguous subarray of packageWeights whose sum is
 * as large as possible without exceeding the weightLimit.
 *
 * Strategy — two-pointer sliding window:
 *   1. Advance rightPointer, adding each package weight to currentSum.
 *   2. If currentSum exceeds weightLimit, advance leftPointer
 *      (shrinking the window from the left) until it fits again.
 *   3. After each valid window, check if currentSum beats bestSum.
 *
 * @returns {{ startIndex: number, endIndex: number, totalWeight: number } | null}
 */
function findOptimalLoadWindow() {
  if (packageWeights.length === 0 || weightLimit <= 0) return null;

  let leftPointer    = 0;
  let currentSum     = 0;
  let bestSum        = 0;
  let bestStartIndex = -1;
  let bestEndIndex   = -1;

  for (let rightPointer = 0; rightPointer < packageWeights.length; rightPointer++) {
    const incomingWeight = packageWeights[rightPointer];
    currentSum += incomingWeight;

    // Shrink from the left until the window fits within the weight limit
    while (currentSum > weightLimit && leftPointer <= rightPointer) {
      currentSum -= packageWeights[leftPointer];
      leftPointer++;
    }

    // Track the best valid window found so far
    if (currentSum > bestSum) {
      bestSum        = currentSum;
      bestStartIndex = leftPointer;
      bestEndIndex   = rightPointer;
    }
  }

  if (bestStartIndex === -1) return null;

  return {
    startIndex  : bestStartIndex,
    endIndex    : bestEndIndex,
    totalWeight : bestSum,
  };
}

/* ─── Dispatch Handler ───────────────────────────────────────────── */

/**
 * Animates the optimal window packages off the belt,
 * then removes them from state and recalculates.
 */
function dispatchOptimalTrip() {
  if (!optimalWindow) return;

  const { startIndex, endIndex } = optimalWindow;

  // Select the card elements that belong to the optimal window
  const allCards       = packageBelt.querySelectorAll('.package-card');
  const cardsToAnimate = Array.from(allCards).slice(startIndex, endIndex + 1);

  // Trigger fly-out animation on each selected card
  cardsToAnimate.forEach(card => card.classList.add('is-dispatching'));

  // After animation completes, remove packages from state and refresh UI
  setTimeout(() => {
    packageWeights.splice(startIndex, endIndex - startIndex + 1);
    dispatchedTripCount++;
    updateSystem();
  }, 430);
}

/* ─── Belt Renderer ──────────────────────────────────────────────── */

/**
 * Rebuilds all package cards on the conveyor belt
 * and highlights those inside the optimal window.
 */
function renderBelt() {
  packageBelt.innerHTML = '';

  if (packageWeights.length === 0) {
    emptyState.textContent = 'CINTA VACÍA — GENERÁ UNA NUEVA CINTA';
    packageBelt.appendChild(emptyState);
    beltPackageCount.textContent = '0 paquetes';
    return;
  }

  beltPackageCount.textContent =
    `${packageWeights.length} paquete${packageWeights.length !== 1 ? 's' : ''}`;

  packageWeights.forEach((weight, index) => {
    const isSelected =
      optimalWindow !== null &&
      index >= optimalWindow.startIndex &&
      index <= optimalWindow.endIndex;

    const card = document.createElement('div');
    card.className = `package-card${isSelected ? ' is-selected' : ''}`;

    // Sequence index label
    const indexLabel = document.createElement('div');
    indexLabel.className = 'pkg-index';
    indexLabel.textContent = `#${String(index + 1).padStart(2, '0')}`;

    // Weight value
    const weightDisplay = document.createElement('div');
    weightDisplay.className = 'pkg-weight';
    weightDisplay.textContent = weight;

    // Unit suffix
    const unitLabel = document.createElement('div');
    unitLabel.className = 'pkg-unit';
    unitLabel.textContent = 'kg';

    card.appendChild(indexLabel);
    card.appendChild(weightDisplay);
    card.appendChild(unitLabel);
    packageBelt.appendChild(card);
  });
}

/* ─── Result Banner Renderer ─────────────────────────────────────── */

/**
 * Shows a summary banner with the optimal window result
 * or an appropriate message for edge cases.
 */
function renderResultBanner() {
  resultBanner.style.display = 'block';

  if (packageWeights.length === 0) {
    resultBanner.className = 'visible belt-empty';
    resultBanner.innerHTML = '📭 CINTA VACÍA — Generá una nueva cinta para continuar operando.';
    return;
  }

  if (weightLimit <= 0) {
    resultBanner.className = '';
    resultBanner.style.display = 'none';
    return;
  }

  if (!optimalWindow) {
    resultBanner.className = 'visible no-result';
    resultBanner.innerHTML =
      '⚠ SIN SECUENCIA VÁLIDA — Cada paquete individual supera el límite del montacargas.';
    return;
  }

  const packageCount = optimalWindow.endIndex - optimalWindow.startIndex + 1;
  const efficiency   = ((optimalWindow.totalWeight / weightLimit) * 100).toFixed(1);
  const residual     = (weightLimit - optimalWindow.totalWeight).toFixed(1);

  resultBanner.className = 'visible';
  resultBanner.innerHTML =
    `✔ VIAJE ÓPTIMO — ` +
    `Paquetes #${optimalWindow.startIndex + 1} → #${optimalWindow.endIndex + 1} &nbsp;|&nbsp; ` +
    `${packageCount} caja${packageCount !== 1 ? 's' : ''} &nbsp;|&nbsp; ` +
    `Carga: ${optimalWindow.totalWeight} kg / ${weightLimit} kg &nbsp;|&nbsp; ` +
    `Eficiencia: ${efficiency}% &nbsp;|&nbsp; ` +
    `Residual: ${residual} kg`;
}

/* ─── Stats & Gauge Renderer ─────────────────────────────────────── */

/**
 * Updates the gauge bar and the four stat boxes
 * based on the current optimal window data.
 */
function renderStats() {
  statTrips.textContent = dispatchedTripCount;

  if (!optimalWindow || weightLimit <= 0) {
    gaugePanel.style.display   = 'none';
    statCount.textContent      = '–';
    statLoad.textContent       = '–';
    statResidual.textContent   = '–';
    statEfficiency.textContent = '–';
    dispatchBtn.disabled       = true;
    return;
  }

  const packageCount = optimalWindow.endIndex - optimalWindow.startIndex + 1;
  const load         = optimalWindow.totalWeight;
  const residual     = (weightLimit - load).toFixed(1);
  const efficiency   = ((load / weightLimit) * 100).toFixed(1);
  const fillPct      = Math.min((load / weightLimit) * 100, 100);

  gaugePanel.style.display     = 'block';
  gaugeMaxLabel.textContent    = `${weightLimit} kg`;
  utilisationLabel.textContent = `${efficiency}%`;
  gaugeFill.style.width        = `${fillPct}%`;

  // Color the gauge by fill level
  gaugeFill.className = 'gauge-fill' +
    (fillPct >= 99 ? ' critical' : fillPct >= 88 ? ' warning' : '');

  statCount.textContent      = packageCount;
  statLoad.textContent       = `${load} kg`;
  statResidual.textContent   = `${residual} kg`;
  statEfficiency.textContent = `${efficiency}%`;
  dispatchBtn.disabled       = false;
}

/* ─── Algorithm Log Renderer ─────────────────────────────────────── */

/**
 * Replays the sliding-window execution step by step
 * and writes each iteration into the log panel.
 * @param {{ startIndex: number, endIndex: number, totalWeight: number } | null} result
 */
function renderAlgorithmLog(result) {
  if (packageWeights.length === 0 || weightLimit <= 0) {
    algorithmLog.innerHTML = '<span class="log-line">// Esperando datos de entrada…</span>';
    return;
  }

  const lines = [];
  lines.push(`<span class="log-line accent">// TRAZADO SLIDING WINDOW — límite: ${weightLimit} kg | paquetes: ${packageWeights.length}</span>`);
  lines.push(`<span class="log-line">// Entrada: [${packageWeights.map(w => w + 'kg').join(', ')}]</span>`);
  lines.push(`<span class="log-line">//</span>`);

  let leftPointer = 0;
  let currentSum  = 0;
  let bestSum     = 0;

  for (let rightPointer = 0; rightPointer < packageWeights.length; rightPointer++) {
    currentSum += packageWeights[rightPointer];
    let windowShrunk = false;

    while (currentSum > weightLimit && leftPointer <= rightPointer) {
      currentSum -= packageWeights[leftPointer];
      leftPointer++;
      windowShrunk = true;
    }

    const windowSlice = packageWeights
      .slice(leftPointer, rightPointer + 1)
      .map(w => w + 'kg')
      .join('+');

    const isNewBest = currentSum > bestSum;
    if (isNewBest) bestSum = currentSum;

    const cssClass = isNewBest ? 'success' : '';
    lines.push(
      `<span class="log-line ${cssClass}">  R=${rightPointer} L=${leftPointer} | ventana=[${windowSlice}] | suma=${currentSum}kg` +
      `${windowShrunk ? ' (reducida)' : ''}${isNewBest ? ' <- NUEVO MAXIMO' : ''}</span>`
    );
  }

  lines.push(`<span class="log-line">//</span>`);

  if (result) {
    lines.push(`<span class="log-line success">// RESULTADO: paquetes[${result.startIndex}..${result.endIndex}] -> ${result.totalWeight} kg cargados</span>`);
  } else {
    lines.push(`<span class="log-line" style="color:var(--red)">// RESULTADO: Sin ventana valida — todos los paquetes superan el limite</span>`);
  }

  algorithmLog.innerHTML = lines.join('');
  algorithmLog.scrollTop = algorithmLog.scrollHeight;
}

/* ─── Main Update Orchestrator ───────────────────────────────────── */

/**
 * Central reactive function: recalculates the optimal window
 * and refreshes all UI panels in a single pass.
 */
function updateSystem() {
  optimalWindow = findOptimalLoadWindow();
  renderBelt();
  renderResultBanner();
  renderStats();
  renderAlgorithmLog(optimalWindow);
}

/* ─── Event Listeners ────────────────────────────────────────────── */

weightLimitInput.addEventListener('input', () => {
  const parsedLimit = parseFloat(weightLimitInput.value);
  weightLimit = (isNaN(parsedLimit) || parsedLimit <= 0) ? 0 : parsedLimit;
  updateSystem();
});

generateBeltBtn.addEventListener('click', generateRandomBelt);
dispatchBtn.addEventListener('click', dispatchOptimalTrip);

/* ─── Initial Render ─────────────────────────────────────────────── */
updateSystem();
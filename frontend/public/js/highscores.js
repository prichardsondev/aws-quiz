export function init() {
const highScoresList = document.getElementById("highScoresList");
const scoreFilter = document.getElementById("scoreFilter");
const SHOWN = 10;

const stored = readJson(localStore, "highScores", []);
const highScores = Array.isArray(stored) ? stored.filter(isScore) : [];

// Older saves were { name, score } with no total; show them as a raw count.
const describe = (s) => {
  if (s.total) {
    const when = s.date ? ` · ${new Date(s.date).toLocaleDateString()}` : "";
    return `${s.name} – ${s.correct}/${s.total} (${s.pct}%) · ${categoryLabel(s.category)}${when}`;
  }
  return `${s.name} – ${s.score}`;
};

const categories = [...new Set(highScores.map((s) => s.category).filter(Boolean))];
categories
  .sort((a, b) => categoryLabel(a).localeCompare(categoryLabel(b)))
  .forEach((c) => {
    const option = el("option", categoryLabel(c));
    option.value = c;
    scoreFilter.append(option);
  });

const render = () => {
  const rows = highScores
    .filter((s) => !scoreFilter.value || s.category === scoreFilter.value)
    .slice(0, SHOWN);
  highScoresList.replaceChildren(
    ...(rows.length
      ? rows.map((s) => el("li", describe(s), "high-score"))
      : [el("li", "No scores yet – play a round!", "high-score empty")])
  );
};

scoreFilter.addEventListener("change", render);
render();

}

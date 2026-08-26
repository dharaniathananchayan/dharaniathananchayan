import fs from "node:fs";
import path from "node:path";

const username = process.env.GH_USERNAME;
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const output = process.env.OUTPUT_PATH || "dist/github-rocket.svg";
const columns = 34;
const cell = 11;
const step = 14;
const gridX = 20;
const gridY = 15;
const width = 513;
const height = 170;
const duration = 20;
const launchY = 128;

if (!username || !token) throw new Error("GH_USERNAME and GH_TOKEN/GITHUB_TOKEN are required.");

const query = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        weeks { contributionDays { contributionCount color } }
      }
    }
  }
}`;

async function contributionCells() {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login: username } }),
  });
  if (!response.ok) throw new Error(`GitHub API error ${response.status}: ${await response.text()}`);
  const data = await response.json();
  if (data.errors) throw new Error(JSON.stringify(data.errors));

  const weeks = data.data.user.contributionsCollection.contributionCalendar.weeks.slice(-columns);
  const emptyWeek = () => ({ contributionDays: Array.from({ length: 7 }, () => ({ contributionCount: 0, color: "#161b22" })) });
  return Array.from({ length: Math.max(0, columns - weeks.length) }, emptyWeek)
    .concat(weeks)
    .flatMap((week, column) => week.contributionDays.map((day, row) => ({
      column, row, count: day.contributionCount || 0, color: day.color || "#161b22",
      x: gridX + column * step, y: gridY + row * step,
    })));
}

const timeFor = (column, reverse = false) => {
  const time = 0.02 + (column / (columns - 1)) * 0.46;
  return reverse ? 1 - time : time;
};
const number = value => Number(value.toFixed(4));

function grid(cells, targets) {
  const selected = new Set(targets.map(target => `${target.column}-${target.row}`));
  return cells.map(item => {
    if (!selected.has(`${item.column}-${item.row}`)) {
      return `<rect x="${item.x}" y="${item.y}" width="${cell}" height="${cell}" rx="2" fill="${item.color}"/>`;
    }
    const first = timeFor(item.column);
    const second = timeFor(item.column, true);
    const [start, end] = [Math.min(first, second), Math.max(first, second)];
    return `<rect x="${item.x}" y="${item.y}" width="${cell}" height="${cell}" rx="2" fill="${item.color}">
      <animate attributeName="fill" dur="${duration}s" repeatCount="indefinite" keyTimes="0;${number(start)};${number(start + .006)};${number(end)};${number(end + .006)};1" values="${item.color};${item.color};#39d353;${item.color};#39d353;${item.color}"/>
    </rect>`;
  }).join("\n");
}

function shots(targets) {
  let bullets = "";
  let blasts = "";
  for (const reverse of [false, true]) {
    for (const item of reverse ? [...targets].reverse() : targets) {
      const hit = timeFor(item.column, reverse);
      const launch = hit - .018;
      const fade = hit + .006;
      const x = number(item.x + cell / 2);
      const y = number(item.y + cell / 2);
      bullets += `<circle cx="${x}" cy="${launchY}" r="2.4" fill="#7ee787">
        <animate attributeName="cy" dur="${duration}s" repeatCount="indefinite" keyTimes="0;${number(launch)};${number(hit)};1" values="${launchY};${launchY};${y};${y}"/>
        <animate attributeName="opacity" dur="${duration}s" repeatCount="indefinite" keyTimes="0;${number(launch)};${number(hit)};${number(fade)};1" values="0;1;1;0;0"/>
      </circle>`;
      blasts += `<circle cx="${x}" cy="${y}" r="0" fill="none" stroke="#56d364" stroke-width="1.6" opacity="0">
        <animate attributeName="r" dur="${duration}s" repeatCount="indefinite" keyTimes="0;${number(hit)};${number(hit + .018)};1" values="0;1;9;9"/>
        <animate attributeName="opacity" dur="${duration}s" repeatCount="indefinite" keyTimes="0;${number(hit)};${number(hit + .018)};1" values="0;1;1;0"/>
      </circle>`;
    }
  }
  return { bullets, blasts };
}

function rocket() {
  return `<g id="rocket">
    <polygon points="0,-16 8,6 4,3 -4,3 -8,6" fill="#58a6ff" stroke="#1f6feb" stroke-width="1"/>
    <polygon points="-8,6 -14,12 -4,7" fill="#388bfd"/>
    <polygon points="8,6 14,12 4,7" fill="#388bfd"/>
    <circle cx="0" cy="-6" r="2.2" fill="#c9e6ff"/>
    <polygon points="-3,7 3,7 0,15" fill="#f0883e"><animate attributeName="opacity" values=".5;1;.6;1" dur=".18s" repeatCount="indefinite"/></polygon>
    <animateTransform attributeName="transform" type="translate" dur="${duration}s" repeatCount="indefinite" keyTimes="0;.5;1" values="35,140;478,140;35,140"/>
  </g>`;
}

async function main() {
  const cells = await contributionCells();
  const targets = [...cells].filter(item => item.count > 0).sort((a, b) => b.count - a.count).slice(0, 12).sort((a, b) => a.column - b.column || a.row - b.row);
  const { bullets, blasts } = shots(targets);
  const stars = [[8,20,1.2],[8,60,1.6],[8,100,2],[505,25,1.2],[505,70,1.6],[505,110,2],[30,164,1.2],[483,164,1.6]]
    .map(([x,y,d]) => `<circle cx="${x}" cy="${y}" r="1.1" fill="#8b949e"><animate attributeName="opacity" values=".2;1;.2" dur="${d}s" repeatCount="indefinite"/></circle>`).join("");
  const svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><rect width="${width}" height="${height}" fill="#0d1117"/>${stars}<g>${grid(cells, targets)}</g><g>${bullets}</g><g>${blasts}</g>${rocket()}</svg>`;
  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
  fs.writeFileSync(output, svg, "utf8");
}

main().catch(error => { console.error(error); process.exit(1); });

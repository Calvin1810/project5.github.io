import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
// import {us} from "@observablehq/us-geographic-data";

interface Player {
  name: string;
  team: string;
  usg_pct: number;
  ts_pct: number;
  playoff_mp: number;
  playoff_usg_pct: number;
  playoff_ts_pct: number;
  playoff_mpg: number;
}

interface Case {
  state: string;
  year: string;
  bot_type: string;
  toxin_type: string;
  count: string;
  region: string;
}

interface Pop {
  name: string;
  geography: string;
  year: string;
  population: string;
  percent_change: string;
  resident_pop: string;
  reps: string;
  rep_change: string;
  apportionment: string
}

interface State {
  name: string;
  population: string;
}

async function main(): Promise<void> {
  // const res = await fetch("data/players_2023.json");
  // const data = (await res.json()) as Array<Player>;
  // const data: Array<Case> = await d3.csv("data/Botulism_20240122.csv");
  // const pop_data: Array<Pop> = await d3.csv("data/population.csv");
  // const mod_data: Array<Pop> = await d3.csv("data/mod_data.csv");
  const state_pop: Array<State> = await d3.csv("data/2020_census.csv");
  const pop_filtered: Array<State> = await d3.csv("data/pop_data_filtered.csv");
  const nation: d3.GeoPermissibleObjects | undefined = await d3.json("data/geo_nation.json");
  const states: d3.GeoPermissibleObjects | undefined = await d3.json("data/geo_states.json");

  const state_to_growth = d3.rollup(
    pop_filtered,
    (a) => Number(a[0].population),
    (s) => s.name
  )

  const mapchart = Plot.plot({
    projection: "albers-usa",
    // width,
    color: {
      type: "linear",
      domain: [0, 60],
      scheme: "Blues",
      label: "Population Growth (%)",
      tickFormat: Math.round,
      legend: true
    },
    marks: [
      //Plot.geo(states), // Assuming 'nation' is defined elsewhere as the US nation geometry
      Plot.geo(states, { // Assuming 'states' is defined elsewhere as the US states geometry
        stroke: "black", 
        fill: (s) => state_to_growth.get(s.properties.name), // Assuming 'state_to_growth' is a Map of state names to growth percentages
        title: (s) => `${s.properties.name}: ${state_to_growth.get(s.properties.name)}%` // Tooltip text showing state name and growth percentage
      })
    ]
  })

  // document.querySelector("#plot")?.append(mapchart);

  const domain = ["1910","1920","1930","1940","1950","1960", "1970", "1980","1990", "2000", "2010", "2020"];
  const state_year = document.createElement("input") as HTMLInputElement;

  // Set attributes for the input element
  state_year.type = "range"; // Use type="range" for slider
  state_year.min = "0";      // Minimum value index in domain
  state_year.max = (domain.length - 1).toString(); // Maximum value index in domain
  state_year.step = "1";     // Step size
  state_year.value = "0";    // Initial value

  // Create a label for the slider
  const label = document.createElement("label");
  label.innerHTML = "Year: ";

  // Create a span element to display the selected value
  const valueSpan = document.createElement("span");
  valueSpan.innerHTML = domain[0]; // Initial value

  // Append the label, input, and span elements to a container (e.g., a div)
  const container = document.createElement("div");
  container.appendChild(label);
  container.appendChild(state_year);
  container.appendChild(valueSpan);

  // Add an event listener to update the span with the selected value
  state_year.addEventListener("input", function() {
      const index = parseInt(this.value);
      valueSpan.innerHTML = domain[index];
      console.log(valueSpan.innerHTML)
  });

  // Add the container to the document body or any desired parent element
  // document.querySelector("#after")?.append(container);

  // const region_chart = Plot.plot({
  //   title: "Regional Botulism Cases (2010)",
  //   caption: "Figure 2: The regional chart above depicts the total number of botulism cases for each region per capita. Each bar is segmented into the categories of botulism.",
  //   inset: 8,
  //   grid: true,
  //   color: {
  //     legend: true,
  //     type: "categorical",
  //     scheme: "Viridis"
  //   },
  //   y: {
  //     label: "Total Cases Per Capita"
  //   },
  //   marks: [
  //     Plot.barY(mod_data,
  //               Plot.groupX({y: "count"},
  //                           {x: "Region", fill: "BotType", sort: {x: "-y"}, tip: true})),
  //     Plot.ruleY([0])
  //   ]
  // });

  // document.querySelector("#plot2")?.append(region_chart);

}

window.addEventListener("DOMContentLoaded", async (_evt) => {
  await main();
});


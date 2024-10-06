import './style.css'
import * as d3 from "d3";

document.querySelector('#app').innerHTML += `
<h1 id="title">Monthly Global Land-Surface Temperature</h1>
<h3 id='description'>1753 - 2015: base temperature 8.66℃</h3>
<div id="container"></div>
<div id="tooltip"></div>
<div id="legend"></div>
`

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
.then(res => {
  if(res.ok) {
   return res.json()
  } else {
   throw new Error('Res not ok')
  }
})
.then(data => {
  makeSvg();
  makeAxis(data)
  makeRect(data);
  console.log(data)
})
.catch(error => {
  console.error('Error fetching the dataa', error);
})

const height = 480;
const width = 1400;
const padding = 50;
let scaleX
let scaleY

const makeSvg = () => {
  d3.select('#container')
  .append('svg')
  .attr('height', height + padding)
  .attr('width', width )
  .style('border', '1px solid red')
}

const makeAxis = data => {
  const svg =  d3.select('svg')
  const maxYear = d3.max(data.monthlyVariance.map(d => d.year))
  const minYear = d3.min(data.monthlyVariance.map(d => d.year))


  scaleX = d3.scaleLinear()
    .domain([minYear, maxYear])  
    .range([padding, width - padding]);

  const axisX = d3.axisBottom(scaleX)
    .tickFormat(d3.format('d'))

  svg.append('g')
    .attr("transform", `translate(0, ${height - padding})`)
    .attr('id', 'x-axis')
    .call(axisX)


  const months = data.monthlyVariance.map(d => d.month)
  const monthDates = months.map(m => new Date(2023, m - 1));

  scaleY = d3.scaleTime()
    .domain([new Date(d3.max(months) + 1), new Date(d3.min(months) - 1)])
    .range([height - padding, padding])

  const axisY = d3.axisLeft(scaleY)
    .tickFormat(d => d.toLocaleString('default', { month: 'long' }));

  svg.append('g')
  .attr("transform", `translate(${padding}, 0)`)
  .attr('id', 'y-axis')
  .call(axisY)
}

const makeRect = data => {
  const svg =  d3.select('svg')
  const tooltip = d3.select('#tooltip')
  const baseTemp = data.baseTemperature
  const maxValuesForYear = data.monthlyVariance.filter(d => d.month == 2)

  svg.selectAll('rect')
  .data(data.monthlyVariance)
  .enter()
  .append('rect')
  .attr('height', ((height - padding) / 14) )
  .attr('width', (width - padding) / maxValuesForYear.length)
  .attr('x', (d, i) => scaleX(d.year))
  .attr('y', (d, i) => scaleY(d.month - 0.5))
  .attr('class', 'cell')
  .attr('data-month', d => d.month - 1)
  .attr('data-year', d => d.year)
  .attr('data-temp', d => baseTemp + (d.variance))
  .attr('fill', d => {
    if (d.variance > 4) {
        return 'darkred';     // hottest
    } else if (d.variance > 3) {
        return 'red';         // very hot
    } else if (d.variance > 2) {
        return 'orangered';   // hot
    } else if (d.variance > 1) {
        return 'orange';      // warm
    } else if (d.variance > 0) {
        return 'gold';        // mild warm
    } else if (d.variance > -1) {
        return 'yellow';      // mild cool
    } else if (d.variance > -3) {
        return 'lightblue';   // cool
    } else if (d.variance > -5) {
        return 'blue';        // cold
    } else {
        return 'darkblue';    // coldest
    }
})
  .on('mouseover', (event, d) => {
    tooltip.style('opacity', '1')
    .attr('data-year', d.year)
    .html(`${d.variance}`)
    .style('top', `${event.pageY + 10}px`)
    .style('left', `${event.pageX + 20}px`)
  })
  .on('mouseout', () => {
    tooltip.style('opacity', '0')
  })

  d3.select('#legend')
  .html(`I am Legend`)

}
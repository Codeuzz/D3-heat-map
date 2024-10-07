import './style.css'
import * as d3 from "d3";

document.querySelector('#app').innerHTML += `
<div id='title-div'>
  <h1 id="title">Monthly Global Land-Surface Temperature</h1>
  <h3 id='description'>1753 - 2015: base temperature 8.66℃</h3>
</div>
<div id="container"></div>
<div id="tooltip"></div>
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
})
.catch(error => {
  console.error('Error fetching the dataa', error);
})

const height = 480;
const width = 1400;
const padding = 60;
let scaleX
let scaleY
const monthNames = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];
const colors = [
  'darkred',    // hottest
  'red',        // very hot
  'orangered',  // hot
  'orange',     // warm
  'gold',       // mild warm
  'yellow',     // mild cool
  'lightblue',  // cool
  'blue',       // cold
  'darkblue'    // coldest
];



const makeSvg = () => {
  d3.select('#container')
  .append('svg')
  .attr('height', height + padding)
  .attr('width', width )
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


  const months = data.monthlyVariance.map(d => d.month - 1)
  const monthDates = months.map(m => new Date(2023, m - 1));
  console.log(d3.min(months))

  const formatMonth = d3.timeFormat("%B");
  
  scaleY = d3.scaleBand()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].reverse())
    .range([height - padding, padding])

    console.log(scaleY.domain())

  const axisY = d3.axisLeft(scaleY)
    .scale(scaleY)
    .tickValues(scaleY.domain())
    .tickFormat(function (month) {
      let date = new Date(0);
      date.setUTCMonth(month);
      let format = d3.utcFormat('%B');
      return format(date);
    })

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
  .attr('width', (width - padding - 90) / maxValuesForYear.length)
  .attr('x', (d, i) => scaleX(d.year))
  .attr('y', (d, i) => scaleY(d.month - 1) )
  .attr('class', 'cell')
  .attr('data-month', d => d.month - 1)
  .attr('data-year', d => d.year)
  .attr('data-temp', d => baseTemp + (d.variance))
  .attr('fill', d => {
    if (d.variance + baseTemp > 12.8) {
      return 'darkred';
  } else if (d.variance + baseTemp > 11.7) {
      return 'red';
  } else if (d.variance + baseTemp > 10.6) {
      return 'orangered';
  } else if (d.variance + baseTemp > 9.5) {
      return 'orange';
  } else if (d.variance + baseTemp > 8.3) {
      return 'gold';
  } else if (d.variance + baseTemp > 7.2) {
      return 'yellow';
  } else if (d.variance + baseTemp > 6.1) {
      return 'lightblue';
  } else if (d.variance + baseTemp > 5.0) {
      return 'blue';
  } else if (d.variance + baseTemp > 3.9) {
      return 'darkblue';
  } else {
      return 'darkblue'; // Default for values <= 2.8
  }
})
  .on('mouseover', (event, d) => {
    const currTemp = baseTemp + d.variance
    const variance = d.variance.toFixed(1)
    const toMonthName = (number) => monthNames[number - 1]


    tooltip.style('opacity', '1')
    .attr('data-year', d.year)
    .html(`
      ${d.year} - ${toMonthName(d.month)} <br>
      ${currTemp.toFixed(1) + '℃'} <br>
      ${variance > 0 ? '+' + variance + '℃' : variance + '℃'}`)
    .style('top', `${event.pageY + 15}px`)
    .style('left', `${event.pageX + 15}px`)
  })
  .on('mouseout', () => {
    tooltip.style('opacity', '0')
  })

  let squareWidth = 25;
  let legendX = d3.scaleLinear()
    .domain([2.8, 12.8])
    .range([0, 25 * 9]);

    const tickValues = [2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8];
  const legendAxis = d3.axisBottom(legendX)
    .tickValues(tickValues)
    .tickFormat(d3.format(".1f"));

  d3.select("svg")
  .append('g')
  .attr("transform", `translate(20, ${height + 25})`)
  .call(legendAxis)
  

  svg.append('g')
  .attr('id', 'legend')
  .attr('y', 400)
  .selectAll('rect')
  .data(colors.reverse())
  .enter()
  .append('rect')
  .attr('width', (25 * 9) / 9)
  .attr('height', 25)
  .attr('x', (d,i) => i  * 25 + 20)
  .attr('y', height)
  .style('fill', d => d)


  

}
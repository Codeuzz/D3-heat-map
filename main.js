import './style.css'
import * as d3 from "d3";

document.querySelector('#app').innerHTML += `
<h1 id="title">Monthly Global Land-Surface Temperature</h1>
<h3 id='description'>1753 - 2015: base temperature 8.66℃</h3>
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
  .attr('width', (width - padding) / maxValuesForYear.length)
  .attr('x', (d, i) => scaleX(d.year))
  .attr('y', (d, i) => scaleY(d.month - 1) )
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

  svg.append('g')
  .attr('id', 'legend')
  .attr('y', 400)
  .selectAll('rect')
  .data(colors)
  .enter()
  .append('rect')
  .attr('width', 25)
  .attr('height', 25)
  .attr('x', (d,i) => i * 25)
  .attr('y', (d,i) => height)
  .style('fill', d => d)

}
var mapSvg, chartSvg, deathsData, timelineData;
var chartWidth, chartHeight, chartInnerHeight, chartInnerWidth;
var margin = { top: 50, right: 60, bottom: 60, left: 100 };
var agesColor = d3.scaleOrdinal(d3.schemeCategory10)
var groupAges = ['0-10', '11-20', '21-40', '41-60', '61-80', '> 80']

// This will run when the page loads
document.addEventListener('DOMContentLoaded', () => {
    mapSvg = d3.select('#map');
    chartSvg = d3.select('#linechart').attr("transform", "translate(" + (0) + "," + (-150) + ")")

    // Load both files before doing anything else
    Promise.all([d3.json('data/streets.json'),
    d3.csv('data/deathdays.csv'),
    d3.csv('data/deaths_age_sex.csv'),
    d3.csv('data/pumps.csv')])
        .then(function (values) {


            streetData = values[0];
            timelineData = values[1];
            deathsData = values[2];
            pumpsData = values[3];

            var parseTime = d3.timeParse("%d-%b")
            var totalDeaths = 0;

            timelineData.forEach(d => {
                totalDeaths = totalDeaths + +d.deaths
                d.date = parseTime(d.date)
                d.deathsTotal = +totalDeaths
                d.deaths = +d.deaths
            })

            d3.select('#tooltip').style("opacity", 0)

            drawMap(streetData)
            drawDeaths(deathsData.length, deathsData)
            drawPumps(pumpsData)
            drawLineChart(0, timelineData.length, timelineData)
            drawBarChart(deathsData.length, deathsData)
            drawMapKey()

            //read a change in the input
            d3.select("#Day1").on("input", function () {
                day1 = this.value
                updateDay1(+this.value);
            });

            d3.select("#Day2").on("input", function () {
                day2 = this.value
                updateDay2(+this.value);
            });
            // Update the Day1 attributes
            function updateDay1(Day1) {

                // adjust the text on the range slider
                d3.select("#Day1-value").text(Day1);
                d3.select("#Day1").property("value", Day1);

            }

            // Update the Day2 attributes
            function updateDay2(Day2) {

                // adjust the text on the range slider
                d3.select("#Day2-value").text(Day2);
                d3.select("#Day2").property("value", Day2);

            }



        });
});
function updateChart() {
    var startDay = d3.select("#Day1").property('value');
    var endDay = d3.select("#Day2").property('value');

    if (endDay > startDay) {
        drawLineChart(startDay, endDay, timelineData)
    }

}
// Draw the map in the #map svg
function drawMap(data) {

    d3.select("div#wrapper svg#map g").remove();


    let g = mapSvg.append('g').attr("transform", "translate(" + (-80) + "," + (-50) + ")")
    let map = g.append("g").attr('id', 'street')

    var zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', function () {
            g.selectAll('g')
                .attr('transform', d3.event.transform);
        });
    mapSvg.call(zoom);

    var Gen = d3.line()
        .x((p) => p.x * 30)
        .y((p) => p.y * 30);

    data.forEach(element => {
        map
            .append("path")
            .attr("d", Gen(element))
            .attr("fill", "none")
            .attr("stroke", "black");

    });
}
function drawDeaths(num, data) {
    d3.selectAll('#d').remove()

    data = data.slice(0, num)



    var svg = d3.select('#street');


    var gender = d3.scaleOrdinal()
        .range(["yellow", "steelblue"]);

    var genders = ['Male', 'Female']

    var deathsCircles = svg.selectAll('.deaths')
        .data(data)
        .enter().append("circle")
        .attr('id', 'd')
        .attr('cx', function (d) { return d.x * 30; })
        .attr('cy', function (d) { return d.y * 30; })
        .attr('r', 3)
        .on('mouseover', function () {
            d3.select("#tooltip").style("opacity", 1)
        })
        .on('mousemove', function (d) {
            var ageGroup = groupAges[d.age]
            var gender = genders[d.gender]
            d3.select("#tooltip").style("opacity", 1)
                .html("Age Group: " + ageGroup + "<br/>" + "Gender: " + gender)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        })
        .on('mouseout', function () {
            d3.select("#tooltip").style("opacity", 0)
        })

    attribute = d3.select('#attribute').property('value');
    if (attribute == 'age') {
        deathsCircles.style('fill', function (d) { return agesColor(d.age) })
            .attr('stroke', function (d) { return agesColor(d.age) })
    }
    else if (attribute == 'gender') {
        deathsCircles.style('fill', function (d) { return gender(d.gender) })
            .attr('stroke', function (d) { return gender(d.gender) })
    }


    d3.select("#attribute")
        .on("change", function (d) {
            attribute = d3.select('#attribute').property('value');
            if (attribute == 'age') {
                deathsCircles.style('fill', function (d) { return agesColor(d.age) })
                    .attr('stroke', function (d) { return agesColor(d.age) })
            }
            else if (attribute == 'gender') {
                deathsCircles.style('fill', function (d) { return gender(d.gender) })
                    .attr('stroke', function (d) { return gender(d.gender) })
            }
        })

}

function drawPumps(data) {
    var pumps = d3.symbol().type(d3.symbolDiamond).size(100);
    var brewery = d3.symbol().type(d3.symbolStar).size(200);
    var workhouse = d3.symbol().type(d3.symbolTriangle).size(300);

    d3.select('#street').selectAll('.pumps')
        .data(data)
        .enter()
        .append("path")
        .attr("d", pumps)
        .attr("fill", "red")
        .attr("transform", function (d) { return "translate(" + (d.x * 30) + "," + (d.y * 30) + ")" });

    //DrawBrewery
    d3.select('#street')
        .append("path")
        .attr("d", brewery)
        .attr("fill", "green")
        .attr("transform", function (d) { return "translate(" + (13.5 * 30) + "," + (11.5 * 30) + ")" });

    //Workhouse
    d3.select('#street')
        .append("path")
        .attr("d", workhouse)
        .attr("fill", "orange")
        .attr("transform", function (d) { return "translate(" + (11.5 * 30) + "," + (12.5 * 30) + ")" });


}

function drawBarChart(num, data) {
    var width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    d3.select('#stack g').remove()
    data = data.slice(0, num)

    var labelsName = { 0: '0-10', 1: '11-20', 2: '21-40', 3: '41-60', 4: '61-80', 5: '> 80' }

    // console.log(labelsName[11])

    // append the svg object to the body of the page
    var svg = d3.select("#stack").attr("transform", "translate(" + (0) + "," + (-150) + ")")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var genderData = d3.nest()
        .key(function (d) { return d.age; })
        .key(function (d) { return d.gender; })
        .rollup(function (leaves) { return leaves.length; })
        .entries(data);
    var barData = []
    genderData.forEach(d => {
        var groups = d.key;
        if (d.values.find(item => item.key === '0') != undefined)
            var males = d.values.find(item => item.key === '0').value
        else
            var males = 0
        if (d.values.find(item => item.key === '1') != undefined)
            var females = d.values.find(item => item.key === '1').value
        else
            var females = 0
        barData.push({ group: groups, male: males, female: females })
    })
    barData.sort(function (a, b) {
        return parseFloat(a.group) - parseFloat(b.group);
    });
    data = barData

    // List of subgroups 
    var subgroups = ['male', 'female']

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    var groups = d3.map(data, function (d) { return (d.group) }).keys()

    // Add X axis
    var x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.2])

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0).tickFormat((d, i) => labelsName[d]));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return (d.male + d.female); })])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['steelblue', 'yellow'])

    //stack the data? --> stack per subgroup
    var stackedData = d3.stack()
        .keys(subgroups)
        (data)

    // Show the bars
    svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
        .attr("fill", function (d) { return color(d.key); })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function (d) { return d; })
        .enter().append("rect")
        .attr("x", function (d) { return x(d.data.group); })
        .attr("y", function (d) { return y(d[1]); })
        .attr("height", function (d) { return y(d[0]) - y(d[1]); })
        .attr("width", x.bandwidth())

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 50)
        .attr("x", 0 - (height / 2) + 50)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Deaths");

    svg.append("text").attr("fill", "black").style("font-size", "20px")
        .attr("x", 300)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .text("Distribution of deaths by sex and age");

    svg.append("text").attr("fill", "black")
        .attr("x", 300)
        .attr("y", 330)
        .attr("text-anchor", "middle")
        .text("Age Group");


}

// This function will draw the color legend below the map
function drawMapKey() {
    var svg = d3.select("#legend").attr("transform", "translate(" + (0) + "," + (-150) + ")")

    svg.append('text')
        .attr('x', 220)
        .attr('y', 20)
        .text('Map Key')

    var pumps = d3.symbol().type(d3.symbolDiamond).size(100);
    var brewery = d3.symbol().type(d3.symbolStar).size(200);
    var workhouse = d3.symbol().type(d3.symbolTriangle).size(300);

    svg.append("path")
        .attr("d", pumps)
        .attr("fill", "red")
        .attr("transform", "translate(" + (60) + "," + (40) + ")");
    svg.append('text')
        .attr('x', 80)
        .attr('y', 45)
        .text('Pump')

    //DrawBrewery
    svg.append("path").attr("d", brewery)
        .attr("fill", "green")
        .attr("transform", "translate(" + (60) + "," + (90) + ")");
    svg.append('text')
        .attr('x', 80)
        .attr('y', 95)
        .text('Brewery')

    //Workhouse
    svg.append("path").attr("d", workhouse)
        .attr("fill", "orange")
        .attr("transform", "translate(" + (60) + "," + (140) + ")");
    svg.append('text')
        .attr('x', 80)
        .attr('y', 145)
        .text('Work House')

    // Deaths
    svg.append("circle")
        .attr("fill", "black")
        .attr('r', 5)
        .attr("transform", "translate(" + (60) + "," + (180) + ")");
    svg.append('text')
        .attr('x', 80)
        .attr('y', 185)
        .text('Deaths')

    //Ages
    svg.append('text')
        .attr('x', 220)
        .attr('y', 60)
        .text('Ages:')

    var g = svg.append('g')
    var age = g.selectAll(".age")
        .data(groupAges)
        .enter().append("g")
        .attr("class", "age")
        .attr("transform", function (d, i) { return "translate(0," + (i + 3) * 25 + ")"; });

    age.append("circle")
        .attr("cx", 250 - 20)
        .attr("cy", 8)
        .attr("r", 5)
        .style("fill", function (d, i) { return agesColor(i); });

    age.append("text")
        .attr("x", 250 - 5)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function (d) { return d; });

    //Gender
    svg.append('text')
        .attr('x', 400)
        .attr('y', 60)
        .text('Gender:')

    var genderGroup = ['Male', 'Female']
    var colorGender = d3.scaleOrdinal()
        .range(["steelblue", "yellow"]);

    var gender = svg.selectAll(".gender")
        .data(genderGroup)
        .enter().append("g")
        .attr("class", "gender")
        .attr("transform", function (d, i) { return "translate(0," + (i + 3) * 25 + ")"; });

    gender.append("circle")
        .attr("cx", 450 - 20)
        .attr("cy", 8)
        .attr("r", 5)
        .style("fill", function (d) { return colorGender(d); });

    gender.append("text")
        .attr("x", 450 - 5)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function (d) { return d; });




}

function drawLineChart(starting, ending, data) {

    d3.select("#linechart g").remove()
    data = data.slice(starting, ending)
    console.log(data)


    var width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%d-%b-%y");

    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // define the line
    var valueline = d3.line()
        .x(function (d) { return x(d.date); })
        .y(function (d) { return y(d.deaths); });

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = chartSvg.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data
    x.domain(d3.extent(data, function (d) { return d.date; }));
    y.domain([0, d3.max(data, function (d) { return d.deaths; })]).nice();

    // Add the valueline path.
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline)
        .attr('fill', 'none')
        .attr('stroke', 'black')


    svg.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => { return x(d.date) })
        .attr('cy', d => { return y(d.deaths) })
        .attr('r', 5)
        .on('mouseover', function (d, i) {
            d3.select(this).attr('r', 10)
            drawBarChart(d.deathsTotal, deathsData)
            drawDeaths(d.deathsTotal, deathsData)
        })
        .on('mouseout', function (d, i) {
            d3.select(this).attr('r', 5)
        })
        .on('click', function (d) {
            drawDeaths(d.deathsTotal, deathsData)
            drawBarChart(d.deathsTotal, deathsData)
        })

    // Add the X Axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
            .tickFormat(d3.timeFormat("%d-%b")))

    // Add the Y Axis
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));


    //append line label
    chartSvg.append("text").attr("fill", "black").style("font-size", "20px")
        .attr("x", 400)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .text("Number of deaths over time");

    //append y-axis label
    // text label for the y axis
    chartSvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", 0 - (height / 2) + 50)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Deaths");


}
const NOW = Date.now();
const MINUTE = 1000 * 60;
const HALF_HOUR = MINUTE * 30;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const COUNT = 100;

const width = 1024;
const height = 120;

const chartExtent = [
	[0, 0],
	[width, height]
];

d3.tsv('data/data_diary_jittering.tsv').then(function(data){
	let dataDiary = [];
	data.forEach(function(d){
		let date = d['diary_date(DD/MM/YYYY)'].split('/');
		d['diary_date(DD/MM/YYYY)'] = new Date(date[2], date[1]-1, date[0]);
		dataDiary.push(d);
	});
	dataDiary = dataDiary.sort(function(a, b){
		return b['diary_date(DD/MM/YYYY)'] - a['diary_date(DD/MM/YYYY)'];
	});
	// dataDiary = jitter_coords(dataDiary);
	markerData = dataDiary;
	console.log(dataDiary)
	render_plot(dataDiary, markerData);
});

function jitter_coords(dataDiary){
	function randomize_coord(coord){
		coord = getRandom(coord-5, coord+5);
	}
	function iterate_coord(coord_array){
		let pass = true;
		for (var i = 0; i <= coord_array.length-1; i++) {
			if (coord_array[i] == coord_array[i+1]){
				coord_array[i] = randomize_coord(coord_array[i]);
				pass = false;
			}
		}
		return coord_array, pass
	}

	let latindex = [];
	let lonindex = [];
	dataDiary.forEach(function(d,i){
		latindex.push(d['lat']);
		lonindex.push(d['lon']);
	});

	const latindex_old = Array.from(latindex.keys())
		.sort((a, b) => latindex[a].localeCompare(latindex[b]));
	const lonindex_old = Array.from(lonindex.keys())
		.sort((a, b) => lonindex[a].localeCompare(lonindex[b]));

	latindex = latindex.sort()
	lonindex = lonindex.sort()

	while(true){
		latindex, pass1 = iterate_coord(latindex);
		lonindex, pass2 = iterate_coord(lonindex);
		if(pass1==true & pass2==true){
			break;
		}
	}



	return dataDiary;
}

function render_plot(dataDiary, markerData){

	const data = new Array(dataDiary.length)
		.fill(true)
		.map((_, i) => {
			const dateInMs = NOW - i * HOUR;
			return {
				count: 1,
				// start: new Date(dateInMs),//dataDiary[i]['diary_date(DD/MM/YYYY)'], //new Date(dateInMs),
				// mid: new Date(dateInMs),//dataDiary[i]['diary_date(DD/MM/YYYY)'], //new Date(dateInMs),
				// end: new Date(dateInMs + HOUR),//new Date(dataDiary[i]['diary_date(DD/MM/YYYY)'].getTime() + (DAY*30))
				start: dataDiary[i]['diary_date(DD/MM/YYYY)'], //new Date(dateInMs),
				mid: dataDiary[i]['diary_date(DD/MM/YYYY)'], //new Date(dateInMs),
				end: new Date(dataDiary[i]['diary_date(DD/MM/YYYY)'].getTime() + (DAY*30))
			};
		})
		.reverse();

	const origExtent = [data[0].start, data.at(-1).end];
	console.log(origExtent)

	let selectionExtent = [...origExtent];
	let oldSelectionExtent = [...origExtent];

	const xScale = new d3.scaleTime().domain(origExtent).range([0, width]);
	let _xScale = xScale.copy();

	const yScale = new d3.scaleLinear()
		.domain([0, d3.max(data, (d) => d.count)])
		.range([height, 0]);

	const xAxis = d3.axisBottom(xScale),
		yAxis = d3.axisLeft(yScale);

	d3.select('#timeline__container').append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	// d3.select('#timeline__container').append("g")
	// 	.attr("class", "axis axis--y")
	// 	.call(yAxis);

	const isWithingSelection = (datum) => {
		const [begin, end] = selectionExtent;
		return datum.mid >= begin && datum.mid <= end;
	};

	// Brushing
	const brush = d3.brushX()
		.on('brush end', () => {
			if (d3.event.type === 'zoom') {
				return;
			}
			if (d3.event.selection === null) {
				selectionExtent = origExtent;
				return renderBars();
			}
			// get x coordinates
			const [x0, x1] = d3.event.selection;
			// convert to dates
			const startDate = _xScale.invert(x0);
			const endDate = _xScale.invert(x1);
			selectionExtent = [startDate, endDate];
			renderBars();
		})
		.on('end', function(){
			// get x coordinates
			if (d3.event.type === 'zoom' | d3.event.selection === null) {
				return;
			}
			const [x0, x1] = d3.event.selection;
			const startDate = _xScale.invert(x0);
			const endDate = _xScale.invert(x1);

			if (checkDate(startDate, oldSelectionExtent[0]) && checkDate(endDate, oldSelectionExtent[1])) {
				return;
			} else {
				oldSelectionExtent = [startDate, endDate];
				markerData = getDataMarker(oldSelectionExtent);

				check_selector_ramdomizeMarkers(markerData);
				// ramdomizeMarkers(markerData);	
			}

		});

	d3.select('g.brush').call(brush);

	// Zooming
	d3.select('#timeline__container').call(
		d3.zoom()
		.scaleExtent([1, 10])
		.translateExtent(chartExtent)
		.extent(chartExtent)
		.on('zoom', () => {
			const t = d3.event.transform;

			// Update the x scale
			_xScale = t.rescaleX(xScale);

			// Apply new range to the bars
			d3.selectAll('g.bars rect')
				.attr('x', (d) => _xScale(d.start))
				.attr('width', (d) => _xScale(d.end) - _xScale(d.start) - .01);

			d3.select('#timeline__container')
				.select(".axis--x")
				.call(d3.axisBottom(_xScale));

			// Apply new scale to selection if needed
			if (
				selectionExtent[0] !== data[0].start &&
				selectionExtent[1] !== data.at(-1).end
			) {
				// get the brush's x0/x1
				const [x0, x1] = selectionExtent.map(xScale);
				// rescale the coordinates to the new scale
				const _x0 = x0 * t.k + t.x;
				const _x1 = x1 * t.k + t.x;
				// move the brush
				brush.move(d3.select('.brush'), [_x0, _x1]);
			}
		})
	);

	// Render bars
	function renderBars() {
		d3.select('g.bars')
		.selectAll('rect')
		.data(data)
		.join(
			(enter) => {
			return enter
				.append('rect')
				.attr('y', (d) => yScale(d.count))
				.attr('height', (d) => yScale(0) - yScale(d.count))
				.attr('x', (d) => xScale(d.start))
				.attr('width', (d) => xScale(d.end) - xScale(d.start) - .01)
				.attr('fill', (d) => (isWithingSelection(d) ? 'steelblue' : 'grey'));
			},
			(update) => {
			return update.attr('fill', (d) =>
				isWithingSelection(d) ? 'steelblue' : 'grey'
			);
			}
		);
	}

	function getDataMarker(oldSelectionExtent){
		return dataDiary.filter(function(d){
			return d['diary_date(DD/MM/YYYY)'] >= oldSelectionExtent[0] && d['diary_date(DD/MM/YYYY)'] <= oldSelectionExtent[1];
		});
	}

	function ramdomizeMarkers(markerData){
		console.log('ramdomizeMarkers')
		// map.removeLayer(markers);
		markers.clearLayers();
		// var markers = L.markerClusterGroup();

		for (let i=0; i<markerData.length; i++) {
			var popup = '<b>' + markerData[i]['title'] + '</b>' +
						'<br/>' + 
						'Author name: ' + markerData[i]['author_name'] + '<br/>' + 
						'Author surname: ' + markerData[i]['author_surname'] + '<br/>' + 
						'Gender: ' + markerData[i]['gender'] + '<br/>' + 
						'Nationality: ' + markerData[i]['nationality'] + '<br/>' + 
						'Diary date: ' + markerData[i]['diary_date(DD/MM/YYYY)'].toLocaleDateString('en-US') + '<br/>' + 
						'Writing place: ' + markerData[i]['writing_place'] + '<br/>' + 
						'Topic: ' + markerData[i]['topic'] + '<br/>';// + 
						// 'Wiki link author: <a>' + markerData[i]['wiki_link_author'] + '</a><br/>' + 
						// 'Url for purchase: <a>' + markerData[i]['url_for_purchase'] + '</a><br/>';

			popup += '<br/>'+'<button type="button" class="btn btn-info button_show_diary" id="showDiary_1">Show text in diary 1</button>'
			popup += '       '+'<button type="button" class="btn btn-info button_show_diary" id="showDiary_2">Show text in diary 2</button>'			

			const marker = L.marker([
					markerData[i]['lat'],// getRandom(30, 70), 
					markerData[i]['lon']// getRandom(-70, 70)
				], {icon: bookIcon})
				.bindPopup(popup)
				.on('click', markerClicked);

			// marker.getPopup().on('remove', function(e) {

			// });

			marker.diary_n = i
			markers.addLayer(marker);
		}
		map.addLayer(markers);
		function markerClicked(e){
			const num_dataDiary = e.target.diary_n
			$('.button_show_diary').on('click', function(d){
				// diary number 1 or 2
				let diary_id = String(this.id);
				diary_id = diary_id[diary_id.length-1];
				let first_text = markerData[num_dataDiary]['diary_quote'].slice(0, markerData[num_dataDiary]['emotion_span_start']);
				let middle_text = markerData[num_dataDiary]['diary_quote'].slice(markerData[num_dataDiary]['emotion_span_start'], markerData[num_dataDiary]['emotion_span_end']);
				let end_text = markerData[num_dataDiary]['diary_quote'].slice(markerData[num_dataDiary]['emotion_span_end']);

				let quote = '<p><b>Diary quote:</b> ' + first_text + ' <span style="color: #8e2957">' + middle_text + '</b></span> ' + end_text +'</p>';

				let emotion = '<p><b>Highlighted emotion: </b>' + markerData[num_dataDiary]['emotions'] + '</p>';
				$('#contentDiary'+diary_id).html(emotion+quote);
				$('#collapsible'+diary_id).html('Diary '+ diary_id +', '+markerData[num_dataDiary]['author_surname']);
			});
		}
	}

	function checkDate(date1, date2){
		function getDateFormat(date){
			let month = date.getUTCMonth() + 1; //months from 1-12
			let day = date.getUTCDate();
			let year = date.getUTCFullYear();
			return day+'/'+month+'/'+year
		}
		if (getDateFormat(date1)==getDateFormat(date2)){
			return true
		} else {
			return false
		}
	}
	function check_selector_ramdomizeMarkers(markerData){
		let  selector_mapping = {
			'topic': $('#topic').find(":selected").text(),
			'emotions': $('#emotions').find(":selected").text(),
			'age_range': $('#age_range').find(":selected").text(),
			'gender': $('#gender').find(":selected").text()
		}
		let temp = markerData;
		for (key in selector_mapping){
			if (selector_mapping[key] != 'All'){
				temp = temp.filter(function(el){return el[key]==selector_mapping[key]});
			}
		}
		ramdomizeMarkers(temp);
	}
	renderBars();
	ramdomizeMarkers(dataDiary);

	$(document).ready(function() {
		// $('.filterSelector').on('change', function() {
		// 	check_selector_ramdomizeMarkers(markerData);
		// });
		$('#apply_filter').on('click', function(){
			check_selector_ramdomizeMarkers(markerData);
		});

		$('#reset_filter').on('click', function(){
			$('#topic').val('All').change();
			$('#emotions').val('All').change();
			$('#age_range').val('All').change();
			$('#gender').val('All').change();
			check_selector_ramdomizeMarkers(markerData);
		});

		$('#reset_brush').on('click', function(){
			d3.select('g.brush').call(brush.move, null);
			ramdomizeMarkers(dataDiary);
		});
	});
}

// a = [{'id': 4, 'value': 9},{'id': 4, 'value': 7},{'id': 2, 'value': 6},{'id': 1, 'value': 2}]

// let mapper = {
// 	'id': 4,
// 	'value':9
// }
// a.filter(function(el){
// 	return mapper
// })
// temp = a
// for (key in mapper){
//     temp = temp.filter(function(el){return el[key]==mapper[key]})
//     console.log(key)
// }
// temp

a = "Non ti ho ancora detto, Mimmy, che ben presto farai il giro del mondo. Ti pubblicheranno all'estero. Ho dato il mio permesso, così che il mondo sappia le stesse cose che ho scritto a te. Ti ho parlato della guerra, di me e di Sarajevo durante la guerra, e il mondo vuole sapere tutte queste cose. Ti ho scritto ciò che sentivo, vedevo e udivo, e adesso ne saranno informate le persone che non abitano a Sarajevo. Vuon viaggio intorno al mondo, Mimmy! La tua Zlata";

s = 297
e = 412
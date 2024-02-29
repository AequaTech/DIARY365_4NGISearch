// import './styles.css';
import { select, selectAll, event } from 'd3-selection';
import { scaleLinear, scaleTime } from 'd3-scale';
import { max } from 'd3-array';
import { brushX } from 'd3-brush';
import { zoom } from 'd3-zoom';

const NOW = Date.now();
const MINUTE = 1000 * 60;
const HALF_HOUR = MINUTE * 30;
const HOUR = MINUTE * 60;
const COUNT = 100;

const width = 600;
const height = 200;
const chartExtent = [
  [0, 0],
  [width, height]
];

const data = new Array(COUNT)
  .fill(true)
  .map((_, i) => {
    const dateInMs = NOW - i * HOUR;
    return {
      count: Math.floor(100 * Math.random() + 10),
      start: new Date(dateInMs - HALF_HOUR),
      mid: new Date(dateInMs),
      end: new Date(dateInMs + HALF_HOUR)
    };
  })
  .reverse();

const origExtent = [data[0].start, data.at(-1).end];
let selectionExtent = [...origExtent];

const xScale = new scaleTime().domain(origExtent).range([0, width]);
let _xScale = xScale.copy();

const yScale = new scaleLinear()
  .domain([0, max(data, (d) => d.count)])
  .range([height, 0]);

const isWithingSelection = (datum) => {
  const [begin, end] = selectionExtent;
  return datum.mid >= begin && datum.mid <= end;
};

// Brushing
const brush = brushX().on('brush end', () => {
  // console.log(event);
  if (event.sourceEvent.type === 'zoom') {
    return;
  }
  if (event.selection === null) {
    selectionExtent = origExtent;
    return renderBars();
  }
  // get x coordinates
  const [x0, x1] = event.selection;
  // convert to dates
  const startDate = _xScale.invert(x0);
  const endDate = _xScale.invert(x1);
  selectionExtent = [startDate, endDate];
  renderBars();
});
select('g.brush').call(brush);

// Zooming
select('svg').call(
  zoom()
    .scaleExtent([1, 10])
    .translateExtent(chartExtent)
    .extent(chartExtent)
    .on('zoom', () => {
      const t = event.transform;

      // Update the x scale
      _xScale = t.rescaleX(xScale);

      // Apply new range to the bars
      selectAll('g.bars rect')
        .attr('x', (d) => _xScale(d.start))
        .attr('width', (d) => _xScale(d.end) - _xScale(d.start) - 1);

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
        brush.move(select('.brush'), [_x0, _x1]);
      }
    })
);

// Render bars
function renderBars() {
  select('g.bars')
    .selectAll('rect')
    .data(data)
    .join(
      (enter) => {
        return enter
          .append('rect')
          .attr('y', (d) => yScale(d.count))
          .attr('height', (d) => yScale(0) - yScale(d.count))
          .attr('x', (d) => xScale(d.start))
          .attr('width', (d) => xScale(d.end) - xScale(d.start) - 1)
          .attr('fill', (d) => (isWithingSelection(d) ? 'steelblue' : 'grey'));
      },
      (update) => {
        return update.attr('fill', (d) =>
          isWithingSelection(d) ? 'steelblue' : 'grey'
        );
      }
    );
}

renderBars();

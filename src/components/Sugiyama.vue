<template>
	<v-col cols="12" id="graph"> </v-col>
</template>

<script>
import * as d3_base from "d3";
import * as d3_dag from "d3-dag";
import * as d3_wrap from "d3-textwrap";

export default {
	name: "Sugiyama",
	props: {
		dag: Object
	},

	data: () => ({
		width: screen.width,
		height: screen.height,
		layering: "Fake",
		decross: "Optimal (slow)",
		coord: "Minimum Curves (slow)",
		d3: Object.assign({}, d3_base, d3_dag, d3_wrap)
	}),
	mounted() {
		this.sugiyama(this.dag);
	},
	methods: {
		sugiyama(dag) {
			const layerings = {
				"Simplex (slow)": this.d3.layeringSimplex(),
				"Longest Path (fast)": this.d3.layeringLongestPath(),
				"Coffman Graham (medium)": this.d3.layeringCoffmanGraham(),
				"Topological (fast)": this.d3.layeringTopological(),
				Fake: function layeringTest(dag) {
					dag.eachBefore(n => (n.layer = n.data.layer));
					return dag;
				}
			};

			const decrossings = {
				"Optimal (slow)": this.d3.decrossOpt(),
				"Two Layer Opt (medium)": this.d3
					.decrossTwoLayer()
					.order(this.d3.twolayerOpt()),
				"Two Layer (flast)": this.d3.decrossTwoLayer()
			};

			const coords = {
				"Vertical (slow)": this.d3.coordVert(),
				"Minimum Curves (slow)": this.d3.coordMinCurve(),
				"Greedy (medium)": this.d3.coordGreedy(),
				"Center (fast)": this.d3.coordCenter()
			};

			const layout = this.d3
				.sugiyama()
				//.nodeSize(200, 100)
				.size([this.width, this.height])
				.layering(layerings[this.layering])
				.decross(decrossings[this.decross])
				.coord(coords[this.coord]);

			layout(dag);
			this.draw(dag);
		},
		draw(dag) {
			// This code only handles rendering
			const nodeRadius = 35;

			const svgSelection = this.d3
				.select("#graph")
				.append("svg")
				.attr("width", "100%")
				.attr("height", "100%")
				.attr(
					"viewBox",
					`${-nodeRadius} ${-nodeRadius} ${this.width * 1.25 +
						2 * nodeRadius} ${this.height * 1.25 + 2 * nodeRadius}`
				);
			const defs = svgSelection.append("defs"); // For gradients

			// Use computed layout
			// layout(dag);

			const steps = dag.size();
			const interp = this.d3.interpolateRainbow;
			const colorMap = {};
			dag.each((node, i) => {
				colorMap[node.id] = interp(i / steps);
			});

			// How to draw edges
			const line = this.d3
				.line()
				.curve(this.d3.curveCatmullRom)
				.x(d => d.x)
				.y(d => d.y);
			/*svgSelection
				.append("rect")
				.attr("width", "100%")
				.attr("height", "100%")
				.attr("fill", "black");*/
			// Plot edges

			const actualLinks = [];

			dag.links().forEach(link => {
				if (link.source.layer != "0") actualLinks.push(link);
			});

			svgSelection
				.append("g")
				.selectAll("path")
				.data(actualLinks)
				.enter()
				.append("path")
				.attr("d", ({ data }) => line(data.points))
				.attr("fill", "none")
				.attr("stroke-width", 3)
				.attr("stroke", ({ source, target }) => {
					const gradId = `${source.id}-${target.id}`;
					const grad = defs
						.append("linearGradient")
						.attr("id", gradId)
						.attr("gradientUnits", "userSpaceOnUse")
						.attr("x1", source.x)
						.attr("x2", target.x)
						.attr("y1", source.y)
						.attr("y2", target.y);
					grad.append("stop")
						.attr("offset", "0%")
						.attr("stop-color", colorMap[source.id]);
					grad.append("stop")
						.attr("offset", "100%")
						.attr("stop-color", colorMap[target.id]);
					return `url(#${gradId})`;
				});

			// Select nodes
			const nodes = svgSelection
				.append("g")
				.selectAll("g")
				.data(dag.descendants())
				.enter()
				.append("g")
				.attr("transform", ({ x, y }) => `translate(${x}, ${y})`);

			// Plot node circles
			/*nodes
				.append("circle")
				.attr("r", 35)
                .attr("fill", n => colorMap[n.id]);*/
			nodes
				.append("rect")
				.attr("fill", n => colorMap[n.id])
				.attr("width", "200")
				.attr("height", "100")
				.attr("x", -20)
				.attr("y", -20)
				.attr("rx", "10")
				.attr("ry", "10");

			var wrap;
			// create a text wrapping function
			wrap = this.d3
				.textwrap()
				// wrap to 100 x 200 pixels
				.bounds({ height: 100, width: 200 })
				// pad by an additional 10 pixels
				.padding(10)
				.method("tspans");

			nodes
				.append("text")
				.text(d => d.data.materia)
				//.text("Sistemas de Representacion 10.10 - Creditos: 3")
				.attr("font-weight", "bold")
				.attr("font-family", "Tahoma, Geneva, sans-serif")
				.attr("font-size", "20")
				.attr("text-anchor", "start")
				.attr("alignment-baseline", "middle")
				.attr("dominant-baseline", "middle")
				.attr("fill", "black")
				.attr("y", "10")
				.call(wrap);
		}
	}
};
</script>

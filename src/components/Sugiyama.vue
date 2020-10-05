<template>
	<v-col cols="12" id="graph"> </v-col>
</template>

<script>
import * as d3_base from "d3";
import * as d3_dag from "d3-dag";

export default {
	name: "Sugiyama",
	props: {
		dag: Object
	},

	data: () => ({
		width: screen.width,
		height: screen.height,
		layering: "Simplex (slow)",
		decross: "Optimal (slow)",
		coord: "Minimum Curves (slow)",
		d3: Object.assign({}, d3_base, d3_dag)
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
					let arr = [0, 0, 2, 1, 1, 2, 3];
					for (const [layer, node] of dag
						.idescendants("before")
						.entries()) {
						node.layer = arr[node.id];
						console.log(layer);
					}
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
				.size([this.width, this.height])
				.layering(layerings[this.layering])
				.decross(decrossings[this.decross])
				.coord(coords[this.coord]);

			layout(dag);
			let withArrows = false;
			this.draw(dag, withArrows);
		},
		draw(dag, withArrows) {
			// This code only handles rendering
			const nodeRadius = 35;

			const svgSelection = this.d3
				.select("#graph")
				.append("svg")
				.attr("width", this.width * 0.75)
				.attr("height", this.height * 0.75)
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

			// Plot edges
			svgSelection
				.append("g")
				.selectAll("path")
				.data(dag.links())
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
			nodes
				.append("circle")
				.attr("r", 35)
				.attr("fill", n => colorMap[n.id]);

			if (withArrows) {
				const arrow = this.d3
					.symbol()
					.type(this.d3.symbolTriangle)
					.size((nodeRadius * nodeRadius) / 5.0);
				svgSelection
					.append("g")
					.selectAll("path")
					.data(dag.links())
					.enter()
					.append("path")
					.attr("d", arrow)
					.attr("transform", ({ source, target, data }) => {
						console.log(source);
						console.log(target);
						const [end, start] = data.points.reverse();
						// This sets the arrows the node radius (20) + a little bit (3) away from the node center, on the last line segment of the edge. This means that edges that only span ine level will work perfectly, but if the edge bends, this will be a little off.
						const dx = start.x - end.x;
						const dy = start.y - end.y;
						const scale =
							(nodeRadius * 1.15) / Math.sqrt(dx * dx + dy * dy);
						// This is the angle of the last line segment
						const angle =
							(Math.atan2(-dy, -dx) * 180) / Math.PI + 90;
						console.log(angle, dx, dy);
						return `translate(${end.x + dx * scale}, ${end.y +
							dy * scale}) rotate(${angle})`;
					})
					.attr("fill", ({ target }) => colorMap[target.id])
					.attr("stroke", "white")
					.attr("stroke-width", 1.5);
			}

			nodes
				.append("text")
				.text(d => d.id)
				.attr("font-weight", "bold")
				.attr("font-family", "sans-serif")
				.attr("text-anchor", "middle")
				.attr("alignment-baseline", "middle")
				.attr("fill", "white");
		}
	}
};
</script>

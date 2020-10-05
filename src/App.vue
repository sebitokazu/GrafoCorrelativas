<template>
	<v-app>
		<v-app-bar app color="primary" dark>
			<div class="d-flex align-center">
				<v-img
					alt="ITBA Logo"
					class="shrink mr-2"
					contain
					src="https://www.itba.edu.ar/wp-content/uploads/2020/03/Marca-ITBA-Color-ALTA.png"
					transition="scale-transition"
					width="100"
				/>
			</div>
		</v-app-bar>

		<v-main>
			<v-container>
				<v-row no-gutters>
					<sugiyama :dag="dag" />
				</v-row>
			</v-container>
		</v-main>
	</v-app>
</template>

<script>
//import HelloWorld from "./components/HelloWorld";
//import * as d3 from "d3";
import * as d3_dag from "d3-dag";
import sugiyama from "./components/Sugiyama";
import json from "@/data/test.json";

export default {
	name: "App",

	components: {
		//HelloWorld
		sugiyama
	},

	data: () => ({
		dag: d3_dag.dagStratify()(json)
	}),
	mounted() {},
	methods: {}
};
</script>

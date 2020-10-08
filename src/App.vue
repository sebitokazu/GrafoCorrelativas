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
				<v-row>
					<v-col cols="4">
						<v-select
							:items="carreras"
							label="Carrera"
							dense
							filled
						>
						</v-select>
					</v-col>
					<v-col cols="2">
						<v-btn color="info" class="mt-3">Cargar</v-btn>
					</v-col>
					<v-spacer></v-spacer>
					<v-col>
						<v-btn color="success" class="mt-2" @click="download"
							>Descargar
							<v-icon right>get_app</v-icon>
						</v-btn>
					</v-col>
				</v-row>
				<v-row>
					<v-col cols="12">
						<sugiyama :dag="dag" />
					</v-col>
				</v-row>
			</v-container>
		</v-main>
	</v-app>
</template>

<script>
//import HelloWorld from "./components/HelloWorld";
import * as d3 from "d3";
import * as d3_dag from "d3-dag";
import sugiyama from "./components/Sugiyama";
import json from "@/data/test.json";
import * as d3_to_pdf from "d3-save-pdf";
import csv from "./data/CSVBioing.csv";
//import csvtojson from "csvtojson";

export default {
	name: "App",

	components: {
		//HelloWorld
		sugiyama
	},

	data: () => ({
		dag: d3_dag.dagStratify()(json),
		carreras: ["Informatica", "Industrial", "Bioingenieria"]
	}),
	async mounted() {
		await d3.csv(csv).then(csv => console.log(csv));
	},
	methods: {
		download() {
			d3_to_pdf.save(d3.select("svg").node(), {
				filename: "carrera"
			});
		},
		//var csv is the CSV file with headers
		csvToJSON(csv) {
			var lines = csv.split("\n");

			var result = [];

			// NOTE: If your columns contain commas in their values, you'll need
			// to deal with those before doing the next step
			// (you might convert them to &&& or something, then covert them back later)
			// jsfiddle showing the issue https://jsfiddle.net/
			var headers = lines[0].split(",");

			for (var i = 1; i < lines.length; i++) {
				var obj = {};
				var currentline = lines[i].split(",");

				for (var j = 0; j < headers.length; j++) {
					obj[headers[j]] = currentline[j];
				}

				result.push(obj);
			}

			//return result; //JavaScript object
			return JSON.stringify(result); //JSON
		}
	}
};
</script>

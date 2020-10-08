<template>
	<v-app>
		<v-app-bar color="primary" dark>
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
						<div v-if="hasLoaded">
							<sugiyama :dag="dag" />
						</div>
						<div v-else>
							<v-img
								:src="gifloader"
								max-width="400"
								max-height="300"
								class="align-center"
							></v-img>
						</div>
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
import json2 from "@/data/test3.json";
import * as d3_to_pdf from "d3-save-pdf";

export default {
	name: "App",

	components: {
		//HelloWorld
		sugiyama
	},

	data: () => ({
		dag: d3_dag.dagStratify()(json2),
		carreras: ["Informatica", "Industrial", "Bioingenieria"],
		hasLoaded: true,
		gifloader:
			"https://cdn.dribbble.com/users/159302/screenshots/1900376/material-spinner2.gif"
	}),
	async mounted() {
		await d3
			.csv(
				"https://raw.githubusercontent.com/sebitokazu/GrafoCorrelativas/fromCSV/src/data/CSVBioing.csv"
			)
			//.then(csv => {
			//	return JSON.stringify(csv);
			//})
			.then(json => {
				let aux = this.parseJSON(json);
				console.log(aux);
				//this.dag = d3_dag.dagStratify()(aux);
				//console.log(this.dag);
			})
			.then((this.hasLoaded = true));
	},
	computed: {
		/*dag() {
			if (this.hasLoaded) return d3_dag.dagStratify()(this.data);
			else return null;
		}*/
	},

	methods: {
		download() {
			d3_to_pdf.save(d3.select("svg").node(), {
				filename: "carrera"
			});
		},
		parseJSON(json) {
			let data = [];
			data.push({
				id: "Bio-13",
				layer: "0",
				parentIds: [],
				materia: "Ingreso",
				creditos: ""
			}); //Ingreso
			json.forEach(materia => {
				if (
					materia["Tipo (continúa desde L)"] == "Obligatoria" &&
					materia["AÑO"] != "5" &&
					materia["AÑO"] != "4" &&
					materia["AÑO"] != "3"
				) {
					let aux = {};
					aux.parentIds = [];
					materia["P1"] != ""
						? aux.parentIds.push(materia["P1"])
						: "";
					materia["P2"] != ""
						? aux.parentIds.push(materia["P2"])
						: "";
					materia["P3"] != ""
						? aux.parentIds.push(materia["P3"])
						: "";
					aux["id"] = materia["COD"];
					aux["materia"] = materia["MATERIA"];
					aux["creditos"] = materia["CREDITOS"];
					let layer = 0;
					if (materia["CUATRIMESTRE"] == "2")
						layer = parseInt(
							materia["CUATRIMESTRE"] * materia["AÑO"]
						);
					else
						layer =
							parseInt(materia["CUATRIMESTRE"] * materia["AÑO"]) +
							parseInt(materia["AÑO"]) -
							1;
					aux["layer"] = layer.toString();
					data.push(aux);
				}
			});
			return JSON.stringify(data);
		}
	}
};
</script>

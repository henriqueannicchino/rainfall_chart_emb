import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Line} from 'react-chartjs-2';

//import Header from '../../components/Header';

export default function Chart() {

	var [chartData, setChartData] = useState({});
	var [values, setValues] = useState({
		registros: []
	});
	
	var xdata = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
	var ydata = [32, 45, 12, 76, 69];
	var periodo = 'semana';

	const chart = () => {
		setChartData({
			/*labels: ['00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00',
				'05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
				'12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:30', '18:00', '18:30',
				'19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'],*/
			labels: xdata,
			datasets: [
				{
					label: 'nivel de precipitação',
					/*data: [32, 45, 12, 76, 69, 0, 12, 43, 32, 21, 15, 43, 19, 32, 45, 12, 76, 69, 0, 12, 43, 32, 21, 15, 43,
						32, 45, 12, 76, 69, 0, 12, 43, 32, 21, 15, 43, 19, 32, 45, 12, 76, 69, 0, 12, 43, 32, 21, 15, 43],*/
					data: ydata,
					backgroundColor: [
						'rgba(75, 192, 192, 0.6)'
					],
					borderWidth: 4
				}
			]
		})
	}
	//vai ser usado pra carregar o atual quando abrir o grafico
	useEffect(() => {
		chart();

		/*axios.get(`http://localhost:5000/dados_da_precipitacao?periodo=${periodo}`)
    	.then(res => {
      		//console.log(res.data.Precipitacao);
    	    setValues({ ...values, registros: res.data.Precipitacao })
    	})
    	.catch(function (error) {
        	console.log(error);
    	})*/

	}, [])

	async function loadData(periodo) {
		console.log(2);
		axios.get(`http://localhost:5000/dados_da_precipitacao?periodo=${periodo}`)
    	.then(res => {
			//console.log(res.data.Precipitacao);
			//var temp = JSON.stringify(res.data.Precipitacao)
			//console.log(typeof(temp));
			console.log(3);
			return res.data.Precipitacao;
    	    //setValues({ ...values, registros: res.data.Precipitacao })
    	})
    	.catch(function (error) {
			console.log(error);
		})
	}

	/*const loadData = (periodo) => {
		var period = periodo;
        axios.get(`http://localhost:5000/dados_precipitacao?periodo=semana`)
    	.then(res => {
			console.log(res.data.Precipitacao);
			var temp = JSON.stringify(res.data.Precipitacao)
			console.log(typeof(temp));
			return temp;
    	    //setValues({ ...values, registros: res.data.Precipitacao })
    	})
    	.catch(function (error) {
			console.log(error);
		})
    }*/

	async function updateChart(periodo){
		//console.log(periodo);
		var count = 0;
		xdata = [];
		ydata = [];
		//Dados do Dia
		if(periodo==1){
			console.log(1);
			await setValues({ ...values, registros: loadData('dia') })
			console.log(4);
			//loadData('dia');
			var count2 = values.registros.length -1;
			while (count < values.registros.length){
				xdata[count] = values.registros[count2].createdAt.slice(11,16);
				ydata[count] = values.registros[count2].precipitacao;
				count++;
				count2--;
			}//os dados do dia vem de tras pra frente
			//onde que você adicionar os valores tratatos para o gráfico?
			// Beleza
		}
		else if(periodo==2){
			console.log(1);
			var temp1 = await loadData('semana');
			console.log(4);
			console.log(temp1);
			//setValues({ ...values, registros: loadData('semana') })
			//loadData('semana');
			while (count < values.registros.length){
				xdata[count] = values.registros[count].data;
				ydata[count] = values.registros[count].precipitacao;
				count++;
			}

			//xdata = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
			//ydata = [32, 45, 12, 76, 69];
		}
		//console.log(values.registros);
		chart();
	};

    return (
		//style={{height: "500px", width: "500px"}}
        <div className="App">
			<h1>Grafico</h1>
			<button onClick={() => updateChart('1')}>1D</button>
			<button onClick={() => updateChart('2')}>1S</button>
			<button onClick={() => updateChart('3')}>15D</button>
			<button onClick={() => updateChart('4')}>1M</button>
			<button onClick={() => updateChart('5')}>1A</button>
			<div>
				<Line data={chartData} options={{
					responsive: true,
					title: {text: 'Precipitação', display: true},
					scales: {
						yAxes: [
							{
								ticks: {
									autoSkip: true,
									maxTicksLimit: 10,
									beginAtZero: true
								},
								gridLines: {
									display: false
								}
							}
						],
						xAxes: [
							{
								gridLines: {
									display: false
								}
							}
						]
					}	
				}}/>
			</div>
		</div>
    )
}
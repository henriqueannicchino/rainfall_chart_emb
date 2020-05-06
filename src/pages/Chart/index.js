//colocar tabela abaixo do grafico!!!

import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import { format,addHours } from 'date-fns'
import { Line } from 'react-chartjs-2';

//import Header from '../../components/Header';

export default function Chart() {

	var [chartData, setChartData] = useState({});
	var [registros, setRegistros] = useState();
	const [periodo, setPeriodo] = useState('dia');
	const [data, setData] = useState({
		x: [],
		y: []
	})

	//Esse useEffect vai ser somente para recupar os dados do back
	useEffect(() => {
		//console.log('Entrou aqui, vai pegar dados do back')
		//console.log('Periodo selecionado -> ' + periodo)
		async function LoadData() {
			//console.log('Inicio da função para pegar os dados do back')
			let response = await axios.get(`http://localhost:5000/dados_${periodo === 'dia' ? 'da_' : ''}precipitacao?periodo=${periodo}`)
				.then(res => {
					//console.log('Back retornou uma resposta')
					return res.data.Precipitacao;
				})
				.catch(function (error) {
					console.log(error);
				})
			//console.log('Organizando as respostas do back nas variaveis')
			//console.log('RESPOSTA -> ', response)
			setRegistros(response)
		}
		//console.log('Chamando função para pegar os dados do back')
		LoadData()
	}, [periodo]) //Esse aqui é chamado sempre que tu alterar o periodo, ou seja, cada vez que apertar no botão

	//Vai preparar os dados
	useEffect(() => {
		async function PrepararDados() {
			var xdata = [], ydata = [];
			var count = 0, count2, X, temp;
			if (periodo === 'dia') {
				//tratamento para os dados do dia
				await registros.map((registro) => {
					xdata.push(registro.createdAt);
					//let dataCerta = addHours(new Date(registro.createdAt), 4);
					//xdata.push(`${format(new Date(dataCerta), 'HH:mm')}`);
					ydata.push(registro.precipitacao);
					return; 
				})
				if(xdata[0]){
					count2 = xdata.length -1;
					while(count < xdata.length/2){
						X = JSON.stringify(xdata[count]);
						temp = JSON.stringify(xdata[count2]);
						xdata[count] = temp.slice(12,17);
						xdata[count2] = X.slice(12,17);
						temp = ydata[count2];
						ydata[count2] = ydata[count];
						ydata[count] = temp;
						count++;
						count2--;
					}
				} 
				setData({
					x: xdata,
					y: ydata
				})
			}
			else if (periodo === 'semana') {
				//tratamento para os dados da semana
				await registros.map((registro) => {
					xdata.push(registro.data);
					//let dataCerta = addHours(new Date(registro.data), 4);
					//xdata.push(`${format(new Date(registro.data), 'yyyy/mm/dd')}`);
					ydata.push(registro.precipitacao);
					return; 
				})
				if(xdata[0]){
					count2 = xdata.length -1;
					while(count < xdata.length/2){
						X = JSON.stringify(xdata[count]);
						temp = JSON.stringify(xdata[count2]);
						xdata[count] = temp.slice(9,11) + temp.slice(5,9) + temp.slice(1,5);
						xdata[count2] = X.slice(9,11) + X.slice(5,9) + X.slice(1,5);
						temp = ydata[count2];
						ydata[count2] = ydata[count];
						ydata[count] = temp;
						count++;
						count2--;
					}
				} 
				setData({
					x: xdata,
					y: ydata
				})
			}
			else if (periodo === 'quinzena') {
				//tratamento para os dados da quinzena
				await registros.map((registro) => {
					xdata.push(registro.data);
					ydata.push(registro.precipitacao);
					return; 
				})
				if(xdata[0]){
					count2 = xdata.length -1;
					while(count < xdata.length/2){
						X = JSON.stringify(xdata[count]);
						temp = JSON.stringify(xdata[count2]);
						xdata[count] = temp.slice(9,11) + temp.slice(5,9) + temp.slice(1,5);
						xdata[count2] = X.slice(9,11) + X.slice(5,9) + X.slice(1,5);
						temp = ydata[count2];
						ydata[count2] = ydata[count];
						ydata[count] = temp;
						count++;
						count2--;
					}
				} 
				setData({
					x: xdata,
					y: ydata
				})
			}
			else if (periodo === 'mes') {
				//tratamento para os dados do mes
				await registros.map((registro) => {
					xdata.push(registro.data);
					ydata.push(registro.precipitacao);
					return; 
				})
				if(xdata[0]){
					count2 = xdata.length -1;
					while(count < xdata.length/2){
						X = JSON.stringify(xdata[count]);
						temp = JSON.stringify(xdata[count2]);
						xdata[count] = temp.slice(9,11) + temp.slice(5,9) + temp.slice(1,5);
						xdata[count2] = X.slice(9,11) + X.slice(5,9) + X.slice(1,5);
						temp = ydata[count2];
						ydata[count2] = ydata[count];
						ydata[count] = temp;
						count++;
						count2--;
					}
				} 
				setData({
					x: xdata,
					y: ydata
				})
			}
			else if (periodo === 'ano') {
				//tratamento para os dados do ano
				await registros.map((registro) => {
					xdata.push(registro.data);
					ydata.push(registro.precipitacao);
					return; 
				})
				if(xdata[0]){
					count2 = xdata.length -1;
					while(count < xdata.length/2){
						X = JSON.stringify(xdata[count]);
						temp = JSON.stringify(xdata[count2]);
						xdata[count] = temp.slice(6,8) + temp[5] + temp.slice(1,5);
						xdata[count2] = X.slice(6,8) + X[5] + X.slice(1,5);
						temp = ydata[count2];
						ydata[count2] = ydata[count];
						ydata[count] = temp;
						count++;
						count2--;
					}
				} 
				setData({
					x: xdata,
					y: ydata
				})
			}
		}

		if (registros) {
			//console.log('Tem registros então vou montar o gráfico')
			PrepararDados();
		} else {
			//console.log('Não há registros ainda, não vou montar o gráfico')
			return;
		}
	}, [registros, periodo]) //ele só vai ser chamado novamente se o periodo ou os registros forem alterados
	

	//vai montar o gráfico
	useEffect(() => {
		if (data.x.length > 0 && data.y.length > 0) {
			setChartData({
			labels: data.x,
				datasets: [
					{
						label: 'nivel de precipitação',
						data: data.y,
						backgroundColor: [
							'rgba(75, 192, 192, 0.6)'
						],
						borderWidth: 4
					}
				]
			})
		}else{
			//A primeira vez ele vai cair aqui, daí nao vai executar nada
			console.log('vazio')
		}
	}, [data]) //ele só vai se chamado novamente quando alterar alguma coisa dentro da variavel 'data

	return (
		//style={{height: "500px", width: "500px"}}
		<div className="App">
			<h1>Grafico Precipitação</h1>
			<div style={{float: "left", "margin-left": "5%"}}>
				<button onClick={() => setPeriodo('dia')}>1D</button>
				<button onClick={() => setPeriodo('semana')}>1S</button>
				<button onClick={() => setPeriodo('quinzena')}>15D</button>
				<button onClick={() => setPeriodo('mes')}>1M</button>
				<button onClick={() => setPeriodo('ano')}>1A</button>
			</div>
			<div style={{height: "800px", width: "1100px"}}>

				{registros ?
					<Line data={chartData} options={{
						responsive: true,
						title: { text: 'Precipitação', display: true },
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
					}} />
					:
					<p>Carregando....</p>
				}

			</div>
		</div>
	)
}
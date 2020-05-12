import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import { format,addHours } from 'date-fns'
import { Line } from 'react-chartjs-2';
import * as ReactBootStrap from "react-bootstrap";
import { Form, FormGroup, Label, Input, Button} from 'reactstrap';
import './index.css';

//import Header from '../../components/Header';

export default function Chart() {

	var [chartData, setChartData] = useState({});
	var [registros, setRegistros] = useState();
	var [rows, setRows] = useState({
		VRow: [],
	});
	var [displayX, setDisplayX] = useState(false);
	const [periodo, setPeriodo] = useState('dia');
	const [data, setData] = useState({
		x: [],
		y: []
	});
	const [BEperiodo, setBEperiodo] = useState({
        inicio: '',
        fim: ''
    })

	//Esse useEffect vai ser somente para recupar os dados do back
	useEffect(() => {
		//console.log('Entrou aqui, vai pegar dados do back')
		//console.log('Periodo selecionado -> ' + periodo)
		async function LoadData() {
			//console.log('Inicio da função para pegar os dados do back')
			let response = await axios.get(`http://localhost:5000/dados_${periodo === 'dia'|| periodo === 'atual' ? 'da_' : ''}precipitacao?periodo=${periodo}`)
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
			var xdata = [], ydata = [], Vdata = [];
			var count = 0, count2, X, temp;
			setDisplayX(true);
			if (periodo === 'dia' || periodo === 'atual') {
				displayX = true;
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
						Vdata[count] = {data: xdata[count], precipitacao: ydata[count]};
						Vdata[count2] = {data: xdata[count2], precipitacao: ydata[count2]};
						count++;
						count2--;
					}
				}
				setData({
					x: xdata,
					y: ydata
				})
				setRows({
					VRow: Vdata
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
						Vdata[count] = {data: xdata[count], precipitacao: ydata[count]};
						Vdata[count2] = {data: xdata[count2], precipitacao: ydata[count2]};
						count++;
						count2--;
					}
				} 
				setData({
					x: xdata,
					y: ydata
				})
				setRows({
					VRow: Vdata
				})
			}
			else{
				//tratamento para os dados da semana, quinzena, mes e input
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
						Vdata[count] = {data: xdata[count], precipitacao: ydata[count]};
						Vdata[count2] = {data: xdata[count2], precipitacao: ydata[count2]};
						count++;
						count2--;
					}
				} 
				setData({
					x: xdata,
					y: ydata
				})
				setRows({
					VRow: Vdata
				})
				if (periodo === 'semana' || periodo === 'quinzena' || periodo === 'mes')
					setDisplayX(true);
				else
					setDisplayX(false);
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
			console.log('')
		}

	}, [data]) //ele só vai se chamado novamente quando alterar alguma coisa dentro da variavel 'data


	function renderData(Data, index) {
		//console.log(rows.VRow);
		return(
			<tr key={index}>
				<td>{Data.data}</td>
				<td>{Data.precipitacao}</td>
			</tr>
		)
	}

	function preparaPeriodo(){
		//console.log(typeof(BEperiodo.inicio + BEperiodo.fim));
		if(BEperiodo.inicio.length === 10 || BEperiodo.fim.length === 10){
			var tempPeriodo = [], error=0;
			if(BEperiodo.inicio[2]!=="/" || BEperiodo.inicio[5]!=="/" || BEperiodo.fim[2]!=="/" || BEperiodo.fim[5]!=="/"){
				error=1;
				alert("data invalida");
			}
			else {
				var count = 0, count2 = 0;
				while(count < 10){
					if(count===2 || count===5)
						count++;
					tempPeriodo[count2] = parseInt(BEperiodo.inicio[count]);
					tempPeriodo[count2 + 8] = parseInt(BEperiodo.fim[count]);
					if(isNaN(tempPeriodo[count2])===false && isNaN(tempPeriodo[count2 + 8])===false){
						count++;
						count2++;
					}
					else{
						error=1;
						alert("data invalida");
						break;
					}
				}
				if(error===0){
					tempPeriodo[0]=tempPeriodo[0] * 10 + tempPeriodo[1];
					tempPeriodo[1]=tempPeriodo[2] * 10 + tempPeriodo[3];
					tempPeriodo[2]=tempPeriodo[4] * 1000 + tempPeriodo[5] * 100 + tempPeriodo[6] * 10 + tempPeriodo[7];
					tempPeriodo[3]="_";
					tempPeriodo[4]=tempPeriodo[8] * 10 + tempPeriodo[9];
					tempPeriodo[5]=tempPeriodo[10] * 10 + tempPeriodo[11];
					tempPeriodo[6]=tempPeriodo[12] * 1000 + tempPeriodo[13] * 100 + tempPeriodo[14] * 10 + tempPeriodo[15];
					
					if(tempPeriodo[1]===1 || tempPeriodo[1]===3 || tempPeriodo[1]===5 || tempPeriodo[1]===7 || tempPeriodo[1]===8 || tempPeriodo[1]===10 || tempPeriodo[1]===12){
						if(tempPeriodo[0]<1 || tempPeriodo[0]>31){
							error=1;
							alert("data invalida");
						}
					}
					else if(tempPeriodo[1]===4 || tempPeriodo[1]===6 || tempPeriodo[1]===9 || tempPeriodo[1]===11){
						if(tempPeriodo[0]<1 || tempPeriodo[0]>30){
							error=1;
							alert("data invalida");
						}
					}
					else if(tempPeriodo[1]===2){
						if((tempPeriodo[2]%4===0 && tempPeriodo[2]%100!==0) || tempPeriodo[2]%400===0){
							if(tempPeriodo[0]<1 || tempPeriodo[0]>29){
								error=1;
								alert("data invalida");
							}
						}
						else{
							if(tempPeriodo[0]<1 || tempPeriodo[0]>28){
								error=1;
								alert("data invalida");
							}
						}
					}
					if(tempPeriodo[1]<1 || tempPeriodo[1]>12){
						error=1;
						alert("data invalida");
					}

					if(error===0){
						if(tempPeriodo[5]===1 || tempPeriodo[5]===3 || tempPeriodo[5]===5 || tempPeriodo[5]===7 || tempPeriodo[5]===8 || tempPeriodo[5]===10 || tempPeriodo[5]===12){
							if(tempPeriodo[4]<1 || tempPeriodo[4]>31){
								error=1;
								alert("data invalida");
							}
						}
						else if(tempPeriodo[5]===4 || tempPeriodo[5]===6 || tempPeriodo[5]===9 || tempPeriodo[5]===11){
							if(tempPeriodo[4]<1 || tempPeriodo[4]>30){
								error=1;
								alert("data invalida");
							}
						}
						else if(tempPeriodo[5]===2){
							if((tempPeriodo[6]%4===0 && tempPeriodo[6]%100!==0) || tempPeriodo[6]%400===0){
								if(tempPeriodo[4]<1 || tempPeriodo[4]>29){
									error=1;
									alert("data invalida");
								}
							}
							else{
								if(tempPeriodo[4]<1 || tempPeriodo[4]>28){
									error=1;
									alert("data invalida");
								}
							}
						}
						if(tempPeriodo[5]<1 || tempPeriodo[5]>12){
							error=1;
							alert("data invalida");
						}
					}
					if(error===0){
						//checa se a data de inicio eh menor que a final
						if(tempPeriodo[2] > tempPeriodo[6]){
							error=1;
							alert("data de inicio nao pode ser menor nem igual a data final");
						}
						else if(tempPeriodo[2] === tempPeriodo[6] && tempPeriodo[1] > tempPeriodo[5]){
							error=1;
							alert("data de inicio nao pode ser menor nem igual a data final");
						}
						else if((tempPeriodo[2] === tempPeriodo[6] && tempPeriodo[1] === tempPeriodo[5]) && tempPeriodo[0] > tempPeriodo[4]){
							error=1;
							alert("data de inicio nao pode ser menor nem igual a data final");
						}
						else{
							count = 0;
							var tempPeriodo2 = "";
							while(count < 7){
								if(tempPeriodo[count].toString().length === 1)
									tempPeriodo2 += "0" + tempPeriodo[count].toString();
								else
									tempPeriodo2 += tempPeriodo[count].toString();
								count++;
							}
							tempPeriodo2 = tempPeriodo2.slice(4,8) + "-" + tempPeriodo2.slice(2,4) + "-" + tempPeriodo2.slice(0,2) + "_" + tempPeriodo2.slice(14,18) + "-" + tempPeriodo2.slice(12,14) + "-" + tempPeriodo2.slice(10,12);

							setPeriodo(tempPeriodo2);
						}
					}
				}
			}
		}
		else{
			alert("Por Favor insira um periodo nesse formato inicio(dd/mm/yyyy) e fim(dd/mm/yyyy)");
		}
	}

	return (
		//style={{height: "500px", width: "500px"}}
		<div className="App">
			
			<div style={{height: "660px", width: "1100px"}}>
				<h1>Grafico Precipitação</h1>
				
				<div style={{float: "left", 'marginLeft': "5%"}}>
					<button onClick={() => setPeriodo('atual')}>Atual</button>
					<button onClick={() => setPeriodo('dia')}>1D</button>
					<button onClick={() => setPeriodo('semana')}>1S</button>
					<button onClick={() => setPeriodo('quinzena')}>15D</button>
					<button onClick={() => setPeriodo('mes')}>1M</button>
					<button onClick={() => setPeriodo('ano')}>1A</button>
				</div>

				<div style={{float: "right", 'marginRight': "5%"}}>
					<Form>
						<FormGroup>
							<Label for="Periodo_inicial">Inicio</Label>
							<Input type="text" value={BEperiodo.inicio} id="Periodo_inicial" onChange={e => setBEperiodo({ ...BEperiodo, inicio: e.target.value })} placeholder="dd/mm/yyyy" />
							<Label for="Periodo_final">Fim</Label>
							<Input type="text" value={BEperiodo.fim} id="Periodo_final" onChange={e => setBEperiodo({ ...BEperiodo, fim: e.target.value })} placeholder="dd/mm/yyyy" />
							<Button color="primary" block onClick={preparaPeriodo}> Buscar </Button>
						</FormGroup>
					</Form>
				</div>

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
									},
									ticks: {
										display: displayX
									}
								}
							]
						}
					}} />
					:
					<p>Carregando....</p>
				}
			</div>
			<div className="container">
				<ReactBootStrap.Table striped bordered hover>
					<thead>
						<tr>
							<th>Data</th>
							<th>Precipitação</th>
						</tr>
					</thead>
					<tbody>
						{rows.VRow.map(renderData)}
					</tbody>
				</ReactBootStrap.Table>
			</div>
		</div>
	)
}
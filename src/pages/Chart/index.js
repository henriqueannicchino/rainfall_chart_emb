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
	var [chartData2, setChartData2] = useState({});
	var [chartData3, setChartData3] = useState({});
	var [chartData4, setChartData4] = useState({});
	var [registros, setRegistros] = useState();
	var [grafico, setGrafico] = useState({
		g2: 'none', g3: 'none', g4: 'none'
	});
	var [labelx, setLabelx] = useState({
		l1: '', l2: '', l3: '', l4: ''
	});
	var [rows, setRows] = useState({
		VRow: [], VRow2: [], VRow3: [], VRow4: []
	});
	var [displayX, setDisplayX] = useState(false);
	const [periodo, setPeriodo] = useState('dia');
	var [data, setData] = useState({
		x: [], y: [],
		x2: [], y2: [],
		x3: [], y3: [],
		x4: [], y4: []
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
			setRegistros();
			//console.log('Inicio da função para pegar os dados do back')
			let response = await axios.get(`http://localhost:5000/dados_${periodo === 'dia'|| periodo === 'hoje' ? 'da_' : ''}precipitacao?periodo=${periodo}`)
				.then(res => {
					//console.log('Back retornou uma resposta')
					return res.data;
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
			var count = 0, count2, X, temp, igualBotao=0, mesesCount=0;
			var xdata2=[], ydata2=[], Vdata2=[], final=[];
			var xdata3=[], ydata3=[], Vdata3=[], xdata4=[], ydata4=[], Vdata4=[];
			ydata2[0]=0; ydata3[0]=0;
			var xdata3=[], ydata3=[], Vdata3=[], count3=0, tempMes;
			setDisplayX(true);
			await registros.Precipitacao.map((registro) => {
				xdata.push(registro.data);
				ydata.push(registro.precipitacao);
				return;
			})
			if(xdata.length===0) 
				setRegistros();
			igualBotao=registros.IgualBotao;
			mesesCount=registros.MesesCount;
			if (periodo === 'dia' || periodo === 'hoje') {
				//soma os dados 6 a 6 se for dia
				//tratamento para os dados do dia
				xdata = []; ydata = []
				await registros.Precipitacao.map((registro) => {
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
					if(periodo === 'dia'){
						count=0; count2=0;
						temp=[]; X=[]; Vdata=[];
						temp[0]=0;
						X[0]=xdata[0];
						while(count < xdata.length){
							temp[count2] = temp[count2] + ydata[count];
							if((count+1)%6===0){
								X[count2] = X[count2] + " a " + xdata[count];
								Vdata[count2] = {data: X[count2], precipitacao: temp[count2]};
								if(count < xdata.length+1 - 6){
									X[count2+1] = xdata[count+1];
									count2++;
									temp[count2]=0;
								}
							}
							count++;
						}
						xdata=X;
						ydata=temp;
					}
				}
				setData({
					x: xdata, y: ydata,
					x2: [], y2: [],
					x3: [], y3: [],
					x4: [], y4: []
				});
				setLabelx({
					l1: 'Hora', l2: '',
					l3: '', l4: ''
				});
				setGrafico({
					g2: 'none', g3: 'none', g4: 'none'
				});
				setRows({
					VRow: Vdata, VRow2: [],
					VRow3: [], VRow4: []
				});
			}
			else if (periodo === 'ano' || (mesesCount > 3 && mesesCount < 13)) {
				//tratamento para os dados do ano e para periodos entre 4 e 12 meses
				final[0]=0;final[1]=0;count2=0;ydata2[0]=0;ydata3[0]=0;
				if(xdata[0]){
					count = 0;
					X = JSON.stringify(xdata[0]);
					xdata2[0] = X.slice(9,11) + X.slice(5,9) + X.slice(1,5);
					xdata3[0] = X.slice(9,11) + X.slice(5,9) + X.slice(1,5);
					tempMes = X.slice(6,8);
					
					while(count < xdata.length){
						X = JSON.stringify(xdata[count]);
						xdata[count] = X.slice(9,11) + X.slice(5,9) + X.slice(1,5);
						ydata2[count2] += ydata[count];
						if(tempMes!==X.slice(6,8)){
							tempMes=X.slice(6,8);
							xdata3[count3] = xdata3[count3] + " a " + xdata[count-1];
							Vdata3[count3] = {data: xdata3[count3], precipitacao: ydata3[count3]};
							count3++;
							xdata3[count3] = xdata[count];
							ydata3[count3]=0;
						}
						ydata3[count3] += ydata[count];

						if((count+1)%15===0){
							xdata2[count2] = xdata2[count2] + " a " + xdata[count];
							Vdata2[count2] = {data: xdata2[count2], precipitacao: ydata2[count2]};
							if(count+1 < xdata.length){
								X = JSON.stringify(xdata[count+1]);
								count2++;
								xdata2[count2] = X.slice(9,11) + X.slice(5,9) + X.slice(1,5);
								ydata2[count2]=0;
							}else{
								final[0]=1;
							}
						}

						count++;
					}
					if(!final[0]){
						xdata2[count2] = xdata2[count2] + " a " + xdata[count-1];
						Vdata2[count2] = {data: xdata2[count2], precipitacao: ydata2[count2]};
					}
					xdata3[count3] = xdata3[count3] + " a " + xdata[count-1];
					Vdata3[count3] = {data: xdata3[count3], precipitacao: ydata3[count3]};
				} 
				setData({
					x: xdata2, y: ydata2,
					x2: xdata3, y2: ydata3,
					x3: [], y3: [],
					x4: [], y4: []
				})
				setLabelx({
					l1: 'Quinzena', l2: 'Mês',
					l3: '', l4: ''
				});
				setGrafico({
					g2: 'block', g3: 'none', g4: 'none'
				});
				setRows({
					VRow: Vdata2, VRow2: Vdata3,
					VRow3: [], VRow4: []
				})
			}
			else{
				//tratamento para os dados da semana, quinzena, mes e input
				
				if(xdata[0]){
					if(mesesCount < 4){
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
					if(periodo === 'mes' || (mesesCount > 0 && mesesCount < 4)){
						count=0; count2=0;
						/*xdata2=[], ydata2=[], Vdata2=[] guarda a soma semanal*/
						/*xdata3=[], ydata3=[], Vdata3=[], tempMes; guarda a soma quinzenal*/
						/*xdata4=[], ydata4=[], Vdata4=[], //guarda a soma mensal*/
						var tamanho=xdata.length, count4=0; final[0]=0;final[1]=0;final[2]=0; ydata4[0]=0;
						xdata2[0]=xdata[0]; xdata3[0]=xdata[0]; xdata4[0]=xdata[0];ydata3[0]=0;
						tempMes=parseInt(xdata[0][3]) * 10 + parseInt(xdata[0][4]);
						while(count < tamanho){
							ydata2[count2] = ydata2[count2] + ydata[count];
							ydata3[count3] = ydata3[count3] + ydata[count];
							if((count+1)%7===0){
								xdata2[count2] = xdata2[count2] + " a " + xdata[count];
								Vdata2[count2] = {data: xdata2[count2], precipitacao: ydata2[count2]};
								
								if(count+1 < tamanho){
									xdata2[count2+1] = xdata[count+1];
									count2++;
									ydata2[count2]=0;
								}else{
									final[0]=1;
								}
							}
							if((count+1)%15===0){
								xdata3[count3] = xdata3[count3] + " a " + xdata[count];
								Vdata3[count3] = {data: xdata3[count3], precipitacao: ydata3[count3]};
								if(count+1 < tamanho){
									xdata3[count3+1] = xdata[count+1];
									count3++;
									ydata3[count3]=0;
								}else{
									final[1]=1;
								}
							}
							if(tempMes!==parseInt(xdata[count][3]) * 10 + parseInt(xdata[count][4])){
								tempMes=parseInt(xdata[count][3]) * 10 + parseInt(xdata[count][4]);
								xdata4[count4] = xdata4[count4] + " a " + xdata[count-1];
								Vdata4[count4] = {data: xdata4[count4], precipitacao: ydata4[count4]};
								
								xdata4[count4+1] = xdata[count];
								count4++;
								ydata4[count4]=0;
							}
							ydata4[count4] = ydata4[count4] + ydata[count];				

							count++;
							if(count === xdata.length){
								if(!final[0]){
									xdata2[count2] = xdata2[count2] + " a " + xdata[count-1];
									Vdata2[count2] = {data: xdata2[count2], precipitacao: ydata2[count2]};
								}
								if(!final[1]){
									xdata3[count3] = xdata3[count3] + " a " + xdata[count-1];
									Vdata3[count3] = {data: xdata3[count3], precipitacao: ydata3[count3]};
								}
								xdata4[count4] = xdata4[count4] + " a " + xdata[count-1];
								Vdata4[count4] = {data: xdata4[count4], precipitacao: ydata4[count4]};
							}
						}
						setLabelx({
							l1: 'Data', l2: 'Semana',
							l3: 'Quinzena', l4: 'Mês'
						});
						setGrafico({
							g2: 'block', g3: 'block', g4: 'block'
						});
						setData({
							x: xdata, y: ydata,
							x2: xdata2, y2: ydata2,
							x3: xdata3, y3: ydata3,
							x4: xdata4, y4: ydata4
						})
						setRows({
							VRow: Vdata,
							VRow2: Vdata2,
							VRow3: Vdata3,
							VRow4: Vdata4
						})
					}
					else if(mesesCount > 12){
						count2 = xdata.length -1;
						while(count < xdata.length/2){
							X = JSON.stringify(xdata[count]);
							temp = JSON.stringify(xdata[count2]);
							xdata[count] = temp.slice(6,8) + temp[5] + temp.slice(1,5);
							xdata[count2] = X.slice(6,8) + temp[5] + X.slice(1,5);
							temp = ydata[count2];
							ydata[count2] = ydata[count];
							ydata[count] = temp;
							Vdata[count] = {data: xdata[count], precipitacao: ydata[count]};
							Vdata[count2] = {data: xdata[count2], precipitacao: ydata[count2]};
							count++;
							count2--;
						}

						count2=0;count=0;ydata3[0]=0;
						xdata2[0]=xdata[0]; xdata3[0]=xdata[0];
						var tamanho=xdata.length;
						final[0]=0;final[1]=0;
						while(count < tamanho){
							ydata2[count2] = ydata2[count2] + ydata[count];
							ydata3[count3] = ydata3[count3] + ydata[count];
							if((count+1)%3===0){
								xdata2[count2] = xdata2[count2] + " a " + xdata[count];
								Vdata2[count2] = {data: xdata2[count2], precipitacao: ydata2[count2]};
								
								if(count+1 < tamanho){
									xdata2[count2+1] = xdata[count+1];
									count2++;
									ydata2[count2]=0;
								}else{
									final[0]=1;
								}
							}
							if((count+1)%12===0){
								xdata3[count3] = xdata3[count3] + " a " + xdata[count];
								Vdata3[count3] = {data: xdata3[count3], precipitacao: ydata3[count3]};
								if(count+1 < tamanho){
									xdata3[count3+1] = xdata[count+1];
									count3++;
									ydata3[count3]=0;
								}else{
									final[1]=1;
								}
							}			

							count++;
						}
						if(!final[0]){
							xdata2[count2] = xdata2[count2] + " a " + xdata[count-1];
							Vdata2[count2] = {data: xdata2[count2], precipitacao: ydata2[count2]};
						}
						if(!final[1]){
							xdata3[count3] = xdata3[count3] + " a " + xdata[count-1];
							Vdata3[count3] = {data: xdata3[count3], precipitacao: ydata3[count3]};
						}
						setLabelx({
							l1: 'Mês', l2: 'trimestre',
							l3: 'Ano', l4: []
						});
						setGrafico({
							g2: 'block', g3: 'block', g4: 'none'
						});
						setData({
							x: xdata, y: ydata,
							x2: xdata2, y2: ydata2,
							x3: xdata3, y3: ydata3,
							x4: [], y4: []
						})
						setRows({
							VRow: Vdata,
							VRow2: Vdata2,
							VRow3: Vdata3,
							VRow4: []
						})
					}
					else{
						setLabelx({
							l1: 'Data', l2: '',
							l3: '', l4: ''
						});
						setGrafico({
							g2: 'none', g3: 'none', g4: 'none'
						});
						setData({
							x: xdata, y: ydata,
							x2: [], y2: [],
							x3: [], y3: [],
							x4: [], y4: []
						})
						setRows({
							VRow: Vdata,
							VRow2: [],
							VRow3: [],
							VRow4: []
						})
					}
				}

				if(igualBotao){
					setDisplayX(true);
				}else{
					setDisplayX(false);
				}
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
						label: 'Precipitação (mm)',
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

		if (data.x2.length > 0 && data.y2.length > 0) {
			setChartData2({
				labels: data.x2,
				datasets: [
					{
						label: 'Precipitação (mm)',
						data: data.y2,
						backgroundColor: [
							'rgba(75, 192, 192, 0.6)'
						],
						borderWidth: 4
					}
				]
			})
		}else{
			console.log('')
		}

		if (data.x3.length > 0 && data.y3.length > 0) {
			setChartData3({
				labels: data.x3,
				datasets: [
					{
						label: 'Precipitação (mm)',
						data: data.y3,
						backgroundColor: [
							'rgba(75, 192, 192, 0.6)'
						],
						borderWidth: 4
					}
				]
			})
		}else{
			console.log('')
		}

		if (data.x4.length > 0 && data.y4.length > 0) {
			setChartData4({
				labels: data.x4,
				datasets: [
					{
						label: 'Precipitação (mm)',
						data: data.y4,
						backgroundColor: [
							'rgba(75, 192, 192, 0.6)'
						],
						borderWidth: 4
					}
				]
			})
		}else{
			console.log('')
		}

	}, [data]) //ele só vai se chamado novamente quando alterar alguma coisa dentro da variavel data


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
		if(BEperiodo.inicio.length === 8 && BEperiodo.fim.length === 8){
			var tempPeriodo = [], error=0;
			var count = 0;
			while(count < 8){
				tempPeriodo[count] = parseInt(BEperiodo.inicio[count]);
				tempPeriodo[count + 8] = parseInt(BEperiodo.fim[count]);
				count++;
				/*if(isNaN(tempPeriodo[count2])===false && isNaN(tempPeriodo[count2 + 8])===false){
					count++;
					count2++;
				}
				else{
					error=1;
					alert("data invalida");
					break;
				}*/
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
					else if((tempPeriodo[2] === tempPeriodo[6] && tempPeriodo[1] === tempPeriodo[5]) && tempPeriodo[0] >= tempPeriodo[4]){
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
		else{
			alert("Por Favor insira um periodo nesse formato inicio(ddmmyyyy) e fim(ddmmyyyy)");
		}
	}

	return (
		//style={{height: "500px", width: "500px"}}
		<div className="App">
			
			<div style={{width: "100%"}}>
				<h1>Precipitação</h1>
				
				<div style={{float: "left", 'marginLeft': "5%"}}>
					<button onClick={() => setPeriodo('hoje')}>hoje</button>
					<button onClick={() => setPeriodo('dia')}>1 dia</button>
					<button onClick={() => setPeriodo('semana')}>1 semana</button>
					<button onClick={() => setPeriodo('quinzena')}>15 dias</button>
					<button onClick={() => setPeriodo('mes')}>1 mês</button>
					<button onClick={() => setPeriodo('ano')}>1 ano</button>
				</div>

				<div style={{float: "right", 'marginRight': "5%"}}>
					<Form>
						<FormGroup>
							<Label for="Periodo_inicial">Inicio</Label>
							<Input type="text" value={BEperiodo.inicio} id="Periodo_inicial" onChange={e => setBEperiodo({ ...BEperiodo, inicio: e.target.value })} placeholder="ddmmyyyy" />
							<Label for="Periodo_final">Fim</Label>
							<Input type="text" value={BEperiodo.fim} id="Periodo_final" onChange={e => setBEperiodo({ ...BEperiodo, fim: e.target.value })} placeholder="ddmmyyyy" />
							<Button color="primary" block onClick={preparaPeriodo}> Pesquisar </Button>
						</FormGroup>
					</Form>
				</div>

				<div style={{float: "left", width: grafico.g2 === "none" ? "100%" : "50%"}}>
					{registros ?
						<Line data={chartData} options={{
							responsive: true,
							title: { text: 'Precipitação', display: false },
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
										},
										scaleLabel: {
											labelString: "Precipitação (mm)",
											display: true
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
										},
										scaleLabel: {
											labelString: labelx.l1,
											display: true
										}
									}
								]
							}
						}} />
						:
						<p>Carregando....</p>
					}

					{registros ?
						<div className="container">
							<ReactBootStrap.Table striped bordered hover>
								<thead>
									<tr>
										<th style={{width: 125 }}>{labelx.l1}</th>
										<th style={{width: 125 }}>Precipitação</th>
									</tr>
								</thead>
								<tbody>
									{rows.VRow.map(renderData)}
								</tbody>
							</ReactBootStrap.Table>
						</div>
						:
						<p></p>
					}

				</div>

				<div style={{float: "left", width: "50%"}}>
					{registros && grafico.g2!=="none" ?
						<Line data={chartData2} options={{
							responsive: true,
							title: { text: 'Precipitação', display: false },
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
										},
										scaleLabel: {
											labelString: "Precipitação (mm)",
											display: true
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
										},
										scaleLabel: {
											labelString: labelx.l2,
											display: true
										}
									}
								]
							}
						}} />
						:
						<p></p>

					}

					{registros ?
						<div className="container" style={{display: grafico.g2}}>
							<ReactBootStrap.Table striped bordered hover>
								<thead>
									<tr>
										<th style={{width: 125 }}>{labelx.l2}</th>
										<th style={{width: 125 }}>Precipitação</th>
									</tr>
								</thead>
								<tbody>
									{rows.VRow2.map(renderData)}
								</tbody>
							</ReactBootStrap.Table>
						</div>
						:
						<p></p>
					}

				</div>

				<div style={{float: "left", width: "50%",marginTop: "40px"}}>
					{registros && grafico.g3!=="none" ?
						<Line data={chartData3} options={{
							responsive: true,
							title: { text: 'Precipitação', display: false },
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
										},
										scaleLabel: {
											labelString: "Precipitação (mm)",
											display: true
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
										},
										scaleLabel: {
											labelString: labelx.l3,
											display: true
										}
									}
								]
							}
						}} />
						:
						<p></p>

					}

					{registros ?
						<div className="container" style={{display: grafico.g3}}>
							<ReactBootStrap.Table striped bordered hover>
								<thead>
									<tr>
										<th style={{width: 125 }}>{labelx.l3}</th>
										<th style={{width: 125 }}>Precipitação</th>
									</tr>
								</thead>
								<tbody>
									{rows.VRow3.map(renderData)}
								</tbody>
							</ReactBootStrap.Table>
						</div>
						:
						<p></p>
					}

				</div>

				<div style={{float: "left", width: "50%",marginTop: "40px"}}>
					{registros && grafico.g4!=="none" ?
						<Line data={chartData4} options={{
							responsive: true,
							title: { text: 'Precipitação', display: false },
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
										},
										scaleLabel: {
											labelString: "Precipitação (mm)",
											display: true
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
										},
										scaleLabel: {
											labelString: labelx.l4,
											display: true
										}
									}
								]
							}
						}} />
						:
						<p></p>

					}

					{registros ?
						<div className="container" style={{display: grafico.g4}}>
							<ReactBootStrap.Table striped bordered hover>
								<thead>
									<tr>
										<th style={{width: 125 }}>{labelx.l4}</th>
										<th style={{width: 125 }}>Precipitação</th>
									</tr>
								</thead>
								<tbody>
									{rows.VRow4.map(renderData)}
								</tbody>
							</ReactBootStrap.Table>
						</div>
						:
						<p></p>
					}

				</div>

			</div>

		</div>
	)
}
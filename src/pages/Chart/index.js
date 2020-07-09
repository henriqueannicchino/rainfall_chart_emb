
import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import { format,addHours } from 'date-fns'
import { Line, Bar } from 'react-chartjs-2';
import * as ReactBootStrap from "react-bootstrap";
import { Form, FormGroup, Label, Button} from 'reactstrap';
import NumberFormat from 'react-number-format';
import './index.css';

//import Header from '../../components/Header';

export default function Chart() {

	var [chartData, setChartData] = useState({});
	var [chartData2, setChartData2] = useState({});
	var [chartData3, setChartData3] = useState({});
	var [chartData4, setChartData4] = useState({});
	var [registros, setRegistros] = useState();
	var [periodoGrafico, setPeriodoGrafico] = useState();
	var [grafico, setGrafico] = useState({
		g2: 'none', g3: 'none', g4: 'none'
	});
	var [labelx, setLabelx] = useState({
		l1: '', l2: '', l3: '', l4: ''
	});
	var [rows, setRows] = useState({
		VRow: [], VRow2: [], VRow3: [], VRow4: []
	});
	var [totalGrafico, setTotalGrafico] = useState();
	/*var [displayX, setDisplayX] = useState(false);*/
	var [ehAno, setEhAno] = useState(false);
	var [ehMes, setEhMes] = useState(false);
	var [ehMaiorQAno, setEhMaiorQAno] = useState(false);
	var [ehMenorQAno, setEhMenorQAno] = useState(false);
	var [sizeTable2, setSizeTable2] = useState(0);
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
    });

	//Esse useEffect vai ser somente para recupar os dados do back
	useEffect(() => {
		//console.log('Entrou aqui, vai pegar dados do back')
		//console.log('Periodo selecionado -> ' + periodo)
		async function LoadData() {
			setRegistros();
			//console.log('Inicio da função para pegar os dados do back')
			let response = await axios.get(`http://localhost:5000/dados_${periodo === 'dia'|| periodo === 'hoje' ? 'da_' : ''}precipitacao?periodo=${periodo}&modulo_id=1`)
				.then(res => {
					//console.log('Back retornou uma resposta')
					return res.data;
				})
				.catch(function (error) {
					console.log(error);
				})
			//console.log('Organizando as respostas do back nas variaveis')
			//console.log('RESPOSTA -> ', response)
			setRegistros(response);
		}
		//console.log('Chamando função para pegar os dados do back')
		LoadData()
	}, [periodo]) //Esse aqui é chamado sempre que tu alterar o periodo, ou seja, cada vez que apertar no botão

	//Vai preparar os dados
	useEffect(() => {
		async function PrepararDados() {
			var xdata = [], ydata = [], Vdata = [];
			var count = 0, count2, X, temp, mesesCount=0 /*,igualBotao=0*/;
			var xdata2=[], ydata2=[], Vdata2=[], final=[];
			var xdata3=[], ydata3=[], Vdata3=[], xdata4=[], ydata4=[], Vdata4=[];
			ydata2[0]=0; ydata3[0]=0;
			var count3=0, tempMes,tamanho,count4=0, precipitacaoTotal;
			//setDisplayX(true);
			setEhMaiorQAno(false);
			setEhAno(false);
			setEhMenorQAno(false);
			setEhMes(false);
			await registros.Precipitacao.map((registro) => {
				xdata.push(registro.data);
				ydata.push(registro.precipitacao);
				return;
			})
			if(xdata.length===0) 
				setRegistros();
			//igualBotao=registros.IgualBotao;
			mesesCount=registros.MesesCount;
			if (periodo === 'dia' || periodo === 'hoje') {
				//soma os dados 6 a 6 se for dia
				//tratamento para os dados do dia
				xdata = []; ydata = []; precipitacaoTotal=0;
				await registros.Precipitacao.map((registro) => {
					xdata.push(registro.createdAt);
					//let dataCerta = addHours(new Date(registro.createdAt), 4);
					//xdata.push(`${format(new Date(dataCerta), 'HH:mm')}`);
					ydata.push(registro.precipitacao);
					return; 
				})
				if(xdata[0]){
					count2 = xdata.length -1;
					setPeriodoGrafico(xdata[0].slice(8,10) + '/' + xdata[0].slice(5,7) + '/' + xdata[0].slice(0,4));
					while(count < xdata.length/2){
						X = JSON.stringify(xdata[count]);
						temp = JSON.stringify(xdata[count2]);
						if(temp[15]==='0' && temp[16]==='0')
							xdata[count] = temp.slice(12,14)+'h';
						else
							xdata[count] = temp.slice(12,17);
						if(X[15]==='0' && X[16]==='0')
							xdata[count2] = X.slice(12,14)+'h';
						else
							xdata[count2] = X.slice(12,17);
						temp = ydata[count2];
						ydata[count2] = ydata[count];
						ydata[count] = temp;
						if(count!==count2)
							precipitacaoTotal+=ydata[count]+ydata[count2];
						else
							precipitacaoTotal+=ydata[count];
						Vdata[count] = {data: xdata[count], precipitacao: ydata[count]};
						Vdata[count2] = {data: xdata[count2], precipitacao: ydata[count2]};
						count++;
						count2--;
					}

					setTotalGrafico(precipitacaoTotal.toFixed(1));

					if(periodo === 'dia'){
						count=0; count2=0;
						temp=[]; X=[]; Vdata=[];
						temp[0]=0;
						X[0]=xdata[0];
						while(count < xdata.length){
							temp[count2] = temp[count2] + ydata[count];
							if((count+1)%6===0){
								X[count2] = X[count2] + " a " + xdata[count];
								temp[count2] = temp[count2].toFixed(1);
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
					else{
						count = 0; Vdata = [];
						while(count < xdata.length){
							ydata[count] = ydata[count].toFixed(1);
							Vdata[count] = {data: xdata[count], precipitacao: ydata[count]};
							count++;
						}
					}
				}
				setData({
					x: xdata, y: ydata,
					x2: [], y2: [],
					x3: [], y3: [],
					x4: [], y4: []
				});
				setLabelx({
					l1: 'HORA', l2: '',
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
				final[0]=0;final[1]=0;count2=0;ydata2[0]=0;ydata3[0]=0;ydata4[0]=0;
				precipitacaoTotal=0;
				if(xdata[0]){
					count = 0;
					X = JSON.stringify(xdata[0]);
					xdata2[0] = xdata3[0] = xdata4[0] = X.slice(9,11) + '/' + X.slice(6,8) + '/' + X.slice(1,5);
					tempMes = X.slice(6,8);
					var countMes=0;
					
					while(count < xdata.length){
						X = JSON.stringify(xdata[count]);
						xdata[count] = X.slice(9,11) + '/' + X.slice(6,8) + '/' + X.slice(1,5);
						ydata2[count2] += ydata[count];
						ydata4[count4] += ydata[count];
						precipitacaoTotal += ydata[count];
						if(tempMes!==X.slice(6,8)){
							tempMes=X.slice(6,8);
							if(count-1>=0)
								xdata3[count3] = xdata3[count3] + " a " + xdata[count-1];
							else
								xdata3[count3] = xdata3[count3] + " a " + xdata[count];
							xdata3[count3] = await ConverterParaMes(xdata3[count3]);
							ydata3[count3] = ydata3[count3].toFixed(1);
							Vdata3[count3] = {data: xdata3[count3], precipitacao: ydata3[count3]};
							count3++;countMes++;
							xdata3[count3] = xdata[count];
							ydata3[count3]=0;
						}
						ydata3[count3] += ydata[count];

						if((count+1)%15===0){
							xdata2[count2] = xdata2[count2] + " a " + xdata[count];
							ydata2[count2] = ydata2[count2].toFixed(1);
							Vdata2[count2] = {data: xdata2[count2], precipitacao: ydata2[count2]};
							if(count+1 < xdata.length){
								X = JSON.stringify(xdata[count+1]);
								count2++;
								xdata2[count2] = X.slice(9,11) + '/' + X.slice(6,8) + '/' + X.slice(1,5);
								ydata2[count2]=0;
							}else{
								final[0]=1;
							}
						}

						if(countMes===3){
							if(count-1>=0)
								xdata4[count4] = xdata4[count4] + " a " + xdata[count-1];
							else
								xdata4[count4] = xdata4[count4] + " a " + xdata[count];
							xdata4[count4] = await ConverterParaTrimestre(xdata4[count4]);
							ydata4[count4] = ydata4[count4].toFixed(1);
							Vdata4[count4] = {data: xdata4[count4], precipitacao: ydata4[count4]};
							count4++;countMes=0;
							xdata4[count4] = xdata[count];
							ydata4[count4]=0;
						}

						count++;
					}
					if(!final[0]){
						xdata2[count2] = xdata2[count2] + " a " + xdata[count-1];
						ydata2[count2] = ydata2[count2].toFixed(1);
						Vdata2[count2] = {data: xdata2[count2], precipitacao: ydata2[count2]};
					}
					xdata3[count3] = xdata3[count3] + " a " + xdata[count-1];
					xdata3[count3] = await ConverterParaMes(xdata3[count3]);
					ydata3[count3] = ydata3[count3].toFixed(1);
					Vdata3[count3] = {data: xdata3[count3], precipitacao: ydata3[count3]};

					xdata4[count4] = xdata4[count4] + " a " + xdata[count-1];
					xdata4[count4] = await ConverterParaTrimestre(xdata4[count4]);
					ydata4[count4] = ydata4[count4].toFixed(1);
					Vdata4[count4] = {data: xdata4[count4], precipitacao: ydata4[count4]};
				}
				
				count=xdata2.length ;
				count=count*45;
				setSizeTable2(count);
				
				setTotalGrafico(precipitacaoTotal.toFixed(1));
				setPeriodoGrafico(xdata[0] + " a " + xdata[xdata.length-1]);
				setEhAno(true);
				setData({
					x: xdata2, y: ydata2,
					x2: xdata3, y2: ydata3,
					x3: xdata4, y3: ydata4,
					x4: [], y4: []
				});
				setLabelx({
					l1: 'QUINZENA', l2: 'MÊS',
					l3: 'TRIMESTRE', l4: ''
				});
				setGrafico({
					g2: 'block', g3: 'block', g4: 'none'
				});
				setRows({
					VRow: Vdata2, VRow2: Vdata3,
					VRow3: Vdata4, VRow4: []
				})
			}
			else{
				//tratamento para os dados da semana, quinzena, mes e input
				precipitacaoTotal=0;
				if(xdata[0]){
					if(mesesCount < 4){
						count2 = xdata.length -1;
						while(count < xdata.length/2){
							X = JSON.stringify(xdata[count]);
							temp = JSON.stringify(xdata[count2]);
							xdata[count] = temp.slice(9,11) + '/' + temp.slice(6,8) + '/' + temp.slice(1,5);
							xdata[count2] = X.slice(9,11) + '/' + X.slice(6,8) + '/' + X.slice(1,5);
							temp = ydata[count2];
							ydata[count2] = ydata[count];
							ydata[count] = temp;
							if(count!==count2)
								precipitacaoTotal+=ydata[count]+ydata[count2];
							else
								precipitacaoTotal+=ydata[count];
							Vdata[count] = {data: xdata[count], precipitacao: ydata[count]};
							Vdata[count2] = {data: xdata[count2], precipitacao: ydata[count2]};
							count++;
							count2--;
						}
					}

					setTotalGrafico(precipitacaoTotal.toFixed(1));

					if(periodo === 'mes' || (mesesCount > 0 && mesesCount < 4)){
						count=0; count2=0;
						/*xdata2=[], ydata2=[], Vdata2=[] guarda a soma semanal*/
						/*xdata3=[], ydata3=[], Vdata3=[], tempMes; guarda a soma quinzenal*/
						/*xdata4=[], ydata4=[], Vdata4=[], //guarda a soma mensal*/
					    count4=0;final[0]=0;final[1]=0;final[2]=0; ydata4[0]=0;tamanho=xdata.length;
						xdata2[0]=xdata[0]; xdata3[0]=xdata[0]; /*xdata4[0]=xdata[0];*/ydata3[0]=0;
						tempMes=parseInt(xdata[0][3]) * 10 + parseInt(xdata[0][4]);
						while(count < tamanho){
							ydata2[count2] = ydata2[count2] + ydata[count];
							ydata3[count3] = ydata3[count3] + ydata[count];
							if((count+1)%7===0){
								xdata2[count2] = xdata2[count2] + " a " + xdata[count];
								ydata2[count2] = ydata2[count2].toFixed(1);
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
								ydata3[count3] = ydata3[count3].toFixed(1);
								Vdata3[count3] = {data: xdata3[count3], precipitacao: ydata3[count3]};
								if(count+1 < tamanho){
									xdata3[count3+1] = xdata[count+1];
									count3++;
									ydata3[count3]=0;
								}else{
									final[1]=1;
								}
							}
							/*if(tempMes!==parseInt(xdata[count][3]) * 10 + parseInt(xdata[count][4])){
								tempMes=parseInt(xdata[count][3]) * 10 + parseInt(xdata[count][4]);
								xdata4[count4] = xdata4[count4] + " a " + xdata[count-1];
								xdata4[count4] = await ConverterParaMes(xdata4[count4]);
								ydata4[count4] = ydata4[count4].toFixed(1);
								Vdata4[count4] = {data: xdata4[count4], precipitacao: ydata4[count4]};
								
								xdata4[count4+1] = xdata[count];
								count4++;
								ydata4[count4]=0;
							}
							ydata4[count4] = ydata4[count4] + ydata[count];	*/			

							count++;
							if(count === xdata.length){
								if(!final[0]){
									xdata2[count2] = xdata2[count2] + " a " + xdata[count-1];
									ydata2[count2] = ydata2[count2].toFixed(1);
									Vdata2[count2] = {data: xdata2[count2], precipitacao: ydata2[count2]};
								}
								if(!final[1]){
									xdata3[count3] = xdata3[count3] + " a " + xdata[count-1];
									ydata3[count3] = ydata3[count3].toFixed(1);
									Vdata3[count3] = {data: xdata3[count3], precipitacao: ydata3[count3]};
								}
								/*xdata4[count4] = xdata4[count4] + " a " + xdata[count-1];
								xdata4[count4] = await ConverterParaMes(xdata4[count4]);
								ydata4[count4] = ydata4[count4].toFixed(1);
								Vdata4[count4] = {data: xdata4[count4], precipitacao: ydata4[count4]};*/
							}
						}

						if(mesesCount < 13){
							count = 0; Vdata = [];
							while(count < xdata.length){
								ydata[count] = ydata[count].toFixed(1);
								Vdata[count] = {data: xdata[count], precipitacao: ydata[count]};
								count++;
							}
	
						}

						count=xdata.length +1;
						count=count*25.32;
						setSizeTable2(count);
						setLabelx({
							l1: 'DIA', l2: 'SEMANA',
							l3: 'QUINZENA', l4: 'MÊS'
						});
						setGrafico({
							g2: 'block', g3: 'block', g4: 'none'
						});
						setData({
							x: xdata, y: ydata,
							x2: xdata2, y2: ydata2,
							x3: xdata3, y3: ydata3,
							x4: [], y4: []
						});
						setRows({
							VRow: Vdata,
							VRow2: Vdata2,
							VRow3: Vdata3,
							VRow4: []
						})
						setPeriodoGrafico(xdata[0] + " a " + xdata[xdata.length-1]);
						setEhMes(true);
					}
					else if(mesesCount > 12){ //period bigger than a year
						count2 = xdata.length -1;
						while(count < xdata.length/2){
							X = JSON.stringify(xdata[count]);
							temp = JSON.stringify(xdata[count2]);
							
							if(temp.length===9)
								xdata[count] = temp.slice(6,8) + temp[5] + temp.slice(1,5);
							else
								xdata[count] = temp.slice(1,24);
							if(X.length===9)
								xdata[count2] = X.slice(6,8) + temp[5] + X.slice(1,5);
							else
								xdata[count2] = X.slice(1,24);
							temp = ydata[count2];
							ydata[count2] = ydata[count];
							ydata[count] = temp;
							if(count!==count2)
								precipitacaoTotal+=ydata[count]+ydata[count2];
							else
								precipitacaoTotal+=ydata[count];
							Vdata[count] = {data: xdata[count], precipitacao: ydata[count]};
							Vdata[count2] = {data: xdata[count2], precipitacao: ydata[count2]};
							count++;
							count2--;
						}

						setTotalGrafico(precipitacaoTotal.toFixed(1));

						count2=0;count=0;ydata3[0]=0;
						xdata2[0]=xdata[0]; xdata3[0]=xdata[0];
						tamanho=xdata.length;
						final[0]=0;final[1]=0;
						while(count < tamanho){
							ydata2[count2] = ydata2[count2] + ydata[count];
							ydata3[count3] = ydata3[count3] + ydata[count];
							if((count+1)%3===0){
								//if(xdata2[count2].length < 10){
									xdata2[count2] = xdata2[count2] + " a " + xdata[count];
								//}
								ydata2[count2] = ydata2[count2].toFixed(1);
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
								ydata3[count3] = ydata3[count3].toFixed(1);
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
							if(xdata2[count2].length < 10){
								xdata2[count2] = xdata2[count2] + " a " + xdata[count-1];
							}
							ydata2[count2] = ydata2[count2].toFixed(1);
							Vdata2[count2] = {data: xdata2[count2], precipitacao: ydata2[count2]};
						}
						if(!final[1]){
							if(xdata3[count3] !== xdata[count-1])
								xdata3[count3] = xdata3[count3] + " a " + xdata[count-1];
							ydata3[count3] = ydata3[count3].toFixed(1);
							Vdata3[count3] = {data: xdata3[count3], precipitacao: ydata3[count3]};
						}

						count = 0; Vdata = [];
						while(count < xdata.length){
							ydata[count] = ydata[count].toFixed(1);
							Vdata[count] = {data: xdata[count], precipitacao: ydata[count]};
							count++;
						}

						count=xdata.length ;
						count=count*25;
						setSizeTable2(count);

						setLabelx({
							l1: 'MÊS', l2: 'TRIMESTRE',
							l3: 'ANO', l4: []
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
						setEhMaiorQAno(true);
						count = xdata[0];
						count2=xdata[xdata.length-1];
						if(xdata[0].length > 10)
							count = xdata[0].slice(0,10);
						if(xdata[xdata.length-1].length > 10)
							count2 = xdata[xdata.length-1].slice(13,23);
						
						setPeriodoGrafico(count + " a " + count2);
					}
					else{
						while(count < xdata.length){
							ydata[count] = ydata[count].toFixed(1);
							Vdata[count] = {data: xdata[count], precipitacao: ydata[count]};
							count++;
						}
						
						setPeriodoGrafico(xdata[0] + " a " + xdata[xdata.length-1]);
						setLabelx({
							l1: 'DIA', l2: '',
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
						});
						setRows({
							VRow: Vdata,
							VRow2: [],
							VRow3: [],
							VRow4: []
						});
						setEhMenorQAno(true);
					}
				}

				/*if(igualBotao){
					setDisplayX(true);
				}else{
					setDisplayX(false);
				}*/
			}
		}

		async function ConverterParaMes(periodoDoMes){
			var tempMesPeriodo = parseInt(periodoDoMes.slice(3,5));
			var meses=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
			if(tempMesPeriodo===1 || tempMesPeriodo===3 || tempMesPeriodo===5 || tempMesPeriodo===7 || tempMesPeriodo===8 || tempMesPeriodo===10 || tempMesPeriodo===12){
				if(periodoDoMes.slice(0,2)==='01' && periodoDoMes.slice(13,15)==='31')
					return meses[tempMesPeriodo-1] + periodoDoMes.slice(5,11);
				else
					return periodoDoMes.slice(0,5) + periodoDoMes.slice(10,18);	
			} 
			else if(tempMesPeriodo===4 || tempMesPeriodo===6 || tempMesPeriodo===9 || tempMesPeriodo===11){
				if(periodoDoMes.slice(0,2)==='01' && periodoDoMes.slice(13,15)==='30')
					return meses[tempMesPeriodo-1] + periodoDoMes.slice(5,11);
				else
					return periodoDoMes.slice(0,5) + periodoDoMes.slice(10,18);
			}
			else{
				var tempAnoPeriodo = parseInt(periodoDoMes.slice(6,10));
				if((tempAnoPeriodo%4===0 && tempAnoPeriodo%100!==0) || tempAnoPeriodo%400===0){
					if(periodoDoMes.slice(0,2)==='01' && periodoDoMes.slice(13,15)==='29')
						return 'FEV' + periodoDoMes.slice(5,11);
					else
						return periodoDoMes.slice(0,5) + periodoDoMes.slice(10,18);
				}
				else{
					if(periodoDoMes.slice(0,2)==='01' && periodoDoMes.slice(13,15)==='28')
						return 'FEV' + periodoDoMes.slice(5,11);
					else
						return periodoDoMes.slice(0,5) + periodoDoMes.slice(10,18);
				}
			}
		}

		async function ConverterParaTrimestre(periodoDoMes){
			var tempMesPeriodo1 = parseInt(periodoDoMes.slice(3,5)), tempMesPeriodo2 = parseInt(periodoDoMes.slice(16,18));
			var meses=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'],somou=false;
			if(tempMesPeriodo1 > tempMesPeriodo2){
				somou=true;
				tempMesPeriodo2+=12; 
			}
			
			if(tempMesPeriodo2===1 || tempMesPeriodo2===3 || tempMesPeriodo2===5 || tempMesPeriodo2===7 || tempMesPeriodo2===8 || tempMesPeriodo2===10 || tempMesPeriodo2===12){
				if(tempMesPeriodo2-tempMesPeriodo1===2 && (periodoDoMes.slice(0,2)==='01' && periodoDoMes.slice(13,15)==='31')){
					if(somou)
						tempMesPeriodo2-=12;
					tempMesPeriodo1 = meses[tempMesPeriodo1-1]; tempMesPeriodo2 = meses[tempMesPeriodo2-1];
					return tempMesPeriodo1 + periodoDoMes.slice(5,11) + ' a ' + tempMesPeriodo2 + periodoDoMes.slice(18,23);
				}
				else
					return periodoDoMes.slice(0,11) + periodoDoMes.slice(10,23);	
			} 
			else if(tempMesPeriodo2===4 || tempMesPeriodo2===6 || tempMesPeriodo2===9 || tempMesPeriodo2===11){ 
				if(tempMesPeriodo2-tempMesPeriodo1===2 && (periodoDoMes.slice(0,2)==='01' && periodoDoMes.slice(13,15)==='30')){
					if(somou)
						tempMesPeriodo2-=12;
					tempMesPeriodo1 = meses[tempMesPeriodo1-1]; tempMesPeriodo2 = meses[tempMesPeriodo2-1];
					return tempMesPeriodo1 + periodoDoMes.slice(5,11) + ' a ' + tempMesPeriodo2 + periodoDoMes.slice(18,23);
				}
				else
					return periodoDoMes.slice(0,11) + periodoDoMes.slice(10,23);	
			} 
			else{
				var tempAnoPeriodo = parseInt(periodoDoMes.slice(19,23));
				if((tempAnoPeriodo%4===0 && tempAnoPeriodo%100!==0) || tempAnoPeriodo%400===0){
					if(tempMesPeriodo2-tempMesPeriodo1===2 && (periodoDoMes.slice(0,2)==='01' && periodoDoMes.slice(13,15)==='29')){
						if(somou)
							tempMesPeriodo2-=12;
						tempMesPeriodo1 = meses[tempMesPeriodo1-1]; tempMesPeriodo2 = meses[tempMesPeriodo2-1];
						return tempMesPeriodo1 + periodoDoMes.slice(5,11) + ' a ' + tempMesPeriodo2 + periodoDoMes.slice(18,23);
					}
					else
						return periodoDoMes.slice(0,11) + periodoDoMes.slice(10,23);
				}
				else{
					if(tempMesPeriodo2-tempMesPeriodo1===2 && (periodoDoMes.slice(0,2)==='01' && periodoDoMes.slice(13,15)==='28')){
						if(somou)
							tempMesPeriodo2-=12;
						tempMesPeriodo1 = meses[tempMesPeriodo1-1]; tempMesPeriodo2 = meses[tempMesPeriodo2-1];
						return tempMesPeriodo1 + periodoDoMes.slice(5,11) + ' a ' + tempMesPeriodo2 + periodoDoMes.slice(18,23);
					}
					else
						return periodoDoMes.slice(0,11) + periodoDoMes.slice(10,23);
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
						//backgroundColor: ['rgba(75, 192, 192, 0.6)',], seta a cor um por um
						backgroundColor: 'rgba(75, 192, 192, 0.6)', //colore todos 
						borderColor: 'rgb(255, 51, 51)',
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
						backgroundColor: 'rgba(75, 192, 192, 0.6)',
						borderColor: 'rgb(255, 51, 51)',
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
						backgroundColor: 'rgba(75, 192, 192, 0.6)',
						borderColor: 'rgb(255, 51, 51)',
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
						backgroundColor: 'rgba(75, 192, 192, 0.6)',
						borderColor: 'rgb(255, 51, 51)',
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
				<td>{index+1}</td>
				{Data.data.length > 13 && Data.data.length < 18 ? 
					<td>{Data.data.slice(0,10)} <br></br> {Data.data.slice(10,17)}</td> 
					:
					Data.data.length > 18 &&  Data.data.length < 24 ?
						<td>{Data.data.slice(0,12)} <br></br> {Data.data.slice(12,23)}</td>
						:
						<td>{Data.data}</td>}
				<td>{Data.precipitacao}</td>
			</tr>
		)
	}

	function preparaPeriodo(){
		//console.log(typeof(BEperiodo.inicio + BEperiodo.fim));
		if(BEperiodo.inicio.length === 10 && BEperiodo.fim.length === 10){
			var tempPeriodo = [], error=0;
			var count = 0, count2 = 0;
			//Remove slashe and join the beginning period and the ending period in a array called tempPeriodo
			while(count < 10){
				if(isNaN(parseInt(BEperiodo.inicio[count]))===true && isNaN(parseInt(BEperiodo.fim[count]))===true){
					count++;
				}
				tempPeriodo[count2] = parseInt(BEperiodo.inicio[count]);
				tempPeriodo[count2 + 8] = parseInt(BEperiodo.fim[count]);
				count++;
				count2++;
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
			alert("Por Favor insira um periodo nesse formato inicio(DD/MM/YYYY) e fim(DD/MM/YYYY)");
		}
	}
	/*<Input type="text" value={BEperiodo.inicio} id="Periodo_inicial" onChange={e => setBEperiodo({ ...BEperiodo, inicio: e.target.value })} placeholder="ddmmyyyy" />*/
	return (
		//style={{height: "500px", width: "500px"}}
		<div className="App">
			
			<div style={{width: "100%"}}>
			<h1>Estação {localStorage.getItem('modulo_id')}</h1>
			<h2>Precipitação</h2>
				
				<div style={{float: "left", 'marginLeft': "5%"}}>
					<button onClick={() => setPeriodo('hoje')}>hoje</button>
					<button onClick={() => setPeriodo('dia')}>1 dia</button>
					<button onClick={() => setPeriodo('semana')}>7 dias</button>
					<button onClick={() => setPeriodo('quinzena')}>15 dias</button>
					<button onClick={() => setPeriodo('mes')}>1 mês</button>
					<button onClick={() => setPeriodo('ano')}>1 ano</button>
				</div>

				<div style={{float: "right", 'marginRight': "5%"}}>
					<Form>
						<FormGroup>
							<Label for="Periodo_inicial">Inicio</Label>
							<NumberFormat type="text" value={BEperiodo.inicio} id="Periodo_inicial" onChange={e => setBEperiodo({ ...BEperiodo, inicio: e.target.value })}	
								format="##/##/####" placeholder="DD/MM/YYYY" mask={['D','D','M', 'M', 'Y', 'Y','Y','Y']}/>
							<Label for="Periodo_final">Fim</Label>
							<NumberFormat type="text" value={BEperiodo.fim} id="Periodo_final" onChange={e => setBEperiodo({ ...BEperiodo, fim: e.target.value })}	
								format="##/##/####" placeholder="DD/MM/YYYY" mask={['D','D','M', 'M', 'Y', 'Y','Y','Y']}/>
							<Button color="primary" block onClick={preparaPeriodo}> Pesquisar </Button>
						</FormGroup>
					</Form>
				</div>
				
				{registros ?
					<div style={{width: "20%", backgroundColor: "rgba(75, 192, 192, 0.6)", margin: "auto",
					marginBottom:-30, marginTop:50}}>
						<p style={{textAlign:"center"}}>Total: {totalGrafico + " mm"}</p>
					</div>
					:
					<p></p>
				}

				<div style={{width: "50%", margin: grafico.g2 === "none" ? "50px auto" : "", 
						float: grafico.g2 === "none" ? "" : "left"}}>
					<p style={{float:"right"}}>{registros ? periodoGrafico : ""}</p>
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
											callback(value, index) {
												if (ehAno)
													return index+1+'ª';
												else if(ehMaiorQAno)
													return index+1+'º';
												else if(ehMenorQAno){
													return value.slice(0,5);
												}
												else if(ehMes){
													return value.slice(0,5) + value.slice(10,18);
												}
												else		
													return value;
											},
											fontSize: 12,
											display: true
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
										<th style={{width: 20}}>Nº</th>
										<th style={{width: 125 }}>{labelx.l1}</th>
										<th style={{width: 125 }}>PRECIPITAÇÃO</th>
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
					<p style={{float:"right" }}>{registros && grafico.g2!=="none" ? periodoGrafico : ""}</p>
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
											callback(value, index) {
												if (ehMaiorQAno)
													return index+1+'º';
												else if(ehMes){
													return value.slice(0,5) + value.slice(10,18);
												}
												else if(ehAno){
													return value.slice(0,3);
												}
												else		
													return value;
											},
											display: true
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
						<div className="container" style={{display: grafico.g2, height: sizeTable2+"px"}}>
							<ReactBootStrap.Table striped bordered hover>
								<thead>
									<tr>
										<th style={{width: 20}}>Nº</th>
										<th style={{width: 125 }}>{labelx.l2}</th>
										<th style={{width: 125 }}>PRECIPITAÇÃO</th>
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

				<div style={{width: "50%",marginTop: "40px", margin: grafico.g4 === "none" ? "0 auto" : "", 
						float: grafico.g4 === "none" ? "" : "left"}}>
					<p style={{float:"right" }}>{registros && grafico.g3!=="none" ? periodoGrafico : ""}</p>
					{registros && grafico.g3!=="none" &&  ehMaiorQAno===false ?
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
											callback(value, index) {
												if (ehMes)
													return index+1+'ª';
												else if(ehAno){
													return value.slice(0,3) + value.slice(8,15);
												}
												else		
													return value;
											},
											display: true
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
						registros && grafico.g3!=="none" &&  ehMaiorQAno===true ?
							<Bar data={chartData3} options={{
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
												display: true
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
										<th style={{width: 20}}>Nº</th>
										<th style={{width: 125 }}>{labelx.l3}</th>
										<th style={{width: 125 }}>PRECIPITAÇÃO</th>
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

				<div style={{float: "left", width: "50%",marginTop: "0px"}}>
					<p style={{float:"right" }}>{registros && grafico.g4!=="none" ? periodoGrafico : ""}</p>
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
											display: true
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
										<th style={{width: 20}}>Nº</th>
										<th style={{width: 125 }}>{labelx.l4}</th>
										<th style={{width: 125 }}>PRECIPITAÇÃO</th>
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
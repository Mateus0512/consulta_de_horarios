var messejana = [4,26,51,52,53,55,56,68,82,84,315,600,613,614,616,617,618,619,620,621,622,626,628,629,630,631,632,634,635,636,637,639,640,641,642,643,644,645,646,647,648,650,652,653,655,656,657,662,663,665,667,668,681,685,686,697,699,815,1815]
var siqueira = [27,30,49,50,51,52,55,56,63,65,73,78,84,87,97,99,300,325,326,329,330,332,334,335,336,337,338,342,345,346,355,360,361,362,366,370,376,378,380,381,382,383,384,386,388,392,393,397,398,400];
var papicu = [4,16,21,23,27,28,30,31,32,34,35,36,38,41,42,44,45,48,50,51,52,53,54,55,56,66,68,69,76,86,87,89,92,96,98,222,627,680,804,806,810,813,814,815,820,823,825,831,832,835,840,841,860,901,903,913,920,1815];
var lagoa = [24,25,34,35,36,40,43,47,67,69,83,85,304,308,322,323,332,350,356,358,364,394,411,421];
var antorio_bezerra = [15,24,26,28,34,39,42,51,52,55,56,57,58,59,71,72,74,79,81,82,86,88,91,92,97,98,120,122,130,172,200,205,206,210,211,212,213,214,215,216,217,220,222,225,244,389,855,1074];
var conjunto_ceara = [15,36,43,45,76,81,83,96,322,327,345,357,367,368,385];
var parangaba = [29,38,40,41,44,48,60,63,66,70,72,77,80,89,91,172,244,301,306,309,311,312,313,315,317,319,321,339,340,344,347,349,353,359,361,362,369,371,372,373,375,377,379,390,391,395,396,399,401,403,456,466,513];
var terminal_selecionado = [];
var nome_terminal_selecionado = '';
var todas_linhas = '';
var linhas_selecionadas = [];
var data = '';
var hora = '';
var json_temporario = '';
var json_linhas_selecionadas = [];
var terminal = document.getElementById('terminal');
var check_list = document.getElementById('check_list');
var select_div = document.getElementById('select_div');
var table_div = document.getElementById('table_div');

async function consultar_linhas(){
    try {
        request = await fetch('http://gistapis.etufor.ce.gov.br:8081/api/linhas/');
        if(request.ok){
            todas_linhas =  await request.json();
            console.log(todas_linhas);
            terminal.disabled = false;
        }else{
            throw new Error("Requisição Falhou: "+ request.status);
        }
        
        
        
    } catch (error) {
        console.log(error);
        
    }
    
    
}
consultar_linhas();

terminal.addEventListener('change',function(){
    terminal_selecionado = [];
    let options = terminal.getElementsByTagName('option');
    for(let option of options){
        if(option.selected==true){
            nome_terminal_selecionado = option.textContent;
        }
    }
    console.log(nome_terminal_selecionado);
    selecionar_terminal(todas_linhas,terminal.value);
    escrever_checklist();
});

    function selecionar_terminal(todas_linhas,opcao){
        for(linha of window[opcao]){
            for(row of todas_linhas){
                if(row.numero==linha){
                    terminal_selecionado.push({'numero':row.numero,'numeroNome':row.numeroNome});
                }
            }
        }
        console.log(terminal_selecionado);
    }

function escrever_checklist(){
    select_div.remove();
    let session_checklist = document.createElement('session');
    for(let linha_terminal of terminal_selecionado){
        session_checklist.innerHTML += `
        <div class="form-check">
        <input type="checkbox" class="form-check-input" id="`+linha_terminal.numero+`" value="`+linha_terminal.numero+`">
        <label for="`+linha_terminal.numero+`" class="form-check-label">`+linha_terminal.numeroNome+`</label>
        </div>
        `; 
    }
    session_checklist.innerHTML += "<input type='button' id='consultar' class='btn btn-success' value='Consultar'>"
    check_list.appendChild(session_checklist);
    adicionar_event_botao();

}

function adicionar_event_botao(){
    let consultar = document.getElementById('consultar');

    consultar.addEventListener('click',function(){
        let check_items = document.getElementsByClassName('form-check-input');
        for(let check_item of check_items){
            if(check_item.checked == true){
                linhas_selecionadas.push(check_item.value);
            }
        }
        console.log(linhas_selecionadas);
        consultar_linhas_selecionadas();
    });
}


async function consultar_linhas_selecionadas(){
    
    for(let linha of linhas_selecionadas){
        dia_atual();
        request = await fetch('http://gistapis.etufor.ce.gov.br:8081/api/programacao/'+linha+'?data='+data+'');
        json_temporario = await request.json();
        
        organizar_json(json_temporario);
    }


    escrever_tabela(json_linhas_selecionadas);
}

dia_atual = () =>{
    let date = new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"});
    hora = date.split(',');
    hora = hora[1].trim();
    
    data_atual = date.split('/');
    ano = data_atual[2].split(',');
    data = ano[0]+data_atual[1]+data_atual[0];

}

function organizar_json(json_temporario){

    

        for(let tabela=0;tabela<json_temporario.quadro.tabelas.length;tabela++){
            for(let trecho=0;trecho<json_temporario.quadro.tabelas[tabela].trechos.length;trecho++){

                if(json_temporario.quadro.tabelas[tabela].trechos[trecho].inicio.postoControle==nome_terminal_selecionado){
                    json_linhas_selecionadas.push({'linha':json_temporario.codigoLinha,'empresa':json_temporario.quadro.tabelas[tabela].trechos[trecho].empresa,'tabela':json_temporario.quadro.tabelas[tabela].numero+' '+json_temporario.quadro.tabelas[tabela].trechos[trecho].inicio.descricao.slice(0,1),'horario':json_temporario.quadro.tabelas[tabela].trechos[trecho].inicio.horario.slice(json_temporario.quadro.tabelas[tabela].trechos[trecho].inicio.horario.indexOf('T')+1,json_temporario.quadro.tabelas[tabela].trechos[trecho].inicio.horario.length),'final_linha':json_temporario.quadro.tabelas[tabela].trechos[trecho].fim.horario.slice(json_temporario.quadro.tabelas[tabela].trechos[trecho].fim.horario.indexOf('T')+1,json_temporario.quadro.tabelas[tabela].trechos[trecho].fim.horario.length)});
                }
                
            }//trecho
        }// tabela
      
        json_linhas_selecionadas = json_linhas_selecionadas.sort((a,b)=>{
            if(a.horario<b.horario){
                return -1;
            }
            if(a.horario>b.horario){
                return 1;
            }
        })
}


function escrever_tabela(json_linhas_selecionadas){
    check_list.remove();

    let tabela = document.createElement('table');
    tabela.classList.add('table');
    tabela.setAttribute('id','tabela');
    table_div.appendChild(tabela);
    let th = tabela.insertRow();

    let cabecalho_linha = th.insertCell();
    let cabecalho_empresa = th.insertCell();
    let cabecalho_tab = th.insertCell();
    let cabecalho_horario = th.insertCell();
    let cabecalho_f_linha = th.insertCell();

    cabecalho_linha.innerText = 'Linha';
    cabecalho_empresa.innerText = 'Emp';
    cabecalho_tab.innerText = 'Tab';
    cabecalho_horario.innerText = 'Horário';
    cabecalho_f_linha.innerText = 'F.Linha';

    th.classList.add('sticky-header');
    th.classList.add('table-dark');

    for(let json_linhas_selecionada of json_linhas_selecionadas){
        console.log(json_linhas_selecionada.horario);
        console.log(hora);
        if(json_linhas_selecionada.horario<hora){
            let tr = tabela.insertRow();

            tr.classList.add('table-secondary');

            let row_linha = tr.insertCell();
            let row_emp = tr.insertCell();
            let row_tab = tr.insertCell();
            let row_horario = tr.insertCell();
            let row_f_linha = tr.insertCell();

            row_linha.innerText = json_linhas_selecionada.linha;
            row_emp.innerText = json_linhas_selecionada.empresa;
            row_tab.innerText = json_linhas_selecionada.tabela;
            row_horario.innerText = json_linhas_selecionada.horario;
            row_f_linha.innerText = json_linhas_selecionada.final_linha;

            row_f_linha.setAttribute('data-bs-toggle','popover');
            row_f_linha.setAttribute('title','Minutos');
            row_f_linha.setAttribute('data-bs-content',calcular_minutos(json_linhas_selecionada.horario,json_linhas_selecionada.final_linha));
        }
        else{

            let tr = tabela.insertRow();

            tr.classList.add('table-primary');

            let row_linha = tr.insertCell();
            let row_emp = tr.insertCell();
            let row_tab = tr.insertCell();
            let row_horario = tr.insertCell();
            let row_f_linha = tr.insertCell();
    
            row_linha.innerText = json_linhas_selecionada.linha;
            row_emp.innerText = json_linhas_selecionada.empresa;
            row_tab.innerText = json_linhas_selecionada.tabela;
            row_horario.innerText = json_linhas_selecionada.horario;
            row_f_linha.innerText = json_linhas_selecionada.final_linha;

            row_f_linha.setAttribute('data-bs-toggle','popover');
            row_f_linha.setAttribute('title','Minutos');
            row_f_linha.setAttribute('data-bs-content',calcular_minutos(json_linhas_selecionada.horario,json_linhas_selecionada.final_linha));
        }

    }
    ativar_popovers();
    rolar_pagina();
}

function rolar_pagina(){
    let rolar_para_linha = document.getElementsByClassName('table-secondary');

    window.scrollTo(0,(rolar_para_linha[rolar_para_linha.length-1].offsetTop));
}

ativar_popovers = () =>{
    let popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    let popoverList = popoverTriggerList.map(function(popoverTriggerEl){
        return new bootstrap.Popover(popoverTriggerEl)
    })
}

calcular_minutos = (valor_primeiro_horario,valor_segundo_horario) =>{
    let valores_primeiro = valor_primeiro_horario.split(':');
    let valores_segundo = valor_segundo_horario.split(':');

    let minutos_primeiro = parseInt((valores_primeiro[0]*60))+parseInt(valores_primeiro[1]);
    let minutos_segundo = parseInt((valores_segundo[0]*60))+parseInt(valores_segundo[1]);

    resultado = minutos_segundo-minutos_primeiro;

    if(resultado<-800){
        if(valores_segundo[0]=='00'){
            minutos_segundo = (24*60)+parseInt(valores_segundo[1]);
            resultado = minutos_segundo-minutos_primeiro;
            return resultado;
        }
        else if(valores_segundo[0]=='01'){
            minutos_segundo = (25*60)+parseInt(valores_segundo[1]);
            resultado = minutos_segundo-minutos_primeiro;
            return resultado;
        }
    }

    return resultado;
}

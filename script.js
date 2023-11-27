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
var tema_escuro = ver_tema() ?? false;
var json_temporario = '';
var json_linhas_selecionadas = [];
var terminal = document.getElementById('terminal');
var check_list = document.getElementById('check_list');
var select_div = document.getElementById('select_div');
var table_div = document.getElementById('table_div');
var flexSwitchCheckDefault = document.getElementById('flexSwitchCheckDefault');
var menu = document.getElementById('menu');
var body = document.querySelector('body');
var voltar_linhas = document.getElementById('voltar_linhas');
var voltar_terminais = document.getElementById('voltar_terminais');
var loader = document.getElementById('loader');



async function consultar_linhas(){
    if(tema_escuro=='true'){
        funcao_tema_escuro();
        flexSwitchCheckDefault.checked = true;
    }else{
        funcao_tema_claro();
        flexSwitchCheckDefault.checked = false;
    }
    try {
        request = await fetch('http://gistapis.etufor.ce.gov.br:8081/api/linhas/');
        if(request.ok){
            todas_linhas =  await request.json();
            //console.log(todas_linhas);
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
    //console.log(nome_terminal_selecionado);
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
        //console.log(terminal_selecionado);
    }

function escrever_checklist(){
    voltar_terminais.classList.remove('disabled');
    select_div.style.display = 'none';
    check_list.style.display = 'block';
    let session_checklist = document.createElement('session');
    session_checklist.setAttribute('id','session-checklist');
    for(let linha_terminal of terminal_selecionado){
        session_checklist.innerHTML += `
        <div class="form-check">
        <input type="checkbox" class="form-check-input list-checkbox" id="`+linha_terminal.numero+`" value="`+linha_terminal.numero+`">
        <label for="`+linha_terminal.numero+`" class="form-check-label">`+linha_terminal.numeroNome+`</label>
        </div>
        `; 
    }
    if(ver_tema()=='true'){
        session_checklist.innerHTML += "<input type='button' id='consultar' class='btn btn-secondary' value='Consultar'>"
    }else{
        session_checklist.innerHTML += "<input type='button' id='consultar' class='btn btn-success' value='Consultar'>"
    }
    check_list.appendChild(session_checklist);
    adicionar_event_botao();

}

function adicionar_event_botao(){
    let consultar = document.getElementById('consultar');

    consultar.addEventListener('click',function(){
        check_list.style.display = 'none';
        ativar_loader();
        let check_items = document.getElementsByClassName('list-checkbox');
        for(let check_item of check_items){
            if(check_item.checked == true){
                
                    linhas_selecionadas.push(check_item.value);
                
            }
        }
        //console.log(linhas_selecionadas);
        consultar_linhas_selecionadas();
    });
}


async function consultar_linhas_selecionadas(){
    
    for(let linha of linhas_selecionadas){
        dia_atual();
        try {
            request = await fetch('http://gistapis.etufor.ce.gov.br:8081/api/programacao/'+linha+'?data='+data+'');
            json_temporario = await request.json();
            if(json_temporario.Message){
                throw new Error("Programação não encontrada: "+ json_temporario.Message)
            }
        } catch (error) {
            console.log(error);
        }
        
        //console.log(json_temporario);
        organizar_json(json_temporario);
    }


    escrever_tabela(json_linhas_selecionadas);
    desativar_loader();
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

    if(json_temporario.Message){

    }else{
        for(let tabela=0;tabela<json_temporario.quadro.tabelas.length;tabela++){
            for(let trecho=0;trecho<json_temporario.quadro.tabelas[tabela].trechos.length;trecho++){

                let array_terminal_selecionado = nome_terminal_selecionado.split('Terminal');
                let array_postoControle = json_temporario.quadro.tabelas[tabela].trechos[trecho].inicio.postoControle.split('Terminal');

                //console.log('array_terminal_selecionado :'+array_terminal_selecionado);
                //console.log('array_postoControle :'+array_postoControle);

                //array_terminal_selecionado = nome_terminal_selecionado.split(' ');
                //array_postoControle = json_temporario.quadro.tabelas[tabela].trechos[trecho].inicio.postoControle.split(' ');
                

                if(json_temporario.quadro.tabelas[tabela].trechos[trecho].inicio.postoControle==nome_terminal_selecionado){
                    json_linhas_selecionadas.push({'linha':json_temporario.codigoLinha,'empresa':json_temporario.quadro.tabelas[tabela].trechos[trecho].empresa,'tabela':json_temporario.quadro.tabelas[tabela].numero+' '+json_temporario.quadro.tabelas[tabela].trechos[trecho].inicio.descricao.slice(0,1),'horario':json_temporario.quadro.tabelas[tabela].trechos[trecho].inicio.horario.slice(json_temporario.quadro.tabelas[tabela].trechos[trecho].inicio.horario.indexOf('T')+1,json_temporario.quadro.tabelas[tabela].trechos[trecho].inicio.horario.length),'final_linha':json_temporario.quadro.tabelas[tabela].trechos[trecho].fim.horario.slice(json_temporario.quadro.tabelas[tabela].trechos[trecho].fim.horario.indexOf('T')+1,json_temporario.quadro.tabelas[tabela].trechos[trecho].fim.horario.length)});
                }
                else if(comparar_posto(array_terminal_selecionado,array_postoControle)==true){
                    json_linhas_selecionadas.push({'linha':json_temporario.codigoLinha,'empresa':json_temporario.quadro.tabelas[tabela].trechos[trecho].empresa,'tabela':json_temporario.quadro.tabelas[tabela].numero+' '+json_temporario.quadro.tabelas[tabela].trechos[trecho].inicio.descricao.slice(0,1),'horario':json_temporario.quadro.tabelas[tabela].trechos[trecho].inicio.horario.slice(json_temporario.quadro.tabelas[tabela].trechos[trecho].inicio.horario.indexOf('T')+1,json_temporario.quadro.tabelas[tabela].trechos[trecho].inicio.horario.length),'final_linha':json_temporario.quadro.tabelas[tabela].trechos[trecho].fim.horario.slice(json_temporario.quadro.tabelas[tabela].trechos[trecho].fim.horario.indexOf('T')+1,json_temporario.quadro.tabelas[tabela].trechos[trecho].fim.horario.length)});
                }
                   
                
            }//trecho
        }// tabela
    }

    

        
      
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
    voltar_linhas.classList.remove('disabled');
    table_div.style.display = 'block';
    

    let tabela = document.createElement('table');
    tabela.classList.add('table');
    //tabela.classList.add('table-borderless');
    tabela.classList.add('table-dark');
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
    //th.classList.add('table-dark');

    for(let json_linhas_selecionada of json_linhas_selecionadas){
        //console.log(json_linhas_selecionada.horario);
        //console.log(hora);
        if(json_linhas_selecionada.horario<hora){
            let tr = tabela.insertRow();

            //tr.classList.add('table-secondary');
            tr.classList.add('marcado');
            tr.classList.add('horarios');
            
            if(ver_tema()=='false'){tr.classList.add('table-secondary');}

            let row_linha = tr.insertCell();
            let row_emp = tr.insertCell();
            let row_tab = tr.insertCell();
            let row_horario = tr.insertCell();
            let row_f_linha = tr.insertCell();

            row_linha.innerText = json_linhas_selecionada.linha;
            row_emp.innerText = json_linhas_selecionada.empresa;
            row_tab.innerText = json_linhas_selecionada.tabela;
            row_horario.innerText = json_linhas_selecionada.horario;
            row_f_linha.innerHTML = json_linhas_selecionada.final_linha+`<svg xmlns="http://www.w3.org/2000/svg" style="color:green;" width="20" height="20" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16">
            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
          </svg>`;

            row_f_linha.setAttribute('data-bs-toggle','popover');
            row_f_linha.setAttribute('title','Minutos');
            row_f_linha.setAttribute('data-bs-content',calcular_minutos(json_linhas_selecionada.horario,json_linhas_selecionada.final_linha));
            row_f_linha.setAttribute('style','display:flex;justify-content:space-between;');
        }
        else{

            let tr = tabela.insertRow();
            tr.classList.add('horarios');

            //tr.classList.add('table-success');
            if(ver_tema()=='false'){tr.classList.add('table-secondary');}

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
    table_div.style.display = 'block';
    ativar_popovers();
    rolar_pagina();
}

function rolar_pagina(){
    //let rolar_para_linha = document.getElementsByClassName('table-secondary');
    let rolar_para_linha = document.getElementsByClassName('marcado');

    try{
        window.scrollTo(0,(rolar_para_linha[rolar_para_linha.length-1].offsetTop));
    }
    catch(error){
        console.log(error);
    }
    
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

function ver_tema(){
    if(localStorage.getItem('dark_theme')==undefined){
        localStorage.setItem('dark_theme',false);
    }else{
        let tema = localStorage.getItem('dark_theme');
        return tema;
    }
    

    
}

flexSwitchCheckDefault.addEventListener('change',function(){
    trocar_tema();
})

function trocar_tema(){

    
    if(flexSwitchCheckDefault.checked){
        localStorage.setItem('dark_theme',true);
        funcao_tema_escuro();
    }
    else{
        localStorage.setItem('dark_theme',false);
        funcao_tema_claro();
    }
}

function funcao_tema_escuro(){
    menu.classList.remove('navbar-light');
    menu.classList.remove('bg-light');

    menu.classList.add('navbar-dark');
    menu.classList.add('bg-dark');

    body.style.backgroundColor = 'black';

    check_list.classList.add('check_list_escuro');

    if(document.getElementById('consultar')!=undefined){
    document.getElementById('consultar').classList.remove('btn-success');
    document.getElementById('consultar').classList.add('btn-secondary');
    }

    for(horario of table_div.getElementsByClassName('horarios')){
        horario.classList.remove('table-secondary');
    }

}

function funcao_tema_claro(){
    menu.classList.remove('navbar-dark');
    menu.classList.remove('bg-dark');

    menu.classList.add('navbar-light');
    menu.classList.add('bg-light');

    body.style.backgroundColor = 'white';

    check_list.classList.remove('check_list_escuro');

    if(document.getElementById('consultar')!=undefined){
    document.getElementById('consultar').classList.remove('btn-secondary');
    document.getElementById('consultar').classList.add('btn-success');
    }

    for(horario of table_div.getElementsByClassName('horarios')){
        horario.classList.add('table-secondary');
    }
}

function voltar_para_linhas(){
    voltar_linhas.classList.add('disabled');
    table_div.style.display = 'none';
    check_list.style.display = 'block';
    document.getElementById('tabela').remove();
    json_temporario = [];
    json_linhas_selecionadas = [];
    linhas_selecionadas = [];
}

voltar_linhas.addEventListener('click',voltar_para_linhas);

function voltar_para_terminais(){
    voltar_terminais.classList.add('disabled');
    voltar_linhas.classList.add('disabled');
    json_temporario = [];
    json_linhas_selecionadas = [];
    linhas_selecionadas = [];
    if(window.getComputedStyle(check_list).display == 'block'){
        check_list.style.display = 'none';
        select_div.style.display = 'block';

        document.getElementById('session-checklist').remove();
    }else if(window.getComputedStyle(table_div).display == 'block'){
        
        voltar_terminais.classList.add('disabled');
        check_list.style.display = 'none';
        table_div.style.display = 'none';
        document.getElementById('session-checklist').remove();
        document.getElementById('tabela').remove();
        select_div.style.display = 'block';
    }


}

voltar_terminais.addEventListener('click',voltar_para_terminais);

function ativar_loader(){
    loader.style.display = 'flex';
    loader.innerHTML = '<div class="lds-ring"><div id="loading"></div><div></div><div></div><div></div></div>';
    if(ver_tema()=='false'){
        document.getElementById('loading').setAttribute('style',`    box-sizing: border-box;
        display: block;
        position: absolute;
        width: 64px;
        height: 64px;
        margin: 8px;
        border: 8px solid #000;
        border-radius: 50%;
        animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        border-color: #000 transparent transparent transparent;`);
    }else{
        document.getElementById('loading').setAttribute('style',`    box-sizing: border-box;
        display: block;
        position: absolute;
        width: 64px;
        height: 64px;
        margin: 8px;
        border: 8px solid #fff;
        border-radius: 50%;
        animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        border-color: #fff transparent transparent transparent;`);
    }
    
}

function desativar_loader(){
    loader.innerHTML = '';
    loader.style.display = 'none';
    
}

function comparar_posto(array_terminal_selecionado,array_postoControle){
    let lista_postos = ['Antônio','Bezerra','Conjunto','Ceará','Lagoa','Messejana','Papicu','Parangaba','Siqueira'];

    let separacao1 = array_postoControle[1].split(' ');
    let separacao2 = array_terminal_selecionado[1].split(' ');


        for(let sep1 of separacao1){
            for(let sep2 of separacao2){
                if(sep1.length>0&&sep2.length>0){
                    if(sep1==sep2){
                        for(let posto of lista_postos){
                            if(sep1==posto){
                                return true;
                            }
                        }
                        
                    }
                }
            }
        }



   
    }


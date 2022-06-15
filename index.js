const inquirer = require ("inquirer");

const fs = require('fs')

console.log("Iniciamos o nosso app")

operacao()

// operacao para mostrar todas as opções do menu da conta
function operacao(){
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: "O que você deseja?!",
            choices: ['Criar uma conta', 'Consultar Saldo', 'Depositar', 'Sacar', 'Sair'],
        }
    ]).then((answer) =>{
        const action = answer['action']
        if (action === 'Criar uma conta'){
            criarConta()
        }else if(action === "Depositar"){
            depositar()
        }else if(action === "Consultar Saldo"){
            verificarSaldo()
        }else if(action === "Sacar"){
            SacarDinheiro()
        }else if(action === "Sair"){
            console.log("Obrigado por acessar")
            process.exit()
        }

    }).catch(err => console.log(err))
}

// função para criar nova conta, caso já exista uma
function criarConta(){
    console.log("Defina as informações da sua conta")
    definicaoConta()
}

function definicaoConta(){
    inquirer.prompt([
        {
            name: 'nomeconta',
            message: 'Digite um nome para sua conta: '
        }
    ]).then(answer =>{
        
        const nomeConta = answer['nomeconta']

        // verificar condiçao, se a conta existe e se não existir, criar
        if(!fs.existsSync('contas')){
            fs.mkdirSync('contas')
        }
        // verificar se a conta existe com mesmo nome, se existir, chama criarConta, senão, criar abaixo
        if(fs.existsSync(`contas/${nomeConta}.json`)){
            console.log("Já existe um conta com esse nome")
            return criarConta();        
        }
        // criar nova conta com saldo zero
        fs.writeFileSync(`contas/${nomeConta}.json`, '{"saldo":0}')

        // chama a função de operação
        operacao();

    }).catch(err => console.log(err))
}


function verificacaoConta(nomeConta){
    var flag = false

    if(fs.existsSync(`contas/${nomeConta}.json`)){
        console.log("Verificamos sua conta. Pode seguir")
        flag = true
    }else{
        console.log("Essa conta não existe")
        flag = false
    }
    return flag

}

function depositar(){

    inquirer.prompt([{
        name: 'nomeConta',
        message: 'Qual o nome da sua conta?!'


    }]).then((answer) => {

        const nomeConta = answer['nomeConta']

        if(verificacaoConta(nomeConta)){

            // informe o valor que quer depositar
            inquirer.prompt([{
                name: 'valor',
                message: 'Qual o valor que quer depositar?!'
            }]).then((answer) => {
                const valor = answer['valor']
                adicionarValor(nomeConta, valor);
                operacao();

            }).catch(err => console.log(err))


        }else{
            // se a conta não existe volta para o depositar
            depositar();
        }

    })


}

function getConta(nomeConta){
    const contaJSON = fs.readFileSync(`contas/${nomeConta}.json`,{
        encoding: 'utf8',
        flag: 'r',
    })

    return JSON.parse(contaJSON)
}

function adicionarValor(nomeConta, valor){

    const conta = getConta(nomeConta);

    if(!conta){
        console.log("Não foi possível acessar a conta")
        return depositar()
    }

    conta.saldo = parseFloat(valor) + parseFloat(conta.saldo)

    fs.writeFileSync(
        `contas/${nomeConta}.json`,
        JSON.stringify(conta),
        function(err){
            console.log(err)
        }
    )

}

function verificarSaldo(){

    inquirer.prompt([
        {
        name: 'nomeConta',
        message: 'Qual o nome da sua conta?',
        }       

    ]).then((answer) => {
        const conta = answer['nomeConta']
        if(verificacaoConta(conta)){
            const dadosConta = getConta(conta)
            console.log(dadosConta.saldo)
        }
        operacao()
    })
}

function SacarDinheiro(){
    inquirer.prompt([
        {
        name: 'nomeConta',
        message: 'Qual o nome da sua conta?!'
        }
    ]).then((answer) => {
        const nomeConta = answer['nomeConta']
        if(verificacaoConta(nomeConta)){

            inquirer.prompt([{
                name: 'valor',
                message: 'Qual o valor você quer sacar?!'
            }]).then((answer) => {
                const valor = answer['valor']
                retirada(nomeConta,valor)

            })
        }
    })
}

function retirada(nomeConta,valor){
    const conta = getConta(nomeConta);

    if(!conta){
        console.log('Tem problema na conta')
        return SacarDinheiro()
    }

    if(conta.saldo < valor){
        console.log('Saldo insuficiente')
        return SacarDinheiro()
    }

    conta.saldo = parseFloat(conta.saldo)  - parseFloat(valor)

    fs.writeFileSync(`contas/${nomeConta}.json`,
    JSON.stringify(conta),
    function(err){
        console.log(err)
    },
    )
    console.log(`Foi realizado um saque de ${valor} da sua conta!`)
    operacao()
}
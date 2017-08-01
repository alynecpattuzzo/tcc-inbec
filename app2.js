const formulas = require( './formulas2' );
const custo = require( './custo' );

const teste = formulas( 25, 60, 3 );

const testeCusto = custo( 25, 60, 3, teste.Asl, teste.Asw );

const L = 3;
const bInicial = L * 100 / 50; // NBR 6118
const hInicial = 25; // NBR 6118
const dimMax = L * 100 / 3;
const passo = 0.5;
let b, h;

b = bInicial;
h = hInicial;

let custoOtimo;
let formulasOtimo;
let bOtimo;
let hOtimo;

while ( b < dimMax ) {
    while ( h < dimMax ) {
        if ( b < 0.4 * h ) { // NBR 6118
            h = h + passo;
            continue;
        }

        try {
            const f = formulas( b, h, L );
            const custoTotal = custo( b, h, L, f.Asl, f.Asw );
            const custoMinimo = custoOtimo ? custoOtimo.Vt : undefined

            if ( !custoMinimo || custoTotal.Vt < custoMinimo ) {
                bOtimo = b;
                hOtimo = h;
                custoOtimo = custoTotal;
                formulasOtimo = f;

                console.log( `Achei um novo custo mínimo: b = ${ b }, h = ${ h } e Custo = ${ custoTotal.Vt }` );
            } else {
                console.log( `Não foi mais barato com: b = ${ b }, h = ${ h } e Custo = ${ custoTotal.Vt }` );
            }

        } catch ( err ) {
            console.log( `Não deu com b = ${ b } e h = ${ h }` )
            console.error( err );
        } finally {
            h = h + passo;
        }
    }

    b = b + passo;
    h = hInicial;
}

console.log( `Custo mínimo: b = ${ bOtimo }, h = ${ hOtimo }, L = ${ L }` ); // Custo Aço = ${ custoOtimo.Vs }, Custo Concreto = ${ custoOtimo.Vc }, Custo Forma = ${ custoOtimo.Vf } e Custo = ${ custoOtimo.Vt } ` );
console.log( custoOtimo );  
console.log( formulasOtimo );

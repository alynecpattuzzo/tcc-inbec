const _ = require( 'lodash' );

/**
 * Calcula tudo
 * 
 * @param {any} b Base da Viga em cm
 * @param {any} h Altura da viga em cm
 * @param {any} L Comprimento da viga em metros
 * @returns 
 */
module.exports = ( b, h, L ) => {
    const formulas = new Object();

    hm = h / 100; // m
    bm = b / 100; // m

    const fck = 2; // 2 kN / cm² = 20 Mpa
    const v = 0.552;
    const fctd = 0.1105; // kN / cm²
    // Módulo de elasticidade secante do concreto
    const Ecs = 2128.74; // kN / cm²
    const fctf = 0.221; // kN / cm²
    const n = 9.865;
    const Es = 21000; // kN / cm²
    
    const fyk = 50; // 50 kN / cm² = 500 Mpa
    // Carregamento permanente
    const g = 18.25; // kN/m
    // Carregamento variável
    const q = 9; // kN/m
    const Lcm = L * 100; // cm

    // Resistência de cálculo do concreto e do aço
    const fcd = fck / 1.4; // kN / cm²
    const fcdm = fcd * 10000; // kN / m²
    const fyd = fyk / 1.15; // kN / cm²
    const fydm = fyd * 10000; // kN / m²
    const fctm = 0.3 * Math.cbrt( 100 * fck * fck ) / 10

    // altura útil
    const d = 0.9 * h; // cm
    const dm = d / 100; // m

    // Carga do peso próprio
    const gpp = hm * bm * 25; // kN/m

    // Carregamento
    const p = 1.4 * ( gpp + g + q ); // kN / m
    const pcm = p / 100; // kN / cm

    // Armadura longitudinal
    //formulas.Asl = () => {
    // Momento de cálculo
    const Md = p * L * L / 2; // kNm
    const Mdcm = Md * 100;

    // Momento limite
    const Mdlim = 0.272 * bm * dm * dm * fcdm; // kNm

    // Para armadura simples:
    const verificacaoArmaduraSimples = Md <= Mdlim;
    if ( !verificacaoArmaduraSimples ) {
        throw `Falha ao verificar armadura longitudinal para armadura simples. Md = ${ Md } e Mdlim = ${ Mdlim }`;
    }

    // Altura da Linha neutra
    const x = 1.25 * d * ( 1 - Math.sqrt( 1 - ( Mdcm / ( 0.425 * b * d * d * fcd ) ) ) ); // cm

    // Verificaçao da ductilidade das estruturas
    const verificacaoDuctilidadeDasEstruturas = x <= 0.5 * d;
    if ( !verificacaoDuctilidadeDasEstruturas ) {
        throw `Falha ao verificar ductibilidade das estruturas. x = ${ x } e d = ${ d }`;
    }

    // Armadura longitudinal
    let Asl = 0.68 * b * x * fcd / fyd; // cm²

    // Armadura longitudinal mínima
    const Aslmin = 0.15 / 100 * b * h;

    // Armadura longitudinal final
    Asl = Math.max( Asl, Aslmin );
    //}

    const roB = 0.85 * fck * 0.85 / ( fyk * ( 1 + fyk / ( 0.003 * Es ) ) );
    
    const verificacaoArmaduraMaxima = Asl / ( b * d ) <= 0.5 * roB;
    if ( !verificacaoArmaduraMaxima ) {
        throw `Falha ao verificar a armadura máxima, calculando Asl. Asl = ${ Asl }, b = ${ b } e d = ${ d }`;
    }   
      
    // Armadura transversal
    //formulas.Asw = () => {
    const s = 100;

    // Esforço cortante de cálculo
    const Vd = p * L; // kN

    // Força cortante de cálculo máxima resistida por compressão das bielas
    const Vrd2 = 0.45 * b * d * v * fcd; // kN

    // Verificação das bielas comprimidas
    const verificacaoBielasComprimidas = Vd <= Vrd2;
    if ( !verificacaoBielasComprimidas ) {
        throw `Falha ao verificar as bielas comprimidas, calculando armadura transversal. Vd = ${ Vd } e Vrd2 = ${ Vrd2 }`;
    }

    // Força cortante resistida por outros mecanismos
    const Vc = 0.6 * b * d * fctd; // kN

    // Armadura transversal
    let Asw = ( Vd - Vc ) * s / ( 0.9 * d * fyd ) // cm² / m

    // Armadura transversal mínima
    const AswMin = 0.2 * b * s * fctm / fyk; // 0.088 / 100 * b * s; // cm² / m

    // Armadura transversal final
    Asw = Math.max( Asw, AswMin );
    //}

    // Verificações no estado limite de serviço
    // formulas.executarVerificacoes = ( Asl ) => {
    // Momento de inércia da sessáo bruta
    const Ic = b * h * h * h / 12; // cm^4

    // Carregamento quase permanente
    const Pqp = gpp + g + 0.3 * q; // kN / m
    const Pqpcm = Pqp / 100; // kN / cm

    // Flecha elástica        
    const felastica = Pqpcm * Lcm * Lcm * Lcm * Lcm / ( 8 * Ecs * Ic ) * 10; // mm

    // Flecha imediata

    // Momento fletor da ação quase permanente
    const Mqp = Pqp * L * L / 2; // kNm
    const Mqpcm = Mqp * 100; // kNcm

    // Momento fletor de fissuração
    const Mr = b * h * h / 6 * fctf; // kNcm

    let a1, a2, a3, x2, I2, Ie;
    if ( Mqpcm >= Mr ) { // Estádio II com fissuração
        // Momento de inércia da sessào no estádio II ( para armadura simples )
        a1 = b / 2;
        a2 = n * Asl;
        a3 = -n * Asl * d;
        x2 = ( -a2 + Math.sqrt( a2 * a2 - 4 * a1 * a3 ) ) / ( 2 * a1 )
        I2 = b * x2 * x2 * x2 / 3 + n * Asl * ( d - x2 ) * ( d - x2 )

        const divisaoIe = ( Mr / Mqpcm ) * ( Mr / Mqpcm ) * ( Mr / Mqpcm );

        Ie = divisaoIe * Ic + ( 1 - divisaoIe ) * I2;
    } else {
        Ie = Ic;
    }

    const fimediata = felastica * ( Ic / Ie ); // mm

    // Flecha diferida

    // Para t0/t = 1 / 70 meses
    const alfaF = 1.323;

    const fdiferida = alfaF * fimediata; // mm

    // Flecha total
    const fTotal = fimediata + fdiferida; // mm

    // Flecha limite
    const flimite = 2 * L * 1000 / 250; // mm

    const verificacao = fTotal <= flimite;
    if ( !verificacao ) {
        throw `Falha ao verificar a flecha total. fTotal = ${ fTotal } e fLimite = ${ flimite }`;
    }
    //}

    const resultados = {
        Md, Mdlim, x, Asl, Aslmin, Vd, Vrd2, Vc, Asw, AswMin, Ic, a1, a2, a3, x2, I2,
        Mr, Mqpcm, Ie, felastica, fimediata, fdiferida, fTotal, flimite, fctm
    }

    _.merge( formulas, resultados );

    return formulas;
};


/**
 * Calcula o custo da viga
 * 
 * @param {any} Asl Área da armadura longitudinal em cm²
 * @param {any} Asw Área da armadura transversal em cm²/m
 * @param {any} L Comprimento da viga em metros
 * @returns 
 */
module.exports = ( b, h, L, Asl, Asw ) => {
    // Área do aço
    const As = Asl + Asw / 100 * L; // cm²
    const Asm = As / 10000; // m²

    // Peso específico do aço
    const ROs = 7850; // kg/m³

    // Custo do aço (2017)
    const Cs = 7.8; // R$/kg

    // Valor do aço por m
    const Vs = Cs * ROs * Asm; // R$/m



    // Área do concreto
    const Ac = b * h; // cm²
    const Acm = Ac / 10000; // m²

    // Custo do Concreto (2017)
    const Cc = 314.66; // R$ / m³

    // Valor do concreto por m
    const Vc = Acm * Cc; // R$ / m



    // Perímetro da forma
    const p = 2 * h + b; // cm
    const pm = p / 100; // m

    // Custo da montagem e materiais da forma de madeira (2017)
    const Cf = 70.88; // R$ / m²

    // Valor da forma por m
    const Vf = pm * Cf; // R$ / m


    // Valor total
    const Vt = Vc + Vs + Vf;


    return {
        Vc,
        Vs,
        Vf,
        Vt
    };
};

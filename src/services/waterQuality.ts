export interface WaterQualityResult {
    code_commune: string;
    nom_commune: string;
    date_prelevement: string;
    conclusion_conformite_prelevement: string;
    conformite_limites_bacterio_prelevement: string;
    conformite_limites_p_c_prelevement: string;
    resultats_analyse: {
        code_parametre: string;
        libelle_parametre: string;
        resultat_numerique: number;
        libelle_unite: string;
    }[];
}

export const fetchWaterQuality = async (cityCode: string): Promise<WaterQualityResult | null> => {
    try {
        // Step 1: Fetch the latest result to get the sample code (code_prelevement)
        const latestResponse = await fetch(
            `https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/resultats_dis?code_commune=${cityCode}&size=1&sort=desc`
        );

        if (!latestResponse.ok) throw new Error("Failed to fetch latest data");

        const latestData = await latestResponse.json();
        if (!latestData.data || latestData.data.length === 0) return null;

        const latestResult = latestData.data[0];
        const codePrelevement = latestResult.code_prelevement;

        // Step 2: Fetch all results for this sample
        const fullResponse = await fetch(
            `https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/resultats_dis?code_prelevement=${codePrelevement}&size=100`
        );

        if (!fullResponse.ok) throw new Error("Failed to fetch full sample data");

        const fullData = await fullResponse.json();
        const results = fullData.data;

        if (!results || results.length === 0) return null;

        // Aggregate data
        // We take the common fields from the first result (they should be identical for the same sample)
        const first = results[0];

        return {
            code_commune: first.code_commune,
            nom_commune: first.nom_commune,
            date_prelevement: first.date_prelevement,
            conclusion_conformite_prelevement: first.conclusion_conformite_prelevement,
            conformite_limites_bacterio_prelevement: first.conformite_limites_bact_prelevement,
            conformite_limites_p_c_prelevement: first.conformite_limites_pc_prelevement,
            resultats_analyse: results.map((r: any) => ({
                code_parametre: r.code_parametre,
                libelle_parametre: r.libelle_parametre,
                resultat_numerique: r.resultat_numerique,
                libelle_unite: r.libelle_unite
            }))
        };

    } catch (error) {
        console.error("Error fetching water quality:", error);
        return null;
    }
};

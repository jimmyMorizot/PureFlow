// API Service for Hub'Eau Water Quality
// Strategy based on YoanDev's pureflow: Use communes_udi to get code_reseau, then fetch resultats_dis by code_reseau

const HUBEAU_BASE_URL = 'https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable';

export interface WaterNetwork {
    code_reseau: string;
    nom_reseau: string;
    nom_distributeur?: string;
}

export interface WaterResult {
    code_parametre: string;
    libelle_parametre: string;
    resultat_numerique: number;
    libelle_unite: string;
    date_prelevement: string;
    conclusion_conformite_prelevement?: string;
    conformite_limites_bacterio_prelevement?: string;
    conformite_limites_p_c_prelevement?: string;
}

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
    network?: WaterNetwork;
}

/**
 * Step 1: Get water distribution networks (UDI) for a commune
 * This is FAST and RELIABLE
 */
export const getCommuneNetworks = async (codeCommune: string, retries = 3): Promise<WaterNetwork[]> => {
    console.log(`[PureFlow] Step 1: Fetching networks for commune ${codeCommune}...`);

    const fetchWithRetry = async (attempt: number): Promise<Response | null> => {
        try {
            const response = await fetch(`${HUBEAU_BASE_URL}/communes_udi?code_commune=${codeCommune}&size=100`);

            if (!response.ok) {
                if (attempt < retries && [500, 502, 503, 504].includes(response.status)) {
                    const delay = 1000 * Math.pow(2, attempt);
                    console.warn(`[PureFlow] communes_udi error ${response.status}, retry ${attempt + 1}/${retries} in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return fetchWithRetry(attempt + 1);
                }
                console.warn(`[PureFlow] communes_udi failed: ${response.status}`);
                return null;
            }
            return response;
        } catch (error) {
            if (attempt < retries) {
                const delay = 1000 * Math.pow(2, attempt);
                console.warn(`[PureFlow] communes_udi network error, retry ${attempt + 1}/${retries} in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchWithRetry(attempt + 1);
            }
            console.error('[PureFlow] communes_udi failed after retries:', error);
            return null;
        }
    };

    try {
        const response = await fetchWithRetry(0);
        if (!response) return [];

        const data = await response.json();
        console.log(`[PureFlow] communes_udi response:`, data);

        if (!data.data || data.data.length === 0) {
            console.warn(`[PureFlow] No networks found for commune ${codeCommune}`);
            return [];
        }

        // Extract unique networks
        const uniqueNetworks = new Map<string, WaterNetwork>();
        data.data.forEach((item: any) => {
            if (item.code_reseau && !uniqueNetworks.has(item.code_reseau)) {
                uniqueNetworks.set(item.code_reseau, {
                    code_reseau: item.code_reseau,
                    nom_reseau: item.nom_reseau || 'Réseau inconnu',
                    nom_distributeur: item.nom_distributeur
                });
            }
        });

        const networks = Array.from(uniqueNetworks.values());
        console.log(`[PureFlow] Found ${networks.length} unique networks:`, networks);
        return networks;

    } catch (error) {
        console.error('[PureFlow] Error fetching networks:', error);
        return [];
    }
};

/**
 * Step 2: Get water quality results for a network
 * Using code_reseau is MUCH FASTER and MORE RELIABLE than code_commune
 */
export const getWaterResults = async (codeCommune: string, codeReseau?: string, retries = 3): Promise<WaterResult[]> => {
    let url = `${HUBEAU_BASE_URL}/resultats_dis?size=500`;

    if (codeReseau) {
        url += `&code_reseau=${codeReseau}`;
        console.log(`[PureFlow] Step 2: Fetching results by code_reseau=${codeReseau}...`);
    } else {
        url += `&code_commune=${codeCommune}`;
        console.log(`[PureFlow] Step 2: Fallback - fetching results by code_commune=${codeCommune}...`);
    }

    const fetchWithRetry = async (attempt: number): Promise<Response> => {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                if (attempt < retries && [500, 502, 503, 504].includes(response.status)) {
                    const delay = 1000 * Math.pow(2, attempt);
                    console.warn(`[PureFlow] resultats_dis error ${response.status}, retry ${attempt + 1}/${retries} in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return fetchWithRetry(attempt + 1);
                }
                console.error(`[PureFlow] resultats_dis failed: ${response.status}`);
                if (response.status === 404) throw new Error('NOT_FOUND');
                throw new Error(`Hub'Eau API Error: ${response.status}`);
            }
            return response;
        } catch (error) {
            if (error instanceof Error && error.message === 'NOT_FOUND') throw error;
            if (attempt < retries) {
                const delay = 1000 * Math.pow(2, attempt);
                console.warn(`[PureFlow] resultats_dis network error, retry ${attempt + 1}/${retries} in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchWithRetry(attempt + 1);
            }
            throw error;
        }
    };

    try {
        const response = await fetchWithRetry(0);
        const data = await response.json();
        console.log(`[PureFlow] resultats_dis returned ${data.data?.length || 0} results`);
        return data.data || [];

    } catch (error) {
        if (error instanceof Error && error.message === 'NOT_FOUND') return [];
        console.error('[PureFlow] Error fetching water results:', error);
        throw error;
    }
};

/**
 * Main function: Fetch water quality for a commune
 * Uses the YoanDev strategy: communes_udi -> code_reseau -> resultats_dis
 */
export const fetchWaterQuality = async (cityCode: string): Promise<WaterQualityResult | null> => {
    console.log(`[PureFlow] === Starting water quality fetch for commune ${cityCode} ===`);

    try {
        // Step 1: Get networks
        const networks = await getCommuneNetworks(cityCode);

        let results: WaterResult[] = [];
        let selectedNetwork: WaterNetwork | undefined;

        if (networks.length > 0) {
            // Use the first network's code_reseau for precise query
            selectedNetwork = networks[0];
            console.log(`[PureFlow] Using network: ${selectedNetwork.nom_reseau} (${selectedNetwork.code_reseau})`);
            results = await getWaterResults(cityCode, selectedNetwork.code_reseau);
        } else {
            // Fallback: no networks found, try direct commune query
            console.log(`[PureFlow] No networks found, trying direct commune query...`);
            results = await getWaterResults(cityCode);
        }

        if (!results || results.length === 0) {
            console.warn(`[PureFlow] No results found for commune ${cityCode}`);
            return null;
        }

        // Sort by date (most recent first)
        results.sort((a, b) =>
            new Date(b.date_prelevement).getTime() - new Date(a.date_prelevement).getTime()
        );

        // Get the latest sample date
        const latestDate = results[0].date_prelevement;
        console.log(`[PureFlow] Latest sample date: ${latestDate}`);

        // Filter results to only include the latest sample
        const latestResults = results.filter(r => r.date_prelevement === latestDate);
        console.log(`[PureFlow] Found ${latestResults.length} parameters from latest sample`);

        // Build the result object
        const first = latestResults[0];

        return {
            code_commune: cityCode,
            nom_commune: '',
            date_prelevement: first.date_prelevement,
            conclusion_conformite_prelevement: first.conclusion_conformite_prelevement || 'Conforme',
            conformite_limites_bacterio_prelevement: first.conformite_limites_bacterio_prelevement || 'Conforme',
            conformite_limites_p_c_prelevement: first.conformite_limites_p_c_prelevement || 'Conforme',
            resultats_analyse: latestResults.map(r => ({
                code_parametre: r.code_parametre,
                libelle_parametre: r.libelle_parametre,
                resultat_numerique: r.resultat_numerique,
                libelle_unite: r.libelle_unite
            })),
            network: selectedNetwork
        };

    } catch (error) {
        console.error('[PureFlow] Error in fetchWaterQuality:', error);
        return null;
    }
};

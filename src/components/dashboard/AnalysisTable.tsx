import { useState, useMemo, useCallback } from "react";
import { Search, ArrowUpDown, Calendar, FlaskConical, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";

interface AnalysisResult {
    code_parametre: string;
    libelle_parametre: string;
    resultat_numerique: number;
    libelle_unite: string;
}

interface AnalysisTableProps {
    results: AnalysisResult[];
    datePrelevement: string;
    printing?: boolean;
}

type SortKey = "name" | "value";
type SortOrder = "asc" | "desc";

const ITEMS_PER_PAGE = 10;

export function AnalysisTable({ results, datePrelevement, printing = false }: AnalysisTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("name");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
    const [isLoading, setIsLoading] = useState(false);

    const filteredAndSorted = useMemo(() => {
        let filtered = results.filter(r =>
            r.libelle_parametre.toLowerCase().includes(searchQuery.toLowerCase())
        );

        filtered.sort((a, b) => {
            let comparison = 0;
            if (sortKey === "name") {
                comparison = a.libelle_parametre.localeCompare(b.libelle_parametre);
            } else if (sortKey === "value") {
                comparison = a.resultat_numerique - b.resultat_numerique;
            }
            return sortOrder === "asc" ? comparison : -comparison;
        });

        return filtered;
    }, [results, searchQuery, sortKey, sortOrder]);

    const displayedResults = printing ? filteredAndSorted : filteredAndSorted.slice(0, displayCount);
    const hasMore = !printing && displayCount < filteredAndSorted.length;

    const loadMore = useCallback(() => {
        setIsLoading(true);
        setTimeout(() => {
            setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredAndSorted.length));
            setIsLoading(false);
        }, 300);
    }, [filteredAndSorted.length]);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const formattedDate = new Date(datePrelevement).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short"
    });

    return (
        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b bg-gradient-to-r from-slate-50 to-white">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl shadow-md">
                            <FlaskConical className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Détail des analyses</h3>
                            <p className="text-sm text-muted-foreground">{filteredAndSorted.length} paramètres</p>
                        </div>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un paramètre..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 bg-white border-slate-200 rounded-xl"
                        />
                    </div>
                </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[80px_1fr_auto] sm:grid-cols-[100px_1fr_150px] gap-4 px-5 py-3 bg-slate-50/80 border-b text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSort("name")}
                    className="justify-start gap-1 -ml-2 h-auto p-1 font-semibold text-muted-foreground hover:text-foreground"
                >
                    Paramètre
                    <ArrowUpDown className="h-3 w-3" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSort("value")}
                    className="justify-end gap-1 h-auto p-1 font-semibold text-muted-foreground hover:text-foreground"
                >
                    Valeur
                    <ArrowUpDown className="h-3 w-3" />
                </Button>
            </div>

            {/* Table Rows with Infinite Scroll */}
            <div className="divide-y divide-slate-100">
                {displayedResults.map((result, idx) => (
                    <div
                        key={`${result.code_parametre}-${idx}`}
                        className="grid grid-cols-[80px_1fr_auto] sm:grid-cols-[100px_1fr_150px] gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors"
                    >
                        <span className="text-xs text-muted-foreground self-center">
                            {formattedDate}
                        </span>
                        <span className="font-medium text-foreground self-center">
                            {result.libelle_parametre}
                        </span>
                        <div className="text-right self-center">
                            <span className="text-lg font-bold text-primary">{result.resultat_numerique}</span>
                            <span className="text-xs text-muted-foreground ml-1">{result.libelle_unite}</span>
                        </div>
                    </div>
                ))}

                <InfiniteScroll hasMore={hasMore} isLoading={isLoading} next={loadMore} threshold={1}>
                    {hasMore && (
                        <div className="flex justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    )}
                </InfiniteScroll>
            </div>

            {filteredAndSorted.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                    Aucun paramètre trouvé pour "{searchQuery}"
                </div>
            )}
        </div>
    );
}

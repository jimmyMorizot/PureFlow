import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, ShieldCheck, FlaskConical } from "lucide-react";

interface QualityScoreProps {
    conclusion: string;
    bacterio: string;
    chimique: string;
    date?: string;
}

export function QualityScore({ conclusion = "Non disponible", bacterio = "Non disponible", chimique = "Non disponible", date }: QualityScoreProps) {
    const isConforme = conclusion?.toLowerCase().includes("conforme") && !conclusion?.toLowerCase().includes("non conforme");
    const isBacterioOk = bacterio?.toLowerCase().includes("conforme") && !bacterio?.toLowerCase().includes("non");
    const isChimiqueOk = chimique?.toLowerCase().includes("conforme") && !chimique?.toLowerCase().includes("non");

    const Icon = isConforme ? CheckCircle : AlertTriangle;
    const gradientClass = isConforme
        ? "from-emerald-500 to-teal-600"
        : "from-red-500 to-orange-600";

    return (
        <div className={cn("w-full p-6 sm:p-8 rounded-2xl shadow-lg text-white bg-gradient-to-r", gradientClass)}>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Icon */}
                <div className="p-4 bg-white/20 rounded-full shrink-0 self-start md:self-center">
                    <Icon className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>

                {/* Text Content */}
                <div className="flex-grow space-y-2">
                    {date && (
                        <p className="text-sm font-medium opacity-80 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-white rounded-full"></span>
                            {date}
                        </p>
                    )}
                    <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                        {isConforme ? "Eau potable conforme" : "Eau non conforme"}
                    </h2>
                    <p className="text-sm sm:text-base opacity-90 leading-relaxed max-w-2xl">
                        {conclusion}
                    </p>
                    {/* Conformity Badges */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium", isBacterioOk ? "bg-white/20" : "bg-red-500/50")}>
                            <ShieldCheck className="w-4 h-4" />
                            Bactério: {isBacterioOk ? "OK" : "Non conforme"}
                        </div>
                        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium", isChimiqueOk ? "bg-white/20" : "bg-red-500/50")}>
                            <FlaskConical className="w-4 h-4" />
                            Physico-chimique: {isChimiqueOk ? "OK" : "Non conforme"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



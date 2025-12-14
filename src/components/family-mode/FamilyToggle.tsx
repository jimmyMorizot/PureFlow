import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useFamilyStore } from "@/stores/useFamilyStore";
import { Baby, Glasses } from "lucide-react";

export function FamilyToggle() {
    const { isFamilyMode, toggleFamilyMode } = useFamilyStore();

    return (
        <div className="flex items-center space-x-2 bg-secondary/50 p-2 rounded-lg border">
            <Glasses className={`h-4 w-4 ${!isFamilyMode ? "text-primary" : "text-muted-foreground"}`} />
            <Switch
                id="family-mode"
                checked={isFamilyMode}
                onCheckedChange={toggleFamilyMode}
            />
            <Label htmlFor="family-mode" className="cursor-pointer flex items-center gap-2">
                <Baby className={`h-4 w-4 ${isFamilyMode ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium">Mode Famille</span>
            </Label>
        </div>
    );
}

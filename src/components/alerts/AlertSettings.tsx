import { useAlertStore } from "@/stores/useAlertStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Bell } from "lucide-react";

export function AlertSettings() {
    const { alerts, toggleAlert, updateThreshold } = useAlertStore();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" title="Configurer les alertes">
                    <Bell className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Configuration des alertes</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {alerts.map((alert) => (
                        <div key={alert.parameterCode} className="space-y-4 border p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <Label htmlFor={`alert-${alert.parameterCode}`} className="font-semibold">
                                    {alert.parameterName}
                                </Label>
                                <Switch
                                    id={`alert-${alert.parameterCode}`}
                                    checked={alert.enabled}
                                    onCheckedChange={() => toggleAlert(alert.parameterCode)}
                                />
                            </div>

                            {alert.enabled && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Seuil d'alerte</span>
                                        <span>{alert.threshold}</span>
                                    </div>
                                    <Slider
                                        value={[alert.threshold]}
                                        max={100}
                                        step={1}
                                        onValueChange={(value) => updateThreshold(alert.parameterCode, value[0])}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

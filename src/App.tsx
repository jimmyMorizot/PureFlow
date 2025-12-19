import { useState, useRef, useEffect } from 'react'
import { SearchBar } from '@/components/search/SearchBar'

import { Dashboard } from '@/components/dashboard/Dashboard'
import { ComparisonView } from '@/components/compare/ComparisonView'
import { useComparisonStore } from '@/stores/useComparisonStore'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, ShieldCheck, Activity, Droplets } from 'lucide-react'

function App() {
  const [selectedCity, setSelectedCity] = useState<{ code: string, name: string } | null>(null);
  const [isWaitingForComparison, setIsWaitingForComparison] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const { addCity, selectedCities } = useComparisonStore(); // Check store for auto-exit

  const searchRef = useRef<HTMLDivElement>(null);

  // Auto-switch back to dashboard if comparison is cleared
  useEffect(() => {
    if (showComparison && selectedCities.length === 0 && selectedCity) {
      setShowComparison(false);
    }
  }, [showComparison, selectedCities.length, selectedCity]);

  const handleCitySelect = (code: string, name: string) => {
    if (isWaitingForComparison) {
      // Add the second city
      addCity(code, name);
      setIsWaitingForComparison(false);
      setShowComparison(true);
    } else {
      // Standard selection
      setSelectedCity({ code, name });
      setShowComparison(false);
      setIsWaitingForComparison(false);
    }
  };

  const handleStartComparison = () => {
    if (selectedCity) {
      addCity(selectedCity.code, selectedCity.name);
      setIsWaitingForComparison(true);
      // Hide dashboard to focus on search
      setShowComparison(false);
      // Scroll back to search
      searchRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isLandingPage = !selectedCity && !showComparison && !isWaitingForComparison;

  return (
    <div className={`min-h-screen transition-all duration-1000 ${isLandingPage ? 'bg-[#F0F8FF] flex flex-col items-center justify-center relative overflow-hidden' : 'bg-background p-4 flex flex-col items-center gap-8'}`}>

      {/* Background Decor for Landing */}
      {isLandingPage && (
        <>
          {/* Soft Light Gradient Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-100/40 via-blue-50/20 to-white -z-20 pointer-events-none" />

          {/* Subtle Animated Orbs - Lighter */}
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-200/20 rounded-full blur-[80px] animate-pulse delay-1000" />

          {/* Top Pill - Glass White */}
          <div className="absolute top-2 sm:top-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-white/40 shadow-sm px-3 sm:px-6 py-1.5 sm:py-2 rounded-full flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-1000 z-50 hover:shadow-md transition-all cursor-help group">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors tracking-wide uppercase whitespace-nowrap">Données Officielles Hub'Eau</span>
          </div>

          {/* Waves Animation - Soft Blue/Teal */}
          <div className="absolute bottom-0 left-0 right-0 h-[25vh] w-full overflow-hidden -z-10 pointer-events-none opacity-60">
            <svg className="absolute bottom-0 w-[200%] h-full animate-wave opacity-40 text-blue-300"
              viewBox="0 0 1600 200" preserveAspectRatio="none" fill="currentColor">
              <path d="M0,100 C400,150 800,50 1600,100 L1600,200 L0,200 Z" />
            </svg>
            <svg className="absolute bottom-0 w-[200%] h-full animate-wave-slow opacity-30 text-emerald-300 delay-75"
              viewBox="0 0 1600 200" preserveAspectRatio="none" fill="currentColor" style={{ animationDelay: '-5s' }}>
              <path d="M0,100 C400,50 800,150 1600,100 L1600,200 L0,200 Z" />
            </svg>
          </div>
        </>
      )}

      {/* Search Section */}
      <div
        ref={searchRef}
        className={`w-full max-w-3xl space-y-10 animate-in slide-in-from-bottom-8 duration-1000 ${isLandingPage ? 'scale-100 z-10 px-4' : 'pt-12 max-w-md'}`}
      >
        <div className="text-center space-y-8 mb-8">

          {isLandingPage ? (
            <>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1] px-4">
                L'EAU EST-ELLE<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 animate-gradient-x pb-2 pr-4 whitespace-nowrap">
                  VRAIMENT PURE{'\u00A0'}?
                </span>
              </h1>
              <p className="text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                Ne buvez pas à l'aveugle. Découvrez instantanément la qualité sanitaire de l'eau du robinet dans votre commune.
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-2 cursor-pointer group" onClick={() => {
              setShowComparison(false);
              setIsWaitingForComparison(false);
              setSelectedCity(null);
            }}>
              <div className="bg-primary/10 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Droplets className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-extrabold text-primary tracking-tight">PureFlow</h1>
            </div>
          )}
        </div>

        {isWaitingForComparison && (
          <Alert className="bg-blue-50 border-blue-200 text-blue-800 mb-4 animate-in fade-in zoom-in-95 shadow-md">
            <Info className="h-4 w-4" />
            <AlertTitle>Mode Comparateur</AlertTitle>
            <AlertDescription>
              Veuillez sélectionner une deuxième commune à comparer.
            </AlertDescription>
          </Alert>
        )}

        <div className={`transition-all duration-500 transform ${isLandingPage ? 'p-1 rounded-2xl bg-gradient-to-r from-blue-200 via-cyan-200 to-emerald-200 hover:scale-[1.02] shadow-xl' : ''}`}>
          <div className={`${isLandingPage ? 'bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/50' : ''}`}>
            <SearchBar onSelectCity={handleCitySelect} />
          </div>
        </div>

        {/* Feature Pills - Only visible on Landing Page */}
        {isLandingPage && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12">
            <div className="group flex flex-col items-center text-center space-y-4 p-6 rounded-2xl border border-white/60 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full group-hover:scale-110 transition-transform duration-300 border border-emerald-200">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Fiabilité Totale</h3>
                <p className="text-sm text-slate-500 mt-1">Données officielles du Ministère</p>
              </div>
            </div>
            <div className="group flex flex-col items-center text-center space-y-4 p-6 rounded-2xl border border-white/60 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="p-4 bg-blue-100 text-blue-600 rounded-full group-hover:scale-110 transition-transform duration-300 border border-blue-200">
                <Activity className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Temps Réel</h3>
                <p className="text-sm text-slate-500 mt-1">Analyses mises à jour en continu</p>
              </div>
            </div>
            <div className="group flex flex-col items-center text-center space-y-4 p-6 rounded-2xl border border-white/60 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="p-4 bg-cyan-100 text-cyan-600 rounded-full group-hover:scale-110 transition-transform duration-300 border border-cyan-200">
                <Droplets className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Transparence</h3>
                <p className="text-sm text-slate-500 mt-1">Résultats clairs et détaillés</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Dashboard */}
      {!showComparison && !isWaitingForComparison && selectedCity && (
        <div className="w-full max-w-5xl mt-4">
          <Dashboard
            cityCode={selectedCity.code}
            cityName={selectedCity.name}
            onCompareClick={handleStartComparison}
          />
        </div>
      )}

      {/* Comparison View */}
      {showComparison && (
        <div className="w-full max-w-6xl mt-8 pb-24 animate-in fade-in slide-in-from-bottom-8">
          <ComparisonView />
        </div>
      )}

      {/* Footer */}
      {!isLandingPage && (
        <footer className="w-full py-6 text-center text-sm text-muted-foreground border-t mt-auto">
          <p>Données fournies par Hub'Eau - Ministère de la Santé</p>
        </footer>
      )}
    </div>
  )
}

export default App

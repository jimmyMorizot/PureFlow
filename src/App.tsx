import { useState } from 'react'
import { SearchBar } from '@/components/search/SearchBar'
import { LocationRequest } from '@/components/search/LocationRequest'

function App() {
  const [selectedCity, setSelectedCity] = useState<{ code: string, name: string } | null>(null);

  const handleCitySelect = (code: string, name: string) => {
    setSelectedCity({ code, name });
    console.log("Selected city:", name, code);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary tracking-tight">PureFlow</h1>
        <p className="text-muted-foreground">La qualité de l'eau potable dans votre commune</p>
      </div>

      <div className="w-full max-w-md space-y-6">
        <SearchBar
          onSelectCity={handleCitySelect}
          onGeolocate={() => document.getElementById('geo-btn')?.click()}
        />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou
            </span>
          </div>
        </div>

        <div id="geo-btn-container">
          <LocationRequest onLocationFound={handleCitySelect} />
          {/* Hidden trigger for the search bar icon */}
          <button id="geo-btn" className="hidden" onClick={() => {
            // This is a bit of a hack to link the search bar icon to the logic
            // Ideally we would lift the state up or use a context
            const btn = document.querySelector('#geo-btn-container button') as HTMLButtonElement;
            btn?.click();
          }}></button>
        </div>
      </div>

      {selectedCity && (
        <div className="mt-8 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
          <h2 className="text-xl font-semibold">Commune sélectionnée</h2>
          <p className="text-lg">{selectedCity.name} ({selectedCity.code})</p>
        </div>
      )}
    </div>
  )
}

export default App

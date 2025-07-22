"use client"

import { useState, useEffect } from "react"
import PhotoCaptureButton, { type AnalysisResult } from "@/components/photo-capture-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, Leaf, XCircle, Droplets, BookOpen, Trash2, Layers, Repeat, X } from "lucide-react"

export default function Page() {
  const [plants, setPlants] = useState<AnalysisResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const savedPlants = localStorage.getItem("savedPlants")
      if (savedPlants) {
        setPlants(JSON.parse(savedPlants))
      }
    } catch (e) {
      console.error("Fehler beim Lesen aus dem localStorage", e)
    }
  }, [])

  const updatePlants = (newPlants: AnalysisResult[]) => {
    setPlants(newPlants)
    try {
      localStorage.setItem("savedPlants", JSON.stringify(newPlants))
    } catch (e) {
      console.error("Fehler beim Schreiben in den localStorage", e)
    }
  }

  const handleAnalysisStart = () => {
    setIsLoading(true)
    setError(null)
  }

  const handleAnalysisComplete = (newPlant: AnalysisResult) => {
    setIsLoading(false)
    const updatedPlants = [newPlant, ...plants]
    updatePlants(updatedPlants)
  }

  const handleAnalysisError = (error: string) => {
    setIsLoading(false)
    setError(error)
  }

  const handleClearAllPlants = () => {
    if (confirm("Möchten Sie wirklich alle Ihre gespeicherten Pflanzen löschen?")) {
      updatePlants([])
    }
  }

  const handleDeletePlant = (indexToDelete: number) => {
    const newPlants = plants.filter((_, index) => index !== indexToDelete)
    updatePlants(newPlants)
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-16 gap-10 bg-teal-50 dark:bg-teal-950">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-teal-900 dark:text-teal-50">
          Collect all the Plants!
        </h1>
        <p className="mt-3 text-lg text-teal-600 dark:text-teal-400">
          Füge eine neue Pflanze hinzu oder sieh dir deine Sammlung an.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <PhotoCaptureButton
          onAnalysisStart={handleAnalysisStart}
          onAnalysisComplete={handleAnalysisComplete}
          onAnalysisError={handleAnalysisError}
        />
        {plants.length > 0 && (
          <Button variant="destructive" className="bg-rose-700 text-rose-100" onClick={handleClearAllPlants}>
            <Trash2 className="mr-2 h-4 w-4" /> Alle Pflanzen löschen
          </Button>
        )}
      </div>

      <div className="w-full max-w-md mt-4">
        {isLoading && (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Bild wird analysiert...</p>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fehler</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="w-full max-w-4xl space-y-6">
        {plants.length > 0
          ? plants.map((plant, index) => (
              <Card
                key={`${plant.plantName}-${index}`}
                className="relative overflow-hidden group bg-white dark:bg-slate-800/50 shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-rose-700 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
                  onClick={() => handleDeletePlant(index)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Pflanze löschen</span>
                </Button>
                <div className="grid md:grid-cols-3">
                  <div className="md:col-span-1">
                    <img
                      src={plant.imageDataUrl || "/placeholder.svg"}
                      alt={`Bild von ${plant.plantName}`}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:col-span-2 p-6">
                    <CardHeader className="p-0">
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        {plant.plantInImage === "ja" ? (
                          <Leaf className="text-teal-600" />
                        ) : (
                          <XCircle className="text-rose-800" />
                        )}
                        {plant.plantName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-4 space-y-4">
                      {plant.plantInImage === "ja" ? (
                        <>
                          {plant.description && plant.description !== "Keine Angabe" && (
                            <div>
                              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Beschreibung</h3>
                              <p className="text-slate-600 dark:text-slate-400">{plant.description}</p>
                            </div>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {plant.soilType && plant.soilType !== "Keine Angabe" && (
                              <div>
                                <h3 className="font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                  <Layers className="h-4 w-4 text-yellow-700" />
                                  Erde
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">{plant.soilType}</p>
                              </div>
                            )}
                            {plant.wateringFrequency && plant.wateringFrequency !== "Keine Angabe" && (
                              <div>
                                <h3 className="font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                  <Repeat className="h-4 w-4 text-cyan-500" />
                                  Gieß-Frequenz
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">{plant.wateringFrequency}</p>
                              </div>
                            )}
                          </div>
                          {plant.wateringNeeds && plant.wateringNeeds !== "Keine Angabe" && (
                            <div>
                              <h3 className="font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                <Droplets className="h-4 w-4 text-blue-500" />
                                Gieß-Anleitung
                              </h3>
                              <p className="text-slate-600 dark:text-slate-400">{plant.wateringNeeds}</p>
                            </div>
                          )}
                          {plant.wikipediaUrl && plant.wikipediaUrl !== "Keine Angabe" && (
                            <div>
                              <h3 className="font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                <BookOpen className="h-4 w-4 text-gray-500" />
                                Mehr erfahren
                              </h3>
                              <a
                                href={plant.wikipediaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline dark:text-blue-400"
                              >
                                Wikipedia-Artikel lesen
                              </a>
                            </div>
                          )}
                        </>
                      ) : (
                        <p>Auf dem Bild konnte keine Pflanze identifiziert werden.</p>
                      )}
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))
          : !isLoading && (
              <div className="text-center text-slate-500 py-16 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                <Leaf className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-medium">Noch keine Pflanzen gescannt</h3>
                <p className="mt-1 text-sm">Klicke oben, um deine erste Pflanze hinzuzufügen!</p>
              </div>
            )}
      </div>
    </main>
  )
}

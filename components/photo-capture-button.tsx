"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Camera, RefreshCw, Send, Loader2 } from "lucide-react"

// Die Datenstruktur ohne "companionPlants"
export interface AnalysisResult {
  plantInImage: "ja" | "nein"
  plantName: string
  description: string
  wateringNeeds: string
  wikipediaUrl: string | "Keine Angabe"
  imageDataUrl: string
  soilType: string
  wateringFrequency: string
}

interface PhotoCaptureButtonProps {
  onAnalysisStart: () => void
  onAnalysisComplete: (result: AnalysisResult) => void
  onAnalysisError: (error: string) => void
}

// Hilfsfunktion zum Verkleinern des Bildes
async function resizeImage(base64Str: string, maxWidth = 400): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = base64Str
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ratio = img.height / img.width
      canvas.width = maxWidth
      canvas.height = maxWidth * ratio
      const ctx = canvas.getContext("2d")
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL("image/jpeg", 0.8))
    }
  })
}

export default function PhotoCaptureButton({
  onAnalysisStart,
  onAnalysisComplete,
  onAnalysisError,
}: PhotoCaptureButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const openCamera = useCallback(async () => {
    setCapturedImage(null)
    setError(null)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        setStream(mediaStream)
        if (videoRef.current) videoRef.current.srcObject = mediaStream
      } catch (err) {
        setError("Kamerazugriff fehlgeschlagen. Bitte Berechtigung erteilen.")
      }
    } else {
      setError("Kamerazugriff nicht unterstützt.")
    }
  }, [])

  const closeCamera = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop())
    setStream(null)
  }, [stream])

  const handleOpenChange = (open: boolean) => {
    if (isLoading) return
    setIsDialogOpen(open)
    if (open) openCamera()
    else closeCamera()
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height)
      setCapturedImage(canvas.toDataURL("image/jpeg"))
      closeCamera()
    }
  }

  const sendPhoto = async () => {
    if (!capturedImage) return
    setIsLoading(true)
    onAnalysisStart()
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: capturedImage }),
      })
      if (!response.ok) throw new Error(`API-Fehler: ${response.statusText}`)
      const result = await response.json()
      const thumbnailDataUrl = await resizeImage(capturedImage)
      onAnalysisComplete({ ...result, imageDataUrl: thumbnailDataUrl })
    } catch (err) {
      onAnalysisError(err instanceof Error ? err.message : "Ein unbekannter Fehler ist aufgetreten.")
    } finally {
      setIsLoading(false)
      setIsDialogOpen(false)
    }
  }

  return (
    <>
      <Button size="lg" className="bg-teal-800 text-teal-100 hover:bg-teal-600" disabled={isLoading} onClick={() => handleOpenChange(true)}>
        <Camera className="mr-2 h-5 w-5" /> Neue Pflanze scannen
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md md:max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Foto aufnehmen</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
            {error ? (
              <div className="flex h-full w-full items-center justify-center p-4 text-center text-red-500">{error}</div>
            ) : capturedImage ? (
              <img
                src={capturedImage || "/placeholder.svg"}
                alt="Aufgenommenes Foto"
                className="h-full w-full object-contain"
              />
            ) : (
              <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            {capturedImage ? (
              <>
                <Button variant="outline" onClick={() => openCamera()} disabled={isLoading}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Wiederholen
                </Button>
                <Button onClick={sendPhoto} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {isLoading ? "Analysiere..." : "Senden & Analysieren"}
                </Button>
              </>
            ) : (
              <>
                <DialogClose asChild>
                  <Button variant="outline">Abbrechen</Button>
                </DialogClose>
                <Button onClick={capturePhoto} disabled={!stream}>
                  <Camera className="mr-2 h-4 w-4" /> Aufnehmen
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

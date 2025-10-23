import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Camera, LogOut, Upload, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

const Scan = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCapturing(true);
    } catch (error) {
      toast.error("Failed to access camera");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturing(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage || !user) return;

    setAnalyzing(true);
    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Upload to storage
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('plant-images')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('plant-images')
        .getPublicUrl(fileName);

      // Call AI edge function
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-plant', {
        body: { imageUrl: publicUrl },
      });

      if (analysisError) throw analysisError;

      // Save to database
      const { error: dbError } = await supabase
        .from('plant_scans')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          disease_detected: analysisData.disease,
          diagnosis: analysisData.diagnosis,
          recommendations: analysisData.recommendations,
          confidence_score: analysisData.confidence,
        });

      if (dbError) throw dbError;

      setResult(analysisData);
      toast.success("Analysis complete!");
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || "Failed to analyze image");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Plant Doctor</h1>
          </div>
          <nav className="flex gap-4 items-center">
            <Button variant="outline" onClick={() => navigate("/upload")} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            <Button variant="outline" onClick={() => navigate("/history")} className="gap-2">
              <History className="h-4 w-4" />
              History
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Camera Scan</CardTitle>
              <CardDescription>
                Use your camera to capture a live image of your plant for instant analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center bg-secondary/50 rounded-lg p-8">
                {!capturing && !capturedImage && (
                  <div className="text-center">
                    <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <Button onClick={startCamera} size="lg" className="gap-2">
                      <Camera className="h-5 w-5" />
                      Start Camera
                    </Button>
                  </div>
                )}

                {capturing && (
                  <div className="w-full">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg"
                    />
                    <div className="flex gap-4 justify-center mt-4">
                      <Button onClick={captureImage} size="lg">
                        Capture Photo
                      </Button>
                      <Button onClick={stopCamera} variant="outline" size="lg">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {capturedImage && !result && (
                  <div className="w-full">
                    <img src={capturedImage} alt="Captured" className="w-full rounded-lg mb-4" />
                    <div className="flex gap-4 justify-center">
                      <Button onClick={analyzeImage} disabled={analyzing} size="lg">
                        {analyzing ? "Analyzing..." : "Analyze Plant"}
                      </Button>
                      <Button 
                        onClick={() => {
                          setCapturedImage(null);
                          setResult(null);
                        }} 
                        variant="outline" 
                        size="lg"
                      >
                        Retake
                      </Button>
                    </div>
                  </div>
                )}

                {result && (
                  <div className="w-full space-y-4">
                    <img src={capturedImage!} alt="Analyzed" className="w-full rounded-lg mb-4" />
                    <div className="space-y-4 bg-card p-6 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Disease Detected:</h3>
                        <p className="text-foreground">{result.disease || "No disease detected"}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Diagnosis:</h3>
                        <p className="text-muted-foreground">{result.diagnosis}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Recommendations:</h3>
                        <p className="text-muted-foreground">{result.recommendations}</p>
                      </div>
                      {result.confidence && (
                        <div>
                          <h3 className="font-semibold text-lg mb-2">Confidence:</h3>
                          <p className="text-muted-foreground">{Math.round(result.confidence * 100)}%</p>
                        </div>
                      )}
                      <Button 
                        onClick={() => {
                          setCapturedImage(null);
                          setResult(null);
                          startCamera();
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Scan Another Plant
                      </Button>
                    </div>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Scan;

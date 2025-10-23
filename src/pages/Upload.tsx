import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Leaf, Upload as UploadIcon, LogOut, Camera, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

const Upload = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !user) return;

    setAnalyzing(true);
    try {
      // Upload image to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('plant-images')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('plant-images')
        .getPublicUrl(fileName);

      // Call AI edge function for analysis
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-plant', {
        body: { imageUrl: publicUrl },
      });

      if (analysisError) throw analysisError;

      // Save result to database
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
            <Button variant="outline" onClick={() => navigate("/scan")} className="gap-2">
              <Camera className="h-4 w-4" />
              Camera Scan
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
              <CardTitle>Upload Plant Image</CardTitle>
              <CardDescription>
                Upload a clear photo of your plant to detect diseases and get treatment recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 hover:border-primary transition-colors">
                {previewUrl ? (
                  <div className="w-full max-w-md">
                    <img src={previewUrl} alt="Preview" className="w-full rounded-lg" />
                  </div>
                ) : (
                  <div className="text-center">
                    <UploadIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Choose an image to upload</p>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="mt-4"
                />
              </div>

              {selectedFile && !result && (
                <Button 
                  onClick={handleAnalyze} 
                  disabled={analyzing} 
                  className="w-full"
                  size="lg"
                >
                  {analyzing ? "Analyzing..." : "Analyze Plant"}
                </Button>
              )}

              {result && (
                <div className="space-y-4 bg-secondary/50 p-6 rounded-lg">
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
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setResult(null);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Analyze Another Plant
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Upload;

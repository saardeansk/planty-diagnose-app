import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, LogOut, Upload, Camera, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface Scan {
  id: string;
  image_url: string;
  disease_detected: string | null;
  diagnosis: string | null;
  recommendations: string | null;
  confidence_score: number | null;
  created_at: string;
}

const History = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadScans(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadScans(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadScans = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('plant_scans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScans(data || []);
    } catch (error: any) {
      toast.error("Failed to load scan history");
    } finally {
      setLoading(false);
    }
  };

  const deleteScan = async (scanId: string, imageUrl: string) => {
    try {
      // Extract file path from URL
      const filePath = imageUrl.split('/plant-images/')[1];
      
      // Delete from storage
      if (filePath) {
        await supabase.storage.from('plant-images').remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('plant_scans')
        .delete()
        .eq('id', scanId);

      if (error) throw error;

      setScans(scans.filter(scan => scan.id !== scanId));
      toast.success("Scan deleted");
    } catch (error: any) {
      toast.error("Failed to delete scan");
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
            <Button variant="outline" onClick={() => navigate("/scan")} className="gap-2">
              <Camera className="h-4 w-4" />
              Camera
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Scan History</h2>
          
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : scans.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No scans yet</p>
                <Button onClick={() => navigate("/upload")}>Upload Your First Plant</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scans.map((scan) => (
                <Card key={scan.id}>
                  <CardHeader className="p-0">
                    <img 
                      src={scan.image_url} 
                      alt="Plant scan" 
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Disease:</p>
                        <p className="font-semibold">{scan.disease_detected || "None detected"}</p>
                      </div>
                      {scan.diagnosis && (
                        <div>
                          <p className="text-sm text-muted-foreground">Diagnosis:</p>
                          <p className="text-sm">{scan.diagnosis.slice(0, 100)}...</p>
                        </div>
                      )}
                      {scan.confidence_score && (
                        <div>
                          <p className="text-sm text-muted-foreground">Confidence:</p>
                          <p className="text-sm font-medium">{Math.round(scan.confidence_score * 100)}%</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(scan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => deleteScan(scan.id, scan.image_url)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;

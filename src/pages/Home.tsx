import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, Leaf, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Plant Doctor</h1>
          </div>
          <nav className="flex gap-4">
            <Link to="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Plant Disease Detection</span>
          </div>
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Keep Your Plants Healthy with AI
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Upload or scan your plant images to instantly detect diseases and get expert recommendations for treatment.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                <Camera className="h-5 w-5" />
                Get Started
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center text-foreground mb-12">
          How Plant Doctor Works
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Scan or Upload</CardTitle>
              <CardDescription>
                Take a photo with your camera or upload an existing image of your plant
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>
                Our advanced AI detects diseases and identifies health issues in seconds
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Get Treatment</CardTitle>
              <CardDescription>
                Receive detailed recommendations and actionable steps to heal your plant
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-secondary/50 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Why Choose Plant Doctor?
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Instant Results</h4>
                <p className="text-muted-foreground">Get diagnosis in seconds with our AI technology</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Expert Recommendations</h4>
                <p className="text-muted-foreground">Receive treatment plans backed by botanical science</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Easy to Use</h4>
                <p className="text-muted-foreground">Simple interface for everyone, from beginners to experts</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Track History</h4>
                <p className="text-muted-foreground">Keep records of all your plant diagnoses</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Plant Doctor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

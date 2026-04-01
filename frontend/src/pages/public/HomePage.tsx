import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  BarChart3, 
  Calendar, 
  FolderOpen, 
  Mail,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import rushLogo from "@/assets/rush-logo.svg";

const features = [
  {
    icon: Users,
    title: "CRM & Sales",
    description: "Manage leads, deals, and customer relationships with powerful pipeline tools."
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Get real-time insights and reports to make data-driven decisions."
  },
  {
    icon: Calendar,
    title: "Calendar",
    description: "Integrated calendar with Google Calendar sync for seamless scheduling."
  },
  {
    icon: FolderOpen,
    title: "Drive",
    description: "Connect cloud storage and network drives for centralized file management."
  },
  {
    icon: Mail,
    title: "Mail",
    description: "Unified inbox for team communication and collaboration."
  },
  {
    icon: Shield,
    title: "HRMS",
    description: "Complete HR management including attendance, leave, and employee records."
  }
];

const benefits = [
  "Multi-tenant architecture with complete data isolation",
  "Role-based access control (RBAC) for security",
  "Google Drive, OneDrive, and network drive integration",
  "Real-time collaboration tools",
  "Enterprise-grade security and compliance"
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={rushLogo} alt="Rush Corporation" className="h-8" />
            <span className="font-semibold text-xl">RushCRM</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          All-in-One Business
          <span className="text-primary"> Management Platform</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Streamline your organization with CRM, HRMS, Inventory, and Collaboration tools—all in one secure, multi-tenant platform.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/privacy">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-muted/50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-8">Why Choose RushCRM?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OAuth Verification Info */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Secure Google Integration</h2>
          <p className="text-muted-foreground mb-6">
            RushCRM uses Google OAuth 2.0 for secure authentication and Google Drive integration. 
            Your data is protected with industry-standard encryption and never shared with third parties.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/privacy">
              <Button variant="outline">Privacy Policy</Button>
            </Link>
            <Link to="/terms">
              <Button variant="outline">Terms of Service</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={rushLogo} alt="Rush Corporation" className="h-6" />
              <span className="font-medium">RushCRM</span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
              <Link to="/auth" className="hover:text-foreground">Sign In</Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} RushCRM. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

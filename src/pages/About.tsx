import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, ArrowLeft, Info, Target, User, ExternalLink } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-card border-b border-border sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="icon-circle-primary">
              <FileText className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-foreground">Informes de Servicio</span>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Formulario
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Información</h1>
          <p className="text-muted-foreground mt-2">
            Conoce más sobre nuestro sitio web y su propósito.
          </p>
        </div>

        {/* About Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex justify-center mb-4">
                <div className="icon-circle-primary">
                  <Info className="h-6 w-6" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-3">Sobre este sitio</h2>
              <p className="text-muted-foreground leading-relaxed">
                Este sitio web ha sido desarrollado de forma gratuita y sin fines de lucro, 
                con el propósito de brindar un servicio útil a la comunidad. Surgió como 
                respuesta a necesidades de organización dentro de la Congregación Arrayanes.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex justify-center mb-4">
                <div className="icon-circle-primary">
                  <Target className="h-6 w-6" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-3">Nuestra misión</h2>
              <p className="text-muted-foreground leading-relaxed">
                Priorizamos la seguridad de la información y el respeto a la privacidad 
                de los usuarios. Este proyecto busca aplicar la tecnología con responsabilidad 
                para fortalecer la colaboración, la organización y el sentido de comunidad.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Developer Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4">Desarrollador</h2>
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="icon-circle-primary flex-shrink-0">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary">Leonardo Gonzalez</h3>
                  <p className="text-sm text-muted-foreground mb-2">Desarrollador Web</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Como estudiante y desarrollador comprometido con el servicio a los demás, 
                    creo que el conocimiento debe ponerse al servicio de las personas. Este sitio 
                    es un pequeño aporte desde mi área de estudio y experiencia, con la esperanza 
                    de facilitar la vida comunitaria.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* License Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4">Licencia</h2>
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-primary text-primary font-bold text-xl">
                  CC
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Esta obra está bajo una{' '}
                <a 
                  href="https://creativecommons.org/licenses/by-nc-nd/4.0/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Licencia Creative Commons Atribución-NoComercial-SinDerivadas 4.0 Internacional
                  <ExternalLink className="h-3 w-3" />
                </a>.
              </p>
              <div className="flex justify-center gap-4 text-muted-foreground">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-muted-foreground text-sm">
                  ⓘ
                </div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-muted-foreground text-sm">
                  $
                </div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-muted-foreground text-sm">
                  =
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-border">
          <p className="text-muted-foreground font-medium">
            Congregación Arrayanes
          </p>
        </footer>
      </main>
    </div>
  );
};

export default About;

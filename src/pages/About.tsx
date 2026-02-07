import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ExternalLink,
  Info,
  Moon,
  Shield,
  Sun,
  User,
} from "lucide-react";

const About = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches);
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card/95 border-b border-border sticky top-0 z-20 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/favicon-64.png?v=3"
              alt="Icono Informes"
              className="h-9 w-9 object-contain"
            />
            <div className="min-w-0">
              <p className="font-semibold leading-tight truncate">Información del sistema</p>
              <p className="text-xs text-muted-foreground truncate">Congregación Arrayanes</p>
            </div>
          </div>

          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <section className="mb-8">
          <h1 className="text-3xl font-bold">Página de información</h1>
          <p className="text-muted-foreground mt-2">
            Esta sección explica el propósito del sitio, su seguridad y el estado visual según el tema del dispositivo.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 bg-card">
            {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="text-sm font-medium">
              Modo detectado: {isDarkMode ? "Oscuro" : "Claro"}
            </span>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-primary" />
                ¿Para qué sirve este sistema?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2">
              <p>
                Facilita el envío mensual de informes de servicio de forma rápida, clara y desde cualquier dispositivo.
              </p>
              <p>
                El objetivo es reducir errores de captura y mejorar la organización general de la congregación.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-primary" />
                Privacidad y seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2">
              <p>
                El sitio usa autenticación para el panel administrativo y reglas de acceso para proteger los datos.
              </p>
              <p>
                Además, se aplican permisos por rol para restringir acciones sensibles.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Desarrollador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-primary">Leonardo González</p>
            <p className="text-muted-foreground mt-2">
              Proyecto desarrollado para mejorar la experiencia de registro y administración de informes, priorizando facilidad de uso y confiabilidad.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Licencia</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              Esta obra está bajo una licencia
              {" "}
              <a
                href="https://creativecommons.org/licenses/by-nc-nd/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Creative Commons BY-NC-ND 4.0
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default About;

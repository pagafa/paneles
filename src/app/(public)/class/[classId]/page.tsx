
import { mockClasses } from "@/lib/placeholder-data";
import type { SchoolClass } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { School, UserCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getClassDetails(classId: string): Promise<SchoolClass | undefined> {
  // In a real app, this would fetch from a database or API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockClasses.find(cls => cls.id === classId));
    }, 300);
  });
}

export default async function PublicClassPage({ params }: { params: { classId: string } }) {
  const classDetails = await getClassDetails(params.classId);

  if (!classDetails) {
    return (
      <div className="w-full max-w-lg text-center">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Clase no encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              La clase que estás buscando no existe o no está disponible.
            </p>
            <Button asChild>
              <Link href="/">Volver al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-primary/10 p-6">
          <div className="flex items-center gap-3">
            <School className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold text-primary">{classDetails.name}</CardTitle>
              <CardDescription className="text-primary/80">Detalles de la Clase</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Placeholder for future class-specific announcements or events */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Información Adicional</h3>
            <p className="text-sm text-muted-foreground">
              Más detalles sobre horarios, anuncios específicos de la clase y eventos aparecerán aquí.
            </p>
            {classDetails.delegateId && (
                 <p className="text-sm text-muted-foreground mt-2">
                    ID del Delegado: {classDetails.delegateId} 
                    {/* In a real app, you'd fetch and display delegate name */}
                 </p>
            )}
          </div>

          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/">Ver todos los anuncios</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Optional: Generate static paths if you know all class IDs at build time
// export async function generateStaticParams() {
//   return mockClasses.map((cls) => ({
//     classId: cls.id,
//   }));
// }

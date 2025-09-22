import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Recipe } from '@/lib/types';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="block transition-transform hover:scale-[1.02] hover:shadow-lg rounded-lg">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-primary">{recipe.pamagat}</CardTitle>
          <CardDescription>
            Ni: {recipe.ginawaNiPangalan}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
             Kategorya: <span className="font-semibold text-accent">{recipe.kategorya}</span>
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS, USER_ROLES } from '@/lib/constants';
import type { Recipe, Comment } from '@/lib/types';
import { StepByStepView } from '@/components/step-by-step-view';
import { CommentSection } from '@/components/comment-section';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Utensils, BookUser, Calendar, ChefHat } from 'lucide-react';
import { RecipeControls } from './recipe-controls';

// Helper to convert Firestore Timestamps to JSON-serializable format for the client
const serializeRecipe = (recipe: Recipe): Recipe => ({
  ...recipe,
  petsaGawa: recipe.petsaGawa, // Will be serialized by Next.js
});

const serializeComments = (comments: Comment[]): Comment[] => 
  comments.map(comment => ({
    ...comment,
    petsaGawa: comment.petsaGawa,
  }));

async function getRecipe(id: string): Promise<Recipe | null> {
  const recipeDoc = await getDoc(doc(db, COLLECTIONS.RECIPES, id));
  if (!recipeDoc.exists()) return null;
  return { id: recipeDoc.id, ...recipeDoc.data() } as Recipe;
}

async function getComments(recipeId: string): Promise<Comment[]> {
  const q = query(
    collection(db, COLLECTIONS.COMMENTS),
    where('recipeId', '==', recipeId),
    orderBy('petsaGawa', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
}

export default async function RecipePage({ params }: { params: { id: string } }) {
  const recipeData = await getRecipe(params.id);
  const commentsData = await getComments(params.id);

  if (!recipeData) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Recipe not found.</h1>
      </div>
    );
  }
  
  const recipe = serializeRecipe(recipeData);
  const comments = serializeComments(commentsData);

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="space-y-8">
        <header className="space-y-4">
          <Badge variant="secondary" className="text-base">{recipe.kategorya}</Badge>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            {recipe.pamagat}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
             <div className="flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                <span>Ni {recipe.ginawaNiPangalan}</span>
            </div>
             <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{recipe.petsaGawa.toDate().toLocaleDateString()}</span>
            </div>
          </div>
          <RecipeControls recipeId={recipe.id} creatorId={recipe.ginawaNi} />
        </header>
        
        <Separator />
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5" />
                    Mga Sangkap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-5">
                  {recipe.sangkap.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold">
                <BookUser className="h-6 w-6" />
                Mga Hakbang sa Pagluto
            </h2>
            <StepByStepView steps={recipe.hakbang} />
          </div>
        </div>

        <Separator />

        <div>
            <CommentSection recipeId={recipe.id} comments={comments} />
        </div>
      </div>
    </div>
  );
}

'use server';

import { revalidatePath } from 'next/cache';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Recipe } from './types';
import { COLLECTIONS } from './constants';
import { addNewRecipeCategory as addNewRecipeCategoryFlow } from '@/ai/flows/add-new-recipe-category';

// Recipe Actions
export async function createRecipe(recipeData: Omit<Recipe, 'id' | 'petsaGawa'>) {
  try {
    const recipesCollection = collection(db, COLLECTIONS.RECIPES);
    await addDoc(recipesCollection, {
      ...recipeData,
      petsaGawa: serverTimestamp(),
    });
    revalidatePath('/');
    revalidatePath(`/recipes/category/${recipeData.kategorya}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateRecipe(recipeId: string, recipeData: Partial<Recipe>) {
  try {
    const recipeDoc = doc(db, COLLECTIONS.RECIPES, recipeId);
    await updateDoc(recipeDoc, {
        ...recipeData,
        petsaGawa: serverTimestamp(), // update timestamp
    });
    revalidatePath('/');
    revalidatePath(`/recipes/${recipeId}`);
    revalidatePath(`/recipes/category/${recipeData.kategorya}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteRecipe(recipeId: string) {
  try {
    const batch = writeBatch(db);
    
    // Delete the recipe
    const recipeDoc = doc(db, COLLECTIONS.RECIPES, recipeId);
    batch.delete(recipeDoc);

    // Delete all comments for that recipe
    const commentsQuery = query(collection(db, COLLECTIONS.COMMENTS), where('recipeId', '==', recipeId));
    const commentsSnapshot = await getDocs(commentsQuery);
    commentsSnapshot.forEach(commentDoc => {
        batch.delete(commentDoc.ref);
    });
    
    await batch.commit();

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


// Category Actions
export async function getCategories() {
  const categoriesSnapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
  return categoriesSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
}

export async function addCategory(name: string) {
  try {
    // Check if category already exists
    const q = query(collection(db, COLLECTIONS.CATEGORIES), where("name", "==", name));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return { success: false, error: "Category already exists."};
    }

    await addDoc(collection(db, COLLECTIONS.CATEGORIES), { name });
    revalidatePath('/recipes/new'); // to refresh category list
    return { success: true, name };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateCategorySuggestion(categoryName: string) {
    try {
        const result = await addNewRecipeCategoryFlow({ categoryName });
        return { success: true, suggestion: result.newCategory };
    } catch (error: any) {
        return { success: false, error: 'Failed to generate category suggestion.' };
    }
}


// Comment Actions
export async function addComment(recipeId: string, userId: string, userPangalan: string, teksto: string) {
  try {
    await addDoc(collection(db, COLLECTIONS.COMMENTS), {
      recipeId,
      userId,
      userPangalan,
      teksto,
      petsaGawa: serverTimestamp(),
    });
    revalidatePath(`/recipes/${recipeId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

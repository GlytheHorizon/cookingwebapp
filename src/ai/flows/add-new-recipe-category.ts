'use server';

/**
 * @fileOverview Allows Mama users to add new recipe categories using generative AI.
 *
 * - addNewRecipeCategory - A function that handles the creation of a new recipe category.
 * - AddNewRecipeCategoryInput - The input type for the addNewRecipeCategory function.
 * - AddNewRecipeCategoryOutput - The return type for the addNewRecipeCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AddNewRecipeCategoryInputSchema = z.object({
  categoryName: z
    .string()
    .describe('The name of the new recipe category to add.'),
});
export type AddNewRecipeCategoryInput = z.infer<
  typeof AddNewRecipeCategoryInputSchema
>;

const AddNewRecipeCategoryOutputSchema = z.object({
  newCategory: z
    .string()
    .describe('The validated and suggested new recipe category name.'),
});
export type AddNewRecipeCategoryOutput = z.infer<
  typeof AddNewRecipeCategoryOutputSchema
>;

export async function addNewRecipeCategory(
  input: AddNewRecipeCategoryInput
): Promise<AddNewRecipeCategoryOutput> {
  return addNewRecipeCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'addNewRecipeCategoryPrompt',
  input: {schema: AddNewRecipeCategoryInputSchema},
  output: {schema: AddNewRecipeCategoryOutputSchema},
  prompt: `You are a helpful assistant that suggests a valid recipe category name based on the user's input. 

  The user wants to add a new recipe category with the following name: {{{categoryName}}}.

  Return a string that is a valid and appropriate recipe category name.
  Make sure the category is related to food or cooking.
  Respond in Tagalog.
  Make sure it is not vulgar.
  Make sure it is a general, common category name, and not too specific (e.g. instead of "Adobo sa Gata", return "Ulam").`,
});

const addNewRecipeCategoryFlow = ai.defineFlow(
  {
    name: 'addNewRecipeCategoryFlow',
    inputSchema: AddNewRecipeCategoryInputSchema,
    outputSchema: AddNewRecipeCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

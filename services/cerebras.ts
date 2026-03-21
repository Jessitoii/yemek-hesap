import { MealPlanParams, MealPlanResult } from '@/types/api';

const CEREBRAS_API_KEY = process.env.EXPO_PUBLIC_CEREBRAS_API_KEY;

/**
 * Generates a meal plan using Cerebras AI models.
 * Used as a fallback when the rule engine cannot provide a high-quality plan.
 * System prompt ensures a valid JSON response.
 */
export async function generateMealPlan(params: MealPlanParams): Promise<MealPlanResult> {
  if (!CEREBRAS_API_KEY) {
    throw new Error('Cerebras API key is missing');
  }

  try {
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama3.3-70b', 
        // Use llama3.3-70b as a reasonable default for high performance
        max_tokens: 2048,
        messages: [
          {
            role: 'system',
            content: 'You are a professional nutrition expert. Help the user create a meal plan. ' +
                     'Respond ONLY with valid JSON based on the provided schema. Do not include markdown code blocks, explanations, or any extra text. ' +
                     'The JSON should match the MealPlanResult type: { "days": [ { "day": number, "meals": [ { "type": "breakfast"|"lunch"|"dinner"|"snack", "recipeName": string, "calories": number, "ingredients": string[] } ] } ], "totalStats": { "avgCalories": number, "avgCost": number } }',
          },
          {
            role: 'user',
            content: `Create a ${params.days}-day meal plan for a daily goal of ${params.calorieGoal} kcal and ${params.budgetGoal} TL. 
                      Macro goals per day: ${params.proteinGoal}g protein, ${params.carbsGoal}g carbs, ${params.fatGoal}g fat.
                      Ensure all meal names and descriptions are in Turkish.`,
          },
        ],
      }),
    });

    if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(`Cerebras API error: ${response.status} - ${JSON.stringify(errJson)}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? '';

    // Remove any markdown formatting if present
    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      return JSON.parse(cleanContent) as MealPlanResult;
    } catch (parseError) {
      console.error('[Cerebras API] JSON Parse Error:', parseError, content);
      throw new Error('Response from Cerebras API could not be parsed as JSON');
    }
  } catch (error) {
    console.error('[Cerebras API] Error generating meal plan:', error);
    throw error; // Let the caller (e.g., store action) handle the error
  }
}

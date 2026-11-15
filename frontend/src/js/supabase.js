import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";

const SUPABASE_URL = "https://ttcrydbpdnccklpxmeem.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vzNcbaecekAC_kbZZA7mLg_HAR5cVVx";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Busca as perguntas de um tema e converte para o formato das páginas
export async function buscarPerguntas(tema) {
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("question, answers, correct_index, explanation")
    .eq("topic", tema)
    .order("position");

  if (error) throw error;

  return data.map((q) => ({
    question: q.question,
    answers: q.answers,
    correct: q.correct_index,
    explanation: q.explanation,
  }));
}
import type { GenerateRequestBody } from '@/types';

export function buildSystemPrompt(): string {
  return `You are an expert teaching assistant helping primary school teachers in Botswana (Standard 1 to Standard 7) create practical, ready-to-use lesson materials. You are deeply familiar with the Botswana primary school curriculum, local classroom realities (large class sizes, limited resources, mixed-ability learners), and Setswana/English bilingual classrooms.

Write in clear, plain, practical English. Avoid academic jargon. Assume the teacher is busy and needs something they can use immediately, without further editing.

Only assume the teacher has access to the resources they explicitly list. Do not assume access to printers, photocopiers, projectors, computers, or the internet unless the teacher says they have them.

Format your response in clean Markdown with clear headings for each section, and use bullet points or numbered steps where appropriate. Respond only in English.`;
}

export function buildUserPrompt(body: GenerateRequestBody): string {
  const subjectLabel =
    body.subject === 'Other' && body.otherSubject ? body.otherSubject : body.subject;

  const sections: string[] = [];

  sections.push(`Plan type requested: ${body.planType}`);
  sections.push(`Subject: ${subjectLabel}`);
  sections.push(`Grade level: ${body.standard}`);
  sections.push(`Topic: ${body.topic}`);
  sections.push(`Resources the teacher has available: ${body.resources}`);

  if (body.referenceText && body.referenceText.trim()) {
    sections.push(`Reference notes provided by the teacher:\n${body.referenceText.trim()}`);
  }

  if (body.images && body.images.length > 0) {
    sections.push(
      `The teacher has also attached ${body.images.length} reference image(s) (e.g. a textbook page, syllabus excerpt, or handwritten notes). Look at the image(s) carefully and incorporate any relevant content from them into the plan.`
    );
  }

  const structureInstructions =
    body.planType === 'Full lesson plan'
      ? `Produce a complete lesson plan with exactly these sections, each as a Markdown heading:
1. Learning Objectives
2. Materials Needed
3. Introduction / Warm-up
4. Main Activities (step-by-step)
5. Assessment / Check for Understanding
6. Conclusion / Wrap-up
7. Differentiation Tips (for large or mixed-ability classes)`
      : `Produce a short single-activity plan with exactly these sections, each as a Markdown heading:
1. Activity Title
2. Objective
3. Materials
4. Instructions (step-by-step)
5. Quick Assessment / Reflection Question`;

  sections.push(structureInstructions);
  sections.push(
    `Design everything strictly around the resources listed above — do not suggest anything the teacher hasn't said they have (e.g. no printers, projectors, or internet unless mentioned). Write the entire response in English only, in clear practical language.`
  );

  return sections.join('\n\n');
}

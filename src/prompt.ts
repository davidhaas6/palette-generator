
function winsorize(num: number, min: number, max: number): number {
  if (num > max) num = max;
  if (num < min) num = min;
  return num;
}


export function getHexDiscussionPrompt(
  query: string,
  numColors = 5,
  discussion = "temp",
  composition = "artistic"
) {
  let prompt = "a " + getComposition(composition) + " " + getColorCount(numColors) + " color palette for " + query
  prompt += ". First, output a comma-delimited list of hex codes. Then output a semicolon."
  prompt += "Next, " + getDiscussion(discussion) +":";
  return prompt
}


function getColorCount(numColors: number) {
  numColors = winsorize(Math.round(numColors), 1, 6);
  return numColors.toString() + '-color'
}


function getComposition(composition: string) {
  if (composition === "prof") {
    return "professionally composed";
  } else if (composition === "artistic") {
    return "artistically composed";
  }
  return "";
}


function getDiscussion(key: string) {
  if (key === 'critique') {
    return "write a brief artistic critique of this color palette and its composition";
  } else if (key === 'jerry') {
    return "do a funny yet insightful Jerry Seinfeld bit about the palette"
  } else if (key === 'temp') {
    return "write a brief artistic critique of this color palette"
  }
  return ""
}


function getSentenceCount(numSentences: number | null): string {
  if (numSentences == null) return "";
  numSentences = winsorize(Math.round(numSentences), 1, 6);
  return " in roughy " + numSentences.toString() + " sentences:"
}




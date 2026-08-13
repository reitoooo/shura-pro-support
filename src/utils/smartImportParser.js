/**
 * Smart Import Parser
 * Parses [SHURAPRO_DATA] tagged text from AI output.
 * 
 * New hierarchical structure:
 * - Canvas level: To-be, As-is, Gap (entered once)
 * - Hypothesis level: 仮説, 検証方法, 判断基準 (multiple per canvas)
 *
 * Expected format:
 * [SHURAPRO_DATA]
 * To-be: ...
 * As-is: ...
 * Gap: ...
 *
 * ## 仮説1
 * 仮説: ...
 * 検証方法: ...
 * 判断基準: ...
 *
 * ## 仮説2
 * 仮説: ...
 * 検証方法: ...
 * 判断基準: ...
 * [/SHURAPRO_DATA]
 */

// Canvas-level field mappings
const CANVAS_FIELD_MAP = {
  'to-be': 'tobe',
  'tobe': 'tobe',
  '理想像': 'tobe',
  'as-is': 'asis',
  'asis': 'asis',
  '現状': 'asis',
  'gap': 'gap',
  '課題': 'gap',
  'ギャップ': 'gap',
};

// Hypothesis-level field mappings
const HYPOTHESIS_FIELD_MAP = {
  '仮説': 'hypothesis',
  'hypothesis': 'hypothesis',
  '検証方法': 'verificationMethod',
  'verification': 'verificationMethod',
  'アクション': 'verificationMethod',
  '判断基準': 'judgmentCriteria',
  'criteria': 'judgmentCriteria',
  '基準': 'judgmentCriteria',
};

// Combined map for parsing
const ALL_FIELD_MAP = { ...CANVAS_FIELD_MAP, ...HYPOTHESIS_FIELD_MAP };

/**
 * Parse SHURAPRO_DATA tagged text into a canvas with hypotheses
 * @param {string} text - Raw text containing [SHURAPRO_DATA] tags
 * @returns {{ success: boolean, data: { tobe, asis, gap, hypotheses[] } | null, errors: string[] }}
 */
export function parseSmartImport(text) {
  const errors = [];

  if (!text || typeof text !== 'string') {
    return { success: false, data: null, errors: ['Input is empty.'] };
  }

  // Extract content between tags
  const tagPattern = /\[SHURAPRO_DATA\]([\s\S]*?)\[\/SHURAPRO_DATA\]/gi;
  const matches = [...text.matchAll(tagPattern)];

  let content = '';
  if (matches.length > 0) {
    content = matches.map(m => m[1]).join('\n');
  } else {
    // Try parsing without tags (loose format)
    content = text;
  }

  const result = parseCanvasContent(content.trim());

  if (!result) {
    return {
      success: false,
      data: null,
      errors: matches.length === 0
        ? ['[SHURAPRO_DATA] タグが見つかりません。AIの出力に [SHURAPRO_DATA]...[/SHURAPRO_DATA] タグを含めてください。']
        : ['タグ内にパース可能なデータが見つかりませんでした。'],
    };
  }

  return { success: true, data: result, errors };
}

/**
 * Parse content into a canvas structure: { tobe, asis, gap, hypotheses[] }
 */
function parseCanvasContent(content) {
  const lines = content.split('\n');
  const canvases = [];
  
  let currentCanvas = { tobe: '', asis: '', gap: '', hypotheses: [] };
  let currentHypothesis = null;
  let currentField = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Clean up markdown markers (**, -, *, #) before attempting to match Key: Value
    let cleanLine = trimmed;
    cleanLine = cleanLine.replace(/^[-*•]\s*/, ''); // Remove list bullets
    cleanLine = cleanLine.replace(/^\*\*?/, '').replace(/\*\*?$/, ''); // Remove bold/italic wrapping the whole line

    // Ignore standalone hypothesis headers like "## 仮説 1" or "**仮説2**" that have no colon
    const strippedForHeader = trimmed.replace(/[\s\#\*\-\[\]【】]/g, '');
    if (/^仮説\d*$/.test(strippedForHeader) && !trimmed.includes(':') && !trimmed.includes('：')) {
      continue;
    }

    const fieldMatch = cleanLine.match(/^([^:：]+)[：:]\s*(.*)/);

    if (fieldMatch) {
      // Remove any trailing bold markers from the key itself, and numbers
      const rawKey = fieldMatch[1].trim().toLowerCase().replace(/^\d+\.?\s*/, '').replace(/[\*\#【】\[\]]/g, '');
      const value = fieldMatch[2].trim().replace(/\*\*?$/, '');
      
      const canvasKey = CANVAS_FIELD_MAP[rawKey];
      const hypKey = HYPOTHESIS_FIELD_MAP[rawKey];

      if (canvasKey) {
        // Start a new canvas if the current one already has this key OR already has hypotheses
        if (currentCanvas[canvasKey] || currentCanvas.hypotheses.length > 0) {
          if (currentHypothesis) {
            currentCanvas.hypotheses.push(currentHypothesis);
            currentHypothesis = null;
          }
          if (currentCanvas.tobe || currentCanvas.asis || currentCanvas.gap || currentCanvas.hypotheses.length > 0) {
            canvases.push(currentCanvas);
          }
          currentCanvas = { tobe: '', asis: '', gap: '', hypotheses: [] };
        }

        currentCanvas[canvasKey] = value;
        currentField = { type: 'canvas', key: canvasKey };
        continue;
      }

      if (hypKey) {
        // If we hit a hypothesis key and we either don't have a current hypothesis,
        // OR we hit the 'hypothesis' key (仮説) again while the current hypothesis already has one, start a new one!
        if (!currentHypothesis || (hypKey === 'hypothesis' && currentHypothesis.hypothesis)) {
          if (currentHypothesis) {
            currentCanvas.hypotheses.push(currentHypothesis);
          }
          currentHypothesis = { hypothesis: '', verificationMethod: '', judgmentCriteria: '', status: 'unverified' };
        }
        currentHypothesis[hypKey] = value;
        currentField = { type: 'hypothesis', key: hypKey };
        continue;
      }
    }

    // Continuation line (multi-line value)
    if (currentField) {
      if (currentField.type === 'canvas') {
        currentCanvas[currentField.key] += '\n' + trimmed;
      } else if (currentField.type === 'hypothesis' && currentHypothesis) {
        currentHypothesis[currentField.key] += '\n' + trimmed;
      }
    }
  }

  // Push the last hypothesis if it exists
  if (currentHypothesis && (currentHypothesis.hypothesis || currentHypothesis.verificationMethod || currentHypothesis.judgmentCriteria)) {
    currentCanvas.hypotheses.push(currentHypothesis);
  }

  // Push the last canvas if it exists
  if (currentCanvas.tobe || currentCanvas.asis || currentCanvas.gap || currentCanvas.hypotheses.length > 0) {
    canvases.push(currentCanvas);
  }

  if (canvases.length === 0) {
    return null;
  }

  return canvases;
}

/**
 * Generate a prompt template that users can give to AI
 * Updated to reflect Canvas → Hypothesis hierarchy
 */
export function getAIPromptTemplate() {
  return `以下の情報を元に、修羅キャンバスを作成してください。

# 前提
- あなたは私のプロのメンター（壁打ち相手）として振る舞ってください。
- これは自己実現や目標達成のためのプランニングです。
- 現状(As-is)と理想像(To-be)のギャップを埋めるための仮説を立てます。

# あなたへの指示
- 理想像(To-be)と現状(As-is)をプロの視点で鋭く言語化してください。
- 理想と現実のギャップ(Gap)が複数ある場合は、ギャップごとにブロックを分けて出力してください。
- それぞれのギャップに対して、それを埋めるための具体的で実行可能な仮説を1〜2つ提案してください。
- また、私の現状や課題についてさらに深掘りした方が良い点があれば、出力のあとに「壁打ちのための質問」をいくつか提示してください。
- 出力は必ず以下のフォーマットに従い、ギャップの数だけ [テーマブロック] を繰り返して [SHURAPRO_DATA] タグで囲んでください。

[SHURAPRO_DATA]
To-be: （理想像）
As-is: （現状）
Gap: （ギャップ・課題 その1）

## 仮説1
仮説: （仮説の内容）
検証方法: （具体的なアクション）
判断基準: （定量的・客観的な基準）

To-be: （理想像）
As-is: （現状）
Gap: （ギャップ・課題 その2）

## 仮説2
仮説: （...）
...
[/SHURAPRO_DATA]
`;
}

/**
 * Parses [SHURA_MILESTONES] tagged text from AI output.
 * @param {string} text - Raw text containing [SHURA_MILESTONES] tags
 * @returns {{ success: boolean, data: string[] | null, errors: string[] }}
 */
export function parseMilestoneSmartImport(text) {
  const errors = [];

  if (!text || typeof text !== 'string') {
    return { success: false, data: null, errors: ['Input is empty.'] };
  }

  // Extract content between tags
  const tagPattern = /\[SHURA_MILESTONES\]([\s\S]*?)\[\/SHURA_MILESTONES\]/gi;
  const matches = [...text.matchAll(tagPattern)];

  let content = '';
  if (matches.length > 0) {
    content = matches.map(m => m[1]).join('\n');
  } else {
    // Try parsing without tags (loose format)
    content = text;
  }

  // Extract lines that look like list items or just non-empty lines
  const lines = content.split('\n')
    .map(line => line.trim().replace(/^[-*•\d.\]\s]+/, '')) // Remove bullets/numbers
    .filter(line => line.length > 0 && !line.match(/^(マイルストーン|ロードマップ|目標)$/i));

  if (lines.length === 0) {
    return {
      success: false,
      data: null,
      errors: matches.length === 0
        ? ['[SHURA_MILESTONES] タグが見つかりません。AIの出力に [SHURA_MILESTONES]...[/SHURA_MILESTONES] タグを含めてください。']
        : ['タグ内にマイルストーンが見つかりませんでした。'],
    };
  }

  return { success: true, data: lines, errors };
}

/**
 * Generate a prompt template for the AI (Milestones)
 * @param {Array} canvases - The current canvases state to provide context to the AI
 */
export function getMilestoneAIPromptTemplate(canvases = []) {
  let contextText = '';
  
  if (canvases && canvases.length > 0) {
    contextText = canvases.map((c, i) => {
      let text = `【テーマ${i + 1}】\n`;
      text += `To-be (理想像): ${c.tobe || '未入力'}\n`;
      text += `As-is (現状): ${c.asis || '未入力'}\n`;
      text += `Gap (課題): ${c.gap || '未入力'}\n\n`;
      
      if (c.hypotheses && c.hypotheses.length > 0) {
        c.hypotheses.forEach((h, j) => {
          text += `  [仮説${j + 1}]\n`;
          text += `  仮説: ${h.hypothesis || '未入力'}\n`;
          text += `  検証方法: ${h.verificationMethod || '未入力'}\n`;
          text += `  判断基準: ${h.judgmentCriteria || '未入力'}\n\n`;
        });
      }
      return text;
    }).join('\n');
  } else {
    contextText = `【テーマ】
To-be (理想像): （ここに理想像を入力）
As-is (現状): （ここに現状を入力）
Gap (課題): （ここにギャップ・課題を入力）

  [仮説1]
  仮説: （ここに仮説を入力）
  検証方法: （ここに具体的なアクションを入力）
  判断基準: （ここに定量的・客観的な基準を入力）
`;
  }

  return `あなたはプロのメンター（壁打ち相手）です。
以下の私の現在地と目標（To-be/As-is/Gap）および検証中の仮説を踏まえて、目標達成に向けたロードマップ（マイルストーン）を3〜5件程度リストアップしてください。
マイルストーンは時系列順に、具体的で実行可能なステップに分割してください。
また、提示したマイルストーンに関して、私がさらに思考を深められるような「壁打ちのための質問」を出力のあとにいくつか提示してください。

# 私の現在地と目標・仮説
${contextText}

出力は必ず以下のタグで囲み、各マイルストーンを箇条書きで出力してください。

[SHURA_MILESTONES]
- マイルストーン1
- マイルストーン2
- マイルストーン3
[/SHURA_MILESTONES]
`;
}

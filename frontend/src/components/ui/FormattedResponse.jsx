const FormattedResponse = ({ text }) => {
  if (!text) return null;

  const formatText = (inputText) => {
    const lines = inputText.split('\n');
    const elements = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Skip empty lines but add spacing
      if (line.trim() === '') {
        elements.push(<div key={`space-${key++}`} className="h-2" />);
        continue;
      }

      // Check for bold headings: **Text** or **Text:**
      const boldHeadingMatch = line.match(/^\*\*(.+?)\*\*:?$/);
      if (boldHeadingMatch) {
        elements.push(
          <h3 key={`heading-${key++}`} className="text-lg font-bold text-white mt-4 mb-2">
            {boldHeadingMatch[1]}
          </h3>
        );
        continue;
      }

      // Check for numbered lists: 1. Text or 1) Text
      const numberedMatch = line.match(/^(\d+)[\.)]\s+(.+)$/);
      if (numberedMatch) {
        const content = parseInlineFormatting(numberedMatch[2]);
        elements.push(
          <div key={`num-${key++}`} className="flex gap-2 ml-4 mb-2">
            <span className="text-blue-400 font-semibold flex-shrink-0">{numberedMatch[1]}.</span>
            <span className="flex-1">{content}</span>
          </div>
        );
        continue;
      }

      // Check for bullet points: * Text or - Text or • Text
      const bulletMatch = line.match(/^[\*\-•]\s+(.+)$/);
      if (bulletMatch) {
        const content = parseInlineFormatting(bulletMatch[1]);
        elements.push(
          <div key={`bullet-${key++}`} className="flex gap-2 ml-4 mb-2">
            <span className="text-blue-400 flex-shrink-0">•</span>
            <span className="flex-1">{content}</span>
          </div>
        );
        continue;
      }

      // Regular paragraph with inline formatting
      const formattedLine = parseInlineFormatting(line);
      elements.push(
        <p key={`para-${key++}`} className="mb-2 leading-relaxed">
          {formattedLine}
        </p>
      );
    }

    return elements;
  };

  const parseInlineFormatting = (text) => {
    const parts = [];
    let remaining = text;
    let partKey = 0;

    while (remaining.length > 0) {
      // Match bold text: **text**
      const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
      if (boldMatch) {
        parts.push(
          <strong key={`bold-${partKey++}`} className="font-bold text-white">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Match italic text: *text* (single asterisk)
      const italicMatch = remaining.match(/^\*([^*]+?)\*/);
      if (italicMatch) {
        parts.push(
          <em key={`italic-${partKey++}`} className="italic text-gray-300">
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Match code: `code`
      const codeMatch = remaining.match(/^`([^`]+?)`/);
      if (codeMatch) {
        parts.push(
          <code key={`code-${partKey++}`} className="bg-gray-800 text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono">
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // No special formatting, add regular text until next special character
      const nextSpecial = remaining.search(/[\*`]/);
      if (nextSpecial === -1) {
        parts.push(<span key={`text-${partKey++}`}>{remaining}</span>);
        break;
      } else if (nextSpecial > 0) {
        parts.push(<span key={`text-${partKey++}`}>{remaining.slice(0, nextSpecial)}</span>);
        remaining = remaining.slice(nextSpecial);
      } else {
        // Special character at start but didn't match pattern, add it as text
        parts.push(<span key={`text-${partKey++}`}>{remaining[0]}</span>);
        remaining = remaining.slice(1);
      }
    }

    return parts;
  };

  return <div className="formatted-response">{formatText(text)}</div>;
};

export default FormattedResponse;
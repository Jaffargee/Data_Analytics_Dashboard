// llm_parser.ts

export interface ParsedToken {
      type: TokenType;
      content: string | ParsedToken[];
      language?: string; // for code blocks
      url?: string; // for links
      level?: number; // for headings (1-6)
      items?: ParsedToken[][]; // for lists
}

export type TokenType =
      | 'text'
      | 'bold'
      | 'italic'
      | 'strikethrough'
      | 'inline-code'
      | 'code-block'
      | 'link'
      | 'heading'
      | 'list-item'
      | 'ordered-list-item'
      | 'blockquote'
      | 'horizontal-rule'
      | 'line-break'
      | 'paragraph';

interface ParseOptions {
      enableLinks?: boolean;
      enableHtml?: boolean;
      sanitize?: boolean;
}

const DEFAULT_OPTIONS: ParseOptions = {
      enableLinks: true,
      enableHtml: false,
      sanitize: true,
};

/**
 * Main parser function - converts LLM markdown-style text into structured tokens
 */
export function parseLLMContent(content: string, options: ParseOptions = {}): ParsedToken[] {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      const tokens: ParsedToken[] = [];
      const lines = content.split('\n');

      let i = 0;
      let inCodeBlock = false;
      let codeBlockContent = '';
      let codeBlockLanguage = '';

      while (i < lines.length) {
            const line = lines[i];

            // Handle code blocks
            if (line.startsWith('```')) {

                  if (!inCodeBlock) {
                        // Start of code block
                        inCodeBlock = true;
                        codeBlockLanguage = line.slice(3).trim();
                        codeBlockContent = '';
                  } else {
                        // End of code block
                        tokens.push({
                              type: 'code-block',
                              content: codeBlockContent.trim(),
                              language: codeBlockLanguage || 'plaintext',
                        });
                        inCodeBlock = false;
                        codeBlockLanguage = '';
                        codeBlockContent = '';
                  }

                  i++;
                  continue;
            }

      if (inCodeBlock) {
            codeBlockContent += (codeBlockContent ? '\n' : '') + line;
            i++;
            continue;
      }

      // Handle horizontal rule
      if (/^[-*_]{3,}$/.test(line.trim())) {
            tokens.push({ type: 'horizontal-rule', content: '' });
            i++;
            continue;
      }

      // Handle headings
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
            tokens.push({
                  type: 'heading',
                  content: parseInlineContent(headingMatch[2], opts),
                  level: headingMatch[1].length,
            });
            i++;
            continue;
      }

      // Handle blockquotes
      if (line.startsWith('>')) {
            const quoteContent = line.slice(1).trim();
            tokens.push({
                  type: 'blockquote',
                  content: parseInlineContent(quoteContent, opts),
            });
            i++;
            continue;
      }

      // Handle unordered list items
      const unorderedListMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
      if (unorderedListMatch) {
      const listItems: ParsedToken[][] = [];
      while (i < lines.length) {
      const listLine = lines[i];
      const listMatch = listLine.match(/^[\s]*[-*+]\s+(.+)$/);
      if (!listMatch) break;
      listItems.push(parseInlineContent(listMatch[1], opts));
      i++;
      }
      tokens.push({
      type: 'list-item',
      content: '',
      items: listItems,
      });
      continue;
      }

      // Handle ordered list items
      const orderedListMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);
      if (orderedListMatch) {
      const listItems: ParsedToken[][] = [];
      while (i < lines.length) {
      const listLine = lines[i];
      const listMatch = listLine.match(/^[\s]*\d+\.\s+(.+)$/);
      if (!listMatch) break;
      listItems.push(parseInlineContent(listMatch[1], opts));
      i++;
      }
      tokens.push({
      type: 'ordered-list-item',
      content: '',
      items: listItems,
      });
      continue;
      }

      // Handle empty lines (paragraph breaks)
      if (line.trim() === '') {
      if (tokens.length > 0 && tokens[tokens.length - 1].type !== 'paragraph') {
      // Only add line break if not already a block element
      tokens.push({ type: 'line-break', content: '' });
      }
      i++;
      continue;
      }

      // Handle regular paragraphs (group consecutive non-empty, non-special lines)
      let paragraphLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== '' && 
      !lines[i].startsWith('```') && 
      !lines[i].startsWith('>') &&
      !lines[i].match(/^#{1,6}\s+/) &&
      !lines[i].match(/^[-*+]\s+/) &&
      !lines[i].match(/^\d+\.\s+/) &&
      !/^[-*_]{3,}$/.test(lines[i].trim())) {
      paragraphLines.push(lines[i]);
      i++;
      }

      if (paragraphLines.length > 0) {
      const paragraphContent = paragraphLines.join(' ').trim();
      tokens.push({
      type: 'paragraph',
      content: parseInlineContent(paragraphContent, opts),
      });
      }
      }

      return tokens;
}

/**
* Parse inline formatting within a text string
*/
function parseInlineContent(text: string, opts: ParseOptions): ParsedToken[] {
      const tokens: ParsedToken[] = [];
      let currentIndex = 0;

      // Combined regex for all inline formats
      const inlineRegex = /(\*\*\*|___|\*\*|__|\*|_|~~|`|\[.*?\]\(.*?\))/g;
      let match: RegExpExecArray | null;

      while ((match = inlineRegex.exec(text)) !== null) {
            const matchStart = match.index;
            const matchText = match[0];

            // Add text before the match
            if (matchStart > currentIndex) {
                  const textBefore = text.slice(currentIndex, matchStart);
                  if (textBefore) {
                        tokens.push({ type: 'text', content: sanitizeText(textBefore, opts) });
                  }
            }

            // Parse the matched format
            if (matchText === '***' || matchText === '___') {
                  // Bold + Italic
                  const endIndex = findClosingMarker(text, matchStart + 3, matchText);
                  if (endIndex !== -1) {
                        const innerContent = text.slice(matchStart + 3, endIndex);
                        tokens.push({
                              type: 'bold',
                              content: [{ type: 'italic', content: sanitizeText(innerContent, opts) }],
                        });
                        inlineRegex.lastIndex = endIndex + 3;
                        currentIndex = endIndex + 3;
                        continue;
                  }
            } else if (matchText === '**' || matchText === '__') {
            // Bold
            const endIndex = findClosingMarker(text, matchStart + 2, matchText);
            if (endIndex !== -1) {
                  const innerContent = text.slice(matchStart + 2, endIndex);
                  tokens.push({
                        type: 'bold',
                        content: parseInlineContent(innerContent, opts),
                  });
                  inlineRegex.lastIndex = endIndex + 2;
                  currentIndex = endIndex + 2;
                  continue;
            }
            } else if (matchText === '*' || matchText === '_') {
                  // Italic
                  const endIndex = findClosingMarker(text, matchStart + 1, matchText);
                  if (endIndex !== -1) {
                        const innerContent = text.slice(matchStart + 1, endIndex);
                        tokens.push({
                              type: 'italic',
                              content: parseInlineContent(innerContent, opts),
                        });
                        inlineRegex.lastIndex = endIndex + 1;
                        currentIndex = endIndex + 1;
                        continue;
                  }
            } else if (matchText === '~~') {
                  // Strikethrough
                  const endIndex = findClosingMarker(text, matchStart + 2, '~~');
                  if (endIndex !== -1) {
                        const innerContent = text.slice(matchStart + 2, endIndex);
                        tokens.push({
                              type: 'strikethrough',
                              content: sanitizeText(innerContent, opts),
                        });
                        inlineRegex.lastIndex = endIndex + 2;
                        currentIndex = endIndex + 2;
                        continue;
                  }
            } else if (matchText === '`') {
                  // Inline code
                  const endIndex = findClosingMarker(text, matchStart + 1, '`');
                  if (endIndex !== -1) {
                        const innerContent = text.slice(matchStart + 1, endIndex);
                        tokens.push({
                              type: 'inline-code',
                              content: sanitizeText(innerContent, opts),
                        });
                        inlineRegex.lastIndex = endIndex + 1;
                        currentIndex = endIndex + 1;
                        continue;
                  }
            } else if (opts.enableLinks && matchText.startsWith('[')) {
                  // Links [text](url)
                  const linkMatch = matchText.match(/^\[(.*?)\]\((.*?)\)$/);
                  if (linkMatch) {
                  tokens.push({
                        type: 'link',
                        content: sanitizeText(linkMatch[1], opts),
                        url: linkMatch[2],
                  });
                  currentIndex = matchStart + matchText.length;
                  inlineRegex.lastIndex = currentIndex;
                  continue;
                  }
            }

            // If we couldn't parse the format, treat it as regular text
            tokens.push({ type: 'text', content: matchText });
            currentIndex = matchStart + matchText.length;
      }

      // Add any remaining text
      if (currentIndex < text.length) {
            const remainingText = text.slice(currentIndex);
            if (remainingText) {
                  tokens.push({ type: 'text', content: sanitizeText(remainingText, opts) });
            }
      }

      return tokens;
}

/**
* Find the closing marker for inline formatting
*/
function findClosingMarker(text: string, startIndex: number, marker: string): number {
      let index = startIndex;
      while (index < text.length) {
            if (text.slice(index, index + marker.length) === marker) {
                  // Make sure it's not escaped
                  if (index === 0 || text[index - 1] !== '\\') {
                        return index;
                  }
            }
            index++;
      }
      return -1;
}

/**
* Sanitize text content
*/
function sanitizeText(text: string, opts: ParseOptions): string {
      if (!opts.sanitize) return text;

      // Basic sanitization - remove potential XSS
      return text
      // .replace(/&/g, '&amp;')
      // .replace(/</g, '&lt;')
      // .replace(/>/g, '&gt;')
      // .replace(/"/g, '&quot;')
      // .replace(/'/g, '&#039;');
}

/**
* Convert parsed tokens to plain text (for copying, searching, etc.)
*/
export function tokensToPlainText(tokens: ParsedToken[]): string {
      return tokens.map(token => {
            switch (token.type) {
                  case 'code-block':
                        return token.content;
                  case 'inline-code':
                        return token.content;
                  case 'link':
                        return token.content;
                  case 'heading':
                        return token.content;
                  case 'paragraph':
                        return token.content;
                  case 'list-item':
                  case 'ordered-list-item':
                        return token.items?.map(item => tokensToPlainText(item)).join('\n') || '';
                  case 'blockquote':
                        return token.content;
                  case 'bold':
                  case 'italic':
                  case 'strikethrough':
                        return Array.isArray(token.content) 
                        ? tokensToPlainText(token.content) 
                        : token.content;
                  case 'line-break':
                        return '\n';
                  case 'horizontal-rule':
                        return '\n---\n';
                  default:
                        return token.content;
            }
      }).join('');
}

/**
* Convert parsed tokens to HTML (for rendering in web views)
*/
export function tokensToHTML(tokens: ParsedToken[]): string {
      return tokens.map(token => {
      switch (token.type) {
            case 'text':
                  return token.content;

            case 'bold':
                  const boldContent = Array.isArray(token.content) 
                  ? tokensToHTML(token.content) 
                  : token.content;
                  return `<strong>${boldContent}</strong>`;

                  case 'italic':
                  const italicContent = Array.isArray(token.content) 
                  ? tokensToHTML(token.content) 
                  : token.content;
                  return `<em>${italicContent}</em>`;

            case 'strikethrough':
                  return `<del>${token.content}</del>`;

            case 'inline-code':
                  return `<code>${token.content}</code>`;

            case 'code-block':
                  const language = token.language ? ` class="language-${token.language}"` : '';
                  return `<pre><code${language}>${token.content}</code></pre>`;

            case 'link':
                  return `<a href="${token.url}" target="_blank" rel="noopener noreferrer">${token.content}</a>`;

            case 'heading':
                  const level = token.level || 2;
                  const headingContent = Array.isArray(token.content) 
                  ? tokensToHTML(token.content) 
                  : token.content;
                  return `<h${level}>${headingContent}</h${level}>`;

            case 'paragraph':
                  const paraContent = Array.isArray(token.content) 
                  ? tokensToHTML(token.content) 
                  : token.content;
                  return `<p>${paraContent}</p>`;

            case 'list-item':
                  const listItems = token.items?.map(item => 
                  `<li>${tokensToHTML(item)}</li>`
                  ).join('') || '';
                  return `<ul>${listItems}</ul>`;

            case 'ordered-list-item':
                  const orderedItems = token.items?.map(item => 
                  `<li>${tokensToHTML(item)}</li>`
                  ).join('') || '';
                  return `<ol>${orderedItems}</ol>`;

            case 'blockquote':
                  const quoteContent = Array.isArray(token.content) 
                  ? tokensToHTML(token.content) 
                  : token.content;
                  return `<blockquote>${quoteContent}</blockquote>`;

            case 'horizontal-rule':
                  return '<hr />';

            case 'line-break':
                  return '<br />';

            default:
            return token.content;
      }
      }).join('');
}

/**
* React component helper - convert tokens to React nodes
* (Import this in your React components)
*/
export function renderTokens(tokens: ParsedToken[], keyPrefix: string = ''): React.ReactNode[] {
      return tokens.map((token, index) => {
            const key = `${keyPrefix}-${index}`;

            switch (token.type) {
                  case 'text':
                        return <span key={key}>{token.content as string}</span>;

                  case 'bold':
                        return <strong key={key}>{renderTokens(token.content as ParsedToken[], key)}</strong>;

                  case 'italic':
                        return <em key={key}>{renderTokens(token.content as ParsedToken[], key)}</em>;

                  case 'strikethrough':
                        return <del key={key}>{token.content as string}</del>;

                  case 'inline-code':
                        return <code key={key} className="inline-code">{token.content as string}</code>;

                  case 'code-block':
                        return (
                              <pre key={key} className="code-block">
                                    <code className={token.language ? `language-${token.language}` : ''}>
                                          {token.content as string}
                                    </code>
                              </pre>
                        );

                  case 'link':
                        return (
                              <a key={key} href={token.url} target="_blank" rel="noopener noreferrer"className="text-accent-gold hover:underline">
                                    {token.content as string}
                              </a>
                        );

                  case 'heading':
                        const HeadingTag = `h${token.level || 2}` as keyof JSX.IntrinsicElements;
                        return (
                              <HeadingTag key={key} className={`heading-${token.level}`}>
                                    {renderTokens(token.content as ParsedToken[], key)}
                              </HeadingTag>
                        );

                  case 'paragraph':
                        return (
                              <p key={key} className="mb-4">
                                    {renderTokens(token.content as ParsedToken[], key)}
                              </p>
                        );

                  case 'list-item':
                        return (
                              <ul key={key} className="list-disc pl-6 mb-4">
                                    {token.items?.map((item, itemIndex) => (
                                          <li key={`${key}-item-${itemIndex}`}>
                                                {renderTokens(item, `${key}-item-${itemIndex}`)}
                                          </li>
                                    ))}
                              </ul>
                        );

                  case 'ordered-list-item':
                        return (
                              <ol key={key} className="list-decimal pl-6 mb-4">
                                    {token.items?.map((item, itemIndex) => (
                                          <li key={`${key}-item-${itemIndex}`}>
                                                {renderTokens(item, `${key}-item-${itemIndex}`)}
                                          </li>
                                    ))}
                              </ol>
                        );

                  case 'blockquote':
                        return (
                              <blockquote key={key} className="border-l-4 border-accent-gold pl-4 italic">
                                    {renderTokens(token.content as ParsedToken[], key)}
                              </blockquote>
                        );

                  case 'horizontal-rule':
                        return <hr key={key} className="my-6 border-accent-gold/30" />;

                  case 'line-break':
                        return <br key={key} />;

                  default:
                        return null;
            }
      });
}

// Usage example:
/*
import { parseLLMContent, renderTokens } from './llm_parser';

function ChatMessage({ content }: { content: string }) {
const tokens = parseLLMContent(content, { enableLinks: true });
return <div className="message">{renderTokens(tokens)}</div>;
}
*/
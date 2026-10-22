/**
 * Split an element's text into words / characters wrapped in spans, keeping
 * nested markup (links, <em>, <br>) intact. Returns the animated units and a
 * function that restores the original markup.
 */
export function splitText(element, by = 'words') {
  const original = element.innerHTML;
  const units = [];
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) replaceText(child);
      else if (child.nodeType === 1 && !child.matches('br, svg, img')) walk(child);
    }
  };

  const replaceText = (textNode) => {
    const fragment = document.createDocumentFragment();
    for (const part of textNode.textContent.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        fragment.append(document.createTextNode(part));
        continue;
      }
      const word = document.createElement('span');
      word.className = 'us-word';
      if (by === 'chars') {
        for (const char of Array.from(part)) {
          const span = document.createElement('span');
          span.className = 'us-char';
          span.textContent = char;
          word.append(span);
          units.push(span);
        }
      } else {
        word.textContent = part;
        units.push(word);
      }
      fragment.append(word);
    }
    textNode.replaceWith(fragment);
  };

  walk(element);
  element.setAttribute('aria-label', element.textContent.replace(/\s+/g, ' ').trim());
  for (const unit of element.querySelectorAll('.us-word')) unit.setAttribute('aria-hidden', 'true');
  return {
    units,
    restore() {
      element.innerHTML = original;
      element.removeAttribute('aria-label');
    },
  };
}

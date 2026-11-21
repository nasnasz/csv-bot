// solve.js — a drop-in replacement for make.fun's csv-reader 1.0.0.
// run(input) returns {columns, rows, errors} exactly as csv-reader reads {text, header}.
// One left-to-right pass, charCode based, no regex, no per-field objects.

const LF = 10;
const CR = 13;
const COMMA = 44;
const QUOTE = 34;

export function run(input) {
  const text = input.text;
  const header = input.header === true;
  const n = text.length;
  let i = 0;
  if (n > 0 && text.charCodeAt(0) === 0xfeff) i = 1; // a U+FEFF at the very start is dropped

  const rows = [];
  const errors = [];
  let columns = null;
  let width = -1;
  let line = 1;
  let rowIndex = null;     // the record's index in rows, null for the header
  let first = true;
  let rowsSeen = 0;        // data records seen so far

  // take one finished record: it is the header, or a row padded or cut to the first record's width
  const take = (fields, startLine) => {
    const count = fields.length;
    if (first) {
      width = count;
      first = false;
      if (header) {
        columns = fields;
        return;
      }
      rowsSeen = 1;
      rows.push(fields);
      return;
    }
    rowsSeen++;
    if (count < width) {
      errors.push({ code: 'short_row', line: startLine, row: rowIndex, fields: count });
      for (let k = count; k < width; k++) fields.push('');
    } else if (count > width) {
      errors.push({ code: 'long_row', line: startLine, row: rowIndex, extra: fields.slice(width) });
      fields.length = width;
    }
    rows.push(fields);
  };

  while (i < n) {
    const c0 = text.charCodeAt(i);
    if (c0 === LF) { i++; line++; continue; }                                  // no characters: no record
    if (c0 === CR && i + 1 < n && text.charCodeAt(i + 1) === LF) { i += 2; line++; continue; }

    const startLine = line;
    const fields = [];
    rowIndex = first ? (header ? null : 0) : rowsSeen;

    for (;;) {
      if (i < n && text.charCodeAt(i) === QUOTE) {
        // ---- a field that opens with a quote ----
        i++;
        const at = i;
        let seg = i;
        let out = '';
        let closed = false;
        while (i < n) {
          const c = text.charCodeAt(i);
          if (c === QUOTE) {
            if (i + 1 < n && text.charCodeAt(i + 1) === QUOTE) {
              out += text.slice(seg, i + 1);           // "" inside: one quote
              i += 2; seg = i;
              continue;
            }
            out += text.slice(seg, i);                 // the closing quote
            i++;
            closed = true;
            break;
          }
          if (c === CR) {                              // CRLF or a lone CR inside quotes reads as LF
            out += text.slice(seg, i) + '\n';
            i += (i + 1 < n && text.charCodeAt(i + 1) === LF) ? 2 : 1;
            line++; seg = i;
            continue;
          }
          if (c === LF) {
            out += text.slice(seg, i) + '\n';
            i++; line++; seg = i;
            continue;
          }
          i++;
        }
        if (!closed) {
          // the quote never closes: a literal character, and the text after it is read again as unquoted
          errors.push({ code: 'unterminated_quote', line: startLine, row: rowIndex });
          i = at;
          out = '"';
          for (;;) {
            const st = i;
            while (i < n) {
              const c = text.charCodeAt(i);
              if (c === COMMA || c === LF) break;
              if (c === CR) {
                if (i + 1 < n && text.charCodeAt(i + 1) === LF) break;
                break;
              }
              i++;
            }
            out += text.slice(st, i);
            if (i < n && text.charCodeAt(i) === CR && !(i + 1 < n && text.charCodeAt(i + 1) === LF)) {
              errors.push({ code: 'stray_cr', line: startLine, row: rowIndex });
              i++;
              continue;
            }
            break;
          }
        } else {
          // what follows the closing quote, up to a comma or line break, is appended as it stands
          const js = i;
          while (i < n) {
            const c = text.charCodeAt(i);
            if (c === COMMA || c === LF || c === CR) break;
            i++;
          }
          if (i > js) {
            out += text.slice(js, i);
            errors.push({ code: 'quote_junk', line: startLine, row: rowIndex });
          }
        }
        fields.push(out);
      } else {
        // ---- an unquoted field; a quote here is a literal character ----
        let out = '';
        for (;;) {
          const st = i;
          while (i < n) {
            const c = text.charCodeAt(i);
            if (c === COMMA || c === LF) break;
            if (c === CR) {
              if (i + 1 < n && text.charCodeAt(i + 1) === LF) break;
              break;
            }
            i++;
          }
          out += text.slice(st, i);
          if (i < n && text.charCodeAt(i) === CR && !(i + 1 < n && text.charCodeAt(i + 1) === LF)) {
            errors.push({ code: 'stray_cr', line: startLine, row: rowIndex });   // a lone CR outside quotes is dropped
            i++;
            continue;
          }
          break;
        }
        fields.push(out);
      }

      if (i >= n) break;
      const c = text.charCodeAt(i);
      if (c === COMMA) { i++; continue; }
      break;                                   // LF, or CRLF: the record ends
    }

    take(fields, startLine);

    if (i < n) {
      if (text.charCodeAt(i) === LF) { i++; line++; }
      else if (text.charCodeAt(i) === CR) { i += 2; line++; }
    }
  }

  return { columns, rows, errors };
}

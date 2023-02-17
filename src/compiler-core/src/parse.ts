import { NodeTypes } from "./ast";

const enum TagType {
  START,
  END,
}

export function baseParse(content) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context));
}

function createParserContext(content: any) {
  return {
    source: content,
  };
}

function createRoot(content) {
  return {
    children: content,
  };
}

function parseChildren(context: any): any {
  const nodes: any = [];
  let node;
  const s = context.source;
  if (s.startsWith("{{")) {
    // 解析插值
    node = parseInterplation(context);
  } else if (s.startsWith("<")) {
    if (/[a-z]/i.test(s[1])) {
      node = parseElement(context);
    }
  }

  if (!node) {
    node = parseText(context);
  }

  nodes.push(node);
  return nodes;
}
function parseTextData(context, length) {
  const content = context.source.slice(0, length);

  advanceBy(context, length);
  return content;
}

function parseText(context: any): any {
  let content = parseTextData(context, context.source.length);

  return {
    type: NodeTypes.TEXT,
    content,
  };
}

function parseInterplation(context): any {
  // context  = {{message}}
  const openDelimiter = "{{";
  const closeDelimiter = "}}";

  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  );

  advanceBy(context, openDelimiter.length);

  const rawContentLength = closeIndex - openDelimiter.length;
  const rawContent = parseTextData(context, rawContentLength);
  const content = rawContent.trim();

  advanceBy(context, closeDelimiter.length);

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
    },
  };
}

function parseElement(context: any): any {
  // 获取 tag
  let element = parseTag(context, TagType.START);
  parseTag(context, TagType.END);
  return element;
}

function parseTag(context: any, type: TagType) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];
  advanceBy(context, match[0].length);
  advanceBy(context, 1);

  if (type === TagType.END) return;

  return {
    type: NodeTypes.ELEMENT,
    tag,
  };
}

function advanceBy(context: any, length: number): any {
  context.source = context.source.slice(length);
}

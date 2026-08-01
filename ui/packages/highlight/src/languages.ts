/**
 * 语言表：只描述词法层面的四件事——关键字、行注释、块注释、字符串括法。
 * 覆盖面按「AI 聊天里真会吐出来的语言」取，不求全。认不出的语言一律不着色。
 */

export interface LangSpec {
  readonly keywords: ReadonlySet<string>
  /** 行注释的起始串，可以有多种写法。 */
  readonly lineComment: readonly string[]
  /** 块注释的起止串。 */
  readonly blockComment?: readonly [string, string]
  /** 字符串的括号字符，起止同字符。 */
  readonly quotes: readonly string[]
  /** 字符串里认反斜杠转义。 */
  readonly escape: boolean
}

function words(list: string): ReadonlySet<string> {
  return new Set(list.split(' '))
}

const C_LIKE_COMMENTS = { lineComment: ['//'], blockComment: ['/*', '*/'] as const, escape: true }

const JS = {
  ...C_LIKE_COMMENTS,
  quotes: ['"', '\'', '`'],
  keywords: words(
    'as async await break case catch class const continue debugger default delete do else enum export extends '
    + 'false finally for from function get if implements import in instanceof interface let new null of package '
    + 'private protected public return satisfies set static super switch this throw true try typeof undefined '
    + 'var void while with yield abstract any asserts bigint boolean declare infer is keyof namespace never '
    + 'number object override readonly require string symbol type unknown unique',
  ),
} satisfies LangSpec

const PYTHON = {
  lineComment: ['#'],
  quotes: ['"', '\''],
  escape: true,
  keywords: words(
    'and as assert async await break class continue def del elif else except False finally for from global '
    + 'if import in is lambda None nonlocal not or pass raise return True try while with yield match case self',
  ),
} satisfies LangSpec

const JSON_SPEC = {
  lineComment: [],
  quotes: ['"'],
  escape: true,
  keywords: words('true false null'),
} satisfies LangSpec

const SHELL = {
  lineComment: ['#'],
  quotes: ['"', '\''],
  escape: true,
  keywords: words(
    'if then else elif fi for while until do done case esac function return break continue in select time '
    + 'export local readonly declare unset shift exit source alias echo cd set trap',
  ),
} satisfies LangSpec

const SQL = {
  lineComment: ['--'],
  blockComment: ['/*', '*/'] as const,
  quotes: ['\'', '"'],
  escape: false,
  keywords: words(
    'add all alter and as asc between by case cast column constraint create cross default delete desc distinct '
    + 'drop else end exists foreign from full group having if in index inner insert into is join key left like '
    + 'limit not null offset on or order outer primary references right select set table then true false union '
    + 'unique update values view when where with',
  ),
} satisfies LangSpec

const CSS = {
  lineComment: [],
  blockComment: ['/*', '*/'] as const,
  quotes: ['"', '\''],
  escape: true,
  keywords: words('important from to and not or only media supports keyframes import charset namespace layer container'),
} satisfies LangSpec

const HTML = {
  lineComment: [],
  blockComment: ['<!--', '-->'] as const,
  quotes: ['"', '\''],
  escape: false,
  keywords: new Set<string>(),
} satisfies LangSpec

const GO = {
  ...C_LIKE_COMMENTS,
  quotes: ['"', '`', '\''],
  keywords: words(
    'break case chan const continue default defer else fallthrough for func go goto if import interface map '
    + 'package range return select struct switch type var nil true false make new len cap append error string '
    + 'int int64 float64 bool byte rune',
  ),
} satisfies LangSpec

const RUST = {
  ...C_LIKE_COMMENTS,
  quotes: ['"', '\''],
  keywords: words(
    'as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod '
    + 'move mut pub ref return self Self static struct super trait true type unsafe use where while box '
    + 'i8 i16 i32 i64 u8 u16 u32 u64 usize isize f32 f64 bool char str String Vec Option Result Some None Ok Err',
  ),
} satisfies LangSpec

const JAVA = {
  ...C_LIKE_COMMENTS,
  quotes: ['"', '\''],
  keywords: words(
    'abstract assert boolean break byte case catch char class const continue default do double else enum extends '
    + 'final finally float for goto if implements import instanceof int interface long native new package private '
    + 'protected public return short static strictfp super switch synchronized this throw throws transient try '
    + 'var void volatile while true false null record sealed permits yield',
  ),
} satisfies LangSpec

const CSHARP = {
  ...C_LIKE_COMMENTS,
  quotes: ['"', '\''],
  keywords: words(
    'abstract as async await base bool break byte case catch char checked class const continue decimal default '
    + 'delegate do double else enum event explicit extern false finally fixed float for foreach goto if implicit '
    + 'in int interface internal is lock long namespace new null object operator out override params private '
    + 'protected public readonly ref return sbyte sealed short sizeof stackalloc static string struct switch this '
    + 'throw true try typeof uint ulong unchecked unsafe ushort using var virtual void volatile while record init',
  ),
} satisfies LangSpec

/** 语言标注 → 词法规格。键一律小写。 */
const LANGS: ReadonlyMap<string, LangSpec> = new Map<string, LangSpec>([
  ['javascript', JS],
  ['js', JS],
  ['jsx', JS],
  ['typescript', JS],
  ['ts', JS],
  ['tsx', JS],
  ['mjs', JS],
  ['cjs', JS],
  ['python', PYTHON],
  ['py', PYTHON],
  ['json', JSON_SPEC],
  ['jsonc', JSON_SPEC],
  ['bash', SHELL],
  ['sh', SHELL],
  ['shell', SHELL],
  ['zsh', SHELL],
  ['sql', SQL],
  ['css', CSS],
  ['scss', CSS],
  ['less', CSS],
  ['html', HTML],
  ['xml', HTML],
  ['vue', HTML],
  ['svg', HTML],
  ['go', GO],
  ['golang', GO],
  ['rust', RUST],
  ['rs', RUST],
  ['java', JAVA],
  ['kotlin', JAVA],
  ['kt', JAVA],
  ['csharp', CSHARP],
  ['cs', CSHARP],
  ['c#', CSHARP],
])

/** 认不认识这个语言标注。 */
export function langSpecOf(lang: string): LangSpec | null {
  return LANGS.get(lang.trim().toLowerCase()) ?? null
}

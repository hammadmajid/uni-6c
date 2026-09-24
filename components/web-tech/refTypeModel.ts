/**
 * What javac and the JVM do with `Decl p = new Obj(name); System.out.println(p.call());`
 * over the Person / Student / Faculty hierarchy from the Java basics deck (pages 18 to 38).
 * Pure so it can be checked against real javac output (see RefTypeLab).
 */

export type Decl = "Object" | "Person" | "Student";
export type Obj = "Person" | "Student" | "Faculty";
export type Call = "toString" | "getName" | "study";

export const NAMES: Record<Obj, string> = { Person: "Sana", Student: "Ali", Faculty: "Zubair" };

/** Supertypes of each class, itself included. */
const IS_A: Record<Obj, Decl[]> = {
  Person: ["Person", "Object"],
  Student: ["Student", "Person", "Object"],
  Faculty: ["Person", "Object"],
};

/** Methods the compiler can see through a reference of each declared type. */
const VISIBLE: Record<Decl, Call[]> = {
  Object: ["toString"],
  Person: ["toString", "getName"],
  Student: ["toString", "getName", "study"],
};

export interface Outcome {
  errors: string[];
  output: string | null;
  /** Which class's method body runs, when it compiles. */
  runs: string | null;
}

export function evaluate(decl: Decl, obj: Obj, call: Call, personAbstract: boolean): Outcome {
  const errors: string[] = [];
  const abstractNew = personAbstract && obj === "Person";
  if (abstractNew) errors.push("Person is abstract; cannot be instantiated");
  // An erroneous `new` has no type, so javac skips the assignment check (it still checks the call below).
  if (!abstractNew && !IS_A[obj].includes(decl)) errors.push(`incompatible types: ${obj} cannot be converted to ${decl}`);
  if (!VISIBLE[decl].includes(call)) errors.push(`cannot find symbol: method ${call}() in ${decl}`);
  if (errors.length) return { errors, output: null, runs: null };

  const name = NAMES[obj];
  if (call === "getName") return { errors, output: name, runs: "Person.getName" };
  if (call === "study") return { errors, output: `${name} is studying`, runs: "Student.study" };
  // toString: dynamic dispatch picks the object's own override, else the nearest parent's.
  if (obj === "Student") return { errors, output: `Student: ${name}`, runs: "Student.toString" };
  return { errors, output: `Person: ${name}`, runs: "Person.toString" };
}

export function javaSource(decl: Decl, obj: Obj, call: Call, personAbstract: boolean): string[] {
  return [
    "// Person.java, Student.java, Faculty.java: one public class per file",
    `${personAbstract ? "public abstract class" : "public class"} Person {`,
    "    private String name;",
    "    public Person(String name) { this.name = name; }",
    "    public String getName() { return name; }",
    '    public String toString() { return "Person: " + name; }',
    "}",
    "public class Student extends Person {",
    "    Student(String name) { super(name); }",
    '    public String toString() { return "Student: " + getName(); }',
    '    public String study() { return getName() + " is studying"; }',
    "}",
    "public class Faculty extends Person {",
    "    Faculty(String name) { super(name); }   // no toString of its own",
    "}",
    "",
    "// inside Main.main:",
    `${decl} p = new ${obj}("${NAMES[obj]}");`,
    `System.out.println(p.${call}());`,
  ];
}

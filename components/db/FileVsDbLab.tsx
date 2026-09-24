"use client";

import { useState } from "react";
import { Lab, SegmentRow, Stat, useExplorationState } from "@/components/learning/Controls";
import { Button } from "@/components/learning/ui";

type Field = "Name" | "FatherName" | "Phone" | "Address" | "Class" | "Semester" | "BookIssued" | "Fine" | "Grade";
type Editable = "Phone" | "Address" | "Name";
type App = "Registration" | "Library" | "Examination";

const APPS: App[] = ["Registration", "Library", "Examination"];

/** Which fields each department's own file keeps, after the slide "File Processing (FPS)". RegNo is in all three. */
const FILE_FIELDS: Record<App, Field[]> = {
  Registration: ["Name", "FatherName", "Phone", "Address", "Class"],
  Library: ["Name", "Phone", "Address", "BookIssued", "Fine"],
  Examination: ["Name", "FatherName", "Class", "Semester", "Grade"],
};

/** What each application shows on screen in the database approach. Same fields, one source. */
const VIEW_FIELDS: Record<App, Field[]> = FILE_FIELDS;

const START: Record<Field, string> = {
  Name: "Ali Faisal",
  FatherName: "Faisal Ahmed",
  Phone: "0300-5647899",
  Address: "G-9/2, ISB",
  Class: "BSCS-4A",
  Semester: "Fall 2026",
  BookIssued: "E&N 7th ed",
  Fine: "0",
  Grade: "A-",
};

const SUGGEST: Record<Editable, string> = {
  Phone: "0333-1234567",
  Address: "F-11/1, ISB",
  Name: "Ali Faisal Khan",
};

const LABEL: Record<Field, string> = {
  Name: "Name",
  FatherName: "Father name",
  Phone: "Phone",
  Address: "Address",
  Class: "Class",
  Semester: "Semester",
  BookIssued: "Book issued",
  Fine: "Fine",
  Grade: "Grade",
};

type Files = Record<App, Record<Field, string>>;

function freshFiles(): Files {
  return {
    Registration: { ...START },
    Library: { ...START },
    Examination: { ...START },
  };
}

/** Fields stored in more than one department file. */
const DUPLICATED: Field[] = (Object.keys(START) as Field[]).filter((f) => APPS.filter((a) => FILE_FIELDS[a].includes(f)).length > 1);
const DUP_COPIES = DUPLICATED.reduce((n, f) => n + APPS.filter((a) => FILE_FIELDS[a].includes(f)).length - 1, 0);

export function FileVsDbLab() {
  const { values: v, set, reset: resetMode } = useExplorationState({ mode: "files" as "files" | "db", field: "Phone" as Editable });
  const [files, setFiles] = useState<Files>(freshFiles);
  const [db, setDb] = useState<Record<Field, string>>({ ...START });
  // The most recent value written anywhere, per field: what the university would call "the truth".
  const [truth, setTruth] = useState<Record<Field, string>>({ ...START });
  const [draft, setDraft] = useState(SUGGEST.Phone);
  const [lastWrite, setLastWrite] = useState<{ app: App; field: Field } | null>(null);

  const field = v.field;
  const holders = APPS.filter((a) => FILE_FIELDS[a].includes(field));

  function write(app: App) {
    const value = draft.trim();
    if (!value) return;
    if (v.mode === "files") {
      setFiles((f) => ({ ...f, [app]: { ...f[app], [field]: value } }));
    } else {
      setDb((d) => ({ ...d, [field]: value }));
    }
    setTruth((t) => ({ ...t, [field]: value }));
    setLastWrite({ app, field });
  }

  function reset() {
    resetMode();
    setFiles(freshFiles());
    setDb({ ...START });
    setTruth({ ...START });
    setDraft(SUGGEST.Phone);
    setLastWrite(null);
  }

  const staleCells = APPS.flatMap((a) => FILE_FIELDS[a].filter((f) => files[a][f] !== truth[f]).map((f) => `${a}.${f}`));
  const agreeing = holders.filter((a) => files[a][field] === truth[field]).length;

  return (
    <Lab
      title="One student, three files, one phone number"
      subtitle="Change a field through one department's application and see who else finds out."
      onReset={reset}
      controls={
        <>
          <SegmentRow
            label="Approach"
            value={v.mode}
            options={[
              { value: "files", label: "File processing" },
              { value: "db", label: "Database approach" },
            ]}
            onChange={(m) => {
              set("mode", m);
              setLastWrite(null);
            }}
          />
          <SegmentRow
            label="Field to change"
            value={field}
            options={[
              { value: "Phone", label: "Phone" },
              { value: "Address", label: "Address" },
              { value: "Name", label: "Name" },
            ]}
            onChange={(f) => {
              set("field", f);
              setDraft(SUGGEST[f]);
            }}
          />
          <div className="space-y-1">
            <label htmlFor="fvd-draft" className="text-label-12 text-gray-800">
              New {LABEL[field].toLowerCase()}
            </label>
            <input
              id="fvd-draft"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="text-copy-14 w-full rounded-md border border-gray-500 bg-background-100 px-2.5 py-1.5 font-mono text-gray-1000 outline-none focus:border-blue-700"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {APPS.map((a) => {
              const can = v.mode === "db" ? VIEW_FIELDS[a].includes(field) : FILE_FIELDS[a].includes(field);
              return (
                <Button key={a} variant="secondary" disabled={!can} onClick={() => write(a)} className="px-2.5! py-1! text-xs">
                  Save via {a} app
                </Button>
              );
            })}
          </div>
        </>
      }
    >
      {v.mode === "files" ? (
        <>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Stat label={`Copies of ${LABEL[field]}`} value={`${holders.length}`} tone="amber" note={holders.join(", ")} />
            <Stat
              label="Copies that agree"
              value={`${agreeing} of ${holders.length}`}
              tone={agreeing === holders.length ? "green" : "red"}
              note={agreeing === holders.length ? "consistent, for now" : "inconsistent: which one is right?"}
            />
            <Stat label="Values stored twice or more" value={`${DUP_COPIES} extra`} tone="amber" note="plus RegNo in every file" />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {APPS.map((a) => (
              <div key={a} className={`rounded-md border p-3 ${lastWrite?.app === a ? "border-blue-700/60" : "border-gray-400"}`}>
                <p className="text-label-12 text-gray-1000">{a} file</p>
                <p className="text-label-12 text-gray-600">read and written only by the {a} app</p>
                <div className="mt-2 space-y-1">
                  <Row label="RegNo" value="2412037" tone="key" />
                  {FILE_FIELDS[a].map((f) => {
                    const stale = files[a][f] !== truth[f];
                    const justWritten = lastWrite?.app === a && lastWrite.field === f;
                    return <Row key={f} label={LABEL[f]} value={files[a][f]} tone={stale ? "stale" : justWritten ? "fresh" : DUPLICATED.includes(f) ? "dup" : "plain"} />;
                  })}
                </div>
              </div>
            ))}
          </div>
          <p className="text-copy-13 mt-3 text-gray-600">
            {staleCells.length > 0 ? (
              <>
                <span className="text-red-600">Red</span> cells still hold the old value. Nothing in file processing tells the other departments a change happened: each program owns its file. Save the same
                value through every app to repair it by hand, which is exactly the redundant effort the textbook complains about.
              </>
            ) : (
              <>
                <span className="text-amber-600">Amber</span> fields are stored in more than one file. Save a new {LABEL[field].toLowerCase()} through one app and watch the other copies.
              </>
            )}
          </p>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Stat label={`Copies of ${LABEL[field]}`} value="1" tone="green" note="STUDENT row, RegNo 2412037" />
            <Stat label="Copies that agree" value="1 of 1" tone="green" note="there is nothing to disagree with" />
            <Stat label="Values stored twice" value="RegNo only" tone="blue" note="as a foreign key: controlled redundancy" />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {APPS.map((a) => (
              <div key={a} className={`rounded-md border p-3 ${lastWrite?.app === a ? "border-blue-700/60" : "border-gray-400"}`}>
                <p className="text-label-12 text-gray-1000">{a} app</p>
                <p className="text-label-12 text-gray-600">its view of the shared database</p>
                <div className="mt-2 space-y-1">
                  {VIEW_FIELDS[a].map((f) => (
                    <Row key={f} label={LABEL[f]} value={db[f]} tone={lastWrite?.field === f ? "fresh" : "plain"} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="my-3 flex items-center justify-center gap-2">
            <span className="h-px flex-1 bg-gray-400" />
            <span className="text-label-12-mono rounded-md border border-blue-700/60 bg-blue-700/10 px-3 py-1 text-blue-600">DBMS · every read and write goes through here</span>
            <span className="h-px flex-1 bg-gray-400" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Table name="STUDENT" cols={["RegNo", "Name", "FatherName", "Phone", "Address", "Class"]} vals={["2412037", db.Name, db.FatherName, db.Phone, db.Address, db.Class]} hot={lastWrite?.field} />
            <Table name="LOAN" cols={["RegNo", "BookIssued", "Fine"]} vals={["2412037", db.BookIssued, db.Fine]} hot={lastWrite?.field} fk />
            <Table name="RESULT" cols={["RegNo", "Semester", "Grade"]} vals={["2412037", db.Semester, db.Grade]} hot={lastWrite?.field} fk />
          </div>
          <p className="text-copy-13 mt-3 text-gray-600">
            Save through any app: all three views change at once, because they are three windows onto one stored row. The only value repeated is RegNo, which LOAN and RESULT keep as a
            foreign key so the rows can be joined back to STUDENT.
          </p>
        </>
      )}
    </Lab>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone: "plain" | "dup" | "stale" | "fresh" | "key" }) {
  const c = {
    plain: "text-gray-1000",
    dup: "text-amber-600",
    stale: "text-red-600 line-through decoration-red-700/60",
    fresh: "text-green-600",
    key: "text-gray-700",
  }[tone];
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-gray-300 pb-1 last:border-0">
      <span className="text-label-12 shrink-0 text-gray-600">{label}</span>
      <span className={`text-right font-mono text-[12px] ${c}`}>
        {value}
        {tone === "stale" && <span className="ml-1 text-[10px] no-underline">stale</span>}
      </span>
    </div>
  );
}

function Table({ name, cols, vals, hot, fk }: { name: string; cols: string[]; vals: string[]; hot?: Field; fk?: boolean }) {
  return (
    <div className="rounded-md border border-gray-400 p-3">
      <p className="text-label-12-mono text-gray-1000">{name}</p>
      <div className="mt-2 space-y-1">
        {cols.map((c, i) => (
          <div key={c} className="flex items-baseline justify-between gap-2 border-b border-gray-300 pb-1 last:border-0">
            <span className="text-label-12 shrink-0 text-gray-600">
              {c}
              {i === 0 && <span className={`ml-1 text-[10px] ${fk ? "text-blue-600" : "text-gray-700"}`}>{fk ? "FK" : "PK"}</span>}
            </span>
            <span className={`text-right font-mono text-[12px] ${hot === c ? "text-green-600" : "text-gray-1000"}`}>{vals[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

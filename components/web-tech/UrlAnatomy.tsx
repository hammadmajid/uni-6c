"use client";

import { Lab, Presets, useExplorationState } from "@/components/learning/Controls";

/**
 * A pretend Tomcat 11 with three deployed contexts. Each has servlet mappings (Servlet spec §12.2 order:
 * exact, then longest path prefix, then extension, then default) and a list of files on disk.
 */
interface Mapping {
  pattern: string;
  servlet: string;
}
interface Ctx {
  path: string; // "" for ROOT
  dir: string;
  mappings: Mapping[];
  files: string[];
}

const CONTEXTS: Ctx[] = [
  {
    path: "/demo",
    dir: "webapps/demo",
    mappings: [
      { pattern: "/hello-servlet", servlet: "HelloServlet" },
      { pattern: "/api/*", servlet: "ApiServlet" },
      { pattern: "*.jsp", servlet: "jsp (Jasper, from conf/web.xml)" },
      { pattern: "/", servlet: "default (static files, from conf/web.xml)" },
    ],
    files: ["/index.html", "/index.jsp", "/tomcat.gif", "/WEB-INF/web.xml", "/WEB-INF/classes/com/example/demo/HelloServlet.class"],
  },
  {
    path: "/zabdesk",
    dir: "webapps/zabdesk",
    mappings: [
      { pattern: "/course-register", servlet: "CourseRegisterServlet" },
      { pattern: "*.jsp", servlet: "jsp (Jasper, from conf/web.xml)" },
      { pattern: "/", servlet: "default (static files, from conf/web.xml)" },
    ],
    files: ["/docs/index.html", "/images/logo.png", "/images/banner.jpg", "/WEB-INF/web.xml"],
  },
  {
    path: "",
    dir: "webapps/ROOT",
    mappings: [
      { pattern: "*.jsp", servlet: "jsp (Jasper, from conf/web.xml)" },
      { pattern: "/", servlet: "default (static files, from conf/web.xml)" },
    ],
    files: ["/index.jsp", "/tomcat.svg"],
  },
];

const WELCOME = ["/index.html", "/index.htm", "/index.jsp"];

const defaults = { url: "http://localhost:8080/demo/hello-servlet?name=ali&password=123" };

const presets = [
  { label: "slide 51", values: { url: "http://localhost:8080/demo/hello-servlet?name=ali&password=123" } },
  { label: "static file", values: { url: "http://localhost:8080/demo/index.html" } },
  { label: "zabdesk servlet", values: { url: "http://localhost:8080/zabdesk/course-register" } },
  { label: "path info", values: { url: "http://localhost:8080/demo/api/users/42?fields=name" } },
  { label: "WEB-INF", values: { url: "http://localhost:8080/demo/WEB-INF/web.xml" } },
  { label: "ROOT context", values: { url: "http://localhost:8080/index.jsp" } },
  { label: "no trailing slash", values: { url: "http://localhost:8080/demo" } },
  { label: "fragment", values: { url: "http://127.0.0.1:8080/demo/index.html#top" } },
  { label: "slide 19", values: { url: "http://www.7sport.net/7sport/index.htm" } },
];

type Tone = "green" | "red" | "amber";
interface Resolution {
  contextPath: string;
  ctx: Ctx;
  servletPath: string;
  pathInfo: string | null;
  servlet: string;
  pattern: string;
  outcome: { tone: Tone; text: string };
  steps: string[];
}

function resolve(pathname: string): Resolution {
  const steps: string[] = [];
  // 1. Context: longest context path that is a whole-segment prefix.
  const ctx =
    CONTEXTS.filter((c) => c.path !== "" && (pathname === c.path || pathname.startsWith(c.path + "/"))).sort((a, b) => b.path.length - a.path.length)[0] ??
    CONTEXTS.find((c) => c.path === "")!;
  const contextPath = ctx.path;
  steps.push(
    ctx.path
      ? `Context: "${ctx.path}" is the longest deployed context path that prefixes the path, so the request goes to ${ctx.dir}.`
      : `Context: no deployed context matches the first segment, so ROOT handles it (context path is the empty string).`,
  );

  if (ctx.path && pathname === ctx.path) {
    return {
      contextPath,
      ctx,
      servletPath: "",
      pathInfo: null,
      servlet: "none yet",
      pattern: "",
      outcome: { tone: "amber", text: `302 redirect to ${ctx.path}/` },
      steps: [...steps, `The path is exactly the context path with no trailing slash. Tomcat answers 302 with Location: ${ctx.path}/ so relative links in the page resolve inside the app.`],
    };
  }

  const rest = pathname.slice(ctx.path.length) || "/";

  // 2. Servlet mapping, spec order.
  const exact = ctx.mappings.find((m) => !m.pattern.includes("*") && m.pattern !== "/" && m.pattern === rest);
  const prefix = ctx.mappings
    .filter((m) => m.pattern.endsWith("/*"))
    .filter((m) => {
      const base = m.pattern.slice(0, -2);
      return rest === base || rest.startsWith(base + "/");
    })
    .sort((a, b) => b.pattern.length - a.pattern.length)[0];
  const ext = ctx.mappings.find((m) => m.pattern.startsWith("*.") && rest.endsWith(m.pattern.slice(1)));
  const def = ctx.mappings.find((m) => m.pattern === "/")!;

  let m: Mapping;
  let servletPath = rest;
  let pathInfo: string | null = null;
  if (exact) {
    m = exact;
    steps.push(`Mapping: "${rest}" exactly matches the pattern "${exact.pattern}". Exact matches win first.`);
  } else if (prefix) {
    m = prefix;
    servletPath = prefix.pattern.slice(0, -2);
    pathInfo = rest.slice(servletPath.length) || null;
    steps.push(`Mapping: no exact match; the longest path-prefix pattern "${prefix.pattern}" matches. Servlet path is "${servletPath}", the remainder is path info.`);
  } else if (ext) {
    m = ext;
    steps.push(`Mapping: no exact or prefix match; the extension pattern "${ext.pattern}" matches.`);
  } else {
    m = def;
    steps.push(`Mapping: nothing more specific matches, so the default servlet "/" gets it and serves a file from disk.`);
  }

  // 3. Outcome.
  let outcome: Resolution["outcome"];
  const isDefault = m === def;
  const isJsp = m.pattern === "*.jsp";
  if (rest.toUpperCase().startsWith("/WEB-INF") || rest.toUpperCase().startsWith("/META-INF")) {
    outcome = { tone: "red", text: "404: WEB-INF is never served to a client" };
    steps.push("The file exists, but the container refuses any direct request under WEB-INF or META-INF. Only code inside the app can read it.");
  } else if (isDefault || isJsp) {
    let file = rest;
    if (isDefault && rest.endsWith("/")) {
      const w = WELCOME.find((f) => ctx.files.includes(rest.replace(/\/$/, "") + f));
      if (w) {
        file = rest.replace(/\/$/, "") + w;
        steps.push(`The path ends in "/", so Tomcat tries the welcome files in order (index.html, index.htm, index.jsp) and finds ${file}.`);
      }
    }
    if (ctx.files.includes(file)) {
      outcome = { tone: "green", text: isJsp || file.endsWith(".jsp") ? `200: ${ctx.dir}${file} compiled to a servlet in work/ and run` : `200: ${ctx.dir}${file} sent as-is` };
    } else {
      outcome = { tone: "red", text: `404: no file ${ctx.dir}${file}` };
    }
  } else {
    outcome = { tone: "green", text: `200 (if it implements the method): ${m.servlet}.service() → doGet()` };
  }

  return { contextPath, ctx, servletPath, pathInfo, servlet: m.servlet, pattern: m.pattern, outcome, steps };
}

function safeDecode(s: string) {
  try {
    return decodeURI(s);
  } catch {
    return s;
  }
}

const toneText: Record<Tone, string> = { green: "text-green-600", red: "text-red-600", amber: "text-amber-600" };

interface Part {
  key: string;
  label: string;
  value: string;
  api: string;
  color: string;
  note: string;
}

export function UrlAnatomy() {
  const { values, set, reset, apply } = useExplorationState(defaults);
  let u: URL | null = null;
  try {
    u = new URL(values.url);
  } catch {
    u = null;
  }

  let parts: Part[] = [];
  let r: Resolution | null = null;
  let error: string | null = null;
  if (!u) error = "Not a valid absolute URL. It needs a scheme, such as http://";
  else if (u.protocol !== "http:" && u.protocol !== "https:") error = "Only http and https reach Tomcat's HTTP connector.";
  else {
    r = resolve(safeDecode(u.pathname));
    const defPort = u.protocol === "https:" ? "443" : "80";
    parts = [
      { key: "scheme", label: "scheme", value: u.protocol.replace(":", ""), api: "getScheme()", color: "#a78bfa", note: "which protocol the browser speaks" },
      { key: "host", label: "host", value: u.hostname, api: "getServerName()", color: "#ff6369", note: "resolved to an IP by DNS, the hosts file, or already an IP" },
      {
        key: "port",
        label: "port",
        value: u.port || `${defPort} (implied)`,
        api: "getServerPort()",
        color: "#ffb224",
        note: u.port ? "which listening socket on that machine" : `left out, so the default for ${u.protocol.replace(":", "")}; Tomcat listens on 8080 unless you change conf/server.xml`,
      },
      {
        key: "ctx",
        label: "context path",
        value: r.contextPath || "(empty: ROOT)",
        api: "getContextPath()",
        color: "#3291ff",
        note: "picks the webapp; the slides call this “App name”",
      },
      { key: "sp", label: "servlet path", value: r.servletPath || "(none)", api: "getServletPath()", color: "#62c073", note: `matched against the mapping ${r.pattern ? `"${r.pattern}"` : ""}` },
      { key: "pi", label: "path info", value: r.pathInfo ?? "null", api: "getPathInfo()", color: "#2dd4bf", note: "what is left after a /* prefix mapping" },
      {
        key: "q",
        label: "query",
        value: u.search ? u.search.slice(1) : "(none)",
        api: "getQueryString()",
        color: "#f472b6",
        note: u.search ? `getParameter reads it: ${[...u.searchParams.entries()].map(([k, v]) => `${k}=“${v}”`).join(", ")}` : "no ?, so every getParameter returns null",
      },
      { key: "frag", label: "fragment", value: u.hash ? u.hash.slice(1) : "(none)", api: "never sent", color: "#6b6b6b", note: "stays in the browser; the server cannot see it" },
    ];
  }

  // Build the coloured URL string.
  const segs: { text: string; color: string }[] = [];
  if (u && r) {
    const c = (k: string) => parts.find((p) => p.key === k)!.color;
    segs.push({ text: u.protocol + "//", color: c("scheme") });
    segs.push({ text: u.hostname, color: c("host") });
    if (u.port) segs.push({ text: ":" + u.port, color: c("port") });
    const path = safeDecode(u.pathname);
    if (r.contextPath) segs.push({ text: r.contextPath, color: c("ctx") });
    const rest = path.slice(r.contextPath.length);
    const spLen = r.servletPath ? Math.min(r.servletPath.length, rest.length) : 0;
    if (spLen) segs.push({ text: rest.slice(0, spLen), color: c("sp") });
    if (rest.slice(spLen)) segs.push({ text: rest.slice(spLen), color: r.pathInfo ? c("pi") : c("sp") });
    if (u.search) segs.push({ text: u.search, color: c("q") });
    if (u.hash) segs.push({ text: u.hash, color: c("frag") });
  }

  return (
    <Lab
      title="URL anatomy, as Tomcat reads it"
      subtitle="Deployed here: /demo, /zabdesk and ROOT. Type any URL or pick one."
      onReset={reset}
      controls={
        <>
          <Presets presets={presets} onPick={apply} />
          <div className="full space-y-1">
            <label htmlFor="wt-url" className="text-label-12 text-gray-800">
              URL
            </label>
            <input
              id="wt-url"
              value={values.url}
              onChange={(e) => set("url", e.target.value)}
              spellCheck={false}
              className="text-label-13-mono w-full rounded-md border border-gray-500 bg-background-100 px-3 py-2 font-mono text-[13px] text-gray-1000 outline-none focus:border-blue-700"
            />
          </div>
        </>
      }
    >
      {error || !r ? (
        <p className="text-copy-14 text-red-600">{error}</p>
      ) : (
        <>
          <p className="overflow-x-auto rounded-md border border-gray-400 bg-background-100 px-3 py-2.5 font-mono text-[13px] whitespace-nowrap">
            {segs.map((s, i) => (
              <span key={i} style={{ color: s.color }}>
                {s.text}
              </span>
            ))}
          </p>

          <div className="mt-3 grid gap-1.5">
            {parts.map((p) => (
              <div key={p.key} className="grid grid-cols-[7.5rem_1fr] gap-x-3 rounded-md px-2 py-1.5 sm:grid-cols-[7.5rem_11rem_1fr]">
                <span className="text-label-12 flex items-center gap-1.5 text-gray-800">
                  <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: p.color }} />
                  {p.label}
                </span>
                <span className="truncate font-mono text-[12px] text-gray-1000" title={p.value}>
                  {p.value}
                </span>
                <span className="text-copy-13 col-start-2 text-gray-700 sm:col-start-3">
                  <span className="font-mono text-[12px] text-gray-900">{p.api}</span> · {p.note}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-md border border-gray-400 bg-background-100 p-3">
            <p className="text-label-12 mb-2 text-gray-700">How Tomcat resolves it</p>
            <ol className="text-copy-13 m-0 list-none space-y-1.5 pl-0 text-gray-900">
              <li className="mt-0">
                <span className="font-mono text-gray-600">1 · </span>Connector: the request arrives on the socket listening on port {u!.port || (u!.protocol === "https:" ? "443" : "80")}. Tomcat&apos;s
                default HTTP connector is 8080{u!.port === "8080" ? ", so this reaches it." : "; anything else needs a changed conf/server.xml or a proxy in front."}
              </li>
              {r.steps.map((s, i) => (
                <li key={i} className="mt-0">
                  <span className="font-mono text-gray-600">{i + 2} · </span>
                  {s}
                </li>
              ))}
            </ol>
            <p className={`text-label-14 mt-3 font-mono ${toneText[r.outcome.tone]}`}>→ {r.outcome.text}</p>
          </div>
        </>
      )}
    </Lab>
  );
}
